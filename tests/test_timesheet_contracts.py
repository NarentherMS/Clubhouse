"""Run with: python3 -B -m unittest discover -s tests -v"""
import copy
import json
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class TimesheetContractTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.original_path = server.DB_PATH
        server.DB_PATH = Path(self.directory.name) / 'test.sqlite3'
        self.state = {
            'users': [{'id': 'admin', 'name': 'Admin', 'role': 'Admin'},
                      {'id': 'sub', 'name': 'Sub', 'role': 'Sub-admin'},
                      {'id': 'avery', 'name': 'Avery', 'role': 'User'},
                      {'id': 'taylor', 'name': 'Taylor', 'role': 'User'}],
            'clubs': [{'id': 'cowboys', 'name': 'Dallas Cowboys', 'league': 'NFL'}],
            'interactions': [{'id': 'completed', 'clubId': 'cowboys', 'owner': 'avery',
                              'date': '2026-11-19', 'summary': 'Completed meeting', 'meetingMinutes': 60}],
            'meetings': [{'id': 'future', 'clubId': 'cowboys', 'owner': 'avery',
                          'date': '2026-11-20', 'status': 'Planned'}],
            'contracts': {'avery': {'hourlyRate': 40, 'firstMonthCap': 80,
                                   'monthlyCap': 80, 'sowStart': '2026-11-01'},
                          'taylor': {'hourlyRate': 50, 'monthlyCap': 20}},
        }
        server.put_state(self.state)

    def tearDown(self):
        server.DB_PATH = self.original_path
        self.directory.cleanup()

    def save_time(self, **changes):
        data = {'action': 'save', 'kind': 'time', 'date': '2026-11-19',
                'toDate': '2026-11-19', 'hours': '1', 'deliverables': 'Research'}
        data.update(changes)
        server.time_expense_records('avery', data)
        return next(item for item in server.time_expense_records('avery') if item['kind'] == 'time')

    def balance(self, month='2026-11'):
        return next(item for item in server.timesheet_allowances(server.get_state(), 'avery',
                    server.time_expense_records('avery')) if item['month'] == month)

    def test_save_without_approval_deducts_hours_and_budget(self):
        row = self.save_time()
        self.assertEqual(row['status'], 'Saved')
        self.assertEqual(row['detail']['hours'], '2.00')
        self.assertEqual(row['detail']['amount'], '80.00')
        self.assertEqual(self.balance()['hoursRemaining'], '78.00')
        self.assertEqual(self.balance()['amountRemaining'], '3120.00')
        self.assertEqual(len(row['detail']['meetings']), 1)  # Planned meeting is excluded.

    def test_edit_replaces_usage_and_rejects_stale_revision(self):
        row = self.save_time()
        self.save_time(id=row['id'], revision=row['revision'], hours='2')
        self.assertEqual(self.balance()['hoursUsed'], '3.00')
        self.assertEqual(self.balance()['amountRemaining'], '3080.00')
        with self.assertRaisesRegex(ValueError, 'changed'):
            self.save_time(id=row['id'], revision=row['revision'])

    def test_owner_isolation_and_staff_read_only_timesheets(self):
        row = self.save_time()
        self.assertEqual(server.time_expense_records('taylor'), [])
        for actor, action in [('taylor', 'save'), ('admin', 'approve'), ('sub', 'approve')]:
            with self.subTest(actor=actor), self.assertRaises(ValueError):
                server.time_expense_records(actor, {'id': row['id'], 'revision': row['revision'],
                                                    'action': action, 'kind': 'time'})
        self.assertEqual(len(server.time_expense_records('admin')), 1)
        self.assertEqual(len(server.time_expense_records('sub')), 1)
        own = server.timesheet_allowances(self.state, 'taylor', server.time_expense_records('admin'))
        self.assertTrue(all(item['owner'] == 'taylor' for item in own))

    def test_expenses_save_and_edit_without_approval(self):
        data = {'action': 'save', 'kind': 'travel', 'date': '2026-11-19',
                'category': 'Food', 'cost': '25.50', 'reason': 'Lunch'}
        server.time_expense_records('avery', data)
        expense = server.time_expense_records('avery')[0]
        self.assertEqual(expense['status'], 'Saved')
        self.assertEqual(server.time_expense_records('taylor'), [])
        data.update(id=expense['id'], revision=expense['revision'], cost='30.00')
        for actor in ['admin', 'sub', 'taylor']:
            with self.subTest(actor=actor), self.assertRaises(ValueError):
                server.time_expense_records(actor, data)
        for action in ['approve', 'return']:
            with self.subTest(action=action), self.assertRaises(ValueError):
                server.time_expense_records('admin', {**data, 'action': action})
        server.time_expense_records('avery', data)
        edited = server.time_expense_records('avery')[0]
        self.assertEqual(edited['detail']['cost'], '30.00')
        self.assertEqual(edited['status'], 'Saved')
        with self.assertRaisesRegex(ValueError, 'changed'):
            server.time_expense_records('avery', data)
        self.assertEqual(len(server.time_expense_records('admin')), 1)
        self.assertEqual(len(server.time_expense_records('sub')), 1)

    def test_legacy_expenses_remain_visible_and_editable(self):
        data = {'action': 'save', 'kind': 'travel', 'date': '2026-11-19',
                'category': 'Other', 'otherCategory': 'Parking', 'cost': '10', 'reason': 'Client meeting'}
        server.time_expense_records('avery', data)
        for status in ['Draft', 'Submitted', 'Approved', 'Returned']:
            with self.subTest(status=status):
                with server.connect() as conn:
                    conn.execute("UPDATE time_expenses SET status=?, note='Old review note'", (status,))
                expense = server.time_expense_records('admin')[0]
                self.assertEqual(expense['status'], 'Saved')
                self.assertEqual(expense['note'], '')
                server.time_expense_records('avery', {**data, 'id': expense['id'], 'revision': expense['revision']})
                self.assertEqual(server.time_expense_records('avery')[0]['status'], 'Saved')

    def test_overlapping_ranges_and_invalid_dates_are_rejected(self):
        self.save_time()
        for changes in [{'date': '2026-11-18', 'toDate': '2026-11-20'},
                        {'date': '2026-11-21', 'toDate': '2026-11-20'},
                        {'date': 'bad'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                self.save_time(**changes)

    def test_cross_month_manual_hours_and_actual_meeting_dates(self):
        self.state['interactions'] = [
            {'id': 'nov', 'owner': 'avery', 'clubId': 'cowboys', 'date': '2026-11-30', 'meetingMinutes': 60},
            {'id': 'dec', 'owner': 'avery', 'clubId': 'cowboys', 'date': '2026-12-01', 'meetingMinutes': 120}]
        server.put_state(self.state)
        self.save_time(date='2026-11-30', toDate='2026-12-01', hours='4')
        self.assertEqual(self.balance()['hoursUsed'], '3.00')
        self.assertEqual(self.balance('2026-12')['hoursUsed'], '4.00')
        self.assertEqual(self.balance('2026-12')['amountUsed'], '160.00')

    def test_first_month_cap_and_captured_rate(self):
        self.state['contracts']['avery']['firstMonthCap'] = 10
        server.put_state(self.state)
        row = self.save_time()
        self.assertEqual(self.balance()['hoursRemaining'], '8.00')
        self.state['contracts']['avery']['hourlyRate'] = 60
        server.put_state(self.state)
        row = self.save_time(id=row['id'], revision=row['revision'], hours='2')
        self.assertEqual(row['detail']['billingRate'], 40)
        self.assertEqual(self.balance()['amountUsed'], '120.00')

    def test_old_submitted_timesheet_is_editable_and_counted(self):
        self.save_time()
        with server.connect() as conn:
            conn.execute("UPDATE time_expenses SET status='Submitted'")
        row = server.time_expense_records('avery')[0]
        self.assertEqual(row['status'], 'Saved')
        self.assertEqual(self.balance()['hoursUsed'], '2.00')
        self.save_time(id=row['id'], revision=row['revision'])
        self.assertEqual(self.balance()['hoursUsed'], '2.00')

    def test_over_cap_is_visible_and_rate_validation_rejects_invalid_values(self):
        self.save_time(hours='20')
        self.save_time(date='2026-11-20', toDate='2026-11-23', hours='70')
        self.assertEqual(self.balance()['hoursRemaining'], '-11.00')
        self.assertEqual(self.balance()['amountRemaining'], '-440.00')
        for value in [float('nan'), float('inf'), -1, 'forty', True]:
            state = copy.deepcopy(self.state)
            state['contracts']['avery']['hourlyRate'] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                server.validate_state_shape(state)

    def test_zero_rate_stays_zero_after_contract_rate_change(self):
        self.state['contracts']['avery']['hourlyRate'] = 0
        server.put_state(self.state)
        self.save_time()
        self.state['contracts']['avery']['hourlyRate'] = 40
        server.put_state(self.state)
        self.assertEqual(self.balance()['amountUsed'], '0.00')

    def test_missing_contract_does_not_prevent_timesheet_save(self):
        self.state['contracts'] = {}
        server.put_state(self.state)
        row = self.save_time()
        self.assertEqual(row['status'], 'Saved')
        self.assertIsNone(row['detail']['billingRate'])
        self.assertFalse(self.balance()['configured'])

    def test_roadmap_api_handler_is_removed_and_capabilities_remain(self):
        self.assertFalse(hasattr(server.Handler, 'handle_roadmap'))
        self.assertFalse(hasattr(server, 'roadmap_records'))
        self.assertIn('Marketing in a Box', server.CAPABILITIES)


if __name__ == '__main__':
    unittest.main()
