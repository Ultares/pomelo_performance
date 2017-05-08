var fs = require('fs');
var path = require('path');
var Robot = require('dena-robot').Robot;

var envConfig = require('./app/config/env.json');
var config = require('./app/config/' + envConfig.env + '/config');
var server = require('./app/config/' + envConfig.env + '/server');

config.account = require('./app/config/' + envConfig.env + '/acc/' + config.account);
config.server = server[config.server];

config.scripts = [];
fs.readdirSync('./app/script/' + envConfig.env).forEach(function (filename) {
    if (/\.js$/.test(filename)) {
        var script = {
            selected: false,
            itemtext: filename,
            itemvalue: path.basename(filename, '.js')
        };

        if (envConfig.script === filename) {
            script.selected = true;
        }

        config.scripts.push(script);
    }
});

var robot = new Robot(config);
var mode = 'master';

if (process.argv.length > 2) {
    mode = process.argv[2];
}

if (mode !== 'master' && mode !== 'client') {
    throw new Error(' mode must be master or client');
}

if (mode === 'master') {
    robot.runMaster(__filename);
} else {
    robot.runAgent();
}

process.on('uncaughtException', function (err) {
    /* temporary code */
    console.error(' Caught exception: ' + err.stack);
    if (!!robot && !!robot.agent) {
        // robot.agent.socket.emit('crash', err.stack);
    }
    fs.appendFile('./log/.log', err.stack, function (err) {
    });
    /* temporary code */
});