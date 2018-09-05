'use strict';
const Controller = require('egg').Controller;
const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload
} = require('forge-apis');

const { getClient, getInternalToken } = require('./token.js');
class JobsController extends Controller {
  async use(req, res, next) {
    const token = await getInternalToken();
    req.oauth_token = token;
    req.oauth_client = getClient();
    next();
  }

  async create(req, res, next) {
    const job = new JobPayload();
    job.input = new JobPayloadInput();
    job.input.urn = req.body.objectName;
    job.output = new JobPayloadOutput([
      new JobSvfOutputPayload()
    ]);
    job.output.formats[0].type = 'svf';
    job.output.formats[0].views = ['2d', '3d'];
    try {
      // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
      await new DerivativesApi().translate(job, {}, req.oauth_client, req.oauth_token);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = JobsController;