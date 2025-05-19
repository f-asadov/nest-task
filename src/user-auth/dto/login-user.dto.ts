import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPayloadDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required.' })
  username: string;

  @ApiProperty({
    example: 'StrongP@ssw0rd!',
    description: 'Password of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
