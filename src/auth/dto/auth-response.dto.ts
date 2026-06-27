import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ example: '1d' })
  expiresIn!: string;

  @ApiProperty()
  user!: {
    id: string;
    businessId: string;
    email: string;
    role: UserRole;
  };
}