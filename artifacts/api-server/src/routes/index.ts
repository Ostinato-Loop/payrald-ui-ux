import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import walletRouter from "./wallet";
import resolveRouter from "./resolve";
import transfersRouter from "./transfers";
import paymentsRouter from "./payments";
import withdrawalsRouter from "./withdrawals";
import transactionsRouter from "./transactions";
import contactsRouter from "./contacts";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(walletRouter);
router.use(resolveRouter);
router.use(transfersRouter);
router.use(paymentsRouter);
router.use(withdrawalsRouter);
router.use(transactionsRouter);
router.use(contactsRouter);
router.use(webhooksRouter);

export default router;
