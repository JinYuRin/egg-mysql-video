'use strict';

const Controller = require('egg').Controller;
//	为什么不能用import和export语法呢
// 由于历史遗留问题导致node不支持，非要使用时要使用babel，估计vue项目里面已经使用了babel了
const crypto = require('crypto');// 加密服务

class UserController extends Controller {
    /* 
        统计我的用户相关数据
     */
    async statistics() {
        const {
            ctx, app, service
        } = this;
        let user_id = ctx.authUser.id
        let ip = ctx.request.ip
        let followCount = await service.user.getFollowCount(user_id)
        let videoCount = await service.user.getVideoCount(user_id)
        let favaCount = await service.user.getFavaCount(user_id)
        let historyCount = await service.user.getHistoryCount(ip)
        ctx.apiSuccess({ videoCount, favaCount, followCount, historyCount })
    }
    /**
     * 用户空间统计数据接口
     * !该接口未经测试
     * 查询到特定用户的信息(头像昵称，关注数，粉丝数)
     * 需要得到ctx.authUser.id来查到是否关注，可以不用auth拦截
     * 但要注意没有携带这个ctx.authUser.id就意味着要登录，前端点击后需要转到登录页面去
     */
    async spaceStatistics() {
        const {
            ctx, app, service
        } = this;
        // 校验参数
        ctx.validate({
            id: {
                type: 'int',
                required: true,
                desc: '用户id'
            }
        })
        // 从路径提取参数
        let { id } = ctx.params
        let user_id = ctx?.authUser?.id
        console.log(user_id)
        // 查询用户
        let user = await service.user.exist(id)
        if (!user) {
            ctx.throw(404, '您要关注的用户不存在')
        }
        let followCount = await service.user.getFollowCount(id)
        let fansCount = await service.user.fansCount(id)
        let follow = false
        if (user_id) {
            follow = await service.user.isFollow(user_id, id)
        }
        ctx.apiSuccess({ status: true, user, followCount, fansCount, follow })
    }
    /**
     * 测试接口，查询所有用户
     */
    async index() {
        const {
            ctx, app
        } = this;
        console.log(app.Service);
        let res = await ctx.model.User.findAll()
        //ctx.model.User.findAll()记住这个查询的层次
        ctx.apiSuccess({ data: res })
    }
    // 注册功能
    async reg() {
        const { ctx, app } = this
        /**
         * 参数验证，第一个对象为各个属性的验证，第二个对象是各种选项比如equals
         * 问题就来，怎么验证query和parms里面的参数呢，这里都是在body里的啊
         */
        ctx.validate({
            username: {
                type: 'string',
                required: true,
                range: {
                    min: 5,
                    max: 20
                },
                desc: '用户名'
            },
            password: {
                type: 'string',
                required: true,
                desc: '密码'
            },
            repassword: {
                type: 'string',
                required: true,
                desc: '确认密码'
            }
        }, {
            equals: [
                ['password', 'repassword']
            ]
        })
        const { username, password } = ctx.request.body
        // 查找带有条件的findOne
        if (await ctx.model.User.findOne({//必须写await啊
            where: {
                username
            }
        })) {
            ctx.throw(400, '用户已存在')
        }
        // 注册到数据库
        let user = await ctx.model.User.create({//ctx.model或者app.model，其实使用app.model比较合理
            username,
            password
        })
        if (!user) {// 这个返回的user是数据库里
            ctx.throw(400, '创建用户失败')
        }
        user = JSON.parse(JSON.stringify(user))
        delete user.password// 删除查出来的hash密码
        ctx.apiSuccess(user)
    }
    /**
     * &登录接口
     */
    async login() {
        const {
            ctx, app
        } = this;
        // 校验传过来的登录数据
        ctx.validate({
            username: {
                type: 'string',
                required: true,
                range: {
                    min: 5,
                    max: 20
                },
                desc: '用户名'
            },
            password: {
                type: 'string',
                required: true,
                desc: '密码'
            }
        })
        // 查找带有条件的findOne
        const { username, password } = ctx.request.body
        let user = await ctx.model.User.findOne({//必须写await啊
            where: {
                username
            }
        })
        if (!user) {
            ctx.throw(400, '用户不存在或者密码错误')
        }
        console.log(user.password);// 数据库加密的密码
        console.log(this.createPassword(password));// 用户提供的加密的密码
        // 密码检验
        if (this.checkPassword(password, user.password)) {
            console.log('密码正确请继续')
            // 制作jwt令牌并发布
            user = JSON.parse(JSON.stringify(user))// getToken只能传普通的js对象
            const token = this.getToken(user)
            user.token = token
            delete user.password// 删除查出来的hash密码
            console.log(user)
            // 缓存到redis去,也要await
            if (await this.service.cache.set('user_' + user.id, token)) {
                console.log('缓存成功');
            } else {
                ctx.throw(400, '登录失败')
            }
        }
        else {
            ctx.throw(400, '用户不存在或者密码错误')
        }
        ctx.apiSuccess(user)
    }
    /**
     * *退出登录的逻辑
     * *1.客户端必须携带退出token 先获取用户的token
     * *2.通过全局中间件检验token
     * *3.能通过auth就尝试去redis删除这个用户的token，那么也就是要传这个用户的id咯
     * *4.通知客户端登出成功，删除缓存
    */
    async logout() {
        const {
            ctx, app, service// !service居然可以在这里
        } = this;
        console.log(ctx.authUser);
        let { id } = ctx.authUser
        if (!await ctx.service.cache.remove('user_' + id)) {
            ctx.throw(400, '退出登录失败')
        }
        ctx.apiSuccess('已退出登录')
    }
    // &提供加密服务
    createPassword(password) {
        const {
            ctx, app
        } = this;
        //app.config.crypto.secret在config中可以查到的
        const hmac = crypto.createHash("sha256", app.config.crypto.secret);
        // 加密
        hmac.update(password);
        return hmac.digest("hex");// 获取加密后的值
    }
    // &提供密码校验服务
    checkPassword(password, hashPassword) {// 传过来后相当于变量了，不存在常量重复定义了吧
        password = this.createPassword(password)
        return password === hashPassword
    }
    // &生成令牌
    getToken(value) {
        const {
            ctx, app
        } = this;
        return app.jwt.sign(value, app.config.jwt.secret);
    }
    /**
     * 1.获取目标用户参数用查询参数的除密码外的信息
     * 2.该用户存在，查到他的粉丝数和关注数
     * 3.是否关注，从登录用户获取是否关注该用户
     * !同样的，并不需要token
     * !当前接口未测试!
     */
    // 获取用户相关信息
    async user_info() {
        const {
            ctx, app, service
        } = this;
        // let user_id = ctx.authUser.id
        let authUser = ctx.authUser
        // 1.校验参数
        ctx.validate({
            id: {// 只需要给个用户id就行了
                type: 'int',
                required: true,
                desc: '目标用户ID'
            }
        })
        // 2.获取参数
        const { id } = ctx.query
        // 3.查询该用户信息getUserInfo()，可以写到service去
        let res = await ctx.model.User.findOne({
            where: {
                id
            },
            attributes: {// 默认为数组include，可写成对象
                exclude: ['password']
            }
        })
        if (!res) {
            ctx.throw(404, '该用户不存在')
        }
        // 4.查到他的粉丝数和关注数
        let fansCount = 0
        let followCount = 0
        fansCount = await ctx.model.Follow.count({
            where: {
                follow_id: id
            }
        })
        followCount = await ctx.model.Follow.count({
            where: {
                user_id: id
            }
        })
        // 5.当前用户(如果已经登录的话)是否已经关注了他
        let isFollow = false
        if (authUser) {
            isFollow = await service.user.isFollow(authUser.id, id)
        }
        // 6.返回用户详情页信息结果
        ctx.apiSuccess({
            status: true,
            user: res,
            followCount,
            fansCount,
            isFollow
        })
    }
    /**
     * &更新用户接口，必须post，必须是从authorUser获取用户，必须查询用户是否存在
     */
    async update() {
        const {
            ctx, app
        } = this;
        // 校验传过来的登录数据
        ctx.validate({
            avatar: {
                type: 'string',
                required: false,
                desc: '头像'
            },
            nickname: {
                type: 'string',
                required: false,
                desc: '昵称'
            },
            sex: {// 更改性别就有点问题了，数据库是枚举类型啊，我传string行不行啊
                type: 'string',
                required: false,
                desc: '性别'
            },
            desc: {
                type: 'string',
                required: false,
                desc: '个性签名'
            },
            password: {
                type: 'string',
                required: false,
                desc: '密码'
            }
        })
        const { avatar, nickname, sex, desc, password } = ctx.request.body
        if (!avatar && !nickname && !sex && !desc && !password) {
            ctx.throw(400, '未提交需要修改的用户信息')
        }
        const authUser = ctx.authUser
        let user = await ctx.model.User.findOne({//必须写await啊
            where: {
                id: authUser.id// 之后需要去除密码
            },
            attributes: {// 默认为数组include，可写成对象
                exclude: ['password']
            }
        })
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        // if (avatar) {
        //     this.setUser(user, { avatar })
        // }
        this.setUser(user,
            {
                avatar: avatar || user.avatar,
                nickname: nickname || user.nickname,
                sex: sex || user.sex,
                desc: desc || user.desc,
                password: password || user.password
            })
        // delete user.password// 删除查出来的hash密码
        ctx.apiSuccess(user)
    }
    // &写入信息
    setUser(user, values) {
        // 可以考虑把value={avatar}写成一个对象，不然传参的时候变量名更改了就无法直接传递变量名了
        user.update(values)
    }
}

module.exports = UserController;
