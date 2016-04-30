/**
 * Created by wujinsong on 2016/4/30.
 */
var Promise = require('bluebird');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var form = require('../lib/form');
var _ = require('lodash');


module.exports = function (app) {
    var secret = app.get('config').secret;
    var UserModel = require('../lib/models')(app).UserModel;
    var UserCollection = require('../lib/collections')(app).UserCollection;

    return  {

        create:function (req,res,next) {
            var inForm = form.buildForm();
            var now = Date.now();

            inForm.parse(req,function (err, fields, files) {
                if(err) {
                    return next(err);
                }

                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(now.toString(36),salt);
                var type = 'author';
                var picture = files.picture;

                form.checkPicture(picture,function (error,picturePath) {
                    if(error) {
                        return next(error);
                    } else {
                        var cleanup = form.cleanup(picture,next);
                        new UserModel({
                             name: 'name',
                             password: 'password'
                        })
                            .save()
                            .then(function (author) {
                                res.status(200).json({
                                   success:true,
                                    data:author.omit('password')
                                });
                            })
                            .catch(cleanup);
                    }
                });

            });
        },
        list:function (req,res,next) {
            var Authors = new UserCollection().parseQuery(req,{where:{type:'name'}});

            Authors.fetch({
                columns:Authors.user_columns
            })
                .then(function (authors) {
                    res.status(200).json({
                       success:true,
                        data:authors
                    });
                })
                .catch(next);
        },
        show:function (req,res,next) {
            var Author = new UserModel({
                id: req.params.id;
            });

            Author.fetch({
                columns: Author.user_columns,
                require: true
            })
                .then(function (author) {
                    res.status(200).json({
                       success:true,
                        data:author
                    });
                })
                .catch(next);
        },
        update:function (req,res,next) {
            var inForm = form.buildForm();

            inForm.parse(req,function (err, fields, files) {
                if(err) {
                    return next(err);
                }

                var picture = files.picture;
                form.checkPicture(picture,function (error,picturePath) {
                    if(error) {
                        return next(error);
                    } else {
                        var cleanup = form.cleanup(picture,next);
                        var User = new UserModel({
                            id:req.params.id;
                        });

                        var updateInfo = ({
                           name:fields.name;
                        }).omit(_.isUndefined).value();

                        User.authenticate(req,res)
                            .then(function (authed) {
                                User.save();
                            })
                    }
                })
            })
        }

    }
}