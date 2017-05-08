var Client = require('dena-client').ft;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

robot.init({host: 'ope.cn.ft.mobage.cn', port: 9001}, function () {
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

function monitorRequest(opts, gencasedate, callback) {

    if (arguments.length < 2) {
        throw new Error("Expected at least 2 arguments,get %s !", arguments.length);
    }

    if (arguments.length == 2) {
        opts = arguments[0];
        callback = arguments[1];
        if (typeof(callback) !== 'function') {
            throw new TypeError("callback must be a function type!")
        }
    }

    monitor(START, opts.path, opts.path);

    robot.httpRequest(opts.path,
        opts.pmts,
        function (status, data) {

            if (status == 200) {

                if (!!gencasedate) {
                    for (var key in gencasedate) {
                        robot.caseData[key] = data.result[key];
                    }
                }

                if (!!robot.caseData.debug) {
                    console.log('[ %s ] Received <%s> response: \n%s\n', new Date().toString(),
                        opts.path, JSON.stringify(data));
                }

                monitor(END, opts.path, opts.path);
                callback();
            } else {
                console.log(status, data);
            }
        }
    );
}


robot.actions.push(
    function () {
        robot.caseData.platform_user_id = actor.actorId;
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
                        robot.caseData.mission_id = '1101';
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
                    //activity,
                    //activity_by_type,
                    //check_binary,
                    //check_config,
                    //check_frame,
                    //city_get_all_friends_infos,
                    //city_get_recommend_friends,
                    //city_get_user_infos,
                    //get_common_task_list,
                    //get_daily_task_list,
                    //get_friends,
                    //get_invitations,
                    //get_mail_list,
                    //get_pvp_user_ranking,
                    //get_tower_rank_list,
                    //get_user_event_count,
                    //get_user_friends,
                    //get_user_info,
                    //get_user_mission_area_region,
                    //pvp_ranking_history,
                    //raid_boss_top_list,
                    //refresh_sale,
                    //pvp_get_top_rank_list,
                    //pvp_get_rank_list,
                    //pvp_start,
                    //pvp_finish,
                    //pvp_sweep,
                    mission_start,
                    mission_finish,
                    mission_sweep,

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

        function activity(callback) {

            var opts = {
                path: 'activity',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function activity_by_type(callback) {

            var opts = {
                path: 'activity_by_type',
                pmts: {
                    sid: robot.caseData.sid,
                    type: 5,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function check_binary(callback) {

            var opts = {
                path: 'check_binary',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    aff_code: 1,
                    binary_version: 1
                }
            };

            monitorRequest(opts, callback);
        }

        function check_config(callback) {

            var opts = {
                path: 'check_config',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    worldid: robot.caseData.world_id
                }
            };

            monitorRequest(opts, callback);
        }

        function check_frame(callback) {

            var opts = {
                path: 'check_frame',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    binary_version: 'i1.0.1'
                }
            };

            monitorRequest(opts, callback);
        }

        function city_get_all_friends_infos(callback) {

            var opts = {
                path: 'city_get_all_friends_infos',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function city_get_recommend_friends(callback) {

            var opts = {
                path: 'city_get_recommend_friends',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function city_get_user_infos(callback) {

            var opts = {
                path: 'city_get_user_infos',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_friends(callback) {

            var opts = {
                path: 'get_friends',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_invitations(callback) {

            var opts = {
                path: 'get_invitations',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_mail_list(callback) {

            var opts = {
                path: 'get_mail_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_pvp_user_ranking(callback) {

            var opts = {
                path: 'get_pvp_user_ranking',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_tower_rank_list(callback) {

            var opts = {
                path: 'get_tower_rank_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_event_count(callback) {

            var opts = {
                path: 'get_user_event_count',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_friends(callback) {

            var opts = {
                path: 'get_user_friends',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_info(callback) {

            var opts = {
                path: 'get_user_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_mission_area_region(callback) {

            var opts = {
                path: 'get_user_mission_area_region',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_common_task_list(callback) {

            var opts = {
                path: 'get_common_task_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_daily_task_list(callback) {

            var opts = {
                path: 'get_daily_task_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_pvp_ranking_event_info(callback) {

            var opts = {
                path: 'get_pvp_ranking_event_info',
                pmts: {
                    sid: robot.caseData.sid,
                    event_id: 1,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function pvp_get_top_rank_list(callback) {

            var opts = {
                path: 'pvp_get_top_rank_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function pvp_ranking_history(callback) {

            var opts = {
                path: 'pvp_ranking_history',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function raid_boss_top_list(callback) {

            var opts = {
                path: 'raid_boss_top_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    damage_type: 'single',
                    camp: 1

                }
            };

            monitorRequest(opts, callback);
        }

        function refresh_sale(callback) {

            var opts = {
                path: 'refresh_sale',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    sale_id: 2,
                    refresh_times: 1

                }
            };

            monitorRequest(opts, callback);
        }

        function mission_start(callback) {

            var opts = {
                path: 'mission_start',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    type: 1,
                    mission_id: 1101

                }
            };

            monitorRequest(opts, {mid: 'mid'}, callback);
        }

        function mission_finish(callback) {

            var opts = {
                path: 'mission_finish',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    type: 1,
                    mission_id: 1101,
                    mid: robot.caseData.mid,
                    star_level: 3,
                    finish_mission: 1,
                    battle_mode: 0,
                    power: 1
                }
            };

            monitorRequest(opts, callback);
        }

        function mission_sweep(callback) {

            var opts = {
                path: 'mission_sweep',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    type: 1,
                    mission_id: 1101,
                    number: 3

                }
            };

            monitorRequest(opts, callback);
        }

        function pvp_get_rank_list(callback) {

            monitor(START, 'pvp_get_rank_list', 'pvp_get_rank_list');
            robot.httpRequest('pvp_get_rank_list',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {

                        if (!!robot.caseData.debug) {
                            console.log('[ %s ] Received <%s> response: \n%s\n', new Date().toString(),
                                'pvp_get_rank_list', JSON.stringify(data));
                        }
                        robot.caseData.top_user = data.result.top_users[data.result.top_users.length-1];
                        robot.caseData.target_user_id = String(robot.caseData.top_user.name);
                        robot.caseData.target_rank = String(robot.caseData.top_user.rank);
                        monitor(END, 'pvp_get_rank_list', 'pvp_get_rank_list');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvp_start(callback) {

            monitor(START, 'pvp_start', 'pvp_start');
            robot.httpRequest('pvp_start',
                {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    target_user_id: robot.caseData.target_user_id,
                    target_rank: robot.caseData.target_rank
                },
                function (status, data) {
                    if (status == 200) {

                        robot.caseData.pvp_mission_id = data.result.pvp_info.mission_id;

                        if (!!robot.caseData.debug) {
                            console.log('pvp_mission_id : < %s >',robot.caseData.pvp_mission_id);
                            console.log('[ %s ] Received <%s> response: \n%s\n', new Date().toString(),
                                'pvp_start', JSON.stringify(data));
                        }

                        monitor(END, 'pvp_start', 'pvp_start');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvp_finish(callback) {

            var opts = {
                path: 'pvp_finish',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    target_user_id: robot.caseData.target_user_id,
                    target_rank: robot.caseData.target_rank,
                    result: 1,
                    pvp_mission_id: robot.caseData.pvp_mission_id

                }
            };

            monitorRequest(opts, callback);
        }

        function pvp_sweep(callback) {

            var opts = {
                path: 'mission_sweep',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    target_user_id: robot.caseData.target_user_id,
                    target_rank: robot.caseData.target_rank,
                    number: 1
                }
            };

            monitorRequest(opts, callback);
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            console.log('end...');
        }, robot.responseOverTime);
    }
);

