from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField
from wtforms.validators import DataRequired, Length

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