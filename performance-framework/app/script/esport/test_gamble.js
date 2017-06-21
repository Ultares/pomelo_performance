/**
 * Created by pc on 2017/1/9.
 */
var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var fs = require('fs');
var xlsx = require('node-xlsx');
var EsportClient = require('dena-client').esport;
var Esport = EsportClient.Esport;
var Protobuf = EsportClient.Protobuf;
var path = require('path');

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
    es.log('account : ' + account);
    // return 'qatest02';
    return account;
    // return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
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
//
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

function getPos(cardNo) {
    var pos = {};
    pos['2'] = [1003, 1008, 1012, 1019, 1034, 1041, 1042, 1043, 1044, 1045, 1051, 1053,
        1057, 1066, 1068, 1077, 1079, 1082, 1084, 1089, 1090, 1093, 1100, 1101];
    // [1107,
    // 1111, 1114, 1115, 1116, 1120, 1125, 1128, 1129, 1138, 1145, 1154, 1158, 1163,
    // 1170, 1174, 1178, 1183, 1187, 1188, 1192];
    pos['3'] = [1002, 1010, 1011, 1021, 1035, 1037, 1046, 1047, 1048, 1056, 1070, 1078,
        1085, 1092, 1099];
    // [1105, 1112, 1123, 1130, 1137, 1143, 1155, 1159, 1164, 1168,
    //     1175, 1184, 1189, 1193];
    pos['4'] = [1004, 1006, 1009, 1014, 1015, 1022, 1024, 1029, 1031, 1033, 1036, 1049,
        1050, 1055, 1058, 1060, 1064, 1069, 1073, 1083, 1088, 1094, 1098];
    // [1102, 1106,
    // 1108, 1118, 1122, 1132, 1133, 1134, 1139, 1141, 1149, 1152, 1160, 1165, 1171,
    // 1176, 1185, 1194]
    pos['5'] = [1005, 1016, 1018, 1023, 1025, 1026, 1030, 1040, 1054, 1061, 1065, 1067,
        1071, 1074, 1076, 1081, 1087, 1091, 1095, 1097];
    // [ 1103, 1109, 1113, 1121, 1131,
    // 1136, 1140, 1142, 1144, 1147, 1151, 1156, 1161, 1166, 1172, 1177, 1179, 1180,
    // 1186, 1190, 5005, 5010];
    for (var k in pos) {
        // console.log('k-->:' + k);
        if (pos[k].indexOf(Number(cardNo)) != -1) {
            return k;
        }
    }
    return '1';
}


es.actions.push(
    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        es.log('C2S_AccountVerifyRequest_ID');
        setTimeout(function () {
            es.caseData.account = genAccount();
            // es.log('es.caseData.account', es.caseData.account);
            es.request(getEProtoId('C2S_AccountVerifyRequest_ID'),
                Protobuf['Account']['C2S_AccountVerifyRequest'].encode({
                    account: es.caseData.account,
                    platform_id: 'xingluo',
                    global_server_id: '1',
                    game_id: '1',
                    platform_session: 'zzzzzzzz'
                }),
                getEProtoId('S2C_AccountVerifyResponse_ID'),
                function (message) {
                    data = Protobuf['Account']['S2C_AccountVerifyResponse'].decode(message);
                    console.log('data.length: ' + JSON.stringify(data));
                    if (data.account_info) {
                        es.caseData.account_id = data.account_info.account_id;
                        es.caseData.account_datas = data.account_info['account_datas'];
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
        es.log('C2S_CreatePlayerBasicInfoRequest_ID');
        setTimeout(function () {
            if (!es.caseData.account_datas.length) {
                es.request(getEProtoId('C2S_CreatePlayerBasicInfoRequest_ID'),
                    Protobuf['PlayerBasic']['C2S_CreatePlayerBasicInfoRequest'].encode({
                        account_id: es.caseData.account,
                        icon_id: 1,
                        name: es.caseData.account.substr(0, 8),
                        initial_team_index: 1
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        es.caseData.previous = true;
                    }
                );
            } else {
                // es.log("es.caseData.account_datas[0]['player_id']: " + es.caseData.account_datas[0]['player_id']);
                es.request(getEProtoId('C2S_LoginRequest_ID'),
                    Protobuf['Player']['C2S_LoginRequest'].encode({
                        account: es.caseData.account,
                        player_id: es.caseData.account_datas[0]['player_id']

                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
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
        //
        if (es.caseData.loopCount <= 0) {
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
                    C2S_GetShopInfoRequest,
                    C2S_BuyShopItemRequest,
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
                    es.caseData.loopCount -= 1;
                    // es.close();
                }
            }
        );


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

        function C2S_GetShopInfoRequest(cb) {
            monitor(START, 'C2S_GetShopInfoRequest', '1');
            es.request(getEProtoId('C2S_GetShopInfoRequest_ID'),
                Protobuf['Shop']['C2S_GetShopInfoRequest'].encode({
                    type: 0
                }),
                getEProtoId('S2C_GetShopInfoResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GetShopInfoRequest', '1');
                    data = Protobuf['Shop']['S2C_GetShopInfoResponse'].decode(message);
                    es.unregister(getEProtoId('S2C_GetShopInfoResponse_ID'));
                    cb();
                })
        }

        function C2S_BuyShopItemRequest(cb) {
            monitor(START, 'C2S_BuyShopItemRequest', '1');
            es.request(getEProtoId('C2S_BuyShopItemRequest_ID'),
                Protobuf['Shop']['C2S_BuyShopItemRequest'].encode({
                    shop_type: 200,
                    count: 1000,
                    posi: 5
                }),
                getEProtoId('S2C_BuyShopItemResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_BuyShopItemRequest', '1');
                    data = Protobuf['Shop']['S2C_BuyShopItemResponse'].decode(message);
                    es.unregister(getEProtoId('S2C_BuyShopItemResponse_ID'));
                    cb();
                })
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
                    // es.log('Gamble data :' + JSON.stringify(data));
                    // es.log('Gamble data :' + JSON.stringify(data.items));
                    data.items.forEach(function (e) {
                        // es.log('e: ' + e.item_id);
                        var k = e.item_id;
                        es.caseData.gambles[k] = (k in es.caseData.gambles) ? (es.caseData.gambles[k] + 1) : 1;
                    });
                    es.unregister(getEProtoId('S2C_GamebleResult_ID'));
                    cb();
                })
        }

        return 1;
    },

    function () {
        var total = 0;
        var pos_count = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        };
        var data = [];
        var file = path.resolve('') + '/result/' + es.caseData.account + '_20.xlsx';
        es.log('Filename: ' + file);
        es.log(JSON.stringify(es.caseData.gambles));

        for (var k  in es.caseData.gambles) {
            var _k = getPos(k);
            data.push([Number(k), es.caseData.gambles[k]]);
            pos_count[_k] += es.caseData.gambles[k];
            total += es.caseData.gambles[k];
        }
        console.log('pos_count :' + JSON.stringify(pos_count));
        for (var j  in pos_count) {
            data.push([Number(j), pos_count[j]]);
        }
        data.push(['total', total]);
        var buffer = xlsx.build([{name: es.caseData.account, data: data}]);
        fs.writeFile(file, buffer, 'binary', {flag: 'a+'});
        console.log('Clear timer!');
        // }, es.caseData.responseOverTime);
    }
);
