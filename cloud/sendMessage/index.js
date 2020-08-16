// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

//1. 通过openid获取到房间信息
//2. 取出房间信息中的所有成员，发送通知
//3. 删除房间

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const key = event.key;
  const roomid = Number(event.roomid);
  console.log('roomid');

  const room = await db
    .collection('rooms')
    .where({
      roomid,
    })
    .get();

  // console.log(room);
  const roomInfo = room.data[0];
  const member = roomInfo.member;
  const waitDuration = roomInfo.waitDuration;
  const treeImg = roomInfo.treeImg;
  // console.log(wxContext.OPENID);
  // console.log(member);

  let sendTasks = [];
  let getTasks = [];

  for (let item of member) {
    // console.log('send ok');
    // console.log(item);
    const sendPromise = cloud.openapi.subscribeMessage.send({
      touser: item,
      data: {
        thing1: {
          value: `你订阅的房间还有${waitDuration}就要开始了！`,
        },
        thing2: {
          value: `密钥为${key}，点击进入可一键复制`,
        },
      },
      templateId: 'abOUGyaz6e3iZgG8DXXMjusvNJ80vlp2f7Ka_uvTDrc',
      page: `/pages/notice/notice?key=${key}&img=${treeImg}`,
      miniprogramState: 'formal',
    });
    sendTasks.push(sendPromise);

    // 获取用户的订阅房间
    const getPromise = db.collection('users').where({ openid: item }).get();
    getTasks.push(getPromise);

    // const { subscribeRoomid } = res.data[0]
    // const newSubscribeRoomid = subscribeRoomid.filter(val => val !== roomid)
    // await db.collection('users').where({
    //   openid: item
    // }).update({
    //   data: {
    //     subscribeRoomid: newSubscribeRoomid
    //   }
    // })
    // await db.collection('rooms').where({ roomid }).remove()
  }
  // 发送广播
  await Promise.all(sendTasks);

  let updateTasks = [];
  let removeTasks = [];
  try {
    let userList = await Promise.all(getTasks);
    for (let user of userList) {
      const { subscribeRoomid, openid } = user.data[0];
      const newSubscribeRoomid = subscribeRoomid.filter(
        (val) => val !== roomid
      );
      const updatePromise = db
        .collection('users')
        .where({
          openid,
        })
        .update({
          data: {
            subscribeRoomid: newSubscribeRoomid,
          },
        });
      updateTasks.push(updatePromise);
    }
    await Promise.all(updateTasks);
    // 最后删除房间
    await db.collection('rooms').where({ roomid }).remove();
    console.log('--------------------------end---------------------------');
  } catch (error) {
    return `出现异常`;
  }

  return {};
};
