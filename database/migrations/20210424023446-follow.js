'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, ENUM, TEXT } = Sequelize;
    return queryInterface.createTable('follow', {
      id: {
        type: INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '关注者id',
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'restrict', // 更新时操作
      },
      // 原来物理外键是可以同时指向同一张表的啊
      // 物理外键和model里的关系没有什么关系，模型关系如果不指定外键会默认添加tab_id，这是egg的约定
      follow_id: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '被关注者id',
        references: {
          model: 'user',
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
    return queryInterface.dropTable('follow');
  }
};