import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/utils/constant';

export class ChangePasswordRequest {
  @IsNotEmpty({ message: 'Password is required!' })
  currentPassword: string;

  @IsNotEmpty({ message: 'Password is required!' })
  @MinLength(6, { message: 'Password must be at least 6 characters!' })
  @MaxLength(32, { message: 'Password must be maximum 32 characters!' })
  @Matches(PASSWORD_REGEX, { message: 'New password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number!' })
  newPassword: string;
}