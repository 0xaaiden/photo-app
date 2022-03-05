from flask import (
    request, make_response, render_template, redirect
)
from models import User
import flask_jwt_extended

def logout():
    # hint:  https://dev.to/totally_chase/python-using-jwt-in-cookies-with-a-flask-app-and-restful-api-2p75
    resp = make_response(redirect("/login"))
    flask_jwt_extended.unset_jwt_cookies(resp)
    return resp

def login():
    if request.method == 'POST':
        username = request.form["username"]
        password = request.form["password"]
        if (not username) or (not password):
            return render_template(
                'login.html', 
                message='Missing username / password'
        )
        user= User.query.filter_by(username = username).one_or_none()
        print(user)
        if user:
            if user.check_password(password):
                print("yay")
                access_token = flask_jwt_extended.create_access_token(identity = user.id)
                resp = make_response(redirect("/"))
                flask_jwt_extended.set_access_cookies(resp, access_token)
                return resp
            else: 
                return render_template(
                    'login.html', 
                    message='Bad password')
    
        # authenticate user here. If the user sent valid credentials, set the
        # JWT cookies:
        # https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
        else:
            return render_template(
                'login.html',
                message="Username invalid"
            )
    else:
        return render_template(
            'login.html'
        )
def initialize_routes(app):
    app.add_url_rule('/login', 
        view_func=login, methods=['GET', 'POST'])
    app.add_url_rule('/logout', view_func=logout)