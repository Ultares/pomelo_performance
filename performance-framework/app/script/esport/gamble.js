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
    return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
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
    // if (es.caseData.debug) {
    //     es.log(actor.actorId + 'tcp-socket connect to esServer!');
    // }
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

        es.register(getEProtoId('S2C_UpdateCards_ID'),
            function (message) {
                data = Protobuf['Card']['S2C_UpdateCards'].decode(message);
                es.log('S2C_UpdateCards :' + JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_TaskDataUpdate_ID'),
            function (message) {
                data = Protobuf['Task']['S2C_TaskDataUpdate'].decode(message);
                // console.log('S2C_TaskDataUpdate====>', JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_UpdateCards_ID'), function (message) {
            data = Protobuf['Card']['S2C_UpdateCards'].decode(message);
            // console.log('S2C_UpdateCards====>', JSON.stringify(data))
        });
        es.register(getEProtoId('S2C_UpdateItems_ID'),
            function (message) {
                data = Protobuf['Item']['S2C_UpdateItems'].decode(message);
                // console.log('S2C_UpdateItems====>', JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_UpdateResources_ID'),
            function (message) {
                data = Protobuf['Player']['S2C_UpdateResources'].decode(message);
                // console.log('S2C_UpdateResources====>', JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_UpdateMailDataMsg_ID'),
            function (message) {
                data = Protobuf['Mail']['S2C_UpdateMailDataMsg'].decode(message);
                // console.log('S2C_UpdateMailDataMsg====>', JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_ErrorCodeMsg_ID'),
            function (message) {
                data = Protobuf['Client']['S2C_ErrorCodeMsg'].decode(message);
                // console.log('S2C_ErrorCodeMsg====>', JSON.stringify(data))
            });
        es.register(getEProtoId('S2C_CreatePlayerBasicInfoResponse_ID'),
            function (message) {
                data = Protobuf['PlayerBasic']['S2C_CreatePlayerBasicInfoResponse'].decode(message);
                console.log('S2C_CreatePlayerBasicInfoResponse====>', JSON.stringify(data))
            });
    },

    function () {

        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        es.log('Verifying...');
        setTimeout(function () {
            es.caseData.account = genAccount();
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
                    es.caseData.previous = true;
                    data = Protobuf['Account']['S2C_AccountVerifyResponse'].decode(message);
                    es.caseData.account_id = data.account_info.account_id;
                    if (es.caseData.debug) {
                        es.log('account_id:' + es.caseData.account_id);
                    }
                    es.caseData.account_datas = data.account_info['account_datas'];
                })
        }, es.randomIntTime());
    },

    function () {

        if (!es.caseData.previous) {
            return 1;
        }

        es.caseData.previous = false;
        es.log('Create test...');
        // es.log('es.caseData.account_datas.length :' + es.caseData.account_datas.length);
        setTimeout(function () {
            if (!es.caseData.account_datas.length) {
                // monitor(START, 'C2S_CreatePlayerBasicInfoRequest', '1');
                es.request(getEProtoId('C2S_CreatePlayerBasicInfoRequest_ID'),
                    Protobuf['PlayerBasic']['C2S_CreatePlayerBasicInfoRequest'].encode({
                        account_id: es.caseData.account_id,
                        icon_id: 1,
                        name: es.caseData.account.substr(0, 8),//seData.account,
                        initial_team_index: 1
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        es.caseData.previous = true;
                        // monitor(END, 'C2S_CreatePlayerBasicInfoRequest', '1');
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        es.log('Received : ' + JSON.stringify(data));
                    }
                );
            } else {
                es.caseData.previous = true;
            }
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
                es.log('robot.willTest is ' + es.willTest.length)
            }
            es.funcArray = es.willTest;
        } else {
            es.funcArray =
                [
                    C2S_GambleRequest
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
                }
            }
        );

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

        function CreatePlayerBasicInfoRequest(cb) {
            if (!es.caseData.account_datas.length) {
                monitor(START, 'C2S_CreatePlayerBasicInfoRequest', '1');
                es.request(getEProtoId('C2S_CreatePlayerBasicInfoRequest_ID'),
                    Protobuf['PlayerBasic']['C2S_CreatePlayerBasicInfoRequest'].encode({
                        account_id: es.caseData.account_id,
                        icon_id: 1,
                        name: 'S_robot_' + es.caseData.account,
                        initial_team_index: 1
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        monitor(END, 'C2S_CreatePlayerBasicInfoRequest', '1');
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        cb();
                    }
                );
            }
        }

        return 1;
    }
    ,

    function () {
        setTimeout(function () {
            //es.close();
        }, es.responseOverTime);
    }
)
;
