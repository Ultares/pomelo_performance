/**
 * Created by yong.liu on 2015/5/7.
 */

var NbaClient = require('dena-client').nbaClient;
var Nba = NbaClient.Nba;

var START = 'start';
var END = 'end';

var ActFlagType = {
    CHECKIN_TEST_WUID: 1
}

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

var ROBOT_STATE = {
    WAIT_SETTIMEOUT: 0,    // 配合 setTimeout 函数使用
    CHECKIN_OK: 1,

    // Error_Code_S
    EC_PLAYSTRNOTENOUGH: 100
}

var nba = new Nba();

nba.init({host: '54.223.188.32', port: 8600}, function () {
    nba.run();
});

nba.actions.push(
    function () {
        monitor(START, 'checkin_test_wuid', ActFlagType.CHECKIN_TEST_WUID);
        nba.request('/checkin/test/wuid',
            {
                'wuid': 15261414188358,
                'adminnum': 'denanba',
                'adminhash': 'yueruqianwan'
            },
            function (message) {
                console.log(message);
                monitor(END, 'checkin_test_wuid', ActFlagType.CHECKIN_TEST_WUID);
                nba.customValue.STATE = ROBOT_STATE.CHECKIN_OK;
            }
        );
    },

    function () {
        setTimeout(function () {
            console.log('end...');
        }, nba.responseOverTime);
    }
)