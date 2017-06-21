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
    var account = actor.actorId.split('|')[0];
    es.log('account : ' + account);
    return account;
    // return "game_001";
    //return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

getEProtoId = function (EProtoStr) {
    var mType = EProtoStr.split('_')[0] + '_MessageId';
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
    var isMonitor = opts.isMonitor || true;
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

preRegister();

es.actions.push(
    function () {
        es.caseData.previous = false;
        es.log('C2S_AccountVerifyRequest_ID');
        setTimeout(function () {
            es.caseData.account = genAccount();
            es.request(getEProtoId('C2S_AccountVerifyRequest_ID'),
                Protobuf['Account']['C2S_AccountVerifyRequest'].encode({
                    account: es.caseData.account,
                    platform_id: 'xingluo',
                    global_server_id: '7',
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
                        console.log('S2C_LoginResponse_ID: ' + JSON.stringify(data));
                        es.caseData.previous = true;
                    }
                );
            } else {
                es.request(getEProtoId('C2S_LoginRequest_ID'),
                    Protobuf['Player']['C2S_LoginRequest'].encode({
                        account: es.caseData.account,
                        player_id: es.caseData.account_datas[0]['player_id']
                    }),
                    getEProtoId('S2C_LoginResponse_ID'),
                    function (message) {
                        data = Protobuf['Player']['S2C_LoginResponse'].decode(message);
                        console.log('S2C_LoginResponse_ID: ' + JSON.stringify(data));
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
        es.caseData.previous = false;
        setTimeout(function () {
            monitorRequest({
                qName: "Item",
                q: "C2S_AddItem",
                rName: "Player",
                r: "S2C_UpdateResources",
                qOpts: {
                    item_id: 11002,  // 11002
                    item_count: 1000
                }
            }, console.log);
        }, es.randomIntTime());
    },


    // function () {
    //     if (!es.caseData.previous) {
    //         return 1;
    //     }
    //     if (es.caseData.loopCount <= 0) {
    //         es.log('es.caseData.loopCount:' + es.caseData.loopCount);
    //         return undefined;
    //     }
    //     es.caseData.previous = false;
    //     es.funcArray = [C2S_AddItem];
    //
    //     es.funcArray.forEach(function (element, index, array) {
    //         var func = function (cb) {
    //             setTimeout(element, es.randomIntTime(), cb);
    //         };
    //         es.funcseries.push(func)
    //     });
    //
    //     async.series(es.funcseries,
    //         function (err) {
    //             if (err) {
    //                 console.log('Error====>', err);
    //             } else {
    //                 es.caseData.previous = true;
    //                 es.caseData.loopCount -= 1;
    //             }
    //         }
    //     );
    //
    //     function C2S_AddItem(cb) {
    //         monitorRequest({
    //             qName: "Item",
    //             q: "C2S_AddItem",
    //             r: "S2C_UpdateItems",
    //             qOpts: {
    //                 item_id: 11005,  // 11002
    //                 item_count: 99999999
    //             }
    //         }, cb);
    //     }
    //
    //     return 1;

    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        setTimeout(function () {
            console.log('Clear timer!')
        }, es.caseData.responseOverTime);
    }
);
