# Push Button

Resource Deployment - Simplified.

Push Button creates cloud resources necessary for running your apps. You provide a JSON config, "push button", and 
resources are created in the cloud.

__This project is sponsored by:__

[![AerisWeather](http://branding.aerisweather.com/logo-dark-small.png)](http://www.aerisweather.com) - Empowering the next generation, [aerisweather.com](https://www.aerisweather.com)

## Supported Vendors:

* [Amazon Web Services (AWS)](lib/resource/aws)

## Specifying AWS Credentials

To use AWS services, you will need to specify your AWS credentials. The easiest way to do this is in a credentials file @ `~/aws/credentials`. It should look something like this:

```
[default]
aws_access_key_id = MY_ACCESS_KEY
aws_secret_access_key = MY_SECRET_KEY
```

If you have multiple profiles in your credentials file, specify the profile before running push button, eg:

```
$ AWS_PROFILE=another-profile push-button -c push-button.json 
```