import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository('transactions');
    const transactions: Transaction[] = (await transactionsRepository.find()) as Transaction[];

    const balance = transactions.reduce(
      (acc: Balance, transaction: Transaction): Balance => {
        acc[transaction.type] += transaction.value;
        acc.total +=
          transaction.type === 'income'
            ? transaction.value
            : -transaction.value;

        return acc;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
