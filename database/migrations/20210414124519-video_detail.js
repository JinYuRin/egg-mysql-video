// video_detail
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, ENUM, TEXT } = Sequelize;
    return queryInterface.createTable('video_detail', {
      id: {
        type: INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: STRING(100),
        allowNull: false,
        defaultValue: '',
        comment: '子标题'
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
      url: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
        comment: '视频链接'
      },
      desc: {
        type: TEXT,
        allowNull: false,
        defaultValue: '',
        comment: '子描述',
      },
      created_time: DATE,
      updated_time: DATE,
      deleted_time: DATE,

    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('video_detail');
  }
};