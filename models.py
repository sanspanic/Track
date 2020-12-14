from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import datetime
from forex import convert, get_symbol

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
    
    password = db.Column(db.String, 
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

    clients = db.relationship('Client', backref='user', cascade="all, delete-orphan")

    invoices = db.relationship('Invoice', backref='user', cascade="all, delete-orphan")
    
class Project(db.Model): 
    """project model"""

    __tablename__ = 'projects'

    def __repr__(self): 
        p = self
        return f"<Project with project_id = {p.id}, project_name = {p.project_name}, subtotal = {p.subtotal}, for client {p.client_id}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)

    user_id = db.Column(db.Integer, 
                    db.ForeignKey('users.id'))

    client_id = db.Column(db.Integer, 
                    db.ForeignKey('clients.id'))

    project_name = db.Column(db.String(30), 
                    nullable = False)

    #this subtotal is shown in currency of hourly or flat rate. to be updated from app.py
    subtotal = db.Column(db.Float(precision=2), 
                        nullable = False, 
                        default = 0)

    converted_subtotal = db.Column(db.Float(precision=2))

    hourly_rate = db.Column(db.Float(precision=2))

    curr_of_rate = db.Column(db.String, 
                        nullable = False)

    curr_of_inv = db.Column(db.String)

    log_entries = db.relationship('LogEntry', backref='project', cascade="all, delete-orphan")

    #pass in le.project.increment_subtotal(le.value_in_curr_of_rate)
    def increment_subtotal(self, sum): 
        """adds value of current log entry to subtotal"""

        self.subtotal += sum
        return round(self.subtotal, 2)

    #pass in le.project.update_converted_subtotal(le.value_in_curr_of_inv) 
    def increment_converted_subtotal(self, sum): 
        """adds value of current log entry to subtotal in conv currency"""

        if sum: 
            if not self.converted_subtotal: 
                self.converted_subtotal = 0
            self.converted_subtotal += sum

        return round(self.converted_subtotal, 2)

    def show_subtotal_values(self): 
        """returns dict in format {subtotal_rate: x, subtotal_inv: y} wherele subtotal_inv will hold None values if not self.curr_of_inv """
        subtotal_symbol = get_symbol(self.curr_of_rate)

        #converted_subtotal_string will only exist if self.curr_of_inv, otherwise no conversion occurs
        converted_subtotal_symbol = None
        if self.curr_of_inv: 
            converted_subtotal_symbol = get_symbol(self.curr_of_inv)

        return {
        "subtotal_rate": 
            {"sum": self.subtotal, "symbol": subtotal_symbol}, 
        "subtotal_inv": 
            {"sum": self.converted_subtotal, "symbol": converted_subtotal_symbol}
        }

    def create_invoice(self): 
        """creates instance of invoice populated with basic info"""

        i = Invoice(project_id=self.id, 
                user_id = self.user_id,
                amount_in_curr_of_rate=self.subtotal, 
                amount_in_curr_of_inv=self.converted_subtotal, 
                curr_of_rate=self.curr_of_rate, 
                curr_of_inv=self.curr_of_inv, 
                date=datetime.date.today())

        db.session.add(i)
        db.session.commit()

        return i


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
    start_time = db.Column(db.DateTime, 
                            nullable=False,
                            default=datetime.datetime.now())

    stop_time = db.Column(db.DateTime)

    date = db.Column(db.Date, 
                        nullable = False, 
                        default = datetime.date.today())
    
    value_in_curr_of_rate = db.Column(db.Float(precision=2))

    value_in_curr_of_inv = db.Column(db.Float(precision=2))

    description = db.Column(db.String)
    
    @property
    def time_delta(self): 
        """returns time spent working for this particular log entry in minutes"""

        if self.stop_time: 
            delta = self.stop_time - self.start_time
            seconds = delta.seconds

            return round(seconds/60, 2)

    def calc_value(self): 
        """updates self.value_in_curr_of_rate and self.value_in_curr_of_inv.
        if hourly rate defined, calculates value of log entry in currency of rate and currency of invoice, returns dict value_rate: x, value_inv: y"""

        project = Project.query.get(self.project_id)

        if project.hourly_rate: 
            value_rate = round(self.time_delta/60 * project.hourly_rate, 2)
            value_rate_symbol = get_symbol(project.curr_of_rate)
    
            #following part of function only runs if invoice in foreign currency, i.e., if project.curr_of_inv, else value_inv is None
            value_inv_symbol = None
            value_inv = None
            if project.curr_of_inv: 
                value_inv = round(convert(project.curr_of_rate, project.curr_of_inv, value_rate),2)
                value_inv_symbol = get_symbol(project.curr_of_inv)

        self.value_in_curr_of_rate = value_rate
        self.value_in_curr_of_inv = value_inv

        return {
            "value_rate": 
                {"sum": value_rate, "symbol": value_rate_symbol}, 
            "value_inv": 
                {"sum": value_inv, "symbol": value_inv_symbol}
            }

        #when user clicks stop: first update datetime for time_stopped, then calc_value, then increment project subtotals

    @property
    def pretty_start_time(self): 
        """returns pretty time"""
        return ':'.join(str(self.start_time.time()).split('.')[0].split(':')[:-1])

    @property
    def pretty_stop_time(self): 
        """returns pretty stop time"""
        if self.stop_time:
            return ':'.join(str(self.stop_time.time()).split('.')[0].split(':')[:-1])

    @property
    def pretty_date(self): 
        """return pretty date"""
        return f"{self.date.year}-{self.date.month}-{self.date.day}"

    def handle_edit(self, data): 

        #update description
        self.description = data.get('description')

        #previous value of log_entry must be subtracted from project subtotal values. then new value of log_entry must be calculated and added
        self.project.subtotal -= self.value_in_curr_of_rate
        if self.value_in_curr_of_inv:
            self.project.converted_subtotal -= self.value_in_curr_of_inv

        #convert data retrieved from json into dates and times db will accept

        date = data.get('date').split(sep='-')
        datetime_arr = []

        for num in date: 
            if num[0] == '0': 
                num = num[-1]
            datetime_arr.append(int(num))

        start_time = data.get('start_time').split(':')
        stop_time = data.get('stop_time').split(':')

        #update db
        self.date = datetime.date(*datetime_arr)
        self.start_time = datetime.datetime(*datetime_arr, int(start_time[0]), int(start_time[1]))
        self.stop_time = datetime.datetime(*datetime_arr, int(stop_time[0]), int(stop_time[1]))
                
        #new value of log_entry calculated and added to subtotals
        self.calc_value()
        self.project.subtotal += self.value_in_curr_of_rate
        if self.value_in_curr_of_inv:
            self.project.converted_subtotal += self.value_in_curr_of_inv

        return self

    def serialize(self):
        """Serialize a SQLAlchemy obj to dictionary."""

        return {
            "id": self.id,
            "project_id": self.project_id,
            "start_time": self.start_time,
            "stop_time": self.stop_time, 
            "date": self.date, 
            "value_in_curr_of_rate": self.value_in_curr_of_rate, 
            "value_in_curr_of_inv": self.value_in_curr_of_inv, 
            "description": self.description,
            "time_delta": self.time_delta, 
            "pretty_start_time": self.pretty_start_time, 
            "pretty_stop_time": self.pretty_stop_time, 
            "pretty_date": self.pretty_date, 
            #pass in project details as well so front-end can update subtotals
            "subtotal": self.project.subtotal, 
            "converted_subtotal": self.project.converted_subtotal, 
            "curr_of_rate": self.project.show_subtotal_values()['subtotal_rate']['symbol'],
            "curr_of_inv": self.project.show_subtotal_values()['subtotal_inv']['symbol']
        }


class Client(db.Model): 
    """client model"""

    __tablename__ = 'clients'

    def __repr__(self): 
        return f"<Client with client_id = {self.id}, name = {self.name}. Client of user with user_id = {self.user_id}"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)

    user_id = db.Column(db.Integer, 
                    db.ForeignKey('users.id'))

    name = db.Column(db.String)

    street = db.Column(db.String)

    postcode = db.Column(db.String)

    city = db.Column(db.String)
    
    country = db.Column(db.String)
                        
    projects = db.relationship('Project', backref='client')

    @property
    def full_address(self): 
        """returns full address as string"""

        return (f"{self.street}, {self.postcode}, {self.city}, {self.country}")

    def serialize(self):
        """Serialize a SQLAlchemy obj to dictionary."""

        return {
            "id": self.id,
            "name": self.name,
            "street": self.street,
            "postcode": self.postcode, 
            "city": self.city, 
            "country": self.country, 
            "full_address": self.full_address
        }


class Invoice(db.Model): 
    """invoice model"""

    __tablename__ = 'invoices'

    def __repr__(self): 
        return f"<Invoice with id = {self.id}, for project with id = {self.project_id}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)
    
    project_id = db.Column(db.Integer, 
                    db.ForeignKey('projects.id'))
        
    user_id = db.Column(db.Integer, 
                    db.ForeignKey('users.id'))

    invoice_nr = db.Column(db.String)

    billing_address = db.Column(db.String)

    amount_in_curr_of_rate = db.Column(db.Float(precision=2))

    amount_in_curr_of_inv = db.Column(db.Float(precision=2))

    curr_of_rate = db.Column(db.String)

    curr_of_inv = db.Column(db.String)

    date = db.Column(db.Date)

    due_date = db.Column(db.Date)

    extra = db.Column(db.Float(precision=2))

    VAT = db.Column(db.Float(precision=2))

    discount = db.Column(db.Float(precision=2))

    amount_after_extras_in_curr_of_inv = db.Column(db.Float(precision=2))
                        
    project = db.relationship('Project', backref='invoice')

    @property
    def pretty_date(self): 
        """return pretty date"""
        return f"{self.date.year}-{self.date.month}-{self.date.day}"

    def serialize(self):
        """Serialize a SQLAlchemy obj to dictionary."""

        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "invoice_nr": self.invoice_nr, 
            "billing_address": self.billing_address, 
            "amount_in_curr_of_rate": self.amount_in_curr_of_rate, 
            "amount_in_curr_of_inv": self.amount_in_curr_of_inv, 
            "curr_of_rate": self.curr_of_rate, 
            "curr_of_inv": self.curr_of_inv, 
            "date": self.date, 
            "due_date": self.due_date, 
            "extra": self.extra, 
            "VAT": self.VAT, 
            "discount": self.discount, 
            "amount_after_extras_in_curr_of_inv": self.amount_after_extras_in_curr_of_inv, 
            "pretty_date": self.pretty_date
        }

    def convert_date(self, date): 
        """convert data retrieved from json into dates db will accept"""
               
        date_arr = date.split('-')
        datetime_arr = []
        for num in date_arr: 
            if num[0] == '0': 
                num = num[-1]
            datetime_arr.append(int(num))

        return datetime.date(*datetime_arr)

    def handle_extras(self, extra, discount, VAT): 
        """converts user input into values db will accept, updates self and final totals (amount_after_extras...)"""

        if extra: 
            extra = float(extra)
            self.extra = extra
            self.amount_after_extras_in_curr_of_inv = self.amount_in_curr_of_inv + self.extra
        else: 
            #must initialize amount after extras otherwise if dicount or VAT, error
            if not self.amount_after_extras_in_curr_of_inv:
                self.amount_after_extras_in_curr_of_inv = self.amount_in_curr_of_inv

        if discount:
            discount = float(discount)
            self.discount = discount
            self.amount_after_extras_in_curr_of_inv = self.amount_after_extras_in_curr_of_inv - (self.amount_after_extras_in_curr_of_inv/100 * discount)

        if VAT: 
            VAT= float(VAT)
            self.VAT = VAT
            self.amount_after_extras_in_curr_of_inv = self.amount_after_extras_in_curr_of_inv + (self.amount_after_extras_in_curr_of_inv/100 * VAT)

        return [extra, discount, VAT]

class BillingInfo(db.Model): 
    """model for billing info. user will have many billing infos and many invoices"""

    __tablename__ = 'billing_infos'

    def __repr__(self): 
        return f"<Billing info id={self.id} for user with id = {self.user_id}, billing as {self.name}>"

    id = db.Column(db.Integer, 
                    primary_key = True, 
                    autoincrement = True)
    
    user_id = db.Column(db.Integer, 
                db.ForeignKey('users.id'))

    name = db.Column(db.String)

    street = db.Column(db.String)

    postcode = db.Column(db.String)

    city = db.Column(db.String)

    country = db.Column(db.String)

    email = db.Column(db.String)

    phone = db.Column(db.String)

    user = db.relationship('User', backref='billing_info')

    def serialize(self):
        """Serialize a SQLAlchemy obj to dictionary."""

        return {
            "id": self.id,
            "name": self.name,
            "street": self.street,
            "postcode": self.postcode, 
            "city": self.city, 
            "country": self.country, 
            "email": self.email, 
            "phone": self.phone
        }

                    






    




