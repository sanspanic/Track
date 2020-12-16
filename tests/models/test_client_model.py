import os
from unittest import TestCase

from models import db, User, Client, Project

os.environ['DATABASE_URL'] = "postgresql:///work_logger"

from app import app

db.create_all()


class ClientModelTestCase(TestCase):
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

        u1 = User.query.get(u1_id)
        c1 = Client.query.get(c1_id)

        self.u1 = u1
        self.u1_id = u1_id
        self.c1 = c1 
        self.c1_id = c1_id

        self.client = app.test_client()

    def tearDown(self):
        res = super().tearDown()
        db.session.rollback()
        return res

    def test_client_model(self):
        """Does basic model work?"""

        # Client should have no projects
        self.assertEqual(len(self.c1.projects), 0)

    def test_full_address(self): 
        """Does full address display as extected?"""

        self.assertEqual(self.c1.full_address, "Street 10, EH2 3XI, Edinburgh, United Kingdom")

    def test_add_project(self): 
        """can client add project"""

        p = Project(user_id=self.u1_id, project_name='Administration', hourly_rate=20, curr_of_rate='USD', curr_of_inv='EUR', client_id=self.c1_id)
        db.session.add(p)
        db.session.commit()

        self.assertEqual(len(self.c1.projects), 1)



