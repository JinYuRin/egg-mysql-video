'use strict';

const Controller = require('egg').Controller;
class VideoPlayController extends Controller {
    /* 
    测试接口，获取所有的观看记录
    */
    async index() {
        const {
            ctx, app
        } = this;
        const rows = await app.model.VideoPlay.findAll()
        ctx.apiSuccess(rows);
    }
    /**
     * 查询目标ip的历史记录
     * 这个可以不是post啊
     */
    async list() {
        const {
            ctx, app
        } = this;
        // 需要进行校验
        ctx.validate({
            page: {
                type: 'int',
                required: true,
                desc: '页数'
            }
        })
        // 得找到ip地址
        let ip = ctx.request.ip
        // // 分页查询的核心ctx.page()
        let rows = await ctx.page(ctx.model.VideoPlay, { ip },
            {
                include: [{
                    model: app.model.Video,
                }]
            }
        )
        rows = rows.map(item => {
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
    /**
     * 清除目标ip的历史记录
     * 这个可以不是post啊
     */
    async clear() {
        const {
            ctx, app
        } = this;
        // 得找到ip地址
        let ip = ctx.request.ip
        await app.model.VideoPlay.destroy({// !有病，用个毛的destroy
            where: {// 无需主动抛出异常吧
                ip
            }
        })
        ctx.apiSuccess({ status: true })
    }
    /**
     * 提交播放记录，需要写入video和play两张表，实际类似业务可能要考虑事务方法了
     */
    async submit() {
        const {
            ctx, app
        } = this;
        // 得找到ip地址
        let ip = ctx.request.ip
        let { video_id } = ctx.request.body
        let videoPlay = await app.model.VideoPlay.findOne({// !有病，用个毛的destroy
            where: {// 无需主动抛出异常吧
                ip,
                video_id
            }
        })
        if (videoPlay) {
            // ctx.throw(400, '该ip已经播放过该作品了')
            return
            // ctx.apiSuccess({ status: false, msg: '该ip已经播放过该作品了' })
        }
        await app.model.VideoPlay.create({
            ip,
            video_id
        })
        let video = await app.model.Video.findByPk(video_id)
        if (!video) {
            ctx.throw(404, '该作品不存在')
        }
        video.update({
            play_count: video.play_count + 1
        })
        ctx.apiSuccess({ status: true })
    }
}

module.exports = VideoPlayController;
