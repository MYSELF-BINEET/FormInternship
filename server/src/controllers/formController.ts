import { type NextFunction, type Request, type Response } from 'express';
import catchAsyncError from '../utils/catchAsyncError';
import { AppDataSource } from '../data-source';
import { Form } from '../models/formModel';
import AppError from '../utils/appError';
import { In } from 'typeorm';


const formRepository = AppDataSource.getRepository(Form);

export const getAllForms = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = page * pageSize;
    const searchQuery = req.query.search?.toString();

    const [forms, total] = await formRepository.findAndCount({
      where: searchQuery
        ? {
            user: { id: req.userId },
            name: AppDataSource.createQueryBuilder()
              .where('LOWER(name) LIKE :search', {
                search: `%${searchQuery.toLowerCase()}%`,
              })
              .getSql(),
          }
        : { user: { id: req.userId } },
      order: req.query.sort
        ? { [req.query.sort.toString()]: 'ASC' }
        : undefined,
      skip,
      take: pageSize,
    });

    if (req.query.page && req.query.page !== '0' && skip >= total)
      return next(new AppError('This page does not exist', 404));

    res.status(200).json({
      status: 'success',
      data: {
        forms,
        total,
      },
    });
  },
);

export const deleteForms = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { forms } = req.body;
    if (!forms)
      return next(new AppError('Please provide a list of form IDs!', 400));

    await formRepository.delete({ _id: In(forms) });

    res.sendStatus(204);
  },
);

export const getForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await formRepository.findOne({ where: { _id: req.params.id } });
    if (!form) return next(new AppError('No form found with that ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        form,
      },
    });
  },
);

export const createForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, elements } = req.body;

    if (!name)
      return next(new AppError('Please provide the name of the form!', 400));

    if (elements.length === 0)
      return next(new AppError('Please add some elements to the form!', 400));

    const newForm = formRepository.create({
      name,
      elements,
      user: { id: req.userId },
    });

    await formRepository.save(newForm);

    res.status(201).json({
      status: 'success',
      data: {
        form: newForm,
      },
    });
  },
);

export const updateForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await formRepository.findOne({ where: { _id: req.params.id } });

    if (!form) return next(new AppError('No form found with that ID', 404));

    formRepository.merge(form, req.body);
    const updatedForm = await formRepository.save(form);

    res.status(200).json({
      status: 'success',
      data: {
        form: updatedForm,
      },
    });
  },
);

export const deleteForm = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.params.id);
    const form = await formRepository.findOne({ where: { _id: req.params.id } });

    if (!form) return next(new AppError('No form found with that ID', 404));

    await formRepository.remove(form);

    res.sendStatus(204);
  },
);