'use strict';

module.exports = {// 来回复以下
  // 这是一张数据表迁移文件(还有一种是数据表更改文件?添加更改删除东西的，用命令可以调出来)
  // 不要担心这些文件会重复使用，在数据库是存在记录的，还可以undo这个记录
  up: (queryInterface, Sequelize) => {
    const { INTEGER, STRING, DATE, ENUM, TEXT } = Sequelize;
    return queryInterface.createTable('category', {// 建表操作
      id: {
        type: INTEGER(20),
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: STRING(100),
        allowNull: false,
        defaultValue: '',
        comment: '分类名称'
      },
      cover: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
        comment: '分类图标'
      },
      desc: {
        type: TEXT,
        allowNull: false,
        defaultValue: '',
        comment: '分类描述',
      },
      created_time: DATE,
      updated_time: DATE,
      deleted_time: DATE,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('category');// 弃表操作
  }
};