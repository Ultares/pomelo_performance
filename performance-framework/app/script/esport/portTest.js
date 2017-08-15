/**
 * Created by pc on 2017/1/9.
 */
var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var EsportClient = require('dena-client').esport;
var Esport = EsportClient.Esport;
var Protobuf = EsportClient.Protobuf;
var Buffer = require("buffer")["Buffer"];

var START = 'start';
var END = 'end';

var es = new Esport();

es.connect(actor.server, function () {  //actor.server
    es.log(actor.actorId + ' :tcp-socket connect to esServer!');
    es.caseData.previous = true;
    es.run();
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

var genAccount = function () {
    // es.log('account : ' + account);
    return actor.actorId.split('|')[0];
    // return "game_001";
    //return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
};

// var actor = {};
//
// actor.actorId = '1';
// actor.debug = true;
// actor.server = {
//    host: '192.168.3.33',
//    port: 10001
// };

// var monitor = function (type, name, reqId) {
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
// };


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getEProtoId = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0] + '_MessageId';
    es.log("EProtoStr : " + EProtoStr);
    return Protobuf['MessageID'][mType][EProtoStr];
};

// opts { qName: "",  // Module name
//        rName: "",
//        q: "",
//        r: "",
//        qOpts: {},
//        isMonitor: true,
//        sr: false // save response

function monitorRequest(opts, cb) {
    var isMonitor = (opts.isMonitor == undefined) ? true : opts.isMonitor;
    isMonitor && monitor(START, opts.q, '1');
    es.request(getEProtoId(opts.q + "_ID"),
        Protobuf[opts.qName][opts.q].encode(opts.qOpts),
        getEProtoId(opts.r + "_ID"),
        function (message) {
            isMonitor && monitor(END, opts.q, '1');
            data = opts.rName ? Protobuf[opts.rName][opts.r].decode(message) :
                Protobuf[opts.qName][opts.r].decode(message);
            es.unregister(getEProtoId(opts.r + "_ID"));
            opts.sr && (es.caseData[opts.r] = data) && es.log(opts.r + ': ' + JSON.stringify(es.caseData[opts.r]));
            opts.sr || es.log(opts.r + ': ' + JSON.stringify(data));
            opts = undefined;
            cb();
        }
    );
}

function preRegister() {
    es.register(getEProtoId('S2C_TaskDataUpdate_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Task']['S2C_TaskDataUpdate'].decode(message);
            }
        });

    es.register(getEProtoId('S2C_UpdateCards_ID'), function (message) {
        if (es.caseData.debug) {
            data = Protobuf['Card']['S2C_UpdateCards'].decode(message);
        }
    });
    es.register(getEProtoId('S2C_UpdateItems_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Item']['S2C_UpdateItems'].decode(message);
            }
        });
    es.register(getEProtoId('S2C_UpdateResources_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Player']['S2C_UpdateResources'].decode(message);
            }
        });
    es.register(getEProtoId('S2C_UpdateMailDataMsg_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Mail']['S2C_UpdateMailDataMsg'].decode(message);
            }
        });
    es.register(getEProtoId('S2C_ErrorCodeMsg_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Client']['S2C_ErrorCodeMsg'].decode(message);
            }
        });
    es.register(getEProtoId('S2C_CreatePlayerBasicInfoResponse_ID'),
        function (message) {
            if (es.caseData.debug) {
                data = Protobuf['PlayerBasic']['S2C_CreatePlayerBasicInfoResponse'].decode(message);
            }
        });
}

// preRegister();

es.actions.push(
    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            es.caseData.account = genAccount();
            es.log('C2S_AccountVerifyRequest_ID: ' + es.caseData.account);
            es.request(32, //getEProtoId('C2S_XlAccountVerifyRequest_ID'),
                Protobuf['Account']['C2S_XlAccountVerifyRequest'].encode({
                    request: {
                        account: es.caseData.account,
                        platform_id: 'xl',
                        global_server_id: '1',
                        game_id: '1',
                        platform_session: 'zzzzzzzz',
                        gameRegion: "1area",
                        accountType: "1",
                        channel: "xl"
                    },
                    key: "xl_sp_key"
                }),
                getEProtoId('S2C_AccountVerifyResponse_ID'),
                function (message) {
                    data = Protobuf['Account']['S2C_AccountVerifyResponse'].decode(message);
                    es.log('S2C_AccountVerifyResponse: ' + JSON.stringify(data));
                    if (data.account_info) {
                        es.caseData.account_id = data.account_info.account_id;
                        es.caseData.account_datas = data.account_info['account_datas'];
                        es.log("es.caseData.account_datas.length: " + es.caseData.account_datas.length);
                    } else {
                        es.caseData.account_datas = [];
                    }
                    es.caseData.previous = true;
                })
        }, es.randomIntTime());
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            if (!es.caseData.account_datas.length) {
                es.request(getEProtoId('C2S_XLCreatePlayerBasicInfoRequest_ID'),
                    Protobuf['PlayerBasic']['C2S_XLCreatePlayerBasicInfoRequest'].encode({
                        request: {
                            account_id: es.caseData.account,
                            icon_id: 1,
                            name: es.caseData.account.substr(0, 8),
                            initial_team_index: 1,
                            channel: "xl"
                        },
                        key: "xl_sp_key"
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        es.log('S2C_LoginResponse_ID: ' + JSON.stringify(data));
                        es.caseData.previous = true;
                    }
                );
            } else {
                es.request(getEProtoId('C2S_XLLoginRequest_ID'),
                    Protobuf['Player']['C2S_XLLoginRequest'].encode({
                        request: {
                            account: es.caseData.account,
                            player_id: es.caseData.account_datas[0]['player_id'],
                            channel: "xl"
                        }
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        es.log('S2C_LoginResponse_ID: ' + JSON.stringify(data));
                        es.caseData.previous = true;
                    }
                );
            }
        }, es.randomIntTime());
    },


    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        if (es.caseData.loopCount <= 0) {
            es.log('es.caseData.loopCount:' + es.caseData.loopCount);
            return undefined;
        }
        // es.log('es.caseData.loopCount:' + es.caseData.loopCount);
        // es.connect(actor.server,function(){});
        es.caseData.previous = false;
        es.funcseries = [];
        if (es.caseData.ratemode) {
            es.funcmap = {
                Instance: {
                    funcArray: [C2S_AddItem_11005,
                        EnterInstanceRequest,
                        C2S_BattleTacticOptionRequest,
                        C2S_BattleTacticRequest,
                        C2S_LeaveBattle], rate: 8
                },
                Gamble: {
                    funcArray: [C2S_AddItem_11002,
                        C2S_GambleRequest], rate: 1
                },
                Info: {
                    funcArray: [C2S_GetCardInfoRequest,
                        C2S_GetCardInfoTeamsRequest,
                        C2S_RecruitInfoRequest,
                        C2S_GetBagInfoRequest,
                        C2S_GetShopInfoRequest,
                        C2S_EchoGameS,
                        C2S_GetRankInfoByTypeRequest,
                        C2S_GetCardInfoPositionsRequest,
                        C2S_GetHeroPoolInfo,
                        C2S_TeamPropertyRequest,
                        C2S_GloryInfoRequest,
                        C2S_MailInfoRequest,
                        C2S_ChatInfoRequest,
                        C2S_TaskInfoRequest], rate: 1
                }
            };
            es.willTest = [];
            es.endRate = 8;
            var i = 0;
            while (i <= 10) {
                for (var k in es.funcmap) {
                    var rate = getRandomInt(1, es.endRate);
                    es.log('rate is <%s> and k.rate is <%s> ', rate, es.funcmap[k].rate);
                    if (rate <= es.funcmap[k].rate) {
                        es.willTest = es.willTest.concat(es.funcmap[k].funcArray);
                    }
                }
                if (es.willTest.length) {
                    es.log('Random <%s> time(s)', i);
                    break;
                }
                i++;
            }
            es.log('robot.willTest is ', es.willTest.length);
            es.funcArray = es.willTest;
        } else {
            es.funcArray =
                [
                    C2S_EchoGameS,
                    C2S_GetTalentInfoRequest,
                    // C2S_AddItem_11005,
                    // EnterInstanceRequest,
                    // C2S_BattleTacticOptionRequest,
                    // C2S_BattleTacticRequest,
                    // C2S_LeaveBattle,
                    C2S_GetCardInfoRequest,
                    C2S_GetCardInfoTeamsRequest,
                    C2S_RecruitInfoRequest,
                    C2S_GetBagInfoRequest,
                    C2S_GetShopInfoRequest,
                    C2S_EchoGameS,
                    C2S_GetRankInfoByTypeRequest,
                    C2S_GetCardInfoPositionsRequest,
                    C2S_GetHeroPoolInfo,
                    // C2S_TeamPropertyRequest,
                    C2S_GloryInfoRequest,
                    C2S_MailInfoRequest,
                    C2S_ChatInfoRequest,
                    C2S_TaskInfoRequest,
                    // C2S_AddItem_11002,
                    // C2S_GambleRequest
                ];
        }
        es.funcArray.forEach(function (element, index, array) {
            var func = function (cb) {
                setTimeout(element, es.randomIntTime(), cb);
            };
            es.funcseries.push(func)
        });

        async.series(es.funcseries,
            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    es.caseData.previous = true;
                    es.caseData.loopCount -= 1;
                }
            }
        );

        function AccountVerifyRequest(cb) {
            es.caseData.account = genAccount();
            monitorRequest({
                qName: "Account",
                q: "C2S_AccountVerifyRequest",
                r: "S2C_AccountVerifyResponse",
                qOpts: {
                    account: es.caseData.account,
                    platform_id: 'xingluo',
                    global_server_id: '7',
                    game_id: '1',
                    platform_session: 'zzzzzzzz'
                },
                sr: true
            }, cb);
        }

        function CreatePlayerBasicInfoRequest(cb) {

            es.caseData.accounts = es.caseData.S2C_AccountVerifyResponse.account_info ?
                es.caseData.S2C_AccountVerifyResponse.account_info.account_datas : [];

            if (!es.caseData.accounts.length) {
                monitorRequest({
                    qName: "PlayerBasic",
                    q: "C2S_CreatePlayerBasicInfoRequest",
                    rName: "Player",
                    r: "S2C_LoginResponse",
                    qOpts: {
                        account_id: es.caseData.account,
                        icon_id: 1,
                        name: es.caseData.account.substr(0, 8),
                        initial_team_index: 1
                    }
                }, cb);
            } else {
                monitorRequest({
                    qName: "Player",
                    q: "C2S_LoginRequest",
                    r: "S2C_LoginResponse",
                    qOpts: {
                        account: es.caseData.account,
                        player_id: es.caseData.accounts[0]['player_id']
                    },
                    sr: true
                }, cb);
            }
        }

        function C2S_GetCardInfoPositionsRequest(cb) {
            monitorRequest({
                qName: "Card",
                q: "C2S_GetCardInfoPositionsRequest",
                r: "S2C_GetCardInfoPositionsResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_GetHeroPoolInfo(cb) {
            var opts = {
                qName: "HeroPool",
                q: "C2S_GetHeroPoolInfo",
                r: "S2C_UpdateHeroPool",
                qOpts: {begin_index: -1}
            };
            monitorRequest(opts, cb);
        }

        function C2S_BuyShopItemRequest(cb) {
            monitorRequest({
                qName: "Shop",
                q: "C2S_BuyShopItemRequest",
                r: "S2C_BuyShopItemResponse",
                qOpts: {
                    posi: 1,
                    count: 1,
                    shop_type: 102
                }
            }, cb);
        }

        function C2S_AddItem_11002(cb) {
            monitorRequest({
                qName: "Item",
                q: "C2S_AddItem",
                rName: "Player",
                r: "S2C_UpdateResources",
                qOpts: {
                    item_id: 11002,  // 11002
                    item_count: 200
                },
                isMonitor: false
            }, cb);
        }

        function C2S_AddItem_11005(cb) {
            monitorRequest({
                qName: "Item",
                q: "C2S_AddItem",
                rName: "Player",
                r: "S2C_UpdateResources",
                qOpts: {
                    item_id: 11005,  // 11002
                    item_count: 6
                },
                isMonitor: false
            }, cb);
        }

        function C2S_GetShopInfoRequest(cb) {
            monitorRequest({
                qName: "Shop",
                q: "C2S_GetShopInfoRequest",
                r: "S2C_GetShopInfoResponse",
                qOpts: {type: 103}
            }, cb);
        }

        function C2S_GetCardInfoRequest(cb) {
            monitorRequest({
                qName: "Card",
                q: "C2S_GetCardInfoRequest",
                r: "S2C_GetCardInfoResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_CardComposeStarRequest(cb) {
            monitorRequest({
                qName: "Card",
                q: "C2S_CardComposeStarRequest",
                r: "S2C_CardComposeStarResponse",
                qOpts: {
                    target_card_uid: {"low": -546111486, "high": 473397, "unsigned": true},
                    material_card_uids: [
                        {"low": -461570047, "high": 473406, "unsigned": true},
                        {"low": -461570047, "high": 473406, "unsigned": true},
                    ]
                }
            }, cb);
        }

        function C2S_TeamPropertyRequest(cb) {
            monitorRequest({
                qName: "Team",
                q: "C2S_TeamPropertyRequest",
                r: "S2C_TeamPropertyResponse",
                qOpts: {team_id: 1}
            }, cb);
        }

        function C2S_ModifyTeamRequest(cb) {
            monitorRequest({
                qName: "Team",
                q: "C2S_ModifyTeamRequest",
                r: "S2C_ModifyTeamResponse",
                qOpts: {
                    new_team: {
                        team_id: 1,
                        top: 1013,
                        jungler: 1077,
                        mid: 1078,
                        adc: 1088,
                        support: 1087,
                        cards: [
                            {"position": 1, "card_uid": {"low": -569901054, "high": 473397, "unsigned": true}},
                            {"position": 2, "card_uid": {"low": -569901053, "high": 473397, "unsigned": true}},
                            {"position": 3, "card_uid": {"low": -569901052, "high": 473397, "unsigned": true}},
                            {"position": 4, "card_uid": {"low": -569901051, "high": 473397, "unsigned": true}},
                            {"position": 5, "card_uid": {"low": -569901050, "high": 473397, "unsigned": true}}]
                    }
                }
            }, cb);
        }

        function C2S_GetCardInfoTeamsRequest(cb) {
            monitorRequest({
                qName: "Card",
                q: "C2S_GetCardInfoTeamsRequest",
                r: "S2C_GetCardInfoTeamsResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_GetResoucesRequest(cb) {
            monitorRequest({
                qName: "Player",
                q: "C2S_GetResoucesRequest",
                r: "S2C_GetResoucesResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_EchoGameS(cb) {
            monitorRequest({
                qName: "Client",
                q: "C2S_EchoGameS",
                r: "S2C_EchoGameBack",
                isMonitor: false,
                rOpts: {}
            }, cb);
        }

        function C2S_GloryInfoRequest(cb) {
            monitorRequest({
                qName: "Glory",
                q: "C2S_GloryInfoRequest",
                r: "S2C_GloryInfoUpdate",
                rOpts: {}
            }, cb);
        }

        function C2S_MailInfoRequest(cb) {
            monitorRequest({
                qName: "Mail",
                q: "C2S_MailInfoRequest",
                r: "S2C_MailInfoResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_RecruitInfoRequest(cb) {
            monitorRequest({
                qName: "Recruit",
                q: "C2S_RecruitInfoRequest",
                r: "S2C_UpdateRecruitInfo",
                qOpts: {}
            }, cb);
        }

        function C2S_RecruitStepFulfillRequest(cb) {
            monitorRequest({
                qName: "Recruit",
                q: "C2S_RecruitStepFulfillRequest",
                r: "S2C_RecruitStepFulfillResponse",
                qOpts: {
                    record_uid: {"low": 438370306, "high": 473407, "unsigned": true},
                    current_choice_question_step: 1,
                    // negotiation_money_count: 200000,
                    // card_uids: [
                    //     {"low":-2031943679,"high":473408,"unsigned":true},
                    //     {"low":-2077687807,"high":473408,"unsigned":true},
                    //     {"low":-2030043135,"high":473408,"unsigned":true}
                    // ]
                }
            }, cb);
        }

        function C2S_RecruitGiveUpRequest(cb) {
            monitorRequest({
                qName: "Recruit",
                q: "C2S_RecruitGiveUpRequest",
                r: "S2C_RecruitGiveUpResponse",
                qOpts: {
                    record_uid: {"low": 438370305, "high": 473407, "unsigned": true},
                }
            }, cb);
        }


        function C2S_GetBagInfoRequest(cb) {
            monitorRequest({
                qName: "Player",
                q: "C2S_GetBagInfoRequest",
                r: "S2C_GetBagInfoResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_OpenPackageRequest(cb) {
            monitorRequest({
                qName: "Item",
                q: "C2S_OpenPackageRequest",
                r: "S2C_OpenPackageResponse",
                qOpts: {
                    item_uid: 1,
                    item_count: 2
                }
            }, cb);
        }

        function C2S_ChatInfoRequest(cb) {
            monitorRequest({
                qName: "Chat",
                q: "C2S_ChatInfoRequest",
                r: "S2C_ChatInfoResponse",
                qOpts: {
                    channel_type: 1,
                    channel_idx: 0,
                    last_time: 0,
                    index: 0
                }
            }, cb);
        }

        function C2S_ChatRequest(cb) {
            var hello = new Buffer("hello");
            monitorRequest({
                qName: "Chat",
                q: "C2S_ChatRequest",
                r: "S2C_ChatResponse",
                qOpts: {
                    channel_type: 1,
                    channel_idx: 1,
                    chat_base: {
                        chat_str: hello,
                        type: 1,
                        name: " ",
                        icon_id: -1,
                        level: 11,
                        player_id: {"low": -569901054, "high": 473397, "unsigned": true}
                    }
                }
            }, cb);
        }

        function C2S_TaskInfoRequest(cb) {
            monitorRequest({
                qName: "Task",
                q: "C2S_TaskInfoRequest",
                r: "S2C_TaskInfoResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_TaskRewardRequest(cb) {
            monitorRequest({
                qName: "Task",
                q: "C2S_TaskRewardRequest",
                r: "S2C_TaskRewardResponse ",
                qOpts: {task_id: 2202}
            }, cb);
        }

        function C2S_GetInstanceRequest(cb) {
            monitorRequest({
                qName: "Instance",
                q: "C2S_GetInstanceRequest",
                r: "S2C_GetInstanceResponse ",
                rOpts: {}
            }, cb);
        }

        function C2S_GambleRequest(cb) {
            monitorRequest({
                qName: "Gamble",
                q: "C2S_GambleRequest",
                r: "S2C_GamebleResult",
                rOpts: {
                    gamble_type: 2,
                    is_ten_times: false
                }
            }, cb);
        }

        function C2S_GetRankInfoByTypeRequest(cb) {
            monitorRequest({
                qName: "Rank",
                q: "C2S_GetRankInfoByTypeRequest",
                r: "S2C_GetRankInfoByTypeResponse",
                rOpts: {
                    rank_type: 1,
                    begin_index: 0
                }
            }, cb);
        }

        function EnterInstanceRequest(cb) {
            es.caseData.instance_id = 100101;
            monitorRequest({
                qName: "Instance",
                q: "C2S_EnterInstanceRequest",
                rName: "Battle",
                r: "S2C_EnterBattle",
                qOpts: {
                    instance_id: es.caseData.instance_id
                }
            }, cb);
        }

        function analyzeBattleOptions(cb) {

            var battleTimer = setInterval(battleOptions, 3000);

            function battleOptions() {
                var _fcs = [C2S_BattleTacticOptionRequest,
                    C2S_BattleTacticRequest];
                async.series(_fcs,
                    function (err) {
                        if (err) {
                            console.log('Error====>', err);
                        } else {
                            es.log("round_type: " + JSON.stringify(es.caseData.S2C_BattleTacticResponse.new_rounds[0].round_type));
                        }
                    }
                );

                if (es.caseData.S2C_BattleTacticResponse != undefined) {
                    if (es.caseData.S2C_BattleTacticResponse.new_rounds[0].round_type != 3) {
                        clearInterval(battleTimer);
                        // cb();
                    }
                }
            }
        }


        function C2S_BattleTacticOptionRequest(cb) {
            monitorRequest({
                qName: "Battle",
                q: "C2S_BattleTacticOptionRequest",
                r: "S2C_BattleTacticOptionResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_BattleTacticRequest(cb) {
            monitorRequest({
                qName: "Battle",
                q: "C2S_BattleTacticRequest",
                r: "S2C_BattleTacticResponse",
                qOpts: {
                    tactic_id: 0
                },
                sr: true
            }, cb);
        }

        function C2S_LeaveBattle(cb) {
            monitorRequest({
                qName: "Battle",
                q: "C2S_LeaveBattle",
                rName: "Instance",
                r: "S2C_InstanceFinishResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_GetTalentInfoRequest(cb) {
            monitorRequest({
                qName: "Talent",
                q: "C2S_GetTalentInfoRequest",
                r: "S2C_GetTalentInfoResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_TalentUpgradeRequest(cb) {
            monitorRequest({
                qName: "Talent",
                q: "C2S_TalentUpgradeRequest",
                r: "S2C_TalentUpgradeResponse",
                qOpts: {talent_id: 101}
            }, cb);
        }

        function C2S_TalentResetRequest(cb) {
            monitorRequest({
                qName: "Talent",
                q: "C2S_TalentResetRequest",
                r: "S2C_TalentResetResponse",
                qOpts: {card_position: 5}
            }, cb);
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            console.log('Clear timer!')
        }, es.caseData.responseOverTime);
    }
);
