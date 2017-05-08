/**
 * Created by guangwei.lin on 2016/7/18.
 */
var accounts_android = require('./ios_server100');
//var accounts_ios = require('./account_ios');
var fs = require("fs");
var filename = './account_ios_server100.json';

var parseAccountToFile = function (filename, accounts) {
    var all = Object.keys(accounts);
    fs.writeFileSync(filename, '[' + '\n');
    for (var a in all) {
        if (accounts[all[a]]['sakasho.games.637.PLAYER_SERVER_ID'] == 100) {
            var data = [all[a], '100', accounts[all[a]]['sakasho.games.637.LINKAGE_TOKEN']].join('|');
            fs.appendFileSync(filename, JSON.stringify(data));
            if (a != (all.length - 1)) {
                console.log('index %s and length %s!', a, (all.length - 1));
                fs.appendFileSync(filename, ',\n');
            }
        }
    }
    fs.appendFileSync(filename, ']' + '\n');
};
//for (var account in accounts_android) {
//    accounts_ios[account] = accounts_android[account];
//}

parseAccountToFile(filename, accounts_android);


