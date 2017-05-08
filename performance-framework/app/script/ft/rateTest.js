var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567';

var random_base64 = function random_base64(length) {
    var str = "";
    for (var i = 0; i < length; ++i) {
        var rand = Math.floor(Math.random() * ALPHABET.length);
        str += ALPHABET.substring(rand, rand + 1);
    }
    return str;
};

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function test() {

    var result = {};
    for (var i = 0; i <= 9; i++) {
        result['r' + i] = 0
    }
    result.r0 = {rate: 500, rt: 0};
    result.r1 = {rate: 200, rt: 0};
    result.r2 = {rate: 100, rt: 0};
    result.r3 = {rate: 50, rt: 0};
    result.r4 = {rate: 50, rt: 0};
    result.r5 = {rate: 25, rt: 0};
    result.r6 = {rate: 25, rt: 0};
    result.r7 = {rate: 20, rt: 0};
    result.r8 = {rate: 15, rt: 0};
    result.r9 = {rate: 15, rt: 0};


    console.log('result====><%s>', JSON.stringify(result));
    var times = 10000;
    for (var i = 0; i < times; i++) {
        console.log('====>%s<====', i);
        for (var j = 0; j < 10; j++) {
            var test = getRandomInt(1, 1000);
            console.log('====>%s<====', test);
            if (test <= result['r' + j].rate) {
                result['r' + j].rt = result['r' + j].rt + 1;
            }
        }
    }
    console.log('result====><%s>', JSON.stringify(result));
}

test();