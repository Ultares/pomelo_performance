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
                getGiftCode,
                lotteryExchange,
                lotteryBindGift
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

        function getGiftCode(callback) {
            monitor(START, 'getGiftCode', 'getGiftCode');
            robot.httpRequest(
                {
                    host: 'http://game.mobage.cn/',
                    port: 80,
                    path: 'jssdk/get_gift_code',
                    method: 'POST',
                    body: {
                        event: 'testing',
                        phone: '13' + randomNum(9),
                        source: getRandomStr(8)
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'getGiftCode', 'getGiftCode');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function lotteryExchange(callback) {
            monitor(START, 'lotteryExchange', 'lotteryExchange');
            robot.httpRequest(
                {
                    ishttps: true,
                    host: 'http://op.mobage.cn/',
                    port: 80,
                    path: 'lottery/exchange',
                    method: 'POST',
                    body: {
                        code: getRandomStr(8),
                        uid: 123,
                        name: getRandomStr(6),
                        address: getRandomStr(12),
                        post_code: 200014,
                        phone: '13' + randomNum(9)
                    }
                },

                function (status, data) {
                    if (status == 200) {
                        robot.caseData.accessToken = data.accessToken;
                        monitor(END, 'lotteryExchange', 'lotteryExchange');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function lotteryBindGift(callback) {
            monitor(START, 'lotteryBindGift', 'lotteryBindGift');
            robot.httpRequest(
                {
                    host: 'http://op.mobage.cn/',
                    port: 80,
                    path: 'lottery/bind_gift',
                    method: 'POST',
                    body: {
                        act_name: 'gd_bindtel'
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'lotteryBindGift', 'lotteryBindGift');
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

