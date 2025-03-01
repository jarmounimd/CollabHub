import { IsEmail, IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  role: string;
}