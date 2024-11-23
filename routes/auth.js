import express from 'express';
import AuthApiController from "../apicontrollers/AuthApiController.js";



const router = express.Router();

router.post("/register", AuthApiController.register);
router.post("/login", AuthApiController.login);

export default router;