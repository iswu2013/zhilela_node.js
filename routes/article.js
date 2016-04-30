/**
 * Created by wujinsong on 2016/4/25.
 */
var express = require("express");
var router = express.Router();

router.get('/',function(req,res,next){
    res.send("dd");
});

module.exports = router;