import { makeReadFileOrderMock } from "../mocks/mock.order.model";
import { makeReadFileInvoiceMock } from "../mocks/mock.invoice.model";
import { IOrderMapper, Orders } from "../../src/models/order";
import { Invoices } from "../../src/models/invoice";

describe("Invoice model", () => {
  const readFileOrder = makeReadFileOrderMock();
  const readFileInvoice = makeReadFileInvoiceMock();

  const inputFileOrder = readFileOrder.outputs.read.order;
  const inputFileInvoice = readFileInvoice.outputs.read;

  it("deverá retornar uma lista de notas", async () => {
    const orders = new Orders(inputFileOrder).get<IOrderMapper[]>();
    const invoice = new Invoices(inputFileInvoice, orders);

    expect(invoice).toBeInstanceOf(Invoices);
    expect(invoice.get<IOrderMapper[]>()).toStrictEqual([
      {
        key: "N1",
        idPedido: "P1",
        numeroItem: 1,
        quantidadeProduto: 1,
      },
    ]);
  });

  it("deverá retornar uma lista de notas com seus pedidos", async () => {
    const orders = new Orders(inputFileOrder).get<IOrderMapper[]>();
    const invoice = new Invoices(inputFileInvoice, orders);

    expect(invoice).toBeInstanceOf(Invoices);
    expect(invoice.findAll()).toStrictEqual([
      {
        invoice: "N1",
        orders: 1,
        items: [
          {
            codigo: "A12",
            key: "P1",
            numeroItem: 1,
            quantityInvoice: 1,
            valorUnitario: "10,00",
          },
        ],
      },
    ]);
  });

  it("deverá retornar erro caso algum tipo errado", async () => {
    const orders = new Orders(inputFileOrder).get<IOrderMapper[]>();

    const newInput = JSON.parse(JSON.stringify(inputFileInvoice));
    newInput[0].quantidade_produto = 0;

    expect(() => {
      new Invoices(newInput, orders).get();
    }).toThrow("Nota N1 item invalido quantidade_produto");
  });

  it("deverá retornar erro caso seja informado algum par de id_pedido e número_item que não exista", async () => {
    const orders = new Orders(inputFileOrder).get<IOrderMapper[]>();

    const newInput = JSON.parse(JSON.stringify(inputFileInvoice));
    newInput[0].id_pedido = 0;

    expect(() => {
      new Invoices(newInput, orders).get();
    }).toThrow("Pedido 0 inválido na nota: N1.");
  });

  it("deverá retornar erro caso a soma das quantidades informadas para um item ultrapassar a quantidade do item do pedido", async () => {
    const orders = new Orders(inputFileOrder).get<IOrderMapper[]>();

    const newInput = JSON.parse(JSON.stringify(inputFileInvoice));
    newInput[0].quantidade_produto = 40;

    expect(() => {
      new Invoices(newInput, orders).get();
    }).toThrow("Item 1 do Pedido P1 ultrapassa a quantidade na nota N1.");
  });
});
