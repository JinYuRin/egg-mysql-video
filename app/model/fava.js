// app/model/video_detail.js
module.exports = app => {
    const { STRING, BOOLEAN, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    const Fava = app.model.define('fava', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '用户id'
        },
        video_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '视频id'
        },
        valid: {
            type: BOOLEAN,
            allowNull: false,
            defaultValue: 1,// 默认是收藏
            comment: '是否收藏',
        },
        created_time: DATE,
        updated_time: DATE,
        deleted_time: DATE,
        // 这就不要随便添加
    });

    // *关联关系
    Fava.associate = function (models) {
        //* 关联视频 belongsTo属于多对一
        // 多条收藏的记录属于一个用户
        // 多条收藏的记录属于一个视频
        Fava.belongsTo(app.model.User);
        Fava.belongsTo(app.model.Video);
    }

    return Fava;
};