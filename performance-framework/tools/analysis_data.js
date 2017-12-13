/**
 * Created by pc on 2017/12/6.
 */
var xlsx = require('node-xlsx');
var path = require('path');
var fs = require('fs');
var fn = "M_Basic_property.xlsx"; // M_Basic_property.xlsx
function read_excel(fn, index) {
    var _index = index || 0;
    var obj = xlsx.parse(fn);
    var info = {};
    var data = obj[_index].data;
    // console.log(JSON.stringify(data));
    for (var j in data) {
        // console.log(j + ' :' + JSON.stringify(data[j]));
        if (typeof data[j][0] == 'number') {
            info[data[j][0]] = data[j].slice(1,4);
            // console.log(j + ' :' + JSON.stringify(data[j]));
        }
    }
    console.log(JSON.stringify(info));
    return info;
}

function count_data(c_data, fname) {
    var fn = "M_Basic_property.xlsx";
    var info = read_excel(fn);
    console.log(JSON.stringify(info));
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
    }; //1188 Gogoing 866
    var data = [];
    var file = path.resolve('') + '/' + fname + '.xlsx';
    console.log('Filename: ' + file);
    // console.log(JSON.stringify(c_data));
    for (var k  in c_data) {
        console.log(JSON.stringify('es.caseData.gambles:  ' + k));
        if (k in info) {
            console.log(JSON.stringify('qos_count[info[k][1]]:  ' + qos_count[info[k][1]]));
            data.push([Number(k), c_data[k]]);
            pos_count[info[k][2]] += c_data[k];
            qos_count[info[k][1]] += c_data[k];
            total += c_data[k];
        } else {
            console.log('Could not found %s info...', k);
        }
    }
    console.log('pos_count :' + JSON.stringify(pos_count));
    for (var j  in pos_count) {
        data.push([Number(j), pos_count[j]]);
    }
    for (var q  in qos_count) {
        data.push([q, qos_count[q]]);
    }
    // for (var q  in es.caseData.gambles) {
    //     data.push([q, es.caseData.gambles[q]]);
    // }
    //
    data.push(['total', total]);
    var buffer = xlsx.build([{name: fname, data: data}]);
    fs.writeFile(file, buffer, 'binary', {flag: 'a+'});
    console.log('Clear timer!');
    // }, es.caseData.responseOverTime);
}

// function regreaddir(_path) {
//     var stat = fs.lstatSync(_path);
//     console.log(stat.isDirectory());
fs.readdirSync('./').forEach(function (filename) {
    // var fn = path.resolve('') + '/result/' + filename;
    // console.log(filename.toString().indexOf("result"));
    var result = {};
    if (filename.toString().indexOf("result") != -1 ){
        console.log(filename);
        fs.readdirSync('./' + filename +'/result/').forEach(function (fn) {
            // console.log(path.resolve('') +'/' + filename +'/result/' + fn);
            var info = read_excel(path.resolve('') +'/' + filename +'/result/' + fn);
            // console.log(info);
            for (var k in info){
                result[k] = (result[k] == undefined)?Number(info[k]):result[k] + Number(info[k]) ;
            }
        });
        console.log(result);
        count_data(result,filename);
    }
});
// }
read_excel(fn);


