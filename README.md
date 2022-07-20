## 🖊 简介

Forest 开车助手是一个基于《Forest 专注森林》的信息发布订阅平台，你可以在这个小程序中分享，发布与订阅 Forest 房间信息。

使用`Taro`+`Typescript`构建，核心逻辑基于订阅消息 api 实现。

## 🧾 核心 Feature & Todo

- [x] 房主创建预定 Forest 房间，不需要输入房间密钥
- [x] 其他用户可通过分享卡片或房间广场订阅房间
- [x] 到达指定时间系统提示房主创建房间，创建成功后将房间密钥通知给所有订阅人，并删除房间
- [x] 若房主提前删除预定房间，系统会自动通知所有订阅人
- [x] 创建即时 Forest 房间，房主需输入密钥。用户可通过卡片直接复制房间密钥
- [ ] 创建即时 Forest 房间后，用户可在房间广场直接拷贝房间密钥

## 📱 扫码体验

![](./raw/01.png)

## 🔧 安装

```shell
$ yarn global add @tarojs/cli
$ yarn
```

然后在根目录创建`project.config.json`：
配置`cloudfunctionRoot`为`cloud/`,`miniprogramRoot`为`client/dist/`，以及`appid`。

## 🏍 运行

```shell
$ yarn dev:weapp
```

## :camera: 截图

![](./raw/snapshot.png)
![](./raw/notice.png)

_关于截图中小程序名称和 icon 与实际不一致的问题_

> 由于微信端的审核问题，期间曾将个人认证更换为企业认证，具体以线上为准。
