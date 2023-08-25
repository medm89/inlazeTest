import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  private readonly logger = new Logger('RoleService');
  constructor(
    @InjectRepository(Role) private readonly roleRespository: Repository<Role>,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRespository.create(createRoleDto);
      await this.roleRespository.save(role);
      return role;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  findAll() {
    try {
      const role = this.roleRespository.find();
      return role;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findOne(id: number) {
    try {
      const role = await this.roleRespository.findOneBy({ id });
      if (!role) {
        throw new NotFoundException(`Role with ${id} not found`);
      }
      return role;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRespository.preload({
        id,
        ...updateRoleDto,
      });
      if (!role) {
        throw new NotFoundException(`Role with ${id} not found`);
      }
      return this.roleRespository.save(role);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async remove(id: number) {
    try {
      const role = await this.roleRespository.findOneBy({ id });
      if (!role) {
        throw new NotFoundException(`Role with ${id} not found`);
      }
      role.softDelete();
      return await this.roleRespository.save(role);
    } catch (error) {
      this.handleDBError(error);
    }
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    } else {
      this.logger.error(error);
      throw new InternalServerErrorException('Please check server logs');
    }
  }
}
