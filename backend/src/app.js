import express from "express"
import {createServer} from "node:http"
import { Server } from "socket.io";
import mongoose from "mongoose";
import userRouter from "./routes/userRoutes.js";
import cors from "cors"
import connectToSocket from "./controllers/socketManger.js";
const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));//basically app.(set or get) ke local storage ki tarah hai
app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}))
app.use("/api/v1/users", userRouter);

const start = async () => {
    const connectionDb = await mongoose.connect("mongodb+srv://yadavaryan122004_db_user:UgR2F3sRGGlqPsKb@cluster0.bkxtt27.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log(`Mongo connnect DB host: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), ()=>{
        console.log("Listening on port 8000");
    });
}
  
start(); 