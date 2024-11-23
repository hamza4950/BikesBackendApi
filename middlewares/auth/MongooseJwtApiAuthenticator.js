import jwtSigner from "jsonwebtoken";
import passport from "passport";

import {ExtractJwt} from 'passport-jwt';
import {Strategy as JwtStrategy} from 'passport-jwt';

import UserModel from '../../models/UserModel.js';
import apiResponse from "../../helpers/apiResponse.js";


import * as dotenv from 'dotenv' 
dotenv.config({ path: `.env.local`, override: true });
const environmentSettings = dotenv.config().parsed;
console.log(' Environment settings from .env : ', environmentSettings)
console.log('NODE_ENV:', process.env.NODE_ENV)



const JWTSecret = process.env.JWT_SECRET; 
const JWTIssuer = process.env.JWT_ISSUER; 

class MongooseJwtApiAuthenticator {
    constructor() {
    }
    static authenticateApi = passport.authenticate('jwt', { session: false })
    
    static initialize(app) {

       
        const opts = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWTSecret
        }

        passport.use(new JwtStrategy(opts, MongooseJwtApiAuthenticator.onJwtAuthenticate));

        console.log('MongooseJwtApiAuthenticator activated')

    }

    static onJwtAuthenticate(jwtPayload, done) {

      
        UserModel.findOne({ _id: jwtPayload.sub })
            .then(user => {
                
                if (user) {
                    return done(null, user);
                }
                
                else {
                    return done(null, false);
                }
            })
            .catch(error => {
                return done(error, false);
            } )
    }

   
    static registerApi(req, res, next) {
        UserModel.register(new UserModel({
            username: req.body.username,
            email: req.body.email,
            isConfirmed: true, 
        }), req.body.password, function (error, user) {

            if (error) {
                return apiResponse.errorResponse(res, error);
            }
            const userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                isConfirmed: user.isConfirmed,
                createdAt: user.createdAt
            };

            return apiResponse.successResponseWithData(res, "Successful registration", userData);
        });
    }

    
    static loginApi(req, res, next) {
        
        UserModel.findOne({ username: req.body.username }).then(user => {
            if (user) {
                user.authenticate(req.body.password, function (error, authenticatedUser, passwordError) {
                    if (error)
                        return apiResponse.errorResponse(res, { error });
                    if (passwordError)
                        return apiResponse.unauthorizedResponse(res, passwordError);

                  
                    if (authenticatedUser.isConfirmed) {
                      
                        if (authenticatedUser.status) {
                           
                            const iatTimestamp = new Date('July 1, 2023, 12:00:00').getTime()
                            const expTimestamp = iatTimestamp + 1200;
                            const userData = {
                                username: authenticatedUser.username, 
                                iss: JWTIssuer,
                                sub: authenticatedUser.id,
                                  iat: iatTimestamp,
                                exp: expTimestamp
                            };
                           
                            const jwtPayload = userData;

                            
                            const token = jwtSigner.sign(jwtPayload, JWTSecret);
                            
                            userData.token = token;


                            return apiResponse.successResponseWithData(res, "Successful login", userData);
                        } else {
                            return apiResponse.unauthorizedResponse(res, "Account is not active. Please contact admin.");
                        }
                    } else {
                        return apiResponse.unauthorizedResponse(res, "Account is not confirmed. Please confirm your account.");
                    }
                });

            } else {

                return apiResponse.unauthorizedResponse(res, "No user with that Username.");
            }
        });
    }
}


export default MongooseJwtApiAuthenticator;