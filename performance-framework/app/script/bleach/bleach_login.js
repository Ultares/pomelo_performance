/**
 * Created by Administrator on 2015/4/24.
 */

var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var Bleach = require('dena-client').bleach.Bleach;
var Protobuf = require('dena-client').bleach.Protobuf;

//var actor = {}
//actor.actorId = '19860115';
//actor.debug = true;
//actor.server = {
//    host: '10.96.29.54',
//    port: 3333
//}

var START = 'start';
var END = 'end';

var ActFlagType = {
    LOGIN_LOGIN: 0,
    LOGIN_GATEW: 1,
    CREATE_ROLE: 2,
    SELECT_ROLE_ONLINE: 3
}

var monitor = function (type, name, reqId) {
    if (actor.debug) {
        console.info(Array.prototype.slice.call(arguments, 0));
        return;
    }

    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

/////////////////////////////////////////////////////////////

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    CONNECT_GATEW_OK: 1,
    GET_ROLELIST_OK: 2,
    GET_ROLEINFO_OK: 3,
    INIT_ROLEINFO_OK: 4
}

var bleach = new Bleach();

console.log(actor.server)
bleach.connect(actor.server, function () {
    console.log('tcp-socket connect to loginserver!');
    bleach.run();
});

bleach.actions.push(
    function () {
        // TICK_CMD
        bleach.register(Protobuf.basetype.EProtoId.TICK_CMD,
            function (message) {
                bleach.request(Protobuf.basetype.EProtoId.TICK_CMD);
            }
        );

        // ERROR_CODE_S
        bleach.register(Protobuf.basetype.EProtoId.ERROR_CODE_S,
            function (message) {
                var messageErrorCode = Protobuf.errorcode.MessageErrorCode.decode(message);

                switch (messageErrorCode.code) {
                    default:
                        console.log('Actor %s Error_Code_S code : %s.', actor.actorId, messageErrorCode.code.toString(16));
                }
            }
        );
    },

    function () {
        // 验证
        bleach.request(Protobuf.basetype.EProtoId.VERIFY_VERSION,
            Protobuf.login.VerifyVersion.encode({
                clientversion: 1
            })
        );

        // 登陆 LoginServer 获取网关
        monitor(START, 'loginLogin', ActFlagType.LOGIN_LOGIN);
        bleach.request(Protobuf.basetype.EProtoId.LOGIN_LOGIN_REQ,
            Protobuf.login.LoginReq.encode({
                accountid: actor.actorId
            }),
            Protobuf.basetype.EProtoId.LOGIN_LOGIN_RET,
            function (message) {
                monitor(END, 'loginLogin', ActFlagType.LOGIN_LOGIN);
                bleach.loginRet = Protobuf.login.LoginRet.decode(message);

                bleach.close();
                bleach.connect({
                    port: bleach.loginRet.gatewayport,
                    host: bleach.loginRet.gatewayip
                }, function () {
                    console.log('tcp-socket connect to gatewayserver!');
                    bleach.STATE = ROBOT_STATE.CONNECT_GATEW_OK;
                });
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.CONNECT_GATEW_OK)
            return 1

        // 登陆网关
        monitor(START, 'loginGatew', ActFlagType.LOGIN_GATEW);
        bleach.request(Protobuf.basetype.EProtoId.LOGIN_GATEW_REQ,
            Protobuf.login.LoginGatewayReq.encode({
                accountid: bleach.loginRet.accountid,
                token: bleach.loginRet.token
            }),
            Protobuf.basetype.EProtoId.LOGIN_GATEW_RET,
            function (message) {
                monitor(END, 'loginGatew', ActFlagType.LOGIN_GATEW);
            }
        );

        // SEND_ROLE_LIST
        bleach.register(Protobuf.basetype.EProtoId.SEND_ROLE_LIST,
            function (message) {
                bleach.roleList = Protobuf.role.RoleList.decode(message);

                if (bleach.roleList.rolebase.length) {
                    bleach.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                } else {
                    monitor(START, 'createRole', ActFlagType.CREATE_ROLE);
                    bleach.request(Protobuf.basetype.EProtoId.CREATE_ROLE_REQ,
                        Protobuf.role.CreateRoleReq.encode({
                            roletype: [11103000, 11104000][random.integer(0, 1)],
                            rolename: uuid.v1().replace(/-/g, ''),
                            sex: 0
                        }),
                        Protobuf.basetype.EProtoId.CREATE_ROLE_RET,
                        function (message) {
                            monitor(END, 'createRole', ActFlagType.CREATE_ROLE);
                            bleach.roleList.rolebase.push(Protobuf.role.CreateRoleRet.decode(message).rolebase);
                            bleach.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                        }
                    );
                }
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.GET_ROLELIST_OK)
            return 1

        // 选角登陆
        monitor(START, 'selectRoleOnline', ActFlagType.SELECT_ROLE_ONLINE);
        bleach.request(Protobuf.basetype.EProtoId.SELECT_ROLE_ONLINE,
            Protobuf.role.SelectRoleOnline.encode({
                roleid: bleach.roleList.rolebase[0].roleid
            })
        );

        // SCENE_ENTERSCENE_S
        bleach.register(Protobuf.basetype.EProtoId.SCENE_ENTERSCENE_S,
            function (message) {
                monitor(END, 'selectRoleOnline', ActFlagType.SELECT_ROLE_ONLINE);
                bleach.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
            return 1

        var gmCmd = '//level num=25';
        bleach.request(Protobuf.basetype.EProtoId.CHAT_PRIVATE_REQ,
            Protobuf.chat.ChatPrivateReq.encode({
                roleid: 0,
                text: gmCmd
            })
        );

        console.log('--------')
    },

    function () {
        setInterval(function () {
        }, bleach.responseOverTime);
    }
);