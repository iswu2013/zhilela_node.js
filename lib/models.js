/**
 * Created by wujinsong on 2016/4/30.
 */
var Promise = require('bluebird');

module.exports = function (app) {
    var Bookshelf = app.get('Bookshelf');

    function authenticator (req, res) {
        var self = this;
        var authError = {
            status: 401,
            message: 'Unauthorized user'
        };
        var user = res.locals.auth.decoded;
        var authorized = res.locals.auth.authorized;
        var needsUserAuth = res.locals.auth.needsUserAuth;

        if (authorized) {
            // if user is authorized, per user authentication is not needed
            return true;
        } else if (needsUserAuth) {
            // check if the current user is the user being accessed by the route
            // check to see if user is allowed to access model
            return self.fetch({ require: true })
                .then(function(model) {
                    if (model && model.get('user_id')) {
                        // check to see if data being accessed belongs to user
                        if (model.get('user_id') == user.id) {
                            return true;
                        } else {
                            throw authError;
                        }
                    } else if (req.params.user_id && req.params.user_id == user.id) {
                        // check to see if user route being accessed belongs to user
                        // CAUTION: this may be insecure. Be careful when creating new routes with :user_id
                        return true;
                    } else {
                        throw authError;
                    }
                })
                .catch(function(error) {
                    if (error == authError) {
                        throw error;
                    } else if (req.params.user_id && req.params.user_id == user.id) {
                        return true;
                    } else {
                        throw error;
                    }
                });
        } else {
            throw authError;
        }
    }

    // default BaseModel
    var BaseModel = Bookshelf.Model.extend({
        // authenticate must be called on an instantiated model
        authenticate: Promise.method(authenticator),

        // columns to display when showing related users
        user_columns: [
            'id',
            'name',
            'password'
        ]
    });

    var ProgramingLanguageModel = BaseModel.extend({
        tableName: 'zhilela_programing_language',
        hasTimestamps: true,
        author: function(){
            return this.belongsTo(UserModel);
        }
    });

    var UserModel = BaseModel.extend({
       tableName: 'zhilela_user',
        hasTimestamps: true
    });

    return {
        ProgramingLanguageModel:ProgramingLanguageModel,
        UserModel:UserModel
    }
}