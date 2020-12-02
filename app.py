import os
import requests
from flask import Flask, render_template, redirect, session, flash, g, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db, User, Project, LogEntry, Client, Invoice
from secrets import secret_key
import datetime
from forms import UserForm, LoginForm
from sqlalchemy.exc import IntegrityError
#from werkzeug.exceptions import Unauthorized

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    os.environ.get('DATABASE_URL', "postgres:///work_logger"))
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ECHO"] = True
app.config["SECRET_KEY"] = os.environ.get('SECRET_KEY', secret_key)
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = True

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

    form = UserForm()

    if form.validate_on_submit():
        try:
            user = User.register(
                username=form.username.data,
                pwd=form.password.data,
                email=form.email.data,
                first_name=form.first_name.data,
                last_name=form.last_name.data
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
    return redirect('/login')

##############################################################################
# USER ROUTES


@app.route('/user/<username>')
def homepage(username):
    """show homepage for logged in user"""

    if not g.user:

        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")
    elif username != g.user.username:

        flash("Unauthorized. You can only view your own account details.", "danger")
        return redirect(f'/user/{g.user.username}')
    else:

        return render_template('user/homepage.html', user=g.user)


@app.route('/user/<username>/show')
def show_user(username):
    """show details for logged in user"""

    if not g.user:

        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")
    elif username != g.user.username:

        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')
    else:
        return render_template('user/show.html', user=g.user)


@app.route('/user/<username>/edit', methods=['GET', 'POST'])
def edit_user(username):
    """edit details for logged in user"""

    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")

    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

    else:
        form = UserForm(obj=g.user)

        if form.validate_on_submit():

            user = User.query.get_or_404(g.user.id)

            user.username = form.username.data
            user.first_name = form.first_name.data
            user.last_name = form.last_name.data
            user.email = form.email.data

            db.session.commit()

            return redirect(f'/user/{user.username}/show')

        return render_template('user/edit.html', user=g.user, form=form)

@app.route('/user/<username>/delete', methods=['DELETE'])
def delete_user(username):
    """delete user"""

    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")

    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

    else:
        username = g.user.username
        db.session.delete(g.user)
        db.session.commit()

        do_logout()

        return jsonify(message=f'Deleted user {username}')

@app.route('/user/user-deleted', methods=['GET'])
def show_deletion():
    """show success of deletion and signup page"""

    return render_template('user/user-deleted.html')


@app.route('/user/<username>/clients', methods=['GET'])
def show_clients(username):
    """shows all user's clients"""

    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")

    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

    else: 
        return render_template('user/clients.html', user=g.user)

@app.route('/user/<username>/invoices', methods=['GET'])
def show_invoices(username):
    """shows all user's invoices"""

    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")

    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

    else: 
        return render_template('user/invoices.html', user=g.user)

##############################################################################
# INVOICES ROUTES

@app.route('/<username>/invoice/<int:id>/delete', methods=['DELETE'])
def delete_invoice(username, id): 
    """deletes individual invoice based on id"""

    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")

    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

    else: 
        invoice = Invoice.query.get_or_404(id)
        project_name = invoice.project.project_name
        db.session.delete(invoice)
        db.session.commit()

        return jsonify(message=f'Deleted invoice for {project_name}')
