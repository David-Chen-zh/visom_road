'use strict';
const Controller = require('egg').Controller;

class TokenController extends Controller {

  async create(req, res, next) {
    try {
      const token = await this.application.getPublicToken();
      res.json({
        access_token: token.access_token,
        expires_in: token.expires_in
      });
    } catch (err) {
      next(err);
    }
  }

}

module.exports = TokenController;