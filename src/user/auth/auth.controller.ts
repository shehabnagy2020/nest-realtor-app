import { UserType } from '@prisma/client';
import { AuthService } from './auth.service';
import { Controller, Post, Body, HttpException } from '@nestjs/common';
import { GenerateKeyDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

export interface IUserToken {
  name: string;
  userType: string;
  email: string;
  id: number;
  iat: number;
  exp: number;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async userSignUp(@Body() body: SignupDto) {
    if (body.userType && body.userType !== UserType.BUYER) {
      if (!body.userKey) throw new HttpException('user key is missing', 400);
      const key = `${body.email}-${body.userType}-${process.env.JWT_SALT}`;
      const isMatch = await bcrypt.compare(key, body.userKey);
      if (!isMatch) throw new HttpException('invalid user key', 400);
    }
    return this.authService.Signup(body);
  }

  @Post('/signin')
  async Signin(@Body() body: SigninDto) {
    return this.authService.Signin(body);
  }

  @Post('/userkey')
  async GenerateKey(@Body() body: GenerateKeyDto) {
    return this.authService.GenerateKey(body);
  }
}
