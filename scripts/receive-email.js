// @ts-check
'use strict';
// receive-email.js

const Imap = require('imap'); // 返回 connection 类
const MailParser = require("mailparser").MailParser;
const fs = require("fs");
const moment = require('moment');
const config = require('./config');


const date = moment().subtract(1, 'days').format('MMM DD, YYYY');
const dateStandard = moment().subtract(1, 'days').format('YYYY-MM-DD');


const imap = new Imap({
  user: config.mailUser, // 邮箱账号
  password: config.mailPassword, // 邮箱密码或授权码
  host: config.mailHost, // IMAP 服务器地址
  port: 993, // IMAP 服务器端口号
  tls: true, // 使用安全传输协议
  tlsOptions: { rejectUnauthorized: false } // 禁用对证书有效性的检查
});

fs.writeFileSync(`../html/mediaNames.txt`, '', 'utf8');


// 主函数
imap.connect();


// 'ready' 连接成功时启动回调
imap.once('ready', () => {
  console.log("Email server connection succeed.");

  imap.openBox('INBOX', true, (err, box) => { // box 对象指向打开的邮箱

    // 搜索某日期以后（包含）的所有邮件，results为搜索结果
    imap.search(['ALL', ['SINCE', date]], (err, results) => {

      // 依次抓取搜索结果中所有的邮件
      const f = imap.fetch(results, { bodies: '' }); // bodies的值：HEADER 为邮件头，TEXT 为正文, '' 为全部内容（邮件头+正文）

      // 'message'事件：每当抓取一封符合条件的邮件时，启动回调。msg是抓取到的邮件内容，seqno是序号。
      f.on('message', (msg, seqno) => {

        const mailParser = new MailParser(); // 实例化一个解析器

        msg.on('body', (stream, info) => {

          // 将msg这个stream pipe到mailParser
          stream.pipe(mailParser);

          //邮件头
          mailParser.on("headers", headers => {
            console.log("邮件头信息>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

            const receiveTime = moment(headers.get('date')).format('HH[时]mm[分]ss[秒]');
            console.log("邮件主题: " + headers.get('subject'));
            console.log("发件人: " + headers.get('from')["value"][0].name);
            console.log("收件人: " + headers.get('to')["text"]);

            const media = {
              id: seqno,
              name: receiveTime + '【' + headers.get('from')["value"][0].name + '】' + headers.get('subject'),
            };
            fs.appendFileSync(`../html/mediaNames.txt`, JSON.stringify(media) + '\n', 'utf8');
          });

          //邮件主体
          mailParser.on("data", data => { // data 是一个对象
            if (data.type === 'text') { //邮件正文
              // console.log("邮件内容信息>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
              // console.log("邮件内容: " + data.html);
              fs.writeFileSync(`../html/${seqno}.html`, data.html, 'utf8');
            }
            // if (data.type === 'attachment') { //附件
            //   console.log("邮件附件信息>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            //   console.log("附件名称:" + data.filename);//打印附件的名称
            //   data.content.pipe(fs.createWriteStream(data.filename));//保存附件到当前目录下
            //   data.release();
            // }
          });
        });
        // msg.once('end', () => console.log(seqno + '完成'));
      });

      f.once('error', err => console.error);
      f.once('end', () => {
        console.log('邮件抓取完成!');
        imap.end();
      });
    });
  });

});


imap.once('error', console.log);


// 将读取并保存的文件按照邮件名重命名
imap.once('end', () => {
  console.log('Email server connection ended.');

  const mediaNames = fs.readFileSync(`../html/mediaNames.txt`, 'utf8')
    .trim() // 去掉最后一个 '\n'
    .replace(/\n/g, ','); // 将其他 '\n' 替换为 ','
  const mediaArray = JSON.parse('[' + mediaNames + ']');
  mediaArray.forEach(media => {
    fs.renameSync(`../html/${media.id}.html`, `../html/${dateStandard}-${media.name}.html`);
  });

  fs.unlinkSync(`../html/mediaNames.txt`);
});