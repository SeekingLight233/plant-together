const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()
    const db = cloud.database()

    let result = undefined;

    const res = await db.collection('users').where({
        openid: wxContext.OPENID
    }).get()


    if (res.data.length === 0) {
        await db.collection('users').add({
            data: {
                openid: wxContext.OPENID,
                createdRoomid: 0,
                subscribeRoomid: [],
                deleteRoomid: 0,
            }
        })
        result = await db.collection('users').where({
            openid: wxContext.OPENID
        }).get()
    } else {
        result = res
    }

    return {
        result: result.data[0]
    }
}