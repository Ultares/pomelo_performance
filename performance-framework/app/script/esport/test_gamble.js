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

es.connect(actor.server, function () {  //actor.server
    es.log(actor.actorId + ' :tcp-socket connect to esServer!');
    es.caseData.previous = true;
    es.run();
});

function monitorRequest(opts, cb) {
    var isMonitor = (opts.isMonitor == undefined) ? true : opts.isMonitor;
    var result = null;
    isMonitor && monitor(START, opts.r, '1');
    // console.log('opts.qOpts ' + JSON.stringify(opts.qOpts));
    es.request(getEProtoId(opts.q + "_ID"),
        Protobuf[opts.qName][opts.q].encode(opts.qOpts),
        getEProtoId(opts.r + "_ID"),
        function (message) {
            isMonitor && monitor(END, opts.r, '1');
            data = opts.rName ? Protobuf[opts.rName][opts.r].decode(message) :
                Protobuf[opts.qName][opts.r].decode(message);
            es.unregister(getEProtoId(opts.r + "_ID"));
            opts.sr && (es.caseData[opts.r] = data) && es.log(opts.r + ': ' + JSON.stringify(es.caseData[opts.r]));
            opts.sr || es.log(opts.r + ': ' + JSON.stringify(data));
            // error_code  res result
            if ('error_code' in data)
            {
                result = data['error_code'];
            }else if('res' in data)
            {
                result = data['res'];
            }else if('result' in data)
            {
                result = data['result'];
            }else {
                result = undefined;
            }
            if (result != undefined && result != 0 && result != null){
                es.log(es.caseData.account + ' [' + opts.q + '] got error code: [' + result + '] ' + JSON.stringify(data), 'error');
            }
            opts = undefined;
            cb();
        }
    );
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getEProtoId = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0] + '_MessageId';
    return Protobuf['MessageID'][mType][EProtoStr];
};

function read_excel(fn, index){
    var _index = index || 0;
    var obj = xlsx.parse(path.resolve('') + '\\' + fn);
    var info = {};
    var data = obj[_index].data;
    for (var j in data){
        // console.log(j + ' :' + JSON.stringify(data[j]));
        if (typeof data[j][0] == 'number'){
            info[data[j][0]] = data[j].slice(1,4);
            // console.log(j + ' :' + JSON.stringify(data[j]));
        }
    }
    // console.log(JSON.stringify(info));
    return info;
}

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
                        global_server_id: "2", // '1' QA  //2 andPre 9 GQQ
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
                console.log('robot.willTest is ', es.willTest.length)
            }
            es.funcArray = es.willTest;
        } else {
            es.funcArray =
                [
                    C2S_GetShopInfoRequest,
                    C2S_AddItem_11002,
                    C2S_RotateDishRequest,
                    // C2S_GambleRequest,
                    // EnterInstanceRequest

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

        function C2S_AddItem_11002(cb) {
            monitorRequest({
                qName: "Item",
                q: "C2S_AddItem",
                rName: "Player",
                r: "S2C_UpdateResources",
                qOpts: {
                    item_id: 11002,  // 11002  11003 俱乐部经验
                    item_count: 2000
                },
                // isMonitor: false
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

        function C2S_RotateDishRequest(cb) {
            // es.caseData.instance_id = 100101;
            monitorRequest({
                qName: "ExchangeCenter",
                q: "C2S_RotateDishRequest",
                r: "S2C_RotateDishResponse",
                qOpts: {
                    type: 2,
                    dial_id: 1
                }
            }, cb);
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
                    gamble_type: 1,
                    is_ten_times: false
                }),
                getEProtoId('S2C_GamebleResult_ID'),
                function (message) {
                    monitor(END, 'C2S_GambleRequest', '1');
                    data = Protobuf['Gamble']['S2C_GamebleResult'].decode(message);
                    es.log('Gamble data :' + JSON.stringify(data));
                    es.log('Gamble data :' + JSON.stringify(data.items));
                    data.items.forEach(function (e) {
                        es.log('e: ' + e.item_id);
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
        var fn = "M_Basic_property.xlsx";
        var info = read_excel(fn);
        es.log(JSON.stringify(info));
        var total = 0;
        var pos_count = {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        };
        var qos_count = {
            "S+": 0,
            "S": 0,
            "A": 0
        };
        var data = [];
        var file = path.resolve('') + '/result/' + es.caseData.account + '.xlsx';
        es.log('Filename: ' + file);
        es.log(JSON.stringify(es.caseData.gambles));
        for (var k  in es.caseData.gambles) {
            es.log(JSON.stringify('es.caseData.gambles:  ' + k));
            if (k in info){
                es.log(JSON.stringify('qos_count[info[k][1]]:  ' + qos_count[info[k][1]]));
                data.push([Number(k), es.caseData.gambles[k]]);
                pos_count[info[k][2]] += es.caseData.gambles[k];
                qos_count[info[k][1]] += es.caseData.gambles[k];
                total += es.caseData.gambles[k];
            }else{
                console.log('Could not found %s info...',k);
            }
        }
        console.log('pos_count :' + JSON.stringify(pos_count));
        for (var j  in pos_count) {
            data.push([Number(j), pos_count[j]]);
        }
        for (var q  in qos_count) {
            data.push([q, qos_count[q]]);
        }

        data.push(['total', total]);
        var buffer = xlsx.build([{name: es.caseData.account, data: data}]);
        fs.writeFile(file, buffer, 'binary', {flag: 'a+'});
        console.log('Clear timer!');
        // }, es.caseData.responseOverTime);
    }
);
