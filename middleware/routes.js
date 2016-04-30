/**
 * Created by wujinsong on 2016/4/30.
 */
var express = require('express');
var bodyParser = require('body-parser').urlencoded({extended:true});

module.exports = function (app) {
    var authUser = require('./authUser')(app);
    var models = require('../models')(app);

    return {
        v1:v1(models,authUser),
        views:views()
    };
};

function  views() {
    var router = express.Router();
}

function v1(models,authUser) {
    var router = express.Router();

    router.route('/user')
        .get(models.UserModel.list)
        .post(authUser(['user']),models.UserModel.create);

    router.route('/programingLanguage')
        .get(models.ProgramingLanguageModel.list)
        .post(authUser['user'],models.ProgramingLanguageModel.create)

    return router;
}