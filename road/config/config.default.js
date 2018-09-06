const path = require('path');
const fs = require('fs');
module.exports = app => {
  const exports = {};

  exports.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(app.baseDir, 'app/web/asset/images/favicon.ico'))
  };

  exports.view = {
    cache: false
  };

  exports.vuessr = {
    layout: path.join(app.baseDir, 'app/web/view/layout.html'),
    renderOptions: {
      // 告诉 vue-server-renderer 去 app/view 查找异步 chunk 文件
      basedir: path.join(app.baseDir, 'app/view')
    }
  };

  exports.security = {
    csrf: {
      enable: false,
    }
  };

  exports.logger = {
    consoleLevel: 'DEBUG',
    dir: path.join(app.baseDir, 'logs')
  };

  exports.static = {
    prefix: '/public/',
    dir: path.join(app.baseDir, 'public')
  };

  exports.keys = '123456';

  exports.middleware = [
    'access'
  ];

  exports.version = '0.2.0';

  exports.forge =
    {
      clientId: 'u1ucMf0l7hEEGdKYOq8QjXmKGGGAYtHF',
      clientSecret: '4rEga7zTurW7MVWM',
      callbackUrl: 'http://www.wiseom.cn'
    };

  exports.scopes = {
    // Required scopes for the server-side application
    internal: ['bucket:create', 'bucket:read', 'data:read', 'data:create', 'data:write'],
    // Required scope for the client-side viewer
    public: ['viewables:read']
  };

  return exports;
};
