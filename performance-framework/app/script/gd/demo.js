var Client = require('dena-client').gd;
var async = require('async');

var robot = new Client();

var START = 'start';
var END = 'end';

//robot.init({host: '10.96.38.10', port: 80}, function () {
robot.init({host: 'gundam.kr.beta2.mobage.tw', port: 80}, function () {
    robot.run();
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

robot.actions.push(
    function () {
        robot.caseData.account_id = String(actor.actorId + 10000);
        setTimeout(function () {
            robot.httpRequest(robot.prepath,
                {
                    command: 'User',
                    action: 'UserLoginCheck',
                    account_id: robot.caseData.account_id,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.user_id = data['feedback']['msg101']['user_id'];
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
            robot.httpRequest(robot.prepath,
                {
                    command: 'User',
                    action: 'GetUserInfo',
                    user_id: robot.caseData.user_id,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id
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
        //return 1;
    },

    function () {
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest(robot.prepath,
                {
                    command: 'StaminaPurch',
                    action: 'RefreshStaminaPurchInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
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
        if (!robot.caseData.previous) {
            return 1;
        }
        robot.caseData.previous = false;
        setTimeout(function () {
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'GetArenaInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
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
            robot.httpRequest(robot.prepath,
                {
                    command: 'Robot',
                    action: 'GetRobotList',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.robot_id = data['feedback']['msg601']['user_robot_list'][0]['id'];
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
            robot.httpRequest(robot.prepath,
                {
                    command: 'Fb',
                    action: 'FbFight',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                    fb_id: '01110'
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

        if (!!robot.caseData.previous) {

            robot.caseData.previous = false;
            robot.funcseries = [];
            if (robot.caseData.ratemode) {
                robot.funcmap = {
                    getRollNotice: {funcArray: [getRollNotice], rate: 270},
                    RefreshStaminaPurchInfo: {funcArray: [RefreshStaminaPurchInfo], rate: 145},
                    GetSkillPoint: {funcArray: [GetSkillPoint], rate: 110},
                    MineFight: {funcArray: [MatchTarget, MineFight], rate: 75},
                    FbFight: {funcArray: [refreshEliteFbCount, fbfight, getFbAward, GetFbSweepAward], rate: 65},
                    GetUserListInfo: {funcArray: [GetUserListInfo], rate: 50},
                    RefreshBattleList: {funcArray: [RefreshBattleList], rate: 50},
                    SearchHaroItem: {funcArray: [SearchHaroItem], rate: 45},
                    KrGacha: {funcArray: [KrGacha], rate: 35},
                    getChatPersonal: {funcArray: [getChatPersonal], rate: 30},
                    GetDailyTaskInfo: {funcArray: [GetDailyTaskInfo], rate: 30},
                    GetArenaInfo: {funcArray: [GetArenaInfo], rate: 30},
                    SaveArenaBattleInfo: {funcArray: [SaveArenaBattleInfo], rate: 20},
                    PreCreateUser: {funcArray: [PreCreateUser], rate: 10},
                    getUserInfo: {funcArray: [getUserInfo, userLoginInit], rate: 10},
                    PurchCoin: {funcArray: [PurchCoin, KrGachaInfo], rate: 10},
                    RobotDiscussList: {
                        funcArray: [RobotDiscussList, RobotDiscussRemove, RobotDiscussComment, RobotDiscussList],
                        rate: 5
                    },
                    GetExpeditionInfo: {funcArray: [GetExpeditionInfo, GetStageInfo], rate: 10},
                    GetItemList: {funcArray: [GetItemList, BuyItemId, SellItem], rate: 5},
                    SendChatWorld: {funcArray: [SendChatWorld, GetChatWorld], rate: 5},
                    SendChatPersonal: {funcArray: [SendChatPersonal, getChatPersonal], rate: 5},
                    getDriverInfo: {funcArray: [getDriverInfo], rate: 5},
                    ViewRankingListCurrent: {funcArray: [ViewRankingListCurrent], rate: 5},
                    GetTaskList: {funcArray: [GetTaskList], rate: 5},

                };

                robot.willTest = [];
                robot.endRate = 1375;
                var i = 0;
                while (i <= 10) {
                    for (var k in robot.funcmap) {
                        var rate = getRandomInt(1, robot.endRate);
                        if (robot.caseData.debug) {
                            console.log('rate is <%s> and k.rate is <%s> ', rate, robot.funcmap[k].rate);
                        }
                        if (rate <= robot.funcmap[k].rate) {
                            robot.willTest = robot.willTest.concat(robot.funcmap[k].funcArray);
                        }
                    }
                    if (robot.willTest.length) {
                        if (robot.caseData.debug) {
                            console.log('Random <%s> time(s)', i);
                        }
                        break;
                    }
                    i++;
                }

                if (robot.caseData.debug) {
                    console.log('robot.willTest is ', robot.willTest.length)
                }
                robot.funcArray = robot.willTest;
            } else {
                robot.funcArray =
                    [
                        PreCreateUser,
                        getUserInfo,
                        userLoginInit,
                        PurchCoin,
                        KrGachaInfo,
                        KrGacha,
                        RobotDiscussList,
                        RobotDiscussRemove,
                        RobotDiscussComment,
                        RobotDiscussList,
                        SaveArenaBattleInfo,
                        RefreshStaminaPurchInfo,
                        GetArenaInfo,
                        getRollNotice,
                        GetExpeditionInfo,
                        GetStageInfo,
                        MatchTarget,
                        MineFight,
                        GetUserListInfo,
                        BuyItemId,
                        SellItem,
                        SendChatWorld,
                        GetChatWorld,
                        getChatPersonal,
                        SendChatPersonal,
                        SearchHaroItem,
                        GetDailyTaskInfo,
                        getDriverInfo,
                        GetSkillPoint,
                        GetItemList,
                        ViewRankingListCurrent,
                        GetTaskList,
                        refreshEliteFbCount,
                        fbfight,
                        getFbAward,
                        GetFbSweepAward
                    ];
            }

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

        function PreCreateUser(callback) {

            monitor(START, 'PreCreateUser', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'PreCreate',
                    action: 'PreCreateUser',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    DeviceType: 8,
                    eventid: 7,
                    status: 100,
                    nettype: 1,
                    devicetype: 'iPhone',
                    system: '8.0.2',
                    deviceid: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'PreCreateUser', '1');
                        callback();
                    } else {
                        console.log(status, data);
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
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
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

        function PurchCoin(callback) {
            monitor(START, 'PurchCoin', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'CoinPurch',
                    action: 'PurchCoin',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                    count: 1
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'PurchCoin', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetUserListInfo(callback) {
            monitor(START, 'GetUserListInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'GetUserListInfo',
                    user_id_list: JSON.stringify({"1": 100100279694}),
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetUserListInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }



























        function GetUserMine(callback) {
            monitor(START, 'GetUserMine', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Mine',
                    action: 'GetUserMine',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetUserMine', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function MatchTarget(callback) {
            monitor(START, 'MatchTarget', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Mine',
                    action: 'MatchTarget',
                    mine_type: 4,
                    mine_quality: 4,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        robot.caseData.mineInfo = data['feedback']['msg904']['userdata_list'];
                        monitor(END, 'MatchTarget', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function MineFight(callback) {
            monitor(START, 'MineFight', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Mine',
                    action: 'Fight',
                    user_mine_id: robot.caseData.mineInfo[0]['mine_id'],
                    target_id: robot.caseData.mineInfo[1]['user_id'],
                    target_mine_id: robot.caseData.mineInfo[1]['mine_id'],
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.mineInfo[0]['user_id']
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'MineFight', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetExpeditionInfo(callback) {
            monitor(START, 'GetExpeditionInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Expedition',
                    action: 'GetExpeditionInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetExpeditionInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetStageInfo(callback) {
            monitor(START, 'GetStageInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Expedition',
                    action: 'GetStageInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetStageInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetArenaInfo(callback) {
            monitor(START, 'GetArenaInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'GetArenaInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetArenaInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetChatWorld(callback) {
            monitor(START, 'GetChatWorld', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Chat',
                    action: 'GetChatWorld',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetChatWorld', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function SendChatWorld(callback) {
            monitor(START, 'SendChatWorld', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Chat',
                    action: 'SendChatWorld',
                    content: 'I am ' + robot.caseData.user_id + ' coming...!',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'SendChatWorld', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }


        function KrGachaInfo(callback) {
            monitor(START, 'KrGachaInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Gacha',
                    action: 'KrGachaInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'KrGachaInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function KrGacha(callback) {
            monitor(START, 'KrGacha', 'KrGacha');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Gacha',
                    action: 'KrGacha',
                    gacha_type: 3,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'KrGacha', 'KrGacha');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function userLoginInit(callback) {
            monitor(START, 'UserLoginInit', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'User',
                    action: 'UserLoginInit',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'UserLoginInit', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function getDriverInfo(callback) {
            monitor(START, 'GetDriverInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Driver',
                    action: 'GetDriverInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetDriverInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetInfo(callback) {
            monitor(START, 'GetInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'DailyTask',
                    action: 'GetInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetSkillPoint(callback) {
            monitor(START, 'GetSkillPoint', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Skill',
                    action: 'GetSkillPoint',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetSkillPoint', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function RobotDiscussList(callback) {
            monitor(START, 'RobotDiscussList', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'RobotDiscuss',
                    action: 'RobotDiscussList',
                    robot_id: 1005,
                    mode: 1,
                    nextpage: 1,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RobotDiscussList', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function RobotDiscussPraise(callback) {
            monitor(START, 'RobotDiscussPraise', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'RobotDiscuss',
                    action: 'RobotDiscussPraise',
                    robot_id: 1005,
                    to_id: robot.caseData.user_id,
                    option: 1,
                    version: 2045, //robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RobotDiscussPraise', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function RobotDiscussComment(callback) {
            monitor(START, 'RobotDiscussComment', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'RobotDiscuss',
                    action: 'RobotDiscussComment',
                    robot_id: 1005,
                    comment: 'Very good!',
                    version: 2045, //robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RobotDiscussComment', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }


        function RobotDiscussRemove(callback) {
            monitor(START, 'RobotDiscussRemove', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'RobotDiscuss',
                    action: 'RobotDiscussRemove',
                    robot_id: 1005,
                    version: 2045, //robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RobotDiscussRemove', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function RefreshBattleList(callback) {
            monitor(START, 'RefreshBattleList', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'RefreshBattleList',
                    is_cd: 0,
                    Retry: 1,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RefreshBattleList', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetItemList(callback) {
            monitor(START, 'GetItemList', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Shop',
                    action: 'GetItemList',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                    shop_type: 4
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetItemList', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function getRollNotice(callback) {
            monitor(START, 'getRollNotice', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'RollNotice',
                    action: 'GetRollNotice',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'getRollNotice', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function RefreshStaminaPurchInfo(callback) {
            monitor(START, 'RefreshStaminaPurchInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'StaminaPurch',
                    action: 'RefreshStaminaPurchInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'RefreshStaminaPurchInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function refreshEliteFbCount(callback) {
            monitor(START, 'refreshEliteFbCount', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Fb',
                    action: 'RefreshEliteFbCount',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                    fb_id: '01110'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'refreshEliteFbCount', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function getChatPersonal(callback) {
            monitor(START, 'getChatPersonal', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Chat',
                    action: 'GetChatPersonal',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'getChatPersonal', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function SendChatPersonal(callback) {
            monitor(START, 'SendChatPersonal', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Chat',
                    action: 'SendChatPersonal',
                    send_content: 'I miss you ' + robot.caseData.user_id + '!',
                    send_id: robot.caseData.user_id,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'SendChatPersonal', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function BuyItemId(callback) {
            monitor(START, 'BuyItemId', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Shop',
                    action: 'BuyItemId',
                    item_count: 1,
                    item_id: 300320,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'BuyItemId', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function SellItem(callback) {
            monitor(START, 'SellItem', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Package',
                    action: 'SellItem',
                    item_num: 1,
                    item_type: 300320,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'SellItem', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function SearchHaroItem(callback) {
            monitor(START, 'SearchHaroItem', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Grab',
                    action: 'SearchHaroItem',
                    item_type: 500742,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'SearchHaroItem', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }


        function GetDailyTaskInfo(callback) {
            monitor(START, 'GetDailyTaskInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'DailyTask',
                    action: 'GetDailyTaskInfo',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetDailyTaskInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function SaveArenaBattleInfo(callback) {
            monitor(START, 'SaveArenaBattleInfo', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'SaveBattleInfo',
                    is_win: 1,
                    target_rank: 8,
                    battle_info: JSON.stringify({
                        "battle_type": 1,
                        "attack_userid": 100100279694,
                        "attack_icon": 0,
                        "attack_name": "W0dNXea1i%2BivlTI%3D",
                        "attack_level": 60,
                        "attack_robots": "100100279694,30470,1001,1,0,9,1,14653,0,0,0,0,0,0,1,1,1,1,1,1,743,20,0,0,0,0,0,;100100279694,1027867,1020,1,0,9,5,0,0,0,0,0,0,0,1,1,1,1,0,0,833,20,0,0,0,0,0,;100100279694,1027868,1030,60,0,9,5,0,0,0,0,0,0,0,1,1,1,1,0,0,2790,20,0,0,0,0,0,;",
                        "attack_drivers": "14653,100100279694,30470,9001,1,0,1,3,0,0,0,0,0,0,84,1471232547,0,1,0,0,0,0;",
                        "attack_haros": "",
                        "attack_leader": 0,
                        "attack_talent": "",
                        "attack_random": 32,
                        "defend_userid": 100100279627,
                        "defend_icon": 0,
                        "defend_name": "W0dNXea1i%2BivlTE%3D",
                        "defend_level": 60,
                        "defend_robots": "100100279627,30469,1001,60,0,9,5,14652,0,0,0,0,0,0,1,1,1,1,1,1,2238,20,0,0,0,0,0,;",
                        "defend_drivers": "14652,100100279627,30469,9001,1,0,1,3,0,0,0,0,0,0,84,1471232547,0,1,0,0,0,0;",
                        "defend_haros": "",
                        "defend_leader": 30469,
                        "defend_talent": "",
                        "defend_random": 14,
                        "map_id": "90083"
                    }),
                    check_info: 1,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'SaveArenaBattleInfo', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function ViewRankingListCurrent(callback) {
            monitor(START, 'ViewRankingListCurrent', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Arena',
                    action: 'ViewRankingListCurrent',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'ViewRankingListCurrent', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetTaskList(callback) {
            monitor(START, 'GetTaskList', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Task',
                    action: 'GetTaskList',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetTaskList', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function fbfight(callback) {
            monitor(START, 'FbFight', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Fb',
                    action: 'FbFight',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    user_id: robot.caseData.user_id,
                    fb_id: '01110'
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'FbFight', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function getFbAward(callback) {
            monitor(START, 'GetFbAward', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Fb',
                    result: 1,
                    action: 'GetFbAward',
                    user_id: robot.caseData.user_id,
                    fb_id: '01110',
                    robot_count: 1,
                    dead_robot_count: 0,
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    robot0: robot.caseData.robot_id
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetFbAward', '1');
                        callback();
                    } else {
                        console.log(status, data);
                    }
                }
            );
        }

        function GetFbSweepAward(callback) {
            monitor(START, 'GetFbSweepAward', '1');
            robot.httpRequest(robot.prepath,
                {
                    command: 'Fb',
                    action: 'GetFbSweepAward',
                    user_id: robot.caseData.user_id,
                    fb_id: '01110',
                    version: robot.caseData.version,
                    platform_id: robot.caseData.platform_id,
                    sweep_count: 1
                },
                function (status, data) {
                    if (status == 200) {
                        monitor(END, 'GetFbSweepAward', '1');
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

