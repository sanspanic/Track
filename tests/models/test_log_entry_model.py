import os
from unittest import TestCase
import datetime
from forex import convert

from models import db, User, Client, Project, LogEntry

os.environ['DATABASE_URL'] = "postgresql:///work_logger"

from app import app

db.create_all()


class LogEntryModelTestCase(TestCase):
    """Test views for log entry."""

    def setUp(self):
        """Create test client, add sample data."""

        db.drop_all()
        db.create_all()

        u1 = User.register("testuser", "testpassword", "test@email.com", "John", "Doe")
        u1_id = 1111
        u1.id = u1_id

        db.session.add(u1)
        db.session.commit()

        c1 = Client(user_id=1111, name='Organisation', street='Street 10', postcode='EH2 3XI', country='United Kingdom', city='Edinburgh')
        c1_id = 2222
        c1.id = c1_id

        db.session.add(c1)
        db.session.commit()

        p1 = Project(user_id=u1_id, project_name='Administration', hourly_rate=100, curr_of_rate='USD', curr_of_inv='EUR', client_id=c1_id)
        p1_id = 3333
        p1.id = p1_id

        db.session.add(p1)
        db.session.commit()

        le1 = LogEntry(project_id=p1_id, start_time=datetime.datetime(2020, 12, 16, 17, 00, 00), stop_time=datetime.datetime(2020, 12, 16, 18, 00, 00), description='Admin')
        le1_id = 4444 
        le1.id = le1_id

        db.session.add(le1)
        db.session.commit()

        u1 = User.query.get(u1_id)
        c1 = Client.query.get(c1_id)
        p1 = Project.query.get(p1_id)
        le1 = LogEntry.query.get(le1_id)

        self.u1 = u1
        self.u1_id = u1_id
        self.c1 = c1 
        self.c1_id = c1_id
        self.p1 = p1 
        self.p1_id = p1_id
        self.le1 = le1 
        self.le1_id = le1_id

        self.client = app.test_client()

    def tearDown(self):
        res = super().tearDown()
        db.session.rollback()
        return res

    def test_invoice_model(self):
        """Does basic model work?"""

        self.assertEqual(self.le1.project_id, self.p1_id)

#######################test log entry methods

    def test_pretty_start_time(self): 
        """does le return pretty start time?"""

        self.assertEqual(self.le1.pretty_start_time, "17:00")

    def test_pretty_stop_time(self): 
        """does le return pretty stop time?"""

        self.assertEqual(self.le1.pretty_stop_time, "18:00")

    def test_pretty_date(self): 
        """does le return pretty date?"""

        self.assertEqual(self.le1.pretty_date, "2020-12-16")

    def test_time_delta(self): 
        """does le return correct time difference?"""

        self.assertEqual(self.le1.time_delta, 60)

    def test_calc_value(self): 
        """does le calculate correct values?"""

        value_inv = round(convert(self.p1.curr_of_rate, self.p1.curr_of_inv, 100), 2)

        self.assertEqual(self.le1.calc_value(), {
            "value_rate": 
                {"sum": 100, "symbol": "US$"}, 
            "value_inv": 
                {"sum": value_inv, "symbol": "€"}
            })

        self.assertEqual(self.le1.value_in_curr_of_inv, value_inv)
        self.assertEqual(self.le1.value_in_curr_of_rate, 100)

    def test_handle_edit(self): 
        """does le update correctly?"""

        self.le1.calc_value()
        self.p1.increment_subtotal(self.le1.value_in_curr_of_rate)
        self.p1.increment_converted_subtotal(self.le1.value_in_curr_of_inv)

        data = {'description': 'Edited description', 
                'start_time': '17:00', 
                'stop_time': '19:00', 
                'date': '2020-12-01'}

        self.le1.handle_edit(data)

        self.assertEqual(self.le1.description, 'Edited description')
        self.assertEqual(self.le1.date, datetime.date(2020, 12, 1))
        self.assertEqual(self.le1.start_time, datetime.datetime(2020, 12, 1, 17, 0, 0))
        self.assertEqual(self.le1.stop_time, datetime.datetime(2020, 12, 1, 19, 0, 0))








