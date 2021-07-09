'use strict';

const Controller = require('egg').Controller;
const FileController = require('./file');
//	为什么不能用import和export语法呢
// 由于历史遗留问题导致node不支持，非要使用时要使用babel，估计vue项目里面已经使用了babel了
/**
 * !警告
 * &我的函数
 * ^stuff
 * ?问题
 * *高亮
 * ~箭头函数
 * TODO待做
 */
class HomeController extends Controller {
    async index() {
        const {
            ctx, app
        } = this;
        const name = ctx.query.name;
        const id = ctx.params.id;
        // ctx.status = 200;
        // ctx.body = `name是${name}，id为${id},状态码为${ctx.status}`;
        // ctx.throw('故意出错', 404)
        ctx.apiSuccess({ data: `name是${name}，id为${id}`, code: 201 });
        // ctx.status = 404;
        // *默认临时重定向 302
        // this.ctx.redirect('/admin/add');
    }
}

module.exports = HomeController;
