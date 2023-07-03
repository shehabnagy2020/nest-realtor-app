import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    try {
      const req = context.switchToHttp().getRequest();
      let token = req.headers.authorization;
      token = token ? token.split('Bearer ')[1] : undefined;
      if (token) {
        const user = await jwt.decode(token);
        req.user = user;
      }
    } catch (error) {
      console.log(error);
    }

    return next.handle();
  }
}
