// import {
//   IsOptional,
//   IsNumber,
//   IsBoolean,
//   IsString,
//   IsArray
// } from 'class-validator';

// import { Type } from 'class-transformer';

// export class CreatePriceDto {

//   /*
//   ==============================
//   EXPECTED RENT
//   ==============================
//   */
//   @Type(() => Number)
//   @IsNumber()
//   rent: number | undefined;

//   /*
//   ==============================
//   DEPOSIT
//   ==============================
//   */
//   @Type(() => Number)
//   @IsNumber()
//   deposit: number | undefined;

//   /*
//   ==============================
//   MAINTENANCE EXTRA
//   ==============================
//   */
//   @IsOptional()
//   @IsBoolean()
//   maintenanceExtra?: boolean;




//   /*
//   ==============================
//   LEASE DURATION
//   ==============================
//   */
//   @IsOptional()
//   @IsString()
//   leaseDuration?: string;

//   @IsOptional()
//   @IsString()
// maintenanceAmount?: number;
//   /*
//   ==============================
//   LOCKIN PERIOD
//   ==============================
//   */
//   @IsOptional()
//   @IsString()
//   lockinPeriod?: string;

//   /*
//   ==============================
//   AVAILABLE FROM
//   ==============================
//   */
//   @IsOptional()
//   @IsString()
//   availableFrom?: string;

//   /*
//   ==============================
//   IDEAL FOR
//   ==============================
//   */
//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   idealFor?: string[];

//   /*
//   ==============================
//   TAGS
//   ==============================
//   */
//   @IsOptional()
//   @IsString()
//   addOthertags?: string;
//   rentType: any;
// }