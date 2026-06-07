import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import app from './app.js';

dotenv.config({ path: "./.env" });

connectDB()
.then(()=>{
    const port = process.env.PORT;
    app.listen(port , ()=>{
        console.log(`serving at "localhost:${port}"`);
    })
})
.catch((err)=>{
    console.log("Error While Connecting to DB : " , err);
})