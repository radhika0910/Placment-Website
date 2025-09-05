const router = require("express").Router();
const companyController = require("../controllers/company.controller");
const jwtMiddleware = require("../middlewares/jwt.middleware");
const authMiddleware = require("../middlewares/auth.middleware");

router.post(
  "/getAll",
  jwtMiddleware.verify,
  authMiddleware.ensureLoggedIn,
  companyController.getAll
);
router.get('/exportNotRegisteredCSV/:company_id', companyController.exportNotRegisteredStudentsCSV);
router.get(
  "/getOne/:company_id",
  jwtMiddleware.verify,
  authMiddleware.ensureLoggedIn,
  companyController.getOne
);
router.get('/notRegisteredCount/:company_id', companyController.getNotRegisteredStudentsCount);
router.post(
  "/add",
  jwtMiddleware.verify,
  authMiddleware.ensureOfficialPlacementTeam,
  companyController.add
);
router.post(
  "/update",
  jwtMiddleware.verify,
  authMiddleware.ensureOfficialPlacementTeam,
  companyController.update
);
router.post(
  "/remove",
  jwtMiddleware.verify,
  authMiddleware.ensureAdminOrFaculty,
  companyController.remove
);
router.get(
  "/allApplied/:company_id",
  jwtMiddleware.verify,
  authMiddleware.ensureOfficialPlacementTeam,
  companyController.allApplied
);

module.exports = router;
