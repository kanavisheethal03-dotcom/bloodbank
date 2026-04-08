import { Router, type IRouter } from "express";
import healthRouter from "./health";
import donorsRouter from "./donors";
import bloodRequestsRouter from "./blood-requests";
import bloodStockRouter from "./blood-stock";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import chatbotRouter from "./chatbot";
import emergencyRouter from "./emergency";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/donors", donorsRouter);
router.use("/blood-requests", bloodRequestsRouter);
router.use("/blood-stock", bloodStockRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/chat", chatbotRouter);
router.use("/emergency", emergencyRouter);

export default router;
