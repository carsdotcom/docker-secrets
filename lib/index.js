"use strict";

const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const SECRETS_DIR = '/run/secrets';

let fallbackInitDir;

function getFile(file) {
    if (!file) {
        return Promise.reject("File name cannot be empty");
    }
    return getDirPathToSecrets().then(secretsDir => {
        return fs.readFileAsync(path.join(secretsDir, file), 'utf-8');
    });
}

function read(secretFile) {
    var secrets = {};

    return getFile(secretFile).then((content) => {
        _.each(_.split(content, '\n'), (value) => {
            if (value) {
                var parts = value.split("=");
                if (parts.length > 1) {
                    secrets[parts.shift()] = parts.join("=");
                }
            }
        });
        return secrets;
    });
}

function readAll() {
    var secrets = {};
    return getDirPathToSecrets().then(secretsDir => {
        return fs.readdirAsync(secretsDir).map((fileName) => {
            return fs.readFileAsync(path.join(secretsDir, fileName), 'utf-8')
                .then((content) => {
                    return {
                        name: fileName,
                        content: content
                    };
                });
        }).each((result) => {
            secrets[result.name] = result.content.trim();
        }).then(() => {
            return secrets;
        });
    });
}

function init(config) {
    if (config.fallbackPath) {
        fallbackInitDir = config.fallbackPath;
    }
}

function getDirPathToSecrets() {
    return fs.accessAsync(SECRETS_DIR, fs.constants.R_OK)
        .then(() => {
            return SECRETS_DIR;
        })
        .catch(function(err){
            if (fallbackInitDir) {
                return fs.accessAsync(fallbackInitDir, fs.constants.R_OK)
                    .then(() => {
                        return fallbackInitDir;
                    });
            }
            throw err;
        });
}

module.exports = {
    init,
    read,
    readAll
};
