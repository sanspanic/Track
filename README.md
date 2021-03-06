# TRACK
### :hourglass: Timekeeping & invoice generation for international contractors


Link to deployed app: [TRACK](https://track-work-logger.herokuapp.com/).

Track is my first project, submitted as part of the [Springboard Software Engineering Bootcamp](https://www.springboard.com/). 

The tool is meant for self-employed contractors who work on an hourly basis. Its features include: 
 
* Time-keeping across multiple projects and clients
* Automatic conversion of work hours into money earned
* If invoicing in foreign currency: __fair__ conversion of money earned into foreign currency _on the day work was done_, rather than bulk conversion at the end of invoice period susceptible to exchange rate fluctuations
* Automatic PDF invoice generation including optional extra charge, discount and VAT



# Technologies 

### :snake: Python Backend

1. Flask
2. PostgreSQL
3. Flask-SQLAlchemy
4. [WTForms](https://wtforms.readthedocs.io/en/2.3.x/fields/)
5. [Forex-python](https://forex-python.readthedocs.io/en/latest/index.html)
6. [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/en/latest/)

### :bee: JavaScript Frontend
1. Almost exclusively vanilla JS for DOM Manipulation, minimal jQuery
2. Bootstrap
3. [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
4. Axios

# Credits

1. Icons by [phosphor](https://phosphoricons.com/)
2. SVG background by [BGjar](https://bgjar.com/)
3. Illustrations by [pixeltrue](https://www.pixeltrue.com/)


# Screenshots

### Landing Page. 
![Landing Page](./README_imgs/landing.png)
### Registration Page.
![Registration Page](./README_imgs/signup.png)
### Projects View.
![Projects Page](./README_imgs/projects.png)
### User Info View.
![User info Page](./README_imgs/user_info.png)
### Invoice View.
![Invoice Page](./README_imgs/invoice.png)
### Track View.
![Track Page](./README_imgs/track.png) 






