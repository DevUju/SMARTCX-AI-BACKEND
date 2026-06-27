import { UserRole } from 'src/common/enums/user-role.enum';

export type AuthenticatedUser = {
  sub: string;
  userId: string;
  businessId: string;
  email: string;
  role: UserRole;
};