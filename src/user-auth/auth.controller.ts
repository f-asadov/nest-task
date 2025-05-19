import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginPayloadDto } from './dto/login-user.dto';
import { RegisterPayloadDto } from './dto/register-user-dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    type: LoginPayloadDto,
    examples: {
      default: {
        value: {
          username: 'john_doe',
          password: 'StrongP@ssw0rd!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns access token and user info',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'd50202b4-f9d7-4b8f-9ec7-234c4dff4a4e',
          username: 'john_doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid username or password',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginPayloadDto: LoginPayloadDto) {
    return await this.authService.login(loginPayloadDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    type: RegisterPayloadDto,
    examples: {
      default: {
        value: {
          username: 'new_user',
          password: 'StrongP@ss123!',
          email: 'user@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'User successfully registered',
    schema: {
      example: {
        id: 'a83a49a6-33c4-4a92-a4f9-83f0631cf2d7',
        username: 'new_user',
        email: 'user@example.com',
        createdAt: '2024-05-20T14:23:18.000Z',
      },
    },
  })
  async register(@Body() registerPayloadDto: RegisterPayloadDto) {
    return await this.authService.registerUser(registerPayloadDto);
  }
}
