'use strict';
const Controller = require('egg').Controller;

const { BucketsApi, ObjectsApi, PostBucketsPayload } = require('forge-apis');


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
        console.log(err);
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
        console.log(err);
      }
    }
  }

  async create(ctx) {
    const payload = new PostBucketsPayload();
    payload.bucketKey = ctx.request.body.bucketKey;
    payload.policyKey = 'transient'; // expires in 24h
    try {
      // Create a bucket using [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#createBucket).
      await new BucketsApi().createBucket(payload, {}, ctx.app.getClient(), ctx.request.body.oauth_token);
      ctx.status(200).end();
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = BucketsController;