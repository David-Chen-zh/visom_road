'use strict';
const Controller = require('egg').Controller;
const {
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload
} = require('forge-apis');

class JobsController extends Controller {

  async create(ctx) {
    const job = new JobPayload();
    job.input = new JobPayloadInput();
    job.input.urn = ctx.request.body.objectName;
    job.output = new JobPayloadOutput([
      new JobSvfOutputPayload()
    ]);
    job.output.formats[0].type = 'svf';
    job.output.formats[0].views = ['2d', '3d'];
    console.log(job);
    try {
      // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
      const result = await new DerivativesApi().translate(job, {}, ctx.app.getClient(), ctx.request.body.oauth_token);
      console.log('result', result);
      ctx.body = {};
    } catch (err) {
      ctx.body = err;
    }
  }
}

module.exports = JobsController;