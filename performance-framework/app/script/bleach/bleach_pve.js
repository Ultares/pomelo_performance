/**
 * Created by yong.liu on 2015/5/18.
 */

var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var Bleach = require('dena-client').bleach.Bleach;
var Protobuf = require('dena-client').bleach.Protobuf;

var START = 'start';
var END = 'end';

var ActFlagType = {
    LOGIN_LOGIN: 0,
    LOGIN_GATEW: 1,
    CREATE_ROLE: 2,
    SELECT_ROLE_ONLINE: 3,
    SCENE_ENTERCOPY_C: 4,
    SCENE_EXITCOPY_C: 5,
    FIGHT_CHANGESWORD_C: 6
}

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        //console.error(Array.prototype.slice.call(arguments, 0));
    }
}

/////////////////////////////////////////////////////////////

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,    // 配合 setTimeout 函数使用
    CONNECT_GATEW_OK: 1,
    GET_ROLELIST_OK: 2,
    GET_ROLEINFO_OK: 3,
    INIT_ROLEINFO_OK: 4,
    INIT_SWORDLIST_OK: 5
}

var bleach = new Bleach();

bleach.connect(actor.server, function () {
    console.log('tcp-socket connect to loginserver!');
    bleach.run();
});

bleach.actions.push(
    function () {
        // TICK_CMD
        bleach.register(Protobuf.basetype.EProtoId.TICK_CMD,
            function (message) {
                bleach.request(Protobuf.basetype.EProtoId.TICK_CMD);
            }
        );

        // ERROR_CODE_S
        bleach.register(Protobuf.basetype.EProtoId.ERROR_CODE_S,
            function (message) {
                var messageErrorCode = Protobuf.errorcode.MessageErrorCode.decode(message);

                switch (messageErrorCode.code) {
                    default:
                        console.log('Actor %s Error_Code_S code : %s.', actor.actorId, messageErrorCode.code.toString(16));
                }
            }
        );
    },

    function () {
        // 验证
        bleach.request(Protobuf.basetype.EProtoId.VERIFY_VERSION,
            Protobuf.login.VerifyVersion.encode({
                clientversion: 1
            })
        );

        // 登陆 LoginServer 获取网关
        monitor(START, 'loginLogin', ActFlagType.LOGIN_LOGIN);
        bleach.request(Protobuf.basetype.EProtoId.LOGIN_LOGIN_REQ,
            Protobuf.login.LoginReq.encode({
                accountid: actor.actorId
            }),
            Protobuf.basetype.EProtoId.LOGIN_LOGIN_RET,
            function (message) {
                monitor(END, 'loginLogin', ActFlagType.LOGIN_LOGIN);
                bleach.loginRet = Protobuf.login.LoginRet.decode(message);

                bleach.close();
                bleach.connect({
                    port: bleach.loginRet.gatewayport,
                    host: bleach.loginRet.gatewayip
                }, function () {
                    console.log('tcp-socket connect to gatewayserver!');
                    bleach.STATE = ROBOT_STATE.CONNECT_GATEW_OK;
                });
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.CONNECT_GATEW_OK)
            return 1

        // 登陆网关
        monitor(START, 'loginGatew', ActFlagType.LOGIN_GATEW);
        bleach.request(Protobuf.basetype.EProtoId.LOGIN_GATEW_REQ,
            Protobuf.login.LoginGatewayReq.encode({
                accountid: bleach.loginRet.accountid,
                token: bleach.loginRet.token
            }),
            Protobuf.basetype.EProtoId.LOGIN_GATEW_RET,
            function (message) {
                monitor(END, 'loginGatew', ActFlagType.LOGIN_GATEW);
            }
        );

        // SEND_ROLE_LIST
        bleach.register(Protobuf.basetype.EProtoId.SEND_ROLE_LIST,
            function (message) {
                bleach.roleList = Protobuf.role.RoleList.decode(message);

                if (bleach.roleList.rolebase.length) {
                    bleach.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                } else {
                    monitor(START, 'createRole', ActFlagType.CREATE_ROLE);
                    bleach.request(Protobuf.basetype.EProtoId.CREATE_ROLE_REQ,
                        Protobuf.role.CreateRoleReq.encode({
                            roletype: [11103000, 11104000][random.integer(0, 1)],
                            rolename: uuid.v1().replace(/-/g, ''),
                            sex: 0
                        }),
                        Protobuf.basetype.EProtoId.CREATE_ROLE_RET,
                        function (message) {
                            monitor(END, 'createRole', ActFlagType.CREATE_ROLE);
                            bleach.roleList.rolebase.push(Protobuf.role.CreateRoleRet.decode(message).rolebase);
                            bleach.STATE = ROBOT_STATE.GET_ROLELIST_OK;
                        }
                    );
                }
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.GET_ROLELIST_OK)
            return 1

        // 选角登陆
        monitor(START, 'selectRoleOnline', ActFlagType.SELECT_ROLE_ONLINE);
        bleach.request(Protobuf.basetype.EProtoId.SELECT_ROLE_ONLINE,
            Protobuf.role.SelectRoleOnline.encode({
                roleid: bleach.roleList.rolebase[0].roleid
            })
        );

        // SCENE_ENTERSCENE_S
        bleach.register(Protobuf.basetype.EProtoId.SCENE_ENTERSCENE_S,
            function (message) {
                monitor(END, 'selectRoleOnline', ActFlagType.SELECT_ROLE_ONLINE);
                bleach.unregister(Protobuf.basetype.EProtoId.SCENE_ENTERSCENE_S);
            }
        );

        // SEND_ROLE_DATA
        bleach.register(Protobuf.basetype.EProtoId.SEND_ROLE_DATA,
            function (message) {
                bleach.sendRoleData = Protobuf.role.SendRoleData.decode(message);
            }
        );

        // SEND_BLADE_LIST
        bleach.register(Protobuf.basetype.EProtoId.SEND_BLADE_LIST,
            function (message) {
                bleach.sendBladeList = Protobuf.blade.SendBladeList.decode(message);
            }
        );

        // SEND_ITEM_LIST
        bleach.register(Protobuf.basetype.EProtoId.SEND_ITEM_LIST,
            function (message) {
                bleach.sendItemList = Protobuf.item.SendItemList.decode(message);
                bleach.STATE = ROBOT_STATE.GET_ROLEINFO_OK;
            }
        );
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.GET_ROLEINFO_OK)
            return 1

        async.series([
            function (callback) {
                InitRoleAttr(callback);
            },
            function (callback) {
                InitReservedBlade(callback);
            }
        ], function (err) {
            bleach.STATE = ROBOT_STATE.INIT_ROLEINFO_OK;
        });

        function InitRoleAttr(asyncCallback) {
            var gmCmdList = [];

            // gold
            if (bleach.sendRoleData.roleinfo.gold < 10000000)
                gmCmdList.push('//gold num=' + (10000000 - bleach.sendRoleData.roleinfo.gold));
            // cash
            if (bleach.sendRoleData.roleinfo.cash < 10000000)
                gmCmdList.push('//cash num=' + (10000000 - bleach.sendRoleData.roleinfo.cash));
            // level
            if (bleach.sendRoleData.roleinfo.exp < 7900000)
                gmCmdList.push('//level num=78');
            // skillPoint
            if (bleach.sendRoleData.roleinfo.skillpoint < 10000000)
                gmCmdList.push('//skillPoint num=' + (10000000 - bleach.sendRoleData.roleinfo.skillpoint));
            // strength
            if (bleach.sendRoleData.roleinfo.strength < 10000000)
                gmCmdList.push('//strength num=' + (10000000 - bleach.sendRoleData.roleinfo.strength));
            // reviveCoin
            if (bleach.sendRoleData.roleinfo.revivecoin < 10000000)
                gmCmdList.push('//reviveCoin num=' + (10000000 - bleach.sendRoleData.roleinfo.revivecoin));

            async.eachSeries(gmCmdList, function (gmCmd, callback) {
                bleach.request(Protobuf.basetype.EProtoId.CHAT_PRIVATE_REQ,
                    Protobuf.chat.ChatPrivateReq.encode({
                        roleid: 0,
                        text: gmCmd
                    }),
                    Protobuf.basetype.EProtoId.ROLE_ATTRCHANGES_S,
                    function (message) {
                        var roleAttrChange = Protobuf.role.RoleAttrChange.decode(message);
                        roleAttrChange.changelist.forEach(function (roleAttrPair) {
                            switch (roleAttrPair.key) {
                                case Protobuf.roletype.RoleAttr.eRoleAttr_Gold:
                                case Protobuf.roletype.RoleAttr.eRoleAttr_Cash:
                                case Protobuf.roletype.RoleAttr.eRoleAttr_Exp:
                                case Protobuf.roletype.RoleAttr.eRoleAttr_SkillPoint:
                                case Protobuf.roletype.RoleAttr.eRoleAttr_Strength:
                                case Protobuf.roletype.RoleAttr.eRoleAttr_ReviveCoin:
                                    callback();
                            }
                        });
                    }
                );
            }, function (err) {
                bleach.unregister(Protobuf.basetype.EProtoId.ROLE_ATTRCHANGES_S);
                console.log('[SEND_ROLE_DATA] Init enum RoleAttr finish...');
                asyncCallback();
            });
        }

        function InitReservedBlade(asyncCallback) {
            bleach.sendBladeList.bladeEquiped = {}
            var bs = bleach.sendBladeList.list.map(function (blade) {
                bleach.sendBladeList.bladeEquiped[blade.info.id] = blade.info.equipindex;
                return blade.info.id;
            });

            bleach.sendBladeList.blades = [12101001, 12101002, 12101003, 12101005, 12102001, 12102002,
                12102003, 12102005, 12102007, 12103003];
            bleach.sendBladeList.blades.forEach(function (id) {
                var pos = bs.indexOf(id);
                pos === -1 ? bs.push(id) : bs.splice(pos, 1);
            });

            async.eachSeries(bs, function (bladeid, callback) {
                bleach.request(Protobuf.basetype.EProtoId.CHAT_PRIVATE_REQ,
                    Protobuf.chat.ChatPrivateReq.encode({
                        roleid: 0,
                        text: '//blade id=' + bladeid
                    }),
                    Protobuf.basetype.EProtoId.NEW_BLADE_LIST,
                    function (message) {
                        callback();
                    }
                );
            }, function (err) {
                bleach.unregister(Protobuf.basetype.EProtoId.NEW_BLADE_LIST);
                console.log('[SEND_BLADE_LIST] Add blade finish...');
                asyncCallback();
            });
        }

        function InitBladeClips(asyncCallback) {
            var bi = {};
            bleach.sendItemList.list.forEach(function (itemInfo) {
                bi[itemInfo.itemid] = itemInfo.num;
            });

            var gmCmdList = [];
            bleach.sendItemList.bladeChips = [12201001, 12201002, 12201003, 12201005, 12202001, 12202002,
                12202003, 12202005, 12202007, 12203003];
            bleach.sendItemList.bladeChips.forEach(function (chip) {
                if (bi[chip]) {
                    if (bi[chip] < 5000) {
                        gmCmdList.push('//item id=' + chip + ' num=' + (5000 - bi[chip]));
                    }
                } else {
                    gmCmdList.push('//item id=' + chip + ' num=500');
                }
            });

            async.eachSeries(gmCmdList, function (gmCmd, callback) {
                bleach.request(Protobuf.basetype.EProtoId.CHAT_PRIVATE_REQ,
                    Protobuf.chat.ChatPrivateReq.encode({
                        roleid: 0,
                        text: gmCmd
                    })
                );

                bleach.register(Protobuf.basetype.EProtoId.NEW_ITEM_LIST,
                    function (message) {
                        callback();
                    }
                );

                bleach.register(Protobuf.basetype.EProtoId.UPDATE_ITEM_LIST,
                    function (message) {
                        callback();
                    }
                );
            }, function (err) {
                bleach.unregister(Protobuf.basetype.EProtoId.NEW_ITEM_LIST);
                bleach.unregister(Protobuf.basetype.EProtoId.UPDATE_ITEM_LIST);
                console.log('[SEND_ITEM_LIST] Add bladeClip finish...');
                asyncCallback();
            });
        }
    },

    function () {
        if (bleach.STATE != ROBOT_STATE.INIT_ROLEINFO_OK)
            return 1

        bleach.sendBladeList.fightChangeswordList = [];

        async.eachSeries([1, 2, 3], function (srcindex, callback) {
            var randomValue = random.integer(0, bleach.sendBladeList.blades.length - 1);
            var randomDstid = bleach.sendBladeList.blades[randomValue];

            while (bleach.sendBladeList.bladeEquiped[randomDstid]) {
                randomValue = random.integer(0, bleach.sendBladeList.blades.length - 1);
                randomDstid = bleach.sendBladeList.blades[randomValue];
            }

            bleach.sendBladeList.fightChangeswordList.push(randomDstid);
            bleach.request(Protobuf.basetype.EProtoId.BLADE_EXCHANGE_REQ,
                Protobuf.blade.BladeExchangeReq.encode({
                    srcindex: srcindex,
                    dstid: randomDstid
                }),
                Protobuf.basetype.EProtoId.BLADE_EXCHANGE_RET,
                function (message) {
                    var bladeExchangeRet = Protobuf.blade.BladeExchangeRet.decode(message);
                    bleach.sendBladeList.bladeEquiped[bladeExchangeRet.srcid] = bladeExchangeRet.srcindex;
                    bleach.sendBladeList.bladeEquiped[bladeExchangeRet.dstid] = bladeExchangeRet.dstindex;
                    callback();
                }
            );
        }, function (err) {
            bleach.STATE = ROBOT_STATE.INIT_SWORDLIST_OK;
        })
    },

    function () {
        if (bleach.STATE === ROBOT_STATE.INIT_SWORDLIST_OK) {
            bleach.STATE = ROBOT_STATE.WAIT_ASYNC_OK;

            async.series([
                function (callback) {
                    setTimeout(EnterCopy, bleach.getThinkTime(), callback);
                },
                //function (callback) {
                //    setTimeout(FightChangesword, bleach.getThinkTime(), callback);
                //},
                function (callback) {
                    setTimeout(HitCommand, bleach.getThinkTime(), callback);
                },
                function (callback) {
                    setTimeout(ExitCopy, bleach.getThinkTime(), callback);
                }
            ], function (err) {
                bleach.STATE = ROBOT_STATE.INIT_SWORDLIST_OK;
            });

            function EnterCopy(asyncCallback) {
                monitor(START, 'sceneEntercopyC', ActFlagType.SCENE_ENTERCOPY_C);
                bleach.request(Protobuf.basetype.EProtoId.SCENE_ENTERCOPY_C,
                    Protobuf.scene.MessageEnterCopy.encode({
                        copyid: 14100002
                    }),
                    Protobuf.basetype.EProtoId.SCENE_ENTERCOPY_S,
                    function (message) {
                        monitor(END, 'sceneEntercopyC', ActFlagType.SCENE_ENTERCOPY_C);
                        asyncCallback();
                    }
                );
            }

            function FightChangesword(asyncCallback) {
                var swordid = bleach.sendBladeList.fightChangeswordList[random.integer(0, 2)]
                //monitor(START, 'fightChangeswordC', ActFlagType.FIGHT_CHANGESWORD_C);
                bleach.request(Protobuf.basetype.EProtoId.FIGHT_CHANGESWORD_C,
                    Protobuf.fight.MessageChangeSwordRequest.encode({
                        swordid: swordid,
                        unitid: bleach.roleList.rolebase[0].roleid,
                        time: 1
                    })
                    //,
                    //Protobuf.basetype.EProtoId.FIGHT_CHANGESWORD_S,
                    //function (message) {
                    //    monitor(END, 'fightChangeswordC', ActFlagType.FIGHT_CHANGESWORD_C);
                    //    asyncCallback();
                    //}
                );
                asyncCallback();
            }

            function HitCommand(asyncCallback) {
                bleach.request(Protobuf.basetype.EProtoId.FIGHT_HIT_C,
                    Protobuf.fight.MessageHitCommand.encode({
                        list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].
                            map(function (i) {
                                return {
                                    strongman: {
                                        unittype: Protobuf.fighttype.eFightUnitType.eFightUnitType_User,
                                        unitid: bleach.roleList.rolebase[0].roleid,
                                        attackmode: i % 2 == 0 ? Protobuf.fighttype.eAttackMode.eAttackMode_HP : Protobuf.fighttype.eAttackMode.eAttackMode_CP,
                                        time: i
                                    },
                                    hitinfo: [
                                        {
                                            weaknesslist: [
                                                {
                                                    unittype: Protobuf.fighttype.eFightUnitType.eFightUnitType_Monster,
                                                    unitid: random.integer(0, 13),
                                                    attackmode: i % 2 == 0 ? Protobuf.fighttype.eAttackMode.eAttackMode_HP : Protobuf.fighttype.eAttackMode.eAttackMode_CP,
                                                    time: i
                                                }
                                            ]
                                        }
                                    ],
                                    attackid: 15102001,
                                    time: i,
                                    index: i,
                                    bulletid: 0
                                };
                            }
                        )
                    })
                );
                asyncCallback();
            }

            function ExitCopy(asyncCallback) {
                monitor(START, 'sceneExitcopyC', ActFlagType.SCENE_EXITCOPY_C);
                bleach.request(Protobuf.basetype.EProtoId.SCENE_EXITCOPY_C,
                    Protobuf.scene.MessageExitCopy.encode({}),
                    Protobuf.basetype.EProtoId.SCENE_ENTERSCENE_S,
                    function (message) {
                        monitor(END, 'sceneExitcopyC', ActFlagType.SCENE_EXITCOPY_C);
                        asyncCallback();
                    }
                );
            }
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            //bleach.close();
        }, bleach.responseOverTime);
    }
)
;