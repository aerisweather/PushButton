import AWS = require('aws-sdk');
import lift = require('../../../../util/lift');

class EbLifted {

	protected eb:AWS.ElasticBeanstalk;
	public createEbEnvironment:(params:AWS.ElasticBeanstalk.Params.createEnvironment) => any;
	public describeApplications:(...params:any[]) => any;
	public describeEnvironments:(...params:any[]) => any;
	public describeEnvironmentOptions:(...params:any[]) => any;
	public listAvailableSolutionStacks;

	constructor(ebConfig) {
		this.eb = new AWS.ElasticBeanstalk(ebConfig);

		this.createEbEnvironment = lift<any>(this.eb.createEnvironment, this.eb);
		this.describeApplications = lift<any>(this.eb.describeApplications, this.eb);
		this.describeEnvironments = lift<any>(this.eb.describeEnvironments, this.eb);
		this.describeEnvironmentOptions = lift<any>(this.eb.describeEnvironmentOptions, this.eb);
		this.listAvailableSolutionStacks = lift<any>(this.eb.listAvailableSolutionStacks, this.eb);
	}
}

export = EbLifted;