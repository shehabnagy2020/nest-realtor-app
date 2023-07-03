/* eslint-disable prettier/prettier */

export class GetHomesDto {
  id: number;
  address: string;
  city: string;
  property_type: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  price: number;
  land_size: number;
  listed_date: Date;
  created_at: Date;
  updated_at: Date;
  realtor_id: number;

  constructor(partial: Partial<GetHomesDto>) {
    Object.assign(this, partial);
  }
}
