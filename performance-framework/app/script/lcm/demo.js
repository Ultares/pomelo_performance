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
robot.init({host: 'lcm-prod-cn-live.mobage.cn', port: 443}, function () {
    robot.run();
    robot.caseData.previous = true;
});


var getcl = function () {
    var uid = uuid.v4().toUpperCase().split('-');
    var cl = uid[0] + uid[uid.length - 1];
    var clArray = cl.split('');
    for (var i = 1; i <= cl.length / 5; i++) {
        clArray[5 * i - 1] = cl.charCodeAt(5 * i - 3) % 10;
    }
    return clArray.join('');
};

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

        robot.funcArray =
            [
                authInit,
                authSessionCreate,
                authValidate,
                authSessionUpdate
                //authLink
                //NBA2authCreate,
                //registeCommonLcm
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

        function authInit(callback) {
            monitor(START, 'authInit', 'authInit');
            robot.httpRequest(
                {
                    host: 'lcm-prod-cn-live.mobage.cn',
                    port: 443,
                    ishttps: true,
                    path: 'auth/init?',
                    method: 'GET',
                    body: {
                        bundleId: 'com.denachina.pickle',
                        signatureSHA1: '',//'73:6A:7C:4A:02:39:14:9D:5B:38:9C:5F:B1:3C:13:59',
                        affcode: 100000,
                        appVersion: 1.1,
                        sdkVersion: 1.1
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'authInit', 'authInit');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function authSessionCreate(callback) {
            robot.cl = 'lcm:' + getcl();
            monitor(START, 'authSessionCreate', 'authSessionCreate');
            robot.httpRequest(
                {
                    ishttps: true,
                    host: 'lcm-prod-cn-live.mobage.cn',
                    port: 443,
                    path: 'auth/session/create?',
                    method: 'POST',
                    body: {
                        capability: {
                            "deviceWidth": 320, "manufacturer": "",
                            "networkType": "wifi", "region": "CN", "carrier": "",
                            "sandbox": false, "deviceToken": "",
                            "timeZoneOffset": "", "googleClientId": "",
                            "bundleId": "com.denachina.pickle", "advertisingId": "",
                            "locale": "zh-Hans", "productId": "pickle",
                            "osVersion": "8.1.1", "deviceName": "SilverUp",
                            "timeZoneName": "", "storeType": "APPLE",
                            "idfa": "C6EC7ACF64A84B35BAB220F0083957A5",
                            "appVersion": "1", "deviceHeight": 568,
                            "signatureSHA1": "", "sdkVersion": "1.0",
                            "stage": false, "apiProvider": "APPLE", "affcode": "1.1"
                        },
                        credential: robot.cl
                    }
                },

                function (status, data) {
                    if (status == 200) {
                        robot.caseData.accessToken = data.accessToken;
                        monitor(END, 'authSessionCreate', 'authSessionCreate');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function authValidate(callback) {

            monitor(START, 'authValidate', 'authValidate');
            robot.httpRequest(
                {
                    Authorization: 'Basic YWJjOjk5OQ==',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    ishttps: true,
                    host: 'lcm-prod-cn-live.mobage.cn',
                    port: 443,
                    path: 'auth/validate?',
                    method: 'POST',
                    body: {
                        accessToken: robot.caseData.accessToken
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'authValidate', 'authValidate');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function authSessionUpdate(callback) {
            monitor(START, 'authSessionUpdate', 'authSessionUpdate');
            robot.httpRequest(
                {
                    Authorization: 'Bearer ' + robot.caseData.accessToken,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    ishttps: true,
                    host: 'lcm-prod-cn-live.mobage.cn',
                    port: 443,
                    path: 'auth/session/update?',
                    method: 'POST',
                    body: {
                        duration: 7200,
                        action: "update"
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'authSessionUpdate', 'authSessionUpdate');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function authLink(callback) {
            monitor(START, 'authLink', 'authLink');
            robot.httpRequest(
                {
                    Authorization: 'Bearer ' + robot.caseData.accessToken,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    ishttps: true,
                    host: 'lcm-prod-cn-live.mobage.cn',
                    port: 443,
                    path: 'auth/link?',
                    method: 'POST',
                    body: {
                        social_type: "gameCenter",
                        social_account: actor.actorId + "@163.com",
                        social_info: ""
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'authLink', 'authLink');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function NBA2authCreate(callback) {

            monitor(START, 'NBA2_authCreate', '1');
            robot.httpRequest(
                {
                    Authorization: 'Basic YWJjOjk5OQ==',
                    headers: {
                        'Content-Type': 'application/text'
                    },
                    path: 'auth/create',
                    host: '52.192.31.198',
                    port: '8201',
                    method: 'POST',
                    body: {
                        access_token: robot.caseData.accessToken
                    }
                },

                function (status, data) {
                    if (status == 200) {
                        robot.caseData.lid = data.data.lid;
                        monitor(END, 'NBA2_authCreate', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function registeCommonLcm(callback) {

            monitor(START, 'NBA2_registeCommonLcm', '1');
            robot.httpRequest(
                {
                    headers: {
                        'Content-Type': 'application/text'
                    },
                    path: 'register/common/lcm',
                    host: '52.192.31.198',
                    port: '8201',
                    method: 'POST',
                    body: {
                        lid: robot.caseData.lid
                    }
                },

                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'NBA2_registeCommonLcm', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function restCertifications(callback) {

            monitor(START, 'restCertifications', 'restCertifications');
            robot.httpRequest(
                {
                    path: 'rest/certifications',
                    method: 'GET',
                    Authorization: 'Basic dGVzdDp0ZXN0'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'restCertifications', 'restCertifications');
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

