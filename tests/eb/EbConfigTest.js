var _ = require('lodash'),
	assert = require('assert'),
	ConfigError = require('../../lib/error/ConfigError'),
	EbConfig = require('../../lib/eb/EbConfig'),
	fs = require('fs-extra'),
	path = require('path');

describe("EbConfigTest", function () {
	beforeEach(function () {

	});

	afterEach(function () {

	});

	describe("getTier", function () {
		it("should get Worker tier", function () {
			var tier = EbConfig.getTier("Worker", getTiersMock());
			assert.ok(_.isEqual(tier, {
				"Name":    "Worker",
				"Type":    "SQS/HTTP",
				"Version": "1.0"
			}));
		});

		it("should get WebServer tier", function () {
			var tier = EbConfig.getTier("WebServer", getTiersMock());
			assert.ok(_.isEqual(tier, {
				"Name":    "WebServer",
				"Type":    "Standard",
				"Version": "1.0"
			}));
		});

		it("should throw an error if tier doesn't exist", function () {
			assert.throws(function () {
				EbConfig.getTier("Nope", getTiersMock());
			}, ConfigError, "Invalid type didn't throw an error");
		});
	});

	describe("getOptionsConfigMap", function () {
		it("should map a single property", function () {
			var optionsConfigMap = getEbConfigMapReal();
			var config = {
				scaling: {
					size: {
						min: 2
					}
				}
			};
			var options = EbConfig.getOptionsConfigMap(config, optionsConfigMap);
			assert.equal(options.length, 1);
			assert.ok(_.isEqual(options[0], {
				"Namespace":  "aws:autoscaling:asg",
				"OptionName": "MinSize",
				"Value":      2
			}))
		});

		it("should map a several properties", function () {
			var optionsConfigMap = getEbConfigMapReal();
			var config = {
				scaling:      {
					cooldown: 100,
					trigger:  {
						metric: 'CPUUtilization'
					}
				},
				phpContainer: {
					document_root: '/var/www/public'
				}
			};
			var options = EbConfig.getOptionsConfigMap(config, optionsConfigMap);
			assert.equal(options.length, 3);
			assert.ok(_.isEqual(options[0], {
				"Namespace":  "aws:autoscaling:asg",
				"OptionName": "Cooldown",
				"Value":      100
			}));
			assert.ok(_.isEqual(options[1], {
				"Namespace":  "aws:autoscaling:trigger",
				"OptionName": "MeasureName",
				"Value":      "CPUUtilization"
			}));
			assert.ok(_.isEqual(options[2], {
				"Namespace":  "aws:elasticbeanstalk:container:php:phpini",
				"OptionName": "document_root",
				"Value":      '/var/www/public'
			}));
		});
	});

	describe("getLatestSolutionStack", function () {
		it("Should get latest PHP Solution Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			var solutionStack = ebConfig.getLatestSolutionStack("64bit Amazon Linux", "PHP 5.5")
				.then(function(solutionStack) {
					assert.equal(solutionStack, "64bit Amazon Linux 2015.03 v1.3.0 running PHP 5.5");
					done();
				});
		});
		it("Should get latest Node.js Solution Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			var solutionStack = ebConfig.getLatestSolutionStack("64bit Amazon Linux", "Node.js")
				.then(function(solutionStack) {
					assert.equal(solutionStack, "64bit Amazon Linux 2015.03 v1.3.0 running Node.js");
					done();
				});
		});
		it("Should throw an error when it can't find a Stack", function (done) {
			var ebConfig = new EbConfig(getEbMock());
			ebConfig.getLatestSolutionStack("128bit Amazon Linux", "Nope")
				.then(function() {
					//Shouldn't get here
					assert.ok(false, "Invalid solution stack didn't throw an error");
					done();
				})
				.catch(function(e) {
					assert.ok(true);
					done();
				});
		});

	});
});

function getEbConfigMapReal() {
	return fs.readJsonSync(path.join(__dirname, '..', '..', 'config', 'eb-config-map.json'));
}

function getTiersMock() {
	return {
		"WebServer": {
			"Name":    "WebServer",
			"Type":    "Standard",
			"Version": "1.0"
		},
		"Worker":    {
			"Name":    "Worker",
			"Type":    "SQS/HTTP",
			"Version": "1.0"
		}
	};
}

/**
 * Gets an mock for the AWS EB service.
 *
 * @returns {{listAvailableSolutionStacks: Function}}
 */
function getEbMock() {
	return {
		listAvailableSolutionStacks: function (callback) {
			callback(null, {
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
			})
		}
	}
}