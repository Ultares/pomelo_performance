/**
 * Created by Ares on 2017/9/5.
 */
var uuid = require('uuid');
var async = require('async');
var random = require("random-js")(); // uses the nativeMath engine
var EsportClient = require('dena-client').esport;
var Esport = EsportClient.Esport;
var Protobuf = EsportClient.Protobuf;
var Buffer = require("buffer")["Buffer"];
var http = require("http");
var querystring = require('querystring');

var START = 'start';
var END = 'end';

var es = new Esport();

es.connect(actor.server, function () {  //actor.server
    es.log(actor.actorId + ' :tcp-socket connect to esServer!');
    es.caseData.previous = true;
    es.run();
});

var monitor = function (type, name, reqId) {
    if (typeof actor !== 'undefined') {
        actor.emit(type, name, reqId);
    } else {
        console.error(Array.prototype.slice.call(arguments, 0));
    }
};

var genAccount = function (n) {
    return uuid.v4().toUpperCase().split('-').join('').slice(0, n);
};


function monitorRequest(opts, cb) {
    var isMonitor = (opts.isMonitor == undefined) ? true : opts.isMonitor;
    var req_path = 'http://120.132.22.7:3000/api/Channel/' + opts.r + "?" + querystring.stringify(opts.body);
    isMonitor && monitor(START, opts.r, '1');
    es.log("Request path is :" + req_path);
    http.get(req_path, function (res) {
        var chunk = '';
        res.on('data', function (data) {
            chunk += data;
        });
        res.on('end', function () {
            isMonitor && monitor(END, opts.r, '1');
            try{
                es.caseData[opts.r] = JSON.parse(chunk);
                if (es.caseData[opts.r].error_code == undefined || es.caseData[opts.r].error_code != 0){
                    es.log(JSON.stringify(es.caseData[opts.r]), 'error');
                }
            } catch(SyntaxError){
                es.log(chunk, 'error');
            }

            es.log("Response data is :" + JSON.stringify(es.caseData[opts.r]));
            cb();
        })
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}

es.actions.push(
    function () {
        if (!es.caseData.previous) {
            return 1;
        }
        es.caseData.previous = false;
        es.funcseries = [];
        es.funcArray =
            [
                Register,
                Login,
                SelectServer
            ];

        es.funcArray.forEach(function (element, index, array) {
            var func = function (cb) {
                setTimeout(element, es.randomIntTime(), cb);
            };
            es.funcseries.push(func)
        });

        async.series(es.funcseries,
            function (err) {
                if (err) {
                    console.log('Error====>', err);
                } else {
                    es.caseData.previous = true;
                }
            }
        );

        function Register(cb) {
            es.caseData.account = genAccount(8);
            monitorRequest({
                r: "Register",
                body: {
                    channel: 'xl',
                    account: es.caseData.account,
                    password: '123456',
                    family: 'Normal'
                }
            }, cb);
        }

        function Login(cb) {
            monitorRequest({
                r: "Login",
                body: {
                    channel: 'xl',
                    account: es.caseData.account,
                    password: '123456',
                    family: 'Normal'
                }
            }, cb);
        }

        function SelectServer(cb) {
            monitorRequest({
                r: "SelectServer",
                body: {
                    channel: 'xl',
                    account: es.caseData.Login.account,
                    token : es.caseData.Login.token,
                    global_sid: '5'
                }
            }, cb);
        }
        return 1;
    },

    function () {
        setTimeout(function () {
            console.log('Clear timer!')
        }, es.caseData.responseOverTime);
    }
);
