import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { Business } from 'src/common/entities/business.entity';
import { RegisterBusinessDto } from './dto/register-business.dto';

export type BusinessProfileResponse = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly authService: AuthService,
  ) {}

  async register(input: RegisterBusinessDto): Promise<AuthResponseDto> {
    return this.authService.registerBusiness(input);
  }

  async getBusinessProfile(businessId: string): Promise<BusinessProfileResponse> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId, isActive: true },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return {
      id: business.id,
      businessName: business.businessName,
      ownerName: business.ownerName,
      email: business.email,
      phone: business.phone,
      category: business.category,
      logoUrl: business.logoUrl,
      isActive: business.isActive,
      createdAt: business.createdAt,
      updatedAt: business.updatedAt,
    };
  }
}