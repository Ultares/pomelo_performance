/*
 * changelist:
 * xiaolin.guo@dena.jp @ 2014.04.10 create
 * 
 * this service is the proxy to communicate to fight server
 *
 */

// HOST='119.15.139.155'
// // HOST='127.0.0.1'
// PORT=8800
var Fight_Service = exports;
var mongo=require("mongodb");
var ItemValue = require("../models/ItemType").ItemValue;

var FixedarrayCache = require("../models/FixedarrayCache");
var tcp_client = null;
var connected=false;
var Profile_Service = require('./Profile_Service');
var CharacterBase = require("../models/Character");

var FightUtility = require("../utility/FightUtility");

Fight_Service.retrieveFighting = function(BS, fightingPost, cb) {
	// fightingPost = {card:card_list, gk:guanka};
	
	// post data to fight server through tcp server.
	// now for test, make a fake data.
	// var fight = {"teams":[[],[],[]]}
	// var fight = {"teams":[[{"_id":15006,"am":1,"attr":[15006,30000,80,0,0,0,200,100,100,100,100,30000,0,15,4000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,30,0],"bqsl":[[],[],[]],"c":15,"ex":88620,"fp":12723,"i":10006,"item":[{"i":30001,"lv":10,"e":[{"i":29,"t":0,"a":20},{"i":22,"t":0,"a":50}]},{"i":0,"lv":0},{"i":0,"lv":0},{},{"i":0,"lv":0},{"i":0,"lv":0}],"j":[{"i":60,"lv":1},{"i":63,"lv":70},{"i":61,"lv":1},{"i":62,"lv":1},{"i":1,"lv":1}],"lv":30,"ql":5,"s":10,"sl":0,"x":5}],[{"_id":10056,"c":0,"s":0,"x":0,"lv":0,"ql":0,"am":0,"i":0,"ex":0,"attr":[10056,60000,1,1000,0,0,25,11,10,11,10,60000,0,0,5000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,35,400],"isBoss":true,"scale":1.5,"j":[{"i":5602,"lv":1},{"i":5603,"lv":1},{"i":0,"lv":0},{"i":1,"lv":0},{"i":0,"lv":0}]}]],"seed":6,"k":0,"cannon":[],"skill":[]};
	// console.log("fight" + JSON.stringify(fight));
	// Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,JSON.stringify(fight), function(code, retlist){
	// 	cb(200, retlist);
	// });	
    cb(200, "retlist");
}

Fight_Service.fightVerify = function(BS, fightingPost, winlose ,needVerify,cb) {
	// fightingPost = {card:card_list, gk:guanka};
	
	// post data to fight server through tcp server.
	// now for test, make a fake data.
	// var fight = {"teams":[[],[],[]]}
	// var fightingPost = {"teams":[[{"_id":15006,"am":1,"attr":[15006,30000,80,0,0,0,200,100,100,100,100,30000,0,15,4000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,30,0],"bqsl":[[],[],[]],"c":15,"ex":88620,"fp":12723,"i":10006,"item":[{"i":30001,"lv":10,"e":[{"i":29,"t":0,"a":20},{"i":22,"t":0,"a":50}]},{"i":0,"lv":0},{"i":0,"lv":0},{},{"i":0,"lv":0},{"i":0,"lv":0}],"j":[{"i":60,"lv":1},{"i":63,"lv":70},{"i":61,"lv":1},{"i":62,"lv":1},{"i":1,"lv":1}],"lv":30,"ql":5,"s":10,"sl":0,"x":5}],[{"_id":10056,"c":0,"s":0,"x":0,"lv":0,"ql":0,"am":0,"i":0,"ex":0,"attr":[10056,60000,1,1000,0,0,25,11,10,11,10,60000,0,0,5000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,35,400],"isBoss":true,"scale":1.5,"j":[{"i":5602,"lv":1},{"i":5603,"lv":1},{"i":0,"lv":0},{"i":1,"lv":0},{"i":0,"lv":0}]}]],"seed":6,"k":0,"cannon":[],"skill":[]};
	// console.log("fight" + JSON.stringify(fight));
	if (needVerify == 1 && winlose == 1){
		Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,JSON.stringify(fightingPost), function(code, retlist, rewardList, detail, rival_detail){
			//console.log("rewardList:"+JSON.stringify(rewardList));
			cb(code, retlist, rewardList, detail, rival_detail);
            if(code == 200 && retlist != 1){
                logger.critical('OP_FIGHT_VERIFY_FAILED_POST. ' + JSON.stringify(fightingPost));
                logger.critical('OP_FIGHT_VERIFY_FAILED_RESULT. ' + JSON.stringify({win: retlist, detail: detail, rival_detail: rival_detail}));
            }
		});			
	} else {
		cb (200, 0);
	}

}


/*
   * 3.0某些渠道的包跟正式包不同（未修正战斗不掉宝箱的BUG，比如应用宝）
   * 先尝试用正常的验证流程
   * 如果验证失败，用不掉宝箱的验证再次尝试
   * 如果第二次验证通过，服务器需要进行宝箱的掉落计算
   * 4.0需要去除该代码
*/
Fight_Service.fightVerifyWithFallback20151010 = function(BS, fightingPost, winlose, clientHeroStats, needVerify,cb) {
    if (needVerify == 1 && winlose == 1){
        Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,JSON.stringify(fightingPost), function(code, retlist, rewardList, detail, rival_detail){
            return cb(code, retlist, rewardList, detail, rival_detail);
/*
            if(code == 200 && !Fight_Service.HPMPverifyV2(BS, clientHeroStats, detail)){
                fightingPost.fallback20151010 = 1;
                Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,JSON.stringify(fightingPost), function(code, retlist, rewardList, detail, rival_detail){
                    if(code == 200 && retlist == 1 &&  Fight_Service.HPMPverifyV2(BS, clientHeroStats, detail)){
                        logger.critical('OP_FALLBACK20151010_RESCUE. ' + JSON.stringify(fightingPost));
                        return cb(code, retlist, rewardList, detail, rival_detail, fightingPost.fallback20151010);
                    }else{
                        return cb(code, retlist, rewardList, detail, rival_detail);
                    }
                });
            }else{
                return cb(code, retlist, rewardList, detail, rival_detail);
            }
*/
        });
    } else {
        cb (200, 0);
    }

}

Fight_Service.fightAlliancePveVerify = function(BS, fightingPost, cb) {
	Fight_Service.checkFight(Fight_Service.CMD_Type.ALLIANCE_PVE_REQ,JSON.stringify(fightingPost), function(code, win, hp_em_list, rewardList){
		cb(code, win, hp_em_list, rewardList);//200,win, vec1, rewardList
		console.log("vbmsg code      : "+code);
		console.log("vbmsg win       : "+win);
		console.log("vbmsg hp_em_list: "+JSON.stringify(hp_em_list));
		console.log("vbmsg rewardList: "+JSON.stringify(rewardList));
	});
}

Fight_Service.ShipKingVerify = function(BS, fightingPost, cb) {
	// cb(200, Math.floor(Math.random()*(65535)));//todo del
	
	Fight_Service.checkFight(Fight_Service.CMD_Type.SHIP_KING_PVE_REQ,JSON.stringify(fightingPost), function(code, total_score){
		cb(code, total_score);//200,win, vec1, rewardList
		console.log("vbmsg ShipKingVerify code      : "+code);
		console.log("vbmsg ShipKingVerify score     : "+total_score);
	});
}

Fight_Service.huiyiVerify = function(BS, fightingPost, winlose ,needVerify,cb) {
    if (needVerify == 1 && winlose == 1){
        Fight_Service.checkFight(Fight_Service.CMD_Type.HUIYI_REQ,JSON.stringify(fightingPost), function(code, retlist, rewardList, detail, rival_detail){
            console.log("rewardList:"+JSON.stringify(rewardList));
            cb(code, retlist, rewardList, detail, rival_detail);
            if(code == 200 && retlist != 1){
                logger.critical('OP_FIGHT_VERIFY_FAILED_POST. ' + JSON.stringify(fightingPost));
                logger.critical('OP_FIGHT_VERIFY_FAILED_RESULT. ' + JSON.stringify({win: retlist, detail: detail, rival_detail: rival_detail}));
            }
        });
    } else {
        cb (200, 0);
    }

}

Fight_Service.doujiVerify = function(BS, fightingPost, needVerify,cb) {
	// fightingPost = {card:card_list, gk:guanka};
	
	// post data to fight server through tcp server.
	// now for test, make a fake data.
	// var fight = {"teams":[[],[],[]]}
	// var fightingPost = {"teams":[[{"_id":15006,"am":1,"attr":[15006,30000,80,0,0,0,200,100,100,100,100,30000,0,15,4000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,30,0],"bqsl":[[],[],[]],"c":15,"ex":88620,"fp":12723,"i":10006,"item":[{"i":30001,"lv":10,"e":[{"i":29,"t":0,"a":20},{"i":22,"t":0,"a":50}]},{"i":0,"lv":0},{"i":0,"lv":0},{},{"i":0,"lv":0},{"i":0,"lv":0}],"j":[{"i":60,"lv":1},{"i":63,"lv":70},{"i":61,"lv":1},{"i":62,"lv":1},{"i":1,"lv":1}],"lv":30,"ql":5,"s":10,"sl":0,"x":5}],[{"_id":10056,"c":0,"s":0,"x":0,"lv":0,"ql":0,"am":0,"i":0,"ex":0,"attr":[10056,60000,1,1000,0,0,25,11,10,11,10,60000,0,0,5000,0,0,0,0,0,999,999,0,0,0,0,0,0,0,0,0,0,35,400],"isBoss":true,"scale":1.5,"j":[{"i":5602,"lv":1},{"i":5603,"lv":1},{"i":0,"lv":0},{"i":1,"lv":0},{"i":0,"lv":0}]}]],"seed":6,"k":0,"cannon":[],"skill":[]};
	// console.log("fight" + JSON.stringify(fight));
	if (needVerify == 1){
		Fight_Service.checkFight(Fight_Service.CMD_Type.DOUJI_REQ,JSON.stringify(fightingPost), function(code, retlist){
			cb(code, retlist);
		});			
	} else {
		cb (200, 0);
	}

}

Fight_Service.HPMPverify = function(BS, data, detail) {
    var rtn = true;
	data[0].forEach(function(x,i,a){
		if (detail[x[0]]) {
			if (x[1] > 0 && (x[1] != detail[x[0]].hp || x[2] != detail[x[0]].mp)) {
				console.log(x[1]+"HPMPverify fail!!!!"+detail[x[0]].hp+", mp: "+x[2]+"<=>"+detail[x[0]].mp);
                rtn = false;
			}
			x[1] = detail[x[0]].hp;
			x[2] = detail[x[0]].mp;
		}
	});

    return rtn;
}

//donot modify
Fight_Service.HPMPverifyV2 = function(BS, data, detail) {
    var rtn = true;
    data[0].forEach(function(x,i,a){
        if (detail[x[0]]) {
            if (x[1] > 0 && (x[1] != detail[x[0]].hp || x[2] != detail[x[0]].mp)) {
                //console.log(x[1]+"HPMPverify fail!!!!"+detail[x[0]].hp+", mp: "+x[2]+"<=>"+detail[x[0]].mp);
                rtn = false;
            }
            //x[1] = detail[x[0]].hp;
            //x[2] = detail[x[0]].mp;
        }
    });

    return rtn;
}

Fight_Service.calcWantedMoney = function(point) {
	if (point <= 1500) return 0;
	
	return (point - 1500) * 50;
}


Fight_Service.tcp_reconnect = function(){	
	tcp_client = require('net').connect({host:BS._WORLD_CONFIG.fighting.h, port:BS._WORLD_CONFIG.fighting.p},
	// tcp_client = require('net').connect({host:'10.96.52.146', port:8400},
		// tcp_client = require('net').connect({host:'10.96.39.51', port:8401},
// tcp_client = require('net').connect({host:'10.96.39.52', port:8400},
		function() { //'connect' listener function
		connected=true;
		console.log(Date(), 'fight tcp_client connected');
		//tcp_client.setTimeout(5000);
		Fight_Service.processReq();
	}).on('error', function(error) {
		// console.log(error);
		console.log(Date(), "fight tcp_client_error", BS._WORLD_CONFIG.fighting);
		connected=false;
		Fight_Service.RESP_SIZE=0;
		Fight_Service.RECEV_SIZE=0;
		Fight_Service.working_cmd=null;

		tcp_client.destroy();
		setTimeout(Fight_Service.tcp_reconnect, 1000);
	});

	tcp_client.on('close', function(data) {

	});

	tcp_client.on('timeout', function(data) {
		console.log(Date(), "fight tcp_client_timeout");
		connected=false;
		Fight_Service.RESP_SIZE=0;
		Fight_Service.RECEV_SIZE=0;
		Fight_Service.working_cmd=null;
		
		tcp_client.destroy();
		setTimeout(Fight_Service.tcp_reconnect, 1000);
	});

	tcp_client.on('data', function(data) {
		if(Fight_Service.RECEV_SIZE<16 || Fight_Service.RECEV_SIZE<Fight_Service.RESP_SIZE){
			data.copy(Fight_Service.in_buff, Fight_Service.RECEV_SIZE);
			Fight_Service.RECEV_SIZE+=data.length;
		}
		if(Fight_Service.RESP_SIZE==0) Fight_Service.RESP_SIZE=Fight_Service.in_buff.readInt32BE(0)+4;
		if(Fight_Service.RESP_SIZE<=Fight_Service.RECEV_SIZE){
			Fight_Service.processResp(function(){
				Fight_Service.RESP_SIZE=0;
				Fight_Service.RECEV_SIZE=0;
				Fight_Service.working_cmd=null;
				tcp_client.emit('ranking_req', 0);
			});
		}
	});

	tcp_client.on('end', function() {
		connected=false;
		console.log(Date(), '!!!!!tcp_client disconnected');
		Fight_Service.RESP_SIZE=0;
		Fight_Service.RECEV_SIZE=0;
		Fight_Service.working_cmd=null;
		setTimeout(Fight_Service.tcp_reconnect, 1000);
	});

	tcp_client.on('ranking_req', function(newCMD_index) {
		Fight_Service.processReq();
	});
}

function writeuint64(arg64,buff,offset)
{
	//console.log(arg64);
	var low = arg64.getLowBits();
	var high= arg64.getHighBits();
	//console.log(low);
	//console.log(high);
	buff.writeUInt32BE(high,offset);
	offset+=4;
	buff.writeUInt32BE(low,offset);
	offset+=4;
	return offset;
}

var _MAX_NUMBER=mongo.Long.fromNumber(2251799813685247);

function readuint64(buff,offset)
{
	var high = buff.readUInt32BE(offset);
	var low = buff.readUInt32BE(offset+4);

	var mlong=mongo.Long(low,high);
	if(mlong.greaterThan(_MAX_NUMBER))
		return mlong;
	else
		return mlong.toNumber();
}


Fight_Service.CMD_Type={
	FIGHT_REQ: 10016,
	FIGHT_RESP: 10017,
	DOUJI_REQ:10018,
	DOUJI_RESP:10019,
	DIANFENG_REQ:10020,
	DIANFENG_RESP:10021,
	CARWHEEL_REQ: 10022,
	CARWHEEL_RESP: 10023,

    HUIYI_REQ: 10024,
    HUIYI_RESP: 10025,

	ALLIANCE_PVE_REQ: 10026,
	ALLIANCE_PVE_RESP: 10027,

	SHIP_KING_PVE_REQ: 10028,
	SHIP_KING_PVE_RESP: 10029,
};

Fight_Service.queue=new FixedarrayCache(80);
Fight_Service.working_cmd=null;
Fight_Service.TRANSACTION_ID=0;
Fight_Service.RESP_SIZE=0;
Fight_Service.RECEV_SIZE=0;
Fight_Service.out_buff=new Buffer(65535);
Fight_Service.in_buff=new Buffer(655350);

Fight_Service.processResp = function(cb) {
	if(Fight_Service.in_buff.readInt32BE(8)==Fight_Service.out_buff.readInt32BE(8)){
		var resp=[],len=16;
		//{msg_size:uint32,msg_type:uint32,transid:uint32,star:uint8}
		//userrespdata
		//{
		//	userid:uint64,
		//	uservalue:uint64,
		//	pos:uint32,
		//  str_size:uint8,
		//  str:char[str_size]
		//} 
		var offset=4;
		var CMD_ID = Fight_Service.in_buff.readInt32BE(offset);
		if (CMD_ID == Fight_Service.CMD_Type.FIGHT_RESP) {
			offset+=4;
			offset+=4;

			var win = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var size = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var rewardList = [];
			for (var i=0;i<size;i++){
				var reward = {i:Fight_Service.in_buff.readInt32BE(offset), a:Fight_Service.in_buff.readInt32BE(offset+4)};
				offset +=8;
				rewardList.push(reward);
			}
			var detail_size = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var detail = {};
			for (var i=0;i<detail_size;i++){
				var id = Fight_Service.in_buff.readInt32BE(offset);
				detail[id] = {hp:Fight_Service.in_buff.readInt32BE(offset+4),mp:Fight_Service.in_buff.readInt32BE(offset+8)};
				offset +=12;
			}
			var rival_detail_size = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var rival_detail = {};
			for (var i=0;i<rival_detail_size;i++){
				var id = Fight_Service.in_buff.readInt32BE(offset);
				rival_detail[id] = {hp:Fight_Service.in_buff.readInt32BE(offset+4),mp:Fight_Service.in_buff.readInt32BE(offset+8)};
				offset +=12;
			}

			var replayTime = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;

            console.log("process rank cmd:" + Fight_Service.working_cmd);
            console.log(win, detail, rival_detail, rewardList, replayTime);
			Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200,win,rewardList,detail,rival_detail,replayTime);//callback
		} else if (CMD_ID == Fight_Service.CMD_Type.DOUJI_RESP) {
			console.log("!!!!!!!!!!!!!!");
			offset+=4;
			offset+=4;

			var win = [0,0,0]
			win[0] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			win[1] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			win[2] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			// var size = Fight_Service.in_buff.readInt32BE(offset);
			// offset+=4;
			// var rewardList = [];
			// for (var i=0;i<size;i++){
			// 	var reward = {i:Fight_Service.in_buff.readInt32BE(offset), a:Fight_Service.in_buff.readInt32BE(offset+4)};
			// 	offset +=8;
			// 	rewardList.push(reward);
			// }
			// var detail_size = Fight_Service.in_buff.readInt32BE(offset);
			// offset+=4;
			// var detail = {};
			// for (var i=0;i<detail_size;i++){
			// 	var id = Fight_Service.in_buff.readInt32BE(offset);
			// 	detail[id] = {hp:Fight_Service.in_buff.readInt32BE(offset+4),mp:Fight_Service.in_buff.readInt32BE(offset+8)};
			// 	offset +=12;
			// }
			console.log("!!!!!!!!!!!!!!");
			Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200,win);//callback
		}else if (CMD_ID == Fight_Service.CMD_Type.DIANFENG_RESP) {
			offset+=4;
			offset+=4;

			var win = [0,0,0]
			win[0] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			win[1] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			win[2] = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;

			var HP_size = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var hp_List = {"0":{},"1":{},"2":{}};
			for (var i=0;i<HP_size;i++){
				var cluster = Fight_Service.in_buff.readInt32BE(offset);
				var id = Fight_Service.in_buff.readInt32BE(offset+4);
				hp_List[cluster][id] = Fight_Service.in_buff.readInt32BE(offset+8);
				offset +=12;
			}
			// var reward_size = Fight_Service.in_buff.readInt32BE(offset);
			// offset+=4;
			// var rewardList = [];
			// for (var i=0;i<reward_size;i++){
			// 	var reward = {i:Fight_Service.in_buff.readInt32BE(offset), a:Fight_Service.in_buff.readInt32BE(offset+4)};
			// 	offset +=8;
			// 	rewardList.push(reward);
			// }
			// var detail_size = Fight_Service.in_buff.readInt32BE(offset);
			// offset+=4;
			// var detail = {};
			// for (var i=0;i<detail_size;i++){
			// 	var id = Fight_Service.in_buff.readInt32BE(offset);
			// 	detail[id] = {hp:Fight_Service.in_buff.readInt32BE(offset+4),mp:Fight_Service.in_buff.readInt32BE(offset+8)};
			// 	offset +=12;
			// }
			Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200,win,hp_List);//callback
		}else if (CMD_ID == Fight_Service.CMD_Type.HUIYI_RESP) {
            offset+=4;
            offset+=4;

            var win = Fight_Service.in_buff.readInt32BE(offset);
            offset+=4;
            var vec1_sz = Fight_Service.in_buff.readInt32BE(offset);
            offset+=4;
            var vec1 = [];
            for(var i = 0; i< vec1_sz; ++i){
                var vec2 = [];
                var vec2_sz = Fight_Service.in_buff.readInt32BE(offset);
                offset+=4;
                for(var j = 0; j< vec2_sz; ++j){
                    var vec3 = [];
                    var vec3_sz = Fight_Service.in_buff.readInt32BE(offset);
                    offset+=4;
//                     for(var k = 0;k < vec3_sz; ++k){
//                         var vec4 = [];
//                         var vec4_sz = Fight_Service.in_buff.readInt32BE(offset);
//                         offset += 4;
//                         for(var m = 0; m < vec4_sz; ++m){
//                             var vec5_unit = Fight_Service.in_buff.readInt32BE(offset);
//                             offset += 4;
//                             vec4.push(vec5_unit);
//                         }
//                         vec3.push(vec4);
//                     }
                    for(var k = 0;k < vec3_sz; ++k){
                        var vec4 = [];
                        var vec4_unit = Fight_Service.in_buff.readInt32BE(offset);
                        offset += 4;
                        vec3.push(vec4_unit);
                    }
                    vec2.push(vec3);
                }
                vec1.push(vec2);
            }

            Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200,win,vec1);//callback
        }else if (CMD_ID == Fight_Service.CMD_Type.ALLIANCE_PVE_RESP) {
			offset+=4;
			offset+=4;

			var win = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var size = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var rewardList = [];
			for (var i=0;i<size;i++){
				var reward = {i:Fight_Service.in_buff.readInt32BE(offset), a:Fight_Service.in_buff.readInt32BE(offset+4)};
				offset +=8;
				rewardList.push(reward);
			}

			var vec1_sz = Fight_Service.in_buff.readInt32BE(offset);
			offset+=4;
			var vec1 = [];
			for(var i = 0; i< vec1_sz; ++i){
				var vec2 = [];
				var vec2_sz = Fight_Service.in_buff.readInt32BE(offset);
				offset+=4;
				for(var j = 0; j< vec2_sz; ++j){
					var vec3 = [];
					var vec3_sz = Fight_Service.in_buff.readInt32BE(offset);
					offset+=4;
					for(var k = 0;k < vec3_sz; ++k){
						var vec4 = [];
						var vec4_sz = Fight_Service.in_buff.readInt32BE(offset);
						offset += 4;
						for(var m = 0; m < vec4_sz; ++m){
							var vec5_unit = Fight_Service.in_buff.readInt32BE(offset);
							offset += 4;
							vec4.push(vec5_unit);
						}
						vec3.push(vec4);
					}
					vec2.push(vec3);
				}
				vec1.push(vec2);
			}

			Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200,win, vec1, rewardList);//callback
		}else if (CMD_ID == Fight_Service.CMD_Type.SHIP_KING_PVE_RESP) {
			offset+=4;
			offset+=4;
			var score = Fight_Service.in_buff.readInt32BE(offset);
			Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](200, score);//callback
		}
	}else{
		Fight_Service.working_cmd[Fight_Service.working_cmd.length-1](202,"sequence error");
	}
	cb();
}

Fight_Service.processReq = function() {
	if(connected && !Fight_Service.working_cmd){
		Fight_Service.working_cmd=Fight_Service.queue.pop();
		if(Fight_Service.working_cmd){
			var cmd=Fight_Service.working_cmd;
			//console.log("process rank cmd:" + cmd);
			var offset=0;
			if(cmd[0]==Fight_Service.CMD_Type.FIGHT_REQ){
				//{msg_size:uint32, msg_type:uint32, transid:uint32, fight:json}
				// #define FIGHT_MSG_FIGHT_CHECK_REQ 10016

				//{msg_size:uint32, msg_type:uint32, transid:uint32, resp:json}
				// #define FIGHT_MSG_FIGHT_CHECK_RESP 10017

				offset+=4;

				Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.FIGHT_REQ, offset);
				offset+=4;
				if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
				Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
				offset+=4;
				offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
				Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
				offset+=4;
				Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
				offset+=Buffer.byteLength(cmd[1]);
				// // userreqdata
				// offset=writeuint64(cmd[3],Fight_Service.out_buff,offset); // userid=wuid 
				// offset=writeuint64(cmd[4],Fight_Service.out_buff,offset); // uservalue=score
				// Fight_Service.out_buff.writeInt8(Buffer.byteLength(cmd[5]), offset); // len=buff_length max 255
				// offset+=1;
				// Fight_Service.out_buff.write(cmd[5],offset); // buf=name-lv
				// offset+=Buffer.byteLength(cmd[5]);
				// Fight_Service.out_buff.writeInt32BE(cmd[6], offset);//pos = number to return = 1 
				// offset+=4;
								
				Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
				console.log(Fight_Service.out_buff.slice(0, offset));
				tcp_client.write(Fight_Service.out_buff.slice(0, offset));
			} else if(cmd[0]==Fight_Service.CMD_Type.ALLIANCE_PVE_REQ){
				//{msg_size:uint32, msg_type:uint32, transid:uint32, fight:json}
				// #define FIGHT_MSG_FIGHT_CHECK_REQ 10016

				//{msg_size:uint32, msg_type:uint32, transid:uint32, resp:json}
				// #define FIGHT_MSG_FIGHT_CHECK_RESP 10017

				offset+=4;

				Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.ALLIANCE_PVE_REQ, offset);
				offset+=4;
				if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
				Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
				offset+=4;
				offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
				Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
				offset+=4;
				Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
				offset+=Buffer.byteLength(cmd[1]);
				// // userreqdata
				// offset=writeuint64(cmd[3],Fight_Service.out_buff,offset); // userid=wuid 
				// offset=writeuint64(cmd[4],Fight_Service.out_buff,offset); // uservalue=score
				// Fight_Service.out_buff.writeInt8(Buffer.byteLength(cmd[5]), offset); // len=buff_length max 255
				// offset+=1;
				// Fight_Service.out_buff.write(cmd[5],offset); // buf=name-lv
				// offset+=Buffer.byteLength(cmd[5]);
				// Fight_Service.out_buff.writeInt32BE(cmd[6], offset);//pos = number to return = 1 
				// offset+=4;
								
				Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
				tcp_client.write(Fight_Service.out_buff.slice(0, offset));
			} else if(cmd[0]==Fight_Service.CMD_Type.SHIP_KING_PVE_REQ){
				//{msg_size:uint32, msg_type:uint32, transid:uint32, fight:json}
				// #define FIGHT_MSG_FIGHT_CHECK_REQ 10016

				//{msg_size:uint32, msg_type:uint32, transid:uint32, resp:json}
				// #define FIGHT_MSG_FIGHT_CHECK_RESP 10017

				offset+=4;

				Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.SHIP_KING_PVE_REQ, offset);
				offset+=4;
				if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
				Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
				offset+=4;
				offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
				Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
				offset+=4;
				Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
				offset+=Buffer.byteLength(cmd[1]);
				// // userreqdata
				// offset=writeuint64(cmd[3],Fight_Service.out_buff,offset); // userid=wuid 
				// offset=writeuint64(cmd[4],Fight_Service.out_buff,offset); // uservalue=score
				// Fight_Service.out_buff.writeInt8(Buffer.byteLength(cmd[5]), offset); // len=buff_length max 255
				// offset+=1;
				// Fight_Service.out_buff.write(cmd[5],offset); // buf=name-lv
				// offset+=Buffer.byteLength(cmd[5]);
				// Fight_Service.out_buff.writeInt32BE(cmd[6], offset);//pos = number to return = 1 
				// offset+=4;
								
				Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
				tcp_client.write(Fight_Service.out_buff.slice(0, offset));
			} else if(cmd[0]==Fight_Service.CMD_Type.DOUJI_REQ){
				//{msg_size:uint32, msg_type:uint32, transid:uint32, fight:json}
				// #define FIGHT_MSG_FIGHT_CHECK_REQ 10016

				//{msg_size:uint32, msg_type:uint32, transid:uint32, resp:json}
				// #define FIGHT_MSG_FIGHT_CHECK_RESP 10017

				offset+=4;

				Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.DOUJI_REQ, offset);
				offset+=4;
				if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
				Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
				offset+=4;
				offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
				Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
				offset+=4;
				Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
				offset+=Buffer.byteLength(cmd[1]);
				// // userreqdata
				// offset=writeuint64(cmd[3],Fight_Service.out_buff,offset); // userid=wuid 
				// offset=writeuint64(cmd[4],Fight_Service.out_buff,offset); // uservalue=score
				// Fight_Service.out_buff.writeInt8(Buffer.byteLength(cmd[5]), offset); // len=buff_length max 255
				// offset+=1;
				// Fight_Service.out_buff.write(cmd[5],offset); // buf=name-lv
				// offset+=Buffer.byteLength(cmd[5]);
				// Fight_Service.out_buff.writeInt32BE(cmd[6], offset);//pos = number to return = 1 
				// offset+=4;
								
				Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
				tcp_client.write(Fight_Service.out_buff.slice(0, offset));
			}else if(cmd[0]==Fight_Service.CMD_Type.DIANFENG_REQ){
				//{msg_size:uint32, msg_type:uint32, transid:uint32, fight:json}
				// #define FIGHT_MSG_FIGHT_CHECK_REQ 10016

				//{msg_size:uint32, msg_type:uint32, transid:uint32, resp:json}
				// #define FIGHT_MSG_FIGHT_CHECK_RESP 10017

				offset+=4;

				Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.DIANFENG_REQ, offset);
				offset+=4;
				if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
				Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
				offset+=4;
				offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
				Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
				offset+=4;
				Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
				offset+=Buffer.byteLength(cmd[1]);
				// // userreqdata
				// offset=writeuint64(cmd[3],Fight_Service.out_buff,offset); // userid=wuid 
				// offset=writeuint64(cmd[4],Fight_Service.out_buff,offset); // uservalue=score
				// Fight_Service.out_buff.writeInt8(Buffer.byteLength(cmd[5]), offset); // len=buff_length max 255
				// offset+=1;
				// Fight_Service.out_buff.write(cmd[5],offset); // buf=name-lv
				// offset+=Buffer.byteLength(cmd[5]);
				// Fight_Service.out_buff.writeInt32BE(cmd[6], offset);//pos = number to return = 1 
				// offset+=4;
								
				Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
				tcp_client.write(Fight_Service.out_buff.slice(0, offset));
			}else if(cmd[0]==Fight_Service.CMD_Type.HUIYI_REQ){

                offset+=4;

                Fight_Service.out_buff.writeInt32BE(Fight_Service.CMD_Type.HUIYI_REQ, offset);
                offset+=4;
                if(Fight_Service.TRANSACTION_ID++==2147483647) Fight_Service.TRANSACTION_ID=0;
                Fight_Service.out_buff.writeInt32BE(Fight_Service.TRANSACTION_ID, offset);
                offset+=4;
                offset=writeuint64(mongo.Long(100,0),Fight_Service.out_buff,offset);
                Fight_Service.out_buff.writeInt32BE(Buffer.byteLength(cmd[1]), offset); // len=buff_length max 255
                offset+=4;
                Fight_Service.out_buff.write(cmd[1],offset); // buf=name-lv
                offset+=Buffer.byteLength(cmd[1]);


                Fight_Service.out_buff.writeInt32BE(offset-4, 0);// msg body size = offset - 4(header field:msg size)
                tcp_client.write(Fight_Service.out_buff.slice(0, offset));
            }
		}
	}
}

Fight_Service.checkFight = function(CMD_ID, jsonstr,cb) {
	var toparg=arguments;
	Fight_Service.queue.add(arguments, function(oldCMD, newCMD_index){
		if(connected) tcp_client.emit('ranking_req', newCMD_index);
		console.log(toparg);
		//console.log("oldCMD:"+oldCMD);
		if(oldCMD){
			oldCMD[oldCMD.length-1](202,"timeout");
			Fight_Service.tcp_reconnect();
		}
		else console.log("no oldCMD");
	});
};

Fight_Service.checkAndSaveMaxFpTeam = function(BS, session, lineup, callback){
    if(!(lineup && lineup.length)) return callback(null, 0);

    var cardList = [];
    var curFp = 0;
    lineup.forEach(function(cardId){
        var tmpCard = CharacterBase.get_card(session.card, cardId, session.attrBuff);
        if(tmpCard){
            cardList.push(tmpCard);
            curFp += tmpCard.fp | 0;
        }
    });

    var shouldSave = (session.maxfp < curFp)?true:false;
    if(!shouldSave) return callback(null, curFp);

    op_maxfp_team_user.update({_id: session.wuid, f: {$lt: curFp}}, {$set: {
        e:ItemValue.ItemValue_GetValue(session.ub.ii, ItemValue.Team_Exp),
        t:cardList,
        f:curFp,
        l:Profile_Service.getUserLevel2(BS, session.ub.ii),
        n:session.n,
        i:session.i
    }}, {w: 1, upsert: true}, function(err){
        if(err) return callback(err);

        session.maxfp = curFp;
        return callback(null, curFp, shouldSave);
    });
};

Fight_Service.verifyPvpFight = function(BS, user1, user2, cardlist1, cardlist2, params, callback){
    //if(!BS.verifyServerOpen) return callback('verify server not open');

    var fightID = new mongo.ObjectID();

    var ex1, ex2;

    if(user1.ex){
        ex1 = user1.ex;
    }else{
        ex1 = ItemValue.ItemValue_GetValue(user1.ii, ItemValue.Team_Exp);
    }
    if(user2.ex){
        ex2 = user2.ex;
    }else{
        ex2 = ItemValue.ItemValue_GetValue(user2.ii, ItemValue.Team_Exp) ;
    }

    var lv1 = Profile_Service.getUserLevel1(BS, ex1);
    var lv2 = Profile_Service.getUserLevel1(BS, ex2);
    var wuid1 = user1._id ? user1._id.toString() : user1.wuid.toString();
    var wuid2 = user2._id.toString();

    var ret_teams = {};
    ret_teams[wuid1] = [{n:user1.n, i:user1.i, ex:ex1, lv:lv1, k:1, cards:cardlist1, ch: user1.ch}];//0是挑战方，1是防守方
    ret_teams[wuid2] = [{n:user2.n, i:user2.i, ex:ex2, lv:lv2, k:0, cards:cardlist2, ch: user2.ch}];

    if(user1.tt){
        ret_teams[wuid1][0].p = user1.tt.p;
        ret_teams[wuid1][0].w = 0;
    }
    if(user2.tt){
        ret_teams[wuid2][0].p = user2.tt.p;
        ret_teams[wuid2][0].w = 0;
    }

    var fightingReport = {replay:{id:fightID, teams:ret_teams, seed:Math.floor(Math.random()*(65535)), verify:0}};

    var fightingPost = {teams:[],seed:fightingReport.replay.seed,k:0,operation:{},battleRect:{},gkid: 0, bkey: params.bkey || 1};
    fightingPost.battleRect = params.battleRect?params.battleRect:{x:0,y:130,width:2880,height:180};
    fightingPost.operation = params.operation?params.operation:{autofight:null,cannon:[-1,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0,-1,0,0,0,0,0,0,0,0,0],distance:[0,-1,-1,-1,-1,-1],trackUltra:null};
    if (params && params.ftime && params.ftime > 0) fightingPost.ftime = params.ftime;

    var pos_x = parseInt(fightingPost.battleRect.x + fightingPost.battleRect.width * (20 / 100) - 500);
    var pos_y = fightingPost.battleRect.y + fightingPost.battleRect.height * 0.5;
    var cardlist = FightUtility.characterPositionByLineupInOrder(BS,ret_teams[wuid1][0].cards,pos_x,pos_y,0);
    fightingPost.teams.push(cardlist);

    var pos_x = parseInt(fightingPost.battleRect.x + fightingPost.battleRect.width * (20 / 100) + 500);
    var pos_y = pos_y;
    cardlist = FightUtility.characterPositionByLineupInOrder(BS,ret_teams[wuid2][0].cards,pos_x,pos_y,1);
    fightingPost.teams.push(cardlist);

    console.log("tianti: "+wuid1+":"+wuid2+":fightingPost"+ JSON.stringify(fightingPost));

    Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,JSON.stringify(fightingPost), function(code, resp, reward, detail, rival_detail, replayTime){
        if(code != 200) return callback('fight verify failed:' + code + ':' + resp);

        fightingReport.replay.verify = resp;

        var user1win = (resp== 1)? 1 : 0;
        var winner_wuid = (user1win == 1) ? user1._id :user2._id;
        fightingReport.replay.vf = {s: fightingReport.replay.seed, f: fightingReport.replay.id, v: winner_wuid};

        if(resp == 0){
            fightingReport.replay.vf.v = 0;
            user1win = -1;
        }

        return callback(null, resp, user1win, fightingReport, detail, rival_detail, replayTime);
    });
};


//平局时，通过血量来判定胜负　　－－－七武海
// 平局判存活人数多的一方赢。
// 存活人数一样的时候，判存活角色剩余血量总和占存活角色总血量百分比高的一方赢。
// 百分比也一样的场合，重赛，只保留最后一场的战斗记录。
Fight_Service.verifyPvpFightWithHpDecision = function(BS, user1, user2, cardlist1, cardlist2, params, callback){
    Fight_Service.verifyPvpFight(BS, user1, user2, cardlist1, cardlist2, params, function(err, resp, user1win, fightingReport, detail, rival_detail){
        if(err) return callback(err);

        if(user1win != -1) return callback.apply(null, arguments);

        var winWuid;
        var aliveCounter = [0, 0];
        var totalHp = [0, 0];
        var aliveHp = [0, 0];
        [detail, rival_detail].forEach(function(elem, index){
            Object.keys(elem).forEach(function(cardId){
                if(elem[cardId].hp){
                    aliveCounter[index]++;
                    aliveHp[index] += elem[cardId].hp;
                }
            });
        });


        if(aliveCounter[0] > aliveCounter[1]){
            winWuid = user1._id;
        }else if(aliveCounter[0] < aliveCounter[1]){
            winWuid = user2._id;
        }else{
            [cardlist1, cardlist2].forEach(function(elem, index){
                elem.forEach(function(cardInfo){
                    totalHp[index] += cardInfo.attr[ CharacterBase.AttrType.HP ];
                });
            });

            var temp0 = aliveHp[0] / totalHp[0];
            var temp1 = aliveHp[1] / totalHp[1];
            if(temp0 > temp1){
                winWuid = user1._id;
            }else if(temp0 < temp1){
                winWuid = user2._id;
            }
        }

        if(!winWuid) return callback.apply(null, arguments);

        console.log('verifyPvpFightWithHpDecision', user1._id.toString(), user2._id.toString(), winWuid.toString(), aliveCounter, totalHp, aliveHp);
        fightingReport.replay.vf.v = winWuid;
        return callback(err, resp, (winWuid.toString() == user1._id.toString())?1:0, fightingReport, detail, rival_detail);
    });
};

Fight_Service.initService = function(BS,cb) {	

	Fight_Service.tcp_reconnect();//set up connection
	
	BS.netservice.get("/check/fight", function (path, intime, req, res) {
		var body=req.body; if(!body) {BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n }); return;}
/*			
		var uid=NaN;
		if (body.uid) {
			uid=parseInt(body.uid);
		}
		if (isNaN(uid)) {
			BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n });
			return;
		} 

		var session = BS._SESSIONS[uid];
		if (!session) {
			BS.netservice.simpleJSON(path, intime, res, {code:203, msg: BS.server_resp_hash[1].n });
			return;
		}
*/		

		Fight_Service.checkFight(Fight_Service.CMD_Type.FIGHT_REQ,body.json, function(code, retlist, rewardList, detail){
			if(code==200) 
				BS.netservice.simpleJSON(path, intime, res, {code:200, data: retlist ,rewardList: rewardList, detail: detail});
			else
				BS.netservice.simpleJSON(path, intime, res, {code:code, msg: retlist });
		});
	});

	BS.netservice.get("/check/fight/douji", function (path, intime, req, res) {
		var body=req.body; if(!body) {BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n }); return;}
			
		var uid=NaN;
		if (body.uid) {
			uid=parseInt(body.uid);
		}
		if (isNaN(uid)) {
			BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n });
			return;
		} 

		var session = BS._SESSIONS[uid];
		if (!session) {
			BS.netservice.simpleJSON(path, intime, res, {code:203, msg: BS.server_resp_hash[1].n });
			return;
		}
		

		Fight_Service.checkFight(Fight_Service.CMD_Type.DOUJI_REQ,body.json, function(code, retlist){
			if(code==200) 
				BS.netservice.simpleJSON(path, intime, res, {code:200, data: retlist});
			else
				BS.netservice.simpleJSON(path, intime, res, {code:code, msg: retlist });
		});
	});

	BS.netservice.get("/check/fight/dianfeng", function (path, intime, req, res) {
		var body=req.body; if(!body) {BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n }); return;}
			
		var uid=NaN;
		if (body.uid) {
			uid=parseInt(body.uid);
		}
		if (isNaN(uid)) {
			BS.netservice.simpleJSON(path, intime, res, {code:202, msg: BS.server_resp_hash[2].n });
			return;
		} 

		var session = BS._SESSIONS[uid];
		if (!session) {
			BS.netservice.simpleJSON(path, intime, res, {code:203, msg: BS.server_resp_hash[1].n });
			return;
		}
		

		Fight_Service.checkFight(Fight_Service.CMD_Type.DIANFENG_REQ,body.json, function(code, retlist,hp_List){
			if(code==200) 
				BS.netservice.simpleJSON(path, intime, res, {code:200, data: retlist,hp:hp_List});
			else
				BS.netservice.simpleJSON(path, intime, res, {code:code, msg: retlist });
		});
	});
}



