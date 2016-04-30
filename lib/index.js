/**
 * Created by wujinsong on 2016/4/30.
 */
module.exports = function (app) {
    return {
        models:require('./models')(app),
        collections:require('./collections')(app),
        form: require('./form')
    };
};