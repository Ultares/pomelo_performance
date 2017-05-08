var Client = require('dena-client').mc;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';
robot.init({host: '119.15.138.28', port: 8080}, function () {
//robot.init({host: 'mc.mobage.cn', port: 8090}, function () {
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
        setTimeout(function () {

            robot.caseData['mobageId'] = actor.actorId;
            robot.caseData['gamerId'] = robot.caseData['mobageId'] + '00001';
            robot.caseData['shopId'] = 1;
            robot.caseData['nickName'] = 'daluobo' + robot.caseData['mobageId'];

            robot.httpRequest(
                {
                    path: 'gamer/login',
                    method: 'POST',
                    body: {
                        mobageId: robot.caseData['mobageId'],
                        serverId: 1
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.previous = true;
                        robot.caseData['deck'] = data['result']['gamer']['deck']['positions'];
                        console.info('====><%s>',robot.caseData['deck']);//JSON.stringify(robot.caseData['deck']));
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

        setTimeout(function () {

            robot.httpRequest(
                {
                    path: 'admin/gamer/debugUpdateLv',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        lv: 40
                    }
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

        if (!robot.caseData.previous) {
            return 1;
        }

        setTimeout(function () {

            robot.httpRequest(
                {
                    path: 'admin/gamer/debugOpenMap',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        mapIds: '2:2'
                    }
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

        if (!robot.caseData.previous) {
            return 1;
        }

        setTimeout(function () {

            robot.httpRequest(
                {
                    path: 'admin/gamer/unlockModule',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        moduleId: 2
                    }
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

        if (!robot.caseData.previous) {
            return 1;
        }

        setTimeout(function () {

            robot.httpRequest(
                {
                    path: 'admin/gamer/unlockModule',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        moduleId: 3
                    }
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

        if (!robot.caseData.previous) {
            return 1;
        }

        robot.caseData.previous = false;
        robot.funcseries = [];

        robot.funcArray =
            [
                //gamerRename,
                dailyTasksStatus,
                achieveGetStatus,
                activitySignInStatus,
                //dungeonArea,
                //dungeonBattle,
                //dungeonBattleResult,
                //dungeonSweep,
                gachaShow,
                hornMessageList,
                messageMailBox,
                //shopGetSaleItems,
                getStranger,
                pvpRoom,
                //pvpOpponents,
                pvpTop20,
                //pvpFight,
                //pvpSettlement,
                conquerGetOpponent

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

        function gamerRename(callback) {

            monitor(START, 'gamerRename', 'gamerRename');

            robot.httpRequest(
                {
                    path: 'gamer/rename',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        nickName: robot.caseData['nickName']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'gamerRename', 'gamerRename');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dailyTasksStatus(callback) {

            monitor(START, 'dailyTasksStatus', 'dailyTasksStatus');
            robot.httpRequest(
                {
                    path: 'activity/dailyTasks/status',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },

                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dailyTasksStatus', 'dailyTasksStatus');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function achieveGetStatus(callback) {

            monitor(START, 'achieveGetStatus', 'achieveGetStatus');
            robot.httpRequest(
                {
                    path: 'achieve/getStatus',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'achieveGetStatus', 'achieveGetStatus');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function activitySignInStatus(callback) {

            monitor(START, 'activitySignInStatus', 'activitySignInStatus');
            robot.httpRequest(
                {
                    path: 'activity/signIn/status',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'activitySignInStatus', 'activitySignInStatus');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dungeonArea(callback) {

            robot.caseData['dungeon_areaId'] = 101;
            monitor(START, 'dungeonArea', 'dungeonArea');
            robot.httpRequest(
                {
                    path: 'dungeon/area',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        areaId: robot.caseData['dungeon_areaId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dungeonArea', 'dungeonArea');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dungeonBattle(callback) {

            robot.caseData['dungeonId'] = 1001;
            monitor(START, 'dungeonBattle', 'dungeonBattle');
            robot.httpRequest(
                {
                    path: 'dungeon/battle',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        dungeonId: robot.caseData['dungeonId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dungeonBattle', 'dungeonBattle');
                        robot.caseData['battleToken'] = data['result']['battle']['battleToken'];
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dungeonBattleResult(callback) {

            monitor(START, 'dungeonBattleResult', 'dungeonBattleResult');
            robot.httpRequest(
                {
                    path: 'dungeon/battleResult',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        battleToken: robot.caseData['battleToken'],
                        deaths: 0
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dungeonBattleResult', 'dungeonBattleResult');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dungeonSweep(callback) {

            monitor(START, 'dungeonSweep', 'dungeonSweep');
            robot.httpRequest(
                {
                    path: 'dungeon/sweep',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        dungeonId: robot.caseData['dungeonId'],
                        times: 3
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dungeonSweep', 'dungeonSweep');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function gachaShow(callback) {

            monitor(START, 'gachaShow', 'gachaShow');
            robot.httpRequest(
                {
                    path: 'gacha/show',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'gachaShow', 'gachaShow');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function hornMessageList(callback) {

            monitor(START, 'hornMessageList', 'hornMessageList');
            robot.httpRequest(
                {
                    path: 'hornMessage/list',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'hornMessageList', 'hornMessageList');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function messageMailBox(callback) {

            monitor(START, 'messageMailBox', 'messageMailBox');
            robot.httpRequest(
                {
                    path: 'message/mailBox',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'messageMailBox', 'messageMailBox');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function shopGetSaleItems(callback) {

            monitor(START, 'shopGetSaleItems', 'shopGetSaleItems');
            robot.httpRequest(
                {
                    path: 'shop/getSaleItems',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        shopId: robot.caseData['shopId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'shopGetSaleItems', 'shopGetSaleItems');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function getStranger(callback) {

            monitor(START, 'getStranger', 'getStranger');
            robot.httpRequest(
                {
                    path: 'getStranger',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        worldId: 1,
                        areaId: 1
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'getStranger', 'getStranger');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpRoom(callback) {

            monitor(START, 'pvpRoom', 'pvpRoom');
            robot.httpRequest(
                {
                    path: 'pvp/room',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpRoom', 'pvpRoom');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpOpponents(callback) {

            monitor(START, 'pvpOpponents', 'pvpOpponents');
            robot.httpRequest(
                {
                    path: 'pvp/opponents',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpOpponents', 'pvpOpponents');
                        robot.caseData['opponentId'] = data['result']['opponents'][0]['gamerId'];
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpTop20(callback) {

            monitor(START, 'pvpTop20', 'pvpTop20');
            robot.httpRequest(
                {
                    path: 'pvp/top20',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpTop20', 'pvpTop20');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpFight(callback) {

            monitor(START, 'pvpFight', 'pvpFight');
            robot.httpRequest(
                {
                    path: 'pvp/fight',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        opponentId: robot.caseData['opponentId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpFight', 'pvpFight');
                        robot.caseData['battleToken'] = data['result']['battleConfig']['battleToken'];
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function pvpSettlement(callback) {

            monitor(START, 'pvpSettlement', 'pvpSettlement');
            robot.httpRequest(
                {
                    path: 'pvp/settlement',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId'],
                        battleToken: robot.caseData['battleToken'],
                        win: 1
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'pvpSettlement', 'pvpSettlement');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function conquerGetOpponent(callback) {

            monitor(START, 'conquerGetOpponent', 'conquerGetOpponent');
            robot.httpRequest(
                {
                    path: 'conquer/getOpponent',
                    method: 'POST',
                    body: {
                        gamerId: robot.caseData['gamerId']
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'conquerGetOpponent', 'conquerGetOpponent');
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

