/**
 * Created by yong.liu on 2015/5/7.
 */

var async = require('async');
var Client = require('dena-client').optest;


var START = 'start';
var END = 'end';
var wuid = "408458070018083700";


var ROBOT_STATE = {
    GET_ROLEINFO_OK: 0,
    LOGIN_OPE_OK: 1,
    INIT_INFO_OK: 2,
    CHECKIN_OK: 3,
    COMBINE_HBSP_OK: 4,
    PLAYINFO_INIT_OK: 5
};

var robot = new Client();


//登录服
robot.init({
        host: 'op-dev-137.mobage.cn',
        port: 8603,
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'accept-encoding': 'gzip'
        }
    },
    function () {
        robot.run();
    }
);


var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));//返回
    }
};


//op.wuid = actor.actorId;
robot.actions.push(
    function () {
        console.log("checkin==>\n");
        monitor(START, 'checkin', 'checkin');

        //目前wuid写死的。
        //robot.wuid = actor.actorId;
        setTimeout(function () {
            robot.httpRequest('checkin/test/wuid',
                {
                    wuid: '408458070018083700',
                    //wuid:this.wuid,
                    adminnum: 'denanba',
                    adminhash: 'yueruqianwan',
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'checkin', 'checkin');
                        console.log("checkin", staus, data);
                        robot.caseDate.uid = data['u'];  //存uid

                        op.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                    } else {
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }, robot.randomIntTime());
    },

    function () {
        if (!robot.caseData.previous) {
            return 1;
        }

        if (!!robot.caseData.previous) {
            robot.caseData.previous = false;
            robot.funcseries = [];

            //内容见接口文档
            if (robot.caseData.ratemode) {
                robot.funcmap = {
                    login: {funcArray: [new_message, reward_task_list, eventtype], rate: 100},
                    home: {
                        funcArray: [update_alliance, alliance_pvp, message_center, event_bar, chat_message],
                        rate: 50
                    },
                    logindate: {
                        funcArray: [user_niudan_list, dalao, real_time_pvp, announce_list, chat_message],
                        rate: 30
                    },
                    homedata: {funcArray: [event_list, superrookie, charge_gift, speaker_list, chat_message], rate: 15},
                    social: {funcArray: [reward_message_center, list_up, chat_message], rate: 15},
                    niudan: {
                        funcArray: [niudan_vip_list, via_pay0, niudan_exchange, via_pay1, cj_log, chat_message],
                        rate: 30
                    },
                    shop: {
                        funcArray: [itemList, vip_detail, days_list, days_item, daily_sign_gift, daily_activity],
                        rate: 50
                    },
                    item: {funcArray: [useitem, use_expitem, chat_message], rate: 75},
                    task: {funcArray: [achievement, claim_achievement, chat_message], rate: 75},
                    friend: {
                        funcArray: [friend_list, friend_encourage, friend_encourage_list, friend_applying, search_friend],
                        rate: 75
                    },
                    guild: {funcArray: [chat_message], rate: 175}, //预留的公会的，主要测试
                };
                robot.willTest = [];
                robot.endRate = 300;
                var i = 0;
                while (i <= 20) {
                    i++;
                    for (var k in robot.funcmap) {
                        if (robot.caseData.debug) {
                            console.log('rate is <%s> and k.rate is <%s>', rate, robot.funcmap[k].rate);
                        }
                        if (rate <= robot.funcmap[k].rate) {
                            robot.willTest = robot.willTest.concat(robot.funcmap[k].funcArray);
                        }
                    }
                }

                if (robot.caseData.debug) {
                    console.log('robot.willTest is', robot.willTest.length);
                }
                robot.funcArray = robot.willTest;
            } else {
                robot.funcArray =
                    [
                        new_message,
                        reward_task_list,
                        eventtype,
                        update_alliance,
                        alliance_pvp,
                        message_center,
                        event_bar,
                        user_niudan_list,
                        dalao,
                        real_time_pvp,
                        announce_list,
                        event_list,
                        superrookie,
                        charge_gift,
                        speaker_list,
                        chat_message,
                        reward_message_center,
                        list_up,
                        niudan_vip_list,
                        via_pay0,
                        niudan_exchange,
                        via_pay1,
                        cj_log,
                        itemList,
                        vip_detail,
                        days_list,
                        days_item,
                        daily_sign_gift,
                        daily_activity,
                        useitem,
                        use_expitem,
                        achievement,
                        claim_achievement,
                        friend_list,
                        friend_encourage,
                        friend_encourage_list,
                        friend_applying,
                        search_friend
                    ];
            }

            robot.funcArray.forEach(function (element, index, array) {
                var func = function (callback) {
                    setTimeout(element, robot.randomIntTime(), callback);
                };
                robot.funcseries.push(func)
            });

            async.series(robot.funcseries,
                function (err) {
                    if (err) {
                        console.log("Error====>", err);
                    } else {
                        robot.caseData.previous = true;
                    }
                }
            );
        }

        //测试这边要加的，根据游戏账号获取uid回包


        //new_message
        function new_message(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("new_message==>");
            monitor(START, 'new_message', 'new_message');
            robot.httpRequest('check/new_message',
                {
                    //"uid": 95101555,
                    "uid": robot.caseData.uid,
                    "ind": 0
                },
                function (staus, data) {
                    if (staus == 200) {
                        //console.log(staus,data);
                        monitor(END, 'new_message', 'new_message');
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //get/reward_task/list
        function reward_task_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("reward_task==>");
            monitor(START, 'reward_task', 'reward_task');
            robot.httpRequest('get/reward_task/list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'reward_task', 'reward_task');
                        console.log(staus, data);


                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //check/eventtype/openlist
        function eventtype(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("eventtype_openlist==>");
            monitor(START, 'eventtype', 'eventtype');
            robot.httpRequest('check/eventtype/openlist',
                {
                    //"uid":95101555,
                    "uid": robot.caseData.uid,
                    "type": 22
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'eventtype', 'eventtype');
                        console.log(staus, data);
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //alliance_gx1
        function update_alliance(callback) {

            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;

            console.log("alliance==>");
            monitor(START, 'update_alliance', 'update_alliance');
            robot.httpRequest('update/alliance/gx',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'update_alliance', 'update_alliance');
                        console.log(staus, data);

                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        //alliance_pvp/common/index  返回pvp是否报名
        function alliance_pvp(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("reward_task==>");
            monitor(START, 'alliance_pvp', 'alliance_pvp');
            robot.httpRequest('alliance_pvp/common/index',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'alliance_pvp', 'alliance_pvp');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback();
                    } else {

                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function message_center(callback) {

            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;

            console.log("message_center==>");
            monitor(START, 'message_center', 'message_center');
            robot.httpRequest('message_center/list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'message_center', 'message_center');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback()
                    } else {

                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //event_bar/index
        function event_bar(callback) {

            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;

            console.log("event_bar==>");
            monitor(START, 'event_bar', 'event_bar');
            robot.httpRequest('event_bar/index',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'event_bar', 'event_bar');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        //Slider场景
        function user_niudan_list(callback) {

            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;

            console.log("user_niudan_list==>");
            monitor(START, 'user_niudan_list', 'user_niudan_list');
            robot.httpRequest('get/user_niudan_list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'user_niudan_list', 'user_niudan_list');
                        console.log(staus, data);
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function dalao(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("dalao==>");
            monitor(START, 'dalao', 'dalao');
            robot.httpRequest('dalao/index',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'dalao', 'dalao');
                        console.log(staus, data);
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function real_time_pvp(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("real_time_pvp==>");
            monitor(START, 'real_time_pvp', 'real_time_pvp');
            robot.httpRequest('get/real_time_pvp/status',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'real_time_pvp', 'real_time_pvp');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function announce_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("announce_list==>");
            monitor(START, 'announce_list', 'announce_list');
            robot.httpRequest('get/announce_list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'announce_list', 'announce_list');
                        console.log(staus, data);

                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function event_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("event_list_removed==>");
            monitor(START, 'event_list', 'event_list');
            robot.httpRequest('get/event_list_to_be_removed',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'event_list', 'event_list');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback()
                    } else {
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function superrookie(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("superrookie==>");
            monitor(START, 'superrookie', 'superrookie');
            robot.httpRequest('superrookie/index',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'superrookie', 'superrookie');
                        console.log(staus, data);
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function charge_gift(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("superrookie==>");
            monitor(START, 'superrookie', 'superrookie');
            robot.httpRequest('superrookie/index',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "eid": 11858
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'superrookie', 'superrookie');
                        console.log(staus, data);
                        callback();
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        function speaker_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("speaker_list==>");
            monitor(START, 'speaker_list', 'speaker_list');
            robot.httpRequest('get/speaker_list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'speaker_list', 'speaker_list');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback()
                    } else {

                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //取公告
        function chat_message(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("chat_message/unread1==>");
            monitor(START, 'chat_message', 'chat_message');
            robot.httpRequest('get/chat_message/unread',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "wid": 0,
                    "aid": 0,
                    "rid": 0
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'chat_message', 'chat_message');
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        console.log(staus, data);
                        callback()
                    } else {

                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        function reward_message_center(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            monitor(START, 'reward_message_center', 'reward_message_center');
            console.log("reward_message_center==>");
            robot.httpRequest('claim/reward/message_center',
                {
                    //"uid":95101555,
                    "uid": robot.caseData.uid,
                    "mcid": "5f81a27d0eb3434446000008"
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'reward_message_center', 'reward_message_center');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        function list_up(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            monitor(START, 'list_up', 'list_up');
            console.log("list_up==>");
            robot.httpRequest('get/message_center/list_up',
                {
                    //"uid":95101555,
                    "uid": robot.caseData.uid,
                    "ind": "77061ccc4aa4ad75154ce8d7"
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'list_up', 'list_up');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback()
                    } else {
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //酒馆列表
        function niudan_vip_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("niudan_vip_list==>");
            monitor(START, 'niudan_vip_list', 'niudan_vip_list');
            robot.httpRequest('get/niudan_vip_list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'niudan_vip_list', 'niudan_vip_list');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //购买酒杯
        function via_pay0(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("via_pay0==>");
            monitor(START, 'via_pay0', 'via_pay0');
            robot.httpRequest('play/niudan/via_pay',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "iid": 1001
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'via_pay0', 'via_pay0');
                        console.log(staus, data);
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        callback()
                    } else {
                        console.log('no', statusCode, data);
                    }
                }
            );
        }


        //购买酒杯
        function niudan_exchange(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("niudan exchange==>");
            monitor(START, 'niudan_exchange', 'niudan_exchange');
            robot.httpRequest('play/niudan/exchange',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'niudan_exchange', 'niudan_exchange');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //酒馆付费其他接口
        function via_pay1(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("via_pay1==>");
            monitor(START, 'via_pay1', 'via_pay1');
            robot.httpRequest('get/niudan_vip_list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'niudan_vip_list', 'niudan_vip_list');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //查看记录
        function cj_log(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("cj_log==>");
            monitor(START, 'cj_log', 'cj_log');
            robot.httpRequest('play/niudan/cj_log',
                {
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'cj_log', 'cj_log');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //Funcmap- shop
        //itemList 需要写1个数组
        function itemList(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("itemList==>");
            monitor(START, 'itemList', 'itemList');
            robot.httpRequest('recharge/mobage/itemList',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'itemList', 'itemList');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //vip日志
        function vip_detail(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("vip detail==>");
            monitor(START, 'vip_detail', 'vip_detail');
            robot.httpRequest('get/vip/detail',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'vip_detail', 'vip_detail');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        //登录礼包列表
        function days_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("7days_list==>");
            monitor(START, 'days_list', 'days_list');
            robot.httpRequest('get/7days_reward/list',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'days_list', 'days_list');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //7days_reward/item  登陆礼包领取
        function days_item(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("days_item==>");
            monitor(START, 'days_item', 'days_item');
            robot.httpRequest('claim/7days_reward/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'days_item', 'days_item');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //签到
        function daily_sign_gift(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("daily_sign_gift==>");
            monitor(START, 'daily_sign_gift', 'daily_sign_gift');
            robot.httpRequest('get/event/daily_sign_gift',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'daily_sign_gift', 'daily_sign_gift');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //活跃度
        function daily_activity(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("daily_sign_gift==>");
            monitor(START, 'daily_activity', 'daily_activity');
            robot.httpRequest('get/daily_activity',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'daily_activity', 'daily_activity');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //背包内使用道具
        function useitem(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("use item==>");
            monitor(START, 'useitem', 'useitem');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "i": 40009,
                    "a": 1
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'useitem', 'useitem');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function use_expitem(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("use_expitem==>");
            monitor(START, 'use_expitem', 'use_expitem');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "ucid": 10177,    //需要有这个英雄
                    "i": 40003,
                    "a": 1
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'use_expitem', 'use_expitem');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function achievement(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("use_expitem==>");
            monitor(START, 'use_expitem', 'use_expitem');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'use_expitem', 'use_expitem');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        //lid是任务列表的第一个，可以做异常测试。
        function claim_achievement(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("use_expitem==>");
            monitor(START, 'use_expitem', 'use_expitem');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "lid": 1
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'use_expitem', 'use_expitem');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function friend_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("friend_list==>");
            monitor(START, 'friend_list', 'friend_list');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'friend_list', 'friend_list');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }


        function friend_encourage(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("friend_encourage==>");
            monitor(START, 'friend_encourage', 'friend_encourage');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'friend_encourage', 'friend_encourage');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function friend_encourage_list(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("use_friend_encourage_list==>");
            monitor(START, 'use_friend_encourage_list', 'friend_encourage_list');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'use_friend_encourage_list', 'use_friend_encourage_list');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function friend_applying(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("friend_applying==>");
            monitor(START, 'friend_applying', 'friend_applying');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "twuid": 408457971232165500
                    //这里回头引用一组数据
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'friend_applying', 'friend_applying');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }

        function search_friend(callback) {
            if (robot.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
                return 1;
            console.log("search_friend==>");
            monitor(START, 'search_friend', 'search_friend');
            robot.httpRequest('use/item',
                {
                    //"uid":95101555
                    "uid": robot.caseData.uid,
                    "tname":"输入好友信息"
                    //这里回头引用一组数据
                },
                function (staus, data) {
                    if (staus == 200) {
                        monitor(END, 'search_friend', 'search_friend');
                        console.log(staus, data);
                        callback()
                    } else {
                        robot.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
                        //console.log('no',statusCode,data);
                    }
                }
            );
        }
        return 1;
    },

    function () {
        setTimeout(function () {
            console.log('end...');
        }, robot.responseOverTime);
    }
)

