'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {// 后期需要拆分各种路由，或者写出更加Restfull的路由设置
  const { router, controller } = app;
  // 测试接口
  router.get('/', controller.home.index);

  // 测试接口:get所有用户
  router.get('/users', controller.user.index);
  // 注册接口
  router.post('/reg', controller.user.reg);
  // 登录接口
  router.post('/login', controller.user.login);
  // 登出接口，需token 
  router.post('/logout', controller.user.logout);
  // 修改个人资料接口，需要token
  router.post('/user/update', controller.user.update);

  // get所有category
  router.get('/cates', controller.category.index);

  // 上传文件接口，需token
  router.post('/upload', controller.file.upload);

  // 测试接口:get特定所有作品
  router.get('/videos', controller.video.homeIndex);
  // 创建作品，需token
  router.post('/video', controller.video.create);
  // 分页查询指定分类的作品列表信息
  router.get('/category/:category_id/video/:page', controller.video.list);
  // 修改作品，需token
  router.post('/video/update', controller.video.update);
  // 删除作品，需token
  router.post('/video/delete', controller.video.delete);
  // 分页查询指定用户的作品列表信息
  router.get('/video_list/:page', controller.video.index);

  // 获取特定作品的所有章节
  router.get('/video_detail_list/:video_id', controller.videoDetail.list);

  // 为作品添加新章节，需token
  router.post('/video_detail/save', controller.videoDetail.save);
  /**
   * /video_detail/destroy写在/video_detail/:id才能保证优先匹配前者
   *  路由路径配置不当会产生冲突，比如/:id就和/news,会把news当成id了
   */
  // 为作品删除章节，需token
  router.post('/video_detail/destroy', controller.videoDetail.destroy);
  // 为作品修改章节，需token
  router.post('/video_detail/:id', controller.videoDetail.update);

  // 收藏/取消收藏作品接口
  router.post('/fava/video', controller.fava.video);
  // 分页查询指定用户的作品列表信息,什么玩意，谁都能查
  router.get('/fava_list/:page', controller.fava.list);


  // 测试接口 查询整个app的评论
  router.get('/video_comment', controller.comment.index);
  // 提交评论或回复
  router.post('/comment', controller.comment.create);
  // 分页查询指定作品的评论和回复内容,包含每条评论和回复的用户的基本信息
  router.get('/video_comment/:id/:page', controller.video.comment);


  // 关注和粉丝路由
  router.post('/user/follow', controller.follow.follow);
  router.get('/user/follows/:page', controller.follow.follows);
  router.get('/user/fans/:page', controller.follow.fans);
  router.post('/user/unfollow', controller.follow.unfollow);

  // 统计相关数据
  router.get('/user/statistics', controller.user.statistics);
  router.get('/user/space_statistics/:id', controller.user.spaceStatistics);

  // 视频详情的数据
  router.get('/video_read/:id', controller.video.read);
  router.post('/video_play/submit', controller.videoPlay.submit);

  // 获取用户相关信息
  router.get('/user/user_info', controller.user.user_info);

  // 查询某个ip的历史记录
  router.get('/user/history/:page', controller.videoPlay.list);
  // 清楚某个ip的历史记录
  router.post('/user/history/clear', controller.videoPlay.clear);
  // router.get('/user/historys', controller.videoPlay.list);
  // router.get('/videos', controller.video.index);
  // 资源路由写法
  // router.resources('news', '/news', app.controller.news);
  // 路由js导入
  // require('./router/news')(app);
  // 路由重定向写法
  // router.redirect('/', '/home/index', 302);
};
