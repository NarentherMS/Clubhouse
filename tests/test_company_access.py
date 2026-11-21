"""Company access, ownership, stale-client and privilege regression checks."""
import copy
import unittest
import uuid
import server
import test_timesheet_contracts as timesheet_tests


class CompanyAccessTests(unittest.TestCase):
    def setUp(self):
        self.fixture = timesheet_tests.TimesheetContractTests()
        self.fixture.setUp()
        self.state = self.fixture.state
        self.state['clubs'] += [
            {'id': 'yankees', 'name': 'New York Yankees', 'league': 'MLB'},
            {'id': 'company', 'name': 'Example Company', 'league': 'Other'}]
        self.state['interactions'] += [
            {'id': 'hidden', 'owner': 'avery', 'clubId': 'yankees', 'date': '2026-11-18',
             'summary': 'Own history', 'meetingMinutes': 30,
             'followups': [{'id': 'own-follow', 'owner': 'avery', 'description': 'Own action', 'status': 'Open', 'due': '2026-11-20'}]},
            {'id': 'shared', 'owner': 'taylor', 'clubId': 'cowboys', 'date': '2026-11-18',
             'summary': 'Private Taylor discussion',
             'followups': [{'id': 'shared-follow', 'owner': 'avery', 'description': 'Shared action', 'status': 'Open', 'due': '2026-11-20'}]},
            {'id': 'shared-hidden', 'owner': 'taylor', 'clubId': 'yankees', 'date': '2026-11-18',
             'summary': 'Private hidden discussion',
             'followups': [{'id': 'hidden-follow', 'owner': 'avery', 'description': 'Hidden action', 'status': 'Open', 'due': '2026-11-20'}]}]
        self.state['meetings'].append({'id': 'hidden-meeting', 'owner': 'avery', 'clubId': 'yankees',
                                       'date': '2026-11-21', 'status': 'Planned'})
        server.put_state(self.state)

    def tearDown(self):
        self.fixture.tearDown()

    def assign(self, ids=None, mode='selected', advisor='avery', actor='admin', revision=None):
        old = server.get_state()
        if revision is None:
            revision = server.company_access_for(old, advisor)['revision']
        return server.update_company_access(actor, {'advisorId': advisor, 'mode': mode,
                                            'companyIds': ids or [], 'revision': revision})

    def view(self, actor='avery'):
        return server.visible_state(server.get_state(), actor)

    def test_existing_advisors_default_to_all_companies(self):
        for actor in ['avery', 'taylor']:
            result = self.view(actor)
            self.assertEqual(len(result['clubs']), 3)
            self.assertEqual(result['companyAccess'][actor]['mode'], 'all')
            self.assertEqual(set(result['companyAccess']), {actor})
            self.assertTrue(all(item['owner'] == actor for item in result['interactions']))
        self.assertEqual(len(self.view('admin')['companyAccess']), 2)

    def test_selected_companies_filter_records_and_assigned_actions(self):
        self.assign(['cowboys'])
        result = self.view()
        self.assertEqual([c['id'] for c in result['clubs']], ['cowboys'])
        self.assertEqual([i['id'] for i in result['interactions']], ['completed'])
        self.assertEqual([m['id'] for m in result['meetings']], ['future'])
        self.assertEqual([f['id'] for f in result['assignedFollowups']], ['shared-follow'])
        self.assertNotIn('Private Taylor discussion', str(result))
        self.assertEqual([m['id'] for m in server.recorded_meeting_time(server.get_state(), 'avery')], ['completed'])

    def test_staff_see_all_but_only_admin_can_assign(self):
        self.assign(['cowboys'])
        for actor in ['sub', 'taylor', 'avery', 'unknown']:
            with self.subTest(actor=actor), self.assertRaises(ValueError):
                self.assign(['company'], actor=actor)
        for actor in ['admin', 'sub']:
            self.assertEqual(len(self.view(actor)['clubs']), 3)
            self.assertEqual(len(self.view(actor)['interactions']), 4)

    def test_multiple_advisors_can_share_company_and_empty_selection_is_valid(self):
        self.assign(['cowboys'])
        self.assign(['cowboys'], advisor='taylor')
        self.assertEqual(self.view()['clubs'], self.view('taylor')['clubs'])
        self.assign([])
        for key in ['clubs', 'interactions', 'meetings', 'assignedFollowups']:
            self.assertEqual(self.view()[key], [])

    def test_access_changes_do_not_delete_history_and_restoring_access_restores_it(self):
        before = server.get_state()
        self.assign(['cowboys'])
        self.assign(mode='all')
        after = server.get_state()
        for key in ['clubs', 'interactions', 'meetings', 'contracts']:
            self.assertEqual(before[key], after[key])
        self.assertEqual(len(self.view()['interactions']), 2)

    def test_filtered_payload_save_preserves_hidden_records(self):
        self.assign(['cowboys'])
        payload = self.view()
        payload['interactions'][0]['summary'] = 'Updated permitted discussion'
        server.save_state_transaction(payload, 'avery')
        state = server.get_state()
        self.assertEqual(len(state['clubs']), 3)
        self.assertEqual(len(state['interactions']), 4)
        self.assertEqual(len(state['meetings']), 2)
        self.assertEqual(next(i for i in state['interactions'] if i['id'] == 'hidden')['summary'], 'Own history')

    def test_direct_interaction_and_meeting_writes_to_hidden_company_are_rejected(self):
        self.assign(['cowboys'])
        for key, item in [('interactions', self.state['interactions'][1]), ('meetings', self.state['meetings'][1])]:
            payload = self.view()
            payload['clubs'].append(self.state['clubs'][1])
            payload[key].append(copy.deepcopy(item))
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'access'):
                server.save_state_transaction(payload, 'avery')

    def test_hidden_record_cannot_be_moved_into_accessible_company(self):
        self.assign(['cowboys'])
        for key, item in [('interactions', self.state['interactions'][1]), ('meetings', self.state['meetings'][1])]:
            payload = self.view()
            forged = {**item, 'clubId': 'cowboys'}
            payload[key].append(forged)
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'access'):
                server.save_state_transaction(payload, 'avery')

    def test_stale_client_is_rejected_after_access_removed(self):
        stale = self.view()
        self.assign(['cowboys'])
        with self.assertRaisesRegex(ValueError, 'access'):
            server.save_state_transaction(stale, 'avery')
        self.assertEqual(server.company_access_for(server.get_state(), 'avery')['companyIds'], ['cowboys'])

    def test_regular_state_saves_cannot_grant_access_or_revert_admin_changes(self):
        stale_admin = self.view('admin')
        self.assign(['cowboys'])
        payload = self.view()
        payload['companyAccess'] = {'avery': {'mode': 'all', 'companyIds': [], 'revision': 99}}
        server.save_state_transaction(payload, 'avery')
        self.assertEqual(server.company_access_for(server.get_state(), 'avery')['mode'], 'selected')
        server.save_state_transaction(stale_admin, 'admin')
        self.assertEqual(server.company_access_for(server.get_state(), 'avery')['mode'], 'selected')

    def test_followup_endpoint_checks_current_company_access(self):
        self.assign(['cowboys'])
        for interaction, action in [('hidden', 'own-follow'), ('shared-hidden', 'hidden-follow')]:
            with self.subTest(interaction=interaction), self.assertRaisesRegex(ValueError, 'access'):
                server.update_followup_status(interaction, action, 'Done', 'avery')
        server.update_followup_status('shared', 'shared-follow', 'Done', 'avery')
        self.assertEqual(self.view()['assignedFollowups'][0]['status'], 'Done')

    def test_selected_advisor_cannot_create_company_but_all_advisor_can(self):
        self.assign(['cowboys'])
        payload = self.view()
        new = {'id': 'org-' + str(uuid.uuid4()), 'name': 'New Company', 'league': 'Other'}
        payload['clubs'].append(new)
        with self.assertRaisesRegex(ValueError, 'assigned'):
            server.save_state_transaction(payload, 'avery')
        payload = self.view('taylor')
        payload['clubs'].append(new)
        server.save_state_transaction(payload, 'taylor')
        self.assertNotIn(new['id'], {c['id'] for c in self.view()['clubs']})
        self.assertIn(new['id'], {c['id'] for c in self.view('taylor')['clubs']})

    def test_access_revision_and_input_validation(self):
        self.assign(['cowboys'])
        with self.assertRaisesRegex(ValueError, 'changed'):
            self.assign(['company'], revision=0)
        for data in [
            {'mode': 'invalid'}, {'companyIds': ['missing']}, {'companyIds': ['cowboys', 'cowboys']},
            {'companyIds': [{}]}, {'advisorId': 'admin'}, {'advisorId': 'nobody'}, {'revision': True}]:
            payload = {'advisorId': 'avery', 'mode': 'selected', 'companyIds': ['cowboys'], 'revision': 1, **data}
            with self.subTest(data=data), self.assertRaises(ValueError):
                server.update_company_access('admin', payload)

    def create_company(self, name='Acme Media', advisor='avery', actor='admin', revision=None):
        if revision is None:
            revision = server.company_access_for(server.get_state(), advisor)['revision']
        return server.add_company(actor, {'advisorId': advisor, 'name': name, 'revision': revision})

    def test_admin_creates_other_company_and_assigns_selected_advisor_atomically(self):
        self.assign(['cowboys'])
        self.assign(['yankees'], advisor='taylor')
        before = server.get_state()
        result = self.create_company('  Acme   Media  ')
        company = result['company']
        self.assertEqual(company['league'], 'Other')
        self.assertEqual(company['name'], 'Acme Media')
        self.assertTrue(company['id'].startswith('org-'))
        self.assertIn(company, server.get_state()['clubs'])
        access = server.company_access_for(server.get_state(), 'avery')
        self.assertEqual(access['mode'], 'selected')
        self.assertEqual(set(access['companyIds']), {'cowboys', company['id']})
        self.assertEqual(access['revision'], 2)
        self.assertIn(company, self.view()['clubs'])
        self.assertNotIn(company, self.view('taylor')['clubs'])
        self.assertIn(company, self.view('sub')['clubs'])
        for key in ['interactions', 'meetings', 'contracts', 'users']:
            self.assertEqual(before[key], server.get_state()[key])
        server.validate_state_shape(server.get_state())

    def test_adding_company_keeps_all_companies_access(self):
        company = self.create_company()['company']
        access = server.company_access_for(server.get_state(), 'avery')
        self.assertEqual(access['mode'], 'all')
        self.assertEqual(access['companyIds'], [])
        self.assertEqual(access['revision'], 1)
        self.assertIn(company, self.view()['clubs'])
        self.assertIn(company, self.view('taylor')['clubs'])

    def test_company_creation_is_admin_only(self):
        before = server.get_state()
        for actor in ['avery', 'taylor', 'sub', 'unknown']:
            with self.subTest(actor=actor), self.assertRaises(ValueError):
                self.create_company(actor=actor)
        self.assertEqual(before, server.get_state())

    def test_duplicate_and_invalid_company_names_do_not_create_records(self):
        before = server.get_state()
        for name in ['Example Company', ' example   COMPANY ', 'Dallas Cowboys', '', '   ', 'x'*121, None, 42]:
            with self.subTest(name=name), self.assertRaises(ValueError):
                self.create_company(name=name)
        self.assertEqual(before, server.get_state())
        self.create_company(name='Straße Media')
        with self.assertRaisesRegex(ValueError, 'already exists'):
            self.create_company(name='STRASSE MEDIA')

    def test_stale_access_or_invalid_advisor_cannot_leave_an_orphan_company(self):
        self.assign(['cowboys'])
        before = server.get_state()
        for data in [
            {'advisorId': 'avery', 'name': 'New Corp', 'revision': 0},
            {'advisorId': 'admin', 'name': 'New Corp', 'revision': 0},
            {'advisorId': 'avery', 'name': 'New Corp', 'revision': True},
            {'advisorId': 'unknown', 'name': 'New Corp', 'revision': 0}]:
            with self.subTest(data=data), self.assertRaises(ValueError):
                server.add_company('admin', data)
        self.assertEqual(before, server.get_state())

    def test_directory_capacity_is_enforced(self):
        state = server.get_state()
        state['clubs'] += [{'id': f'extra-{i}', 'name': f'Company {i}', 'league': 'Other'} for i in range(500-len(state['clubs']))]
        server.put_state(state)
        with self.assertRaisesRegex(ValueError, 'limit'):
            self.create_company()
        self.assertEqual(len(server.get_state()['clubs']), 500)

    def test_stale_workspace_saves_preserve_new_company_and_access(self):
        self.assign(['cowboys'])
        stale = self.view('admin')
        result = self.create_company()
        server.save_state_transaction(stale, 'admin')
        self.assertIn(result['company'], server.get_state()['clubs'])
        self.assertIn(result['company']['id'], server.company_access_for(server.get_state(), 'avery')['companyIds'])


if __name__ == '__main__':
    unittest.main()
