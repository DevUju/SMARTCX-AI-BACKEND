import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Business } from 'src/common/entities/business.entity';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business]), AuthModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}