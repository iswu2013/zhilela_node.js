/**
 * Created by wujinsong on 2016/4/25.
 */
var express = require("express");
var router = express.Router();

router.get('/article',function(req,res,next){
    res.render("article",{title:"文章"});
});

module.exports = router;