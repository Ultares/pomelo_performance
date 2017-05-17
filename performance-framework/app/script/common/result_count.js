var path = require('path');
var fs = require('fs');
var xlsx = require('node-xlsx');


function result_count(fp) {
    var _fp = path.resolve('') + fp;
    var o_file = path.resolve('') + fp + 'result_20.xlsx';

    fs.readdir(_fp, function (err, files) {
        if (err) {
            console.log(err);
            return;
        }
        var results = [];
        files.forEach(function (fn) {
            var obj = xlsx.parse(_fp + fn);
            obj.forEach(function (elem) {
                results.push(elem);
            });
        });
        console.log(JSON.stringify(results));
        var buffer = xlsx.build(results);
        fs.writeFile(o_file, buffer, 'binary', {flag: 'a+'});
    });

}
result_count('/_result/result/');