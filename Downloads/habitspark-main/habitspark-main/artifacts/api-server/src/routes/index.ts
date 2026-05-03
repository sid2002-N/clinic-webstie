import { Router, type IRouter } from "express";
import healthRouter from "./health";
import motivationRouter from "./motivation";

const router: IRouter = Router();

router.use(healthRouter);
router.use(motivationRouter);

export default router;
