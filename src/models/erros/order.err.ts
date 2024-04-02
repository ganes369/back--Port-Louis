import { IOrderMapper } from "../order";

interface InputError {
  message: string;
  item?: IOrderMapper | { key: string; missingNumber: number }[];
  key?: string;
}

export class OrderError extends Error {
  item?: IOrderMapper | { key: string; missingNumber: number }[];
  key?: string;

  constructor({ message, key, item }: InputError) {
    super(message);
    this.name = this.constructor.name;
    (this.item = item), (this.key = key);
    Error.captureStackTrace(this, this.constructor);
  }
}
