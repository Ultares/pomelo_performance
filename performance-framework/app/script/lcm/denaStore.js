var Client = require('dena-client').lcm;
var async = require('async');
var uuid = require('uuid');
var caseConfig = require(actor.scriptPath + '/caseConfig');
var robot = new Client();
var crypto = require('crypto');
var START = 'start';
var END = 'end';
var accountStart = 500001;

robot.init({host: caseConfig.mobagePlatformUrl, port: caseConfig.mobagePlatformPort}, function () {
    robot.run();
    robot.caseData.previous = true;
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

var getCredential = function () {
    var rData = []
    var uid = uuid.v4().toUpperCase().split('');
    uid.splice(0, 2, 'gg');
    uid = uid.join('');
    //console.log('uid====>', uid);
    rData.push(uid);
    rData.push(uid.split('-').join(''));
    var clArray = uid.split('');
    for (var i = 1; i <= (uid.length + 1) / 5; i++) {
        clArray.splice(5 * i - 1, 0, uid.charCodeAt(5 * i - 3) % 10);
        uid = clArray.join('');
        clArray = uid.split('');
    }
    rData.push(clArray.join(''));
    return rData
};

robot.actions.push(
    function () {
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        robot.caseData.credential = getCredential();
        //console.log('robot.caseData.credential:', robot.caseData.credential);
        robot.funcseries = [];
        robot.funcArray =
            [
                register_login,
                quick_login,
                sso_login
            ];
        robot.funcArray.forEach(function (element, index, array) {
            var func = function (callback) {
                //console.log('robot.randomIntTime():',robot.randomIntTime());
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
        function register_login(callback) {
            var name = arguments.callee.name;
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.denaStoreTestUrl,
                    port: caseConfig.denaStoreTestPort,
                    path: 'https://store-prod-cn-live.mobage.cn/cn/account/login',
                    isHttps: true,
                    method: 'POST',
                    body: {
                        capability: {
                            "bundleId": "com.denachina.pickle",
                            "ip": "192.168.1.5",
                            "sdkVersion": "1.0",
                            "uuid": robot.caseData.credential[0],
                            "idfa": robot.caseData.credential[1],
                            "deviceId": 8
                        },
                        "credential": JSON.stringify({
                            "loginMethod": "oneClick",
                            "credential": robot.caseData.credential[2]
                        })
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, name, '1');
                        //robot.caseData.accessToken = data.accessToken;
                        //robot.caseData.ssoToken = data.ssoToken;
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function quick_login(callback) {
            var name = arguments.callee.name;
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.denaStoreTestUrl,
                    port: caseConfig.denaStoreTestPort,
                    path: 'https://store-prod-cn-live.mobage.cn/cn/account/login',
                    isHttps: true,
                    method: 'POST',
                    body: {
                        capability: {
                            "bundleId": "com.denachina.pickle",
                            "ip": "192.168.1.5",
                            "sdkVersion": "1.0",
                            "uuid": robot.caseData.credential[0],
                            "idfa": robot.caseData.credential[1],
                            "deviceId": 8
                        },
                        "credential": JSON.stringify({
                            "loginMethod": "oneClick",
                            "credential": robot.caseData.credential[2]
                        })
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.ssoToken = JSON.parse(data).ssoToken;
                        //console.log('robot.caseData.ssoToken', robot.caseData.ssoToken);
                        monitor(END, name, '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function sso_login(callback) {
            var name = arguments.callee.name;
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.denaStoreTestUrl,
                    port: caseConfig.denaStoreTestPort,
                    path: 'https://store-prod-cn-live.mobage.cn/cn/account/login',
                    isHttps: true,
                    method: 'POST',
                    body: {
                        capability: {
                            "bundleId": "com.denachina.pickle",
                            "ip": "192.168.1.5",
                            "sdkVersion": "1.0",
                            "uuid": robot.caseData.credential[0],
                            "idfa": robot.caseData.credential[1],
                            "deviceId": 8
                        },
                        "credential": JSON.stringify({
                            "loginMethod": "sso",
                            "credential": robot.caseData.ssoToken
                        })
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, name, '1');
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

