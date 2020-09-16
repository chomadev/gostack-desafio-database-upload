import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private reduceTransactionsToValue(
    transactions: Transaction[],
    type: string,
  ): number {
    return transactions
      .filter(transaction => transaction.type === type)
      .reduce(
        (sum: number, transaction: Transaction) =>
          sum + Number(transaction.value),
        0,
      );
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = this.reduceTransactionsToValue(transactions, 'income');
    const outcome = this.reduceTransactionsToValue(transactions, 'outcome');
    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };
    return balance;
  }
}

export default TransactionsRepository;
