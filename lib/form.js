var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

module.exports = {

    buildForm : function () {
        var form = new formidable.IncomingForm();

        form.encoding = 'utf-8';
        form.uploadDir = path.join(__dirname + '/../public/images');
        form.keepExtensions = true;

        return form;
    },

    checkPicture : function (picture, callback) {
        if (!picture) {
            return callback();
        } else if (picture.type !== 'image/jpeg' && picture.type !== 'image/png' && picture.type !== 'image/gif') {
            fs.unlink(picture.path, function (error) {
                if (error) {
                    return callback(error);
                } else {
                    return callback({
                        status: 415,
                        message: 'Invalid file type'
                    });
                }
            });
        } else {
            return callback(null, picture.path.split('public')[1]);
        }
    },

    cleanup : function (picture, callback) {
        return function (error) {
            if (!picture) {
                return callback(error);
            } else {
                fs.unlink(picture.path, function (err) {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(error);
                    }
                });
            }
        };
    }
};
