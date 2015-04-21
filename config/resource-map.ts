///<reference path="../typings/vendor.d.ts" />
import S3Object = require('../lib/resource/aws/s3/S3Object');
import FileProvider = require('../lib/resource/system/file/FileProvider');
import GitArchiveProvider = require('../lib/resource/system/file/GitArchiveProvider');
import S3Bucket = require('../lib/resource/aws/s3/S3Bucket');
import SqsQueue = require('../lib/resource/aws/sqs/SqsQueue');
import AppVersion = require('../lib/resource/aws/elasticbeanstalk/EbAppVersion');
import EbEnvironment = require('../lib/resource/aws/elasticbeanstalk/EbEnvironment');

var resourceMap:any = {
  FileProvider: FileProvider,
  GitArchiveProvider: GitArchiveProvider,
  S3Bucket: S3Bucket,
  S3Object: S3Object,
  SqsQueue: SqsQueue,
  AppVersion: AppVersion,
  EbEnvironment: EbEnvironment
};
export = resourceMap;