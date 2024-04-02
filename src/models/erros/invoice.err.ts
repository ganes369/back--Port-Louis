import { IInvoiceMapper } from "../invoice";

interface InputError {
  message: string;
  item?: IInvoiceMapper;
  key?: string;
}

export class InvoiceError extends Error {
  item?: IInvoiceMapper;
  key?: string;

  constructor({ message, item, key }: InputError) {
    super(message);
    this.key = key;
    this.name = this.constructor.name;
    this.item = item;
    Error.captureStackTrace(this, this.constructor);
  }
}
