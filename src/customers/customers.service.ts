import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from 'src/common/entities/customer.entity';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';

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
}