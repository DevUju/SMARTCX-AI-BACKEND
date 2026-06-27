import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { User } from 'src/common/entities/user.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users in current business' })
  @ApiResponse({ status: 200, type: [User] })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<User[]> {
    return this.usersService.list(user.businessId);
  }

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new agent/admin user in current business' })
  @ApiResponse({ status: 201, type: User })
  async invite(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InviteUserDto,
  ): Promise<User> {
    return this.usersService.invite(user.businessId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile/status in current business' })
  @ApiResponse({ status: 200, type: User })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(user.businessId, id, dto);
  }
}