import { Router } from "express";
import indexController from "../controllers/indexController.js";
import db from '../db/queries.js';

const indexRouter = Router();

indexRouter.get("/", async(req, res) => {
    const rows = await db.getallmessages();
    res.render("index", {rows: rows});
});

indexRouter.post("/sign-up", indexController.addnewUser);


export default indexRouter;