from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField
from wtforms.validators import DataRequired, Length

class UserAddForm(FlaskForm):
    """Form for adding users."""

    username = StringField('Username', validators=[DataRequired()])
    email = StringField('E-mail', validators=[DataRequired()])
    password = PasswordField('Password', validators=[Length(min=6), DataRequired()])
    f_name = StringField('First Name', validators=[DataRequired()])
    l_name = StringField('Last Name', validators=[DataRequired()])

class LoginForm(FlaskForm):
    """form for logging in""" 

    username = StringField("Username", 
                            validators=[DataRequired()])

    password = PasswordField("Password", 
                            validators=[DataRequired()])