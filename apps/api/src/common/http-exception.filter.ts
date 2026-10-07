import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { ApiError } from '@fuel-queue/shared-types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    const requestId = String(request.id ?? 'unknown');
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
    const exceptionData =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : {};
    const message =
      'message' in exceptionData
        ? String(exceptionData.message)
        : exception instanceof Error
          ? exception.message
          : 'An unexpected error occurred.';

    const body: ApiError = {
      code:
        typeof exceptionData.code === 'string'
          ? exceptionData.code
          : status === HttpStatus.BAD_REQUEST
            ? 'VALIDATION_FAILED'
            : status === HttpStatus.INTERNAL_SERVER_ERROR
              ? 'INTERNAL_ERROR'
              : 'REQUEST_FAILED',
      message,
      details:
        typeof exceptionData.details === 'object' && exceptionData.details !== null
          ? (exceptionData.details as Record<string, unknown>)
          : exceptionData,
      requestId,
    };

    response.status(status).json(body);
  }
}
