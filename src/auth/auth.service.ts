import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { StringValue } from 'ms';
import { Repository } from 'typeorm';
import { Business } from 'src/common/entities/business.entity';
import { User } from 'src/common/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerBusiness(input: RegisterAuthDto): Promise<AuthResponseDto> {
    const existingBusiness = await this.businessRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (existingBusiness) {
      throw new ConflictException('Business with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const business = this.businessRepository.create({
      businessName: input.businessName,
      ownerName: input.ownerName,
      email: input.email.toLowerCase(),
      phone: input.phone,
      category: input.category,
      passwordHash,
      isActive: true,
      logoUrl: null,
    });

    const savedBusiness = await this.businessRepository.save(business);
    const [firstName, ...remaining] = input.ownerName.trim().split(' ');

    const ownerUser = this.userRepository.create({
      businessId: savedBusiness.id,
      firstName,
      lastName: remaining.join(' ') || 'Owner',
      email: input.email.toLowerCase(),
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isOnline: false,
      lastSeenAt: null,
    });

    const savedOwner = await this.userRepository.save(ownerUser);
    return this.buildAuthResponse(savedOwner.id, savedBusiness.id, savedOwner.email, savedOwner.role);
  }

  async login(input: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const business = await this.businessRepository.findOne({
      where: { id: user.businessId, isActive: true },
    });

    if (!business) {
      throw new UnauthorizedException('Business is inactive or not found');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user.id, user.businessId, user.email, user.role);
  }

  private buildAuthResponse(
    userId: string,
    businessId: string,
    email: string,
    role: UserRole,
  ): AuthResponseDto {
    const payload = {
      sub: userId,
      userId,
      businessId,
      email,
      role,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: expiresIn as StringValue,
      secret: this.configService.get<string>('JWT_SECRET', 'change_me'),
    });

    return {
      accessToken,
      expiresIn,
      user: {
        id: userId,
        businessId,
        email,
        role,
      },
    };
  }
}