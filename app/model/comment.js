// app/model/comment.js
module.exports = app => {
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
    const Comment = app.model.define('comment', {
        id: {
            type: INTEGER(20),
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: TEXT,// 长字符串要用TEXT,不过需要校验成具有一定长度的评论才行
            allowNull: false,
            defaultValue: '',
            comment: '评论内容'
        },
        video_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '视频id',

            onDelete: 'cascade',
            onUpdate: 'restrict', // 更新时操作
        },
        user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '用户id',
            references: {
                model: 'user',
                key: 'id'
            },
            onDelete: 'cascade',
            onUpdate: 'restrict', // 更新时操作
        },
        //  !把评论和回复做到一起了，用reply_user_id和reply_id标记是否属于reply
        reply_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '回复id',// *是指所回复的评论的id，可以通过Comment.hasMany(app.model.Comment...证明
        },
        reply_user_id: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '回复用户id'
        },
        created_time: DATE,
        updated_time: DATE,
        deleted_time: DATE,
    });

    // 关联关系
    Comment.associate = function (models) {
        // 关联作者
        // *指定关系通过区别名as和foreignKey来得到对同个model的不同关系
        // ?但逻辑外键是不是只能foreignKey对应被维护端的id呢，还是说默认使用了被维护端的id
        // ?你看在model和迁移文件设置了物理外键 貌 似 可以对应非主键啊references: {model: 'video',key: 'id'}
        Comment.belongsTo(app.model.User, {
            foreignKey: 'user_id',
            as: "send_user"
        });
        // 关联被回复人
        Comment.belongsTo(app.model.User, {
            foreignKey: 'reply_user_id',
            as: "reply_user"
        });
        // 关联视频
        // !物理外键无需在指定关系时指定外键
        Comment.belongsTo(app.model.Video);

        // 关联回复
        // !逻辑外键无则用foreignKey
        Comment.hasMany(app.model.Comment, {
            // ?as: "reply_user"如果没有as的话，会自动使用什么，貌似是model的小写名
            foreignKey: 'reply_id',
        });
    }

    return Comment;
};