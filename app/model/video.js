// app/model/video.js
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;

    const Video = app.model.define('video', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: STRING(100),
            allowNull: false,
            defaultValue: '',
            comment: '视频标题'
        },
        cover: {
            type: STRING,
            allowNull: true,
            defaultValue: '',
            comment: '视频封面'
        },
        category_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '分类id'
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '用户id'
        },
        duration: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '总时长'
        },
        desc: {
            type: TEXT,
            allowNull: false,
            defaultValue: '',
            comment: '视频描述',
        },
        created_time: {
            type: DATE,
            get() {
                return (new Date(this.getDataValue('created_time'))).getTime();
            }
        },
        play_count: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '播放量'
        },
        danmu_count: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '弹幕量'
        },
        updated_time: DATE,
        deleted_time: DATE,
    });

    // 关联关系
    Video.associate = function (models) {
        // 关联作者 belongsTo多对一
        Video.belongsTo(app.model.User);
        // 关联子视频 hasMany一对多 
        Video.hasMany(app.model.VideoDetail);
        // 如果不产生关联，无法在查询的时候使用include自动产生关联查询
    }

    return Video;
};