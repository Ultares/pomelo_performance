var uuid = require('uuid');
var fs = require('fs');

//var getcl = function () {
//    var uid = uuid.v4().toUpperCase().split('-');
//    var cl = uid[0] + uid[uid.length - 1];
//    var clArray = cl.split('');
//    for (var i = 1; i <= cl.length / 5; i++) {
//        clArray[5 * i - 1] = cl.charCodeAt(5 * i - 3) % 10;
//
//    }
//    return clArray.join('');
//};

var getCredential = function () {
    var rData = []
    var uid = uuid.v4().toUpperCase().split('');
    uid.splice(0, 2, 'gg');
    uid = uid.join('');
    console.log('uid====>',uid);
    rData.push(uid);
    rData.push(uid.split('-').join(''));
    var clArray = uid.split('');
    for (var i = 1; i <= (uid.length + 1) / 5; i++) {
        clArray.splice(5 * i - 1, 0, uid.charCodeAt(5 * i - 3) % 10);
        uid = clArray.join('');
        clArray = uid.split('');
    }
    rData.push(clArray.join(''));
    return rData
};


//var account = [];
//
//for (var i = 0; i <= 19999; i++) {
//    var e = getcl();
//    if (e in account) {
//        continue;
//    } else {
//        account.push('\"' + e + '\"');
//        if (account.length == 10000) {
//            break;
//        }
//    }
//}
//
//fs.appendFile('acc.json', account.join(',\n'), function (err) {
//    if (err) {
//        console.log(err);
//    }
//});
var a1 = getCredential();
console.log(a1[0], a1[1], a1[2]);
