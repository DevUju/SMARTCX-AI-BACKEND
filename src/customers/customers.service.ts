import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/common/entities/customer.entity';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { ChannelType } from 'src/common/enums';
import { CustomerStatus } from 'src/common/enums';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async list(businessId: string, query: ListCustomersQueryDto): Promise<Customer[]> {
    const qb = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.businessId = :businessId', { businessId })
      .orderBy('customer.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(customer.name) LIKE :search OR LOWER(customer.email) LIKE :search OR LOWER(customer.phone) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async getById(businessId: string, customerId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async findOrCreate(
    businessId: string,
    name: string,
    channel: ChannelType,
    contact: { phone?: string; email?: string },
  ): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: [
        contact.phone ? { businessId, phone: contact.phone } : {},
        contact.email ? { businessId, email: contact.email } : {},
      ].filter((clause) => Object.keys(clause).length > 1), // drop empty clauses
    });

    if (existing) {
      return existing;
    }

    const customer = this.customerRepository.create({
      businessId,
      name,
      phone: contact.phone ?? null,
      email: contact.email ?? null,
      channel,
      totalSpent: 0,
      location: null,
      status: CustomerStatus.NEW,
    });

    return this.customerRepository.save(customer);
  }
}