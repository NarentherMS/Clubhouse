import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
import server
import sync_workspace
import test_timesheet_contracts as timesheet_tests


class WorkspacePortabilityTests(unittest.TestCase):
    def setUp(self):
        self.fixture = timesheet_tests.TimesheetContractTests()
        self.fixture.setUp()
        self.original = server.DB_PATH

    def tearDown(self):
        server.DB_PATH = self.original
        self.fixture.tearDown()

    def test_export_and_first_run_restore_preserve_accounts_and_saved_data(self):
        self.fixture.save_time()
        server.ensure_accounts()
        server.create_session('avery')
        before = server.get_state()
        snapshot = Path(self.fixture.directory.name) / 'workspace-data.sqlite3'
        sync_workspace.snapshot_workspace(server.DB_PATH, snapshot)
        with sqlite3.connect(snapshot) as conn:
            self.assertEqual(conn.execute('PRAGMA integrity_check').fetchone()[0], 'ok')
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM accounts').fetchone()[0], 4)
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM sessions').fetchone()[0], 0)
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM time_expenses').fetchone()[0], 1)
        server.DB_PATH = Path(self.fixture.directory.name) / 'other-laptop' / 'clubhouse.sqlite3'
        self.assertTrue(server.restore_workspace_snapshot(snapshot))
        self.assertEqual(server.get_state(), before)
        self.assertEqual(server.time_expense_records('avery')[0]['detail']['hours'], '2.00')
        self.assertIsNotNone(server.account_user('admin'))

    def test_existing_database_is_never_replaced(self):
        snapshot = Path(self.fixture.directory.name) / 'workspace-data.sqlite3'
        sync_workspace.snapshot_workspace(server.DB_PATH, snapshot)
        state = server.get_state()
        state['contracts']['avery']['hourlyRate'] = 99
        server.put_state(state)
        self.assertFalse(server.restore_workspace_snapshot(snapshot))
        self.assertEqual(server.get_state()['contracts']['avery']['hourlyRate'], 99)


if __name__ == '__main__':
    unittest.main()
