import { IInvoiceMapper } from "../../src/models/invoice";
import ReadFile from "../../src/services/file";

export type Mock<T> = Record<keyof T, jest.Mock>;

export const makeReadFileInvoiceMock = () => {
  const mock: Mock<ReadFile<IInvoiceMapper>> = {
    read: jest.fn(),
    write: jest.fn(),
  };

  const outputs = {
    read: [
      { id_pedido: "P1", key: "N1", número_item: 1, quantidade_produto: 1 },
    ],
  };

  return {
    mock,
    outputs,
  };
};
