from flask import Flask, render_template, redirect, session, flash
from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db, User, Project, LogEntry, Client, Invoice
from secrets import secret_key
import datetime
#from forms import
#from sqlalchemy.exc import IntegrityError
#from werkzeug.exceptions import Unauthorized

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgres:///work_logger"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["SECRET_KEY"] = secret_key
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True

connect_db(app)

toolbar = DebugToolbarExtension(app)
