// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const resolveTime = (time) => {
  //2019年10月1日 15:01
  const year = time.getFullYear();
  const month = time.getMonth() + 1;
  const day = time.getDate();
  const hour = time.getHours();
  const minutes = time.getMinutes();
  return `${year}年${month}月${day}日 ${hour}:${minutes}`;
};

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const roomid = Number(event.roomid);
  const finish = event.finish;

  let res = await db.collection('rooms').where({ roomid }).get();
  const deleteRoomMember = res.data[0].member;
  const startTime = res.data[0].startTime;

  console.log(roomid);
  console.log(deleteRoomMember);

  if (deleteRoomMember.length === 0) {
    await db.collection('rooms').where({ roomid }).remove();
    return '删除空房间成功！';
  }

  for (let item of deleteRoomMember) {
    // finish不为空说明是房主手动删除，此时需要通知其他用户
    if (finish == null) {
      try {
        const result = await cloud.openapi.subscribeMessage.send({
          touser: item,
          data: {
            thing1: {
              value: '你订阅的forest房间已被房主删除',
            },
            date2: {
              value: resolveTime(startTime),
            },
          },
          templateId: 'o9sg1eEZKjjCia3eHA_hvd_Ov9KDX4sNXeqaff_QLVw',
        });
      } catch (error) {
        const res = await db.collection('users').where({ openid: item }).get();
        console.log(res.data[0]);
        const { subscribeRoomid } = res.data[0];
        const newSubscribeRoomid = subscribeRoomid.filter(
          (val) => val !== roomid
        );

        await db
          .collection('users')
          .where({
            openid: item,
          })
          .update({
            data: {
              subscribeRoomid: newSubscribeRoomid,
            },
          });
        await db.collection('rooms').where({ roomid }).remove();
        return;
      }
    }

    // 获取用户的订阅房间
    const res = await db.collection('users').where({ openid: item }).get();
    console.log(res.data[0]);
    const { subscribeRoomid } = res.data[0];
    const newSubscribeRoomid = subscribeRoomid.filter((val) => val !== roomid);

    await db
      .collection('users')
      .where({
        openid: item,
      })
      .update({
        data: {
          subscribeRoomid: newSubscribeRoomid,
        },
      });
  }

  await db.collection('rooms').where({ roomid }).remove();

  return {};
};
