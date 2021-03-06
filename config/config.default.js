'use strict';

var config = require('./config.webgme'),
    validateConfig = require('webgme/config/validator');

// Add/overwrite any additional settings here
// config.server.port = 8080;
// config.mongo.uri = 'mongodb://127.0.0.1:27017/webgme_my_app';

config.requirejsPaths['jointjs'] = './node_modules/jointjs/dist/joint.min';
config.requirejsPaths['lodash'] = './node_modules/lodash/lodash.min';
config.requirejsPaths['jointjscss'] = './node_modules/jointjs/dist/joint';
config.requirejsPaths['dagrejs'] = './node_modules/dagre/dist/dagre.min';
config.requirejsPaths['graphlibjs'] = './node_modules/graphlib/dist/graphlib.min';

validateConfig(config);
config.plugin.allowServerExecution = true;
module.exports = config;
