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