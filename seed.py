from models import db, User, Project, LogEntry, Client, BillingInfo
from app import app
import datetime

def drop_everything():
    """(On a live db) drops all foreign key constraints before dropping all tables.
    Workaround for SQLAlchemy not doing DROP ## CASCADE for drop_all()
    (https://github.com/pallets/flask-sqlalchemy/issues/722)
    """
    from sqlalchemy.engine.reflection import Inspector
    from sqlalchemy.schema import DropConstraint, DropTable, MetaData, Table

    con = db.engine.connect()
    trans = con.begin()
    inspector = Inspector.from_engine(db.engine)

    # We need to re-create a minimal metadata with only the required things to
    # successfully emit drop constraints and tables commands for postgres (based
    # on the actual schema of the running instance)
    meta = MetaData()
    tables = []
    all_fkeys = []

    for table_name in inspector.get_table_names():
        fkeys = []

        for fkey in inspector.get_foreign_keys(table_name):
            if not fkey["name"]:
                continue

            fkeys.append(db.ForeignKeyConstraint((), (), name=fkey["name"]))

        tables.append(Table(table_name, meta, *fkeys))
        all_fkeys.extend(fkeys)

    for fkey in all_fkeys:
        con.execute(DropConstraint(fkey))

    for table in tables:
        con.execute(DropTable(table))

    trans.commit()

#create all tables
drop_everything()
#db.drop_all()
db.create_all()

#if table isn't empty, empty it
User.query.delete() 
Project.query.delete()
LogEntry.query.delete()
Client.query.delete()

#add users
s = User.register('sandy', 'password', 'sandy@email.com', 'Sandy', 'Spanik')
r = User.register('rumpel', 'password2', 'rumpel@email.com', 'Rumpel', 'Stiltskin')

#add new objects to session, so they persist & commit
db.session.add_all([s, r])
db.session.commit()

#add clients
c1 = Client(user_id=1, name='Corp Ltd', street='Street 20', postcode='EH2 3XI', country='United Kingdom', city='Edinburgh')
c2 = Client(user_id=1, name='Rand Business Name', street='Boulevard Drive', postcode='900 05', country='US', city='Los Angeles')
c3 = Client(user_id=1, name='Megacorp', street='Banicka 30', postcode='807 09', country='Slovakia', city='Bratislava')
c4 = Client(user_id=2, name='Merlin', street='Beard Street 10', postcode='OX1 DP8', country='United Kingdom', city='Oxford')

db.session.add_all([c1, c2, c3, c4])
db.session.commit()

#add projects
p1 = Project(user_id=1, project_name='Administration', hourly_rate=25, curr_of_rate='USD', curr_of_inv='EUR', client_id=1)
p2 = Project(user_id=1, project_name='Web Design', hourly_rate=50, curr_of_rate='USD', curr_of_inv='EUR', client_id=1)
p3 = Project(user_id=1, project_name='Administration', hourly_rate=30, curr_of_rate='USD', curr_of_inv='GBP', client_id=2)
p4 = Project(user_id=1, project_name='Trapeze Lesson', hourly_rate=50, curr_of_rate='GBP', curr_of_inv='GBP', client_id=2)
p5 = Project(user_id=1, project_name='Administration', hourly_rate=20, curr_of_rate='USD', curr_of_inv='USD', client_id=3)
p6 = Project(user_id=2, project_name='Web Scraping', hourly_rate=100, curr_of_rate='USD', curr_of_inv='USD', client_id=4)

db.session.add_all([p1, p2, p3, p4, p5, p6])
db.session.commit()

#add log entries
le1 = LogEntry(project_id=2, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 19, 35, 37, 227731), description='Website Updates')
le2 = LogEntry(project_id=3, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Emails')
le3 = LogEntry(project_id=4, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Financial report')
le4 = LogEntry(project_id=5, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Room bookings')
#populate p1 with multiple log_entries
le5 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 26, 10, 00, 00, 00), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Financial report')
le6 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 27, 9, 00, 00, 00), stop_time=datetime.datetime(2020, 11, 27, 14, 50, 37, 227731), description='Emails')
le7 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 28, 8, 12, 00, 00), stop_time=datetime.datetime(2020, 11, 28, 13, 30, 00, 00), description='Membership enquiries')
le8 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 30, 12, 33, 00, 00), stop_time=datetime.datetime(2020, 11, 30, 19, 20, 37, 227731), description='G-Suite maintenance')
le9 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 12, 1, 10, 11, 37, 227731), stop_time=datetime.datetime(2020, 12, 1, 19, 00, 37, 227731), description='Website maintenance')
le10 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 29, 9, 24, 37, 227731), stop_time=datetime.datetime(2020, 11, 29, 17, 51, 37, 227731), description='Membership analysis')

db.session.add_all([le1, le2, le3, le4, le5, le6, le7, le8, le9, le10])
db.session.commit()

#make invoices
all_les = [le1, le2, le3, le4, le5, le6, le7, le8, le9, le10]

for le in all_les: 
    le.calc_value()
    le.project.increment_subtotal(le.value_in_curr_of_rate)
    le.project.increment_converted_subtotal(le.value_in_curr_of_inv)

le1.project.create_invoice()
le2.project.create_invoice()
le3.project.create_invoice() 
le4.project.create_invoice()
le5.project.create_invoice()

bi1 = BillingInfo(user_id=1, name='Admin & Co', street='Havnicka 23', postcode='817 13', city='Bratislava', country='Slovakia', email='sandy@email.com', phone='0908870250', IBAN='12345678908732BRDED')
bi2 = BillingInfo(user_id=1, name='Sandra Spanikova', street='23/3 Bruntsfield Street', postcode='EH5 XUJ', city='Edinburgh', country='Scotland', email='sandra@email.com', phone='0126329311', IBAN='12345678908732BRDED')
bi3 = BillingInfo(user_id=2, name='Rumpel Stiltskin', street='Grimm Street', postcode='EH89UJ', city='London', country='UK', email='rumpel@email.com', phone='07528462519', IBAN='12345678908732BRDED')

db.session.add_all([bi1, bi2, bi3])
db.session.commit()



