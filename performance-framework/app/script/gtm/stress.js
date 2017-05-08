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


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

//Gtm.prototype.simpleRequest = function (EProtoStr, EncodeMsg, DecodeMsg) {
//
//    //EProtoBody {fn: '',opts:{}}
//    //DecodeMsg  {fn: '',DProtoStr:'',cb:callback,save:false,monitor:true,setPrevious: false,not}
//
//    var DecodeMsg = (DecodeMsg === undefined || DecodeMsg === null) ? {} : DecodeMsg;
//    var isSave = (DecodeMsg['save'] == undefined) ? false : DecodeMsg.save;
//    var setPrevious = (DecodeMsg['setPrevious'] == undefined) ? false : DecodeMsg.setPrevious;
//    var ismonitor = (DecodeMsg['monitor'] == undefined) ? true : DecodeMsg['monitor'];
//    var eOpts = (EncodeMsg['opts'] == undefined) ? {} : EncodeMsg['opts'];
//    var cb = (DecodeMsg['cb'] == undefined) ? false : DecodeMsg['cb'];
//    var mType = EProtoStr.split('_')[0].slice(1);
//    var pName = mType.replace('Message', '').toLowerCase();
//    var EProtoId = Protobuf[pName][mType][EProtoStr];
//    var DProtoId_S = (DecodeMsg['DProtoStr'] == undefined) ? Protobuf[pName][mType][EProtoStr.replace(/_C$/, '_S')] : gtm.getEProtoid(DecodeMsg['DProtoStr']);
//    var saveMs = EProtoStr.split('_')[1];
//
//    if (!!ismonitor) {
//        monitor(START, EProtoStr, saveMs);
//    }
//
//    gtm.request(EProtoId,
//        Protobuf[pName][EncodeMsg['fn']].encode(eOpts),
//        DProtoId_S,
//        function (message) {
//
//            if (!!isSave) {
//                var dFuncName = (DecodeMsg['fn'] === undefined) ? EncodeMsg['fn'].replace(/Request$/, 'Response') : DecodeMsg['fn'];
//                var dpName = pName;
//                if (DecodeMsg['DProtoStr'] !== undefined) {
//                    dpName = DecodeMsg['DProtoStr'].split('_')[0].replace('eMessage', '').toLowerCase();
//                }
//                gtm.caseData[saveMs] = Protobuf[dpName][dFuncName].decode(message);
//                if (gtm.caseData.debug) {
//                    console.log('Saved %s:gtm.caseData======> %s', actor.actorId, JSON.stringify(gtm.caseData));
//                }
//
//            }
//
//            if (cb) {
//                cb();
//            }
//
//            if (ismonitor) {
//                monitor(END, EProtoStr, saveMs);
//            }
//            if (setPrevious) {
//                gtm.caseData.previous = true;
//            }
//        }
//    );
//};

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
                        console.log('Actor %s eMessageUtils_Errorcode_S result : %s.', actor.actorId, messageUtilsErrorcode.result.toString(16));
                }
            }
        );
    },

    function () {

        gtm.request(gtm.getEProtoid('eMessageRole_Login_C'),
            Protobuf['role']['MessageRoleLogin'].encode({
                account: actor.actorId,
                zoneindex: 1,
                token: '',
                clienthost: '',
                credential: ''

            }),
            gtm.getEProtoid('eMessageRole_RoleList_S'),
            function (message) {

                gtm.caseData.RoleList = Protobuf['role']['MessageRoleList'].decode(message);
                if (gtm.caseData.RoleList['rolelist'].length) {
                    gtm.caseData.StepStats = StepStats.Step_Login;
                } else {

                    gtm.request(gtm.getEProtoid('eMessageRole_CreateRole_C'),
                        Protobuf['role']['MessageCreateRoleRequest'].encode({
                            account: actor.actorId,
                            zoneindex: 0,
                            rolename: uuid.v1().replace(/-/g, ''),
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
                    gtm.caseData[actor.actorId + 'StepStats'] = StepStats.Setp_LoopPrevious;
                    //gtm.caseData.StepStats = StepStats.Step_EnterGame;
                }
            );
        }, gtm.randomIntTime(1000, 3000));
    },


    function () {

        if(gtm.caseData[actor.actorId + 'StepStats'] != StepStats.Setp_LoopPrevious){
            return 1;
        }
        gtm.caseData[actor.actorId + 'StepStats'] = false;
        gtm.funcArray =
            [
                getInBox,
                chapterList,
                detailInfos,
                heroList,
                getRelation,
                arenaInfo
                //chat
            ];

        gtm.funcseries = [];

        gtm.funcArray.forEach(function (element, index, array) {
            var func = function (acallback) {
                setTimeout(element, gtm.randomIntTime(3000, 5000), acallback);
            };
            gtm.funcseries.push(func)
        });

        async.series(gtm.funcseries,

            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    gtm.caseData[actor.actorId + 'StepStats'] = StepStats.Setp_LoopPrevious;
                    if (gtm.caseData.debug) {
                        console.log('[%s] [%s] funcseries %s: Out functions loop......', new Date().toLocaleTimeString(), actor.actorId + 'StepStats', 'Ares');

                    }
                }
            }
        );

        function getRoleInfo(callback) {

            monitor(START, 'eMessageRole_GetRoleInfo_C', 'GetRoleInfo');
            gtm.request(gtm.getEProtoid('eMessageRole_GetRoleInfo_C'),
                Protobuf['role']['MessageGetRoleInfoRequest'].encode({
                    roleid: gtm.caseData.roleid
                }),
                gtm.getEProtoid('eMessageRole_GetRoleInfo_S'),
                function (message) {
                    monitor(END, 'eMessageRole_GetRoleInfo_C', 'GetRoleInfo');
                    gtm.caseData.GetRoleInfo = Protobuf['role']['MessageGetRoleInfoResponse'].decode(message);
                    callback()
                }
            );
        }

        function addDemo(callback) {

            monitor(START, 'eMessageRole_Chat_CS', 'Chat');
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 900001 2 '  //��ʯ
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    monitor(END, 'eMessageRole_Chat_CS', 'Chat');
                    callback()
                }
            );
        }

        function detailInfos(callback) {

            monitor(START, 'eMessageItem_DetailInfos_C', 'DetailInfos');
            gtm.request(gtm.getEProtoid('eMessageItem_DetailInfos_C'),
                Protobuf['item']['MessageItemDetailInfosRequest'].encode({}),
                gtm.getEProtoid('eMessageItem_DetailInfos_S'),
                function (message) {
                    monitor(END, 'eMessageItem_DetailInfos_C', 'DetailInfos');
                    gtm.caseData.DetailInfos = Protobuf['item']['MessageItemDetailInfos'].decode(message);

                    //if (gtm.caseData.debug) {
                    //    console.log('DetailInfos is <%s>', JSON.stringify(gtm.caseData.DetailInfos));
                    //}

                    callback()
                }
            );
        }

        function getRankList(callback) {

            monitor(START, 'eMessageRole_GetRankList_C', 'GetRankList');
            gtm.request(gtm.getEProtoid('eMessageRole_GetRankList_C'),
                Protobuf['role']['MessageGetRankListRequest'].encode({
                    type: 2
                }),
                gtm.getEProtoid('eMessageRole_GetRankList_S'),
                function (message) {
                    monitor(END, 'eMessageRole_GetRankList_C', 'GetRankList');
                    gtm.caseData.GetRankList = Protobuf['role']['MessageGetRankListResponse'].decode(message);
                    callback()
                }
            );
        }

        function chapterList(callback) {

            monitor(START, 'eMessageLevel_ChapterList_C', 'ChapterList');
            gtm.request(gtm.getEProtoid('eMessageLevel_ChapterList_C'),
                Protobuf['level']['MessageGetChapterList'].encode({}),
                gtm.getEProtoid('eMessageLevel_ChapterList_S'),
                function (message) {
                    monitor(END, 'eMessageLevel_ChapterList_C', 'ChapterList');
                    gtm.caseData.ChapterList = Protobuf['level']['MessageAllChapterList'].decode(message);
                    callback()
                }
            );
        }

        function getInBox(callback) {
            monitor(START, 'eMessageMail_GetInBox_C', 'GetInBox');
            gtm.request(gtm.getEProtoid('eMessageMail_GetInBox_C'),
                Protobuf['mail']['MessageGetInBoxRequest'].encode({}),
                gtm.getEProtoid('eMessageMail_GetInBox_S'),
                function (message) {
                    monitor(END, 'eMessageMail_GetInBox_C', 'GetInBox');
                    gtm.unregister(gtm.getEProtoid('eMessageMail_GetInBox_S'));
                    console.log(JSON.stringify(gtm.callbacks));
                    gtm.caseData.GetInBox = Protobuf['mail']['MessageGetInBoxResponse'].decode(message);
                    callback();
                }
            );
        }

        function heroList(callback) {

            monitor(START, 'eMessageHero_HeroList_C', 'HeroList');
            gtm.request(gtm.getEProtoid('eMessageHero_HeroList_C'),
                Protobuf['hero']['MessageHeroListRequest'].encode({}),
                gtm.getEProtoid('eMessageHero_HeroList_S'),
                function (message) {
                    monitor(END, 'eMessageHero_HeroList_C', 'HeroList');
                    gtm.caseData.HeroList = Protobuf['hero']['MessageHeroListResponse'].decode(message);
                    callback()
                }
            );
        }

        function getRelation(callback) {

            monitor(START, 'eMessageSocial_GetRelation_C', 'GetRelation');
            gtm.request(gtm.getEProtoid('eMessageSocial_GetRelation_C'),
                Protobuf['social']['MessageGetRelationRequest'].encode({}),
                gtm.getEProtoid('eMessageSocial_GetRelation_S'),
                function (message) {
                    monitor(END, 'eMessageSocial_GetRelation_C', 'GetRelation');
                    gtm.caseData.GetRelation = Protobuf['social']['MessageGetRelationResponse'].decode(message);
                    callback()
                }
            );
        }

        function arenaInfo(callback) {

            monitor(START, 'eMessageArena_ArenaInfo_C', 'ArenaInfo');
            gtm.request(gtm.getEProtoid('eMessageArena_ArenaInfo_C'),
                Protobuf['arena']['MessageGetArenaInfoRequest'].encode({}),
                gtm.getEProtoid('eMessageArena_ArenaInfo_S'),
                function (message) {
                    monitor(END, 'eMessageArena_ArenaInfo_C', 'ArenaInfo');
                    gtm.caseData.ArenaInfo = Protobuf['arena']['MessageGetArenaInfoResponse'].decode(message);
                    callback()
                }
            );
        }


        function chat(callback) {
            monitor(START, 'eMessageRole_Chat_CS_2', 'Chat');
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 2,
                    content: 'I am ' + actor.actorId + ' is back!'
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    if (actor.actorId in JSON.stringify(message)) {
                        monitor(END, 'eMessageRole_Chat_CS_2', 'Chat');
                        callback();
                    }
                }
            );
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            //gtm.close();
        }, gtm.responseOverTime);
    }
);
{}