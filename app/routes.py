from flask import render_template, Blueprint

frontend = Blueprint('frontend', __name__)

@frontend.route('/')
def index():
    return render_template('index.html')
