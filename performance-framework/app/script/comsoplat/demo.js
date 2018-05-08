var Client = require('dena-client').comsoplat;
var async = require('async');

var robot = new Client();
var appId = '460434087334456';

var START = 'start';
var END = 'end';

robot.init({host: 'diy.cosmoplat.com', port: 80}, function () {
    robot.run();
});

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

// robot.log('debug', JSON.stringify(actor));
function monitorRequest(opts, cb) {
    var isMonitor = (opts.isMonitor == undefined) ? true : opts.isMonitor;
    isMonitor && monitor(START, opts.r, '1');
    robot.httpRequest(opts.r, opts.qOpts,
        function (status, data) {
            isMonitor && monitor(END, opts.r, '1');
            if (status == 200) {
                robot.caseData.previous = true;
            } else {
                console.log(status, data);
            }
            opts = undefined;
            cb();
        }
    );
}
robot.caseData.previous = true;
robot.actions.push(
    //  http://123.103.113.24/admin/index/user/login
    //  http://diy.cosmoplat.com/pc/goods/list?shopId=14
    function () {

        if (!robot.caseData.previous) {
            return 1;
        }
        if (robot.caseData.loopCount <= 0) {
            robot.log('robot.caseData.loopCount:' + robot.caseData.loopCount);
            return undefined;
        }
        robot.caseData.previous = false;
        robot.funcseries = [];
        if (robot.caseData.ratemode) {
            robot.funcmap = {
                Info: {
                    funcArray: [goodsList], rate: 1
                }
            };
            robot.willTest = [];
            robot.endRate = 8;
            var i = 0;
            while (i <= 10) {
                for (var k in robot.funcmap) {
                    var rate = getRandomInt(1, robot.endRate);
                    robot.log('rate is <%s> and k.rate is <%s> ', rate, robot.funcmap[k].rate);
                    if (rate <= robot.funcmap[k].rate) {
                        robot.willTest = robot.willTest.concat(robot.funcmap[k].funcArray);
                    }
                }
                if (robot.willTest.length) {
                    robot.log('Random <%s> time(s)', i);
                    break;
                }
                i++;
            }
            robot.log('robot.willTest is ', robot.willTest.length);
            robot.funcArray = robot.willTest;
        } else {
            robot.funcArray =
                [
                    indexList,
                    search,
                    homepage,
                    goodsList,
                    ideaDetail,
                    goodsDetail,
                    designerDetail
                ];
        }
        robot.funcArray.forEach(function (element, index, array) {
            var func = function (cb) {
                setTimeout(element, robot.randomIntTime(), cb);
            };
            robot.funcseries.push(func)
        });

        async.series(robot.funcseries,
            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    robot.caseData.previous = true;
                    robot.caseData.loopCount -= 1;
                }
            }
        );

        function goodsList(cb) {
            monitorRequest({
                r: '/pc/goods/list?',
                qOpts: {shopId: 14}
            }, cb);
        }

        // http://diy.cosmoplat.com/pc/community/homepage
        function homepage(cb) {
            monitorRequest({
                r: '/pc/community/homepage',
                qOpts: {}
            }, cb);
        }

        // http://diy.cosmoplat.com/raphael/
        function raphael(cb) {
            monitorRequest({
                r: '/raphael/',
                qOpts: {}
            }, cb);
        }

        // http://diy.cosmoplat.com/pc/goods/detail?productId=826
        function goodsDetail(cb) {
            monitorRequest({
                r: '/pc/goods/detail?',
                qOpts: {productId: 826}
            }, cb);
        }

        // http://diy.cosmoplat.com/raphael/designer/detail/?id=35
        function designerDetail(cb) {
            monitorRequest({
                r: '/raphael/designer/detail/?',
                qOpts: {id: 35}  // 35-39
            }, cb);
        }

        // http://diy.cosmoplat.com/raphael/idea/detail/?id=2489
        function ideaDetail(cb) {
            monitorRequest({
                r: '/raphael/idea/detail/?',
                qOpts: {id: 2489}  // 35-39
            }, cb);
        }

        // http://diy.cosmoplat.com/pc/index/list
        function indexList(cb) {
            monitorRequest({
                r: '/pc/index/list',
                qOpts: {}  // 35-39
            }, cb);
        }

        // http://diy.cosmoplat.com/pc/customize/category
        function customizeCategory(cb) {
            monitorRequest({
                r: '/pc/customize/category',
                qOpts: {}
            }, cb);
        }

        // http://diy.cosmoplat.com/pc/search/results?search=123&type=1
        function search(cb) {
            monitorRequest({
                r: '/pc/search/results?',
                qOpts: {
                    search: 123,
                    type: 1  // 1 商品 2 作品 3 创意 4 设计师  b 相关推荐
                }
            }, cb);
        }

        return 1;
    },

    function () {
        setTimeout(function () {
            robot.log('end...');
        }, robot.responseOverTime);
    }
);

