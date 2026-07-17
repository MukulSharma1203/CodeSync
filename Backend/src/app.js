import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow non-browser requests (curl, server-to-server) with no origin
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true
}));
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