from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

def connect_db(app):
    """Connect to database."""

    db.app = app
    db.init_app(app)

class User(db.Model): 
    """user model"""

    __tablename__ = 'users'

    def __repr__(self): 
        u = self
        return f"<User with user_id = {u.id}, username = {u.username}, first_name = {u.first_name}, last_name = {u.last_name}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)

    username = db.Column(db.String(30), 
                    unique = True, 
                    nullable = False)

    first_name = db.Column(db.String, 
                        nullable = False)

    last_name = db.Column(db.String, 
                        nullable = False)
    
    password = db.Column(db.String(), 
                        nullable = False)

    email = db.Column(db.String, 
                        nullable = False)

    @classmethod
    def register(cls, username, pwd, email, first_name, last_name):
        """Register user with hashed password & return user."""

        hashed = bcrypt.generate_password_hash(pwd)
        # turn bytestring into normal (unicode utf8) string
        hashed_utf8 = hashed.decode("utf8")

        # return instance of user w/username and hashed pwd
        return cls(username=username, password=hashed_utf8, email=email, first_name=first_name, last_name=last_name)

    @classmethod
    def authenticate(cls, username, pwd):
        """Validate that user exists & password is correct. Return user if valid, else return False."""

        u = User.query.filter_by(username=username).first()

        if u and bcrypt.check_password_hash(u.password, pwd):
            # return user instance
            return u
        else:
            return False

    @property
    def full_name(self): 
        """returns string of full name"""
        full_name = f'{self.first_name} {self.last_name}'
        return full_name

    projects = db.relationship('Project', backref='user', cascade="all, delete-orphan")

class Project(db.Model): 
    """project model"""

    __tablename__ = 'projects'

    def __repr__(self): 
        p = self
        return f"<Project with project_id = {p.id}, project_name = {p.project_name}, subtotal = {p.subtotal}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)

    user_id = db.Column(db.Integer, 
                    db.ForeignKey('users.id'))

    project_name = db.Column(db.String(30),  
                    nullable = False)

    subtotal = db.Column(db.Integer, 
                        nullable = False, 
                        default = 0)

    flat_rate = db.Column(db.Integer)

    hourly_rate = db.Column(db.Integer)

    curr_of_rate = db.Column(db.String, 
                        nullable = False)

    curr_of_inv = db.Column(db.String)

    def update_subtotal(self, sum): 
        """adds value of current log entry to subtotal"""
        self.subtotal += sum

    def reset_subtotal(self): 
        """resets subtotal to 0 at end of invoice cycle"""
        self.subtotal = 0

    log_entries = db.relationship('LogEntry', backref='project', cascade="all, delete-orphan")

class LogEntry(db.Model): 
    """log entry model"""

    __tablename__ = 'log_entries'

    def __repr__(self): 
        return f"<Log entry for project with project_id = {self.project_id}, start_time = {self.start_time}, stop_time = {self.stop_time}, date = {self.date}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)

    project_id = db.Column(db.Integer, 
                    db.ForeignKey('projects.id'))

    #accepts format datetime.datetime.now(). these will be updated after the log entry is first created
    start_time = db.Column(db.DateTime)

    stop_time = db.Column(db.DateTime)

    date = db.Column(db.Date, 
                        nullable = False, 
                        default = datetime.date.today())
    
    #below will be updated from app by calling instance method calc_value
    value_in_curr_of_pay = db.Column(db.String)

    value_in_curr_of_inv = db.Column(db.String)
    
    @property
    def time_delta(self): 
        """returns time spent working for this particular log entry in minutes"""
        delta = self.stop_time - self.start_time
        seconds = delta.seconds
        return round(seconds/60, 2)

    def calc_value(self): 
        """if hourly rate defined, calculates value of log entry in currency of rate and currency of invoice, returns dict value_rate: x, value_inv: x"""
        project = Project.query.get(self.project_id)
        if project.hourly_rate: 
            value_rate = round(self.time_delta/60 * project.hourly_rate, 2)
            value_rate_str = f'{value_rate} {project.curr_of_rate}'
            #TODO: implement forex conversion
            value_inv = 100
            value_inv_str = f'{value_inv} {project.curr_of_inv}'
            return {"value_rate": value_rate_str, "value_inv": value_inv_str}



    




