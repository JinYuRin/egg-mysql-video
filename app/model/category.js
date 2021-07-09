// app/model/category.js
module.exports = app => {
    // 建立模型，内容和数据表迁移差不多
    const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
  
    const Category = app.model.define('category', {
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
  
    return Category;
  };