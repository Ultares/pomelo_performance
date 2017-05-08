var Client = require('dena-client').ft;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

robot.init({host: 'press.ft.mobage.cn', port: 9001}, function () {
    robot.run();
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
                    //console.log('robot.caseData <%s>', JSON.stringify(robot.caseData));
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
                        robot.caseData.world_id = 8;
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
                    world_id: robot.caseData.wid
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


            if (robot.caseData.ratemode) {
                robot.funcmap = {

                    activity_by_type: {funcArray: [activity_by_type], rate: 115},
                    get_marquee: {funcArray: [get_marquee], rate: 40},
                    get_common_task_list: {funcArray: [get_common_task_list], rate: 12},
                    get_daily_task_list: {funcArray: [get_daily_task_list], rate: 11}, //205
                    get_gacha: {funcArray: [gacha_info], rate: 10},
                    activity: {funcArray: [activity], rate: 8},
                    get_mail_list: {funcArray: [icon_status], rate: 8},
                    mission_sweep: {funcArray: [mission_start, mission_finish, mission_sweep], rate: 7},
                    duel_get_targets: {funcArray: [duel_get_targets], rate: 6},
                    get_user_magic2_pieces: {funcArray: [get_user_magic2_pieces], rate: 6},
                    get_task_bonus: {funcArray: [get_task_bonus], rate: 6},
                    duel_free_info: {funcArray: [duel_free_info], rate: 6},
                    mission: {funcArray: [mission_start, mission_finish], rate: 5},
                    gacha_buy: {funcArray: [gacha_buy], rate: 5},
                    get_user_info: {funcArray: [get_user_info], rate: 4},
                    //get_server_time: {funcArray: [get_server_time], rate: 21},
                    //get_user_event_count: {funcArray: [get_user_event_count], rate: 660},
                    //check_frame: {funcArray: [check_frame], rate: 19},Ì«ÉÙµ÷ÓÃ
                    //get_notice: {funcArray: [get_notice], rate: 10},·ÏÆú
                    city_get_user_infos: {funcArray: [city_get_user_infos], rate: 3},
                    login: {funcArray: [login], rate: 3},
                    store_info: {funcArray: [store_info], rate: 3},
                    pvp_get_top_rank_list: {funcArray: [pvp_get_rank_list], rate: 2},
                    pvp: {funcArray: [pvp_get_rank_list, pvp_start, pvp_finish], rate: 2},
                    duel_auto: {funcArray: [duel_auto], rate: 1},
                    raid_boss_info: {funcArray: [raid_boss_info], rate: 1},
                    get_tower_info: {funcArray: [get_tower_info], rate: 1},
                    show_sale: {funcArray: [show_sale], rate: 1},
                    get_user_friends: {funcArray: [get_user_friends], rate: 1},
                    get_tutorial_user_data: {funcArray: [get_tutorial_user_data], rate: 1},
                    user_daily_mission: {funcArray: [user_daily_mission], rate: 1},
                };

                robot.willTest = [];
                robot.endRate = 276;
                var i = 0;
                while (i <= 20) {
                    i++;
                    for (var k in robot.funcmap) {
                        var rate = getRandomInt(1, robot.endRate);
                        if (robot.caseData.debug) {
                            console.log('rate is <%s> and k.rate is <%s> ', rate, robot.funcmap[k].rate)
                        }
                        if (rate <= robot.funcmap[k].rate) {
                            robot.willTest = robot.willTest.concat(robot.funcmap[k].funcArray);
                        }
                    }
                    if (robot.willTest.length) {
                        break;
                    }
                }

                if (robot.caseData.debug) {
                    console.log('robot.willTest is ', robot.willTest.length)
                }
                robot.funcArray = robot.willTest;
            } else {
                robot.funcArray =
                    [
                        //activity,
                        //activity_status,
                        //activity_by_type,
                        //get_marquee,
                        //get_user_info,
                        //get_user_cards,
                        //world_boss_get_info,
                        //world_boss_top_list,
                        //team_set_list,
                        //icon_status,
                        //gacha_info,
                        //get_user_occasional_store,
                        //get_user_occasional_store_status,
                        //get_mission_rank_list,
                        //get_message_server,
                        //user_get_chat_info,
                        //get_power_rank_list,
                        //get_level_rank_list,
                        //get_server_time,
                        //get_user_event_count,
                        //check_frame,
                        //get_gacha,
                        //get_notice,
                        //get_common_task_list,
                        //get_daily_task_list,
                        //get_task_bonus,
                        //city_get_user_infos,
                        //pvp_get_rank_list,
                        //get_tutorial_user_data,
                        //user_daily_mission,
                        //duel_free_info,
                        //login,
                        //store_info,
                        //duel_auto,
                        //raid_boss_info,
                        //get_tower_info,
                        //duel_get_targets,
                        //get_mail_list,
                        //get_user_magic2_pieces,
                        //show_sale,
                        //get_user_friends,
                        //get_user_sign,
                        //pvp_get_top_rank_list,
                        //pvp_start,
                        //pvp_finish,
                        //pvp_sweep,
                        mission_start,
                        mission_finish,
                        mission_sweep
                        //{"err_code":10010,"err_msg":"{ err_code: 10010, err_msg: '' }","result":"","time_stamp":1453983985}
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

        function activity_status(callback) {

            var opts = {
                path: 'activity_status',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function team_set_list(callback) {

            var opts = {
                path: 'team_set_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    list: "[0, 1, 2, 3, 4]"
                }
            };

            monitorRequest(opts, callback);
        }

        function gacha_info(callback) {

            var opts = {
                path: 'gacha_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function gacha_buy(callback) {

            var opts = {
                path: 'gacha_buy',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    gacha_id: 1002,
                    num: 1,
                    cost_type: 0
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_occasional_store(callback) {

            var opts = {
                path: 'get_user_occasional_store',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_occasional_store_status(callback) {

            var opts = {
                path: 'get_user_occasional_store_status',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_mission_rank_list(callback) {

            var opts = {
                path: 'get_mission_rank_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    difficulty: 1
                }
            };

            monitorRequest(opts, callback);
        }

        function get_message_server(callback) {

            var opts = {
                path: 'get_message_server',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function user_get_chat_info(callback) {

            var opts = {
                path: 'user_get_chat_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_power_rank_list(callback) {

            var opts = {
                path: 'get_power_rank_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_level_rank_list(callback) {

            var opts = {
                path: 'get_level_rank_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function user_daily_mission(callback) {

            var opts = {
                path: 'user_daily_mission',
                pmts: {
                    sid: robot.caseData.sid,
                    type: 1,
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

        function get_marquee(callback) {

            var opts = {
                path: 'get_marquee',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_server_time(callback) {

            var opts = {
                path: 'get_server_time',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function world_boss_get_info(callback) {

            var opts = {
                path: 'world_boss_get_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function world_boss_top_list(callback) {

            var opts = {
                path: 'world_boss_top_list',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    damage_type: "single"
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

        function duel_free_info(callback) {

            var opts = {
                path: 'duel_free_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function store_info(callback) {

            var opts = {
                path: 'store_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function login(callback) {

            var opts = {
                path: 'login',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    world_id: robot.caseData.wid
                }
            };

            monitorRequest(opts, callback);
        }

        function duel_auto(callback) {

            var opts = {
                path: 'duel_auto',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    piece_id: 523011,
                    auto_stamina: true
                }
            };

            monitorRequest(opts, callback);
        }

        function duel_auto(callback) {

            var opts = {
                path: 'duel_auto',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    piece_id: 523011,
                    auto_stamina: true
                }
            };

            monitorRequest(opts, callback);
        }


        function get_tutorial_user_data(callback) {

            var opts = {
                path: 'get_tutorial_user_data',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_tower_info(callback) {

            var opts = {
                path: 'get_tower_info',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_magic2_pieces(callback) {

            var opts = {
                path: 'get_user_magic2_pieces',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function show_sale(callback) {

            var opts = {
                path: 'show_sale',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    sale_id: 1
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

        function get_gacha(callback) {

            var opts = {
                path: 'get_gacha',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    ft_token: 111111
                }
            };

            monitorRequest(opts, callback);
        }

        function get_notice(callback) {

            var opts = {
                path: 'get_notice',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    affcode_id: 1
                }
            };

            monitorRequest(opts, callback);
        }

        function raid_boss_info(callback) {

            var opts = {
                path: 'raid_boss_info',
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

        function get_user_sign(callback) {

            var opts = {
                path: 'get_user_sign',
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

            monitorRequest(opts, ["user_card_id"], callback);
        }

        function icon_status(callback) {

            var opts = {
                path: 'icon_status',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id
                }
            };

            monitorRequest(opts, callback);
        }

        function get_user_cards(callback) {

            var opts = {
                path: 'get_user_cards',
                pmts: {
                    sid: robot.caseData.sid,
                    user_id: robot.caseData.user_id,
                    user_card_ids: [robot.caseData['user_card_id']]

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

        function get_task_bonus(callback) {

            var opts = {
                path: 'get_task_bonus',
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

        function duel_get_targets(callback) {

            var opts = {
                path: 'duel_get_targets',
                pmts: {
                    sid: robot.caseData.sid,
                    piece_id: 523011,
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
                    number: 1
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
                        robot.caseData.neighbors = data.result['neighbors'][data.result['neighbors'].length - 1];

                        if (!!robot.caseData.debug) {
                            console.log('[ %s ] Received <%s> response: \n%s\n', new Date().toString(),
                                'pvp_get_rank_list', JSON.stringify(robot.caseData.neighbors));
                        }
                        robot.caseData.target_user_id = String(robot.caseData.neighbors.name);

                        if (robot.caseData.target_user_id == robot.caseData.user_id) {
                            //console.log('T=<%s> S=<%s>', robot.caseData.target_user_id, robot.caseData.user_id);
                            robot.caseData.neighbors = data.result['neighbors'][data.result['neighbors'].length - 2];
                            robot.caseData.target_user_id = String(robot.caseData.neighbors.name);
                        }

                        robot.caseData.target_rank = String(robot.caseData.neighbors.rank);
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
                            console.log('pvp_mission_id : < %s >', robot.caseData.pvp_mission_id);
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
                    result: 0,
                    pvp_mission_id: robot.caseData.pvp_mission_id

                }
            };
            monitorRequest(opts, callback);
        }

        function pvp_sweep(callback) {

            var opts = {
                path: 'pvp_sweep',
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

