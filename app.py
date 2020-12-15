import os
import requests
from flask import Flask, render_template, redirect, session, flash, g, jsonify, request, make_response
#from flask_debugtoolbar import DebugToolbarExtension
from models import connect_db, db, User, Project, LogEntry, Client, Invoice, BillingInfo
#from secrets import secret_key
import datetime
from forms import UserForm, LoginForm, ClientForm, ProjectForm, BillingInfoForm
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

#toolbar = DebugToolbarExtension(app)


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

def fail_auth_check(username):
    """function to run before most requests to perform security checks"""

    #not logged in or unauthorized: 
    if not g.user or username != g.user.username:
        return True

def perform_auth_measures(username): 
    #not logged in
    if not g.user:
        flash("Authentication required. Please login first.", "danger")
        return redirect("/login")
    #unauthorized
    elif username != g.user.username:
        flash("Unauthorized. You cannot perform this action with someone else's account.", "danger")
        return redirect(f'/user/{g.user.username}')

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

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        return render_template('user/homepage.html', user=g.user)
    
@app.route('/user/<username>/show')
def show_user(username):
    """show details for logged in user"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        return render_template('user/show.html', user=g.user)


@app.route('/user/<username>/edit', methods=['GET', 'POST'])
def edit_user(username):
    """edit details for logged in user"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
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

    if fail_auth_check(username):
        return perform_auth_measures(username)
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

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        return render_template('user/clients.html', user=g.user)

@app.route('/user/<username>/invoices', methods=['GET'])
def show_invoices(username):
    """shows all user's invoices"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        return render_template('user/invoices.html', user=g.user)

##############################################################################
# INVOICES ROUTES

@app.route('/<username>/invoice/<int:id>/delete', methods=['DELETE'])
def delete_invoice(username, id): 
    """deletes individual invoice based on id"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        invoice = Invoice.query.get_or_404(id)
        project_name = invoice.project.project_name
        db.session.delete(invoice)
        db.session.commit()

        return jsonify(message=f'Deleted invoice for {project_name}')

@app.route('/<username>/invoice/<int:invoice_id>', methods=['GET'])
def show_invoice(username, invoice_id): 
    """shows details of individual invoice"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        invoice = Invoice.query.get_or_404(invoice_id)
        return render_template('/invoice/show.html', invoice=invoice, user=g.user)

@app.route('/<username>/invoice/<int:invoice_id>/edit', methods=['PATCH'])
def edit_dates(username, invoice_id): 
    """updates date of issue and due date of invoice"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        invoice = Invoice.query.get_or_404(invoice_id)

        #handle edit of dates
        if request.json.get('dateOfIssue'): 

            date = request.json.get('dateOfIssue') #2020-12-08
            due_date = request.json.get('dueDate') #2020-12-15

            invoice.date = invoice.convert_date(date) 
            invoice.due_date = invoice.convert_date(due_date)

            db.session.commit()

            return make_response(invoice.serialize(), 200)
        #handle edit of extras
        elif not request.json.get('invoiceNr'): 

            extra = request.json.get('extra')
            discount = request.json.get('discount')
            VAT = request.json.get('VAT')

            invoice.handle_extras(extra, discount, VAT)

            db.session.commit()

            return make_response(invoice.serialize(), 200)
        #handle edit of invoice number
        else: 
            invoice.invoice_nr = request.json.get('invoiceNr')
            db.session.commit()

            return make_response(invoice.serialize(), 200)


##############################################################################
# CLIENTS ROUTES

@app.route('/<username>/client/<int:id>/delete', methods=['DELETE'])
def delete_client(username, id): 
    """deletes individual client based on id"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        client = Client.query.get_or_404(id)
        client_name = client.name
        db.session.delete(client)
        db.session.commit()

        return jsonify(message=f'Deleted client {client_name}')

@app.route('/<username>/client/new', methods=['GET', 'POST'])
def add_client(username):
    """adds new client"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:

        form = ClientForm()
        
        if form.validate_on_submit():

            client = Client(
                user_id=g.user.id, 
                name= form.name.data, 
                street= form.street.data, 
                postcode=form.postcode.data, 
                country=form.country.data,
                city=form.city.data
            )

            db.session.add(client)
            db.session.commit()

            flash(f'New client {client.name} was added', 'success')
            return redirect(f'/user/{g.user.username}/clients')

        return render_template('client/add.html', user=g.user, form=form)

@app.route('/<username>/client/<int:id>/edit', methods=['GET'])
def edit_client_form(username, id): 
    """show form to edit client of user based on id"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        form = ClientForm(obj=Client.query.get(id))
        client = Client.query.get_or_404(id)
        return render_template('client/edit.html', form=form, user=g.user, client=client)

@app.route('/<username>/client/<int:id>/edit', methods=['PUT'])
def edit_client(username, id): 
    """edit client of user based on id"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        client = Client.query.get_or_404(id)
        data = request.json

        client.name = data.get('name', client.name)
        client.street = data.get('street', client.street)
        client.postcode = data.get('postcode', client.postcode)
        client.city = data.get('city', client.city)
        client.country = data.get('country', client.country)

        db.session.commit()

        return jsonify({"client": client.serialize()}, {"message":'Client was successfully updated'})

 ##############################################################################
#  PROJECTS ROUTES

@app.route('/user/<username>/projects/edit', methods=['GET'])
def send_client_names(username): 
    """sends information about clients back to frontend to allow for editing"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        client_names = []
        for c in g.user.clients: 
            client_names.append(c.name)

        return jsonify({"names": client_names})

@app.route('/user/<username>/projects/edit', methods=['PUT'])
def edit_project_info(username): 
    """edits project information"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        data = request.json

        client_name = data.get('clientName')
        name = data.get('projectName')
        project_id = data.get('projectId')

        project = Project.query.get_or_404(project_id)

        def find_client_id():
            for client in g.user.clients: 
                if client.name == client_name: 
                    return client.id 

        project.project_name = name
        project.client_id = find_client_id()

        db.session.commit()
 
        return make_response({"message": f'{project.project_name} was successfully edited'}, 200)

@app.route('/user/<username>/projects/<int:id>/delete', methods=['DELETE'])
def delete_project(username, id): 
    """deletes project"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        project = Project.query.get_or_404(id)
        project_name = project.project_name
        db.session.delete(project)
        db.session.commit()

        return jsonify({"message":f"Deleted project {project_name}"})

@app.route('/<username>/project/new', methods=['GET', 'POST'])
def add_project(username):
    """adds new project to db"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        form = ProjectForm()

        client_choices = [(client.id, client.name) for client in g.user.clients]
        form.client_id.choices = client_choices

        if form.validate_on_submit(): 

            project = Project(
                user_id=g.user.id, 
                client_id= form.client_id.data, 
                project_name= form.project_name.data, 
                hourly_rate=form.hourly_rate.data, 
                curr_of_rate=form.curr_of_rate.data,
                curr_of_inv=form.curr_of_inv.data
            )

            db.session.add(project)
            db.session.commit()

            flash(f'New project {project.project_name} was added', 'success')
            return redirect(f'/user/{username}')

        return render_template('/project/new.html', user=g.user, form=form)

@app.route('/<username>/project/<int:project_id>/track', methods=['GET'])
def track_project(username, project_id): 
    """interface to track time for project and add log entry"""
    
    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        project = Project.query.get_or_404(project_id)
        return render_template('project/track.html', user=g.user, project=project)

@app.route('/<username>/project/<int:project_id>/create-invoice', methods=['POST'])
def create_invoice(username, project_id): 

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        project = Project.query.get_or_404(project_id)
        invoice = project.create_invoice()

        response = invoice.serialize()
        #get client name for rendering new row on front-end
        project = Project.query.get_or_404(invoice.project_id)
        client = Client.query.get_or_404(project.client_id)

        response['message'] = 'New invoice was successfully created.'
        response['client_name'] = f'{client.name}'
        return make_response(response, 200)

 ##############################################################################
#  LOG_ENTRY ROUTES

@app.route('/<username>/project/<project_id>/logentry/new', methods=['POST'])
def add_log_entry(username, project_id): 
    """adds new log entry with only start time which defaults to now via models"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        log_entry = LogEntry(
            project_id=project_id, 
            start_time=datetime.datetime.now()
        )
        db.session.add(log_entry)
        db.session.commit()

        response = log_entry.serialize()
        response['message'] = 'New log entry was successfully created.'

        return make_response(response, 201)

@app.route('/<username>/project/<int:project_id>/logentry/<int:log_entry_id>/update', methods=['PATCH'])
def update_log_entry(username, project_id, log_entry_id): 
    """updates new log entry with end time, and handles post-hoc edit of date & times"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        log_entry = LogEntry.query.get_or_404(log_entry_id)

        #if request is to update stop_time only

        if not request.json:

            log_entry.stop_time = datetime.datetime.now()
            log_entry.calc_value()

            #also update project totals
            log_entry.project.increment_subtotal(log_entry.value_in_curr_of_rate)
            log_entry.project.increment_converted_subtotal(log_entry.value_in_curr_of_inv)
            db.session.commit()

            response = log_entry.serialize()
            response['message'] = 'Stop time was successfully added.'

            return make_response(response, 200)

        #if request is to edit date & time post-hoc

        else: 
            data = request.json

            log_entry.handle_edit(data)
            db.session.commit()

            response = log_entry.serialize()
            response['message'] = 'Log entry details were successfully edited.'

            return make_response(response, 201)

@app.route('/<username>/project/<int:project_id>/logentry/<int:log_entry_id>/delete', methods=['DELETE'])
def delete_log_entry(username, project_id, log_entry_id): 
    """deletes log entry record"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        log_entry = LogEntry.query.get_or_404(log_entry_id)

        #update subtotals of project by subtracting value of log entry
        log_entry.project.subtotal -= log_entry.value_in_curr_of_rate
        if log_entry.project.converted_subtotal: 
            log_entry.project.converted_subtotal -= log_entry.value_in_curr_of_inv

        response = log_entry.serialize()

        db.session.delete(log_entry)
        db.session.commit()

        response['message'] = 'Log entry was successfully deleted.'

        return make_response(response, 200)
        
#BILLING INFO ROUTES 

@app.route('/<username>/billing-info/new', methods=['GET', 'POST'])
def new_billing_details(username): 
    """adds new billing details"""

    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        form = BillingInfoForm()

        if form.validate_on_submit(): 

            bi = BillingInfo(
                IBAN=form.IBAN.data,
                name=form.name.data, 
                street=form.street.data, 
                city=form.city.data,
                postcode=form.postcode.data,
                country=form.country.data,
                phone=form.phone.data,
                email=form.email.data,
                user_id = g.user.id
                  )
            db.session.add(bi)
            db.session.commit()


            flash(f'New billing details were saved', 'success')
            return redirect(f'/user/{username}/show')

        return render_template('billing_info/new.html', form=form, user=g.user)

@app.route('/<username>/billing_info/<int:billing_info_id>', methods=['GET'])
def get_billing_details(username, billing_info_id): 
    """retrieves details about billing info based on id to populate form with"""    
    
    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        billing_info = BillingInfo.query.get_or_404(billing_info_id)

        response = billing_info.serialize()
        return make_response(response, 200)


@app.route('/<username>/billing-info/<int:billing_info_id>/delete', methods=['DELETE'])
def delete_billing_details(username, billing_info_id): 
    """deletes billing info entry"""    
    
    if fail_auth_check(username):
        return perform_auth_measures(username)
    else:
        bi = BillingInfo.query.get_or_404(billing_info_id)

        db.session.delete(bi)
        db.session.commit()

        response = {'message': 'Billing details successfully deleted'}
        return make_response(response, 200)