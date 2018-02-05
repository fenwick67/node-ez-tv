#!/usr/bin/env node
//this file just runs main.js with command line args
var argv = require('yargs').argv;

if (argv.h || argv.help) {
  console.log([
    'usage: node-ez-tv [options]... [file]',
    '',
    'options:',
    '  -p --port    Port to use for web interface [8000]',
    '  -h --help    Print this list and exit.',
    '  -s --show    Override schedule.json and play only the show with this name',
    '',
    'file:',
    '              A JSON file specifying the schedule to run'
  ].join('\n'));
  process.exit();
}

var options = {};

options.port = argv.port || argv.p || 8000;
if(options.port === true){
  options.port = 8000;
}

options.show = argv.show || argv.s || false;
if(options.show === true){
  options.show = false;
}

options.file = argv._[0];

require('./main.js')(options);
