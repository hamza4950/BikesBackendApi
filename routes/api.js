import express from 'express';
import authRouter from './auth.js';
 import bikeRouter from './bikes.js';
import componentRouter from './components.js';

const app = express();


app.use("/auth/", authRouter);
app.use("/bikes", bikeRouter);
app.use("/components", componentRouter);

export default app;