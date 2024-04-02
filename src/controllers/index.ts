import express from "express";
const router = express.Router();
import invoice from "./invoice";

router.use("/invoices", invoice);

export default router;
