import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string(),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigModule],
})
export class ConfigModule {}
