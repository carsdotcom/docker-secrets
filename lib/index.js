"use strict";

const _ = require('lodash');
const path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const SECRETS_DIR = '/run/secrets';

function getFile(file) {
  if (file) {
    return fs.readFileAsync(path.join(SECRETS_DIR, file), 'utf-8');
  } else {
    return Promise.reject("File name cannot be empty");
  }
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
  return fs.readdirAsync(SECRETS_DIR).map((fileName) => {
    return fs.readFileAsync(path.join(SECRETS_DIR, fileName), 'utf-8')
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
}

module.exports = {
  read: read,
  readAll: readAll
};
