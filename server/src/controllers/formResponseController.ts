import type { NextFunction, Request, Response } from 'express';
import catchAsyncError from '../utils/catchAsyncError';
import { AppDataSource } from '../data-source';
import { FormResponse } from '../models/formResponseModel';
import { Form } from '../models/formModel';
import AppError from '../utils/appError';
import { exportToCSV } from '../utils/csvExport';

const formRepository = AppDataSource.getRepository(Form);
const formResponseRepository = AppDataSource.getRepository(FormResponse);

export const getAllResponses = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const form = await formRepository.findOne({ where: { _id: req.params.id } });
    if (!form) return next(new AppError('No form found with that ID', 404));

    const responses = await formResponseRepository.find({ where: { form: { _id: req.params.id } } });

    res.status(200).json({
      status: 'success',
      data: {
        responses,
      },
    });
  },
);

export const createResponse = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { response } = req.body;

    if (!response)
      return next(new AppError('Please provide response of the form!', 400));

    const form = await formRepository.findOne({ where: { _id: req.params.id } });
    if (!form) return next(new AppError('No form found with that ID', 404));

    if (!form.isActive)
      return next(
        new AppError('The form is no longer accepting submissions', 400),
      );

    const newResponse = formResponseRepository.create({
      form: form,
      response,
    });

    await formResponseRepository.save(newResponse);

    res.status(201).json({
      status: 'success',
      data: {
        response: newResponse,
      },
    });
  },
);

export const exportcsv = async (req: Request, res: Response,next:NextFunction): Promise<void> => {
  try {
    const { formId } = req.params;
    const submissions = await AppDataSource.getRepository(FormResponse).find({
      where: { form: { _id: formId } },
    });

    // if (!submissions.length) {
    //   return res.status(404).json({ message: "No submissions found" });
    // }

    const csvData = exportToCSV(
      submissions.map((sub) => sub.response),
      Object.keys(submissions[0].response)
    );

    res.header("Content-Type", "text/csv");
    res.attachment("submissions.csv");
    res.send(csvData);
   
  } catch (error) {
    res.status(500).json({ message: "Error exporting submissions", error });
  }
};
