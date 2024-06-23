/*
| Developed by Alexandre Schaffner
| Filename : handle-errors.ts
| Author : Alexandre Schaffner (alexandre.schaffner@icloud.com)
*/

import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { InvalidCredentials } from '../errors/InvalidCredentials';
import { InvalidTokenType } from '../errors/InvalidTokenType';

/*
|--------------------------------------------------------------------------
| Controller-level error management
|--------------------------------------------------------------------------
*/

// This function is used to handle Prisma errors
//--------------------------------------------------------------------------
export function handlePrismaErrors(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return;

  switch (error.code) {
    case 'P2002':
      throw new ConflictException();

    case 'P2003':
      throw new NotFoundException();

    case 'P2025':
      throw new NotFoundException();

    default:
      console.error(error);
      throw new InternalServerErrorException();
  }
}

// A wrapper function to handle errors
//--------------------------------------------------------------------------
export function handleErrors(err: unknown) {
  if (
    err instanceof InvalidCredentials ||
    err instanceof InvalidTokenType ||
    (err instanceof Error && err.name === 'JsonWebTokenError')
  )
    throw new UnauthorizedException();

  if (err instanceof HttpException) throw err;

  handlePrismaErrors(err);

  console.error(err);
  throw new InternalServerErrorException();
}
