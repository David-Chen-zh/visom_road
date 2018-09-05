'use strict';
const Controller = require('egg').Controller;

const { getClient, getInternalToken } = require('./token.js');
const { BucketsApi, ObjectsApi, PostBucketsPayload } = require('forge-apis');


class BucketsController extends Controller {

  async use(req, res, next) {
    const token = await getInternalToken();
    req.oauth_token = token;
    req.oauth_client = getClient();
    next();
  }
  async list(req, res, next) {
    const bucket_name = req.query.id;
    if (!bucket_name || bucket_name === '#') {
      try {
        // Retrieve buckets from Forge using the [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#getBuckets)
        const buckets = await new BucketsApi().getBuckets({ limit: 64 }, req.oauth_client, req.oauth_token);
        res.json(buckets.body.items.map((bucket) => {
          return {
            id: bucket.bucketKey,
            text: bucket.bucketKey,
            type: 'bucket',
            children: true
          };
        }));
      } catch (err) {
        next(err);
      }
    } else {
      try {
        // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
        const objects = await new ObjectsApi().getObjects(bucket_name, {}, req.oauth_client, req.oauth_token);
        res.json(objects.body.items.map((object) => {
          return {
            id: Buffer.from(object.objectId).toString('base64'),
            text: object.objectKey,
            type: 'object',
            children: false
          };
        }));
      } catch (err) {
        next(err);
      }
    }
  }

  async create(req, res, next) {
    const payload = new PostBucketsPayload();
    payload.bucketKey = req.body.bucketKey;
    payload.policyKey = 'transient'; // expires in 24h
    try {
      // Create a bucket using [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#createBucket).
      await new BucketsApi().createBucket(payload, {}, req.oauth_client, req.oauth_token);
      res.status(200).end();
    } catch (err) {
      next(err);
    }
  }

}

module.exports = BucketsController;