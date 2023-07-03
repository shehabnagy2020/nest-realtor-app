import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { PropertyType, UserType } from '@prisma/client';
import { CreateHomesDto } from './dto/CreateHomes.dto';
import { UpdateHomesDto } from './dto/UpdateHomes.dto';
import { User } from 'src/user/user.decorator';
import { IUserToken } from 'src/user/auth/auth.controller';
import { Roles } from 'src/user/roles.decorator';
import { CreateMessageDto } from './dto/CreateMessage.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  async GetHomes(
    @Query('city') city: string,
    @Query('address') address: string,
    @Query('propertyType') propertyType: PropertyType,
    @Query('priceMax') priceMax: number,
    @Query('priceMin') priceMin: number,
    @Query('landSize') landSize: number,
    @Query('numberOfBedrooms') numberOfBedrooms: number,
    @Query('numberOfBathrooms') numberOfBathrooms: number,
  ) {
    const prices =
      priceMax || priceMin
        ? {
            ...(priceMax && { lte: priceMax }),
            ...(priceMin && { gte: priceMin }),
          }
        : undefined;
    const filters = {
      ...(city && { city }),
      ...(address && { address }),
      ...(landSize && {
        land_size: {
          lte: landSize,
        },
      }),
      ...(prices && { price: prices }),
      ...(propertyType && { property_type: propertyType }),
      ...(numberOfBedrooms && { number_of_bedrooms: numberOfBedrooms }),
      ...(numberOfBathrooms && { number_of_bathrooms: numberOfBathrooms }),
    };

    return this.homeService.GetHomes(filters);
  }

  @Roles(UserType.REALTOR)
  @Post()
  async CreateHome(@Body() body: CreateHomesDto, @User() user: IUserToken) {
    return this.homeService.CreateHome(body, user);
  }

  @Roles(UserType.REALTOR)
  @Patch('/:id')
  async EditHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateHomesDto,
    @User() user: IUserToken,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.EditHome(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete('/:id')
  async DeleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: IUserToken,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();
    return this.homeService.DeleteHome(id);
  }

  @Roles(UserType.BUYER, UserType.REALTOR)
  @Get('/:id/messages')
  async GetAllMessages(
    @Param('id', ParseIntPipe) id: number,
    @User() user: IUserToken,
  ) {
    return this.homeService.GetAllMessages(id, user);
  }

  @Roles(UserType.BUYER, UserType.REALTOR)
  @Post('/:id/messages')
  async SendMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() { message }: CreateMessageDto,
    @User() user: IUserToken,
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (!realtor) throw new HttpException('home not found', 400);
    return this.homeService.SendMessage(message, id, realtor.id, user.id);
  }
}
// buyer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2hlaGFiIGJ1eWVyIiwidXNlclR5cGUiOiJCVVlFUiIsImVtYWlsIjoiYnV5ZXJAZ21haWwuY29tIiwiaWQiOjEsImlhdCI6MTY4ODM5NzEyOCwiZXhwIjoxNjg4NDMzMTI4fQ.eb-zs7RF1HCuPa9c2ye0JmH0wFkQf3pmF1CQRTwi_p4
// realtor eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoic2hlaGFiIHJlYWx0b3IiLCJ1c2VyVHlwZSI6IlJFQUxUT1IiLCJlbWFpbCI6InJlYWx0b3JAZ21haWwuY29tIiwiaWQiOjIsImlhdCI6MTY4ODM5NzE5MSwiZXhwIjoxNjg4NDMzMTkxfQ.rhRcgVHD87cseHSB7MEcJMMvLdX7bFzRvCUMY7K9lNQ
