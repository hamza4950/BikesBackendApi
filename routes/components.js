import express from 'express';
import Authenticator from '../middlewares/auth/MongooseJwtApiAuthenticator.js'
import ComponentsApiController from '../apicontrollers/ComponentsApiController.js'

const theComponentsApiController = new ComponentsApiController();


const router = express.Router();

router.get("/:bikeId/list", Authenticator.authenticateApi, theComponentsApiController.list)
router.post("/:bikeId/", Authenticator.authenticateApi, theComponentsApiController.create);
router.put("/:componentId", Authenticator.authenticateApi, theComponentsApiController.update);
router.get("/:componentId", Authenticator.authenticateApi, theComponentsApiController.detail);
router.delete("/:componentId", Authenticator.authenticateApi, theComponentsApiController.delete);
export default router;
