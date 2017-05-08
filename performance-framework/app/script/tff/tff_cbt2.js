/**
 * Created by yong.liu on 2015/6/29.
 */

var async = require('async');
var Tff = require('dena-client').tff.Tff;

var tff = new Tff();

//var actor = {}
//actor.actorId = 'a10000001';
//actor.debug = true;
//actor.server = {
//    host: '117.74.140.199',
//    port: 80
//}

var START = 'start';
var END = 'end';

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    INIT_ROLEINFO_OK: 1
}

var ActFlagType = {
    USER_MAIN_PAGE: 0,
    CARDS_SET_ALIGNMENT: 1,
    FORWARD_PRE_FORWARD: 2,
    FORWARD_FORWARD: 3,
    USER_NPC_INFO: 4,
    REWARD_ONCE_INDEX: 5,
    FORWARD_SWEEP: 6,
    FORWARD_GET_RECORD: 7,
    USER_GUIDE: 8,
    EQUIP_PUT_ON: 9,
    REWARD_ONCE_AWARD: 10,
    SHOP_SHOP_BUY: 11,
    COMMANDER_ROB: 12,
    CARDS_AUTO_LEVEL_UP: 13,
    EQUIP_AUTO_LEVEL_UP: 14,
    LOADING_FOR_TEST: 15,
    CARDS_OPEN: 16,
    GET_USER_SERVER_LIST: 17,
    CARDS_MIX: 18,
    NOTIFY_READ: 19,
    ARENA_INDEX: 20,
    GACHA_GET_GACHA: 21,
    WORLD_BOSS_INDEX: 22,
    EQUIP_LEVEL_UP: 23,
    REWARD_INDEX: 24,
    GACHA_GET_ALL_GACHA: 25,
    COMMANDER_INDEX: 26,
    REWARD_DAILY_AWARD: 27,
    COMMANDER_SEARCH: 28,
    ARENA_BATTLE: 29,
    DAILY_AWARD_ALL_REWARD: 30,
    EQUIP_AUTO_PUT_ON: 31,
    ACTIVE_FIGHT: 32,
    ACTIVE_MAP_FIGHT_AND_ENEMY: 33,
    ACTIVE_ACTIVE_INDEX: 34,
    CARDS_STEP_UP: 35,
    ALL_CONFIG: 36,
    COMBINER_LEAGUER_STEP_UP: 37,
    FORWARD_STAR_REWARD: 38,
    EXPEDITION_COMPLETE_STAGE: 39,
    EXPEDITION_BATTLE_INFO: 40
}

var monitor = function (type, name, reqId) {
    if (actor.debug) {
        console.info(Array.prototype.slice.call(arguments, 0));
        return;
    }

    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

tff.init(actor.server, function () {
    tff.run();
});

tff.actions.push(
    function () {
        async.series([], function (err) {
            tff.STATE = ROBOT_STATE.INIT_ROLEINFO_OK;
        });

    },

    function () {
        if (tff.STATE === ROBOT_STATE.INIT_ROLEINFO_OK) {
            tff.STATE = ROBOT_STATE.WAIT_ASYNC_OK;

            async.series([
                function (callback) {
                    console.log('user_main_page');
                    setTimeout(user_main_page, tff.getThinkTime(), callback);
                },
                function (callback) {
                    console.log('cards_set_alignment');
                    setTimeout(cards_set_alignment, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('forward_pre_forward');
                    setTimeout(forward_pre_forward, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('forward_forward');
                    setTimeout(forward_forward, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('user_npc_info');
                    setTimeout(user_npc_info, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('reward_once_index');
                    setTimeout(reward_once_index, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('forward_sweep');
                    setTimeout(forward_sweep, tff.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('forward_get_record');
                    setTimeout(forward_get_record, tff.getThinkTime(), callback);
                },
                //function (callback) {
                //    //console.log('cards_set_alignment');
                //    setTimeout(equip_put_on, tff.getThinkTime(), callback);
                //},
            ], function (err) {
                tff.STATE = ROBOT_STATE.INIT_ROLEINFO_OK;
            });
        }

        return 1;
    },

    function () {
        setTimeout(function () {
        }, tff.responseOverTime);
    }
);


function user_main_page(asyncCallback) {
    monitor(START, 'user.main_page', ActFlagType.USER_MAIN_PAGE);
    tff.get('/a0/api/', {'method': 'user.main_page', 'user_token': actor.actorId}, function (message) {
        if (message.code == 200) {
            monitor(END, 'user.main_page', ActFlagType.USER_MAIN_PAGE);
            asyncCallback();
        } else {
            console.log('user.main_page', message.code, message.body);
        }
    });
}

function cards_set_alignment(asyncCallback) {
    monitor(START, 'cards.set_alignment', ActFlagType.CARDS_SET_ALIGNMENT);
    tff.get('/a0/api/', {'method': 'cards.set_alignment', 'user_token': actor.actorId}, function (message) {
        if (message.code == 200) {
            monitor(END, 'cards.set_alignment', ActFlagType.CARDS_SET_ALIGNMENT);
            asyncCallback();
        } else {
            console.log('cards.set_alignment', message.code, message.body);
        }
    });
}

function forward_pre_forward(asyncCallback) {
    monitor(START, 'forward.pre_forward', ActFlagType.FORWARD_PRE_FORWARD);
    tff.get('/a0/api/',
        {
            'method': 'forward.pre_forward',
            'user_token': actor.actorId,
            'stage_step': 0,
            'chapter': 1,
            'diffculty_step': 0,
            'page': 1
        },
        function (message) {
            if (message.code == 200) {
                monitor(END, 'forward.pre_forward', ActFlagType.FORWARD_PRE_FORWARD);
                asyncCallback();
            } else {
                console.log('forward.pre_forward', message.code, message.body);
            }
        });
}

function forward_forward(asyncCallback) {
    monitor(START, 'forward.forward', ActFlagType.FORWARD_FORWARD);
    tff.get('/a0/api/',
        {
            'method': 'forward.forward',
            'user_token': actor.actorId,
            'stage_step': 0,
            'chapter': 1,
            'diffculty_step': 0,
            'page': 0,
            'is_win': 1

        },
        function (message) {
            if (message.code == 200) {
                monitor(END, 'forward.forward', ActFlagType.FORWARD_FORWARD);
                asyncCallback();
            } else {
                console.log('forward.forward', message.code, message.body);
            }
        });
}

function user_npc_info(asyncCallback) {
    monitor(START, 'user.npc_info', ActFlagType.USER_NPC_INFO);
    tff.get('/a0/api/', {'method': 'user.npc_info', 'user_token': actor.actorId}, function (message) {
        if (message.code == 200) {
            monitor(END, 'user.npc_info', ActFlagType.USER_NPC_INFO);
            asyncCallback();
        } else {
            console.log('user.npc_info', message.code, message.body);
        }
    });
}

function reward_once_index(asyncCallback) {
    monitor(START, 'reward.once_index', ActFlagType.REWARD_ONCE_INDEX);
    tff.get('/a0/api/', {'method': 'reward.once_index', 'user_token': actor.actorId}, function (message) {
        if (message.code == 200) {
            monitor(END, 'reward.once_index', ActFlagType.REWARD_ONCE_INDEX);
            asyncCallback();
        } else {
            console.log('reward.once_index', message.code, message.body);
        }
    });
}

function forward_sweep(asyncCallback) {
    monitor(START, 'forward.sweep', ActFlagType.FORWARD_SWEEP);
    tff.get('/a0/api/',
        {
            'method': 'forward.sweep',
            'user_token': actor.actorId,
            'stage_step': 0,
            'chapter': 1,
            'diffculty_step': 0,
            'times': 1
        },
        function (message) {
            if (message.code == 200) {
                monitor(END, 'forward.sweep', ActFlagType.FORWARD_SWEEP);
                asyncCallback();
            } else {
                console.log('forward.sweep', message.code, message.body);
            }
        });
}

function forward_get_record(asyncCallback) {
    monitor(START, 'forward.get_record', ActFlagType.FORWARD_GET_RECORD);
    tff.get('/a0/api/',
        {
            'method': 'forward.get_record',
            'user_token': actor.actorId,
            'chapter': 1
        },
        function (message) {
            if (message.code == 200) {
                monitor(END, 'forward.get_record', ActFlagType.FORWARD_GET_RECORD);
                asyncCallback();
            } else {
                console.log('forward.get_record', message.code, message.body);
            }
        });
}

function equip_put_on(asyncCallback) {
    monitor(START, 'equip.put_on', ActFlagType.EQUIP_PUT_ON);
    tff.get('/a0/api/', {'method': 'equip.put_on', 'user_token': actor.actorId}, function (message) {
        if (message.code == 200) {
            monitor(END, 'equip.put_on', ActFlagType.EQUIP_PUT_ON);
            asyncCallback();
        } else {
            console.log('equip.put_on', message.code, message.body);
        }
    });
}