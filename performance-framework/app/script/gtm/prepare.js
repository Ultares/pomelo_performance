var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var GtmClient = require('dena-client').gtm;
var Gtm = GtmClient.Gtm;
var Protobuf = GtmClient.Protobuf;


var START = 'start';
var END = 'end';

var ActFlagType = {
    LOGIN_C: 0,
    CREATEROLE_C: 1,
    ENTERGAME_C: 2
};

var StepStats = {
    Step_Login: 0,
    Step_EnterGame: 1,
    Setp_GMGold: 2,
    Setp_GMEquip: 3,
    Setp_GMGems: 4,
    Setp_LoopPrevious: 5
};

var gtm = new Gtm();

var monitor = function (type, name, reqId) {
    //console.log('%s monitor %s %s', type, actor.actorId, name);
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

gtm.connect(actor.server, function () {  //actor.server
    if (gtm.caseData.debug) {
        console.log('[%s] : tcp-socket connect to gtmServer!', actor.actorId);
    }
    gtm.run();
});

Gtm.prototype.getEProtoid = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0].slice(1);
    var pName = mType.replace('Message', '').toLowerCase();
    var EProtoId = Protobuf[pName][mType][EProtoStr];
    return EProtoId;

};

gtm.actions.push(
    function () {
        gtm.register(gtm.getEProtoid('eMessageUtils_Ping_CS'),
            function (message) {
                gtm.request(gtm.getEProtoid('eMessageUtils_Ping_CS'),
                    Protobuf['role']['MessageUtilsPing'].encode({})
                )
            }
        );

        gtm.register(gtm.getEProtoid('eMessageUtils_Errorcode_S'),
            function (message) {
                var messageUtilsErrorcode = Protobuf['utils']['MessageUtilsErrorcode'].decode(message);
                switch (messageUtilsErrorcode.result) {
                    default:
                        console.log('gtm.caseData=============>', JSON.stringify(gtm.caseData));
                        console.log('Actor %s eMessageUtils_Errorcode_S result : %s.', actor.actorId, messageUtilsErrorcode.result.toString(16).toUpperCase());
                }
            }
        );
    },

    function () {
        gtm.caseData.account = actor.actorId.split('|');
        gtm.request(gtm.getEProtoid('eMessageRole_Login_C'),
            Protobuf['role']['MessageRoleLogin'].encode({
                account: gtm.caseData.account[0],
                zoneindex: parseInt(gtm.caseData.account[1]),
                token: gtm.caseData.account[2],
                clienthost: '',
                credential: '',
                version: '9.0.1'

            }),
            gtm.getEProtoid('eMessageRole_RoleList_S'),
            function (message) {
                gtm.caseData.RoleList = Protobuf['role']['MessageRoleList'].decode(message);
                if (gtm.caseData.RoleList['rolelist'].length) {
                    gtm.caseData.StepStats = StepStats.Step_Login;
                } else {
                    gtm.request(gtm.getEProtoid('eMessageRole_CreateRole_C'),
                        Protobuf['role']['MessageCreateRoleRequest'].encode({
                            account: gtm.caseData.account[0],
                            zoneindex: parseInt(gtm.caseData.account[1]),
                            rolename: 'robot_' + gtm.caseData.account[0], //uuid.v1().replace(/-/g, '').substr(0, 12),
                            heroid: 10001
                        }),
                        gtm.getEProtoid('eMessageRole_CreateRole_S'),
                        function (message) {
                            gtm.caseData.CreateRole = Protobuf['role']['MessageCreateRoleResponse'].decode(message);
                            gtm.caseData.StepStats = StepStats.Step_Login;
                        }
                    );
                }
            }
        );
    },

    function () {
        if (gtm.caseData.StepStats !== StepStats.Step_Login) {
            return 1
        }
        setTimeout(function () {
            if ('CreateRole' in gtm.caseData) {
                gtm.caseData.roleid = gtm.caseData['CreateRole']['roleid'];
            } else {
                gtm.caseData.roleid = gtm.caseData.RoleList['rolelist'][0].roleid;
            }
            gtm.request(gtm.getEProtoid('eMessageRole_EnterGame_C'),
                Protobuf['role']['MessageRoleEnterGame'].encode({
                    roleid: gtm.caseData.roleid,
                    token: gtm.caseData.RoleList['entertoken'],
                    clienthost: '',
                    clientport: 8000
                }),
                gtm.getEProtoid('eMessageRole_RoleDetail_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_RoleDetail_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#clearbag '  //gold
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_Chat_CS'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 1 999999 '  //gold
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_PropChange_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 2 100000 '
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_PropChange_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 3 100000 '
                }),
                gtm.getEProtoid('eMessageRole_ExpChange_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_ExpChange_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {

            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 5 99999 '
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_PropChange_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 6 100000 ' //vip
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_PropChange_S'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 22025001 1 '  //equipment
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_Chat_CS'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 24010001 9999' //demo
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    gtm.unregister(gtm.getEProtoid('eMessageRole_Chat_CS'));
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        if (!gtm.caseData.previous) {
            return 1;
        }
        gtm.caseData.previous = false;
        setTimeout(function () {
            gtm.request(gtm.getEProtoid('eMessageRole_ChangeSakasho_C'),
                Protobuf['role']['MessageRoleChangeSakashoRequest'].encode({
                    age: 2
                }),
                gtm.getEProtoid('eMessageRole_ChangeSakasho_S'),
                function (message) {
                    gtm.caseData.previous = true;
                }
            );
        }, gtm.randomIntTime());
    },

    function () {
        console.log('Ready for test!');
        //return 1;
    },

    function () {
        setTimeout(function () {
            //gtm.close();
        }, gtm.responseOverTime);
    }
);
