# v0.5.2

* FIX: Fix issue caused by `npm postinstall` script, when trying to install tsd typings. 

# v0.5.1

* MOD: Updated README.md for better display on npm, and added sponsorship.

# v0.5.0

* ADD: AWS Cloudwatch for alerting

# v0.4.0

* ADD: SqsQueue#setPolicy()

# v0.3.0

* ADD: EbEnvironment#waitUntilReady()
* ADD: EbEnvironment#getQueue()
* ADD: EbEnvironment#updateEventVariables()
* ADD: Logger utility
* ADD: Trace logs for several resources
* MOD: EB worker environments no longer require SQS Queue config
* MOD: S3Object uses a ManagedUpload, and logs progress


# v0.2.0

* ADD: `imports` config. Allows you to import other PushButton configs.
* FIX: 'json' plugin now resolves object references before stringifying objects.

# v0.1.1

* FIX: Fix npm script and dependencies, so that TypeScript stuff
       is all compiled on post-install.

# v0.1.0

**Initial release of PushButton**

Core features:

* Configurable resources, which deploy to various environments (mostly AWS)
* `ConfigManger`, which wires together resources. Supports dependency injection.
* `ConfigParser`, for simplifying and humanizing AWS configurations
* `ResourceCollection`, which wires together resources from a config,
  and deploys them sequentially.
* `push-button` binary, which will process a `PushButton.json` file in your
  working directory, and deploy the configured resources.