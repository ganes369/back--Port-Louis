import express from "express";
import ReadFile, { IReadFile } from "../services/file";
import { IOrder, IOrderMapper, Orders } from "../models/order";
import { IInvoices, Invoices } from "../models/invoice";

const router = express.Router();
const fileOrder: IReadFile<IOrder> = new ReadFile("../../src/data/Pedidos");
const fileInvoice: IReadFile<IInvoices> = new ReadFile("../../src/data/Notas");

const readData = async () => {
  const readInvoices = await fileInvoice.read();
  const readOrders = await fileOrder.read();
  return { readInvoices, readOrders };
};

router.get("/", async (_req, res) => {
  try {
    const { readInvoices, readOrders } = await readData();
    const orders = new Orders(readOrders).get<IOrderMapper[]>();
    const invoice = new Invoices(readInvoices, orders).findAll();
    return res.json(invoice);
  } catch (err: any) {
    return res.status(400).json({ message: err.message, ...err });
  }
});

router.get("/Pending", async (_req, res) => {
  try {
    const { readInvoices, readOrders } = await readData();
    const orders = new Orders(readOrders).get<IOrderMapper[]>();
    const invoice = new Invoices(readInvoices, orders);
    const getPendencies = invoice.findAllOrderPending();
    invoice.writeItemsPending(
      fileInvoice as unknown as IReadFile<any>,
      getPendencies,
      "../../src/data/pending_orders.txt"
    );
    return res.json(getPendencies);
  } catch (err: any) {
    return res.status(400).json({ message: err.message, ...err });
  }
});

export default router;
