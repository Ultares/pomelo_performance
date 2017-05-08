var Client = require('dena-client').pok;
var async = require('async');
var uuid = require('uuid');
var robot = new Client();
var START = 'start';
var END = 'end';
robot.caseData.playId = 'aaaaaaaa-aaaa-aaaa-aaaa-' + (100000000001 + actor.id).toString();
robot.init({
        host: 'http://android.punkcn.91dena.cn/',
        port: 80,
        sendInterval: 10,
        headers: {
            'Content-type': 'application/json; charset=utf-8',
            'Authorization': "gumi " + robot.caseData.playId,
            'User-Agent': 'Android'
        }
    },
    function () {
        robot.run();
        robot.caseData.previous = true;
    }
);


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        robot.funcseries = [];
        if (robot.caseData.ratemode) {
            robot.funcmap = {
                shop: {funcArray: [shopStatus, shopBuy], rate: 5},
                pay: {funcArray: [pay], rate: 5},
                questKeyIndex: {funcArray: [questKeyIndex], rate: 10},
                questProgressExtra: {funcArray: [questProgressExtra], rate: 5},
                presentRead: {funcArray: [presentRead], rate: 10},
                gacha: {funcArray: [gacha], rate: 5},
                deckEdit: {funcArray: [homeStartUp, deckEdit], rate: 5},
                pvpPlayerStatus: {funcArray: [pvpPlayerStatus], rate: 5},
                //pvpRanking: {funcArray: [pvpRanking, pvpRankingClose], rate: 10},
                battle: {funcArray: [homeStartUp, battleForceClose, battleStoryStart, battleStoryFinish], rate: 10}
            };

            robot.willTest = [];
            robot.endRate = 100;
            var i = 0;
            while (i <= 10) {
                for (var k in robot.funcmap) {
                    var rate = getRandomInt(1, robot.endRate);
                    if (robot.caseData.debug) {
                        console.log('rate is <%s> and k.rate is <%s> ', rate, robot.funcmap[k].rate);
                    }
                    if (rate <= robot.funcmap[k].rate) {
                        robot.willTest = robot.willTest.concat(robot.funcmap[k].funcArray);
                    }
                }
                if (robot.willTest.length) {
                    if (robot.caseData.debug) {
                        console.log('Random <%s> time(s)', i);
                    }
                    break;
                }
                i++;
            }

            if (robot.caseData.debug) {
                console.log('robot.willTest is ', robot.willTest.length)
            }
            robot.funcArray = robot.willTest;
        } else {
            robot.funcArray =
                [
                    battleForceClose,
                    shopStatus,
                    shopBuy,
                    homeStartUp,
                    pay,
                    questKeyIndex,
                    questProgressExtra,
                    presentRead,
                    deckEdit,
                    battleStoryStart,
                    battleStoryFinish,
                    gacha,
                    //pvpRanking,
                    //pvpRankingClose,
                    pvpPlayerStatus,
                    //checkLogin,
                    //registerLogin
                ];
        }
        robot.funcArray.forEach(function (element) {
            var func = function (callback) {
                setTimeout(element, robot.randomIntTime(), callback);
            };
            robot.funcseries.push(func)
        });

        async.series(robot.funcseries,
            function (err) {
                if (err) {
                    robot.log(err, level = 'error');
                } else {
                    robot.caseData.previous = true;
                }
            }
        );

        function playerStatus(callback) {
            monitor(START, 'playerStatus', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/player/status',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'playerStatus', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function homeStartUp(callback) {
            monitor(START, 'homeStartUp', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/home/start_up',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.player_units = JSON.parse(data).player_units;
                        monitor(END, 'homeStartUp', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function questProgressExtra(callback) {
            monitor(START, 'questProgressExtra', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/quest/progress/extra',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'questProgressExtra', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function presentRead(callback) {
            monitor(START, 'presentRead', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/present/read',
                    method: 'POST',
                    json: true,
                    body: {
                        present_ids: [1]
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'presentRead', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function deckEdit(callback) {
            monitor(START, 'deckEdit', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/deck/edit',
                    method: 'POST',
                    json: true,
                    body: {
                        deck_type_id: 1,
                        player_unit_ids: [robot.caseData.player_units[0].id,
                            robot.caseData.player_units[1].id,
                            robot.caseData.player_units[2].id,
                            robot.caseData.player_units[3].id],
                        number: 0
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'deckEdit', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pay(callback) {
            monitor(START, 'pay', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/pay/',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pay', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function questKeyIndex(callback) {
            monitor(START, 'questKeyIndex', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/questkey/index',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'questKeyIndex', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpRanking(callback) {
            monitor(START, 'pvpRanking', 1);
            robot.sendRequest(
                {
                    path: '/api/v1/pvp/ranking',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpRanking', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpRankingClose(callback) {
            monitor(START, 'pvpRankingClose', 1);
            robot.sendRequest(
                {
                    path: '/api/v1/pvp/ranking-close',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpRankingClose', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpPlayerStatus(callback) {
            monitor(START, 'pvpPlayerStatus', 1);
            robot.sendRequest(
                {
                    path: '/api/v1/pvp/player/status',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpPlayerStatus', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function battleForceClose(callback) {
            monitor(START, 'battleForceClose', 1);
            robot.sendRequest(
                {
                    path: '/api/v1/battle/force-close',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'battleForceClose', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function battleStoryStart(callback) {
            monitor(START, 'battleStoryStart', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/battle/story/start',
                    method: 'POST',
                    json: true,
                    body: {
                        support_player_id: '',
                        deck_type_id: 1,
                        quest_s_id: 110001001,
                        deck_number: 0
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'battleStoryStart', 1);
                        robot.caseData.battle_uuid = data.battle_uuid;
                        robot.caseData.battle_enemy_ids = data.enemy;
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function battleStoryFinish(callback) {
            monitor(START, 'battleStoryFinish', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/battle/story/finish',
                    method: 'POST',
                    json: true,
                    body: {
                        supply_results_supply_id: [],
                        supply_results_use_quantity: [],
                        win: 1,
                        enemy_results_dead_count: [1, 1, 1],
                        gear_results_damage_count: [],
                        duels_hit_damage: [0, 6, 0],
                        duels_max_damage: [5, 6, 6],
                        continue_count: 0,
                        intimate_result_target_player_character_id: [1014, 5005, 6002, 2001, 5005, 6002, 2001, 6002, 5005, 6002],
                        battle_uuid: robot.caseData.battle_uuid,
                        unit_results_rental: [0, 0, 0, 0],
                        battle_turn: 1,
                        enemy_results_kill_count: [0, 0, 0],
                        panel_entity_ids: [],
                        gear_results_kill_count: [],
                        enemy_results_enemy_id: [1, 2, 3],
                        gear_results_player_gear_id: [],
                        //is_game_over: False,
                        duels_damage: [5, 6, 6],
                        unit_results_remaining_hp: [6, 6, 6, 6],
                        intimate_results_player_character_id: [1002, 1002, 1002, 1002, 1014, 1014, 1014, 5005, 2001, 2001],
                        unit_results_total_kill_count: [1, 0, 1, 1],
                        unit_results_total_damage_count: [1, 0, 1, 1],
                        enemy_results_level_difference: [2, 1, 1],
                        unit_results_player_unit_id: [robot.caseData.player_units[0].id,
                            robot.caseData.player_units[1].id,
                            robot.caseData.player_units[2].id,
                            robot.caseData.player_units[3].id],
                        intimate_results_exp: [10, 10, 10, 10, 10, 10, 10, 15, 10, 10],
                        duels_critical_count: [0, 0, 0],
                        drop_entity_ids: [],
                        unit_results_total_damage: [5, 0, 6, 6]
                    }

                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'battleStoryFinish', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function shopStatus(callback) {
            monitor(START, 'shopStatus', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/shop/status',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'shopStatus', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function shopBuy(callback) {
            monitor(START, 'shopBuy', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/shop/buy',
                    method: 'POST',
                    json: true,
                    body: {
                        article_id: 10000002,
                        quantity: 1
                    }

                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'shopBuy', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function gacha(callback) {
            monitor(START, 'gacha', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/gacha',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'gacha', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function friendStatus(callback) {
            monitor(START, 'playerStatus', 1);
            robot.sendRequest(
                {
                    path: 'api/v1/friend/status',
                    method: 'POST'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'playerStatus', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function checkLogin(callback) {
            monitor(START, 'checkLogin', 1);
            robot.sendRequest(
                {
                    path: 'http://android.account.punkcn.91dena.cn?',
                    body: {
                        m: 'home',
                        c: 'test',
                        a: 'checkLogin'
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'checkLogin', 1);
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function registerLogin(callback) {
            monitor(START, 'registerLogin', 1);
            robot.sendRequest(
                {
                    path: 'http://android.account.punkcn.91dena.cn?',
                    body: {
                        m: 'home',
                        c: 'test',
                        a: 'registerLogin'
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'registerLogin', 1);
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

