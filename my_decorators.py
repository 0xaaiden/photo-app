from datetime import datetime
import json
from typing import Dict
from flask import Response, request
from views import can_view_post
from models import Bookmark, LikePost

# # Decorator Format:
# # https://realpython.com/primer-on-python-decorators/

# #########################################
# # Example 1: Functions can be arguments #
# #########################################
# # Say you have two greetings and you want a 
# # convenient way to use either:

# def greeting1(name):
#     return f"Hello {name}"

# def greeting2(name):
#     return f"What up {name}"

# def greet(greeter_func, name):
#     print(greeter_func(name))

# greet(greeting1, 'Bob')
# greet(greeting2, 'Maria')


# ###########################################
# # Example 2: Functions can be defined and # 
# # invoked inside of other functions.      #
# ###########################################
# def parent():
#     print("Printing from the parent() function")

#     def first_child():
#         print("Printing from the first_child() function")

#     def second_child():
#         print("Printing from the second_child() function")

#     second_child()
#     first_child()

# parent()


# ###############################
# # Example 3: Functions can be # 
# # returned and invoked later. #
# ###############################
# def parent(num):
#     def first_child():
#         return "Hi, I am Emma"

#     def second_child():
#         return "Call me Liam"

#     if num == 1:
#         return first_child
#     else:
#         return second_child

# f1 = parent(1)
# f2 = parent(2)

# print(f1)
# print(f2)
# print(f1())
# print(f2())

# ###################################
# # Example 4: Your First Decorator #
# ###################################
# '''
# * A decorator takes a function as an argument, 
#   and then wraps some functionality around it.
# * Useful for error checking and security
# '''
# def my_decorator(func):
#     def wrapper():
#         print("Something is happening before the function is called.")
#         func()
#         print("Something is happening after the function is called.")
#     return wrapper

# def say_hi():
#     print('Hi')

# def say_bye():
#     print('Bye')

# say_hi_plus_extras = my_decorator(say_hi)
# say_bye_plus_extras = my_decorator(say_bye)

# print(say_hi_plus_extras)
# print(say_bye_plus_extras)
# say_hi_plus_extras()
# say_bye_plus_extras()


# ################################
# # Example 5: "Syntactic Sugar" #
# ################################
# def my_decorator(func):
#     def wrapper():
#         print("Something is happening before the function is called.")
#         func()
#         print("Something is happening after the function is called.")
#     return wrapper

# @my_decorator
# def say_hi():
#     print('Hi')

# @my_decorator
# def say_bye():
#     print('Bye')

# print(say_hi)
# print(say_bye)
# say_hi()
# say_bye()


# ############################
# # Example 6: args & kwargs #
# ############################
# '''
# Sometimes you want to use a decorator but you don't know 
# how many arguments the inner function will have. If this
# is the case, you can use "args" and "kwargs".

# * args hold a list of any positional parameters
# * kwargs hold a dictionary of any keyword parameters.

# Using this strategy, you can apply your decorator to
# multiple functions with different function signatures. 
# '''
# def security(func):
#     def wrapper(username, *args, **kwargs):
#         if username == 'sjv':
#             # pass all of the arguments to the inner function
#             func(username, *args, **kwargs)
#         else:
#             print('Unauthorized')
#     return wrapper

# @security
# def query_users(username, limit=5, order_by='last_name'):
#     print('filter criteria:', username, limit, order_by)

# @security
# def query_posts(username, before_date=datetime.now()):
#     print('filter criteria:', username, before_date)

# print('\nquerying users table...')
# query_users('sjv', limit=10)

# print('\nquerying posts table...')
# query_posts('hjv4599')


# #######################################
# # Example 7: Flask + SQL Alchemy Demo #
# #######################################
# def id_is_integer_or_400_error(func):
#     def wrapper(self, id, *args, **kwargs):
#         try:
#             int(id)
#             return func(self, id, *args, **kwargs)
#         except:
#             return Response(
#                 json.dumps({'message': '{0} must be an integer.'.format(id)}), 
#                 mimetype="application/json", 
#                 status=400
#             )
#     return wrapper

def handle_db_insert_error_like(func):
    def wrapper(self, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except:
            import sys
            db_message = str(sys.exc_info()[1]) # stores DB error message
            print(db_message)                   # logs it to the console
            message = 'Database Insert error. Make sure your post data is valid.'
            post_data= {}
            print(args)
            post_data["post_id"] = args[0]
            post_data['user_id'] = self.current_user.id
            response_obj = {
                'message': message, 
                'db_message': db_message,
                'post_data': post_data
            }
            # if int(post_data['post_id']) and not(can_view_post(post_data['post_id'], post_data['user_id'])):
            #     return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
    return wrapper

def handle_db_insert_error(func):
    def wrapper(self, *args, **kwargs):
        try:
            return func(self, *args, **kwargs)
        except:
            import sys
            db_message = str(sys.exc_info()[1]) # stores DB error message
            print(db_message)                   # logs it to the console
            message = 'Database Insert error. Make sure your post data is valid.'
            post_data = request.get_json()
            post_data['user_id'] = self.current_user.id
            response_obj = {
                'message': message, 
                'db_message': db_message,
                'post_data': post_data
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
    return wrapper
    
def secure_like(endpoint_function):
    def outer_function_with_security_checks(self, post_id):
        # check for security and only execute function if
        # the security check passes:
        try:
            id = int(post_id)
        except:
            response_obj = {
                'message': 'You put a wrong id'
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        if can_view_post(post_id, self.current_user):
            return endpoint_function(self, post_id)
        else:
            response_obj = {
                'message': 'You don\'t have access to post_id={0}'.format(post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            
    return outer_function_with_security_checks

def secure_bookmark(endpoint_function):
    def outer_function_with_security_checks(self):
        # check for security and only execute function if
        # the security check passes:
        print('about to issue the post endpoint function....')
        body = request.get_json()
        post_id = body.get('post_id')
        if can_view_post(post_id, self.current_user):
            return endpoint_function(self)
        else:
            response_obj = {
                'message': 'You don\'t have access to post_id={0}'.format(post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
            
    return outer_function_with_security_checks
    
def is_valid_comm(func):
    def wrapper(self):
        try:
            body = request.get_json()
            text = body.get("text")
            print('hiiiiii ', text)
            if text == None:
                return Response(json.dumps({"message": "Invalid"}), mimetype="application/json", status=400)
            id = int(body.get('post_id'))
        except: 
            response_obj = {
                "message": "Invalid comment"
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return func(self)
    return wrapper

def is_valid_int(func):
    def wrapper(self):
        body = request.get_json()
        try:
            if body.get("post_id"):
                id = int(body.get('post_id'))
            if body.get("user_id"):
                id = int(body.get("user_id"))
        except: 
            response_obj = {
                "message": "Invalid id"
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return func(self)
    return wrapper
def is_valid_int_bk(endpoint_function):
    def outer_function_with_security_checks(self):
        try:
            body = request.get_json()
            post_id = body.get('post_id')
            post_id = int(post_id)
        except:
            response_obj = {
                'message': 'Invalid post_id={0}'.format(post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return endpoint_function(self)
    return outer_function_with_security_checks
def is_valid_int_following(func):
    def wrapper(self):
        body = request.get_json()
        try:
            if body.get("post_id"):
                id = int(body.get('post_id'))
            if body.get("user_id"):
                id = int(body.get("user_id"))
        except: 
            response_obj = {
                "message": "Invalid id= {0}".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        return func(self)
    return wrapper
def is_valid_int_delete(func):
    def wrapper(self, id):
        try:
            id = int(id)
        except: 
            response_obj = {
                "message": "Invalid id= {0}".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return func(self,id)
    return wrapper

def is_valid_int_delete_like(func):
    def wrapper(self, post_id, id):
        try:
            postid = int(post_id)
            id = int(id)
        except: 
            response_obj = {
                "message": "Invalid id= {0} or postid = {1}".format(id, post_id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=400)
        return func(self,post_id, id)
    return wrapper
def check_ownership(func):
    def wrapper(self, id):
        try:
            bookmark = Bookmark.query.get(id)
            print(self.current_user.id, bookmark.user_id)
            if (bookmark.user_id == self.current_user.id):
                return func(self, id)
            else:
                response_obj = {
                    "message": "You did not create bookmark id= {0}".format(id)
                }
                return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        except: 
            response_obj = {
                "message": "Invalid post_id= {0}".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
    return wrapper
