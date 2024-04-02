import { makeReadFileOrderMock } from "../mocks/mock.order.model";
import { Orders } from "../../src/models/order";

describe("Order model", () => {
  const readFileOrder = makeReadFileOrderMock();
  const input = readFileOrder.outputs.read.order;

  it("deverá retornar uma lista de notas", async () => {
    const orders = new Orders(input);

    expect(orders).toBeInstanceOf(Orders);
    expect(orders.get()).toStrictEqual([
      {
        codigo: "A12",
        key: "P1",
        numeroItem: 1,
        quantidadeProduto: 1,
        valorUnitario: "10,00",
      },
    ]);
  });

  it("deverá retornar erro caso algum tipo errado", async () => {
    const newInput = JSON.parse(JSON.stringify(input));
    newInput[0].quantidade_produto = 0;
    expect(() => {
      new Orders(newInput).get();
    }).toThrow("Pedido P1 item invalido quantidade_produto");
  });

  it("deverá retornar erro caso haja repetição de algum número_item de um mesmo pedido", async () => {
    const newInput: any[] = JSON.parse(JSON.stringify(input));
    newInput.push({
      código_produto: "A12",
      key: "P1",
      número_item: 1,
      quantidade_produto: 1,
      valor_unitário_produto: "10,00",
    });

    expect(() => {
      new Orders(newInput).get();
    }).toThrow("Repetição do item 1 na nota P1");
  });

  it("deverá retornar erro caso  haver todos os números consecutivos de 1 ao maior número de item daquele pedido", async () => {
    const newInput: any[] = JSON.parse(JSON.stringify(input));
    newInput.push({
      código_produto: "A12",
      key: "P1",
      número_item: 8,
      quantidade_produto: 1,
      valor_unitário_produto: "10,00",
    });

    expect(() => {
      new Orders(newInput).get();
    }).toThrow("Pedido(s) inválido(s)");
  });
});
