'use strict';

const Controller = require('egg').Controller;
//	为什么不能用import和export语法呢
// 由于历史遗留问题导致node不支持，非要使用时要使用babel，估计vue项目里面已经使用了babel了

class CategoryController extends Controller {
    /**
     * 测试接口，查询所有分类
     */
    async index() {
        const {
            ctx, app
        } = this;
        let rows = await ctx.model.Category.findAll()
        ctx.apiSuccess(rows)
    }
}

module.exports = CategoryController;
