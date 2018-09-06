
module.exports = app => {

  const { router, controller } = app;

  const auth = app.middleware.auth();

  router.get('/api/forge/oauth/token', app.controller.token.create);
  router.get('/api/forge/oss/buckets', auth, controller.buckets.list);
  router.post('/api/forge/oss/buckets', auth, app.controller.buckets.create);
  router.post('/api/forge/oss/objects', auth, controller.buckets.createObject);


  router.get('/api/article/list', app.controller.app.list);
  router.get('/api/article/:id', app.controller.app.detail);
  router.get('/*', app.controller.app.index);


  router.post('/api/forge/modelderivative/jobs', auth, controller.jobs.create);


};
