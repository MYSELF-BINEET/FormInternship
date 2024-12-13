import type { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../models/userModel';
import catchAsyncError from '../utils/catchAsyncError';
import AppError from '../utils/appError';
import { cookieOptions } from '../utils/constants';
import { signAccessToken, signRefreshToken } from './authController';

const userRepository = AppDataSource.getRepository(User);

const refreshTokenHandler = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req);
    const refreshToken = req.cookies.refresh_token as string;
    if (!refreshToken) return next(new AppError('No refresh token!', 401));
    res.clearCookie('refreshToken', cookieOptions);

    // // Find user with the refresh token
    // const foundUsers = await userRepository
    //   .createQueryBuilder('User')
    //   .getMany();


    // const foundUser=foundUsers.map((user)=>{
    //   user.refreshToken.map((rft)=>{
    //     if(rft===refreshToken){
    //       return user;
    //     }
    //   })
    // })  
    const foundUser = await userRepository
      .createQueryBuilder('User')
      .where(':token = ANY("User"."refreshToken"::text[])', { token: refreshToken })
      .getOne();
   

    
    if (!foundUser) {
      verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
        async (err, decoded) => {
          if (err) return next(new AppError('Invalid refresh token!', 403));
    
          const hackedUser = await userRepository.findOne({
            where: { id: (decoded as { id: string }).id },
          });
    
          if (hackedUser) {
            hackedUser.refreshToken = [];
            await userRepository.save(hackedUser);
          }
        },
      );
      return next(new AppError('Invalid refresh token!', 403));
    }
    
    // Remove old refresh token from the user's refresh tokens array
    const newRefreshTokenArray = foundUser.refreshToken.filter(
      (token) => token !== refreshToken,
    );
    
    verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async (err, decoded) => {
        if (err || !decoded || foundUser.id !== (decoded as { id: string }).id) {
          foundUser.refreshToken = [...newRefreshTokenArray];
          await userRepository.save(foundUser);
          return next(new AppError('Invalid refresh token!', 403));
        }
    
        // Generate new access and refresh tokens
        const accessToken = signAccessToken(foundUser.id);
        const newRefreshToken = signRefreshToken(foundUser.id);
    
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await userRepository.save(foundUser);
    
        res.cookie('refreshToken', newRefreshToken, cookieOptions);
    
        res.status(200).json({
          status: 'success',
          accessToken,
        });
      },
    );
  }
);    

export default refreshTokenHandler;