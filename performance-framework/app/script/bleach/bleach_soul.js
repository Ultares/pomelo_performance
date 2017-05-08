/**
 * Created by yong.liu on 2015/5/25.
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
    SELECT_ROLE_ONLINE: 3
}

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
}

/////////////////////////////////////////////////////////////

var ROBOT_STATE = {
    WAIT_ASYNC_OK: 0,
    CONNECT_GATEW_OK: 1,
    GET_ROLELIST_OK: 2,
    GET_ROLEINFO_OK: 3,
    INIT_ROLEINFO_OK: 4,
    INIT_SOULLIST_OK: 5
}

var bleach = new Bleach();

var actorId = 100861
var qa54 = {
    "host": "10.96.29.54",
    "port": 3333
}
var tu = {
    "host": "10.96.29.36",
    "port": 4444

}

var hou = {
    "host": "10.96.29.36",
    "port": 5555
}

bleach.connect(qa54, function () {
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
                        console.log('Actor %s Error_Code_S code : %s.', actorId, messageErrorCode.code.toString(16));
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
                accountid: actorId
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

        // SEND_SOUL_LIST
        bleach.register(Protobuf.basetype.EProtoId.SEND_SOUL_LIST,
            function (message) {
                bleach.sendSoulList = Protobuf.soul.SendSoulList.decode(message);
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
            //function (callback) {
            //    InitReservedBlade(callback);
            //},
            function (callback) {
                InitSoulUpgradeMaterial(callback);
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

        function InitSoulUpgradeMaterial(asyncCallback) {
            var bi = {};
            bleach.sendItemList.list.forEach(function (itemInfo) {
                bi[itemInfo.itemid] = itemInfo.num;
            });

            var gmCmdList = [];
            bleach.sendItemList.soulMaterials = [
                12601001, 12601002, 12601003, 12601004, 12601005, 12601006,
                12601007, 12601008, 12601009, 12601010, 12601011, 12601012,
                12601013, 12601014, 12601015, 12601016, 12601017, 12601018,
                12601019, 12601020, 12601021, 12601022, 12601023, 12601024,
                12601025, 12601026, 12601027, 12601028, 12601029, 12601030,
                12601031, 12601032, 12601033, 12601034, 12601035, 12601036,
                12601037, 12601038, 12601039, 12601040, 12601041, 12601042,
                12601043, 12601044, 12601045, 12601046, 12601047, 12601048,
                12601049, 12601050, 12601051, 12601052, 12601053, 12601054,
                12601049, 12601050, 12601051, 12601052, 12601053, 12601054
            ];

            bleach.sendItemList.soulMaterials.forEach(function (chip) {
                if (bi[chip]) {
                    if (bi[chip] < 100) {
                        gmCmdList.push('//item id=' + chip + ' num=' + (100 - bi[chip]));
                    }
                } else {
                    gmCmdList.push('//item id=' + chip + ' num=100');
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
                console.log('[SEND_ITEM_LIST] Add SoulMaterials finish...');
                asyncCallback();
            });
        }
    },

    function () {
        if (bleach.STATE === ROBOT_STATE.INIT_ROLEINFO_OK) {
            bleach.STATE = ROBOT_STATE.WAIT_ASYNC_OK;

            bleach.equipSoulList = [];
            bleach.unEquipSoulList = [];

            async.series([
                function (callback) {
                    //console.log('AddSoul...')
                    setTimeout(AddSoul, bleach.getThinkTime(), callback);
                },
                function (callback) {
                    console.log('EquipSoul...')
                    setTimeout(EquipSoul, bleach.getThinkTime(), callback);
                },
                function (callback) {
                    //console.log('UnEquipSoul...')
                    setTimeout(UnEquipSoul, bleach.getThinkTime(), callback);
                },
                function (callback) {
                    console.log('UpgradeSoul...')
                    setTimeout(UpgradeSoul, bleach.getThinkTime(), callback);
                },
                //function (callback) {
                //    console.log('EvolutSoul...')
                //    setTimeout(EvolutSoul, bleach.getThinkTime(), callback);
                //},
                function (callback) {
                    //console.log('MergeSoul...')
                    setTimeout(MergeSoul, bleach.getThinkTime(), callback);
                }
            ], function (err) {
                bleach.STATE = ROBOT_STATE.INIT_ROLEINFO_OK;
            });

            function AddSoul(asyncCallback) {
                var gmCmdList = [];
                //var addSoulList = [
                //    12300001, 12300008, 12300014,
                //    12300002, 12300009, 12300015,
                //    12300003, 12300010, 12300016
                //];

                var addSoulList = [
                    12300001, 12300008, 12300014,
                    12300002, 12300009
                ];

                addSoulList.forEach(function (soul) {
                    //for (var i = 0; i < 1; i++)
                    gmCmdList.push('//soul id=' + soul);
                });

                var equipindex = 1;
                async.eachSeries(gmCmdList, function (gmCmd, gmCallback) {
                    bleach.request(Protobuf.basetype.EProtoId.CHAT_PRIVATE_REQ,
                        Protobuf.chat.ChatPrivateReq.encode({
                            roleid: 0,
                            text: gmCmd
                        })
                    );

                    bleach.register(Protobuf.basetype.EProtoId.NEW_SOUL_LIST,
                        function (message) {
                            var newSoulList = Protobuf.soul.NewSoulList.decode(message).list;
                            bleach.equipSoulList.push({
                                thisid: newSoulList[0].thisid,
                                equipindex: equipindex++
                            });

                            bleach.unEquipSoulList.push({
                                thisid: newSoulList[0].thisid,
                                equipindex: 0
                            });
                            gmCallback();
                        }
                    );
                }, function (err) {
                    asyncCallback();
                });
            }

            function EquipSoul(asyncCallback) {
                monitor(START, 'soulEquip', ActFlagType.SOUL_EQUIP);
                bleach.request(Protobuf.basetype.EProtoId.SOUL_EQUIP_REQ,
                    Protobuf.soul.SoulEquipReq.encode({
                        list: bleach.equipSoulList
                    }),
                    Protobuf.soul.EProtoId.SOUL_EQUIP_RET,
                    function (message) {
                        monitor(END, 'soulEquip', ActFlagType.SOUL_EQUIP);
                        asyncCallback();
                    }
                );
            }

            function UnEquipSoul(asyncCallback) {
                bleach.request(Protobuf.basetype.EProtoId.SOUL_EQUIP_REQ,
                    Protobuf.soul.SoulEquipReq.encode({
                        list: bleach.unEquipSoulList
                    }),
                    Protobuf.soul.EProtoId.SOUL_EQUIP_RET,
                    function (message) {
                        asyncCallback();
                    }
                );
            }

            function UpgradeSoul(asyncCallback) {
                monitor(START, 'soulUpgrade', ActFlagType.SOUL_UPGRADE);
                bleach.request(Protobuf.basetype.EProtoId.SOUL_UPGRADE_REQ,
                    Protobuf.soul.SoulUpgradeReq.encode({
                        thisid: bleach.equipSoulList[0].thisid
                    }),
                    Protobuf.soul.EProtoId.SOUL_UPGRADE_RET,
                    function (message) {
                        monitor(END, 'soulUpgrade', ActFlagType.SOUL_UPGRADE);
                        asyncCallback();
                    }
                );
            }

            function EvolutSoul(asyncCallback) {
                monitor(START, 'soulEvolut', ActFlagType.SOUL_EVOLUT);
                bleach.request(Protobuf.basetype.EProtoId.SOUL_EVOLUT_REQ,
                    Protobuf.soul.SoulEvolutReq.encode({
                        thisid: bleach.equipSoulList[0].thisid,
                        uselist: [bleach.equipSoulList[1].thisid, bleach.equipSoulList[2].thisid]
                    }),
                    Protobuf.soul.EProtoId.SOUL_EVOLUT_RET,
                    function (message) {
                        monitor(END, 'soulEvolut', ActFlagType.SOUL_EVOLUT);
                        asyncCallback();
                    }
                );
            }

            function MergeSoul(asyncCallback) {
                monitor(START, 'soulMerge', ActFlagType.SOUL_MERGE);
                bleach.request(Protobuf.basetype.EProtoId.SOUL_MERGE_REQ,
                    Protobuf.soul.SoulMergeReq.encode({
                        thisid: bleach.equipSoulList[0].thisid,
                        uselist: [bleach.equipSoulList[3].thisid, bleach.equipSoulList[4].thisid]
                    }),
                    Protobuf.soul.EProtoId.SOUL_MERGE_RET,
                    function (message) {
                        monitor(END, 'soulMerge', ActFlagType.SOUL_MERGE);
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
);