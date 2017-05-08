/**
 * Created by pc on 2017/1/9.
 */
var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var EsportClient = require('dena-client').esport;
var Esport = EsportClient.Esport;
var Protobuf = EsportClient.Protobuf;

var START = 'start';
var END = 'end';

var es = new Esport();

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

var genAccount = function () {
    var account = actor.actorId.split('|')[0];
    // es.log('account : ' + account);
    return account;
    //return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
};

//console.log(JSON.stringify(actor));

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

es.connect(actor.server, function () {  //actor.server
    es.log(actor.actorId + ' :tcp-socket connect to esServer!');
    es.caseData.previous = true;
    es.run();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getEProtoId = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0] + '_MessageId';
    return Protobuf['MessageID'][mType][EProtoStr];
};

es.actions.push(
    function () {
        es.register(getEProtoId('S2C_TaskDataUpdate_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['Task']['S2C_TaskDataUpdate'].decode(message);
                    // console.log('S2C_TaskDataUpdate====>', JSON.stringify(data))
                }
            });

        es.register(getEProtoId('S2C_UpdateCards_ID'), function (message) {
            if (es.caseData.debug) {
                data = Protobuf['Card']['S2C_UpdateCards'].decode(message);
                // console.log('S2C_UpdateCards====>', JSON.stringify(data))
            }
        });
        es.register(getEProtoId('S2C_UpdateItems_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['Item']['S2C_UpdateItems'].decode(message);
                    // console.log('S2C_UpdateItems====>', JSON.stringify(data))
                }
            });
        es.register(getEProtoId('S2C_UpdateResources_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['Player']['S2C_UpdateResources'].decode(message);
                    // console.log('S2C_UpdateResources====>', JSON.stringify(data))
                }
            });
        es.register(getEProtoId('S2C_UpdateMailDataMsg_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['Mail']['S2C_UpdateMailDataMsg'].decode(message);
                    // console.log('S2C_UpdateMailDataMsg====>', JSON.stringify(data))
                }
            });
        es.register(getEProtoId('S2C_ErrorCodeMsg_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['Client']['S2C_ErrorCodeMsg'].decode(message);
                    // console.log('S2C_ErrorCodeMsg====>', JSON.stringify(data))
                }
            });
        es.register(getEProtoId('S2C_CreatePlayerBasicInfoResponse_ID'),
            function (message) {
                if (es.caseData.debug) {
                    data = Protobuf['PlayerBasic']['S2C_CreatePlayerBasicInfoResponse'].decode(message);
                    // console.log('S2C_CreatePlayerBasicInfoResponse====>', JSON.stringify(data))
                }
            });
    },

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        //
        if (es.caseData.loopCount <= 0){
            es.log('es.caseData.loopCount:' + es.caseData.loopCount);
            return undefined;
        }
        es.caseData.previous = false;
        // es.connect(actor.server, function () {
        //     es.run();
        // });
        es.funcseries = [];
        if (es.caseData.ratemode) {
            es.funcmap = {
                AccountVerify: {funcArray: [AccountVerifyRequest, CreatePlayerBasicInfoRequest], rate: 1},
            };
            es.willTest = [];
            es.endRate = 3;
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
                    AccountVerifyRequest,
                    CreatePlayerBasicInfoRequest,
                    C2S_EchoGameS,
                    C2S_GetBagInfoRequest,
                    C2S_GetCardInfoPositionsRequest,
                    C2S_GetHeroPoolInfo,
                    C2S_GetCardInfoRequest,      // []
                    C2S_GetCardInfoTeamsRequest, // []
                    C2S_EchoGameS,
                    C2S_TeamPropertyRequest,
                    C2S_ModifyTeamRequest,
                    C2S_GetResoucesRequest,      // []
                    C2S_GetSnakeInfoRequest, // []
                    C2S_GloryInfoRequest,    // []
                    C2S_MailInfoRequest,     // []
                    C2S_ChatInfoRequest,
                    C2S_EchoGameS,
                    C2S_TaskInfoRequest,     // []
                    C2S_RecruitInfoRequest,  // []
                    C2S_GetInstanceRequest,  // []
                    C2S_EchoGameS
                    // C2S_GambleRequest,
                    // EnterInstanceRequest,
                    // LeaveBattle
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
                    // es.close();
                }
            }
        );

        function AccountVerifyRequest(cb) {
            monitor(START, 'C2S_AccountVerifyRequest', '1');
            es.caseData.account = genAccount();
            // es.log('es.caseData.account', es.caseData.account);
            es.request(getEProtoId('C2S_AccountVerifyRequest_ID'),
                Protobuf['Account']['C2S_AccountVerifyRequest'].encode({
                    account: es.caseData.account,
                    platform_id: 'xingluo',
                    global_server_id: '2',
                    game_id: '1',
                    platform_session: 'zzzzzzzz'
                }),
                getEProtoId('S2C_AccountVerifyResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_AccountVerifyRequest', '1');
                    data = Protobuf['Account']['S2C_AccountVerifyResponse'].decode(message);
                    // es.log('Account Data:' + JSON.stringify(data));
                    // es.log('Account Data:' + JSON.stringify(data.account_info));
                    es.caseData.account_id = data.account_info.account_id;
                    es.caseData.account_datas = data.account_info['account_datas'];
                    cb();
                })
        }

        function CreatePlayerBasicInfoRequest(cb) {

            if (!es.caseData.account_datas.length) {
                monitor(START, 'C2S_CreatePlayerBasicInfoRequest', '1');
                es.request(getEProtoId('C2S_CreatePlayerBasicInfoRequest_ID'),
                    Protobuf['PlayerBasic']['C2S_CreatePlayerBasicInfoRequest'].encode({
                        account_id: es.caseData.account_id,
                        icon_id: 1,
                        name: es.caseData.account.substr(0, 8),
                        initial_team_index: 1
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        monitor(END, 'C2S_CreatePlayerBasicInfoRequest', '1');
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        cb();
                    }
                );
            } else {
                monitor(START, 'C2S_LoginRequest', '1');
                // es.log("es.caseData.account_datas[0]['player_id']: " + es.caseData.account_datas[0]['player_id']);
                es.request(getEProtoId('C2S_LoginRequest_ID'),
                    Protobuf['Player']['C2S_LoginRequest'].encode({
                        account: es.caseData.account_id,
                        player_id: es.caseData.account_datas[0]['player_id']

                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        monitor(END, 'C2S_LoginRequest', '1');
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        cb();
                    }
                );
            }
        }

        function C2S_GetBagInfoRequest(cb) {

            monitor(START, 'C2S_GetBagInfoRequest', '1');
            es.request(getEProtoId('C2S_GetBagInfoRequest_ID'),
                Protobuf['Player']['C2S_GetBagInfoRequest'].encode({}),
                getEProtoId('S2C_GetBagInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetBagInfoRequest', '1');
                    data = Protobuf['Player']['S2C_GetBagInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GetCardInfoPositionsRequest(cb) {

            monitor(START, 'C2S_GetCardInfoPositionsRequest', '1');
            es.request(getEProtoId('C2S_GetCardInfoPositionsRequest_ID'),
                Protobuf['Card']['C2S_GetCardInfoPositionsRequest'].encode({}),
                getEProtoId('S2C_GetCardInfoPositionsResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetCardInfoPositionsRequest', '1');
                    data = Protobuf['Card']['S2C_GetCardInfoPositionsResponse'].decode(message);
                    cb();
                }
            );
        }

        function C2S_GetHeroPoolInfo(cb) {

            monitor(START, 'C2S_GetHeroPoolInfo', '1');
            es.request(getEProtoId('C2S_GetHeroPoolInfo_ID'),
                Protobuf['HeroPool']['C2S_GetHeroPoolInfo'].encode({begin_index: -1}),
                getEProtoId('S2C_UpdateHeroPool_ID'),
                function (message) {
                    monitor(END, 'C2S_GetHeroPoolInfo', '1');
                    data = Protobuf['HeroPool']['S2C_UpdateHeroPool'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GetCardInfoRequest(cb) {

            monitor(START, 'C2S_GetCardInfoRequest', '1');
            es.request(getEProtoId('C2S_GetCardInfoRequest_ID'),
                Protobuf['Card']['C2S_GetCardInfoRequest'].encode({}),
                getEProtoId('S2C_GetCardInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetCardInfoRequest', '1');
                    data = Protobuf['Card']['S2C_GetCardInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_TeamPropertyRequest(cb) {

            monitor(START, 'C2S_TeamPropertyRequest', '1');
            es.request(getEProtoId('C2S_TeamPropertyRequest_ID'),
                Protobuf['Team']['C2S_TeamPropertyRequest'].encode({team_id: 1}),
                getEProtoId('S2C_TeamPropertyResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_TeamPropertyRequest', '1');
                    data = Protobuf['Team']['S2C_TeamPropertyResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_ModifyTeamRequest(cb) {

            monitor(START, 'C2S_ModifyTeamRequest', '1');
            es.request(getEProtoId('C2S_ModifyTeamRequest_ID'),
                Protobuf['Team']['C2S_ModifyTeamRequest'].encode({
                    new_team: {
                        team_id: 2,
                        top: 906820818042882,
                        jungler: 906820818042883,
                        mid: 906820818042884,
                        adc: 906820818042885,
                        support: 906820818042886
                    }
                }),
                getEProtoId('S2C_ModifyTeamResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_ModifyTeamRequest', '1');
                    data = Protobuf['Team']['S2C_ModifyTeamResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GetCardInfoTeamsRequest(cb) {

            monitor(START, 'C2S_GetCardInfoTeamsRequest', '1');
            es.request(getEProtoId('C2S_GetCardInfoTeamsRequest_ID'),
                Protobuf['Card']['C2S_GetCardInfoTeamsRequest'].encode({}),
                getEProtoId('S2C_GetCardInfoTeamsResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetCardInfoTeamsRequest', '1');
                    data = Protobuf['Card']['S2C_GetCardInfoTeamsResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GetResoucesRequest(cb) {

            monitor(START, 'C2S_GetResoucesRequest', '1');
            es.request(getEProtoId('C2S_GetResoucesRequest_ID'),
                Protobuf['Player']['C2S_GetResoucesRequest'].encode({}),
                getEProtoId('S2C_GetResoucesResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetResoucesRequest', '1');
                    data = Protobuf['Player']['S2C_GetResoucesResponse'].decode(message);
                    es.unregister(getEProtoId('S2C_GetResoucesResponse_ID'));
                    cb();
                }
            );

        }

        function C2S_GetSnakeInfoRequest(cb) {

            monitor(START, 'C2S_GetSnakeInfoRequest', '1');
            es.request(getEProtoId('C2S_GetSnakeInfoRequest_ID'),
                Protobuf['Snake']['C2S_GetSnakeInfoRequest'].encode({}),
                getEProtoId('S2C_GetSnakeInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetSnakeInfoRequest', '1');
                    data = Protobuf['Snake']['S2C_GetSnakeInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_EchoGameS(cb) {

            // monitor(START, 'C2S_EchoGameS', '1');
            es.request(getEProtoId('C2S_EchoGameS_ID'),
                Protobuf['Client']['C2S_EchoGameS'].encode({}),
                getEProtoId('S2C_EchoGameBack_ID'),
                function (message) {
                    // monitor(END, 'C2S_EchoGameS', '1');
                    data = Protobuf['Client']['S2C_EchoGameBack'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GloryInfoRequest(cb) {

            monitor(START, 'C2S_GloryInfoRequest', '1');
            es.request(getEProtoId('C2S_GloryInfoRequest_ID'),
                Protobuf['Glory']['C2S_GloryInfoRequest'].encode({}),
                getEProtoId('S2C_GloryInfoUpdate_ID'),
                function (message) {
                    monitor(END, 'C2S_GloryInfoRequest', '1');
                    data = Protobuf['Glory']['S2C_GloryInfoUpdate'].decode(message);
                    cb();
                }
            );

        }

        function C2S_MailInfoRequest(cb) {

            monitor(START, 'C2S_MailInfoRequest', '1');
            es.request(getEProtoId('C2S_MailInfoRequest_ID'),
                Protobuf['Mail']['C2S_MailInfoRequest'].encode({}),
                getEProtoId('S2C_MailInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_MailInfoRequest', '1');
                    data = Protobuf['Mail']['S2C_MailInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_ChatInfoRequest(cb) {

            monitor(START, 'C2S_ChatInfoRequest', '1');
            es.request(getEProtoId('C2S_ChatInfoRequest_ID'),
                Protobuf['Chat']['C2S_ChatInfoRequest'].encode({
                    channel_type: 1,
                    channel_idx: -1,
                    last_time: 0,
                    index: 0
                }),
                getEProtoId('S2C_ChatInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_ChatInfoRequest', '1');
                    data = Protobuf['Chat']['S2C_ChatInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_TaskInfoRequest(cb) {

            monitor(START, 'C2S_TaskInfoRequest', '1');
            es.request(getEProtoId('C2S_TaskInfoRequest_ID'),
                Protobuf['Task']['C2S_TaskInfoRequest'].encode({}),
                getEProtoId('S2C_TaskInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_TaskInfoRequest', '1');
                    data = Protobuf['Task']['S2C_TaskInfoResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_RecruitInfoRequest(cb) {

            monitor(START, 'C2S_RecruitInfoRequest', '1');
            es.request(getEProtoId('C2S_RecruitInfoRequest_ID'),
                Protobuf['Recruit']['C2S_RecruitInfoRequest'].encode({}),
                getEProtoId('S2C_UpdateRecruitInfo_ID'),
                function (message) {
                    monitor(END, 'C2S_RecruitInfoRequest', '1');
                    data = Protobuf['Recruit']['S2C_UpdateRecruitInfo'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GetInstanceRequest(cb) {

            monitor(START, 'C2S_GetInstanceRequest', '1');
            es.request(getEProtoId('C2S_GetInstanceRequest_ID'),
                Protobuf['Instance']['C2S_GetInstanceRequest'].encode({}),
                getEProtoId('S2C_GetInstanceResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetInstanceRequest', '1');
                    data = Protobuf['Instance']['S2C_GetInstanceResponse'].decode(message);
                    cb();
                }
            );

        }

        function C2S_GambleRequest(cb) {
            monitor(START, 'C2S_GambleRequest', '1');
            es.request(getEProtoId('C2S_GambleRequest_ID'),
                Protobuf['Gamble']['C2S_GambleRequest'].encode({
                    gamble_type: 2,
                    is_ten_times: false
                }),
                getEProtoId('S2C_GamebleResult_ID'),
                function (message) {
                    monitor(END, 'C2S_GambleRequest', '1');
                    data = Protobuf['Gamble']['S2C_GamebleResult'].decode(message);
                    es.log('Gamble data :' + JSON.stringify(data));
                    cb();
                })
        }

        function EnterInstanceRequest(cb) {
            es.caseData.instance_id = 100101;
            monitor(START, 'C2S_EnterInstanceRequest', '1');
            es.request(getEProtoId('C2S_EnterInstanceRequest_ID'),
                Protobuf['Instance']['C2S_EnterInstanceRequest'].encode({
                    instance_id: es.caseData.instance_id
                }),
                getEProtoId('S2C_EnterBattle_ID'),
                function (message) {
                    monitor(END, 'C2S_EnterInstanceRequest', '1');
                    data = Protobuf['Battle']['S2C_EnterBattle'].decode(message);
                    cb();
                }
            );
        }

        function LeaveBattle(cb) {
            monitor(START, 'C2S_LeaveBattle', '1');
            es.request(getEProtoId('C2S_LeaveBattle_ID'),
                Protobuf['Battle']['C2S_LeaveBattle'].encode({}),
                getEProtoId('S2C_UpdateInstanceInfo_ID'),
                function (message) {
                    monitor(END, 'C2S_LeaveBattle', '1');
                    if (es.caseData.debug) {
                        data = Protobuf['Instance']['S2C_UpdateInstanceInfo'].decode(message);
                        console.log('S2C_UpdateInstanceInfo====>', JSON.stringify(data));
                    }
                    cb();
                }
            );
        }

        return 1;

    },

    function () {
        setTimeout(function () {
            // es.close();
            console.log('Clear timer!')
        }, es.caseData.responseOverTime);
    }
);
