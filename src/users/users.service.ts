import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from 'src/common/entities/user.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async list(businessId: string): Promise<User[]> {
    return this.userRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async invite(businessId: string, dto: InviteUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.temporaryPassword, 12);
    const user = this.userRepository.create({
      businessId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      isOnline: false,
      lastSeenAt: null,
    });
    return this.userRepository.save(user);
  }

  async update(businessId: string, userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId, businessId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isOnline !== undefined) user.isOnline = dto.isOnline;

    return this.userRepository.save(user);
  }
}