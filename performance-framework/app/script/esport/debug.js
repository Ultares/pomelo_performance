var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var EsportClient = require('dena-client').esport;
var Esport = EsportClient.Esport;
var Protobuf = EsportClient.Protobuf;


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

var es = new Esport();

var monitor = function (type, name, reqId) {
    //console.log('%s monitor %s %s', type, actor.actorId, name);
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

//console.log(JSON.stringify(actor));

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

es.connect(actor.server, function () {  //actor.server
    if (es.caseData.debug) {
        console.log('[%s] : tcp-socket connect to esServer!', actor.actorId);
    }
    es.run();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

es.prototype.getEProtoid = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0] + '_MessageId';
    return Protobuf['MessageID'][mType][EProtoStr];
};

es.actions.push(
    // function () {
    //     es.register(es.getEProtoid('eMessageUtils_Ping_CS'),
    //         function (message) {
    //             es.request(es.getEProtoid('eMessageUtils_Ping_CS'),
    //                 Protobuf['role']['MessageUtilsPing'].encode({})
    //             )
    //         }
    //     );
    //
    //     es.register(es.getEProtoid('eMessageUtils_Errorcode_S'),
    //         function (message) {
    //             var messageUtilsErrorcode = Protobuf['utils']['MessageUtilsErrorcode'].decode(message);
    //             switch (messageUtilsErrorcode.result) {
    //                 default:
    //                     console.log('es.caseData=============>', JSON.stringify(es.caseData));
    //                     console.log('Actor %s eMessageUtils_Errorcode_S result : %s.', actor.actorId, messageUtilsErrorcode.result.toString(16).toUpperCase());
    //             }
    //         }
    //     );
    // },

    function () {
        es.caseData.account = actor.actorId.split('|');
        es.request(es.getEProtoid('C2S_AccountVerifyRequest_ID'),
            Protobuf['protocol']['C2S_AccountVerifyRequest'].encode({
                account: es.caseData.account[0],
                platform_id: 'xingluo',
                global_server_id: 2,
                game_id: 1,
                platform_session: 'zzzzzzzz'
            }),
            es.getEProtoid('S2C_AccountVerifyResponse_ID'),
            function (message) {
                es.caseData.Verify = Protobuf['protocol']['S2C_AccountVerifyResponse'].decode(message);
                if (!!es.caseData.Verify['account_datas']) {
                    es.caseData.StepStats = StepStats.Step_Login;
                } else {
                    es.request(es.getEProtoid('C2S_CreatePlayerBasicInfoRequest_ID'),
                        Protobuf['protocol']['C2S_CreatePlayerBasicInfoRequest_ID'].encode({
                            account_id: '235',
                            icon_id: 1,
                            name: 'S_robot_' + es.caseData.account[0], //uuid.v1().replace(/-/g, '').substr(0, 12),
                            initial_team_index: 1
                        }),
                        es.getEProtoid('S2C_CreatePlayerBasicInfoResponse_ID'),
                        function (message) {
                            es.caseData.CreateRole = Protobuf['protocol']['S2C_CreatePlayerBasicInfoResponse'].decode(message);
                            es.caseData.StepStats = StepStats.Step_Login;
                        }
                    );
                }
            }
        );
    },

    function () {
        if (es.caseData.StepStats !== StepStats.Step_Login) {
            return 1
        }
        setTimeout(function () {
            if ('CreateRole' in es.caseData) {
                es.caseData.roleid = es.caseData['CreateRole']['roleid'];
            } else {
                es.caseData.roleid = es.caseData.RoleList['rolelist'][0].roleid;
            }
            es.request(es.getEProtoid('eMessageRole_EnterGame_C'),
                Protobuf['role']['MessageRoleEnterGame'].encode({
                    roleid: es.caseData.roleid,
                    token: es.caseData.RoleList['entertoken'],
                    clienthost: '',
                    clientport: 8000,
                    age: 3
                }),
                es.getEProtoid('eMessageRole_RoleDetail_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_RoleDetail_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#clearbag '
                }),
                es.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_Chat_CS'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 1 9999999 '  //gold
                }),
                es.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_PropChange_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 2 100000 '
                }),
                es.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_PropChange_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 3 100000 '
                }),
                es.getEProtoid('eMessageRole_ExpChange_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_ExpChange_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 5 99999 '
                }),
                es.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_PropChange_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#add 6 100000 ' //vip
                }),
                es.getEProtoid('eMessageRole_PropChange_S'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_PropChange_S'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 22025001 1 '  //equipment
                }),
                es.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_Chat_CS'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 24010001 9999' //demo
                }),
                es.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    es.unregister(es.getEProtoid('eMessageRole_Chat_CS'));
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.request(es.getEProtoid('eMessageRole_ChangeSakasho_C'),
                Protobuf['role']['MessageRoleChangeSakashoRequest'].encode({
                    age: 3
                }),
                es.getEProtoid('eMessageRole_ChangeSakasho_S'),
                function (message) {
                    es.caseData.previous = true;
                }
            );
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        es.funcseries = [];
        if (es.caseData.ratemode) {
            es.funcmap = {
                getInBox: {funcArray: [getInBox], rate: 300},
                autoGotAttachment: {funcArray: [autoGotAttachment], rate: 15},
                chapterList: {funcArray: [chapterList], rate: 400},
                detailInfos: {funcArray: [detailInfos], rate: 100},
                heroList: {funcArray: [heroList], rate: 400},
                getRelation: {funcArray: [getRelation], rate: 400},
                getRecommendList: {funcArray: [getRecommendList], rate: 10},
                towerInfo: {funcArray: [towerInfo], rate: 400},
                buyStrength: {funcArray: [buyStrength], rate: 15},
                queryRoleStatus: {funcArray: [queryRoleStatus], rate: 100},
                gacha: {funcArray: [gacha], rate: 200},
                getRoleInfo: {funcArray: [getRoleInfo], rate: 400},
                getRankList: {funcArray: [getRankList], rate: 400},
                chat: {funcArray: [chat], rate: 1},
                extras: {funcArray: [detailInfos, extras], rate: 200},
                compoundGem: {funcArray: [detailInfos, compoundGem], rate: 100},
                mission: {funcArray: [intoLevels, battleResult], rate: 250}
            };

            es.willTest = [];
            es.endRate = 4000;
            var i = 0;
            while (i <= 10) {
                for (var k in es.funcmap) {
                    var rate = getRandomInt(1, es.endRate);
                    if (es.caseData.debug) {
                        console.log('rate is <%s> and k.rate is <%s> ', rate, es.funcmap[k].rate);
                    }
                    if (rate <= es.funcmap[k].rate) {
                        es.willTest = es.willTest.concat(es.funcmap[k].funcArray);
                    }
                }
                if (es.willTest.length) {
                    if (es.caseData.debug) {
                        console.log('Random <%s> time(s)', i);
                    }
                    break;
                }
                i++;
            }

            if (es.caseData.debug) {
                console.log('robot.willTest is ', es.willTest.length)
            }
            es.funcArray = es.willTest;
        } else {
            es.funcArray =
                [
                    autoGotAttachment,
                    //gacha,
                    //buyStrength,
                    getRecommendList,
                    queryRoleStatus,
                    getInBox,
                    //chapterList,
                    //detailInfos,
                    //heroList,
                    //getRelation,
                    //chat,
                    //towerInfo,
                    //compoundGem,
                    //extras,
                    //getRoleInfo,
                    //getRankList,
                    //intoLevels,
                    //battleResult
                ];
        }

        es.funcArray.forEach(function (element, index, array) {
            var func = function (cb) {
                setTimeout(element, es.randomIntTime(3000, 9000), cb);
            };
            es.funcseries.push(func)
        });

        async.series(es.funcseries,
            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    es.caseData.previous = true;
                    if (es.caseData.debug) {
                        console.log('[%s] [%s] funcseries %s: Out functions loop......', new Date().toLocaleTimeString(), actor.actorId + 'StepStats', es.funcseries.length);
                        console.log('%s:es.caseData=============>%s', actor.actorId, JSON.stringify(es.caseData));
                    }
                }
            }
        );

        function buyStrength(callback) {
            monitor(START, 'eMessageRole_BuyStrength_C', 'buyStrength');
            es.request(es.getEProtoid('eMessageRole_BuyStrength_C'),
                Protobuf['role']['MessageBuyStrengthRequest'].encode({}),
                es.getEProtoid('eMessageRole_BuyStrength_S'),
                function (message) {
                    monitor(END, 'eMessageRole_BuyStrength_C', 'buyStrength');
                    es.caseData.buyStrength = Protobuf['role']['MessageBuyStrengthResponse'].decode(message);
                    callback()
                }
            );
        }

        function queryRoleStatus(callback) {
            if (es.caseData.account[1] == '100') {
                es.caseData.queryRoleName = 'robot_360243'
            } else {
                es.caseData.queryRoleName = 'robot_360240'
            }
            monitor(START, 'eMessageRole_QueryRoleStatus_C', 'queryRoleStatus');
            es.request(es.getEProtoid('eMessageRole_QueryRoleStatus_C'),
                Protobuf['role']['MessageQueryRoleStatusRequest'].encode({
                    rolename: es.caseData.queryRoleName  //360243
                }),
                es.getEProtoid('eMessageRole_QueryRoleStatus_S'),
                function (message) {
                    monitor(END, 'eMessageRole_QueryRoleStatus_C', 'queryRoleStatus');
                    es.caseData.QueryRoleStatus = Protobuf['role']['MessageQueryRoleStatusResponse'].decode(message);
                    callback()
                }
            );
        }

        function getRoleInfo(callback) {
            monitor(START, 'eMessageRole_GetRoleInfo_C', 'GetRoleInfo');
            es.request(es.getEProtoid('eMessageRole_GetRoleInfo_C'),
                Protobuf['role']['MessageGetRoleInfoRequest'].encode({
                    roleid: es.caseData.roleid,
                    zoneindex: parseInt(es.caseData.account[1])
                }),
                es.getEProtoid('eMessageRole_GetRoleInfo_S'),
                function (message) {
                    monitor(END, 'eMessageRole_GetRoleInfo_C', 'GetRoleInfo');
                    //es.caseData.GetRoleInfo = Protobuf['role']['MessageGetRoleInfoResponse'].decode(message);
                    callback()
                }
            );
        }

        function addDemo(callback) {
            monitor(START, 'eMessageRole_Chat_CS', 'Chat');
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 1,
                    content: '#make 900001 2 '  //��ʯ
                }),
                es.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    monitor(END, 'eMessageRole_Chat_CS', 'Chat');
                    es.unregister(es.getEProtoid('eMessageRole_Chat_CS'));
                    callback()
                }
            );
        }

        function detailInfos(callback) {
            monitor(START, 'eMessageItem_DetailInfos_C', 'DetailInfos');
            es.request(es.getEProtoid('eMessageItem_DetailInfos_C'),
                Protobuf['item']['MessageItemDetailInfosRequest'].encode({}),
                es.getEProtoid('eMessageItem_DetailInfos_S'),
                function (message) {
                    monitor(END, 'eMessageItem_DetailInfos_C', 'DetailInfos');
                    es.caseData.DetailInfos = Protobuf['item']['MessageItemDetailInfos'].decode(message);

                    if (es.caseData.debug) {
                        console.log('DetailInfos is <%s>', JSON.stringify(es.caseData.DetailInfos));
                    }
                    callback()
                }
            );
        }

        function getRankList(callback) {
            monitor(START, 'eMessageRole_GetRankList_C', 'GetRankList');
            es.request(es.getEProtoid('eMessageRole_GetRankList_C'),
                Protobuf['role']['MessageGetRankListRequest'].encode({
                    type: 2
                }),
                es.getEProtoid('eMessageRole_GetRankList_S'),
                function (message) {
                    monitor(END, 'eMessageRole_GetRankList_C', 'GetRankList');
                    es.caseData.GetRankList = Protobuf['role']['MessageGetRankListResponse'].decode(message);
                    callback()
                }
            );
        }

        function chapterList(callback) {
            monitor(START, 'eMessageLevel_ChapterList_C', 'ChapterList');
            es.request(es.getEProtoid('eMessageLevel_ChapterList_C'),
                Protobuf['level']['MessageGetChapterList'].encode({}),
                es.getEProtoid('eMessageLevel_ChapterList_S'),
                function (message) {
                    monitor(END, 'eMessageLevel_ChapterList_C', 'ChapterList');
                    es.caseData.ChapterList = Protobuf['level']['MessageAllChapterList'].decode(message);
                    callback()
                }
            );
        }

        function getInBox(callback) {
            monitor(START, 'eMessageMail_GetInBox_C', 'GetInBox');
            es.request(es.getEProtoid('eMessageMail_GetInBox_C'),
                Protobuf['mail']['MessageGetInBoxRequest'].encode({}),
                es.getEProtoid('eMessageMail_GetInBox_S'),
                function (message) {
                    monitor(END, 'eMessageMail_GetInBox_C', 'GetInBox');
                    es.unregister(es.getEProtoid('eMessageMail_GetInBox_S'));
                    //console.log(JSON.stringify(es.callbacks));
                    es.caseData.GetInBox = Protobuf['mail']['MessageGetInBoxResponse'].decode(message);
                    callback();
                }
            );
        }

        function autoGotAttachment(callback) {
            monitor(START, 'eMessageMail_AutoGotAttachment_C', 'autoGotAttachment');
            es.request(es.getEProtoid('eMessageMail_AutoGotAttachment_C'),
                Protobuf['mail']['MessageAutoGotAttachmentRequest'].encode({}),
                es.getEProtoid('eMessageMail_AutoGotAttachment_S'),
                function (message) {
                    monitor(END, 'eMessageMail_AutoGotAttachment_C', 'autoGotAttachment');
                    es.unregister(es.getEProtoid('eMessageMail_AutoGotAttachment_S'));
                    //console.log(JSON.stringify(es.callbacks));
                    es.caseData.autoGotAttachment = Protobuf['mail']['MessageAutoGotAttachmentReponse'].decode(message);
                    callback();
                }
            );
        }

        function heroList(callback) {
            monitor(START, 'eMessageHero_HeroList_C', 'HeroList');
            es.request(es.getEProtoid('eMessageHero_HeroList_C'),
                Protobuf['hero']['MessageHeroListRequest'].encode({}),
                es.getEProtoid('eMessageHero_HeroList_S'),
                function (message) {
                    monitor(END, 'eMessageHero_HeroList_C', 'HeroList');
                    es.caseData.HeroList = Protobuf['hero']['MessageHeroListResponse'].decode(message);
                    callback()
                }
            );
        }

        function getRelation(callback) {
            monitor(START, 'eMessageSocial_GetRelation_C', 'GetRelation');
            es.request(es.getEProtoid('eMessageSocial_GetRelation_C'),
                Protobuf['social']['MessageGetRelationRequest'].encode({}),
                es.getEProtoid('eMessageSocial_GetRelation_S'),
                function (message) {
                    monitor(END, 'eMessageSocial_GetRelation_C', 'GetRelation');
                    es.caseData.GetRelation = Protobuf['social']['MessageGetRelationResponse'].decode(message);
                    callback()
                }
            );
        }

        function getRecommendList(callback) {
            monitor(START, 'eMessageSocial_GetRecommendList_C', 'GetRelation');
            es.request(es.getEProtoid('eMessageSocial_GetRecommendList_C'),
                Protobuf['social']['MessageGetRecommendListRequest'].encode({}),
                es.getEProtoid('eMessageSocial_GetRecommendList_S'),
                function (message) {
                    monitor(END, 'eMessageSocial_GetRecommendList_C', 'GetRelation');
                    es.caseData.GetRecommendList = Protobuf['social']['MessageGetRecommendListResponse'].decode(message);
                    callback()
                }
            );
        }

        function sendInvitation(callback) {
            console.log('roleid ====>', es.caseData.roleid);
            if (es.caseData.GetRecommendList.length) {
                monitor(START, 'eMessageSocial_SendInvitation_CS', 'sendInvitation');
                es.request(es.getEProtoid('eMessageSocial_SendInvitation_CS'),
                    Protobuf['social']['MessageSendFriendInvitation'].encode({
                        roleid: '{"low":88,"high":16777216,"unsigned":true}', //es.caseData.roleid,
                        zoneindex: 101
                    }),
                    es.getEProtoid('eMessageSocial_SendInvitation_CS'),
                    function (message) {
                        monitor(END, 'eMessageSocial_SendInvitation_CS', 'sendInvitation');
                        es.caseData.SendInvitation = Protobuf['social']['MessageSendFriendInvitation'].decode(message);
                        callback()
                    }
                );
            } else {
                callback()
            }
        }

        function arenaInfo(callback) {
            monitor(START, 'eMessageArena_ArenaInfo_C', 'ArenaInfo');
            es.request(es.getEProtoid('eMessageArena_ArenaInfo_C'),
                Protobuf['arena']['MessageGetArenaInfoRequest'].encode({}),
                es.getEProtoid('eMessageArena_ArenaInfo_S'),
                function (message) {
                    monitor(END, 'eMessageArena_ArenaInfo_C', 'ArenaInfo');
                    es.caseData.ArenaInfo = Protobuf['arena']['MessageGetArenaInfoResponse'].decode(message);
                    callback()
                }
            );
        }

        function towerInfo(callback) {
            monitor(START, 'eMessageTower_TowerInfo_C', 'TowerInfo');
            es.request(es.getEProtoid('eMessageTower_TowerInfo_C'),
                Protobuf['tower']['MessageGetTowerInfoRequest'].encode({}),
                es.getEProtoid('eMessageTower_TowerInfo_S'),
                function (message) {
                    monitor(END, 'eMessageTower_TowerInfo_C', 'TowerInfo');
                    es.caseData.TowerInfo = Protobuf['tower']['MessageGetTowerInfoResponse'].decode(message);
                    if (es.caseData.debug) {
                        console.log('TowerInfo is <%s>', JSON.stringify(es.caseData.DetailInfos));
                    }
                    callback()
                }
            );
        }

        function chat(callback) {
            monitor(START, 'eMessageRole_Chat_CS_2', 'Chat');
            es.chatContent = 'I am ' + actor.actorId + ' is back!'
            es.request(es.getEProtoid('eMessageRole_Chat_CS'),
                Protobuf['role']['MessageRoleChat'].encode({
                    channel: 2,
                    content: es.chatContent
                }),
                es.getEProtoid('eMessageRole_Chat_CS'),
                function (message) {
                    es.caseData.chatContent = Protobuf['role']['MessageRoleChat'].decode(message);
                    if (JSON.stringify(es.chatContent) === JSON.stringify(es.caseData.chatContent.content)) {
                        //console.log(JSON.stringify(es.caseData.chatContent.content));
                        monitor(END, 'eMessageRole_Chat_CS_2', 'Chat');
                        es.unregister(es.getEProtoid('eMessageRole_Chat_CS'));
                        callback();
                    }
                }
            );
        }

        function gacha(callback) {
            monitor(START, 'eMessageRole_Gacha_C', 'Gacha');
            es.request(es.getEProtoid('eMessageRole_Gacha_C'),
                Protobuf['role']['MessageRoleGachaRequest'].encode({
                    method: 2,
                    gachaid: 5
                }),
                es.getEProtoid('eMessageRole_Gacha_S'),
                function (message) {
                    monitor(END, 'eMessageRole_Gacha_C', 'Gacha');
                    callback()
                }
            );
        }

        function activateExtra(callback) {
            es.caseData.eqEntityid = JSON.stringify(es.caseData.DetailInfos).match(/{"base":{"entityid":({{[^{}]*}}),"baseid":610105,/)[1];
            es.simpleRequest('eMessageItem_ActivateExtra_C', {
                fn: 'MessageActivateExtraRequest',
                opts: {entityid: JSON.parse(es.caseData.eqEntityid)}
            }, {save: true, cb: callback});

        }

        function extras(callback) {
            var regArray = JSON.stringify(es.caseData.DetailInfos).match(/{"base":{"entityid":({[^{}]*}),"baseid":22025001,[^}]*},"equip":([^\]]*])/);
            var isActive = JSON.parse(regArray[2] + '}').extras.length;
            es.caseData.eqEntityid = JSON.parse(regArray[1]);
            if (isActive === 0) {
                es.request(es.getEProtoid('eMessageItem_ActivateExtra_C'),
                    Protobuf['item']['MessageActivateExtraRequest'].encode({
                        entityid: es.caseData.eqEntityid
                    }),
                    es.getEProtoid('eMessageItem_ActivateExtra_S'),
                    function (message) {
                        monitor(START, 'eMessageItem_Extras_C', 'Extras');
                        es.request(es.getEProtoid('eMessageItem_Extras_C'),
                            Protobuf['item']['MessageExtrasRequest'].encode({
                                entityid: es.caseData.eqEntityid, extra: {pos: 1, state: 1}
                            }),
                            es.getEProtoid('eMessageItem_Extras_S'),
                            function (message) {
                                monitor(END, 'eMessageItem_Extras_C', 'Extras');
                                es.caseData.Extras = Protobuf['item']['MessageExtrasResponse'].decode(message);
                                callback()
                            }
                        );
                        //es.caseData.activeRts  = Protobuf['item']['MessageActivateExtraRequest'].encode(message);
                    }
                );
            } else {
                monitor(START, 'eMessageItem_Extras_C', 'Extras');
                es.request(es.getEProtoid('eMessageItem_Extras_C'),
                    Protobuf['item']['MessageExtrasRequest'].encode({
                        entityid: es.caseData.eqEntityid, extra: {pos: 1, state: 1}
                    }),
                    es.getEProtoid('eMessageItem_Extras_S'),
                    function (message) {
                        monitor(END, 'eMessageItem_Extras_C', 'Extras');
                        es.caseData.Extras = Protobuf['item']['MessageExtrasResponse'].decode(message);
                        callback()
                    }
                );
            }
        }

        function compoundGem(callback) {
            es.caseData.gemEntityid = JSON.stringify(es.caseData.DetailInfos).match(/{"base":{"entityid":({[^{}]*}),"baseid":24010001/)[1];
            monitor(START, 'eMessageItem_CompoundGem_C', 'CompoundGem');
            es.request(es.getEProtoid('eMessageItem_CompoundGem_C'),
                Protobuf['item']['MessageCompoundGemRequest'].encode({
                    entityid: JSON.parse(es.caseData.gemEntityid)
                }),
                es.getEProtoid('eMessageItem_CompoundGem_S'),
                function (message) {
                    monitor(END, 'eMessageItem_CompoundGem_C', 'CompoundGem');
                    //es.caseData.CompoundGem = Protobuf['item']['MessageCompoundGemResponse'].decode(message);
                    callback()
                }
            );
        }

        function escortDetect(callback) {
            monitor(START, 'eMessageEscort_Detect_C', 'Detect');
            es.request(es.getEProtoid('eMessageEscort_Detect_C'),
                Protobuf['escort']['MessageDetectRequest'].encode({}),
                es.getEProtoid('eMessageEscort_Detect_S'),
                function (message) {
                    monitor(END, 'eMessageEscort_Detect_C', 'Detect');
                    es.caseData.Detect = Protobuf['escort']['MessageDetectResponse'].decode(message);
                    callback()
                }
            );
        }

        function intoLevels(callback) {
            monitor(START, 'eMessageBattle_IntoLevels_C', 'IntoLevels');
            es.request(es.getEProtoid('eMessageBattle_IntoLevels_C'),
                Protobuf['battle']['MessageIntoLevelsRequest'].encode({
                    level: 10101
                }),
                es.getEProtoid('eMessageBattle_IntoLevels_S'),
                function (message) {
                    monitor(END, 'eMessageBattle_IntoLevels_C', 'IntoLevels');
                    //es.caseData.IntoLevels = Protobuf['battle']['MessageIntoLevelsResponse'].decode(message);
                    es.unregister(es.getEProtoid('eMessageBattle_IntoLevels_S'));
                    callback()
                }
            );
        }

        function pvpBattleResult(callback) {
            monitor(START, 'pvp_eMessageBattle_Result_C', 'pvpbattleResult');
            es.request(es.getEProtoid('eMessageBattle_Result_C'),
                Protobuf['battle']['MessageBattleResultRequest'].encode({
                    levelid: 999999,
                    result: 1,
                    grade: 3,
                    orders: {index: 1}
                }),
                es.getEProtoid('eMessageBattle_Result_S'),
                function (message) {
                    es.caseData.battleResult = Protobuf['battle']['MessageBattleResultResponse'].decode(message);
                    //console.log('es.caseData.battleResult====>', es.caseData.battleResult);
                    monitor(END, 'pvp_eMessageBattle_Result_C', 'pvpbattleResult');
                    es.unregister(es.getEProtoid('eMessageBattle_Result_S'));
                    callback()
                }
            );
        }

        function battleResult(callback) {
            monitor(START, 'eMessageBattle_Result_C', 'battleResult');
            es.request(es.getEProtoid('eMessageBattle_Result_C'),
                Protobuf['battle']['MessageBattleResultRequest'].encode({
                    levelid: 10101,
                    result: 1,
                    grade: 3,
                    orders: {index: 1}
                }),
                es.getEProtoid('eMessageBattle_Result_S'),
                function (message) {
                    es.caseData.battleResult = Protobuf['battle']['MessageBattleResultResponse'].decode(message);
                    //console.log('es.caseData.battleResult:', es.caseData.battleResult);
                    monitor(END, 'eMessageBattle_Result_C', 'battleResult');
                    es.unregister(es.getEProtoid('eMessageBattle_Result_S'));
                    callback()
                }
            );
        }

        function arenaClearPKCD(callback) {
            es.simpleRequest('eMessageArena_ClearPKCD_C', {
                    fn: 'MessageClearPKCDRequest'
                },
                {
                    save: true, cb: callback
                });
        }

        function battleChallenge(callback) {
            monitor(START, 'eMessageBattle_Challenge_C', 'Challenge');
            es.request(es.getEProtoid('eMessageBattle_Challenge_C'),
                Protobuf['battle']['MessageChallengeRequest'].encode({
                    method: 2,
                    roleid: es.caseData['ArenaInfo']['opponents'][0]['roleid'],
                    place: es.caseData['ArenaInfo']['opponents'][0]['rank']
                }),
                es.getEProtoid('eMessageBattle_Challenge_S'),
                function (message) {
                    //es.caseData.Challenge = Protobuf['battle']['MessageChallengeResponse'].decode(message);
                    monitor(END, 'eMessageBattle_Challenge_C', 'Challenge');
                    es.unregister(es.getEProtoid('eMessageBattle_Challenge_S'));
                    callback()
                }
            );
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            //es.close();
        }, es.responseOverTime);
    }
);
