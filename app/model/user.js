// app/model/user.js
'use strict';
// 引入// 加密
const crypto = require('crypto');
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    // 配置（重要：一定要配置详细，一定要！！！）
    const User = app.model.define('user', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true//自增
        },
        username: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '用户名',
            unique: true
        },
        nickname: {
            type: STRING(30),
            allowNull: false,
            defaultValue: '',
            comment: '昵称',
        },
        email: {
            type: STRING(160),
            allowNull: false,
            defaultValue: '',
            comment: '邮箱'
        },
        password: {
            type: STRING,
            allowNull: false,
            defaultValue: '',
            comment: "密码",
            // set进mysql的时候的值
            set(val) {// 如果需要验证就对传来的密码进行加密再和查到的密码比对就行了
                // 先设置加密规则hmac传入sha256加密模式和秘钥secret
                const hmac = crypto.createHash("sha256", app.config.crypto.secret);//app.config.crypto.secret在config中可以查到的
                // 加密
                hmac.update(val);
                // return hmac.digest("hex");获取加密后的值
                this.setDataValue('password', hmac.digest("hex"));
            }
        },
        avatar: {
            type: STRING,
            allowNull: true,
            defaultValue: '',
            comment: '头像'
        },
        phone: {
            type: STRING(11),
            allowNull: false,
            defaultValue: '',
            comment: '手机'
        },
        sex: {
            type: ENUM,
            values: ["男", '女', '保密'],
            allowNull: false,
            defaultValue: '男',
            comment: '性别'
        },
        desc: {
            type: TEXT,
            allowNull: false,
            defaultValue: '',
            comment: '个性签名',
        },
        created_time: DATE,// get的时候最好返回时间戳
        updated_time: DATE,
        deleted_time: DATE,
    });
    return User;
};
