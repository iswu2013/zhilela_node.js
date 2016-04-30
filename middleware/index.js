/**
 * Created by wujinsong on 2016/4/30.
 */

module.exports = function (app) {
    return {
        authUser : require('./authUser')(app),
        routes   : require('./routes')(app)
    };
};
