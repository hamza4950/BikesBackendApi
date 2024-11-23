import express from 'express';
import Authenticator from '../middlewares/auth/MongooseJwtApiAuthenticator.js'
import BikesApiController from '../apicontrollers/BikesApiController.js'

const theBikesApiController = new BikesApiController();



const router = express.Router();

router.get("/", Authenticator.authenticateApi, theBikesApiController.list)
router.post("/", Authenticator.authenticateApi, theBikesApiController.create);
router.put("/:id", Authenticator.authenticateApi, theBikesApiController.update);
router.get("/:id", Authenticator.authenticateApi, theBikesApiController.detail);
router.delete("/:id", Authenticator.authenticateApi, theBikesApiController.delete);
export default router;
