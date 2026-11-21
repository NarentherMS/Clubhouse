"""Regression coverage for the public-demo audit findings."""
import copy
import unittest
import server
import test_company_access as company_tests


class DemoSafetyTests(unittest.TestCase):
    def setUp(self):
        self.fixture = company_tests.CompanyAccessTests()
        self.fixture.setUp()

    def tearDown(self):
        self.fixture.tearDown()

    def view(self, actor):
        return server.visible_state(server.get_state(), actor)

    def test_unrelated_save_preserves_completed_followup_from_another_session(self):
        stale = self.view('avery')
        server.update_followup_status('hidden', 'own-follow', 'Done', 'avery')
        next(item for item in stale['interactions'] if item['id'] == 'completed')['summary'] = 'New discussion notes'
        server.save_state_transaction(stale, 'avery')
        stored = server.get_state()
        self.assertEqual(next(i for i in stored['interactions'] if i['id'] == 'hidden')['followups'][0]['status'], 'Done')
        self.assertEqual(next(i for i in stored['interactions'] if i['id'] == 'completed')['summary'], 'New discussion notes')

    def test_same_interaction_conflict_rejects_old_form_without_resetting_status(self):
        stale = self.view('avery')
        server.update_followup_status('hidden', 'own-follow', 'Done', 'avery')
        next(item for item in stale['interactions'] if item['id'] == 'hidden')['summary'] = 'Stale notes'
        with self.assertRaises(server.StateConflict):
            server.save_state_transaction(stale, 'avery')
        stored = next(i for i in server.get_state()['interactions'] if i['id'] == 'hidden')
        self.assertEqual(stored['summary'], 'Own history')
        self.assertEqual(stored['followups'][0]['status'], 'Done')

    def test_different_contract_edits_merge_without_restoring_old_rate(self):
        first, second = self.view('admin'), self.view('admin')
        first['contracts']['avery']['hourlyRate'] = 70
        server.save_state_transaction(first, 'admin')
        second['contracts']['taylor']['hourlyRate'] = 90
        server.save_state_transaction(second, 'admin')
        contracts = server.get_state()['contracts']
        self.assertEqual(contracts['avery']['hourlyRate'], 70)
        self.assertEqual(contracts['taylor']['hourlyRate'], 90)

    def test_same_contract_edit_conflicts(self):
        first, second = self.view('admin'), self.view('admin')
        first['contracts']['avery']['hourlyRate'] = 70
        server.save_state_transaction(first, 'admin')
        second['contracts']['avery']['hourlyRate'] = 80
        with self.assertRaises(server.StateConflict):
            server.save_state_transaction(second, 'admin')
        self.assertEqual(server.get_state()['contracts']['avery']['hourlyRate'], 70)

    def test_meeting_conflict_cannot_restore_canceled_meeting(self):
        first, second = self.view('avery'), self.view('avery')
        first['meetings'][0]['status'] = 'Canceled'
        server.save_state_transaction(first, 'avery')
        second['meetings'][0]['agenda'] = 'Older form update'
        with self.assertRaises(server.StateConflict):
            server.save_state_transaction(second, 'avery')
        self.assertEqual(server.get_state()['meetings'][0]['status'], 'Canceled')

    def test_new_interaction_preserves_newer_untouched_meeting(self):
        first, second = self.view('avery'), self.view('avery')
        first['meetings'][0]['status'] = 'Canceled'
        server.save_state_transaction(first, 'avery')
        second['interactions'].append({'id': 'new-notes', 'owner': 'avery', 'clubId': 'cowboys', 'date': '2026-11-21', 'summary': 'New call'})
        server.save_state_transaction(second, 'avery')
        self.assertEqual(server.get_state()['meetings'][0]['status'], 'Canceled')
        self.assertTrue(any(i['id'] == 'new-notes' for i in server.get_state()['interactions']))

    def test_followup_response_version_allows_subsequent_note_edit(self):
        state = self.view('avery')
        version = server.update_followup_status('hidden', 'own-follow', 'Done', 'avery')
        item = next(i for i in state['interactions'] if i['id'] == 'hidden')
        item['followups'][0]['status'] = 'Done'
        state['recordVersions']['interactions'][item['id']] = version
        item['summary'] = 'Fresh notes after completing the action'
        server.save_state_transaction(state, 'avery')
        stored = next(i for i in server.get_state()['interactions'] if i['id'] == 'hidden')
        self.assertEqual(stored['followups'][0]['status'], 'Done')
        self.assertEqual(stored['summary'], item['summary'])

    def test_legacy_clients_must_reload_before_changing_existing_records(self):
        state = self.view('avery')
        state.pop('recordVersions')
        state['interactions'][0]['summary'] = 'Unversioned update'
        with self.assertRaises(server.StateConflict):
            server.save_state_transaction(state, 'avery')

    def test_version_metadata_contains_only_visible_records_and_is_not_persisted(self):
        self.fixture.assign(['cowboys'])
        state = self.view('avery')
        self.assertEqual(set(state['recordVersions']['interactions']), {'completed'})
        self.assertEqual(set(state['recordVersions']['meetings']), {'future'})
        self.assertEqual(set(state['recordVersions']['contracts']), {'avery'})
        state['interactions'][0]['summary'] = 'Permitted notes'
        saved = server.save_state_transaction(state, 'avery')
        self.assertNotIn('recordVersions', saved)
        self.assertNotIn('recordVersions', server.get_state())
        self.assertNotEqual(state['recordVersions']['interactions']['completed'], self.view('avery')['recordVersions']['interactions']['completed'])

    def test_versions_do_not_grant_permission_to_edit_someone_elses_record(self):
        state = self.view('avery')
        peer = copy.deepcopy(next(i for i in server.get_state()['interactions'] if i['id'] == 'shared'))
        state['recordVersions']['interactions']['shared'] = server.record_version(peer)
        peer['summary'] = 'Attempt to edit a peer record'
        state['interactions'].append(peer)
        with self.assertRaisesRegex(ValueError, 'created'):
            server.save_state_transaction(state, 'avery')

    def test_only_server_provisioned_admin_can_initialize_workspace(self):
        server.ensure_accounts()
        with server.connect() as conn:
            conn.execute('DELETE FROM app_state')
        base = {'users': [{'id': 'u-avery', 'name': 'Advisor', 'role': 'Admin'}], 'clubs': [], 'interactions': [], 'meetings': [], 'contracts': {}}
        with self.assertRaisesRegex(ValueError, 'administrator'):
            server.save_state_transaction(base, 'u-avery')
        self.assertIsNone(server.get_state())
        base['users'] = [{'id': 'u-admin', 'name': 'Admin', 'role': 'Admin'}]
        server.save_state_transaction(base, 'u-admin')
        self.assertEqual(server.get_state()['activeUser'], 'u-admin')


if __name__ == '__main__':
    unittest.main()
