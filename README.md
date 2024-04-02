# Teste Técnico Port Louis - Back End

## Requisitos Atendidos:

### Cruzamento de pedidos e notas:

- Ler todos os pedidos e lançar exceção informando o problema caso:
  - Algum valor não corresponda ao tipo descrito.
  - Haja repetição de algum `número_item` de um mesmo pedido.
  - Falte algum `número_item` (devem existir todos os números consecutivos de 1 ao maior número de item daquele pedido).
- Ler todas as notas e lançar exceção informando o problema caso:
  - Algum valor não corresponda ao tipo descrito.
  - Seja informado algum par de `id_pedido` e `número_item` que não exista.
  - A soma das quantidades informadas para um item ultrapassar a quantidade do item do pedido.

### Geração de listagem de itens pendentes:

- Percorrer as notas e identificar os itens pendentes para cada pedido.
- Gravar um arquivo de texto com a listagem dos pedidos pendentes. <code>src/data/pending_orders.txt</code>

- **Linguagem:** JavaScript.

## Bônus Atendidos:

- Implementar o programa em uma API Rest. (recursos: listar notas e pedido | listar pedidos pendentes)
- Utilizar TypeScript.
- Implementar testes unitários.

## Instalação

- Na pasta do projeto rode npm i

## Run Testes

- npm run test

## Run

- npm run dev disponivel em localhost:3000

- Insomnia_2024-04-02.json para testar via cliente de api
