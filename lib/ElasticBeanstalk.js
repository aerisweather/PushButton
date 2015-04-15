var AWS = require('aws-sdk'),

	InvalidInputError = require('./error/InvalidInputError');
require('when/es6-shim/Promise');


function ElasticBeanstalk(resourceConfig) {
	this.config = resourceConfig;
	this.eb = new AWS.ElasticBeanstalk({region: this.config.region});
}

ElasticBeanstalk.isForConfig = function(resourceConfig) {
	return resourceConfig.type === "EB";
};

/**
 *
 * @returns {Window.Promise}
 */
ElasticBeanstalk.prototype.deploy = function() {
	return new Promise(function(resolve, reject){

	});
};


/**
 *
 * @returns {Promise}
 */
ElasticBeanstalk.prototype.validateApplicationName = function (applicationName) {
	return new Promise(function(resolve, reject) {
		this.eb.describeApplications({}, function (err, data) {
			if (err) {
				reject(err);
				return;
			} // an error occurred
			else {
				if(data.Applications) {
					var validApplications = data.Applications.filter(function(appData) {
						return appData.ApplicationName === applicationName;
					});
					if(validApplications.length === 1) {
						resolve(true);
						return;
					}
					else {
						var availableApplications = data.Applications.map(function(appData) {
							return appData.ApplicationName;
						});

						reject(new InvalidInputError('application', "Application was not found for this account. Try one of the following: \n\t\t" + availableApplications.join("\n\t\t")));
					}
				}
				resolve(false);
				console.log(data);           // successful response
			}
		});
	}.bind(this));
};

module.exports = ElasticBeanstalk;


