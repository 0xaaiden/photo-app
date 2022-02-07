from flask import Response, request
from flask_restful import Resource
from models import Following, User, db
import json
from my_decorators import handle_db_insert_error, is_valid_int_following, is_valid_int_delete;

def get_path():
    return request.host_url + 'api/posts/'

class FollowingListEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        following = Following.query.filter_by(user_id = 12)
        
        data = [
            item.to_dict_following() for item in following
        ]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    
    @handle_db_insert_error
    def post(self):
        body = request.get_json()    
        following = body.get("user_id")
        user_id = self.current_user.id
        follow = Following(user_id, following)
        db.session.add(follow)
        db.session.commit()
        return Response(json.dumps(follow.to_dict_following()), mimetype="application/json", status=201)
        

class FollowingDetailEndpoint(Resource):
    def __init__(self, current_user):
        self.current_user = current_user
    @is_valid_int_delete
    def delete(self, id):
        try:
            follow = Following.query.get(id)
        except:
            response_obj = {
                    "message": "There is a problem with the formatting id= {0}".format(id)
            }
            return Response(json.dumps(response_obj), mimetype="application/json", status=404)
        if not follow or follow.user_id != self.current_user.id:
            return Response(json.dumps({'message': 'Follow does not exist'}), mimetype="application/json", status=404)
       

        Following.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Follow {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        FollowingListEndpoint, 
        '/api/following', 
        '/api/following/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        FollowingDetailEndpoint, 
        '/api/following/<id>', 
        '/api/following/<id>/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
