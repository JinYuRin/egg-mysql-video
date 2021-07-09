// app/middleware/auth.js
'use strict';
// ctx是指当前请求的上下文
// app是整个app
// ?option是什么参数呢
module.exports = (option, app) => {
    return async function auth(ctx, next) {
        let { token } = ctx.header
        // console.log(token);
        // ctx.throw(400, '您没有权限访问该接口')
        // 没携带token直接打回去
        console.log(token)
        if (!token) {
            ctx.throw(400, '您没有权限访问该接口')
        }
        // 携带了token开始检验
        let user = {}
        try {
            user = app.jwt.verify(token, app.config.jwt.secret)
            // console.log(user);// 由于token加密使用了user，所以解析也出来了user
        } catch (err) {// TokenExpiredError是verify函数抛出的token过期异常
            let fail = err.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
            ctx.apiFail(fail);
        }
        // 检验用户是否登录,检查redis是否有存储这个token
        let t = await ctx.service.cache.get('user_' + user.id);
        console.log(t);
        if (!t || t !== token) {
            ctx.throw(400, 'Token 令牌不合法!');
        }
        // 为什么还要检查这个用户是否存在???，难道上面的流程不足以排除这个可能性吗
        user = await app.model.User.findByPk(user.id)
        // console.log(JSON.parse(JSON.stringify(user)));
        if (!user) {
            ctx.throw(400, '该用户不存在');
        }
        // 挂载到ctx上，方便接口处理
        user = JSON.parse(JSON.stringify(user))
        ctx.authUser = user
        await next()// next就是走接口 在next之前就是拦截请求预处理，next之后就是请求后处理
    };
};
