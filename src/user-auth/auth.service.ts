import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginPayloadDto } from './dto/login-user.dto';
import { RegisterPayloadDto } from './dto/register-user-dto';


@Injectable()
export class AuthService {

    constructor(private readonly jwtService: JwtService,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) { }

    async login(loginPayloadDto:LoginPayloadDto) {
        const { username, password } = loginPayloadDto;
    
        const user = await this.userRepo.findOne({ where: { username } });
        
        if (user && await bcrypt.compare(password, user.password)) {
          const { password, ...userData } = user; 
          const token = this.jwtService.sign({ id: user.id, username: user.username });
    
          return {
            access_token: token,
            user: userData
          };
        }
        throw new UnauthorizedException('Invalid credentials');
      }

      async registerUser(registerPayloadDto: RegisterPayloadDto) {
        const existingUser = await this.userRepo.findOne({
            where: { username: registerPayloadDto.username }
        });
    
        if (existingUser) {
            throw new ConflictException('User with this username already exists');
        }
    
        const passwordHash = await bcrypt.hash(registerPayloadDto.password, 10);
    
        const createdUser = await this.userRepo.save({ 
            ...registerPayloadDto, 
            password: passwordHash 
        });
    
        const { password, ...userData } = createdUser;
    
        return {
            user: userData,
            message: 'Registration successful'
        };
    }
}