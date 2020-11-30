import os
from flask import Flask, render_template, redirect, session, flash, g
from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db, User, Project, LogEntry, Client, Invoice
from secrets import secret_key
import datetime
from forms import UserAddForm, LoginForm
from sqlalchemy.exc import IntegrityError
#from werkzeug.exceptions import Unauthorized

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = (os.environ.get('DATABASE_URL', "postgres:///work_logger")) 
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["SECRET_KEY"] = os.environ.get('SECRET_KEY', secret_key)
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False

connect_db(app)

toolbar = DebugToolbarExtension(app)

@app.route('/')
def home(): 
    if g.user: 
        return redirect(f'/user/{g.user.username}')
    else: 
        return render_template('home-anon.html')

@app.before_request
def add_user_to_g():
    """runs before each request. if logged in, adds curr user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
    else:
        g.user = None

def do_login(user):
    """Log in user."""

    session[CURR_USER_KEY] = user.id


def do_logout():
    """Logout user."""

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

##############################################################################
# AUTHENTICATION ROUTES

@app.route('/signup', methods=["GET", "POST"])
def signup():
    """Handle user signup.
    Create new user and add to DB. Redirect to home page.
    If form not valid, present form.
    If there already is a user with that username: flash message
    and re-render form.
    """

    form = UserAddForm()

    if form.validate_on_submit():
        try:
            user = User.register(
                username=form.username.data,
                pwd=form.password.data,
                email=form.email.data,
                first_name=form.f_name.data,
                last_name=form.l_name.data
            )

            db.session.add(user)
            db.session.commit()

        except IntegrityError:
            flash("Username already taken", 'danger')
            return render_template('user/signup.html', form=form)

        do_login(user)

        return redirect(f"/user/{user.username}")

    else:
        return render_template('user/signup.html', form=form)


@app.route('/login', methods=["GET", "POST"])
def login():
    """Handle user login."""

    form = LoginForm()

    if form.validate_on_submit():
        user = User.authenticate(form.username.data,
                                 form.password.data)

        if user:
            do_login(user)
            flash(f"Hello, {user.username}!", "success")
            return redirect(f"/user/{user.username}")

        flash("Invalid credentials.", 'danger')

    return render_template('user/login.html', form=form)


@app.route('/logout')
def logout():
    """Handle logout of user."""

    do_logout()

    flash('Bye!', 'success')
    return redirect('/')

##############################################################################
# USER ROUTES

@app.route('/user/<username>')
def homepage(username): 
    """show homepage for logged in user"""

    if g.user: 
        return render_template('user/homepage.html', user=g.user)
    else: 
        redirect('/')



