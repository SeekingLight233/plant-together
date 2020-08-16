// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();
const db = cloud.database();
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const countResult = await db.collection('rooms').count();
  const total = countResult.total;
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100);
  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = db
      .collection('rooms')
      .skip(i * MAX_LIMIT)
      .limit(MAX_LIMIT)
      .get();
    tasks.push(promise);
  }
  // 等待所有
  const result = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  });

  const roomList = result.data;
  const now = Date.now();
  if (roomList.length === 0) {
    return;
  }
  for (let item of roomList) {
    const { openid, member, startTime, roomid, treeImg } = item;
    console.log(item);
    if (now + 180000 > startTime.getTime() && item.isSendMessage == 0) {
      // 发送提醒通知
      // 创建房间的时候要允许通知

      //如果订阅人列表为空，到时间后自动删除
      if (member.length === 0) {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          miniprogramState: 'formal',
          data: {
            thing4: {
              value: '你创建的房间还有3分钟就要开始了!',
            },
            thing2: {
              value: `还没有人订阅你的房间，去群里喊下试试吧！`,
            },
            thing7: {
              value: '系统已自动删除你创建的房间',
            },
          },
          templateId: 'xJt2V_5ts8PraYykjPkeW1kCtubPRcnvTU177FLugRg',
        });
        await db.collection('rooms').where({ roomid }).remove();
        return '自动删除空订阅房间';
      }

      await cloud.openapi.subscribeMessage.send({
        touser: openid,
        page: `/pages/notice/notice?roomid=${roomid}&img=${treeImg}`,
        miniprogramState: 'formal',
        data: {
          thing4: {
            value: '你创建的房间还有3分钟就要开始了!',
          },
          thing2: {
            value: `共有${member.length}人订阅了你的房间`,
          },
          thing7: {
            value: '点击此处输入密钥或粘贴分享链接',
          },
        },
        templateId: 'xJt2V_5ts8PraYykjPkeW1kCtubPRcnvTU177FLugRg',
      });
      console.log('send message ok!');
      await db
        .collection('rooms')
        .where({
          roomid,
        })
        .update({
          data: {
            isSendMessage: 1,
          },
        });
    }
  }
};
