'use strict';

const Controller = require('egg').Controller;
let rules = {
    title: {
        type: 'string',
        required: true,
        desc: '视频标题'
    },
    url: {
        type: 'string',
        required: true,
        desc: '视频地址'
    },
    video_id: {
        type: 'int',
        required: true,
        desc: '所属作品ID'
    },
    desc: {
        type: 'string',
        required: true,
        desc: '描述'
    },
}
class VideoDetailController extends Controller {
    /**
     * 获取指定作品下的视频列表,是否要分页获取就见仁见智了
     */
    async list() {
        const {
            ctx, app
        } = this;
        //  1.校验参数
        ctx.validate({
            video_id: {
                type: 'int',
                required: true,
                desc: '所属作品ID'
            }
        })
        //   2.提取参数
        const { video_id } = ctx.params
        let video = await app.model.Video.findOne({
            where: {
                id: video_id,
            },
            include: [
                {
                    model: app.model.VideoDetail
                }
            ]
        });
        if (!video) {
            ctx.throw(404, '所属作品不存在');
        }
        ctx.apiSuccess(video.video_details)
    }
    /**
     * 创建视频
     */
    async save() {
        const {
            ctx, app
        } = this;
        //  1.校验参数
        ctx.validate(rules)
        //   2.提取参数
        const { title, url, video_id, desc } = ctx.request.body
        // 所属作品不存在
        const currentUserId = ctx.authUser.id
        let video = await app.model.Video.findOne({
            where: {
                id: video_id,
                user_id: currentUserId
            }
        });
        if (!video) {
            ctx.throw(404, '所属作品不存在');
        }
        let videoItem = await app.model.VideoDetail.create({
            title,
            url,
            video_id,
            desc,
        });
        // 也就是说该接口必须携带token，auth要先拦截然后得到LocalUser的信息
        ctx.apiSuccess(videoItem)
    }
    /**
     * 修改视频
     */
    async update() {
        let { ctx, app } = this;
        let currentUser = ctx.authUser;

        ctx.validate({
            id: {
                type: "int",
                required: true,
                desc: "视频ID"
            },
            ...rules
        });

        // 该接口用路径参数给与了视频id，用请求体给作品id
        let {
            title,
            url,
            video_id,
            desc,
        } = ctx.request.body;

        let { id } = ctx.params;// 作为路径参数传入了

        // 所属作品是否存在，同时加入user_id进行查询就可以直接得知用户是否有权进行此操作
        let video = await app.model.Video.findOne({
            where: {
                id: video_id,
                user_id: currentUser.id
            }
        });
        if (!video) {
            ctx.throw(404, '所属作品不存在');
        }
        // 所改视频是否存在
        let vd = await app.model.VideoDetail.findOne({
            where: {
                id,
                video_id
            }
        });

        if (!vd) {
            ctx.throw(404, '当前记录不存在');
        }
        // 视频存在，允许修改
        let res = await vd.update({
            title,
            url,
            video_id,
            desc,
        });

        ctx.apiSuccess(res);
    }
    /**
     * 删除视频
     */
    async destroy() {
        let { ctx, app } = this;
        let currentUser = ctx.authUser;
        ctx.validate({
            id: {
                type: "int",
                required: true,
                desc: "视频ID"
            }
        });
        let {
            id
        } = ctx.request.body;
        let video = await app.model.VideoDetail.findOne({
            where: {
                id,
            },
            include: [{
                model: app.model.Video,// 原来include就已经是产生物理外键的关联了,这里默认找关联的作品了
                where: {
                    user_id: currentUser.id
                }
            }]
        });

        if (!video) {
            return ctx.throw(404, '该记录不存在');
        }

        // 别忘了你做了软删除
        await video.destroy();

        ctx.apiSuccess({ status: true });
    }
}
module.exports = VideoDetailController;
