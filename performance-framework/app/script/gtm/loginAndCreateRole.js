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

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    GET_ROLELIST_OK: 2
};

var gtm = new Gtm();


var monitor = function (type, name, reqId) {
    console.log('%s monitor %s %s', type, actor.actorId, name);
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

//var actor = {};
//
//actor.actorId = '1505070065';
//actor.debug = true;
//actor.server = {
//    host: '10.96.39.99',
//    port: 8005
//};
//
//var monitor = function (type, name, reqId) {
//    if (actor.debug) {
//        console.info(Array.prototype.slice.call(arguments, 0));
//        return;
//    }
//
//    if (typeof actor !== 'undefined') {
//        actor.emit(type, name, reqId);
//    } else {
//        console.error(Array.prototype.slice.call(arguments, 0));
//    }
//};

gtm.connect(actor.server, function () {  //actor.server
    console.log('[%s] : tcp-socket connect to gtmServer!', actor.actorId);
    gtm.run();
});

function getEProtoid(EProtoStr) {

    var mType = EProtoStr.split('_')[0].slice(1);
    var pName = mType.replace('Message', '').toLowerCase();
    var EProtoId = Protobuf[pName][mType][EProtoStr];

    return EProtoId;

}

Gtm.prototype.simpleRequest = function (EProtoStr, EncodeMsg, DecodeMsg) {

    //EProtoBody {fn: '',opts:{}}
    //DecodeMsg  {fn: '',DProtoStr:'',cb:callback,save:false,monitor:true,setPrevious: false,not}

    var DecodeMsg = (DecodeMsg === undefined || DecodeMsg === null) ? {} : DecodeMsg;
    var isSave = (DecodeMsg['save'] == undefined) ? false : DecodeMsg.save;
    var setPrevious = (DecodeMsg['setPrevious'] == undefined) ? false : DecodeMsg.setPrevious;
    var ismonitor = (DecodeMsg['monitor'] == undefined) ? true : DecodeMsg['monitor'];
    var eOpts = (EncodeMsg['opts'] == undefined) ? {} : EncodeMsg['opts'];
    var cb = (DecodeMsg['cb'] == undefined) ? false : DecodeMsg['cb'];
    var mType = EProtoStr.split('_')[0].slice(1);
    var pName = mType.replace('Message', '').toLowerCase();
    var EProtoId = Protobuf[pName][mType][EProtoStr];
    var DProtoId_S = (DecodeMsg['DProtoStr'] == undefined) ? Protobuf[pName][mType][EProtoStr.replace(/_C$/, '_S')] : getEProtoid(DecodeMsg['DProtoStr']);
    var saveMs = EProtoStr.split('_')[1];

    if (!!ismonitor) {
        monitor(START, EProtoStr, saveMs);
    }

    gtm.request(EProtoId,
        Protobuf[pName][EncodeMsg['fn']].encode(eOpts),
        DProtoId_S,
        function (message) {

            if (!!isSave) {
                var dFuncName = (DecodeMsg['fn'] === undefined) ? EncodeMsg['fn'].replace(/Request$/, 'Response') : DecodeMsg['fn'];
                var dpName = pName;
                if (DecodeMsg['DProtoStr'] !== undefined) {
                    dpName = DecodeMsg['DProtoStr'].split('_')[0].replace('eMessage', '').toLowerCase();
                }
                gtm.caseData[saveMs] = Protobuf[dpName][dFuncName].decode(message);
                if (gtm.caseData.debug) {
                    console.log('[%s] %s: Get HeroList [%s]', new Date().toLocaleTimeString(), 'INFO', gtm.caseData[saveMs]);
                }

            }

            if (cb) {
                cb();
            }

            if (ismonitor) {
                monitor(END, EProtoStr, saveMs);
            }
            if (setPrevious) {
                gtm.caseData.previous = true;
            }
        }
    );
};

gtm.actions.push(
    function () {

        if (gtm.caseData.debug) {
            console.log(' 1 actorId is : <%s>', actor.actorId);
        }

        gtm.register(getEProtoid('eMessageUtils_Ping_CS'),
            function (message) {
                gtm.request(getEProtoid('eMessageUtils_Ping_CS'),
                    Protobuf['role']['MessageUtilsPing'].encode({})
                )
            }
        );

        gtm.register(getEProtoid('eMessageUtils_Errorcode_S'),
            function (message) {
                var messageUtilsErrorcode = Protobuf['utils']['MessageUtilsErrorcode'].decode(message);
                switch (messageUtilsErrorcode.result) {
                    default:
                        console.log('gtm.caseData=============>', JSON.stringify(gtm.caseData));
                        console.log('Actor %s eMessageUtils_Errorcode_S result : %s.', actor.actorId, messageUtilsErrorcode.result.toString(16));
                }
            }
        );
        gtm.caseData.previous = true;
    },

    function () {

        if (gtm.caseData.previous) {

            if (gtm.caseData.debug) {
                console.log('5 actorId is : <%s>', actor.actorId);
            }
            gtm.caseData.previous = false;
            var funcseries = [];

            var funcArray =
                [
                    loginAndCreateRole,
                    enterGame,
                    detailInfos
                ];

            funcArray.forEach(function (element, index, array) {
                var func = function (callback) {
                    setTimeout(element, gtm.randomIntTime(3000, 5000), callback);
                };
                funcseries.push(func)
            });

            async.series(funcseries,
                function (err) {
                    if (err) {
                        console.log('Error====>', err);
                    } else {
                        gtm.caseData.previous = true;
                        if (gtm.caseData.debug) {
                            console.log('%s:gtm.caseData=============>%s', actor.actorId, JSON.stringify(gtm.caseData));
                        }
                    }
                }
            );

            function loginAndCreateRole(callback) {

                monitor(START, 'eMessageRole_Login_C', 'Login');

                gtm.request(getEProtoid('eMessageRole_Login_C'),
                    Protobuf['role']['MessageRoleLogin'].encode({
                        account: actor.actorId,
                        token: '',
                        clienthost: '',
                        credential: '',
                        zoneindex: 5
                    }),
                    getEProtoid('eMessageRole_RoleList_S'),
                    function (message) {
                        monitor(END, 'eMessageRole_Login_C', 'Login');
                        gtm.caseData.RoleList = Protobuf['role']['MessageRoleList'].decode(message);
                        console.log('eMessageRole_Login_C====>',gtm.caseData.RoleList);
                        if (gtm.caseData.RoleList['rolelist'].length) {
                            //gtm.caseData.previous = true;
                            callback();
                        } else {

                            gtm.simpleRequest('eMessageRole_CreateRole_C', {
                                fn: 'MessageCreateRoleRequest', opts: {
                                    account: actor.actorId,
                                    zoneindex: 5,
                                    rolename: uuid.v1().replace(/-/g, ''),
                                    heroid: 10001
                                }
                            }, {
                                save: true,
                                monitor: true,
                                //setPrevious: true,
                                cb: callback
                            });
                        }
                    }
                );
            }

            function enterGame(callback) {

                if ('CreateRole' in gtm.caseData) {
                    gtm.caseData.roleid = gtm.caseData['CreateRole']['roleid'];
                } else {
                    gtm.caseData.roleid = gtm.caseData.RoleList['rolelist'][0].roleid;
                }
                monitor(START, 'eMessageRole_EnterGame_C', 'enterGame');
                gtm.request(getEProtoid('eMessageRole_EnterGame_C'),
                    Protobuf['role']['MessageRoleEnterGame'].encode({
                        roleid: gtm.caseData.roleid,
                        token: gtm.caseData.RoleList['entertoken'],
                        clienthost: '',
                        clientport: 8000
                    }),
                    getEProtoid('eMessageRole_RoleDetail_S'),
                    function (message) {
                        monitor(END, 'eMessageRole_EnterGame_C', 'enterGame');
                        callback();
                    }
                );
            }

            function detailInfos(callback) {

                gtm.simpleRequest('eMessageItem_DetailInfos_C', {fn: 'MessageItemDetailInfosRequest'}, {
                    fn: 'MessageItemDetailInfos',
                    save: true,
                    cb: callback
                });
            }

        } else {

            if (!gtm.caseData.debug) {
                console.log('actor.actorId not ready=============>', actor.actorId);
            }
            return 1;
        }
        return 1;
    },

    function () {
        setTimeout(function () {
            //gtm.close();
        }, gtm.responseOverTime);
    }
)
;