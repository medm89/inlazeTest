import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto/index';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private readonly logger = new Logger('UserService');
  constructor(
    @InjectRepository(User) private readonly userRespository: Repository<User>,
    @InjectRepository(Role) private roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, role, ...userData } = createUserDto;

      const roleid = await this.roleRepository.findOneBy({ id: role });
      if (!roleid) {
        throw new NotFoundException('Role not found');
      }

      const user = this.userRespository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        role,
      });
      await this.userRespository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll() {
    try {
      const users = await this.userRespository.find();
      users.forEach((user: User) => {
        delete user.password;
      });
      return users;
    } catch (error) {}
  }

  async findOne(id: string) {
    try {
      const user = await this.userRespository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`Role with ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRespository.preload({
        id,
        ...updateUserDto,
      });
      if (!user) {
        throw new NotFoundException(`user with ${id} not found`);
      }
      return await this.userRespository.save(user);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async remove(id: string) {
    try {
      const user = await this.userRespository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`user with ${id} not found`);
      }
      user.softDelete();
      return await this.userRespository.save(user);
    } catch (error) {
      this.handleDBError(error);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.userRespository.findOne({
        where: { email },
        select: { email: true, password: true },
      });
      if (!user) {
        throw new UnauthorizedException(`Credential are not valid`);
      }
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException(`Credential are not valid`);
      }
      return {
        ...user,
        token: this.getJwtToken({ email: user.email }),
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
