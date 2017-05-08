/**
 * Created by yong.liu on 2015/5/7.
 */

var async = require('async');
var Op = require('dena-client').op.Op;
var Ope = require('dena-client').op.Op;

var START = 'start';
var END = 'end';

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

var ROBOT_STATE = {
    GET_ROLEINFO_OK: 0,
    LOGIN_OPE_OK: 1,
    INIT_INFO_OK: 2,
    CHECKIN_OK: 3,
    COMBINE_HBSP_OK: 4,
    PLAYINFO_INIT_OK: 5
}

var op = new Op();
var ope = new Ope({host: '119.15.139.155', port: 3002});

var world = 1;
var query = 1;
var wuid = 408451812188533440; // actor.actorId

op.init({host: '119.15.139.137', port: 8604}, function () {
    op.run();
});

op.actions.push(
    function () {
        op.request('/checkin/test/wuid',
            {
                'wuid': 408451812188533440,
                'adminnum': 'denanba',
                'adminhash': 'yueruqianwan'
            },
            function (message) {
                if (message.code == 200) {
                    op.message = JSON.parse(message.body);

                    op.data_userbank_ii = {};
                    op.message['data']['userbank']['ii'].forEach(function (ins) {
                        op.data_userbank_ii[ins['i']] = ins['a'];
                    });

                    op.data_hbsp = {};
                    op.message['data']['hbsp'].map(function (ins) {
                        op.data_hbsp[ins['i']] = ins['a'];
                    });

                    op.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                } else {
                    console.log(message.code, message.body);
                }
            }
        );
    },
    function () {
        if (op.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
            return 1

        ope.request('/login',
            {
                'name': 'ceshi',
                'pass': 'ceshi'
            },
            function (message) {
                op.STATE = ROBOT_STATE.LOGIN_OPE_OK;
            }
        );
    },

    function () {
        if (op.STATE != ROBOT_STATE.LOGIN_OPE_OK)
            return 1

        async.series([
            function (callback) { // exp
                InitUserInfo(op.data_userbank_ii, 90001, 203472, '', callback);
            },
            function (callback) { // gold
                InitUserInfo(op.data_userbank_ii, 90003, 1000000000, '', callback);
            },
            function (callback) { // cash
                InitUserInfo(op.data_userbank_ii, 90004, 0, '', callback);
            },
            function (callback) { // strength
                InitUserInfo(op.data_userbank_ii, 90005, 10000, '', callback);
            },
            function (callback) { // costCash
                InitUserInfo(op.data_userbank_ii, 90008, 0, '', callback);
            },
            function (callback) { // skillStone
                InitUserInfo(op.data_userbank_ii, 90006, 1000000000, '', callback);
            },
            //function (callback) { // polishStone
            //    InitUserbank(50003, 0, callback);
            //},
            //function (callback) { // moppingUpCoupons
            //    InitUserbank(50007, 0, callback);
            //},
            //function (callback) { // vipLevel
            //    InitUserbank(1, 0, callback);
            //},
            //function (callback) { // rechargeAmount
            //    InitUserbank(2, 0, callback);
            //},
            function (callback) { // other
                var other = [40003, 58201, 58202, 58203, 59401, 59402, 59403, 30501];

                async.eachSeries(other, function (otherid, asyncCallback) {
                    InitUserInfo(op.data_userbank_ii, 0, 10000, otherid, asyncCallback);
                }, function (err) {
                    callback();
                });
            },
            function (callback) { // friendClip
                var other = [60002, 60003];

                async.eachSeries(other, function (otherid, asyncCallback) {
                    InitUserInfo(op.data_hbsp, 2, 410, otherid, asyncCallback);
                }, function (err) {
                    callback();
                });
            }
        ], function (err) {
            op.STATE = ROBOT_STATE.INIT_INFO_OK;
        });

        function InitUserInfo(itemMap, item, amount, other, asyncCallback) {
            var addAmount = (itemMap[item] && itemMap[item] < amount) ? amount : 0;
            if (addAmount > 0) {
                ope.request('/item',
                    {
                        world: world,
                        query: query,
                        wuid: wuid,
                        item: item,
                        other: other,
                        amount: addAmount
                    },
                    function (message) {
                        asyncCallback();
                    }
                )
            } else {
                asyncCallback();
            }
        }

        //function InitUserbank(item, amount, other, asyncCallback) {
        //    if (op.data_userbank_ii[item] && op.data_userbank_ii[item] < amount) {
        //        amount = amount - op.data_userbank_ii[item];
        //    }
        //
        //    if (amount > 0) {
        //        ope.request('/item',
        //            {
        //                world: world,
        //                query: query,
        //                wuid: wuid,
        //                item: item,
        //                other: other,
        //                amount: amount
        //            },
        //            function (message) {
        //                asyncCallback();
        //            }
        //        )
        //    } else {
        //        asyncCallback();
        //    }
        //}

        //function InitHbsp(item, amount, other, asyncCallback) {
        //    if (op.data_hbsp[item] && op.data_hbsp[item] < amount) {
        //        amount = amount - op.data_hbsp[item];
        //    }
        //
        //    if (amount > 0) {
        //        ope.request('/item',
        //            {
        //                world: world,
        //                query: query,
        //                wuid: wuid,
        //                item: item,
        //                other: other,
        //                amount: amount
        //            },
        //            function (message) {
        //                asyncCallback();
        //            }
        //        )
        //    } else {
        //        asyncCallback();
        //    }
        //}
    },

    function () {
        if (op.STATE != ROBOT_STATE.INIT_INFO_OK)
            return 1;

        op.request('/checkin/test/wuid',
            {
                'wuid': 408451812188533440,
                'adminnum': 'denanba',
                'adminhash': 'yueruqianwan'
            },
            function (message) {
                if (message.code == 200) {
                    op.message = JSON.parse(message.body);
                    op.uid = op.message['data']['tu'];

                    op.data_card = op.message['data']['card'];
                    op.data_card_id = op.data_card.map(function (ins) {
                        return ins['_id'];
                    });

                    op.STATE = ROBOT_STATE.CHECKIN_OK;
                    console.log(message.body)
                } else {
                    console.log(message.code, message.body);
                }
            }
        );
    },

    function () {
        if (op.STATE != ROBOT_STATE.CHECKIN_OK)
            return 1;

        async.eachSeries(op.message['data']['hbsp'], function (hbsp, callback) {
            var i = hbsp['i'] - 50000;
            var pos = op.data_card_id.indexOf(i);
            if (pos === -1) {
                op.request('/combine/hbsp',
                    {
                        'uid': op.uid,
                        'i': hbsp['i'] - 50000
                    },
                    function (message) {
                        if (message.code == 200) {
                            callback();
                        } else {
                            console.log(message.code, message.body);
                        }
                    }
                )
            } else {
                callback();
            }
        }, function (err) {
            op.STATE = ROBOT_STATE.COMBINE_HBSP_OK;
        });
    },

    function () {
        if (op.STATE != ROBOT_STATE.COMBINE_HBSP_OK)
            return 1;

        async.series([
            function (callback) {
                async.eachSeries(op.data_card, function (card, asyncCallback) {
                    if (card['lv'] < 90) {
                        op.request('/use/item',
                            {
                                'uid': op.uid,
                                'ucid': card['_id'],
                                'i': 40003,
                                'a': 50
                            },
                            function (message) {
                                if (message.code != 200)
                                    console.log(message.code, message.body);
                                asyncCallback();
                            }
                        );
                    } else {
                        asyncCallback();
                    }
                }, function (err) {
                    callback();
                });
            },
            function (callback) {
                async.eachSeries(op.data_card, function (card, asyncCallback) {
                    if (card['s'] < 2) {
                        op.request('/play/card_jinjie',
                            {
                                'uid': op.uid,
                                'ucid': card['_id']
                            },
                            function (message) {
                                if (message.code != 200)
                                    console.log(message.code, message.body);

                                asyncCallback();
                            }
                        );
                    } else {
                        asyncCallback();
                    }
                }, function (err) {
                    callback();
                });
            },
            function (callback) {
                async.eachSeries(op.data_card, function (card, asyncCallback) {
                    if (card['x'] < 2) {
                        op.request('/play/card_juexing',
                            {
                                'uid': op.uid,
                                'ucid': card['_id']
                            },
                            function (message) {
                                if (message.code != 200)
                                    console.log(message.code, message.body);
                                asyncCallback();
                            }
                        );
                    } else {
                        asyncCallback();
                    }
                }, function (err) {
                    callback();
                });
            }
        ], function (err) {
            op.STATE = ROBOT_STATE.PLAYINFO_INIT_OK;
        });
    },

    function () {
        if (op.STATE != ROBOT_STATE.PLAYINFO_INIT_OK)
            return 1;

        var cardlist = op.data_card_id.join('-');

        op.request('/claim/fight/op_pve_prison_guanka',
            {
                'uid': op.uid,
                'gkid': 10101,
                'cardlist': cardlist
            },
            function (message) {
                if (message.code != 200)
                    console.log(message.code, message.body);
                console.log(message.body);
            }
        );
    },

    function () {
        setTimeout(function () {
            console.log('end...');
        }, op.responseOverTime);
    }
)


//function (callback) {
//    op.request('/add/buddy/equip',
//        {
//            'uid': op.uid,
//            'ucid': 10002,
//            'p': 0,
//            'sid': 30501
//        },
//        function (message) {
//            if (message.code != 200)
//                console.log(message.code, message.body);
//            callback();
//        }
//    );
//},
//function (callback) {
//    op.request('/advance/buddy/equip',
//        {
//            'uid': op.uid,
//            'ucid': 10002,
//            'p': 0,
//            'sid': 30501
//        },
//        function (message) {
//            if (message.code != 200)
//                console.log(message.code, message.body);
//            callback();
//        }
//    );
//},
//function (callback) {
//    op.request('/play/card_skill_upgrade_level',
//        {
//            'uid': op.uid,
//            'ucid': 10002,
//            'a': 1
//        },
//        function (message) {
//            if (message.code != 200)
//                console.log(message.code, message.body);
//            callback();
//        }
//    );
//},