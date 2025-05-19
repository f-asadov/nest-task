import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginPayloadDto } from './dto/login-user.dto';
import { RegisterPayloadDto } from './dto/register-user-dto';

import { vi, describe, it, beforeEach, expect } from 'vitest';
import * as bcrypt from 'bcryptjs';

vi.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: Partial<Repository<User>>;
  let jwtService: Partial<JwtService>;

  const mockUser: User = {
    id: 'uuid-123',
    username: 'john_doe',
    password: 'hashed_password',
  };

  beforeEach(() => {
    userRepo = {
      findOne: vi.fn(),
      save: vi.fn(),
    };

    jwtService = {
      sign: vi.fn(),
    };

    authService = new AuthService(jwtService as JwtService, userRepo as Repository<User>);
  });

  describe('login', () => {
    it('should return token and user data if credentials are valid', async () => {
      (userRepo.findOne as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwtService.sign as any).mockReturnValue('mocked_token');

      const dto: LoginPayloadDto = { username: 'john_doe', password: 'StrongP@ssw0rd!' };

      const result = await authService.login(dto);

      expect(result).toEqual({
        access_token: 'mocked_token',
        user: { id: mockUser.id, username: mockUser.username },
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (userRepo.findOne as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(authService.login({ username: 'john_doe', password: 'wrong' }))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (userRepo.findOne as any).mockResolvedValue(null);

      await expect(authService.login({ username: 'unknown', password: 'pass' }))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('registerUser', () => {
    it('should create and return user data if username is available', async () => {
      (userRepo.findOne as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_pass');
      (userRepo.save as any).mockResolvedValue({ ...mockUser, password: 'hashed_pass' });

      const dto: RegisterPayloadDto = {
        username: 'john_doe',
        password: 'StrongP@ssw0rd!',
      };

      const result = await authService.registerUser(dto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
        },
        message: 'Registration successful',
      });
    });

    it('should throw ConflictException if username is taken', async () => {
      (userRepo.findOne as any).mockResolvedValue(mockUser);

      const dto: RegisterPayloadDto = {
        username: 'john_doe',
        password: 'StrongP@ssw0rd!',
      };

      await expect(authService.registerUser(dto)).rejects.toThrow(ConflictException);
    });
  });
});
