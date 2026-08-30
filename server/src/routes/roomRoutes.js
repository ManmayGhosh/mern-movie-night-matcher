const router = require("express").Router();
const ctrl = require("../controllers/roomController");

router.post("/", ctrl.createRoom);
router.post("/:code/join", ctrl.joinRoom);
router.get("/:code", ctrl.getRoom);

module.exports = router;
