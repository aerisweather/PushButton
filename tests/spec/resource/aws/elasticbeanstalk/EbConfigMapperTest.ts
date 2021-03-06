///<reference path="../../../../../typings/vendor.d.ts" />

import _ = require('lodash');
import assert = require('assert');
import ConfigError = require('../../../../../lib/error/ConfigError');
import EbConfig = require('../../../../../lib/resource/aws/elasticbeanstalk/EbConfigMapper');
import SqsQueue = require('../../../../../lib/resource/aws/sqs/SqsQueue');
import fs = require('fs-extra');
import path = require('path');
import sinon = require('sinon');
import when = require('when');
import EbLifted = require('../../../../../lib/resource/aws/elasticbeanstalk/service/EbLifted');

describe("EbConfigMapper", function () {

	describe("getTier", function () {
		it("should get Worker tier", function () {
			var tier = EbConfig.getTier("Worker", getTiersMock());
			assert.ok(_.isEqual(tier, {
				"Name": "Worker",
				"Type": "SQS/HTTP",
				"Version": "1.0"
			}));
		});

		it("should get WebServer tier", function () {
			var tier = EbConfig.getTier("WebServer", getTiersMock());
			assert.ok(_.isEqual(tier, {
				"Name": "WebServer",
				"Type": "Standard",
				"Version": "1.0"
			}));
		});

		it("should throw an error if tier doesn't exist", function () {
			assert.throws(function () {
				EbConfig.getTier("Nope", getTiersMock());
			}, ConfigError, "Invalid type didn't throw an error");
		});
	});

	describe("getOptionsConfigMapped", function () {
		it("should map a single property", function () {
			var optionsConfigMap = getEbConfigMapReal();
			var config = {
				scaling: {
					size: {
						min: 2
					}
				}
			};
			var options = EbConfig.getOptionsConfigMapped(config, optionsConfigMap);
			assert.equal(options.length, 1);
			assert.ok(_.isEqual(options[0], {
				"Namespace": "aws:autoscaling:asg",
				"OptionName": "MinSize",
				"Value": 2
			}))
		});

		it("should map a several properties", function () {
			var optionsConfigMap = getEbConfigMapReal();
			var config = {
				scaling: {
					cooldown: 100,
					trigger: {
						metric: 'CPUUtilization'
					}
				},
				phpContainer: {
					document_root: '/var/www/public'
				}
			};
			var options = EbConfig.getOptionsConfigMapped(config, optionsConfigMap);
			assert.equal(options.length, 3);
			assert.ok(_.isEqual(options[0], {
				"Namespace": "aws:autoscaling:asg",
				"OptionName": "Cooldown",
				"Value": 100
			}));
			assert.ok(_.isEqual(options[1], {
				"Namespace": "aws:autoscaling:trigger",
				"OptionName": "MeasureName",
				"Value": "CPUUtilization"
			}));
			assert.ok(_.isEqual(options[2], {
				"Namespace": "aws:elasticbeanstalk:container:php:phpini",
				"OptionName": "document_root",
				"Value": '/var/www/public'
			}));
		});

		it("should error when a bad key is given", function () {
			var optionsConfigMap = getEbConfigMapReal();
			var config = {
				scaling: {
					trigger: {
						metric: 'CPUUtilization'
					},
					madeUp: 'n/a'
				},
				phpContainer: {
					document_root: '/var/www/public'
				}
			};
			assert.throws(function () {
				EbConfig.getOptionsConfigMapped(config, optionsConfigMap);
			}, ConfigError, "Didn't throw error when a bad key was given");
		});
	});

	describe("getLatestSolutionStack", function () {
		it("Should get latest PHP Solution Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			var solutionStack = ebConfig.getLatestSolutionStack("64bit Amazon Linux", "PHP 5.5")
				.then(function (solutionStack) {
					assert.equal(solutionStack, "64bit Amazon Linux 2015.03 v1.3.0 running PHP 5.5");
					done();
				});
		});
		it("Should get latest Node.js Solution Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			var solutionStack = ebConfig.getLatestSolutionStack("64bit Amazon Linux", "Node.js")
				.then(function (solutionStack) {
					assert.equal(solutionStack, "64bit Amazon Linux 2015.03 v1.3.0 running Node.js");
					done();
				});
		});
		it("Should throw an error when it can't find a Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			ebConfig.getLatestSolutionStack("128bit Amazon Linux", "Nope")
				.then(function () {
					//Shouldn't get here
					assert.ok(false, "Invalid solution stack didn't throw an error");
					done();
				})
				.catch(function (e) {
					assert.ok(true);
					done();
				});
		});

	});

	describe("getEbCreateConfig", function () {
		it("Should error without Worker having sqsWorker config", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			ebConfig.getEbCreateConfig(getConfigWorkerNoSqs())
				.then(function () {
					assert.ok(false, "Invalid config should throw an error");
				})
				.catch(function (e) {
					assert.ok(true);
					done();
				})
		});

		it("Should error without Worker having sqsWorker config", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			ebConfig.getEbCreateConfig(getConfigWorker())
				.then(function (config) {
					assert.ok(true, "Invalid config should throw an error");
					assert.equal('http://sqs.example.com/sqs-url/blablabla', config.OptionSettings[1].Value);
					done();
				})
				.catch(function (e) {
					assert.ok(false, "Threw an error");
					console.error(e.stack);
					done();
				})
		})
	});
});

function getEbConfigMapReal () {
	return require('../../../../../config/eb-config-map.json');
}

function getTiersMock () {
	return {
		"WebServer": {
			"Name": "WebServer",
			"Type": "Standard",
			"Version": "1.0"
		},
		"Worker": {
			"Name": "Worker",
			"Type": "SQS/HTTP",
			"Version": "1.0"
		}
	};
}

function getConfigWorker () {
	var config = require('./fixture/example-worker.json');

	var queueStub  = sinon.createStubInstance(SqsQueue);
	queueStub['getQueueUrl'] = function() {
		return when('http://sqs.example.com/sqs-url/blablabla');
	};
	config.options.sqsWorker.sqsQueue = queueStub;
	return config;
}

function getConfigWorkerNoSqs () {
	return require('./fixture/example-worker-nosqs.json');
}


/**
 * Gets an mock for the AWS EB service.
 *
 * @returns {{listAvailableSolutionStacks: Function}}
 */
function getEbMock () {
  var ebService = new EbLifted();
  ebService.listAvailableSolutionStacks = function () {
    return when({
      SolutionStacks: [
        "64bit Amazon Linux 2015.03 v1.3.0 running PHP 5.5",
        "64bit Amazon Linux 2015.03 v1.3.0 running PHP 5.4",
        "64bit Amazon Linux 2014.03 v1.1.0 running PHP 5.5",
        "32bit Amazon Linux 2014.03 v1.1.0 running PHP 5.5",
        "64bit Amazon Linux 2014.03 v1.1.0 running PHP 5.4",
        "32bit Amazon Linux 2014.03 v1.1.0 running PHP 5.4",
        "64bit Amazon Linux 2014.03 v1.0.4 running PHP 5.5",
        "64bit Amazon Linux 2014.03 v1.0.4 running PHP 5.4",
        "64bit Amazon Linux 2014.03 v1.0.3 running PHP 5.5",
        "32bit Amazon Linux 2014.03 v1.0.3 running PHP 5.5",
        "64bit Amazon Linux 2014.03 v1.0.3 running PHP 5.4",
        "32bit Amazon Linux 2014.03 v1.0.3 running PHP 5.4",
        "32bit Amazon Linux 2014.02 running PHP 5.5",
        "64bit Amazon Linux 2014.02 running PHP 5.5",
        "32bit Amazon Linux 2014.02 running PHP 5.4",
        "64bit Amazon Linux 2014.02 running PHP 5.4",
        "32bit Amazon Linux 2013.09 running PHP 5.5",
        "64bit Amazon Linux 2013.09 running PHP 5.5",
        "32bit Amazon Linux 2013.09 running PHP 5.4",
        "64bit Amazon Linux 2013.09 running PHP 5.4",
        "32bit Amazon Linux running PHP 5.3",
        "64bit Amazon Linux running PHP 5.3",
        "64bit Amazon Linux 2015.03 v1.3.0 running Node.js",
        "64bit Amazon Linux 2014.03 v1.1.0 running Node.js",
        "32bit Amazon Linux 2014.03 v1.1.0 running Node.js",
        "64bit Windows Server 2008 R2 running IIS 7.5",
        "64bit Windows Server 2012 running IIS 8",
        "64bit Windows Server 2012 R2 running IIS 8.5",
        "64bit Windows Server Core 2012 R2 running IIS 8.5",
        "64bit Amazon Linux 2015.03 v1.3.0 running Tomcat 8 Java 8",
        "64bit Amazon Linux 2015.03 v1.3.0 running Tomcat 7 Java 7",
        "64bit Amazon Linux 2015.03 v1.3.0 running Tomcat 7 Java 6",
        "64bit Amazon Linux 2014.03 v1.1.0 running Tomcat 7 Java 7",
        "32bit Amazon Linux 2014.03 v1.1.0 running Tomcat 7 Java 7",
        "64bit Amazon Linux 2014.03 v1.1.0 running Tomcat 7 Java 6",
        "32bit Amazon Linux 2014.03 v1.1.0 running Tomcat 7 Java 6",
        "32bit Amazon Linux running Tomcat 7",
        "64bit Amazon Linux running Tomcat 7",
        "32bit Amazon Linux running Tomcat 6",
        "64bit Amazon Linux running Tomcat 6",
        "64bit Amazon Linux 2015.03 v1.3.0 running Python 3.4",
        "64bit Amazon Linux 2015.03 v1.3.0 running Python 2.7",
        "64bit Amazon Linux 2015.03 v1.3.0 running Python",
        "64bit Amazon Linux 2014.03 v1.1.0 running Python 2.7",
        "32bit Amazon Linux 2014.03 v1.1.0 running Python 2.7",
        "64bit Amazon Linux 2014.03 v1.1.0 running Python",
        "32bit Amazon Linux 2014.03 v1.1.0 running Python",
        "32bit Amazon Linux running Python",
        "64bit Amazon Linux running Python",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.2 (Puma)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.1 (Puma)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.0 (Puma)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.2 (Passenger Standalone)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.1 (Passenger Standalone)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 2.0 (Passenger Standalone)",
        "64bit Amazon Linux 2015.03 v1.3.0 running Ruby 1.9.3",
        "64bit Amazon Linux 2014.03 v1.1.0 running Ruby 2.1 (Puma)",
        "64bit Amazon Linux 2014.03 v1.1.0 running Ruby 2.1 (Passenger Standalone)",
        "64bit Amazon Linux 2014.03 v1.1.0 running Ruby 2.0 (Puma)",
        "64bit Amazon Linux 2014.03 v1.1.0 running Ruby 2.0 (Passenger Standalone)",
        "64bit Amazon Linux 2014.03 v1.1.0 running Ruby 1.9.3",
        "32bit Amazon Linux 2014.03 v1.1.0 running Ruby 1.9.3",
        "64bit Amazon Linux 2014.09 v1.2.1 running Docker 1.5.0",
        "64bit Amazon Linux 2014.09 v1.2.1 running Multi-container Docker 1.3.3 (Generic)",
        "64bit Amazon Linux 2014.09 v1.2.0 running Multi-container Docker 1.3.3 (Generic)",
        "64bit Debian jessie v1.2.1 running GlassFish 4.1 Java 8 (Preconfigured - Docker)",
        "64bit Debian jessie v1.2.1 running GlassFish 4.0 Java 7 (Preconfigured - Docker)",
        "64bit Debian jessie v1.2.1 running Python 3.4 (Preconfigured - Docker)",
        "64bit Debian jessie v1.2.1 running Go 1.4 (Preconfigured - Docker)",
        "64bit Debian jessie v1.2.1 running Go 1.3 (Preconfigured - Docker)"
      ]
    });
  };

  return ebService;
}