/* eslint-disable prettier/prettier */

import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomesDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  property_type: PropertyType;

  @IsNumber()
  @IsPositive()
  number_of_bedrooms: number;

  @IsNumber()
  @IsPositive()
  number_of_bathrooms: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  land_size: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];

  constructor(partial: Partial<CreateHomesDto>) {
    Object.assign(this, partial);
  }
}
