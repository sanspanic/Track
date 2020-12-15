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
s = User.register('sandy', 'password', 'sandy@spanik.com', 'Sandy', 'Spanik')
a = User.register('testuser', 'password2', 'dog@woof.com', 'King', 'Arthur')

#add new objects to session, so they persist & commit
db.session.add_all([s, a])
db.session.commit()

#add clients
c1 = Client(user_id=1, name='Puffle Corp', street='Street 20', postcode='EH2 3XI', country='United Kingdom', city='Bratislava')
c2 = Client(user_id=1, name='Tommy Wiseau', street='Boulevard Drive', postcode='EH2 3XI', country='US', city='Los Angeles')
c3 = Client(user_id=2, name='Merlin', street='Beard Street 10', postcode='EH2 3XI', country='United Kingdom', city='Oxford')

db.session.add_all([c1, c2, c3])
db.session.commit()

#add projects
p1 = Project(user_id=1, project_name='PuffleCorp Administration', hourly_rate=24, curr_of_rate='USD', curr_of_inv='EUR', client_id=1)
p2 = Project(user_id=1, project_name='Website for TW', hourly_rate=100, curr_of_rate='USD', curr_of_inv='GBP', client_id=2)
p3 = Project(user_id=2, project_name='Design of Sword', hourly_rate=40, curr_of_rate='GBP', curr_of_inv='GBP', client_id=3)
p4 = Project(user_id=1, project_name='Merch for TW', hourly_rate=60, curr_of_rate='USD', curr_of_inv='USD', client_id=2)

db.session.add_all([p1, p2, p3, p4])
db.session.commit()

#add log entries
le2 = LogEntry(project_id=2, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 19, 35, 37, 227731), description='Admin')
le3 = LogEntry(project_id=3, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Admin')
le4 = LogEntry(project_id=4, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Admin')
#populate p1 with multiple log_entries
le1 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731), description='Admin')
le5 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 27, 12, 50, 37, 227731), stop_time=datetime.datetime(2020, 11, 27, 14, 50, 37, 227731), description='Emails')
le6 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 28, 14, 12, 37, 227731), stop_time=datetime.datetime(2020, 11, 28, 17, 51, 37, 227731), description='Excel')
le7 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 29, 15, 24, 37, 227731), stop_time=datetime.datetime(2020, 11, 29, 17, 51, 37, 227731), description='Email')
le8 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 30, 16, 33, 37, 227731), stop_time=datetime.datetime(2020, 11, 30, 19, 20, 37, 227731), description='Admin')
le9 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 12, 1, 10, 11, 37, 227731), stop_time=datetime.datetime(2020, 12, 1, 17, 51, 37, 227731), description='Website Maintenance')

db.session.add_all([le1, le2, le3, le4, le5, le6, le7, le8, le9])
db.session.commit()

#make invoices
all_les = [le1, le2, le3, le4, le5, le6, le7, le8, le9]

for le in all_les: 
    le.calc_value()
    le.project.increment_subtotal(le.value_in_curr_of_rate)
    le.project.increment_converted_subtotal(le.value_in_curr_of_inv)

le2.project.create_invoice()
le3.project.create_invoice()
le4.project.create_invoice() 
le1.project.create_invoice()

bi = BillingInfo(user_id=1, name='SansPanic Corp', street='Senicka 30', postcode='81104', city='Bratislava', country='Slovakia', email='sans@gmail.com', phone='0908870250', IBAN='12345678908732BRDED')
bi2 = BillingInfo(user_id=1, name='Sandra Spanikova', street='23/3 Viewcraig Street', postcode='EH89UJ', city='Edinburgh', country='Scotland', email='ssandra@gmaiil.com', phone='07526737364', IBAN='12345678908732BRDED')
db.session.add(bi)
db.session.add(bi2)
db.session.commit()



