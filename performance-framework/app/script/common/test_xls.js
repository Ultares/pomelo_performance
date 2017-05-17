var xlsx = require('xlsx');
var fs = require('fs');
var data = [[1, 2], [true, false], ['foo', 'bar'], ['baz', null, 'qux']];
var buffer = xlsx.build([{name: "mySheetName", data: data}]);
fs.writeFile('user.xlsx', buffer, 'binary');



