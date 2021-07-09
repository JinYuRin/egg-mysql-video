// app/middleware/auth.js
'use strict';
// ctx是指当前请求的上下文
// app是整个app
// ?option是什么参数呢
module.exports = (option, app) => {
    return async (ctx, next) => {
        //1. 获取 header 头token
        let token = ctx.header.token || ctx.query.token;
        if (token) {
            let user = {};
            try {
                user = app.jwt.verify(token, app.config.jwt.secret)
            } catch (error) {
                console.log(error)
            }
            //3. 判断当前用户是否登录
            if (user?.id) {// 改成可选链吧
                let t = await ctx.service.cache.get('user_' + user.id);
                if (t && t === token) {
                    user = await app.model.User.findByPk(user.id);
                    ctx.authUser = user;
                }
            }
        }
        await next();
    }
}