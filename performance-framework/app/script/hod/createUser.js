/**
 * Created by yong.liu on 2015/5/7.
 */

var robotClient = require('dena-client').hodClient;
var Robot = robotClient.robot;

var robot = new Robot();
var appId = '460434087334456';

var START = 'start';
var END = 'end';

robot.init({host: '54.223.143.34', port: 1337}, function () {
    robot.run();
});

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
var monitorStep = {
    'EFCheckTableCrc' : true,
    'EFUserLogin': true
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
        robot.caseData.userNo = String(randomIntInc(1111111111, 9999999999));

        robot.httpRequest('EFClientLogin',
            {
                'appId': appId,
                'appSecretKey': '0000',
                'version': 1,
                'deviceId': 'Bot',
                'os': 'IOS',
                'language': 'ENG'
            },
            function (status, data) {
                if (status == 200) {

                    robot.caseData.appSessionKey = data['appSessionKey'];
                    robot.caseData.previous = true;
                } else {
                    console.log(status, data);
                }
            }
        );
    },

    function () {
        if (!robot.caseData.previous){
            return 1;
        }
        robot.caseData.previous = false;
        if (monitorStep.EFCheckTableCrc){
            monitor(START,'EFCheckTableCrc','EFCheckTableCrc');
        }
        robot.httpRequest('EFCheckTableCrc',
            {
                'appSessionKey': robot.caseData.appSessionKey,
                'items': [],
                'platform': 'mobage',
                'userSessionKey': robot.caseData.userNo,
                'accessToken': '',
                'majorVersion': 1,
                'clientVersion': 2.0,
                'language': 'ENG'
            },
            function (status, data) {
                if (status == 200) {
                    if (monitorStep.EFCheckTableCrc){
                        monitor(END,'EFCheckTableCrc','EFCheckTableCrc');
                    }
                    robot.caseData.previous = true;
                } else {
                    console.log(status, data);
                }
            }
        );
    },

    function () {
        if (!robot.caseData.previous){
            return 1;
        }
        robot.caseData.previous = false;
        if (monitorStep.EFUserLogin){
            monitor(START,'EFUserLogin','EFUserLogin');
        }
        robot.httpRequest('EFUserLogin',
            {
                'appSessionKey'  : robot.caseData.appSessionKey,
                'items'          : [],
                'platform'       : 'mobage',
                'userSessionKey' : robot.caseData.userNo,
                'accessToken'    : '',
                'majorVersion'   : 1,
                'clientVersion'  : 2.0,
                'language'       : 'ENG'
            },
            function (status, data) {
                if (status == 200) {
                    if (monitorStep.EFUserLogin){
                        monitor(END,'EFUserLogin','EFUserLogin');
                    }
                    robot.caseData.previous = true;
                } else {
                    console.log(status, data);
                }
            }
        );
    },

    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFRegisterMember',
    //        {
    //            'appSessionKey'  : robot.caseData['appSessionKey'],
    //            'platform'       : 'mobage',
    //            'userSessionKey' : robot.caseData.userNo,
    //            'accessToken'    : '',
    //            'userNo'         : robot.caseData.userNo,
    //            'nick'           : robot.caseData.userNo
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFUserLogin',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'items'          : [],
    //            'platform'       : 'mobage',
    //            'userSessionKey' : robot.caseData.userNo,
    //            'accessToken'    : '',
    //            'majorVersion'   : 1,
    //            'clientVersion'  : 2.0,
    //            'language'       : 'ENG'
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFChooseWorld',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'items'          : [],
    //            'platform'       : 'mobage',
    //            'userSessionKey' : robot.caseData.userNo,
    //            'accessToken'    : '',
    //            'majorVersion'   : 1,
    //            'clientVersion'  : 2.0,
    //            'wid'            : robot.caseData.wid,
    //            'language'       : 'ENG'
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    if (monitorStep.EFGetUserData){
    //        monitor(START, 'EFGetUserData', 'EFGetUserData');
    //    }
    //    robot.httpRequest('EFGetUserData',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'language '      : 'ENG',
    //            'utcOffset'      : 8,
    //            'wid'            : robot.caseData.wid
    //        },
    //        function (status, data) {
    //            if (monitorStep.EFGetUserData) {
    //                monitor(END, 'EFGetUserData', 'EFGetUserData');
    //            }
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //    //return 1;
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFUpdateNick',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'nick'           : '战神' + robot.caseData.userNo,
    //            'wid'            : robot.caseData.wid
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.charIdx = parseInt('1000' + String(randomIntInc(1,7)));
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFCreateCharacter',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'wid'            : robot.caseData.wid,
    //            'charIdx'        : robot.caseData.charIdx,
    //            'currency'       : 1,
    //            'callMeDaddy '   : 1
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    robot.httpRequest('EFGetUserData',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'language '      : 'ENG',
    //            'utcOffset'      : 8,
    //            'wid'            : robot.caseData.wid
    //        },
    //        function (status, data) {
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //                robot.caseData.defaultCharGid = data.account.defaultCharGid;
    //                robot.caseData.uuid = data.account.uuid;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},
    //
    //function () {
    //    if (!robot.caseData.previous){
    //        return 1;
    //    }
    //    robot.caseData.previous = false;
    //    var uptValues = [
    //        {'key'     : 'set_gold',
    //            'value1'  : 999999,
    //            'charGid' : robot.caseData.defaultCharGid
    //        },
    //        {'key'     : 'set_diamond',
    //            'value1'  : 999999,
    //            'charGid' : robot.caseData.defaultCharGid
    //        },
    //        {'key'     : 'set_character_level',
    //            'value1'  : 35,
    //            'charGid' : robot.caseData.defaultCharGid
    //        }];
    //    if (monitorStep.EFUpdateMyData) {
    //        monitor(START, 'EFUpdateMyData', 'EFUpdateMyData');
    //    }
    //    robot.httpRequest('EFUpdateMyData',
    //        {
    //            'appSessionKey'  : robot.caseData.appSessionKey,
    //            'userType'       : 3,
    //            'uptDatas'       : uptValues,
    //            'wid'            : robot.caseData.wid,
    //            'sessionKey'     : robot.caseData.charIdx,
    //            'userValue'      : robot.caseData.uuid
    //        },
    //        function (status, data) {
    //            if (monitorStep.EFUpdateMyData) {
    //                monitor(END, 'EFUpdateMyData', 'EFUpdateMyData');
    //            }
    //            if (status == 200) {
    //                robot.caseData.previous = true;
    //            } else {
    //                console.log(status, data);
    //            }
    //        }
    //    );
    //},

    function () {
        setTimeout(function () {
            console.log('end...');
        }, robot.responseOverTime);
    }
);

