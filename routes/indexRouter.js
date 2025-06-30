import { Router } from "express";
import indexController from "../controllers/indexController.js";

const indexRouter = Router();

indexRouter.get("/", async(req, res) => res.render("index"));

indexRouter.post("/sign-up", indexController.addnewUser);


export default indexRouter;