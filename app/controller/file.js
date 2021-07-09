'use strict';

const Controller = require('egg').Controller;
const fs = require('fs');// node自带模块
const path = require('path');// node自带模块
//故名思意 异步二进制 写入流
const awaitWriteStream = require('await-stream-ready').write;
//管道读入一个虫洞。
const sendToWormhole = require('stream-wormhole');
const dayjs = require('dayjs');// dayjs用来制作日期

class FileController extends Controller {

    /**
     * 上传
     */
    async upload() {
        // 从ctx获取文件流stream,这对传参就有要求了，你要注意
        // ?我form-data不叫files行不行
        const stream = await this.ctx.getFileStream();
        // 基础的目录
        const uploadBasePath = 'app/public/uploads';
        // 生成文件名
        const filename = `${Date.now()}${Number.parseInt(
            Math.random() * 1000,// extname是拓展名
        )}${path.extname(stream.filename).toLocaleLowerCase()}`;
        // 生成文件夹，那么也就是一次上传就会生成一个文件夹
        // ?那么如何传送多个文件呢
        const dirname = dayjs(Date.now()).format('YYYYMMDD');
        /**
         * 
         * @param {*} dirname 文件夹路径
         * @returns 
         */
        function mkdirsSync(dirname) {
            // console.log('文件夹是否存在?', fs.existsSync(dirname))
            if (fs.existsSync(dirname)) {// 如果文件夹存在，不需要创建
                return true;
            } else {// 如果文件夹不存在，需要创建
                // console.log('这什么几把意思', mkdirsSync(path.dirname(dirname)))
                console.log(path.dirname(dirname))// 喂，是返回他的目录耶看清楚
                // 麻蛋 fs是文件管理，path，是目录管理啊
                // 文件夹是要递归创建的
                if (mkdirsSync(path.dirname(dirname))) {
                    //! mkdirsSync(path.dirname(dirname))你这个递归我操你妈
                    fs.mkdirSync(dirname);// 创建文件夹
                    return true;
                }
            }
        }
        mkdirsSync(path.join(uploadBasePath, dirname));
        // 生成写入路径
        const target = path.join(uploadBasePath, dirname, filename);
        // 写入流
        const writeStream = fs.createWriteStream(target);// fs模块创建写入流(参数是写入流target目标)
        try {
            // awaitWriteStream异步完成这个写入流writeStream的写入WriteStream
            // stream.pipe(writeStream)返回值仍然是一个writeStream，writeStream对接了一个文件流stream
            // pipe管道，stream文件流连接写入流(某个目标位置)
            // stream文件流，从请求里传过来的一个文件转成文件流
            // 连接写入流(指写到文件系统一个目标位置，即使目标位置有文件也会被覆盖)
            //异步把文件流 写入
            await awaitWriteStream(stream.pipe(writeStream));
        } catch (err) {
            //如果出现错误，关闭管道
            await sendToWormhole(stream);
            this.ctx.throw(500, err);
        }
        const { protocol, host } = this.ctx.request;
        // 抓到接口和主机ip
        let url = path.join('/public/uploads', dirname, filename).replace(/\\|\//g, '/');
        //![ /(检索开头) \\(转义字符\) |(或运算符) \/(转义字符/) /(检索结尾) g(全局匹配修饰符) ]
        // https://blog.csdn.net/lvshubao1314/article/details/51222978?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-1.control&dist_request_id=1331969.292.16184984331501479&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-1.control
        // 为什么使用正则?如何正确使用正则
        url = protocol + '://' + host + url
        this.ctx.apiSuccess({ url });
        return url
    }
}

module.exports = FileController;