from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, IntegerField, FloatField, SelectField, RadioField
from wtforms.validators import DataRequired, Length
from forex import list_of_curr_codes

class UserForm(FlaskForm):
    """Form for adding users."""

    username = StringField('Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired()])
    first_name = StringField('First Name', validators=[DataRequired()])
    last_name = StringField('Last Name', validators=[DataRequired()])
    password = PasswordField('Password', validators=[Length(min=6), DataRequired()])

class LoginForm(FlaskForm):
    """form for logging in""" 

    username = StringField("Username", 
                            validators=[DataRequired()])

    password = PasswordField("Password", 
                            validators=[DataRequired()])

class ClientForm(FlaskForm):
    """form for adding client""" 

    name = StringField("Name", validators=[DataRequired()])
    street = StringField("Street")
    postcode = StringField("Postcode")
    city = StringField("City")
    country = StringField("Country")

choices = []
for code in list_of_curr_codes: 
    choices.append((code,code))

class ProjectForm(FlaskForm): 
    """form for adding a new project"""

    client_id = SelectField("Client name")
    project_name = StringField("Project name, e.g. 'Administration'")
    hourly_rate = FloatField("Hourly wage")
    curr_of_rate = SelectField("Select currency of wage", choices=choices)
    curr_of_inv = SelectField("Select currency you will invoice in", choices=choices)


class BillingInfoForm(FlaskForm): 
    """form for adding new billing details"""

    IBAN = StringField("IBAN")
    name = StringField("Name")
    street = StringField("Street")
    postcode = StringField("Postcode")
    city = StringField("City")
    country = StringField("Country")
    email = StringField("Email")
    phone = StringField("Phone")

