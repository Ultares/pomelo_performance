var Client = require('dena-client').ft;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

robot.init({host: 'press.ft.mobage.cn', port: 9001}, function () {
    robot.run();
});

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

robot.actions.push(
    function () {
        robot.caseData.platform_user_id = actor.actorId;
        //console.log('robot.caseData.platform_user_id====><%s>', robot.caseData.platform_user_id);
        setTimeout(function () {
            robot.httpRequest('fake_platform_auth',
                {
                    "platform_user_id": robot.caseData.platform_user_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.sid = data['result']['sid'];
                        robot.caseData.world_id = 1;
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            )
        }, robot.randomIntTime());
    },

    function () {

        if (!robot.caseData.previous) {
            return 1;
        }

        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest('login',
                {
                    sid: robot.caseData.sid,
                    world_id: robot.caseData.world_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.mission_id = '5040';
                        robot.caseData.battle_mode = '1';
                        robot.caseData.user_id = data['result']['user_id'];
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }, robot.randomIntTime());
    },

    function () {

        if (!robot.caseData.previous) {
            return 1;
        }

        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest('get_user_info',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.user_card_ids = [];
                        data['result']['user_cards'].forEach(function (element, index, array) {
                            robot.caseData.user_card_ids.push(element['_id']);
                        });
                        //console.log('data===========>', robot.caseData.sid, robot.caseData.user_card_ids);
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }, robot.randomIntTime());
    },

    function () {

        if (!robot.caseData.previous) {
            return 1;
        }

        robot.caseData.previous = false;

        setTimeout(function () {
            robot.httpRequest('start_mission',
                {
                    mission_id: robot.caseData.mission_id,
                    sid_id: robot.caseData.sid,
                    user_card_ids: JSON.stringify(robot.caseData.user_card_ids),
                    user_id: robot.caseData.user_id,
                    battle_mode: robot.caseData.battle_mode
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.monster_drops = data['result']['monster_drops'];
                        //console.log('start_mission=======%s',JSON.stringify(robot.caseData.monster_drops));
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }, robot.randomIntTime());

    },

    function () {

        if (!robot.caseData.previous) {
            return 1;
        }

        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest('finish_mission',
                {
                    mission_id: robot.caseData.mission_id,
                    sid_id: robot.caseData.sid,
                    user_card_ids: JSON.stringify(robot.caseData.user_card_ids),
                    user_id: robot.caseData.user_id,
                    finished_missions: robot.caseData.mission_id,
                    monster_drops: JSON.stringify(robot.caseData.monster_drops),
                    battle_mode: robot.caseData.battle_mode

                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }, robot.randomIntTime());
    },


    function () {

        if (!!robot.caseData.previous) {

            robot.caseData.previous = false;
            robot.funcseries = [];

            robot.funcArray =
                [
                    get_friends,
                    get_marquee,
                    get_world_list,
                    get_common_task_list,
                    get_pvp_ranking_event_info,
                    get_daily_task_list,
                    get_user_event_count,
                    get_gacha,
                    get_area_user_missions,
                    get_devil_info,
                    get_pvp_user_ranking,
                    get_random_nickname,
                    get_store_info,
                    pvp_find_opponents,
                    pvp_top_ranking,
                    start_mission,
                    finish_mission
                ];

            robot.funcArray.forEach(function (element, index, array) {
                var func = function (callback) {
                    setTimeout(element, robot.randomIntTime(), callback);
                };
                robot.funcseries.push(func)
            });

            async.series(robot.funcseries,
                function (err) {
                    if (err) {
                        console.log('Error====>', err);
                    } else {
                        robot.caseData.previous = true;
                    }
                }
            );
        }

        function get_friends(callback) {

            monitor(START, 'get_friends', 'get_friends');
            robot.httpRequest('get_friends',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        console.log('get_friends end at <%s>' ,Date.now());
                        monitor(END, 'get_friends', 'get_friends');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_marquee(callback) {

            monitor(START, 'get_marquee', 'get_marquee');
            robot.httpRequest('get_marquee',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        console.log('get_marquee end at <%s>' ,Date.now());
                        monitor(END, 'get_marquee', 'get_marquee');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_world_list(callback) {

            monitor(START, 'get_world_list', 'get_world_list');
            robot.httpRequest('get_world_list',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    platform_type: 1,
                    platform_user_id: robot.caseData.platform_type
                },
                function (status, data) {
                    if (status == 200) {
                        console.log('get_world_list end at <%s>' ,Date.now());
                        monitor(END, 'get_world_list', 'get_world_list');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_common_task_list(callback) {

            monitor(START, 'get_common_task_list', 'get_common_task_list');
            robot.httpRequest('get_common_task_list',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        console.log('get_common_task_list end at <%s>' ,Date.now());
                        monitor(END, 'get_common_task_list', 'get_common_task_list');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_pvp_ranking_event_info(callback) {

            monitor(START, 'get_pvp_ranking_event_info', 'get_pvp_ranking_event_info');
            robot.httpRequest('get_pvp_ranking_event_info',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    event_id: 1
                },
                function (status, data) {
                    if (status == 200) {
                        console.log('get_pvp_ranking_event_info end at <%s>' ,Date.now());
                        monitor(END, 'get_pvp_ranking_event_info', 'get_pvp_ranking_event_info');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_daily_task_list(callback) {
            monitor(START, 'get_daily_task_list', 'get_daily_task_list');
            robot.httpRequest('get_daily_task_list',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_daily_task_list', 'get_daily_task_list');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_user_event_count(callback) {

            monitor(START, 'get_user_event_count', 'get_user_event_count');
            robot.httpRequest('get_user_event_count',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_user_event_count', 'get_user_event_count');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_gacha(callback) {
            monitor(START, 'get_gacha', 'get_gacha');
            robot.httpRequest('get_gacha',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_gacha', 'get_gacha');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_area_user_missions(callback) {
            monitor(START, 'get_area_user_missions', 'get_area_user_missions');
            robot.httpRequest('get_area_user_missions',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_area_user_missions', 'get_area_user_missions');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_devil_info(callback) {
            monitor(START, 'get_devil_info', 'get_devil_info');
            robot.httpRequest('get_devil_info',
                {
                    sid: robot.caseData.sid,
                    world_id: robot.caseData.world_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_devil_info', 'get_devil_info');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_pvp_user_ranking(callback) {

            monitor(START, 'get_pvp_user_ranking', 'get_pvp_user_ranking');
            robot.httpRequest('get_pvp_user_ranking',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_pvp_user_ranking', 'get_pvp_user_ranking');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_random_nickname(callback) {

            monitor(START, 'get_random_nickname', 'get_random_nickname');
            robot.httpRequest('get_random_nickname',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_random_nickname', 'get_random_nickname');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function get_store_info(callback) {
            monitor(START, 'get_store_info', 'get_store_info');
            robot.httpRequest('get_store_info',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'get_store_info', 'get_store_info');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvp_find_opponents(callback) {

            monitor(START, 'pvp_find_opponents', 'pvp_find_opponents');
            robot.httpRequest('pvp_find_opponents',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvp_find_opponents', 'pvp_find_opponents');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvp_top_ranking(callback) {

            monitor(START, 'pvp_top_ranking', 'pvp_top_ranking');
            robot.httpRequest('pvp_top_ranking',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvp_top_ranking', 'pvp_top_ranking');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function start_mission(callback) {

            monitor(START, 'start_mission', 'start_mission');
            robot.httpRequest('start_mission',
                {
                    mission_id: robot.caseData.mission_id,
                    sid_id: robot.caseData.sid,
                    user_card_ids: JSON.stringify(robot.caseData.user_card_ids),
                    user_id: robot.caseData.user_id,
                    battle_mode: robot.caseData.battle_mode
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'start_mission', 'start_mission');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function finish_mission(callback) {

            monitor(START, 'finish_mission', 'finish_mission');
            robot.httpRequest('finish_mission',
                {
                    mission_id: robot.caseData.mission_id,
                    sid_id: robot.caseData.sid,
                    user_card_ids: JSON.stringify(robot.caseData.user_card_ids),
                    user_id: robot.caseData.user_id,
                    finished_missions: robot.caseData.mission_id,
                    monster_drops: JSON.stringify(robot.caseData.monster_drops),
                    battle_mode: robot.caseData.battle_mode
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'finish_mission', 'finish_mission');
                        callback();
                    } else {
                        console.log(status, data);
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
);

