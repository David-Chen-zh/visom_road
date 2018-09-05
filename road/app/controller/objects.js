'use strict';
const Controller = require('egg').Controller;
const fs = require('fs');
const { BucketsApi, ObjectsApi, PostBucketsPayload } = require('forge-apis');

class ObjectsController extends Controller {
  // multer({ dest: 'uploads/' }).single('fileToUpload'),
  async create(req, res, next) {
    fs.readFile(req.file.path, async (err, data) => {
      if (err) {
        next(err);
      }
      try {
        // Upload an object to bucket using [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#uploadObject).
        await new ObjectsApi().uploadObject(req.body.bucketKey, req.file.originalname, data.length, data, {}, req.oauth_client, req.oauth_token);
        res.status(200).end();
      } catch (err) {
        next(err);
      }
    });
  }
}

module.exports = ObjectsController;