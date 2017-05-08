/**
 * Created by yong.liu on 2015/5/20.
 */

var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
//var GtmClient = require('dena-client').gtm;
//var Gtm = GtmClient.Gtm;
//var Protobuf = GtmClient.Protobuf;

var START = 'start';
var END = 'end';

var ActFlagType = {
    LOGIN_C: 0,
    CREATEROLE_C: 1,
    ENTERGAME_C: 2
}

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    GET_ROLELIST_OK: 2
}

var gtm = new Gtm();

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

//var actorId = '100821'
//var qa3999 = {
//    "host": "10.96.39.99",
//    "port": 8005
//}

gtm.connect(actor.server, function () {
    console.log('tcp-socket connect to gtmServer!');
    gtm.run();
});

gtm.actions.push(
    function () {
        // eMessageUtils_Ping_CS
        gtm.register(Protobuf.utils.MessageUtils.eMessageUtils_Ping_CS,
            function (message) {
                gtm.request(Protobuf.role.MessageRole.eMessageUtils_Ping_CS,
                    Protobuf.role.MessageUtilsPing.encode({})
                )
            }
        );

        // eMessageUtils_Errorcode_S
        gtm.register(Protobuf.utils.MessageUtils.eMessageUtils_Errorcode_S,
            function (message) {
                var messageUtilsErrorcode = Protobuf.utils.MessageUtilsErrorcode.decode(message);

                switch (messageUtilsErrorcode.result) {
                    default:
                        console.log('Actor %s eMessageUtils_Errorcode_S result : %s.', actor.actorId, messageUtilsErrorcode.result.toString(16));
                }
            }
        );
    },

    function () {
        // eMessageRole_Login_C
        monitor(START, 'eMessageRole_Login_C', ActFlagType.LOGIN_C);
        gtm.request(Protobuf.role.MessageRole.eMessageRole_Login_C,
            Protobuf.role.MessageRoleLogin.encode({
                account: actor.actorId,
                zoneindex: 1
            }),
            Protobuf.role.MessageRole.eMessageRole_RoleList_S,
            function (message) {
                monitor(END, 'eMessageRole_Login_C', ActFlagType.LOGIN_C);
                gtm.messageRoleList = Protobuf.role.MessageRoleList.decode(message);

                if (gtm.messageRoleList.rolelist.length) {
                    gtm.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                } else {
                    monitor(START, 'eMessageRole_CreateRole_C', ActFlagType.CREATEROLE_C);
                    gtm.request(Protobuf.role.MessageRole.eMessageRole_CreateRole_C,
                        Protobuf.role.MessageCreateRoleRequest.encode({
                            account: actor.actorId,
                            zoneindex: 1,
                            rolename: uuid.v1().replace(/-/g, ''),
                            heroid: 10001
                        }),
                        Protobuf.role.MessageRole.eMessageRole_CreateRole_S,
                        function (message) {
                            monitor(END, 'eMessageRole_CreateRole_C', ActFlagType.CREATEROLE_C);
                            gtm.messageRoleList.rolelist.push(Protobuf.role.MessageCreateRoleResponse.decode(message));
                            gtm.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                        }
                    );
                }
            }
        );
    },

    function () {
        if (gtm.STATE != ROBOT_STATE.GET_ROLELIST_OK)
            return 1

        // eMessageRole_EnterGame_C
        monitor(START, 'eMessageRole_EnterGame_C', ActFlagType.ENTERGAME_C);
        gtm.request(Protobuf.role.MessageRole.eMessageRole_EnterGame_C,
            Protobuf.role.MessageRoleEnterGame.encode({
                roleid: gtm.messageRoleList.rolelist[0].roleid,
                token: '',
                clienthost: '',
                clientport: 8000
            }),
            Protobuf.role.MessageRole.eMessageScene_EnterScene_S,
            function (message) {
                monitor(END, 'eMessageRole_EnterGame_C', ActFlagType.ENTERGAME_C);
            }
        );
    },

    function () {
        setTimeout(function () {
            //gtm.close();
        }, gtm.responseOverTime);
    }
);