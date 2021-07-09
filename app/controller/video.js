'use strict';

const Controller = require('egg').Controller;
const rules = {
    id: {
        type: 'int',
        required: true,
        desc: '作品ID'
    },
    title: {
        type: 'string',
        required: true,
        desc: '视频标题'
    },
    cover: {
        type: 'string',
        required: true,
        desc: '封面'
    },
    category_id: {
        type: 'int',
        required: true,
        desc: '分类ID'
    },
    desc: {
        type: 'string',
        required: true,
        desc: '描述'
    },
}
class VideoController extends Controller {
    /**
     * 主页列表
     */
    async homeIndex() {
        const {
            ctx, app
        } = this;
        // 分页查询的核心ctx.page()
        let rows = await ctx.page(ctx.model.Video)
        ctx.apiSuccess(rows)
    }
    /**
     * 查询指定用户的所有作品
     * 这个可以不是post啊
     */
    async index() {
        const {
            ctx, app
        } = this;
        // 需要进行校验
        ctx.validate({
            page: {
                type: 'int',
                required: true,
                desc: '页数'
            },
            user_id: {
                type: 'int',
                required: true,
                desc: '用户Id'
            }
        })
        const user_id = ctx.query.user_id
        // 分页查询的核心ctx.page()
        let rows = await ctx.page(ctx.model.Video, { user_id })
        ctx.apiSuccess(rows)
    }
    /**
     * 创建作品接口
     * 1.校验参数
     * 2.提取参数
     * 3.创建作品
     * 4.返回结果
     */
    async create() {
        const {
            ctx, app
        } = this;
        ctx.validate({// 这个rules在create函数下不应该校验作品ID
            title: {
                type: 'string',
                required: true,
                desc: '视频标题'
            },
            cover: {
                type: 'string',
                required: true,
                desc: '封面'
            },
            category_id: {
                type: 'int',
                required: true,
                desc: '分类ID'
            },
            desc: {
                type: 'string',
                required: true,
                desc: '描述'
            },
        })
        const { title, cover, category_id, desc } = ctx.request.body
        const user_id = ctx.authUser.id
        // 也就是说该接口必须携带token，auth要先拦截然后得到LocalUser的信息
        let video = await app.model.Video.create({
            title,
            cover,
            category_id,
            desc,
            user_id
        })
        ctx.apiSuccess(video)
    }
    /**
     * 更新作品接口
     * 1.校验参数
     * 2.提取参数
     * 3.更新作品
     * 4.返回结果
     */
    async update() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        ctx.validate({
            ...rules, id: {
                type: 'int',
                required: true,
                desc: '作品ID'
            },
        })
        // 2.提取参数
        // 原来使用校验后里面没有的参数都被过滤掉啊我草，不早说
        // 他的id使用了路径参数,其实是相对合理的，不会破坏前端this.form的原始结构
        const { id, title, cover, category_id, desc } = ctx.request.body
        // console.log(id, title, cover, category_id, desc)
        // 也就是说该接口必须携带token，auth要先拦截然后得到LocalUser的信息
        // !这里是更新作品，必须检验currentUserId是不是这个作品的作者
        const currentUserId = ctx.authUser.id
        let video = await app.model.Video.findByPk(id)
        // ?也可以给定id和user_id来查询
        if (!video) {
            ctx.throw(404, '该作品不存在')
        }
        if (video.user_id !== currentUserId) {
            ctx.throw(403, '您无权更新该作品信息')
        }
        // 3.更新作品
        // update的话可以把这个实体直接update()掉，同destroy
        let res = await video.update({
            title, cover, category_id, desc
        })
        // 4.返回结果
        ctx.apiSuccess(res)
    }
    /**
     * 删除作品接口
     * 1.校验参数
     * 2.提取参数
     * 3.删除作品
     * 4.返回结果
     */
    async delete() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        ctx.validate({
            id: {
                type: 'int',
                required: true,
                desc: '作品ID'
            },
        })
        // 2.提取参数
        // 原来使用校验后里面没有的参数都被过滤掉啊我草，不早说
        // 他的id使用了路径参数,其实是相对合理的，不会破坏前端this.form的原始结构
        const { id } = ctx.request.body
        // console.log(id, title, cover, category_id, desc)
        // 也就是说该接口必须携带token，auth要先拦截然后得到LocalUser的信息
        // !这里是更新作品，必须检验currentUserId是不是这个作品的作者
        const currentUserId = ctx.authUser.id
        let video = await app.model.Video.findByPk(id)
        // ?也可以给定id和user_id来查询
        if (!video) {
            ctx.throw(404, '该作品不存在')
        }
        if (video.user_id !== currentUserId) {
            ctx.throw(403, '您无权更新该作品信息')
        }
        // 3.删除作品
        // update的话可以把这个实体直接update()掉，同destroy
        let res = await video.destroy()
        // 4.返回结果
        ctx.apiSuccess({ status: true, res })
    }
    /**
     * 指定分类下的视频列表api接口
     * 需要提供分类id--category_id
     */
    async list() {
        const {
            ctx, app
        } = this;
        // 1.校验参数
        ctx.validate({
            page: {
                type: 'int',
                required: true,
                desc: '页数'
            },
            category_id: {
                type: 'int',
                required: true,
                desc: '分类ID'
            },
        })
        // 2.提取参数
        const { category_id } = ctx.params
        // 3.直接查询，不需要token，但数据可能很多，采用分页查询
        let rows = await ctx.page(ctx.model.Video, { category_id })
        // 4.返回结果
        ctx.apiSuccess(rows)
    }
    /**
     * 分页查询指定作品的评论和回复内容,包含每条评论和回复的用户的基本信息
     */
    async comment() {
        const {
            ctx, app
        } = this;
        /* 
        需要多个include? 
        要区分回复还是评论,用reply_id=0,如果是回复是没有对回复的回复的记录的
        联表查到每条comment的send_user(foreignKey: 'user_id')和reply_user(foreignKey: 'reply_user_id')和回复(foreignKey: 'reply_id')
        他的每条回复还要继续联表查询send_user(foreignKey: 'user_id')和reply_user(foreignKey: 'reply_user_id')
        因为递归查询太恐怖,真不知道哔哩哔哩如何解决这个技术问题,现在不允许对回复的回复
        */
        // 1.校验
        ctx.validate({
            id: {
                type: 'int',
                required: true,
                desc: '作品ID'
            },
            page: {
                type: 'int',
                required: true,
                desc: '页数'
            },
        })
        // 2.提取参数，page已经在page函数里提取了
        const { id } = ctx.params
        // 尼玛，是ctx.params不是ctx.request.params,路径参数不在request里
        // 还有查询参数别忘了在哪
        // 3.查询结果,查Comment条件video_id+reply_id(0为评论而非回复)
        let rows = await ctx.page(ctx.model.Comment,
            { video_id: id, reply_id: 0 },// where
            {// 真正决定联表查询的是include和model里写的表关系，而不是表的外键
                // 事实上在表关系里写使用逻辑外键也可以联表查
                /* 
                ?返回的结果居然携带了videoId和video_id两个字段
                ?难道是因为我没有使用到videoId这个字段所以
                ?难道说每次连接一个外键关系就会产生一个新的字段用来做查询，如果没有include到就返回来了
                ?在java的时候我也是要整两个同样名字的字段像个傻逼一样
                 */
                include: [{
                    model: app.model.User,
                    as: 'send_user',// 拿到as就不用给条件了，毕竟都设置外键了
                    attributes: ['id', 'username', 'nickname', 'avatar']
                }, {
                    model: app.model.User,
                    as: 'reply_user',// 拿到as就不用给条件了，毕竟都设置外键了
                    attributes: ['id', 'username', 'nickname', 'avatar']
                }, {// 厉害，返回一个数组还是comments，名字都取好了
                    model: app.model.Comment,// 只有一个和Comment的关系没有取别名
                    include: [{ // 联表查询的各种条件可以直接写在model下面,包括where和分页查询
                        // *分页查询如果是加载更多的话就要继续叠加offset了，说不定要增加新接口了
                        model: app.model.User,
                        as: 'send_user',
                        attributes: ['id', 'username', 'nickname', 'avatar']
                    }, {
                        model: app.model.User,
                        as: 'reply_user',
                        attributes: ['id', 'username', 'nickname', 'avatar']
                    }]
                }]
            })
        // 4.返回结果
        ctx.apiSuccess(rows)
    }
    /**
     * 视频详情页的信息,get请求就行了
     * 1.作品-作品下的所有视频-作者的简洁信息
     * 2.是否已收藏，是否已关注，这个可以写在service，因为很有可能重复使用
     * 3.最热视频推荐
     *!4.按道理来讲，不应该要求本路由提供token，即使不登录也可以进入此页面的，也就是说ctx.authUser是可以为空的
     */
    async read() {
        const {
            ctx, app, service
        } = this;
        // let user_id = ctx.authUser.id
        let authUser = ctx.authUser
        // 1.校验
        ctx.validate({
            id: {// 只需要给个作品id就行了
                type: 'int',
                required: true,
                desc: '作品ID'
            }
        })
        // 2.作品-作品下的所有视频-作者的简洁信息
        const { id } = ctx.params
        // let video = await ctx.model.Video.findByPk()//  不知道findByPk能不能联表查，先用findAll
        let video = await ctx.model.Video.findOne({
            where: {
                id
            },
            include: [
                {
                    model: app.model.User,// 用户大多都只会返回少量信息
                    attributes: ['id', 'username', 'nickname', 'avatar']
                }, {
                    model: app.model.VideoDetail,// 一对多
                }
            ]
        })
        if (!video) {
            ctx.throw(404, '该作品不存在')
        }
        // 是否已收藏，是否已关注，这个写在service
        let fava = false
        let follow = false
        let fansCount = await service.user.fansCount(video.user_id)// 不管有没有登录都必须有粉丝数
        console.log(authUser)
        if (authUser) {// 只有登录状态下才去查fava和follow,未登录就默认false
            fava = await service.user.isFava(authUser.id, id)
            follow = await service.user.isFollow(authUser.id, video.user_id)
        }
        let hot = await this.hot()
        ctx.apiSuccess({
            status: true,
            video,
            fava,
            follow,
            hot,
            fansCount
        })

    }
    async hot() {
        const {
            ctx, app
        } = this;
        let hot = await ctx.model.Video.findAll({
            order: [
                ['id', 'DESC'],//有点奇怪的写法，感觉要用对象才对啊
                ['play_count', 'DESC']
            ],
            limit: 5// 配合offset就能指定页码了
        })
        return hot
    }
}
module.exports = VideoController;
