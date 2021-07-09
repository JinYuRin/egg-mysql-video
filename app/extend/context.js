// app/extend/context.js
'use strict';
/**
 * 拓展ctx的方法 this指向了ctx
 */
module.exports = {
  // 分页查询
  async page(model, where, options = {}) {
    let page = this.params.page ? parseInt(this.params.page) : 1;
    // 实际上page被校验了，他肯定会有值的
    let limit = this.query.limit ? parseInt(this.query.limit) : 10;
    let offset = (page - 1) * limit;// 除掉前offset个

    // 给个默认排序
    if (!options.order) {
      options.order = [
        ['id', 'DESC']
      ];
    }

    return await model.findAll({
      where,
      offset,
      limit,
      ...options
    });
  },
  // 成功提示
  apiSuccess(data = '', msg = 'ok', code = 200) {
    this.body = { msg, data };//这些方法都可以自己改的
    console.log(this.body);
    this.status = code;
  },// 可以在此处直接引用这些方法this=ctx
  // &失败提示
  apiFail(data = '', msg = 'fail', code = 400) {
    this.body = { msg, data };
    this.status = code;
  },
};
