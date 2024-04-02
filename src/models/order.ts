import { OrderError } from "./erros/order.err";

interface IOrder {
  key: string;
  número_item: number;
  código_produto: string;
  quantidade_produto: number;
  valor_unitário_produto: string;
}

interface IOrderMapper {
  numeroItem: number;
  quantidadeProduto: number;
  valorUnitario: string;
  codigo: string;
  key: string;
}

interface IOrdersMethods {
  get<T>(): T;
}

//-------------------------------------------------------
class Orders implements IOrdersMethods {
  private readonly orders: IOrderMapper[];
  constructor(orders: IOrder[]) {
    this.orders = this.mapper(orders);
    this.validateDuplicate(this.orders);
    this.validateItemNumber(this.orders);
  }
  get<T>(): T {
    return this.orders as T;
  }

  private mapper(input: IOrder[]): IOrderMapper[] {
    return input.map((i) => {
      const order = this.validateTypes({
        key: i.key,
        numeroItem: i.número_item,
        quantidadeProduto: i.quantidade_produto,
        valorUnitario: i.valor_unitário_produto,
        codigo: i.código_produto,
      });
      return order;
    }) as any as IOrderMapper[];
  }

  private validateTypes(input: IOrderMapper): IOrderMapper {
    const { numeroItem, codigo, key, quantidadeProduto, valorUnitario } = input;
    if (!Number.isInteger(numeroItem) || numeroItem <= 0)
      throw new OrderError({
        message: `Pedido ${key} item invalido número_item`,
        item: input,
      });
    if (!Number.isInteger(quantidadeProduto) || quantidadeProduto <= 0)
      throw new OrderError({
        message: `Pedido ${key} item invalido quantidade_produto`,
        item: input,
      });
    if (!/\w/.test(codigo))
      throw new OrderError({
        message: `Pedido ${key} item invalido código_produto`,
        item: input,
      });
    if (!/^\d+,\d{2}$/.test(valorUnitario))
      throw new OrderError({
        message: `Pedido ${key} item invalido valor_unitário_produto`,
        item: input,
      });
    if (!/\w/.test(key))
      throw new OrderError({
        message: `Pedido ${key} item invalido id do pedido`,
        item: input,
      });
    return input;
  }

  private validateDuplicate(arr: IOrderMapper[]) {
    const visited = new Set();
    const exist = arr.find(
      (objeto) =>
        visited.has(`${objeto.numeroItem}-${objeto.key}`) ||
        !visited.add(`${objeto.numeroItem}-${objeto.key}`)
    );
    if (exist)
      throw new Error(
        `Repetição do item ${exist.numeroItem} na nota ${exist.key}`
      );
  }

  private validateItemNumber(array: IOrderMapper[]) {
    const groups = Orders.groupObjectsByKey(array);
    const result: { key: string; missingNumber: number }[] = [];
    for (const key in groups) {
      if (groups.hasOwnProperty(key)) {
        const objects = groups[key];
        const numbers = objects
          .map((object) => object.numeroItem)
          .sort((a, b) => a - b);
        const maxNumber = numbers[numbers.length - 1];

        for (let i = 1; i <= maxNumber; i++) {
          if (!numbers.includes(i)) {
            result.push({ key, missingNumber: i });
          }
        }
      }
    }
    if (result.length)
      throw new OrderError({ message: `Pedido(s) inválido(s)`, item: result });
  }

  static groupObjectsByKey(array: IOrderMapper[]): {
    [key: string]: IOrderMapper[];
  } {
    return array.reduce(
      (acc: { [key: string]: IOrderMapper[] }, object: IOrderMapper) => {
        acc[object.key] = acc[object.key] || [];
        acc[object.key].push(object);
        return acc;
      },
      {}
    );
  }
}

export { Orders, IOrder, IOrderMapper };
