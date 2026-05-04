const router = require("express").Router();
const db = require("../models");
const BaseDao = require("../dao/baseDao");
const BaseService = require("../service/baseService");
const { buildCrudController } = require("../controllers/baseCrudController");
const { buildResourceRouter } = require("./resource-route-factory");
const resources = require("../modules/resource-registry");

resources.forEach((resource) => {
  const model = db[resource.model];
  if (!model) return;

  const dao = new BaseDao(model);
  const service = new BaseService(dao);
  const controller = buildCrudController(service, resource.label);

  router.use(`/${resource.path}`, buildResourceRouter(controller, { protected: true }));
});

module.exports = router;
