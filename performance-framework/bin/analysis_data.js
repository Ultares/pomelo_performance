/**
 * Created by pc on 2017/12/6.
 */
var xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var FNS = ["M_Basic_property.xlsx", "M_drop.xlsx", "M_Items_pool.xlsx"];
var EXCELS_DIR = "F:/XLEsports/design/System Value/ForGame/";
var RESULT_DIR = "G:/pomelo_performance/performance-framework/result/";
var Excel_Files = ["M_Items_pool_2220.xlsx", "M_Items_pool_2617.xlsx", "removed_2018.xlsx"];
var IS_DEBUG = false;

function read_excel(fn, index) {
    var _index = index || 0;
    var obj = xlsx.parse(fn);
    return obj[_index].data;
}

function gen_json(data, ki, vfi, vti) {
    var info = {};
    for (var j in data) {
        IS_DEBUG && console.log(j + ' :' + JSON.stringify(data[j]));
        if (typeof data[j][ki] == 'number') {
            info[data[j][ki]] = data[j].slice(vfi, vti);
            IS_DEBUG && console.log(j + ' :' + JSON.stringify(data[j]));
        }
    }
    IS_DEBUG && console.log(JSON.stringify(info));
    return info;
}

function gen_info(data, ki, vfi, vti) {
    var info = {};
    for (var j in data) {
        IS_DEBUG && console.log(j + ' :' + JSON.stringify(data[j]));
        if (typeof data[j][ki] == 'number' && data[j][ki] <= 1006) {
            if (info[data[j][ki]] == undefined) {
                info[data[j][ki]] = [data[j].slice(vfi, vti)[0].split("/")[0]];

            } else {
                info[data[j][ki]].push(data[j].slice(vfi, vti)[0].split("/")[0]);
            }
            // info[data[j][ki]] = data[j].slice(vfi,vti);
            IS_DEBUG && console.log(j + ' :' + JSON.stringify(data[j]));
        }
    }
    IS_DEBUG && console.log(JSON.stringify(info));
    return info;
}

function count_data(c_data, fn) {
    var info = gen_json(read_excel(EXCELS_DIR + FNS[0]), 0, 1, 4);
    IS_DEBUG && console.log(JSON.stringify(info));
    var total = 0;
    var pos_count = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
    };
    var qos_count = {
        "S+": 0,
        "S": 0,
        "A": 0
    };
    var data = [];
    var file = path.resolve('') + '/' + fn + '.xlsx';
    IS_DEBUG || console.log('Filename: ' + file);
    IS_DEBUG && console.log(JSON.stringify(c_data));
    for (var k  in c_data) {
        IS_DEBUG && console.log(JSON.stringify('es.caseData.gambles:  ' + k));
        if (k in info) {
            IS_DEBUG && console.log(JSON.stringify('qos_count[info[k][1]]:  ' + qos_count[info[k][1]]));
            data.push([Number(k), c_data[k]]);
            pos_count[info[k][2]] += c_data[k];
            qos_count[info[k][1]] += c_data[k];
            total += c_data[k];
        } else {
            IS_DEBUG && console.log('Could not found %s info...', k);
        }
    }
    IS_DEBUG && console.log('pos_count :' + JSON.stringify(pos_count));
    for (var j  in pos_count) {
        data.push([Number(j), pos_count[j]]);
    }
    for (var q  in qos_count) {
        data.push([q, qos_count[q]]);
    }
    data.push(['total', total]);
    var buffer = xlsx.build([{name: fn, data: data}]);
    fs.writeFile(file, buffer, 'binary', {flag: 'a+'});
}

function combine_results(des) {
    var _des = des || './';
    var result = {};
    fs.readdirSync(_des).forEach(function (filename) {
        if (filename.toString().indexOf("auto") != -1) {
            IS_DEBUG && console.log(filename);
            var info = gen_json(read_excel(_des + filename), 0, 1, 2);
            for (var k in info) {
                result[k] = (result[k] == undefined) ? Number(info[k]) : result[k] + Number(info[k]);
            }
            IS_DEBUG && console.log(result);
        }
    });
    count_data(result, 'all_result');
}

function tran_data() {
    var types_rate = gen_json(read_excel(EXCELS_DIR + FNS[1]), 1, 10, 11);
    for (t in types_rate) {
        types_rate[t] = types_rate[t][0].replace(/;/g, ",").replace(/\//g, ":");
    }
    console.log(types_rate);
}

function gen_rate() {
    var rates = {};
    var type_role_rate = read_excel(EXCELS_DIR + FNS[2]);
    for (r in type_role_rate) {
        if (typeof type_role_rate[r][1] == "number" && type_role_rate[r][1] <= 100) {
            var _k = type_role_rate[r][1];
            var _v = type_role_rate[r][2].split('/');
            (rates[_k] == undefined) && (rates[_k] = {});
            rates[_k][_v[0]] = _v[2];
        }
    }
    return rates;
}

function check_removed_player() {
// tran_data();
    var dates = read_excel(Excel_Files[0]);
    var info0 = gen_info(read_excel(Excel_Files[0]), 1, 2, 4);
    var info1 = gen_info(read_excel(Excel_Files[1]), 1, 2, 4);
    var info2 = Object.keys(gen_json(read_excel(Excel_Files[2]), 0, 1, 2));

    console.log(JSON.stringify(info2));
    for (var i in info0) {
        if (i in info1) {
            for (var j in info0[i]) {
                if (info1[i].indexOf(info0[i][j]) == -1) {
                    // console.log("type: " + i + " without: " + info0[i][j]);
                    var player_id = (info0[i][j].length == 5)?info0[i][j].slice(1):info0[i][j];
                    if(info2.indexOf(player_id) == -1){
                        console.log("Player id: " + player_id + " removed!" );
                    }else{
                        console.log("Player id is: " + player_id + " removed!" );
                    }
                }
            }
        } else {
            console.log(i + " not in info1");
        }
    }
}

function main(){
    // check_removed_player();
    combine_results(RESULT_DIR);
}
main();