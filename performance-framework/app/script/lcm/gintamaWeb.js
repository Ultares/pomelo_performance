var Client = require('dena-client').lcm;
var async = require('async');
var uuid = require('uuid');

var robot = new Client();

var START = 'start';
var END = 'end';
//lcm-prod-ap-live.mobage.cn
//
//52.69.178.171
//https://lcm-prod-na-live.mobage.cn/
//robot.init({host: 'lcm-prod-na-live.mobage.cn', port: 443}, function () {
robot.init({host: 'op.mobage.cn', port: 80}, function () {
    robot.run();
    robot.caseData.previous = true;
});

var getRandomStr = function (length, index, pre) {
    pre = pre || '';
    index = index || 0;
    length = length || 32;
    var rdStr = pre + uuid.v4().replace(/-/g, '').substr(index, length - pre.length);
    return rdStr;
};

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

var randomNum = function (length) {
    var length = length || 8;
    var rn = Math.random() * Math.pow(10, length);
    //console.log('rn ====>', rn);
    return rn.toString().substr(0, length);
};

robot.actions.push(
    function () {
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        robot.funcseries = [];

        robot.funcArray =
            [
                ginTaMa,
                ginTaBa,
                ginTaFa,
                ginTaPa
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

        function ginTaMa(callback) {
            monitor(START, 'gintama', 'gintama');
            robot.httpRequest(
                {
                    host: 'http://gintama.mobage.cn/',
                    port: 80,
                    path: 'home',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'gintama', 'gintama');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ginTaBa(callback) {
            monitor(START, 'gintaBa', 'gintaBa');
            robot.httpRequest(
                {
                    host: 'http://gintama.mobage.cn/',
                    port: 80,
                    path: 'home',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'gintaBa', 'gintaBa');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }
        function ginTaFa(callback) {
            monitor(START, 'ginTaFa', 'ginTaFa');
            robot.httpRequest(
                {
                    host: 'http://gintama.mobage.cn/',
                    port: 80,
                    path: 'home',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ginTaFa', 'ginTaFa');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }
        function ginTaPa(callback) {
            monitor(START, 'ginTaPa', 'ginTaPa');
            robot.httpRequest(
                {
                    host: 'http://gintama.mobage.cn/',
                    port: 80,
                    path: 'home',
                    method: 'GET'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ginTaPa', 'ginTaPa');
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

