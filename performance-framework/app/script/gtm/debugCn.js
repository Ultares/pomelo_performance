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

//var actor = {};
//
//actor.actorId = 'account_1';
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
    var DProtoId_S = (DecodeMsg['DProtoStr'] == undefined) ? Protobuf[pName][mType][EProtoStr.replace(/_C$/, '_S')] : gtm.getEProtoid(DecodeMsg['DProtoStr']);
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
                    console.log('Saved %s:gtm.caseData======> %s', actor.actorId, JSON.stringify(gtm.caseData));
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
                zoneindex: 0,
                token: '',
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

        if (gtm.caseData[actor.actorId + 'StepStats'] != StepStats.Setp_LoopPrevious) {
            return 1;
        }
        gtm.caseData[actor.actorId + 'StepStats'] = false;
        gtm.funcArray =
            [
                addGold,
                addTwo,
                addEquip,
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

        function addGold(callback) {

            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 1 999999 '  //���
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    callback();
                }
            );
        }

        function addTwo(callback) {
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 2 100000 ' //שʯ
                }),
                gtm.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    callback();
                }
            );
        }

        function addEquip(callback) {

            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 900001 999 '  //��ʯ
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    callback();
                }
            );
        }
    },


//function () {
//
//    if (!gtm.caseData.previous) {
//        return 1;
//    }
//
//    gtm.caseData.previous = false;
//    setTimeout(function () {
//
//        gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
//            Protobuf['role']['MessageRoleChat'].encode({
//                channel: 1,
//                content: '#add 3 100000 '  //����
//            }),
//            gtm.getEProtoid('eMessageRole_ExpChange_S'),
//            function (message) {
//                gtm.caseData.previous = true;
//            }
//        );
//    }, gtm.randomIntTime());
//},

//function () {
//
//    if (!gtm.caseData.previous) {
//        return 1;
//    }
//
//    if (gtm.caseData.debug) {
//        console.log('TL actorId is : <%s>', actor.actorId);
//    }
//
//    gtm.caseData.previous = false;
//
//    gtm.simpleRequest('eMessageRole_Chat_CS', {
//        fn: 'MessageRoleChat', opts: {
//            channel: 1,
//            content: '#add 5 99999 '  //����
//        }
//    }, {
//        fn: 'MessageRoleExpChange',
//        DProtoStr: 'eMessageRole_ExpChange_S',
//        save: false,
//        setPrevious: true,
//        //monitor: false
//    });
//},
//
//function () {
//
//    if (!gtm.caseData.previous) {
//        return 1;
//    }
//
//    if (gtm.caseData.debug) {
//        console.log('VIP actorId is : <%s>', actor.actorId);
//    }
//
//    gtm.caseData.previous = false;
//
//    gtm.simpleRequest('eMessageRole_Chat_CS', {
//        fn: 'MessageRoleChat', opts: {
//            channel: 1,
//            content: '#add 6 100000 ' //vip
//        }
//    }, {
//        fn: 'MessageRolePropChange',
//        DProtoStr: 'eMessageRole_PropChange_S',
//        save: false,
//        setPrevious: true,
//        //monitor: false
//    });
//},

//function () {
//
//    if (gtm.caseData.StepStats !== StepStats.Setp_GMGold) {
//        return 1;
//    }
//
//    setTimeout(function () {
//        gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
//            Protobuf['role']['MessageRoleChat'].encode({
//                channel: 1,
//                content: '#make 510105 1 '  //װ��
//            }),
//            gtm.getEProtoid('eMessageRole_Chat_CS'),
//            function (message) {
//                gtm.caseData.StepStats = StepStats.Setp_GMEquip;
//            }
//        );
//    }, gtm.randomIntTime(1000, 3000));
//},


//function () {
//
//    if (!gtm.caseData.previous) {
//        return 1;
//    }
//
//    if (gtm.caseData.debug) {
//        console.log('PVP actorId is : <%s>', actor.actorId);
//    }
//
//    gtm.caseData.previous = false;
//
//    gtm.simpleRequest('eMessageRole_Chat_CS', {
//        fn: 'MessageRoleChat', opts: {
//            channel: 1,
//            content: '#buypktimes 100000 '
//        }
//    }, {
//        fn: 'MessageRoleChat',
//        DProtoStr: 'eMessageRole_Chat_CS',
//        save: false,
//        setPrevious: true,
//        //monitor: false
//    });
//},

    function () {

        if (gtm.caseData[actor.actorId + 'StepStats'] != StepStats.Setp_LoopPrevious) {
            return 1;
        }

        gtm.caseData[actor.actorId + 'StepStats'] = false;
        gtm.funcseries = [];

        if (gtm.caseData.ratemode) {
            gtm.funcmap = {
                arenaInfo: {funcArray: [arenaInfo], rate: 10},
                getInBox: {funcArray: [getInBox], rate: 5},
                chapterList: {funcArray: [chapterList], rate: 15},
                detailInfos: {funcArray: [detailInfos], rate: 10},
                heroList: {funcArray: [heroList], rate: 10},
                getRelation: {funcArray: [getRelation], rate: 10},
                towerInfo: {funcArray: [towerInfo], rate: 5},
                //escortDetect: {funcArray: [escortDetect], rate: 50},
                gacha: {funcArray: [gacha], rate: 5},
                getRoleInfo: {funcArray: [getRoleInfo], rate: 10},
                getRankList: {funcArray: [getRankList], rate: 10},
                chat: {funcArray: [chat], rate: 2},
                extras: {funcArray: [detailInfos, extras], rate: 5},
                compoundGem: {funcArray: [detailInfos, compoundGem], rate: 1},
                pvp: {funcArray: [arenaInfo, battleChallenge, pvpBattleResult], rate: 1},
                mission: {funcArray: [intoLevels, battleResult], rate: 1}
            };

            gtm.willTest = [];
            gtm.endRate = 100;
            var i = 0;
            while (i <= 10) {
                for (var k in gtm.funcmap) {
                    var rate = getRandomInt(1, gtm.endRate);
                    if (gtm.caseData.debug) {
                        console.log('rate is <%s> and k.rate is <%s> ', rate, gtm.funcmap[k].rate);
                    }
                    if (rate <= gtm.funcmap[k].rate) {
                        gtm.willTest = gtm.willTest.concat(gtm.funcmap[k].funcArray);
                    }
                }
                if (gtm.willTest.length) {
                    if (gtm.caseData.debug) {
                        console.log('Random <%s> time(s)', i);
                    }
                    break;
                }
                i++;
            }

            if (gtm.caseData.debug) {
                console.log('robot.willTest is ', gtm.willTest.length)
            }
            gtm.funcArray = gtm.willTest;
        } else {
            gtm.funcArray =
                [
                    getInBox,
                    chapterList,
                    detailInfos,
                    heroList,
                    getRelation,
                    arenaInfo,
                    chat,
                    towerInfo,
                    compoundGem,
                    extras,
                    //escortDetect,
                    gacha,
                    getRoleInfo,
                    getRankList,
                    //intoLevels,
                    //battleResult,
                    //battleChallenge,
                    //pvpBattleResult
                ];
        }

        gtm.funcArray.forEach(function (element, index, array) {
            var func = function (cb) {
                setTimeout(element, gtm.randomIntTime(3000, 5000), cb);
            };
            gtm.funcseries.push(func)
        });

        //There is a bug refers to async.series if invoke chat twice!
        async.series(gtm.funcseries,
            //async.series([
            //        function (callback) {
            //            monitor(START, 'eMessageMail_GetInBox_C', 'GetInBox');
            //            gtm.request(gtm.getEProtoid('eMessageMail_GetInBox_C'),
            //                Protobuf['mail']['MessageGetInBoxRequest'].encode({}),
            //                gtm.getEProtoid('eMessageMail_GetInBox_S'),
            //                function (message) {
            //                    monitor(END, 'eMessageMail_GetInBox_C', 'GetInBox');
            //                    gtm.unregister(gtm.getEProtoid('eMessageMail_GetInBox_S'));
            //                    console.log(JSON.stringify(gtm.callbacks));
            //                    gtm.caseData.GetInBox = Protobuf['mail']['MessageGetInBoxResponse'].decode(message);
            //                    callback();
            //                }
            //            );
            //        }
            //    ],
            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    gtm.caseData[actor.actorId + 'StepStats'] = StepStats.Setp_LoopPrevious;
                    if (gtm.caseData.debug) {
                        console.log('[%s] [%s] funcseries %s: Out functions loop......', new Date().toLocaleTimeString(), actor.actorId + 'StepStats', gtm.funcseries.length);
                        //console.log('%s:gtm.caseData=============>%s', actor.actorId, JSON.stringify(gtm.caseData));
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

                    if (gtm.caseData.debug) {
                        console.log('DetailInfos is <%s>', JSON.stringify(gtm.caseData.DetailInfos));
                    }

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
                    //console.log(JSON.stringify(gtm.callbacks));
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

        function towerInfo(callback) {

            monitor(START, 'eMessageTower_TowerInfo_C', 'TowerInfo');
            gtm.request(gtm.getEProtoid('eMessageTower_TowerInfo_C'),
                Protobuf['tower']['MessageGetTowerInfoRequest'].encode({}),
                gtm.getEProtoid('eMessageTower_TowerInfo_S'),
                function (message) {
                    monitor(END, 'eMessageTower_TowerInfo_C', 'TowerInfo');
                    gtm.caseData.TowerInfo = Protobuf['tower']['MessageGetTowerInfoResponse'].decode(message);

                    if (gtm.caseData.debug) {
                        console.log('TowerInfo is <%s>', JSON.stringify(gtm.caseData.DetailInfos));
                    }

                    callback()
                }
            );
        }

        function chat(callback) {
            monitor(START, 'eMessageRole_Chat_CS_2', 'Chat');
            gtm.chatContent = 'I am ' + actor.actorId + ' is back!'
            gtm.request(gtm.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 2,
                    content: gtm.chatContent
                }),
                gtm.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {

                    gtm.caseData.chatContent = Protobuf['role']['MessageRoleChat'].decode(message);
                    if (JSON.stringify(gtm.chatContent) === JSON.stringify(gtm.caseData.chatContent.content)) {
                        //console.log(JSON.stringify(gtm.caseData.chatContent.content));
                        monitor(END, 'eMessageRole_Chat_CS_2', 'Chat');
                        callback();
                    }
                }
            );
        }

        function gacha(callback) {

            monitor(START, 'eMessageRole_Gacha_C', 'Gacha');
            gtm.request(gtm.getEProtoid('eMessageRole_Gacha_C'),
                Protobuf['role']['MessageRoleGachaRequest'].encode({
                    method: 2,
                    gachaid: 100001
                }),
                gtm.getEProtoid('eMessageRole_Gacha_S'),
                function (message) {
                    monitor(END, 'eMessageRole_Gacha_C', 'Gacha');
                    callback()
                }
            );
        }

        function activateExtra(callback) {

            gtm.caseData.eqEntityid = JSON.stringify(gtm.caseData.DetailInfos).match(/{"base":{"entityid":({{[^{}]*}}),"baseid":610105,/)[1];
            gtm.simpleRequest('eMessageItem_ActivateExtra_C', {
                fn: 'MessageActivateExtraRequest',
                opts: {entityid: JSON.parse(gtm.caseData.eqEntityid)}
            }, {save: true, cb: callback});

        }

        function extras(callback) {

            var regArray = JSON.stringify(gtm.caseData.DetailInfos).match(/{"base":{"entityid":({[^{}]*}),"baseid":510105,[^}]*},"equip":([^\]]*])/);
            var isActive = JSON.parse(regArray[2] + '}').extras.length;
            gtm.caseData.eqEntityid = JSON.parse(regArray[1]);

            if (isActive === 0) {
                gtm.request(gtm.getEProtoid('eMessageItem_ActivateExtra_C'),
                    Protobuf['item']['MessageActivateExtraRequest'].encode({
                        entityid: gtm.caseData.eqEntityid
                    }),
                    gtm.getEProtoid('eMessageItem_ActivateExtra_S'),
                    function (message) {
                        monitor(START, 'eMessageItem_Extras_C', 'Extras');
                        gtm.request(gtm.getEProtoid('eMessageItem_Extras_C'),
                            Protobuf['item']['MessageExtrasRequest'].encode({
                                entityid: gtm.caseData.eqEntityid, extra: {pos: 1, state: 1}
                            }),
                            gtm.getEProtoid('eMessageItem_Extras_S'),
                            function (message) {
                                monitor(END, 'eMessageItem_Extras_C', 'Extras');
                                gtm.caseData.Extras = Protobuf['item']['MessageExtrasResponse'].decode(message);
                                callback()
                            }
                        );
                        //gtm.caseData.activeRts  = Protobuf['item']['MessageActivateExtraRequest'].encode(message);
                    }
                );
            } else {
                monitor(START, 'eMessageItem_Extras_C', 'Extras');
                gtm.request(gtm.getEProtoid('eMessageItem_Extras_C'),
                    Protobuf['item']['MessageExtrasRequest'].encode({
                        entityid: gtm.caseData.eqEntityid, extra: {pos: 1, state: 1}
                    }),
                    gtm.getEProtoid('eMessageItem_Extras_S'),
                    function (message) {
                        monitor(END, 'eMessageItem_Extras_C', 'Extras');
                        gtm.caseData.Extras = Protobuf['item']['MessageExtrasResponse'].decode(message);
                        callback()
                    }
                );
            }
        }

        function compoundGem(callback) {

            gtm.caseData.gemEntityid = JSON.stringify(gtm.caseData.DetailInfos).match(/{"base":{"entityid":({[^{}]*}),"baseid":900001/)[1];

            monitor(START, 'eMessageItem_CompoundGem_C', 'CompoundGem');
            gtm.request(gtm.getEProtoid('eMessageItem_CompoundGem_C'),
                Protobuf['item']['MessageCompoundGemRequest'].encode({
                    entityid: JSON.parse(gtm.caseData.gemEntityid)
                }),
                gtm.getEProtoid('eMessageItem_CompoundGem_S'),
                function (message) {
                    monitor(END, 'eMessageItem_CompoundGem_C', 'CompoundGem');
                    //gtm.caseData.CompoundGem = Protobuf['item']['MessageCompoundGemResponse'].decode(message);
                    callback()
                }
            );
        }

        function escortDetect(callback) {

            monitor(START, 'eMessageEscort_Detect_C', 'Detect');
            gtm.request(gtm.getEProtoid('eMessageEscort_Detect_C'),
                Protobuf['escort']['MessageDetectRequest'].encode({}),
                gtm.getEProtoid('eMessageEscort_Detect_S'),
                function (message) {
                    monitor(END, 'eMessageEscort_Detect_C', 'Detect');
                    gtm.caseData.Detect = Protobuf['escort']['MessageDetectResponse'].decode(message);
                    callback()
                }
            );
        }

        function intoLevels(callback) {

            monitor(START, 'eMessageBattle_IntoLevels_C', 'IntoLevels');
            gtm.request(gtm.getEProtoid('eMessageBattle_IntoLevels_C'),
                Protobuf['battle']['MessageIntoLevelsRequest'].encode({
                    level: 10101
                }),
                gtm.getEProtoid('eMessageBattle_IntoLevels_S'),
                function (message) {
                    monitor(END, 'eMessageBattle_IntoLevels_C', 'IntoLevels');
                    gtm.caseData.IntoLevels = Protobuf['battle']['MessageIntoLevelsResponse'].decode(message);
                    callback()
                }
            );
        }

        function pvpBattleResult(callback) {

            monitor(START, 'pvp_eMessageBattle_Result_C', 'pvpbattleResult');
            gtm.request(gtm.getEProtoid('eMessageBattle_Result_C'),
                Protobuf['battle']['MessageBattleResultRequest'].encode({
                    levelid: 999999,
                    result: 1,
                    grade: 3
                }),
                gtm.getEProtoid('eMessageBattle_Result_S'),
                function (message) {
                    //gtm.caseData.battleResult = Protobuf['battle']['MessageBattleResultResponse'].decode(message);
                    monitor(END, 'pvp_eMessageBattle_Result_C', 'pvpbattleResult');
                    callback()
                }
            );
        }


        function battleResult(callback) {

            monitor(START, 'eMessageBattle_Result_C', 'battleResult');
            gtm.request(gtm.getEProtoid('eMessageBattle_Result_C'),
                Protobuf['battle']['MessageBattleResultRequest'].encode({
                    levelid: 10101,
                    result: 1,
                    grade: 3
                }),
                gtm.getEProtoid('eMessageBattle_Result_S'),
                function (message) {
                    //gtm.caseData.battleResult = Protobuf['battle']['MessageBattleResultResponse'].decode(message);
                    monitor(END, 'eMessageBattle_Result_C', 'battleResult');
                    callback()
                }
            );
        }

        function arenaClearPKCD(callback) {

            gtm.simpleRequest('eMessageArena_ClearPKCD_C', {
                    fn: 'MessageClearPKCDRequest'
                },
                {
                    save: true, cb: callback
                });
        }

        function battleChallenge(callback) {

            //if (gtm.caseData['ArenaInfo']['cdtime']['low'] !== 0) {
            //
            //    gtm.request(gtm.getEProtoid('eMessageArena_ClearPKCD_C'),
            //        Protobuf['arena']['MessageClearPKCDRequest'].encode({
            //            method: 2,
            //            roleid: gtm.caseData['ArenaInfo']['opponents'][0]['roleid'],
            //            place: gtm.caseData['ArenaInfo']['opponents'][0]['rank']
            //        })
            //    );
            //}

            monitor(START, 'eMessageBattle_Challenge_C', 'Challenge');
            gtm.request(gtm.getEProtoid('eMessageBattle_Challenge_C'),
                Protobuf['battle']['MessageChallengeRequest'].encode({
                    method: 2,
                    roleid: gtm.caseData['ArenaInfo']['opponents'][0]['roleid'],
                    place: gtm.caseData['ArenaInfo']['opponents'][0]['rank']
                }),
                gtm.getEProtoid('eMessageBattle_Challenge_S'),
                function (message) {
                    //gtm.caseData.Challenge = Protobuf['battle']['MessageChallengeResponse'].decode(message);
                    monitor(END, 'eMessageBattle_Challenge_C', 'Challenge');
                    callback()
                }
            );
        }

        return 1;
    }
    ,

    function () {
        setTimeout(function () {
            //gtm.close();
        }, gtm.responseOverTime);
    }
)
;
