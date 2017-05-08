/**
 * Created by yong.liu on 2015/6/15.
 */

var async = require('async');
var Op = require('dena-client').op.Op;
var Ope = require('dena-client').op.Ope;

var op = new Op();
var ope = new Ope({host: '119.15.139.155', port: 3002});

var world = 7;
var query = 1;
var wuid = 7440300996004; //5370124411122; // actor.actorId

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    GET_ROLEINFO_OK: 1,
    LOGIN_OPE_OK: 2,
    INIT_INFO_OK: 3,
    CHECKIN_OK: 4
};

op.init({host: '119.15.139.137', port: 8604}, function () {
    op.run();
});

op.actions.push(
    function () {
        op.request('/checkin/test/wuid',
            {
                'wuid': wuid,
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

                    op.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                } else {
                    console.log(message.code, message.body);
                }
            }
        );
    },

    function () {
        if (op.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
            return 1;

        ope.request('/login',
            {
                'name': 'ceshi',
                'pass': 'ceshi11'
            },
            function (message) {
                op.STATE = ROBOT_STATE.LOGIN_OPE_OK;
            }
        );
    },

    function () {
        if (op.STATE != ROBOT_STATE.LOGIN_OPE_OK)
            return 1;

        async.series(
            [
                addrolechips,
                cardcopy

            ], function (err) {
                op.STATE = ROBOT_STATE.INIT_INFO_OK;
            });


        function qiwuhaiIndex(callback){

            ope.request('/qiwuhai/index',
                {
                    uid : wuid
                },
                function (message) {
                    ope.request('/qiwuhai/register',
                        {
                            uid : wuid,
                            teamList: "10160_10160_10160"
                        },
                        function (message) {});
                }
            )


        }



        function cardcopy(callback) {
            var wuids = [
                408453732058219840,
                408453753533056830,
                408453762122991700,
                408453766417959230,
                408453775007893950,
                408453787892796100,
                408453796482730750,
                408453805072665500,
                408453813662600200,
                408453817957567600,
                408453826547502340,
                408453830842469700,
                408453835137437100,
                408453843727371840,
                408453852317306560,
                408453860907241300,
                408453869497176000,
                408453873792143400,
                408453882382078100,
                408453890972012800,
                408453903856914900,
                408453916741816900,
                408453929626718900,
                408453946806588300,
                408453959691490300,
                408453963986457660,
                408453976871359700,
                408453989756261700,
                408453998346196350,
                408454011231098400,
                408454019821033100,
                408454037000902400,
                408453736353187000,
                408453749238089340,
                408453757828024450,
                408453779302861400,
                408453839432404400,
                408453878087110850,
                408453921036784200,
                408453933921686200,
                408453955396523000,
                408453972576392400,
                408453985461294400,
                408454006936131100,
                408454028410967740,
                408454045590837200,
                408454062770706500,
                408454071360641400,
                408454088540510800,
                408454114310314900,
                408454140080118900,
                408454165849923260,
                408454174439858100,
                408454187324760100,
                408454191619727550,
                408454183029792800,
                408454178734825400,
                408454170144890750,
                408454161554955650,
                408454152965020900,
                408454148670053570,
                408454135785151550,
                408454122900249540,
                408454110015347600,
                408454101425412860,
                408454084245543400,
                408453848022339200,
                408453856612273900,
                408453865202208640,
                408453886677045440,
                408453895266980100,
                408453899561947500,
                408453908151882200,
                408453912446849600,
                408453925331751550,
                408453938216653600,
                408453942511620900,
                408453951101555700,
                408453968281425000,
                408453981166327040,
                408453994051229060,
                408454002641163700,
                408454015526065700,
                408454024116000400,
                408454032705935040,
                408454041295869700,
                408454049885804400,
                408454054180771840,
                408454058475739200,
                408454067065674000,
                408454075655608700,
                408454079950576100,
                408454092835478100,
                408454097130445500,
                408454105720380200,
                408454118605282200,
                408454127195216900,
                408454131490184260,
                408454144375086200,
                408454157259988200
            ];

            for (var towuid in wuids) {
                console.log('cards_copy for %s done!', wuids[towuid]);
                ope.request('/cards_copy',
                    {
                        world: world,
                        type: 1,
                        wuid1: wuid,
                        wuid2: wuids[towuid]
                    },
                    function (message) {
                        console.log('cards_copy for %s done!', message);
                    }
                )
            }
            callback();
        }

        function addrolechips(callback) { // cash
            op.roleChipIds = [
                60001,
                60002,
                60003,
                60004,
                60005,
                60006,
                60007,
                60010,
                60011,
                60013,
                60014,
                60017,
                60026,
                60027,
                60028,
                60029,
                60030,
                60041,
                60042,
                60043,
                60044,
                60046,
                60047,
                60048,
                60049,
                60071,
                60072,
                60073,
                60074,
                60075,
                60076,
                60077,
                60078,
                60079,
                60080,
                60081,
                60082,
                60083,
                60084,
                60086,
                60087,
                60088,
                60089,
                60090,
                60156,
                60157,
                60158,
                60159,
                60160,
                60161,
                60166,
                60167,
                60171,
                60172,
                60173,
                60174,
                60177,
                60211,
                60212,
                60213];
            for (var roleChipId in op.roleChipIds) {
                InitUserInfo(op.data_userbank_ii, op.roleChipIds[roleChipId], 9999999, '', function () {
                    console.log('Add <%s> done!', op.roleChipIds[roleChipId]);
                });
            }
            callback();
        }

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
    },

    //function () {
    //    if (op.STATE != ROBOT_STATE.INIT_INFO_OK)
    //        return 1;
    //
    //    op.request('/checkin/test/wuid',
    //        {
    //            'wuid': wuid,
    //            'adminnum': 'denanba',
    //            'adminhash': 'yueruqianwan'
    //        },
    //        function (message) {
    //            if (message.code == 200) {
    //                op.message = JSON.parse(message.body);
    //                op.uid = op.message['data']['tu'];
    //
    //                op.stat = {};
    //                op.stat.x = 0;
    //                op.stat.y = 0;
    //                op.stat.z = 0;
    //                op.STATE = ROBOT_STATE.CHECKIN_OK;
    //                console.log(message.body)
    //            } else {
    //                console.log(message.code, message.body);
    //            }
    //        }
    //    );
    //},

    //function () {
    //    if (op.STATE === ROBOT_STATE.CHECKIN_OK) {
    //        op.STATE = ROBOT_STATE.WAIT_ASYNC_OK;
    //
    //        if (op.stat.y == 1000) {
    //            op.stat.z = op.stat.x / op.stat.y;
    //            console.log('Drop chance: ', op.stat.z);
    //        } else {
    //            setTimeout(function () {
    //                op.request('/play/niudan/via_pay',
    //                    {
    //                        'uid': op.uid,
    //                        'iid': 1004
    //                    },
    //                    function (message) {
    //                        if (message.code != 200) {
    //                            console.log(message);
    //                            return 1;
    //                        }
    //
    //                        op.stat.y += 1;
    //                        var hbsp = JSON.parse(message.body)['hbsp'];
    //
    //                        hbsp.forEach(function (elem, index, arr) {
    //                            if (elem.i == 60001 && elem.a == 50) {
    //                                op.stat.x += 1;
    //                            }
    //
    //                            if (elem.i == 60001) {
    //                                console.log(typeof elem.i, typeof elem.a, elem.i, elem.a)
    //                            }
    //                        });
    //
    //                        op.STATE = ROBOT_STATE.CHECKIN_OK;
    //                        console.log(op.stat.x, op.stat.y);
    //                    }
    //                )
    //            }, 1000);
    //        }
    //    }
    //
    //    return 1;
    //},

    function () {
        setTimeout(function () {
            console.log('end...');
        }, op.responseOverTime);
    }
);