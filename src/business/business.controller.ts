import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthResponseDto } from 'src/auth/dto/auth-response.dto';
import { AuthenticatedUser } from 'src/auth/types/authenticated-user.type';
import { BusinessProfileResponse, BusinessService } from './business.service';
import { RegisterBusinessDto } from './dto/register-business.dto';

@ApiTags('Business')
@ApiBearerAuth()
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new business tenant account' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterBusinessDto): Promise<AuthResponseDto> {
    return this.businessService.register(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current business profile from JWT scope' })
  @ApiResponse({ status: 200 })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<BusinessProfileResponse> {
    return this.businessService.getBusinessProfile(user.businessId);
  }
}