from flask import Response, request
from flask_restful import Resource
from models import Following
import json
import flask_jwt_extended

def get_path():
    return request.host_url + 'api/posts/'

class ContactsListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    @flask_jwt_extended.jwt_required()
    def get(self):
        follower = Following.query.filter_by(following_id = self.current_user.id)
        following = Following.query.filter_by(user_id = self.current_user.id)
        contacts = []
        for item in follower:
            rez =  Following.query.filter_by(user_id = self.current_user.id, following_id = item.user_id).one_or_none()
            
            if rez: 
                print(rez, item.user_id, item.following_id, "and", rez.user_id, rez.following_id)
                print("found", rez)
                contacts.append(item.follower.to_dict())

        # print(data_follower)
        # print(data_following)
        return Response(json.dumps(contacts), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        ContactsListEndpoint, 
        '/api/contacts', 
        '/api/contacts/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
