import { Router, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const createTransactionService = new CreateTransactionService();

transactionsRouter.get('/', async (_, response: Response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionsRepository.getBalance();

  const transactions = await transactionsRepository.find();

  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  await transactionsRepository.delete(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute(
      request.file.path,
    );

    response.status(200).json(transactions);
  },
);

export default transactionsRouter;
