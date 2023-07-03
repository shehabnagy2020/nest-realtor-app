import { PrismaService } from './../../prisma/prisma.service';
import { UserType } from '@prisma/client';
import { Injectable, HttpException } from '@nestjs/common';
import { GenerateKeyDto, SigninDto, SignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async Signup({ email, password, name, phone, userType }: SignupDto) {
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExist) throw new HttpException('Email already exists', 400);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        user_type: userType || UserType.BUYER,
      },
    });
    return jwt.sign(
      { name, userType, email, id: user.id },
      process.env.JWT_SALT,
      {
        expiresIn: 36000,
      },
    );
  }

  async Signin({ email, password }: SigninDto) {
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!userExist) throw new HttpException('invalid credentials', 400);
    const isMatch = await bcrypt.compare(password, userExist.password);
    if (!isMatch) throw new HttpException('invalid credentials', 400);

    return jwt.sign(
      {
        name: userExist.name,
        userType: userExist.user_type,
        email,
        id: userExist.id,
      },
      process.env.JWT_SALT,
      {
        expiresIn: 36000,
      },
    );
  }

  async GenerateKey({ email, userType }: GenerateKeyDto) {
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (userExist) throw new HttpException('Email already exists', 400);
    const key = `${email}-${userType}-${process.env.JWT_SALT}`;
    return bcrypt.hash(key, 10);
  }
}
