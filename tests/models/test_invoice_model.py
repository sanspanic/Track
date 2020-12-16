import os
from unittest import TestCase
import datetime

from models import db, User, Client, Project, Invoice

os.environ['DATABASE_URL'] = "postgresql:///work_logger"

from app import app

db.create_all()


class InvoiceModelTestCase(TestCase):
    """Test views for messages."""

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

        i1 = p1.create_invoice()

        u1 = User.query.get(u1_id)
        c1 = Client.query.get(c1_id)
        p1 = Project.query.get(p1_id)
        i1 = Invoice.query.get(i1.id)


        self.u1 = u1
        self.u1_id = u1_id
        self.c1 = c1 
        self.c1_id = c1_id
        self.p1 = p1 
        self.p1_id = p1_id
        self.i1 = i1
        self.i1_id = i1.id

        self.client = app.test_client()

    def tearDown(self):
        res = super().tearDown()
        db.session.rollback()
        return res

    def test_invoice_model(self):
        """Does basic model work?"""

        self.assertEqual(self.i1.project_id, self.p1_id)

#######################test project methods

    def test_invoice_date(self): 
        """Does invoice make pretty date?"""
        
        self.i1.date = datetime.date(2020, 12, 1)
        self.assertEqual(self.i1.pretty_date, "2020-12-1")

    def test_convert_date(self): 
        """Does invoice convert date from JSON format to datetime.date?"""

        date_JSON = "2020-02-01"
        self.assertEqual(self.i1.convert_date(date_JSON), datetime.date(2020, 2, 1))

    def test_handle_extras_one_at_a_time(self): 
        """Does inv handle extras correctly if added one at a time?"""

        self.i1.amount_in_curr_of_inv = 100
        self.i1.handle_extras(100, None, None)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 200)
        self.i1.handle_extras(None, 50, None)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 100)
        self.i1.handle_extras(None, None, 100)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 200)

    def test_handle_extras_all_at_once(self): 
        """Does inv handle extras correctly if added all at once?"""
        
        self.i1.amount_in_curr_of_inv = 100
        self.i1.handle_extras(100, 50, 50)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 150)

    def test_handle_extras_two_at_a_time(self):
        """Does inv handle xtras correctly if added two at a time?"""

        self.i1.amount_in_curr_of_inv = 100
        self.i1.handle_extras(100, 50, None)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 100)

        self.i1.handle_extras(None, 50, 10)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 55)

        self.i1.handle_extras(45, None, 20)
        self.assertEqual(self.i1.amount_after_extras_in_curr_of_inv, 120)




