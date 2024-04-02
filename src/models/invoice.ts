import { IReadFile } from "../services/file";
import { InvoiceError } from "./erros/invoice.err";
import { IOrderMapper, Orders } from "./order";

interface IInvoices {
  key: string;
  id_pedido: string;
  número_item: number;
  quantidade_produto: number;
}

interface IInvoiceMapper {
  idPedido: string;
  numeroItem: number;
  quantidadeProduto: number;
  key: string;
}

interface IInvoicePendingItems {
  invoice: string;
  totalBalance: number;
  pendingBalance: number;
  order?: number;
  items: Array<Partial<IOrderMapper> & { missing?: number }>;
}

interface IInvoiceMethods {
  findAll(): any[];
  get<T>(): T;
  findAllOrderPending(): IInvoicePendingItems[];
}
class Invoices implements IInvoiceMethods {
  private readonly invoice: IInvoiceMapper[];
  private readonly order?: IOrderMapper[];

  constructor(invoice: IInvoices[], order?: IOrderMapper[]) {
    this.invoice = this.mapper(invoice);
    this.order = order;
    this.validateOrder(this.invoice);
    this.validateQtdeOrder(this.invoice);
  }

  mapper(input: IInvoices[]): IInvoiceMapper[] {
    return input.map(({ id_pedido, número_item, key, quantidade_produto }) =>
      this.validateTypes({
        idPedido: id_pedido,
        numeroItem: número_item,
        quantidadeProduto: quantidade_produto,
        key: key,
      })
    );
  }

  private validateTypes(input: IInvoiceMapper): IInvoiceMapper {
    const { idPedido, numeroItem, quantidadeProduto, key } = input;
    if (!Number.isInteger(numeroItem) || numeroItem <= 0)
      throw new InvoiceError({
        message: `Nota ${key} item invalido número_item`,
      });
    if (!Number.isInteger(quantidadeProduto) || quantidadeProduto <= 0)
      throw new InvoiceError({
        message: `Nota ${key} item invalido quantidade_produto`,
      });
    if (!/^[a-zA-Z0-9]+$/.test(idPedido))
      throw new InvoiceError({
        message: `Nota ${key} item invalido id_pedido`,
      });
    return input;
  }

  private validateOrder(input: IInvoiceMapper[]) {
    const orderInput = this.order ?? [];
    input.forEach((i) => {
      const orders = Orders.groupObjectsByKey(orderInput);
      if (!(i.idPedido in orders))
        throw new InvoiceError({
          message: `Pedido ${i.idPedido} inválido na nota: ${i.key}.`,
        });
      const item = orders[`${i.idPedido}`].find(
        ({ numeroItem }) => numeroItem === i.numeroItem
      );
      if (!item)
        throw new InvoiceError({
          message: `Item ${i.numeroItem} do Pedido ${i.idPedido} inválido na nota: ${i.key}.`,
          item: item,
        });
    });
  }

  private validateQtdeOrder(input: IInvoiceMapper[]) {
    const orderInput = this.order ?? [];
    input.forEach((i) => {
      const orders = Orders.groupObjectsByKey(orderInput);
      const qtde = orders[`${i.idPedido}`].filter(
        ({ numeroItem, quantidadeProduto }) =>
          numeroItem === i.numeroItem && quantidadeProduto < i.quantidadeProduto
      );
      if (qtde.length)
        throw new InvoiceError({
          message: `Item ${i.numeroItem} do Pedido ${i.idPedido} ultrapassa a quantidade na nota ${i.key}.`,
          item: i,
        });
    });
  }

  static groupObjectsByKey(array: IInvoiceMapper[]): {
    [key: string]: IInvoiceMapper[];
  } {
    return array.reduce(
      (acc: { [key: string]: IInvoiceMapper[] }, object: IInvoiceMapper) => {
        acc[object.key] = acc[object.key] || [];
        acc[object.key].push(object);
        return acc;
      },
      {}
    );
  }

  findAll(): any[] {
    const group = Invoices.groupObjectsByKey(this.invoice);

    return Object.entries(group).map(([invoice, items]) => ({
      invoice,
      orders: new Set(items.map((item) => item.idPedido)).size,
      items: items.flatMap((i) => {
        const orderItems = Orders.groupObjectsByKey(this.order ?? [])[
          i.idPedido
        ];
        return (
          orderItems
            ?.filter(
              ({ key, numeroItem }) =>
                key === i.idPedido && numeroItem === i.numeroItem
            )
            .map(({ quantidadeProduto, ...rest }) => ({
              ...rest,
              quantityInvoice: i.quantidadeProduto,
            })) ?? []
        );
      }),
    }));
  }

  get<T>(): T {
    return this.invoice as T;
  }
  findAllOrderPending(): IInvoicePendingItems[] {
    const order = this.order?.length ? this.order : [];
    const group = Invoices.groupObjectsByKey(this.invoice);

    const itemsPending: IInvoicePendingItems[] = [];
    for (const invoice in group) {
      const getOrderItems = Array.from(
        new Set(group[invoice].map(({ idPedido }) => idPedido))
      ).flatMap((i) => Orders.groupObjectsByKey(order)[i]);

      const itemsPendingQtde = group[invoice]
        .map((i) => {
          const findItem = getOrderItems.find(
            ({ key, numeroItem, quantidadeProduto }) =>
              key === i.idPedido &&
              numeroItem === i.numeroItem &&
              quantidadeProduto > i.quantidadeProduto
          );
          return (
            findItem && {
              ...findItem,
              missing: findItem.quantidadeProduto - i.quantidadeProduto,
            }
          );
        })
        .filter(Boolean) as Array<IOrderMapper> & { missing?: number };

      // Filtrar os itens do pedido que satisfazem as condições
      const itemsMissingInvoice = getOrderItems
        .map((i) => {
          return { missing: i.quantidadeProduto, ...i };
        })
        .filter((pedidoItem) =>
          group[invoice].every(
            (notaItem) =>
              pedidoItem.key === notaItem.idPedido &&
              pedidoItem.numeroItem !== notaItem.numeroItem
          )
        );

      const concatPendingItems = [...itemsPendingQtde, ...itemsMissingInvoice];
      concatPendingItems.length &&
        itemsPending.push({
          invoice,
          totalBalance: this.getBalance(getOrderItems),
          pendingBalance: this.getBalancePending(concatPendingItems),
          items: concatPendingItems,
        });
    }
    return itemsPending.map((invoice) => ({
      invoice: invoice.invoice,
      totalBalance: invoice.totalBalance,
      pendingBalance: invoice.pendingBalance,
      items: invoice.items.map(({ missing, numeroItem }) => ({
        missing,
        numeroItem,
      })),
    }));
  }

  async writeItemsPending<T>(
    input: IReadFile<T>,
    obj: T,
    path: string
  ): Promise<this> {
    await input.write(obj, path);
    return this;
  }

  private getBalance(input: IOrderMapper[]): number {
    return input.reduce(
      (acc, { valorUnitario, quantidadeProduto }) =>
        acc + Number(valorUnitario.replace(",", ".")) * quantidadeProduto,
      0
    );
  }

  private getBalancePending(input: any[]): number {
    return input.reduce(
      (acc, { valorUnitario, missing }) =>
        acc + missing * Number(valorUnitario.replace(",", ".")),
      0
    );
  }
}

export { Invoices, IInvoices, IInvoiceMapper };
