import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetHomesDto } from './dto/GetHomes.dto';
import { CreateHomesDto } from './dto/CreateHomes.dto';
import { IUserToken } from 'src/user/auth/auth.controller';
import { UpdateHomesDto } from './dto/UpdateHomes.dto';
import { UserType } from '@prisma/client';

interface Filters {
  city?: string;
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async GetHomes(filters: Filters) {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        property_type: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        price: true,
        land_size: true,
        listed_date: true,
        images: {
          select: {
            id: true,
            url: true,
          },
        },
        realtor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
      where: filters,
    });
    return homes.map((home) => {
      const newHome = { ...home, image: home.images[0]?.url };
      return new GetHomesDto(newHome);
    });
  }

  async CreateHome(
    {
      city,
      address,
      images,
      land_size,
      number_of_bathrooms,
      number_of_bedrooms,
      price,
      property_type,
    }: CreateHomesDto,
    user: IUserToken,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        city,
        address,
        land_size,
        number_of_bathrooms,
        number_of_bedrooms,
        price,
        property_type,
        realtor_id: user.id,
      },
    });
    const editedImages = images.map((img) => ({ ...img, home_id: home.id }));
    await this.prismaService.image.createMany({
      data: editedImages,
    });
    return { ...home, images };
  }

  async EditHome(id: number, data: UpdateHomesDto) {
    const { images, ...newData } = data;
    const home = await this.prismaService.home.update({
      where: { id },
      data: newData,
    });
    if (images) {
      await this.prismaService.image.deleteMany({ where: { home_id: id } });
      const editedImages = images.map((img) => ({ ...img, home_id: id }));
      await this.prismaService.image.createMany({
        data: editedImages,
      });
    }

    return { ...home, images };
  }

  async DeleteHome(id: number) {
    await this.prismaService.image.deleteMany({ where: { home_id: id } });
    await this.prismaService.home.delete({ where: { id } });
    return { message: 'home deleted successfully' };
  }

  async isUserHomeRealtor(home_id: number, user_id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id: home_id },
    });
    if (!home) throw new HttpException('Home not found', 400);
    return home.realtor_id === user_id;
  }

  async getRealtorByHomeId(home_id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id: home_id },
      include: {
        realtor: true,
      },
    });
    if (!home) throw new HttpException('Home not found', 400);
    return home.realtor;
  }

  async GetAllMessages(home_id: number, user: IUserToken) {
    const ids = {
      ...(user.userType === UserType.BUYER && { buyer_id: user.id }),
      ...(user.userType === UserType.REALTOR && { realtor_id: user.id }),
    };
    return this.prismaService.message.findMany({
      where: { home_id, ...ids },
      select: {
        id: true,
        message: true,
        created_at: true,
        buyer: { select: { id: true, name: true } },
        realtor: { select: { id: true, name: true } },
        home: { select: { id: true, address: true, city: true } },
      },
    });
  }

  async SendMessage(
    message: string,
    home_id: number,
    realtor_id: number,
    buyer_id: number,
  ) {
    const msg = await this.prismaService.message.create({
      data: { message, realtor_id, buyer_id, home_id },
    });
    return msg;
  }
}
