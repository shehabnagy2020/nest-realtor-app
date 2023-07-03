/* eslint-disable prettier/prettier */

import { PropertyType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateHomesDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsEnum(PropertyType)
  @IsNotEmpty()
  property_type: PropertyType;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  number_of_bedrooms: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  number_of_bathrooms: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  land_size: number;

  @IsOptional()
  @IsDate()
  @IsNotEmpty()
  listed_date: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];

  constructor(partial: Partial<UpdateHomesDto>) {
    Object.assign(this, partial);
  }
}
