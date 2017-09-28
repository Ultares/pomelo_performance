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
var http = require("http");
var querystring = require('querystring');

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
//        isMonitor: true, monitor response times,default is true.
//        sr: false // save response data.

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
            es.request(getEProtoId('C2S_XlAccountVerifyRequest_ID'), //32,
                Protobuf['Account']['C2S_XlAccountVerifyRequest'].encode({
                    request: {
                        account: es.caseData.account,
                        platform_id: 'xl',
                        global_server_id: "9", // '1' QA
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
                            name: es.caseData.account.substr(2, 10),
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
        es.caseData.previous = false;
        setTimeout(function () {
                es.request(getEProtoId('C2S_ActivityInfoRequest_ID'),
                    Protobuf['Activity']['C2S_ActivityInfoRequest'].encode({
                    }),
                    getEProtoId('S2C_ActivityInfoResponse_ID'),
                    function (message) {
                        data = Protobuf['Activity']['S2C_ActivityInfoResponse'].decode(message);
                        es.log('S2C_ActivityInfoResponse: ' + JSON.stringify(data));
                        es.caseData.previous = true;
                    }
                );
        }, es.randomIntTime());
    },

    // function () {
    //     if (!es.caseData.previous) {
    //         return 1;
    //     }
    //     es.caseData.previous = false;
    //     setTimeout(function () {
    //         monitorRequest({
    //             qName: "Item",
    //             q: "C2S_AddItem",
    //             rName: "Player",
    //             r: "S2C_UpdateResources",
    //             qOpts: {
    //                 item_id: 11003,  // 俱乐部经验
    //                 item_count: 66666
    //             },
    //             // isMonitor: false
    //         },function(){
    //             es.caseData.previous = true;
    //         });
    //     }, es.randomIntTime());
    // },
    //
    // function () {
    //     if (!es.caseData.previous) {
    //         return 1;
    //     }
    //     es.caseData.previous = false;
    //     setTimeout(function () {
    //         monitorRequest({
    //             qName: "Item",
    //             q: "C2S_AddItem",
    //             rName: "Player",
    //             r: "S2C_UpdateResources",
    //             qOpts: {
    //                 item_id: 11005,  // 体力
    //                 item_count: 9999
    //             },
    //             // isMonitor: false
    //         },function(){
    //             es.caseData.previous = true;
    //         });
    //     }, es.randomIntTime());
    // },
    //
    // function () {
    //     if (!es.caseData.previous) {
    //         return 1;
    //     }
    //     es.caseData.previous = false;
    //     setTimeout(function () {
    //         monitorRequest({
    //             qName: "Item",
    //             q: "C2S_AddItem",
    //             rName: "Player",
    //             r: "S2C_UpdateResources",
    //             qOpts: {
    //                 item_id: 11002,  // 钻石
    //                 item_count: 9999999
    //             },
    //             // isMonitor: false
    //         },function(){
    //             es.caseData.previous = true;
    //         });
    //     }, es.randomIntTime());
    // },

    function () {
        setTimeout(function () {
            console.log('Clear timer!')
        }, es.caseData.responseOverTime);
    }
);
