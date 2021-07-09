// app/model/video_detail.js
module.exports = app => {
    const { STRING, BOOLEAN, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    const Follow = app.model.define('follow', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '关注者id'
        },
        follow_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '被关注者id',
        },
        created_time: DATE,
        updated_time: DATE,
        deleted_time: DATE,//本来想加入valid字段的想想又觉得麻烦还是算了
        // 这就不要随便添加
    });

    // *关联关系
    Follow.associate = function (models) {
        // 用user_id关联查出这个粉丝(关注者)是谁
        Follow.belongsTo(app.model.User, {
            foreignKey: 'user_id',
            as: "user_fan"
        });
        // 用follow_id关联查出这个被关注者是谁
        Follow.belongsTo(app.model.User, {
            foreignKey: 'follow_id',
            as: "user_follow"
        });
    }

    return Follow;
};