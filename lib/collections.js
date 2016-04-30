var Promise = require('bluebird');
var _ = require('lodash');
var moment = require('moment');


module.exports = function (app) {
    var Bookshelf = app.get('Bookshelf');
    var models = require('./models')(app);

    // this function is used to determine if the individual user
    // is able to perform an operation
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
            return self.fetchOne({ require: true })
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

    function dateRange (value, format) {
        var maxDate;

        switch (value) {
            // day
            case '1':
                maxDate = moment().subtract(1, 'days').format(format);
                break;
            // week
            case '2':
                maxDate = moment().subtract(1, 'week').format(format);
                break;
            // month
            case '3':
                maxDate = moment().subtract(1, 'month').format(format);
                break;
            // year
            case '4':
                maxDate = moment().subtract(1, 'year').format(format);
                break;
            default:
                maxDate = null;
        }

        return maxDate;
    }

    var BaseCollection = Bookshelf.Collection.extend({
        // authenticate must be called on an instantiated collection
        authenticate: Promise.method(authenticator),

        // columns to display when showing related users
        user_columns: [
            'id',
            'user_name',
            'type',
            'name',
            'sex',
            'birth_day',
            'birth_month',
            'birth_year',
            'picture',
            'occupation',
            'hospital',
            'department',
            'city',
            'announcement_author'
        ],

        parseQuery: function (req, defaultQuery) {
            var dbQuery = _.defaults(defaultQuery || {}, {
                limit: null,
                offset: null,
                sort: null,
                where: {},
                before: null,
                after: null
            });

            var formatStr = 'YYYY-MM-DD';

            if (!dbQuery.limit && req.query.limit) {
                dbQuery.limit = +req.query.limit;
                delete req.query.limit;
            }
            if (!dbQuery.offset && req.query.offset) {
                dbQuery.offset = +req.query.offset;
                delete req.query.offset;
            }
            if (!dbQuery.sort && req.query.sort) {
                dbQuery.sort = req.query.sort.split(',');
                delete req.query.sort;
            }
            if (!dbQuery.before && req.query.before) {
                dbQuery.before = moment(req.query.before).format(formatStr);
                delete req.query.before;
            }
            if (!dbQuery.after && req.query.after) {
                dbQuery.after = moment(req.query.after).format(formatStr);
                delete req.query.after;
            }

            // this is bad design
            if (!dbQuery.dateType && req.query.dateType) {
                dbQuery.after = dateRange(req.query.dateType, formatStr);
                delete req.query.dateType;
                dbQuery.before = null;
            }

            // this isn't secure
            dbQuery.where = _.defaults(dbQuery.where, req.query);

            return this.query(function (qb) {
                if (dbQuery.where) {
                    qb.where(dbQuery.where);
                }
                if (dbQuery.limit) {
                    qb.limit(dbQuery.limit);
                }
                if (dbQuery.offset) {
                    qb.offset(dbQuery.offset);
                }
                if (dbQuery.sort) {
                    qb.orderBy(dbQuery.sort[0], dbQuery.sort[1]);
                }
                if (dbQuery.before) {
                    qb.where('created_at', '<=', dbQuery.before);
                }
                if (dbQuery.after) {
                    qb.where('created_at', '>=', dbQuery.after);
                }
            });
        }
    });

    var ProgramingLanguageCollection = BaseCollection.extend({
        model: models.ProgramingLanguageModel
    });

    var UserCollection = BaseCollection.extend({
        model: models.UserModel
    });

    return {
        ProgramingLanguageCollection : ProgramingLanguageCollection,
        UserCollection         : UserCollection
    };
};
