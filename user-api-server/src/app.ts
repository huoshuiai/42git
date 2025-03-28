import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session"
import { MAIN_ORIGIN, PORT, SESSION_SECRET } from "./utils/config";
import { createRedisStore } from "./db/redis";

export const initializeServer = async ()=>{
    const app: Express = express();

    app.use(cors({
        origin:MAIN_ORIGIN,
        credentials: true
    }));
    app.use(cookieParser())
    
    const redisStore = await createRedisStore()

    app.use(session({
        secret: SESSION_SECRET ,
        store: redisStore,
        resave:false, // only save session when session changed
        saveUninitialized:true, // save new session
        cookie: { secure: false }  // HTTPS concern
    }))
    
    app.get("/", (req: Request, res: Response) => {
        res.send("user service is running");
    });
    
    app.get("/session", (req: Request, res: Response)=>{
        if(!req.session.id){
            return res.status(500).send("Session ID not found")
        }
        console.log("sessionId:", req.session.id)
        res.json({sessionId: req.session.id})
    })
    
    app.post("/session/new", (req: Request, res: Response) => {
        console.log("---enter generating new session")
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).send("Failed to regenerate session.");
            }
            console.log(`---generated new session: ${ req.session.id }`)
            res.json({ sessionId: req.session.id });
        });
    });

    app.listen(PORT, () => {
        console.log(`[server]: Session service is running at http://localhost:${PORT}`);
    });
}