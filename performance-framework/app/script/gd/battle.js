var Client = require('dena-client').gd;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

//robot.init({host: '10.96.38.10', port: 80}, function () {
robot.init({host: 'ser53.slamdunk.91dena.com', port: 80}, function () {

    robot.caseData.previous = true;
    robot.run();
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

robot.actions.push(
    function () {

        if (!!robot.caseData.previous) {

            robot.caseData.previous = false;
            robot.funcseries = [];
            robot.caseData.user_id = 2047000000121,
                robot.funcArray =
                    [
                        getUserInfo,
                        Go,
                        AutoBattle,
                        //BattleArenaPosition,
                        GetQuestInfo
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

        function getUserInfo(callback) {

            monitor(START, 'GetUserInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'User',
                    action: 'GetUserInfo',
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetUserInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function Go(callback) {
            monitor(START, 'Go', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Quest',
                    action: 'Go',
                    mission_id: 1010401,
                    difficulty: 3,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'Go', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function BattleArenaPosition(callback) {
            monitor(START, 'BattleArenaPosition', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'ArenaPosition',
                    action: 'BattleArenaPosition',
                    def_id: 2046000000097,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'BattleArenaPosition', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function AutoBattle(callback) {
            monitor(START, 'AutoBattle', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Battle',
                    action: 'AutoBattle',
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'AutoBattle', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetQuestInfo(callback) {
            monitor(START, 'GetQuestInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Quest',
                    action: 'GetQuestInfo',
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetQuestInfo', '1');
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

