// video_play
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, BOOLEAN, STRING, DATE, ENUM, TEXT } = Sequelize;
    return queryInterface.createTable('fava', {
      id: {
        type: INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {// *设置物理外键还可以使得User删除时删除这个Fava
        // ?那么问题来了,软删除会出现什么情况
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '用户id',
        references: {// 外键映射
          model: 'user',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'restrict', // 更新时操作
      },
      video_id: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '视频id',
        references: {
          model: 'video',
          key: 'id'
        },
        onDelete: 'restrict',
        onUpdate: 'restrict', // 更新时操作
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
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('fava');
  }
};