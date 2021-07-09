/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1613401286928_132';

  // add your middleware config here
  // 中间件洋葱模型有顺序的吧，顺序是如何的
  config.middleware = ['erroHandler', 'auth', 'getuser'];
  config.auth = {
    match: [
      '/logout',
      '/video',// !凡是包含/video/*都会被匹配到，你还没发现吧
      '/video_detail',
      '/vod/sign',
      '/comment',
      '/fava',
      '/user/follow',
      '/user/unfollow',
      '/user/follows',
      '/user/fans',
      '/user/statistics',
      '/user/history',
      '/user/update'
      // upload居然没有加token沃日
      // '/video_read'
      // '/users/login',
    ]
  }
  // 配置中间件参数
  // config.erroHandler = {
  //   ceshi: 123,
  //   // 通用配置（以下是重点）
  //   enable: true, // 控制中间件是否开启。
  //   match: '/news', // 设置只有符合某些规则的请求才会经过这个中间件（匹配路由）
  //   ignore: '/shop', // 设置符合某些规则的请求不经过这个中间件。
  //
  //   /**
  //    注意：
  //    1. match 和 ignore 不允许同时配置
  //    2. 例如：match:'/news'，只要包含/news的任何页面都生效
  //    **/
  //
  //   // match 和 ignore 支持多种类型的配置方式：字符串、正则、函数（推荐）
  //   match(ctx) {
  //     // 只有 ios 设备才开启
  // const reg = /iphone|ipad|ipod/i;
  //     return reg.test(ctx.get('user-agent'));//user-agent设备类型
  //   },
  // };

  // 引入sequelize 这里配置的是ORM操作数据库
  // database里面是migrations数据库迁移的配置
  config.sequelize = {
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '123456',
    port: 3306,
    // !记得改回来
    // database: 'test',
    database: 'lencent_top',
    // 中国时区
    timezone: '+08:00',
    define: {
      // 取消数据表名复数
      freezeTableName: true,
      // 自动写入时间戳 created_at updated_at deleted_at 到数据库去
      timestamps: true,
      // 字段生成软删除时间戳 deleted_at
      paranoid: true,
      // 这就是egg的约定大于配置
      createdAt: 'created_time',
      updatedAt: 'updated_time',
      deletedAt: 'deleted_time',
      // 所有驼峰命名格式化
      underscored: true,
    },
  };
  // 校验
  config.valparams = {
    locale: 'zh-cn',
    throwError: true,
  };
  // 加密
  config.crypto = {
    secret: 'qhdgw@45ncashdaksh2!#@3nxjdas*_672'
  };
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 关闭 csrf
  config.security = {
    csrf: {
      enable: false,
    },
    // 跨域白名单
    // domainWhiteList: ['http://localhost:3000'],
  };
  // 允许跨域的方法
  config.cors = {
    origin: '*',
    allowMethods: 'GET, PUT, POST, DELETE, PATCH',
  };
  // jwt令牌设置secret
  config.jwt = {
    secret: 'qhdgw@45ncashdaksh2!#@3nxjdas*_672'
  };
  // redis存储
  config.redis = {
    client: {
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      password: '',
      db: 2,
    },
  }
  // *上传文件的配置
  config.multipart = {
    fileSize: '2048mb',// 最大50mb
    mode: 'stream',// 以流的模式
    fileExtensions: ['.xls', '.txt', '.jpg', '.JPG', '.png', '.PNG', '.gif', '.GIF', '.jpeg', '.JPEG'],
    // 扩展几种上传的文件格式
  };

  return {
    ...config,
    ...userConfig,
  };
};
