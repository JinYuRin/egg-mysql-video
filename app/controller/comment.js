'use strict';

const Controller = require('egg').Controller;
//	为什么不能用import和export语法呢
// 由于历史遗留问题导致node不支持，非要使用时要使用babel，估计vue项目里面已经使用了babel了
const rules = {
    content: {
        type: 'string',
        required: true,
        range: {
            min: 5,
            max: 20// 这个范围的具体含义是因类型而异
        },
        desc: '评论内容'
    },
    video_id: {
        type: 'int',
        required: true,
        desc: '作品ID'
    },
    // user_id从token'获取
    reply_id: {
        type: 'int',
        required: false,
        // 如果是回复才需要reply_id
        desc: '回复ID'
    },
    reply_user_id: {
        type: 'int',
        required: false,
        // 如果是回复才需要reply_user_id,需要找到同时存在reply_id和reply_user_id的comment记录才允许回复
        desc: '回复用户id'
    },
}
class CommentController extends Controller {
    /**
     * 测试接口，查询全app所有评论
     */
    async index() {
        const {
            ctx, app
        } = this;
        let rows = await ctx.model.Comment.findAll()
        ctx.apiSuccess(rows)
    }
    /**
     * 发表评论或者回复是否区分接口,因为参数校验稍有不同，但是我可以用reply=required:false来进行参数校验
     * 1.发评论需要写入除reply相关的信息,只要reply_id参数为空就是发评论
     * 2.发回复需要写入reply
     * 校验完毕后先要判断reply_id,然后进入不同的分支：发评论|发回复
     * 3.正常情况下必须考虑该用户和作品是否存在的情况，但是由于有物理外键，无需检验
     * 
     * 先校验，对content的长度进行前后端的双重检验
     * 判断视频是否存在
     * 拿到user_id丢给user_id
     * 判断是否是一条回复
     * 1是回复就去查 符合评论id和被回复人id双重条件的comment是否存在?写入:抛异常
     * *那么，对回复的回复又该如何处理,根据现有的架构选择无视
     * 2是评论就直接写入数据库就ok了
     */
    async create() {
        const {
            ctx, app
        } = this;
        // token拉取用户
        let user_id = ctx.authUser.id
        // 1.校验参数
        ctx.validate(rules)
        // 2.提取参数
        const { content, video_id, reply_id, reply_user_id } = ctx.request.body// ?你说要不要根据正则来过滤垃圾评论
        // 3.确定video_id所指向的作品是否存在
        let video = await ctx.model.Video.findByPk(video_id)//主键查询
        if (!video) {
            ctx.throw(404, '要回复的作品不存在')
        }
        // 4.判断是评论还是回复
        if (reply_id > 0) {
            //!reply_user_id不用管,什么?写成-if(reply_id)-我传了0居然被判定为false?这个是弱类型的漏洞啊尼玛
            // *但是传0他也过不了查id为reply_id的comment的校验
            // 判定为回复后的处理
            // 先查询要回复的评论存在不
            let res = await ctx.model.Comment.findOne({
                // !无法保证查到的记录是评论还是回复，也就是说存在对回复的回复
                // !只能祈求前端不被攻破...
                where: {
                    id: reply_id,// 被回复的评论
                    user_id: reply_user_id// 被回复的评论者 这个参数是可以手动传的，必须在这里检验掉
                }
            })
            if (!res) {
                ctx.throw(404, '找不到你想回复的评论')
            }
            // 要回复的评论存在,额外写入reply_id
            let comment = await ctx.model.Comment.create({
                content,
                video_id,
                user_id,
                reply_id,
                reply_user_id
            })
            // 提前返回结果
            video.update({
                danmu_count: video.danmu_count + 1
            })
            return ctx.apiSuccess(comment)
        }
        // 判定为评论后的处理
        let comment = await ctx.model.Comment.create({
            content,
            video_id,
            user_id
        })
        // 5.增加video的评论数并返回comment的结果
        video.update({
            danmu_count: video.danmu_count + 1
        })
        ctx.apiSuccess(comment)
    }
}

module.exports = CommentController;
