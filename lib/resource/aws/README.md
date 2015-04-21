#Amazon Web Services (AWS) Resources

These are deployable resources that correspond to Amazon Web Services resources. We use the AWS SDK to deploy and get 
status about these resources.

__Supported resources:__

##ElasticBeanstalk
ElasticBeanstalk combines several AWS resources and manages them in a common interface. It helps to simply code deployment
and create auto scaling environments. Configuring these environments is rather cumbersome, however. ElasticBeanstalk has
it's own configuration but these configurations are not editable after being saved and have caused many deployment issues.

###Dependencies

 * [ElasticBeanstalk Application Version](#elasticbeanstalkapplicationversion)
 
###Example
 
##ElasticBeanstalk Application Version
An ElasticBeanstalk Application Version represents a bundled version of deployable code. This is typically a reference 
to a Git Archive on S3 but provides some additional meta data.

###Dependencies

 * [S3](#s3)

###Example

##S3
Cloud file storage. Useful for storing [ElasticBeanstalk Application Versions](#elasticbeanstalkapplicationversion)

###Example

##SQS
Simple Queue System is used as a simple server to server messaging platform. Many senders to many workers (recievers) makes
this a solid and scalable messaging solution. [ElasticBeanstalk](#elasticbeanstalk) Worker type instances may listen
to queues to process messages.