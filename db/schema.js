/**
 * Created by wujinsong on 2016/4/30.
 */
module.exports = {
    users:{
        id:{
            type: 'increments',
            nullable: false,
            primary:true
        },
        name:{
            type:'string',
            maxLength: 50,
            nullable:false,
            unique:true
        },
        password:{
            type:'string',
            maxLength:255,
            unique:false
        }
    }
}