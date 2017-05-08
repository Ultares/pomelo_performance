/**
 * Created by guangwei.lin on 2016/8/30.
 */
var querystring = require('querystring');
var param = 'http://gundam.kr.beta2.mobage.tw/gundam_server/htdocs/index.php?command%3dArena%26action%3dSaveBattleInfo%26user_id%3d100100279694%26is_win%3d1%26target_rank%3d8%26battle_info%3d%7b%22battle_type%22%3a1%2c%22attack_userid%22%3a100100279694%2c%22attack_icon%22%3a0%2c%22attack_name%22%3a%22W0dNXea1i%252BivlTI%253D%22%2c%22attack_level%22%3a60%2c%22attack_robots%22%3a%22100100279694%2c30470%2c1001%2c1%2c0%2c9%2c1%2c14653%2c0%2c0%2c0%2c0%2c0%2c0%2c1%2c1%2c1%2c1%2c1%2c1%2c743%2c20%2c0%2c0%2c0%2c0%2c0%2c%3b100100279694%2c1027867%2c1020%2c1%2c0%2c9%2c5%2c0%2c0%2c0%2c0%2c0%2c0%2c0%2c1%2c1%2c1%2c1%2c0%2c0%2c833%2c20%2c0%2c0%2c0%2c0%2c0%2c%3b100100279694%2c1027868%2c1030%2c60%2c0%2c9%2c5%2c0%2c0%2c0%2c0%2c0%2c0%2c0%2c1%2c1%2c1%2c1%2c0%2c0%2c2790%2c20%2c0%2c0%2c0%2c0%2c0%2c%3b%22%2c%22attack_drivers%22%3a%2214653%2c100100279694%2c30470%2c9001%2c1%2c0%2c1%2c3%2c0%2c0%2c0%2c0%2c0%2c0%2c84%2c1471232547%2c0%2c1%2c0%2c0%2c0%2c0%3b%22%2c%22attack_haros%22%3a%22%22%2c%22attack_leader%22%3a0%2c%22attack_talent%22%3a%22%22%2c%22attack_random%22%3a32%2c%22defend_userid%22%3a100100279627%2c%22defend_icon%22%3a0%2c%22defend_name%22%3a%22W0dNXea1i%252BivlTE%253D%22%2c%22defend_level%22%3a60%2c%22defend_robots%22%3a%22100100279627%2c30469%2c1001%2c60%2c0%2c9%2c5%2c14652%2c0%2c0%2c0%2c0%2c0%2c0%2c1%2c1%2c1%2c1%2c1%2c1%2c2238%2c20%2c0%2c0%2c0%2c0%2c0%2c%3b%22%2c%22defend_drivers%22%3a%2214652%2c100100279627%2c30469%2c9001%2c1%2c0%2c1%2c3%2c0%2c0%2c0%2c0%2c0%2c0%2c84%2c1471232547%2c0%2c1%2c0%2c0%2c0%2c0%3b%22%2c%22defend_haros%22%3a%22%22%2c%22defend_leader%22%3a30469%2c%22defend_talent%22%3a%22%22%2c%22defend_random%22%3a14%2c%22map_id%22%3a%2290083%22%7d%26check_info%3d1%26Token%3dC874557F574C6384490B99F4094A95CD%26platform_id%3d1983001230%26version%3d1001%26Validate%3d0.81860295721265_10';
var pmt = {
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
};
var list_id = 'user_id_list%3d%7b%221%22%3a100100001193%7d';
console.log(querystring.escape(querystring.unescape(querystring.stringify(pmt))));
console.log(querystring.unescape(list_id));