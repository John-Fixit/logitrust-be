const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");

const buildResourceRouter = (controller, options = {}) => {
  const router = express.Router();
  const authEnabled = options.protected !== false;

  if (authEnabled) {
    router.use(requireAuth);
  }

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
};

module.exports = { buildResourceRouter };
