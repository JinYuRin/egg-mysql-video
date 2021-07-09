'use strict';

const Controller = require('egg').Controller;
const rules = {
    video_id: {
        type: 'int',
        required: true,
        desc: '作品ID'
    }
}
class FavaController extends Controller {
    /**
     * 收藏操作
     * post请求，参数写进请求体
     */
    async video() {
        const {
            ctx, app
        } = this;
        // 1.进行校验
        ctx.validate(rules)
        // 2.提取参数
        const { video_id } = ctx.request.body
        // 2-5提取用户Id
        const user_id = ctx.authUser.id
        // 3.先查询该用户是否收藏了
        // 你可能会去想这个作品存不存在或者用户存不存在，但是作为物理外键，是不可能找不到映射值的，无须担心和额外查询
        let fava = await ctx.model.Fava.findOne({
            where: {
                video_id,
                user_id,
            }
        })
        // 数据库里的布尔值tinyint拿到后是布尔值来的，但是写入数据库就可以用0和1
        // 用了一个软删除导致我要增加valid字段
        // 判断最后操作的时间就靠updated_time了
        if (fava) {// 记录存在就要判断他的valid
            console.log(fava.valid)
            if (fava.valid) {// 收藏有效
                await fava.update({
                    valid: 0// 取消收藏
                })
                return ctx.apiSuccess({// 提前return不再走下去
                    status: true,
                    fava:false,
                    msg: "取消收藏成功"
                })
            } else {// 收藏无效 if (!fava.valid) 
                await fava.update({
                    valid: 1// 添加收藏
                })
                return ctx.apiSuccess({// 提前return不再走下去
                    status: true,
                    fava:true,
                    msg: "收藏成功"
                })
            }
        } else {// 记录不存在就直接创建记录
            await ctx.model.Fava.create({
                video_id,
                user_id,
            })
            return ctx.apiSuccess({// 提前return不再走下去
                status: true,
                fava:true,
                msg: "收藏成功"
            })
        }
    }
    /**
     * 指定用户收藏列表
     * 目测返回video的list
     * 无需token
     */
    async list() {
        const {
            ctx, app
        } = this;
        // 1.进行校验
        ctx.validate({
            page: {
                type: 'int',
                required: true,
                desc: '页数'
            },
            user_id: {
                type: 'int',
                required: true,
                desc: '用户ID'
            }
        })
        // 2.提取参数，但page在page函数里就有
        // 2-5从token提取用户Id，如果是get请求就不需要了吧而是去查询参数找了
        // const user_id = ctx.authUser.id
        let user_id = ctx.query.user_id;
        // 3.先分页查询该用户收藏了啥
        /**
         * 提出一些可能想到的查询方案
         * 1.查fava,用查到的fava去查每一个fava对应的video，傻子方案，那我需要联表查询干嘛
         * 2.加入联表查询的video对应到每一条fava去，这对所有联表关系的表都是可行的,不需要fava的信息可以用map函数
         */
        let rows = await ctx.page(ctx.model.Fava, { user_id, valid: 1 }, {
            include: [{
                model: app.model.Video,// 原来include就已经是产生物理外键的关联了,这里默认找关联的作品了
                // ?必须检查这个video是否存在，也没有用啊，你需要把作品删除的时候把所有fava删除掉，需要写关联关系
                // where: {
                //     id: fava.video_id// 这样写肯定不行
                // 如果没有物理外键是不是要在这里指定外键呢，又该怎么指定呢,毕竟你拿不到每一个fava的video_id
                // }
            }]
        })
        if (rows.length === 0) {//findAll会返回数组，所以只能用长度判断
            ctx.throw(404, '该用户不存在或该用户没有收藏任何作品')
        }
        // console.log(rows)
        // 这段操作对应SB框架里的XXPureVO类，js果然方便快捷啊
        rows = rows.map((item) => {// 得到的值需要重新赋值，map函数是会返回了一个新数组沃德天
            console.log(item.video.created_time)
            if(!item.video){
                ctx.throw(404,'部分收藏的视频的被删除了，请检查')
            }
            return {
                created_time: item.video.created_time,
                id: item.video.id,
                title: item.video.title,
                cover: item.video.cover,
                category_id: item.video.category_id,
                user_id: item.video.user_id,
                duration: item.video.duration,
                desc: item.video.desc,
                play_count: item.video.play_count,
                danmu_count: item.video.danmu_count,
                updated_time: item.video.updated_time,
                deleted_time: item.video.deleted_time,
            }
        })
        ctx.apiSuccess(rows)
    }
}
module.exports = FavaController;
