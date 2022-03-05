from flask import Response, request
from flask_restful import Resource
from models import User
from . import get_authorized_user_ids, get_authorized_users
import json
import flask_jwt_extended

class SuggestionsListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    @flask_jwt_extended.jwt_required()
    def get(self):
        all_usrs = User.query.all()
        list_id = [usr for usr in all_usrs]
        authorized = get_authorized_users(self.current_user)
        print(authorized)
        main_list = set(list_id) - set(authorized)
        print(main_list)
        data = [user.to_dict() for user in main_list]
        return Response(json.dumps(data[0:7]), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        SuggestionsListEndpoint, 
        '/api/suggestions', 
        '/api/suggestions/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
