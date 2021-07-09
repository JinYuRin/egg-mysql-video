'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        const {INTEGER, STRING, DATE, ENUM, TEXT} = Sequelize;
        return queryInterface.createTable('user', {
            id: {
                type: INTEGER(20),
                primaryKey: true,
                autoIncrement: true
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
                comment: "密码"
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
            created_time: DATE,
            updated_time: DATE,
            deleted_time: DATE,

        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('user');
    }
};
