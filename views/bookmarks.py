from flask import Response, request
from flask_restful import Resource
from models import Bookmark, db
import json
from . import can_view_post
from my_decorators import is_valid_int_bk, is_valid_int_delete, secure_bookmark, handle_db_insert_error, check_ownership
import flask_jwt_extended
class BookmarksListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    @flask_jwt_extended.jwt_required()
    def get(self):
        bookmarks = Bookmark.query.filter_by(user_id = self.current_user.id)
        
        data = [ bookmark.to_dict() for bookmark in bookmarks]
        return Response(json.dumps(data), mimetype="application/json", status=200)

    @flask_jwt_extended.jwt_required()
    @is_valid_int_bk
    @secure_bookmark
    @handle_db_insert_error
    def post(self):
        body = request.get_json()    
        post_id = body.get("post_id")
        current_user = self.current_user.id
        bookmark = Bookmark(current_user, post_id)

        db.session.add(bookmark)
        db.session.commit()
        return Response(json.dumps(bookmark.to_dict()), mimetype="application/json", status=201)
        
class BookmarkDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    @flask_jwt_extended.jwt_required()
    @is_valid_int_delete
    @check_ownership

    def delete(self, id):
        bkmark = Bookmark.query.get(id)
  

        Bookmark.query.filter_by(id=id).delete()
        db.session.commit()
        serialized_data = {
            'message': 'Bookmark {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)




def initialize_routes(api):
    api.add_resource(
        BookmarksListEndpoint, 
        '/api/bookmarks', 
        '/api/bookmarks/', 
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )

    api.add_resource(
        BookmarkDetailEndpoint, 
        '/api/bookmarks/<id>', 
        '/api/bookmarks/<id>',
        resource_class_kwargs={'current_user': flask_jwt_extended.current_user}
    )
