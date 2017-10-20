"use strict";
var mock = require('mock-fs');
var app;
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;


describe('test', function () {

    describe('when not initialized with a fallback path', function () {

        describe("And the default path is not available", function () {

            beforeEach(function () {
                app = require('..');
                mock({
                    './foo/bar/baz': {
                        'dbuser': 'ionlyread',
                        'dbpass': 'super-duper-secret-pass',
                        'secret-squirrel': 'dbuser=morocco-mole\ndbpass=12345',
                        'invalid-secrets-file': 'just-simple-value',
                        'social-security': '324-12-7812'
                    }
                });
            });

            afterEach(function () {
                app = null;
                mock.restore();
            });

            describe("Reading a single secret", function () {

                describe("With a secret name", function () {

                    describe("And the secret file is not available", function () {
                        it("throws an error", function () {
                            return expect(app.read('missing-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets'");
                        });
                    });

                    describe("And the secret file is available", function () {

                        describe("And the file is not formatted correctly", function () {

                            it("throws an error", function () {
                                return expect(app.read('invalid-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets'");
                            });
                        });

                        describe("And the file is formatted correctly", function () {

                            it("throws an error", function () {
                                return expect(app.read('secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets'");
                            });
                        });

                    });
                });


                describe("Without providing a secret name", function () {
                    it('read-no-file', function () {
                        return expect(app.read()).to.be.rejectedWith('File name cannot be empty');
                    });
                });

            });

            it('readAll', function () {
                return expect(app.readAll()).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets'");
            });

        });

        describe("And the default path is available", function () {

            beforeEach(function () {
                app = require('..');
                mock({
                    '/run/secrets': {
                        'dbuser': 'readonly',
                        'dbpass': 'super-secret-pass',
                        'apiKey': '1234567890',
                        'secrets-file': 'dbuser=admin\ndbpass=another-super-secret-pass\napiKey=123456=ABCD+=',
                        'secret-squirrel': 'dbuser=double-q\ndbpass=9876',
                        'invalid-secrets-file': 'just-simple-value'
                    },
                    './foo/bar/baz': {
                        'dbuser': 'ionlyread',
                        'dbpass': 'super-duper-secret-pass',
                        'secret-squirrel': 'dbuser=morocco-mole\ndbpass=12345',
                        'invalid-secrets-file': 'just-simple-value',
                        'social-security': '324-12-7812'
                    }
                });
            });

            afterEach(function () {
                app = null;
                mock.restore();
            });

            describe("Reading a single secret", function () {

                describe("With a secret name", function () {

                    describe("And the secret file is not available", function () {
                        it("throws an error", function () {
                            return expect(app.read('missing-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets/missing-secrets-file'");
                        });
                    });

                    describe("And the secret file is available", function () {


                        describe("And the file is not formatted correctly", function () {

                            it('should resolve with empty data', function () {
                                return expect(app.read('invalid-secrets-file')).to.eventually.be.empty;
                            });
                        });

                        describe("And the file is formatted correctly", function () {

                            it('should parse into an object', function () {

                                return expect(app.read('secrets-file')).to.eventually.deep.equal({
                                    dbuser: 'admin',
                                    dbpass: 'another-super-secret-pass',
                                    apiKey: '123456=ABCD+='
                                });
                            });
                        });

                    });
                });


                describe("Without providing a secret name", function () {
                    it('read-no-file', function () {
                        return expect(app.read()).to.be.rejectedWith('File name cannot be empty');
                    });

                });


            });



            it('readAll', function () {
                return expect(app.readAll()).to.eventually.deep.equal({
                    dbuser: 'readonly',
                    dbpass: 'super-secret-pass',
                    apiKey: '1234567890',
                    'secrets-file': 'dbuser=admin\ndbpass=another-super-secret-pass\napiKey=123456=ABCD+=',
                    'secret-squirrel': 'dbuser=double-q\ndbpass=9876',
                    'invalid-secrets-file': 'just-simple-value'
                });
            });


        });


    });

    describe('when initialized with a fallback path', function () {


        describe("And the default path is not available", function () {

            describe("And the fallback path is available", function () {

                beforeEach(function () {
                    app = require('..');
                    mock({
                        './foo/bar/baz': {
                            'dbuser': 'ionlyread',
                            'dbpass': 'super-duper-secret-pass',
                            'secret-squirrel': 'dbuser=morocco-mole\ndbpass=12345',
                            'invalid-secrets-file': 'just-simple-value',
                            'social-security': '324-12-7812'
                        }
                    });

                    app.init({fallbackPath: './foo/bar/baz'});
                });

                afterEach(function () {
                    app = null;
                    mock.restore();
                });

                describe("Reading a single secret", function () {

                    describe("With a secret name", function () {

                        describe("And the secret file is not available", function () {
                            it("throws an error", function () {
                                return expect(app.read('missing-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory 'foo/bar/baz/missing-secrets-file'");
                            });
                        });

                        describe("And the secret file is available", function () {


                            describe("And the file is not formatted correctly", function () {

                                it('should resolve with empty data', function () {
                                    return expect(app.read('invalid-secrets-file')).to.eventually.be.empty;
                                });
                            });

                            describe("And the file is formatted correctly", function () {

                                it('should parse into an object', function () {

                                    return expect(app.read('secret-squirrel')).to.eventually.deep.equal({
                                        dbuser: 'morocco-mole',
                                        dbpass: '12345'
                                    });
                                });
                            });

                        });
                    });


                    describe("Without providing a secret name", function () {
                        it('read-no-file', function () {
                            return expect(app.read()).to.be.rejectedWith('File name cannot be empty');
                        });

                    });


                });

                it('readAll', function () {

                    return expect(app.readAll()).to.eventually.deep.equal({
                        dbuser: 'ionlyread',
                        dbpass: 'super-duper-secret-pass',
                        'secret-squirrel': 'dbuser=morocco-mole\ndbpass=12345',
                        'invalid-secrets-file': 'just-simple-value',
                        'social-security': '324-12-7812'
                    });
                });
            });


            describe("And the fallback path is not available", function () {

                beforeEach(function () {
                    app = require('..');
                    mock({

                    });

                    app.init({fallbackPath: './foo/bar/baz'});
                });

                afterEach(function () {
                    app = null;
                    mock.restore();
                });

                describe("Reading a single secret", function () {

                    describe("With a secret name", function () {

                        describe("And the secret file is not available", function () {
                            it("throws an error", function () {
                                return expect(app.read('missing-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory './foo/bar/baz'");
                            });
                        });

                        describe("And the secret file is available", function () {

                            describe("And the file is not formatted correctly", function () {

                                it("throws an error", function () {
                                    return expect(app.read('invalid-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory './foo/bar/baz'");
                                });
                            });

                            describe("And the file is formatted correctly", function () {

                                it("throws an error", function () {
                                    return expect(app.read('secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory './foo/bar/baz'");
                                });
                            });

                        });
                    });


                    describe("Without providing a secret name", function () {
                        it('read-no-file', function () {
                            return expect(app.read()).to.be.rejectedWith('File name cannot be empty');
                        });
                    });

                });

                it('readAll', function () {
                    return expect(app.readAll()).to.be.rejectedWith("ENOENT, no such file or directory './foo/bar/baz'");
                });

            });


        });

        describe("And the default path is available", function () {

            beforeEach(function () {
                app = require('..');
                mock({
                    '/run/secrets': {
                        'dbuser': 'readonly',
                        'dbpass': 'super-secret-pass',
                        'apiKey': '1234567890',
                        'secrets-file': 'dbuser=admin\ndbpass=another-super-secret-pass\napiKey=123456=ABCD+=',
                        'secret-squirrel': 'dbuser=double-q\ndbpass=9876',
                        'invalid-secrets-file': 'just-simple-value'
                    },
                    './foo/bar/baz': {
                        'dbuser': 'ionlyread',
                        'dbpass': 'super-duper-secret-pass',
                        'secret-squirrel': 'dbuser=morocco-mole\ndbpass=12345',
                        'invalid-secrets-file': 'just-simple-value',
                        'social-security': '324-12-7812'
                    }
                });

                app.init({fallbackPath: './foo/bar/baz'});
            });

            afterEach(function () {
                app = null;
                mock.restore();
            });

            describe("Reading a single secret", function () {

                describe("With a secret name", function () {

                    describe("And the secret file is not available", function () {
                        it("throws an error", function () {
                            return expect(app.read('missing-secrets-file')).to.be.rejectedWith("ENOENT, no such file or directory '/run/secrets/missing-secrets-file'");
                        });
                    });

                    describe("And the secret file is available", function () {


                        describe("And the file is not formatted correctly", function () {

                            it('should resolve with empty data', function () {
                                return expect(app.read('invalid-secrets-file')).to.eventually.be.empty;
                            });
                        });

                        describe("And the file is formatted correctly", function () {

                            it('should parse into an object', function () {

                                return expect(app.read('secrets-file')).to.eventually.deep.equal({
                                    dbuser: 'admin',
                                    dbpass: 'another-super-secret-pass',
                                    apiKey: '123456=ABCD+='
                                });
                            });
                        });

                    });
                });


                describe("Without providing a secret name", function () {
                    it('read-no-file', function () {
                        return expect(app.read()).to.be.rejectedWith('File name cannot be empty');
                    });

                });


            });



            it('readAll', function () {
                return expect(app.readAll()).to.eventually.deep.equal({
                    dbuser: 'readonly',
                    dbpass: 'super-secret-pass',
                    apiKey: '1234567890',
                    'secrets-file': 'dbuser=admin\ndbpass=another-super-secret-pass\napiKey=123456=ABCD+=',
                    'secret-squirrel': 'dbuser=double-q\ndbpass=9876',
                    'invalid-secrets-file': 'just-simple-value'
                });
            });


        });
    });
});
