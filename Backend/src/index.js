import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

import connectDB from "./db/index.js";
import app from "./app.js";
import http from "http";
import { initializeSocket } from "./utils/socket.js";


connectDB()
  .then(() => {
    const port = process.env.PORT;

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(port, () => {
      console.log(`serving at "localhost:${port}"`);
    });
  })
  .catch((err) => {
    console.log("Error While Connecting to DB : ", err);
  });
