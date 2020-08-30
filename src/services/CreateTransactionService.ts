import { getRepository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (value > balance.total) {
        throw new AppError('Invalid value.', 400);
      }
    }

    const categoriesRepository = getRepository('categories');
    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      const newCategory = categoriesRepository.create({
        title: category,
      }) as Category;

      await categoriesRepository.save(newCategory);
    }

    const existentCategory = (await categoriesRepository.findOne({
      where: { title: category },
    })) as Category;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: existentCategory.id,
    });
    const { id } = await transactionsRepository.save(transaction);

    const newTransaction = (await transactionsRepository.findOne(
      id,
    )) as Transaction;

    return newTransaction;
  }
}

export default CreateTransactionService;
