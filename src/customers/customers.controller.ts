import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { Customer } from 'src/common/entities/customer.entity';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers in current business' })
  @ApiResponse({ status: 200, type: [Customer] })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCustomersQueryDto,
  ): Promise<Customer[]> {
    return this.customersService.list(user.businessId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id in current business' })
  @ApiResponse({ status: 200, type: Customer })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<Customer> {
    return this.customersService.getById(user.businessId, id);
  }
}