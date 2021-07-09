'use strict';

const Controller = require('egg').Controller;
//	为什么不能用import和export语法呢
// 由于历史遗留问题导致node不支持，非要使用时要使用babel，估计vue项目里面已经使用了babel了

class FollowController extends Controller {
    /**
     * 测试接口，查询所有follow
     */
    async index() {
        const {
            ctx, app
        } = this;
        let rows = await ctx.model.Follow.findAll()
        ctx.apiSuccess(rows)
    }
    /**
     * 关注接口
     */
    async follow() {
        const {
            ctx, app, service
        } = this;
        // 1.校验参数
        ctx.validate({
            follow_id: {
                type: 'int',
                required: true,
                desc: '被关注者id'
            }
        })
        // 2.提取参数
        let user_id = ctx.authUser.id
        let { follow_id } = ctx.request.body
        // 3.由于使用了物理外键，如果写入数据库时follow_id没有对应的user记录就会失败，严谨一点的话还是先验证吧
        // !脏读幻读不可重复读之类的数据库事务，后端查询事务方法以及count分组之类的都可以放着
        let follow = await ctx.model.Follow.findOne({
            where: {
                user_id,
                follow_id
            }
        })
        if (follow) {
            ctx.throw(400, '你已经关注过该用户')
        }
        // 用户是否存在
        if (!await service.user.exist(follow_id)) {
            return ctx.apiFail('对方不存在');
        }
        follow = await ctx.model.Follow.create({
            user_id,
            follow_id
        })
        ctx.apiSuccess({ status: true, follow })
    }
    /**
     * 取关接口
     */
    async unfollow() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        ctx.validate({
            follow_id: {
                type: 'int',
                required: true,
                desc: '被关注者id'
            }
        })
        // 2.提取参数
        let user_id = ctx.authUser.id
        let { follow_id } = ctx.request.body
        // 3.由于使用了物理外键，如果写入数据库时follow_id没有对应的user记录就会失败，严谨一点的话还是先验证吧
        // !脏读幻读不可重复读之类的数据库事务，后端查询事务方法以及count分组之类的都可以放着
        let follow = await ctx.model.Follow.findOne({
            where: {
                user_id,
                follow_id
            }
        })
        if (!follow) {
            ctx.throw(400, '你还没关注他呢')
        }
        await follow.destroy()
        ctx.apiSuccess({ status: true, msg: '取消关注成功' })
    }
    // 我的关注列表
    async follows() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        // 2.提取参数
        let user_id = ctx.authUser.id
        // 3.由于使用了物理外键，如果写入数据库时follow_id没有对应的user记录就会失败，严谨一点的话还是先验证吧
        // !脏读幻读不可重复读之类的数据库事务，后端查询事务方法以及count分组之类的都可以放着
        // let follows = await ctx.model.Follow.findAll({
        //     user_id,//仔细一想，findAll默认第一参数是where啊，用page吧
        // })
        let follows = await ctx.page(ctx.model.Follow, { user_id }, {
            include: [{
                model: app.model.User,// 原来include就已经是产生物理外键的关联了,这里默认找关联的作品了
                as: 'user_follow',
                attributes: ['id', 'username', 'nickname', 'avatar']// 查询部分字段可以减少内存消耗
                // where: {
                //     id: fava.video_id// 这样写肯定不行
                // 如果没有物理外键是不是要在这里指定外键呢，又该怎么指定呢,毕竟你拿不到每一个fava的video_id
                // }
            }]
        })
        // 本来想加入空follows判断还是算了
        follows = follows.map(item => {
            return {
                id: item.user_follow.id,
                name: item.user_follow.nickname || item.user_follow.username,
                avatar: item.user_follow.avatar
            }
        })
        ctx.apiSuccess(follows)
    }
    // 我的粉丝列表
    async fans() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        // 2.提取参数
        let user_id = ctx.authUser.id
        // 3.由于使用了物理外键，如果写入数据库时follow_id没有对应的user记录就会失败，严谨一点的话还是先验证吧
        // !脏读幻读不可重复读之类的数据库事务，后端查询事务方法以及count分组之类的都可以放着
        // let follows = await ctx.model.Follow.findAll({
        //     user_id,//仔细一想，findAll默认第一参数是where啊，用page吧
        // })
        let follows = await ctx.page(ctx.model.Follow, { user_id }, {
            include: [{
                model: app.model.User,// 原来include就已经是产生物理外键的关联了,这里默认找关联的作品了
                as: 'user_fan',
                attributes: ['id', 'username', 'nickname', 'avatar']// 查询部分字段可以减少内存消耗
                // where: {
                //     id: fava.video_id// 这样写肯定不行
                // 如果没有物理外键是不是要在这里指定外键呢，又该怎么指定呢,毕竟你拿不到每一个fava的video_id
                // }
            }]
        })
        // 本来想加入空follows判断还是算了
        let fans = follows.map(item => {
            return {
                id: item.user_fan.id,
                name: item.user_fan.nickname || item.user_fan.username,
                avatar: item.user_fan.avatar
            }
        })
        ctx.apiSuccess(fans)
    }

}

module.exports = FollowController;
