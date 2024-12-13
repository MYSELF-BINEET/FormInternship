import crypto from 'crypto';
import { type Response, type Request, type NextFunction } from 'express';
import { hash, compare } from 'bcrypt';
import { MoreThan } from 'typeorm';
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from '@form-builder/validation';
import { sign, decode } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import { AppDataSource } from '../data-source';
import { User } from '../models/userModel';
import catchAsyncError from '../utils/catchAsyncError';
import AppError from '../utils/appError';
import {
  accessTokenExpiresIn,
  cookieOptions,
  refreshTokenExpiresIn,
} from '../utils/constants';
import sendEmail from '../utils/sendEmail';

const userRepository = AppDataSource.getRepository(User);

export const signAccessToken = (id: string) =>
  sign({ id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: accessTokenExpiresIn,
  });

export const signRefreshToken = (id: string) =>
  sign({ id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: refreshTokenExpiresIn,
  });

export const signUp = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await registerSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    const foundUser = await userRepository.findOne({
      where: { email: result.data.email },
    });
    if (foundUser)
      return next(
        new AppError('User already exists!', 409, {
          email: ['Email already exists'],
        }),
      );

    const { name, email } = result.data;
    const password = await hash(result.data.password, 12);

    const newUser = userRepository.create({
      name,
      email,
      password,
    });

    await userRepository.save(newUser);

    const newRefreshToken = signRefreshToken(newUser.id);
    newUser.refreshToken = [newRefreshToken];
    await userRepository.save(newUser);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(201).json({
      status: 'success',
      accessToken: signAccessToken(newUser.id),
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
        },
      },
    });
  },
);

export const login = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cookies } = req;
    const { email, password } = req.body;
    // console.log(cookies);

    if (!email || !password)
      return next(new AppError('Please provide email and password!', 400));

    const foundUser = await userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'refreshToken', 'avatar'],
    });


    // console.log(foundUser);

    if (!foundUser || !(await compare(password, foundUser.password)))
      return next(new AppError('Incorrect email or password!', 401));

    const newRefreshToken = signRefreshToken(foundUser.id);
    let newRefreshTokenArray = !cookies?.refreshToken
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter(r => r !== cookies.refreshToken);
      console.log(newRefreshTokenArray);

      if (cookies?.refreshToken) {
        const foundTokenUser = await userRepository
          .createQueryBuilder('User')
          .where(':token = ANY(User.refreshToken)', { token: cookies.refreshToken })
          .getOne();
      

      if (!foundTokenUser) newRefreshTokenArray = [];

        res.clearCookie('refreshToken', cookieOptions);
      }

    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await userRepository.save(foundUser);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      status: 'success',
      accessToken: signAccessToken(foundUser.id),
      data: {
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          avatar: foundUser.avatar,
        },
      },
    });
  },
);

export const logout = catchAsyncError(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.sendStatus(204);
    return;
  }

  const foundUser = await userRepository
  .createQueryBuilder('user')
  .where(':token = ANY(user.refreshToken)', { token: refreshToken })
  .getOne();


  if (!foundUser) {
    res.clearCookie('refreshToken', cookieOptions);
    res.sendStatus(204);
    return;
  }

  foundUser.refreshToken = foundUser.refreshToken.filter(
    r => r !== refreshToken,
  );
  await userRepository.save(foundUser);

  res.clearCookie('refreshToken', cookieOptions);
  res.sendStatus(204);
});

export const forgotPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await forgotPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    const foundUser = await userRepository.findOne({
      where: { email: result.data.email },
    });

    if (!foundUser)
      return next(
        new AppError('There is no user with that email address!', 404),
      );

    const resetToken = crypto.randomBytes(32).toString('hex');
    foundUser.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    foundUser.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await userRepository.save(foundUser);

    const resetUrl = `${req.header('Referer')}reset-password/${resetToken}`;

    const message =
      'You are receiving this email because you have just requested to reset your Form Builder password. Please click on the link below or copy and paste the URL in a new browser window to reset your password:\n\n' +
      `${resetUrl}\n\n` +
      'If you did not request this, please ignore this email and your password will remain unchanged.';

    try {
      await sendEmail({
        email: foundUser.email,
        subject:
          'Password reset token for Form Builder account (valid for 10 minutes)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Email sent successfully',
      });
    } catch (err) {
      foundUser.passwordResetToken = undefined;
      foundUser.passwordResetExpires = undefined;
      await userRepository.save(foundUser);

      return next(
        new AppError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    }
  },
);

export const resetPassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

      const foundUser = await userRepository.findOne({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: MoreThan(new Date()), // Assuming passwordResetExpires is a Date field
        },
      })

    if (!foundUser)
      return next(new AppError('Token is invalid or has expired!', 400));

    const result = await resetPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
      return next(
        new AppError(
          'Validation failed!',
          400,
          result.error.flatten().fieldErrors,
        ),
      );

    foundUser.password = await hash(result.data.newPassword, 12);
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpires = undefined;
    foundUser.passwordChangedAt = new Date();
    await userRepository.save(foundUser);

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  },
);

export const googleLogin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'postmessage',
    );

    const { tokens } = await oAuth2Client.getToken(req.body.code);
    if (!tokens.id_token)
      return next(
        new AppError('Failed to retrieve user data from google!', 500),
      );

    const decoded = decode(tokens.id_token);
    console.log(decoded);

    res.status(200).json({
      status: 'success',
      data: tokens,
    });
  },
);
