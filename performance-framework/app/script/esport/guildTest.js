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
var fs = require('fs');
var xlsx = require('node-xlsx');
var path = require('path');

var START = 'start';
var END = 'end';

var es = new Esport();

// var actor = {};

// actor.actorId = 'renew_0110';
// actor.debug = true;
// actor.server = {
//    host: '192.168.3.33',
//    port: 10001
// };

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
    return actor.actorId.split('|')[0];
    // return "game_001";
    //return uuid.v4().toUpperCase().split('-').join('').slice(0, 20);
};

var createOrAdd = function () {
    console.log('Result :%s', Number(actor.actorId.split('_')[1]) / 50);
    return Number(actor.actorId.split('_')[1]) / 50
};

// createOrAdd();


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
            if ('error_code' in data) {
                result = data['error_code'];
            } else if ('res' in data) {
                result = data['res'];
            } else if ('result' in data) {
                result = data['result'];
            } else {
                result = undefined;
            }
            if (result != undefined && result != 0 && result != null) {
                es.log(es.caseData.account + ' [' + opts.q + '] got error code: [' + result + '] ' + JSON.stringify(data), 'error');
            }
            opts = undefined;
            cb();
        }
    );
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
            es.request(getEProtoId('C2S_XlAccountVerifyRequest_ID'), //32,
                Protobuf['Account']['C2S_XlAccountVerifyRequest'].encode({
                    request: {
                        account: es.caseData.account,
                        platform_id: 'xl',
                        global_server_id: "9", // '1' QA  9 Dev
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
            monitorRequest({
                qName: "Item",
                q: "C2S_AddItem",
                rName: "Player",
                r: "S2C_UpdateResources",
                qOpts: {
                    item_id: 11003,  // 俱乐部经验
                    item_count: 180000
                },
                isMonitor: false
            }, function () {
                es.caseData.previous = true;
            });
        }, es.randomIntTime());
    },
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
    //             isMonitor: false
    //         }, function () {
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
    //                 item_count: 99999
    //             },
    //             isMonitor: false
    //         }, function () {
    //             es.caseData.previous = true;
    //         });
    //     }, es.randomIntTime());
    // },

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
            es.funcmap = {};
            es.willTest = [];
            es.endRate = 20;
            var i = 0;
            while (i <= 10) {
                for (var k in es.funcmap) {
                    var rate = getRandomInt(1, es.endRate);
                    es.log('rate is ' + rate + ' and k.rate is ' + es.funcmap[k].rate);
                    if (rate <= es.funcmap[k].rate) {
                        es.willTest = es.willTest.concat(es.funcmap[k].funcArray);
                    }
                }
                if (es.willTest.length) {
                    es.log('Random ' + i + ' time(s)');
                    break;
                }
                i++;
            }
            es.log('robot.willTest is ' + es.willTest.length);
            es.funcArray = es.willTest;
        } else {
            es.funcArray =
                [

                    C2S_EchoGameS,
                    // C2S_GuildInfoRequest,         // 公会信息
                    // C2S_GuildCreateRequest,       // 创建公会
                    // C2S_GuildEditRequest,         // 修改公会信息
                    // C2S_GuildModifyRequest,       // 操作公会成员
                    // C2S_GuildListRequest,         // 获取公会列表
                    // C2S_GuildSearchRequest,       // 搜索公会
                    // C2S_GuildRecruitListRequest,  // 招新列表
                    // C2S_GuildRecruitRequest,      // 邀请玩家入会
                    // C2S_GuildApplyRequest,        // 申请进入公会
                    // C2S_GuildApplyEditRequest,    // 操作入会申请
                    // C2S_GuildQuitRequest,         // 退出公会
                    // C2S_GuildSendGiftRequest,     // 发红包
                    C2S_GuildGiftInfoRequest,     // 获取红包信息
                    C2S_GuildReceiveGiftRequest   // 收红包


                ];
        }
        es.funcArray.forEach(function (element, index, array) {
            var _waitingTime = es.randomIntTime();
            var func = function (cb) {
                setTimeout(element, _waitingTime, cb);
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

        // function AccountVerifyRequest(cb) {
        //     es.caseData.account = genAccount();
        //     monitorRequest({
        //         qName: "Account",
        //         q: "C2S_AccountVerifyRequest",
        //         r: "S2C_AccountVerifyResponse",
        //         qOpts: {
        //             account: es.caseData.account,
        //             platform_id: 'xingluo',
        //             global_server_id: 1,
        //             game_id: '1',
        //             platform_session: 'zzzzzzzz'
        //         },
        //         sr: true
        //     }, cb);
        // }
        //
        // function CreatePlayerBasicInfoRequest(cb) {
        //     es.caseData.accounts = es.caseData.S2C_AccountVerifyResponse.account_info ?
        //         es.caseData.S2C_AccountVerifyResponse.account_info.account_datas : [];
        //     if (!es.caseData.accounts.length) {
        //         monitorRequest({
        //             qName: "PlayerBasic",
        //             q: "C2S_CreatePlayerBasicInfoRequest",
        //             rName: "Player",
        //             r: "S2C_LoginResponse",
        //             qOpts: {
        //                 account_id: es.caseData.account,
        //                 icon_id: 1,
        //                 name: es.caseData.account.substr(0, 8),
        //                 initial_team_index: 1
        //             }
        //         }, cb);
        //     } else {
        //         monitorRequest({
        //             qName: "Player",
        //             q: "C2S_LoginRequest",
        //             r: "S2C_LoginResponse",
        //             qOpts: {
        //                 account: es.caseData.account,
        //                 player_id: es.caseData.accounts[0]['player_id']
        //             },
        //             sr: true
        //         }, cb);
        //     }
        // }

        function C2S_GuildInfoRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildInfoRequest",
                r: "S2C_GuildInfoResponse",
                qOpts: {}
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

        function C2S_GuildListRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildListRequest",
                r: "S2C_GuildListResponse",
                qOpts: {
                    start_index: 0
                }
            }, cb);
        }

        function C2S_GuildSearchRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildSearchRequest",
                r: "S2C_GuildSearchResponse",
                qOpts: {
                    guild_name: ''
                }
            }, cb);
        }

        function C2S_GuildRecruitRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildRecruitRequest",
                r: "S2C_GuildRecruitResponse",
                qOpts: {
                    player_uid: ''
                }
            }, cb);
        }

        function C2S_GuildCreateRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildCreateRequest",
                r: "S2C_GuildCreateResponse",
                qOpts: {
                    guild_name: '',
                    icon: 3
                }
            }, cb);
        }

        function C2S_GuildApplyRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildApplyRequest",
                r: "S2C_GuildApplyResponse",
                qOpts: {
                    guild_uid: {"low":-327548927,"high":612842,"unsigned":true},
                    is_cancel: false
                }
            }, cb);
        }

        function C2S_GuildApplyEditRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildApplyEditRequest",
                r: "S2C_GuildApplyEditResponse",
                qOpts: {
                    remove_all: '',
                    is_reject: false,
                    player_uid: ''
                }
            }, cb);
        }

        function C2S_GuildQuitRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildQuitRequest",
                r: "S2C_GuildQuitResponse",
                qOpts: {}
            }, cb);
        }

        function C2S_GuildGiftInfoRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildGiftInfoRequest",
                r: "S2C_GuildGiftInfoResponse",
                sr: true,
                qOpts: {}
            }, cb);
        }

        function C2S_GuildSendGiftRequest(cb) {

            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildSendGiftRequest",
                r: "S2C_GuildSendGiftResponse",
                qOpts: {
                    gift_id: 1
                }
            }, cb);
        }

        function C2S_GuildReceiveGiftRequest(cb) {
            var gifts = es.caseData.S2C_GuildGiftInfoResponse.gifts.length;
            es.caseData.gift_uid = es.caseData.S2C_GuildGiftInfoResponse.gifts[gifts-1].uid;
            monitor(START, 'C2S_GuildReceiveGiftRequest', '1');
            es.request(getEProtoId('C2S_GuildReceiveGiftRequest_ID'),
                Protobuf['Guild']['C2S_GuildReceiveGiftRequest'].encode({
                    gift_uid: es.caseData.gift_uid
                }),
                getEProtoId('S2C_GuildReceiveGiftResponse_ID'),
                function (message) {
                    monitor(END, 'C2S_GuildReceiveGiftRequest', '1');
                    data = Protobuf['Guild']['S2C_GuildReceiveGiftResponse'].decode(message);
                    es.log('S2C_GuildReceiveGiftResponse: ' + JSON.stringify(data));
                    // {"error_code":0,"item":{"uid":{"low":-233963519,"high":88553,"unsigned":true},"item_id":31017,"count":3,"get_time":null}}
                    var k = data.item.item_id;
                    var v = data.item.count;
                    es.caseData.gifts[k] = (k in es.caseData.gifts) ? (es.caseData.gifts[k] + v) : v;
                    es.unregister(getEProtoId('S2C_GuildReceiveGiftResponse_ID'));
                    // console.log('es.caseData.loopCount: ' + es.caseData.loopCount);
                    // console.log('es.caseData.gifts: ' + JSON.stringify(es.caseData.gifts));
                    cb();
                })
        }

        // function C2S_GuildReceiveGiftRequest(cb) {
        //     // es.log('gift_uid:' + JSON.stringify(es.caseData.S2C_GuildGiftInfoResponse.gifts));
        //     var gifts = es.caseData.S2C_GuildGiftInfoResponse.gifts.length;
        //     es.caseData.gift_uid = es.caseData.S2C_GuildGiftInfoResponse.gifts[gifts-1].uid;
        //     // es.log('gift_uid:' + es.caseData.S2C_GuildGiftInfoResponse.gifts[gifts-1].uid);
        //     monitorRequest({
        //         qName: "Guild",
        //         q: "C2S_GuildReceiveGiftRequest",
        //         r: "S2C_GuildReceiveGiftResponse",
        //         sr: true,
        //         qOpts: {
        //             gift_uid: es.caseData.gift_uid
        //         }
        //     }, cb);
        // }

        function C2S_GuildRecruitListRequest(cb) {
            monitorRequest({
                qName: "Guild",
                q: "C2S_GuildRecruitListRequest",
                r: "S2C_GuildRecruitListResponse",
                qOpts: {}
            }, cb);
        }

        return 1;
    },

    function () {

        var total = 0;
        var data = [];
        var file = path.resolve('') + '/result/' + es.caseData.account + '.xlsx';
        console.log('es.caseData.account: [%s] [%s]',es.caseData.account,JSON.stringify(es.caseData.gifts));
        for (var k  in es.caseData.gifts) {
            // es.log(JSON.stringify('es.caseData.gifts:  ' + k));
                data.push([Number(k), es.caseData.gifts[k]]);
                total += es.caseData.gifts[k];
        }
        data.push(['total', total]);
        var buffer = xlsx.build([{name: es.caseData.account, data: data}]);
        fs.writeFile(file, buffer, 'binary', {flag: 'a+'});
        console.log('Clear timer!');
        // }, es.caseData.responseOverTime);
    }
);
