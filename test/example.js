"use strict";
var mock = require('mock-fs');
var app = require('..');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('test', function () {

  before(function() {
    mock({
      '/run/secrets' :{
        'dbuser': 'readonly',
        'dbpass': 'super-secret-pass',
        'apiKey': '1234567890',
        'secrets-file' : 'dbuser=admin\ndbpass=another-super-secret-pass\napiKey=123456=ABCD+=',
        'invalid-secrets-file': 'just-simple-value'
      }
    });
  });

  after(function() {
    mock.restore();
  });

  it('read', function (done) {
    app.read('secrets-file').then((data) => {
      expect(data.dbuser).to.equal('admin');
      expect(data.dbpass).to.equal('another-super-secret-pass');
      expect(data.apiKey).to.equal('123456=ABCD+=');
      done();
    });
  });

  it('read-no-file', function () {
    expect(app.read()).to.be.rejectedWith('File name cannot be empty');
  });

  it('readAll', function (done) {
    app.readAll().then((data) => {
      expect(data.dbuser).to.equal('readonly');
      expect(data.dbpass).to.equal('super-secret-pass');
      expect(data.apiKey).to.equal('1234567890');
      done();
    });
  });

  it('invalid-file', function (done) {
    app.read('invalid-secrets-file').then((data) => {
      expect(data).to.be.empty;
      done();
    });
  });

});


