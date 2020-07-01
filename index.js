const core = require('@actions/core');
const aws = require('aws-sdk');

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;

const path = core.getInput('PATH');
const exportPrefix = core.getInput('EXPORT_PREFIX');

if (!AWS_ACCESS_KEY_ID) {
  core.setFailed('The env AWS_ACCESS_KEY_ID was not set.');
}
if (!AWS_SECRET_ACCESS_KEY) {
  core.setFailed('The env AWS_SECRET_ACCESS_KEY was not set.');
}
if (!AWS_DEFAULT_REGION) {
  core.setFailed('The env AWS_DEFAULT_REGION was not set.');
}

const ssm = new aws.SSM({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_DEFAULT_REGION,
});

const getParametersByPath = async (ssm, path) => ssm.getParametersByPath({ Path: path });

getParametersByPath(ssm, path).promise().then(response => {
  response.Parameters.forEach((parameter) => {
    const sanitizedName = parameter.Name.replace(path, '').replace('/', '');
    core.exportVariable(`${exportPrefix}${sanitizedName}`, parameter.Value);
  });
}).catch(err => {
  core.setFailed(err);
});

exports.getParametersByPath = getParametersByPath;
