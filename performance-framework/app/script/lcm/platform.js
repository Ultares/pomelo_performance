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

var getImei = function (offset) {
    var value = 146756;
    if (!!offset) {
        value = 146756 + offset
    }
    return "35155405" + value + "2";
};

var getBaseStr = function (method, url) {
    var urlEncode = '';
    urlEncode += method;
    urlEncode += '&';
    urlEncode += encodeURIComponent(url);
    urlEncode += '&';
    return urlEncode;
};

var getSignature = function (str, key, token) {
    var sig;
    key += '&';
    if (!!token) key += token;
    sig = crypto.createHmac('sha1', key).update(str).digest().toString('base64');
    return sig;
};

robot.caseData.mac = actor.actorId.substr(0, 12);
robot.caseData.androidId = actor.actorId.substr(0, 16);
robot.caseData.serialNo = '0146B5660A0' + actor.actorId.substr(15, 5);
robot.caseData.imei = getImei();

var getRandomStr = function (length, index, pre) {
    pre = pre || '';
    index = index || 0;
    length = length || 32;
    var rdStr = pre + uuid.v4().replace(/-/g, '').substr(index, length - pre.length);
    return rdStr;
};

var getStr = function (rdStr, token, username, password) {
    var rdStr = rdStr || getRandomStr();
    var opts = {
        "imsi": 'gg' + rdStr.substr(12, 13),
        "imei": robot.caseData.imei,
        "mac": rdStr.substr(0, 12),
        "token": (!!token) ? token : 'deleted',
        "aff_code": caseConfig.affCode,
        "app_ver": caseConfig.appVer,
        "game_id": caseConfig.gameId,
        "device_id": caseConfig.deviceId,
        "devicename": caseConfig.deviceName,
        "carrier": caseConfig.carrier,
        "netstate": caseConfig.netStat,
        "os": caseConfig.androidOs,
        "osver": caseConfig.androidOsVer,
        "android_id": rdStr.substr(15, 16),
        "advertising_id": caseConfig.advertisingId,
        "serialno": 'unknown'
    };
    if (!!username && !!password) {
        opts['login_id'] = username;
        opts['login_pw'] = password;
    }
    return opts;
};

var getQqStr = function (rdStr, token) {
    var rdStr = rdStr || getRandomStr();
    var opts = {
        "imsi": 'gg' + rdStr.substr(12, 13),
        "imei": robot.caseData.imei,
        "mac": rdStr.substr(0, 12),
        "token": (!!token) ? token : '',
        "aff_code": caseConfig.affCodeQq,
        "app_ver": caseConfig.appVerQq,
        "game_id": caseConfig.gameId,
        "device_id": caseConfig.deviceId,
        "devicename": caseConfig.deviceName,
        "carrier": caseConfig.carrierQq,
        "channel_id": caseConfig.channelId,
        "netstate": caseConfig.netStat,
        "os": caseConfig.androidOs,
        "osver": caseConfig.androidOsVer,
        "android_id": rdStr.substr(15, 16),
        "advertising_id": caseConfig.advertisingId,
        "serialno": 'unknown',
        "shortcut_flag": 0,
        "uid": rdStr,
        "pf": "gg" + rdStr.substr(0, 14),
        "payToken": "gg" + rdStr.substr(3, 14),
        "qqAccessToken": "gg" + rdStr.substr(7, 14),
        "from": "weak",
        "loginMode": "qq",
        "pfkey": "gg" + rdStr.substr(11, 14)
    };
    return opts;
};

var getIosStr = function (rdStr, token, username, password) {
    var rdStr = rdStr || getRandomStr();
    var opts = {
        advertisingIdentifier: 'A8A4F82EB11444C9A3C65A32' + rdStr.substr(0, 8),
        identifierForVendors: 'A98EA996B1754F58944A928AFFE50E66',
        uuid: 'ggC65A15-C1F1-4024-8116-991' + rdStr.substr(9, 9),
        united_alliance: 1
    };
    if (!!username && !!password) {
        opts['login_id'] = username;
        opts['login_pw'] = password;
    }
    if (!!token) opts['mobage_token'] = token;
    return opts;
};

robot.actions.push(
    function () {
        if (!robot.caseData.previous) {
            return 1;
        }
        //console.log('user====>', accountStart + actor.id);
        robot.caseData.previous = false;
        robot.caseData.iosStr = getIosStr();
        robot.caseData.rdStr = getRandomStr();
        robot.funcseries = [];
        robot.funcArray =
            [
                androidCheckUpdate,
                tencentWeakLogin,
                //sdkAuth,
                //androidOneClick,
                //androidCheckUpdate,
                //androidUpLogin,
                //androidCheckUpdate,
                //androidSsoLogin,
                //iosCheckUpdate,
                //iosUpLogin,
                //iosCheckUpdate,
                //iosSsoLogin,
                iosCheckUpdate,
                iosOneClick
                //sdkAuth
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
        function androidCheckUpdate(callback) {
            var name = arguments.callee.name;
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.mobagePlatformUrlT,
                    port: caseConfig.mobagePlatformPortT,
                    path: caseConfig[name],
                    //isHttps: true,
                    method: 'GET',
                    str_: getStr(robot.caseData.rdStr),
                    body: {
                        aff_code: caseConfig.affCode,
                        game_id: caseConfig.gameId,
                        version: caseConfig.appVer
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

        function tencentWeakLogin(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['hostT'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.mobagePlatformUrlT,
                    port: caseConfig.mobagePlatformPortT,
                    path: caseConfig[name],
                    //isHttps: true,
                    method: 'GET',
                    str_: getQqStr(robot.caseData.rdStr),
                    body: {
                        SP_SDK_BUNDLE_IDENTIFIER: "com.tencent.tmgp.g13000110",
                        SP_SDK_TYPE: "native-android",
                        native: 4,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_nonce: caseConfig.oauthNonce,
                        oauth_signature: oauth_signature,
                        oauth_timestamp: Date.now(),
                        oauth_token: '',
                        oauth_version: '1.0',
                        on_launch: 1,
                        on_login: '',
                        on_resume: '',
                        on_game_init: ''
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.cookie = data.cookie;
                        monitor(END, name, '1');
                        sdkAuth(name, callback);
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function androidOneClick(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.devMobagePlatformUrl,
                    port: caseConfig.devMobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: getStr(),
                    body: {
                        aff_code: caseConfig.affCode,
                        game_id: caseConfig.gameId,
                        version: caseConfig.appVer,
                        bundle_id: caseConfig.bundleId,
                        device_id: caseConfig.deviceId,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_nonce: caseConfig.oauthNonce,
                        oauth_signature: oauth_signature,
                        oauth_timestamp: Date.now(),
                        sdk_type: caseConfig.sdkType,
                        osver: caseConfig.androidOsVer
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        //robot.caseData.token = data.token;
                        monitor(END, name, '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function androidSsoLogin(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: getStr(1, robot.caseData.tokenAndroid),
                    body: {
                        aff_code: caseConfig.affCode,
                        game_id: caseConfig.gameId,
                        version: caseConfig.appVer,
                        bundle_id: caseConfig.bundleId,
                        device_id: caseConfig.deviceId,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_nonce: caseConfig.oauthNonce,
                        oauth_signature: oauth_signature,
                        oauth_timestamp: Date.now(),
                        sdk_type: caseConfig.sdkType,
                        osver: caseConfig.androidOsVer
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

        function androidUpLogin(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: getStr(1, null, accountStart + actor.id, "robot"),
                    body: {
                        aff_code: caseConfig.affCode,
                        game_id: caseConfig.gameId,
                        version: caseConfig.appVer,
                        bundle_id: caseConfig.bundleId,
                        device_id: caseConfig.deviceId,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_nonce: 'F5BgxO',//caseConfig.oauthNonce,
                        oauth_signature: oauth_signature,
                        oauth_timestamp: Date.now(),
                        sdk_type: caseConfig.sdkType,
                        osver: caseConfig.androidOsVer
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.tokenAndroid = data.token;
                        //console.log('robot.caseData.tokenAndroid==>', robot.caseData.tokenAndroid);
                        monitor(END, name, '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function iosCheckUpdate(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: robot.caseData.iosStr,
                    body: {
                        aff_code: caseConfig.affCodeIos,
                        game_id: caseConfig.gameId,
                        device_id: 8,
                        on_game_init: '',
                        bundleid: caseConfig['bundleId'],
                        sdk_type: caseConfig['iosSdkType'],
                        app_ver: caseConfig['iosAppVer'],
                        oauth_nonce: 'F5BgxO',
                        oauth_timestamp: Date.now(),
                        oauth_signature: oauth_signature,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_version: '1.0',
                        on_resume: '',
                        on_launch: 1,
                        on_login: '',
                        carrier: caseConfig['iosCarrier'],
                        devicename: 'iPhone4%2C1',
                        naive: 4,
                        token: '',
                        channel_id: 100,
                        os: caseConfig['iosOs'],
                        osver: caseConfig['iosOsVer'],
                        netstate: 'unknown'
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

        function iosOneClick(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: robot.caseData.iosStr,
                    body: {
                        aff_code: caseConfig.affCodeIos,
                        game_id: caseConfig.gameId,
                        device_id: 8,
                        on_game_init: '',
                        bundleid: caseConfig['bundleId'],
                        sdk_type: caseConfig['iosSdkType'],
                        app_ver: caseConfig['iosAppVer'],
                        oauth_nonce: 'F5BgxO',
                        oauth_timestamp: Date.now(),
                        oauth_signature: oauth_signature,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_version: '1.0',
                        on_resume: '',
                        on_launch: 1,
                        on_login: '',
                        carrier: caseConfig['iosCarrier'],
                        devicename: 'iPhone4%2C1',
                        naive: 4,
                        token: '',
                        channel_id: 100,
                        os: caseConfig['iosOs'],
                        osver: caseConfig['iosOsVer'],
                        netstate: 'unknown'
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, name, '1');
                        robot.caseData.cookie = data.cookie;
                        sdkAuth(name, callback);
                        //callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function sdkAuth(caller, callback) {

            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            var monitorName = caller + '_' + name;
            monitor(START, monitorName, '1');
            robot.httpRequest(
                {
                    cookie: robot.caseData.cookie,
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    method: 'GET',
                    isHttps: true,
                    body: {
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_nonce: caseConfig.oauthNonce,
                        oauth_signature: oauth_signature,
                        oauth_timestamp: Date.now(),
                        oauth_callback: 'ngcore:???oauth_callback',
                        oauth_version: '1.0',
                        on_launch: 1,
                        on_login: '',
                        on_resume: '',
                        on_game_init: ''
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, monitorName, '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function iosUpLogin(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    host: caseConfig.mobagePlatformUrl,
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: getIosStr(1, null, accountStart + actor.id, "robot"),
                    body: {
                        aff_code: caseConfig.affCodeIos,
                        game_id: caseConfig.gameId,
                        device_id: 8,
                        on_game_init: '',
                        bundleid: caseConfig['bundleId'],
                        sdk_type: caseConfig['iosSdkType'],
                        app_ver: caseConfig['iosAppVer'],
                        oauth_nonce: 'F5BgxO',
                        oauth_timestamp: Date.now(),
                        oauth_signature: oauth_signature,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_version: '1.0',
                        on_resume: '',
                        on_launch: 1,
                        on_login: '',
                        carrier: caseConfig['iosCarrier'],
                        devicename: 'iPhone4%2C1',
                        naive: 4,
                        token: '',
                        channel_id: 100,
                        os: caseConfig['iosOs'],
                        osver: caseConfig['iosOsVer'],
                        netstate: 'unknown'
                    }
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.tokenIos = data.mobage_token;
                        monitor(END, name, '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function iosSsoLogin(callback) {
            var name = arguments.callee.name;
            var oauth_signature = getSignature(getBaseStr('GET', caseConfig['host'] + caseConfig[name]), caseConfig.oauthConsumerSecret);
            monitor(START, name, '1');
            robot.httpRequest(
                {
                    host: caseConfig.mobagePlatformUrl,
                    cookie: 'SP_SDK_GAME_ID=13000110',
                    port: caseConfig.mobagePlatformPort,
                    path: caseConfig[name],
                    isHttps: true,
                    method: 'GET',
                    str_: getIosStr(1, robot.caseData.tokenIos),
                    body: {
                        aff_code: caseConfig.affCodeIos,
                        game_id: caseConfig.gameId,
                        device_id: 8,
                        on_game_init: '',
                        bundleid: caseConfig['bundleId'],
                        sdk_type: caseConfig['iosSdkType'],
                        app_ver: caseConfig['iosAppVer'],
                        oauth_nonce: 'F5BgxO',
                        oauth_timestamp: Date.now(),
                        oauth_signature: oauth_signature,
                        oauth_signature_method: caseConfig.oauthSignatureMethod,
                        oauth_consumer_key: caseConfig.oauthConsumerKey,
                        oauth_version: '1.0',
                        on_resume: '',
                        on_launch: 1,
                        on_login: '',
                        carrier: caseConfig['iosCarrier'],
                        devicename: 'iPhone4%2C1',
                        naive: 4,
                        token: '',
                        channel_id: 100,
                        os: caseConfig['iosOs'],
                        osver: caseConfig['iosOsVer'],
                        netstate: 'unknown',
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

