var ElasticBeanstalk = require('./eb/EbEnvironment'),

	ConfigError = require('./error/ConfigError');

var services = [
	ElasticBeanstalk
];

function getAwsService(resourceConfig) {
	var foundServices = services.filter(function(service) {
		return service.isForConfig(resourceConfig)
	});
	if(foundServices.length === 1) {
		return new foundServices[0](resourceConfig);
	}
	else {
		throw new ConfigError('resources[]', "The following resource entry couldn't find an AWS service to handle it: " + JSON.stringify(resourceConfig));
	}
}

module.exports = {
	getAwsService: getAwsService
};