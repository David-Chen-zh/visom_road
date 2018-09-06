'use strict';
const fs = require('fs');
const path = require('path');
const Controller = require('egg').Controller;
const pump = require('mz-modules/pump');
const { BucketsApi, ObjectsApi, PostBucketsPayload } = require('forge-apis');
const util = require('util');
const readFile = util.promisify(require('fs').readFile);

class BucketsController extends Controller {

  async list(ctx) {
    const bucket_name = ctx.request.query.id;
    if (!bucket_name || bucket_name === '#') {
      try {
        // Retrieve buckets from Forge using the [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#getBuckets)
        const buckets = await new BucketsApi().getBuckets({ limit: 64 }, ctx.app.getClient(), ctx.request.body.oauth_token);
        ctx.body = buckets.body.items.map((bucket) => {
          return {
            id: bucket.bucketKey,
            text: bucket.bucketKey,
            type: 'bucket',
            children: true
          };
        });
      } catch (err) {
        ctx.body = err;
      }
    } else {
      try {
        // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
        const objects = await new ObjectsApi().getObjects(bucket_name, {}, ctx.app.getClient(), ctx.request.body.oauth_token);
        ctx.body = (objects.body.items.map((object) => {
          return {
            id: Buffer.from(object.objectId).toString('base64'),
            text: object.objectKey,
            type: 'object',
            children: false
          };
        }));
      } catch (err) {
        ctx.body = err;
      }
    }
  }

  async create(ctx) {
    const payload = new PostBucketsPayload();
    payload.bucketKey = ctx.request.body.bucketKey;
    payload.policyKey = 'transient'; // expires in 24h
    console.log(payload);
    try {
      // Create a bucket using [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#createBucket).
      const result = await new BucketsApi().createBucket(payload, {}, ctx.app.getClient(), ctx.request.body.oauth_token);
      console.log('result', result);
      ctx.body = '';
    } catch (err) {
      ctx.body = err;
    }
  }

  async createObject(ctx) {
    const stream = await this.ctx.getFileStream();
    console.log(stream.fields);
    const filename = stream.filename;
    const target = path.join(this.config.baseDir, 'public', filename);
    console.log(filename, target);
    const writeStream = fs.createWriteStream(target);
    await pump(stream, writeStream);

    try {
      const data = await readFile(target);
      console.log(data.length);
      // Upload an object to bucket using [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#uploadObject).
      await new ObjectsApi().uploadObject(stream.fields.bucketKey, filename, data.length, data, {}, ctx.app.getClient(), ctx.request.oauth_token);
      ctx.body = {};
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
  }
}

module.exports = BucketsController;