import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const cookieToken = request.cookies?.accessToken;

    // 1. Nếu không gửi Authorization header hoặc Cookie -> Cho phép đi qua (Guest request), request.user = null
    if (
      (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) &&
      !cookieToken
    ) {
      request.user = null;
      return true;
    }

    // 2. Nếu có Authorization header -> Gọi Passport xác thực Token
    try {
      const isValid = (await super.canActivate(context)) as boolean;
      return isValid;
    } catch {
      // 3. Nếu Token hết hạn hoặc không hợp lệ -> Coi như Guest request (user = null) và cho phép đi qua
      request.user = null;
      return true;
    }
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}
