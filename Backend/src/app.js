import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static("public"));

app.use(cookieParser());


import userRouter from "./routes/user.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import projectRouter from "./routes/project.routes.js";

app.use('/api/users' , userRouter);
app.use('/api/dashboard' , dashboardRouter);
app.use('/api/project' , projectRouter);

export default app;