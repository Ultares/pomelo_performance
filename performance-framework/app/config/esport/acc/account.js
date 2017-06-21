/**
 * Created by pc on 2017/5/15.
 */
var fs = require('fs');

var filename = 'gamble.json';
var pre = 'Test_';

function genAccount(count) {
    var i = 0;
    var count_length = JSON.stringify(count).length;
    fs.appendFileSync(filename, '[' + '\r\n');
    while (count) {
        var i_str = pre;
        length = count_length - JSON.stringify(i).length - 1;
        while (length) {
            i_str += '0';
            length -= 1;
        }
        i_str += JSON.stringify(i);
        console.log(i_str);
        if (count - 1) {
            i_str = '\"' + i_str + '\",\r\n'
        } else {
            i_str = '\"' + i_str + '\"\r\n'
        }
        fs.appendFileSync(filename, i_str);
        count -= 1;
        i += 1;
    }
    fs.appendFileSync(filename, ']' + '\r\n');
}

genAccount(1000);