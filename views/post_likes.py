from flask import Response, request
from flask_restful import Resource
from models import LikePost, db
import json
from . import can_view_post
from my_decorators import is_valid_int,secure_like,handle_db_insert_error,handle_db_insert_error_like, is_valid_int, is_valid_int_delete_like;
import flask_jwt_extended
class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @secure_like
    @handle_db_insert_error_like
    def post(self, post_id):
        body = request.get_json()
        print(body)
        user_id = self.current_user.id
        like = LikePost(user_id, post_id)
        db.session.add(like)
        db.session.commit()
        return Response(json.dumps(like.to_dict()), mimetype="application/json", status=201)

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
        
    @flask_jwt_extended.jwt_required()
    @is_valid_int_delete_like
    def delete(self, post_id, id):
        likeid = LikePost.query.get(id)
        if not likeid or likeid.user_id != self.current_user.id:
            return Response(json.dumps({'message': "Like does not exist"}), mimetype="application/json", status=404)
        
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        data = {
            'message': "Like {0} has been deleted.".format(id)
        }
        return Response(json.dumps(data), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/<post_id>/likes', 
        '/api/posts/<post_id>/likes/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/<post_id>/likes/<id>', 
        '/api/posts/<post_id>/likes/<id>/',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
