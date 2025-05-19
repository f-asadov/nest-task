import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPayloadDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username must be unique and contain 3 to 20 characters.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  @MinLength(3, { message: 'Username must be at least 3 characters long.' })
  @MaxLength(20, { message: 'Username must be at most 20 characters long.' })
  username: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Password must contain letters, numbers, and special characters.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(50, { message: 'Password must be at most 50 characters long.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).+$/, {
    message: 'Password must include at least one letter, one number, and one special character (!@#$%^&*).',
  })
  password: string;
}
