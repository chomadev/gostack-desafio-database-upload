import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total)
      throw new AppError('You should never spend more than you earn', 400);

    const categoryRepository = getRepository(Category);
    const existingCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    let category_id = '';
    if (existingCategory) {
      category_id = existingCategory.id;
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });
      const savedCategory = await categoryRepository.save(newCategory);
      category_id = savedCategory.id;
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    return transactionsRepository.save(transaction);
  }
}

export default CreateTransactionService;
