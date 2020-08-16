// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const result = undefined;
  const { roomid, cancelSubscribe, subscribeRoomid } = event;

  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const db = cloud.database();
  // 更新房间的member字段
  const roomRes = await db.collection('rooms').where({ roomid }).get();
  let member = roomRes.data[0].member;

  if (!cancelSubscribe) {
    console.log('订阅');
    member.push(openid);
    // 如果是订阅，就在用户的订阅列表中添加该房间号
    await db
      .collection('users')
      .where({
        openid,
      })
      .update({
        data: {
          subscribeRoomid: subscribeRoomid,
        },
      });
  } else {
    console.log('取消订阅');
    member = member.filter((val) => val !== openid);
    // 如果是取消订阅，就在用户的订阅列表中删除该房间号
    const queryRes = await db.collection('users').where({ openid }).get();

    await db
      .collection('users')
      .where({
        openid,
      })
      .update({
        data: {
          subscribeRoomid: subscribeRoomid,
        },
      });
  }
  console.log(member);
  await db
    .collection('rooms')
    .where({
      roomid,
    })
    .update({
      data: {
        member,
      },
    });
  console.log('-------------更新成功---------------');
};
