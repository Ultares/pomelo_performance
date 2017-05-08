var Client = require('dena-client').fifa;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

robot.init({host: 'fifaweb01.mobage.cn', port: 80}, function () {
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
        robot.caseData.account_id = String(actor.actorId);
        setTimeout(function () {
            robot.httpRequest('/S1/user/role?',
                {
                    oid: 'test-'+actor.actorId,
                    pf: 'test',
                    msgid: 1002

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
        setTimeout(function () {
            robot.httpRequest('/S1/debug/login?',
                {
                    oid: 'test-'+actor.actorId,
                    pf: 'test',
                    msgid: 1002
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.previous = true;
                        robot.caseData.id = data.data.id;
                        robot.headers.Cookie = 'sessid=' + robot.caseData.id;
                    } else {
                        console.log(status, data);
                    }
                    1
                }
            );
        }, robot.randomIntTime());
        //return 1;
    },

    function () {
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest('/S1/user/info?',
                {
                    key: 'info'
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.previous = true;
                    } else {
                        console.log(status, data);
                    }
                }
            )
        }, robot.randomIntTime());
    },

    function () {

        if (!!robot.caseData.previous) {

            robot.caseData.previous = false;
            robot.funcseries = [];

            robot.funcArray =
                [
                    gameServer,
                    dayTaskInfo,
                    activeInfo,
                    friendFl,
                    friendRfl,
                    investData,
                    hotelRows,
                    hotelStart,
                    leagueInfo,
                    coachGetCoachInfo,
                    coachGetFameRewardInfo,
                    raidEnter,
                    raidInfo,
                    raidStart,
                    raidResult,
                    raiddfInfo,
                    ladderInfo,
                    ladderSort,
                    ladderJoin,
                    ladderWait,
                    ladderQuit
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

        function activeInfo(callback) {

            monitor(START, 'active/info', '1');
            robot.httpRequest('/S1/active/info?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'active/info', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ladderInfo(callback) {

            monitor(START, 'ladder/info', '1');
            robot.httpRequest('/S1/ladder/info?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ladder/info', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ladderSort(callback) {

            monitor(START, 'ladder/sort', '1');
            robot.httpRequest('/S1/ladder/sort?',
                {
                    page: 1,
                    size: 20
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ladder/sort', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ladderJoin(callback) {

            monitor(START, 'ladder/join', '1');
            robot.httpRequest('/S1/ladder/join?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ladder/join', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ladderWait(callback) {

            monitor(START, 'ladder/wait', '1');
            robot.httpRequest('/S1/ladder/wait?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ladder/wait', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ladderQuit(callback) {

            monitor(START, 'ladder/quit', '1');
            robot.httpRequest('/S1/ladder/quit?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ladder/quit', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function dayTaskInfo(callback) {

            monitor(START, 'dayTask/info', '1');
            robot.httpRequest('/S1/dayTask/info?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'dayTask/info', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function gameServer(callback) {

            monitor(START, 'game/server', '1');
            robot.httpRequest('/S1/game/server?',
                {
                    page: 1,
                    size: 5
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'game/server', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function friendRfl(callback) {

            monitor(START, 'friend/rfl', '1');
            robot.httpRequest('/S1/friend/rfl?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'friend/rfl', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function investData(callback) {

            monitor(START, 'invest/data', '1');
            robot.httpRequest('/S1/invest/data?',
                {},
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.hotelIds = data.data;
                        monitor(END, 'invest/data', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function hotelRows(callback) {

            monitor(START, 'hotel/rows', '1');
            robot.httpRequest('/S1/hotel/rows?',
                {},
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.hotelIds = data.data;
                        monitor(END, 'hotel/rows', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function hotelStart(callback) {

            monitor(START, 'hotel/start', '1');
            robot.httpRequest('/S1/hotel/start?',
                {
                    id: robot.caseData.hotelIds[0]['_id']
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'hotel/start', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function friendFl(callback) {

            monitor(START, 'friend/fl', '1');
            robot.httpRequest('/S1/friend/fl?',
                {
                    page: 1,
                    size: 5
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'friend/fl', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function leagueInfo(callback) {

            monitor(START, 'league/info', '1');
            robot.httpRequest('/S1/league/info?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'league/info', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function coachGetCoachInfo(callback) {

            monitor(START, 'coach/getCoachInfo', '1');
            robot.httpRequest('/S1/coach/getCoachInfo?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'coach/getCoachInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function coachGetFameRewardInfo(callback) {

            monitor(START, 'coach/getFameRewardInfo', '1');
            robot.httpRequest('/S1/coach/getFameRewardInfo?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'coach/getFameRewardInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function raidEnter(callback) {

            monitor(START, 'raid/enter', '1');
            robot.httpRequest('/S1/raid/enter?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'raid/enter', '1');
                        robot.caseData.raidId = 1;
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function raidInfo(callback) {

            monitor(START, 'raid/info', '1');
            robot.httpRequest('/S1/raid/info?',
                {
                    id: robot.caseData.raidId
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'raid/info', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function raidStart(callback) {

            monitor(START, 'raid/start', '1');
            robot.httpRequest('/S1/raid/start?',
                {
                    id: robot.caseData.raidId
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'raid/start', '1');
                        robot.caseData.raidAct = data.data.ranArr;
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function raidResult(callback) {

            monitor(START, 'raid/result', '1');
            robot.httpRequest('/S1/raid/result?',
                {
                    id: robot.caseData.raidId,
                    score: '1:0',
                    act:   [37,89],  //robot.caseData.raidAct,
                    sign: '123'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'raid/result', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function raiddfInfo(callback) {

            monitor(START, 'raiddf/info', '1');
            robot.httpRequest('/S1/raiddf/info?',
                {},
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'raiddf/info', '1');
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

