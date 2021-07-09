// 使用module.exports导出一个函数还是直接导出Controller/Service是要看文档的
// 先拿来用先，之后再看下怎么配置的Cache
// app/service/cache.js
'use strict';

const Service = require('egg').Service;

class UserService extends Service {
    // 用户是否存在
    async exist(user_id) {
        const { app } = this;//!为什么是只用app，因为ctx是控制器里的函数才会有的
        return await app.model.User.findOne({
            where: {
                id: user_id
            },
            attributes: ['id', 'username', 'nickname', 'avatar', 'desc']
        });
    }
    // 指定用户关注人数
    async getFollowCount(user_id) {
        return await this.app.model.Follow.count({
            //?直接count函数做统计，那么如果在查询的时候顺便count又怎么写呢
            where: {
                user_id
            }
        });
    }
    // 指定用户收藏作品量
    async getFavaCount(user_id) {
        return await this.app.model.Fava.count({
            //?直接count函数做统计，那么如果在查询的时候顺便count又怎么写呢
            where: {
                user_id,
                valid: 1
            }
        });
    }
    // 指定用户的作品量
    async getVideoCount(user_id) {
        return await this.app.model.Video.count({
            where: {
                user_id
            }
        });
    }
    // 粉丝数量
    async fansCount(follow_id) {
        const {
            ctx, app
        } = this;
        let fansCount = await ctx.model.Follow.count({
            where: {
                follow_id
            }
        })
        return fansCount
    }
    // 是否关注
    async isFollow(user_id, follow_id) {
        return !!(await this.app.model.Follow.findOne({// 因为只要布尔值，所以双!号快速转型
            where: {
                user_id,
                follow_id
            }
        }))
    }
    // 是否收藏
    async isFava(user_id, video_id) {
        return !!(await this.app.model.Fava.findOne({
            where: {//!一定要记得写where,不存在什么默认where
                user_id,
                video_id,
                valid: 1
            }
        }))
    }
    // 指定ip的历史记录量
    async getHistoryCount(ip) {
        return await this.app.model.VideoPlay.count({
            where: {
                ip
            }
        });
    }
}

module.exports = UserService;