import os
from unittest import TestCase

from models import db, User, Client, Project, Invoice

os.environ['DATABASE_URL'] = "postgresql:///work_logger"

from app import app

db.create_all()


class ProjectModelTestCase(TestCase):
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

        u1 = User.query.get(u1_id)
        c1 = Client.query.get(c1_id)
        p1 = Project.query.get(p1_id)

        self.u1 = u1
        self.u1_id = u1_id
        self.c1 = c1 
        self.c1_id = c1_id
        self.p1 = p1 
        self.p1_id = p1_id

        self.client = app.test_client()

    def tearDown(self):
        res = super().tearDown()
        db.session.rollback()
        return res

    def test_project_model(self):
        """Does basic model work?"""

        # project should have no log_entries
        self.assertEqual(len(self.p1.log_entries), 0)

#######################test project methods

    def test_increment_subtotal(self): 
        """does incrementing subtotal work?"""
        
        self.assertEqual(self.p1.increment_subtotal(100), 100)

    def test_increment_converted_subtotal(self): 
        """does incrementing converted subtotal work?"""
        
        self.assertEqual(self.p1.increment_converted_subtotal(100), 100)

    def test_show_subtotal_values(self): 
        """does show subtotal values show correct dict?"""
        
        self.assertEqual(self.p1.show_subtotal_values(), {
                                                'subtotal_rate': 
                                                    {'sum': self.p1.subtotal, 'symbol': "US$"}, 
                                                'subtotal_inv': 
                                                    {'sum': self.p1.converted_subtotal, 'symbol': "€"}
                                                })

        self.p1.subtotal = 100
        self.p1.converted_subtotal = 90 
        db.session.commit()

        self.assertEqual(self.p1.show_subtotal_values(), {
                                                'subtotal_rate': 
                                                    {'sum': 100, 'symbol': "US$"}, 
                                                'subtotal_inv': 
                                                    {'sum': 90, 'symbol': "€"}
                                                })

    def test_create_invoice(self): 
        """does p.create_invoice() generate an invoice?"""

        self.assertEqual(len(self.p1.invoice), 0)
        self.p1.create_invoice()
        self.assertEqual(len(self.p1.invoice), 1)




