// video_play
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, ENUM, TEXT } = Sequelize;
    return queryInterface.createTable('video_play', {
      id: {
        type: INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      ip: {
        type: STRING(50),
        allowNull: false,
        defaultValue: 0,
        comment: 'ip地址'
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
        onDelete: 'cascade',
        onUpdate: 'restrict', // 更新时操作
      },
      created_time: DATE,
      updated_time: DATE,
      deleted_time: DATE,

    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('video_play');
  }
};