import { IOrderMapper } from "../../src/models/order";
import ReadFile from "../../src/services/file";

export type Mock<T> = Record<keyof T, jest.Mock>;

export const makeReadFileOrderMock = () => {
  const mock: Mock<ReadFile<IOrderMapper>> = {
    read: jest.fn(),
    write: jest.fn(),
  };

  const outputs = {
    read: {
      order: [
        {
          código_produto: "A12",
          key: "P1",
          número_item: 1,
          quantidade_produto: 1,
          valor_unitário_produto: "10,00",
        },
      ],
    },
  };

  return {
    mock,
    outputs,
  };
};
