import os
from unittest import TestCase

from models import db, User

os.environ['DATABASE_URL'] = "postgresql:///work_logger"

from app import app

db.create_all()


class UserModelTestCase(TestCase):
    """Test views for messages."""

    def setUp(self):
        """Create test client, add sample data."""
        db.drop_all()
        db.create_all()

        u1 = User.register("testuser", "testpassword", "test@email.com", "John", "Doe")
        u1_id = 1111
        u1.id = u1_id

        u2 = User.register("anothertestuser", "anothertestpassword", "anothertest@email.com", "Jane", "Doe")
        u2_id = 2222
        u2.id = u2_id

        db.session.add_all([u1, u2])
        db.session.commit()

        u1 = User.query.get(u1_id)
        u2 = User.query.get(u2_id)

        self.u1 = u1
        self.u1_id = u1_id

        self.u2 = u2
        self.u2_id = u2_id

        self.client = app.test_client()

    def tearDown(self):
        res = super().tearDown()
        db.session.rollback()
        return res

    def test_user_model(self):
        """Does basic model work?"""

        # User should have no projects & no clients
        self.assertEqual(len(self.u1.projects), 0)
        self.assertEqual(len(self.u1.clients), 0)

###################REGISTRATION TESTS

    def test_valid_signup(self):
        """Does signup work?"""

        u = User.query.get(self.u1_id)

        self.assertIsNotNone(u)
        self.assertEqual(u.username, "testuser")
        self.assertEqual(u.email, "test@email.com")
        self.assertNotEqual(u.password, "password")
        # Bcrypt strings should start with $2b$
        self.assertTrue(u.password.startswith("$2b$"))

    def test_invalid_username_signup(self):
        """Does registration fail if not unique username?""" 
        invalid = User.register("testuser", "password", "test@test.com", "Fname", "Lname")
        uid = 123456789
        invalid.id = uid
        db.session.add(invalid)
        with self.assertRaises(exc.IntegrityError) as context:
            db.session.commit()

##################AUTHENTICATION TESTS

    def test_valid_authentication(self):
        """Does authentication work?"""

        u = User.authenticate(self.u1.username, "testpassword")
        self.assertIsNotNone(u)
        self.assertEqual(u.id, self.u1_id)
    
    def test_invalid_username(self):
        """Does authentication fail with invalid username?"""
        self.assertFalse(User.authenticate("badusername", "testpassword"))

    def test_wrong_password(self):
         """Does authentication fail with invalid password?"""
         
         self.assertFalse(User.authenticate("testuser", "badpassword"))

##################METHODS TEST

    def test_full_name(self): 
        """Does property return full name correctly?"""

        self.assertEqual(self.u1.full_name, "John Doe")



        


