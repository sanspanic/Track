from models import db, User, Project, LogEntry, Client
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
p3 = Project(user_id=2, project_name='Design of Sword', hourly_rate=40, curr_of_rate='GBP', client_id=3)
p4 = Project(user_id=1, project_name='Merch for TW', hourly_rate=60, curr_of_rate='USD', client_id=2)

db.session.add_all([p1, p2, p3, p4])
db.session.commit()

#add log entries
le1 = LogEntry(project_id=1, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731))
le2 = LogEntry(project_id=2, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 19, 35, 37, 227731))
le3 = LogEntry(project_id=3, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731))
le4 = LogEntry(project_id=4, start_time=datetime.datetime(2020, 11, 26, 16, 39, 37, 227731), stop_time=datetime.datetime(2020, 11, 26, 17, 51, 37, 227731))

db.session.add_all([le1, le2, le3, le4])
db.session.commit()

#make invoices
le1.calc_value()
le1.project.increment_subtotal(le1.value_in_curr_of_rate)
le1.project.increment_converted_subtotal(le1.value_in_curr_of_inv)
le1.project.create_invoice()

le2.calc_value()
le2.project.increment_subtotal(le2.value_in_curr_of_rate)
le2.project.increment_converted_subtotal(le2.value_in_curr_of_inv)
le2.project.create_invoice()

le4.calc_value()
le4.project.increment_subtotal(le4.value_in_curr_of_rate)
le4.project.increment_converted_subtotal(le4.value_in_curr_of_inv)
le4.project.create_invoice()




