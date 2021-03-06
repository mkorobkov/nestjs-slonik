import { Injectable } from '@nestjs/common';
import { InjectPool } from '../../../lib';
import { Photo } from './photo.entity';
import { DatabasePool, sql } from 'slonik';

@Injectable()
export class PhotoService {
  constructor(
    @InjectPool()
    private readonly pool: DatabasePool,
    @InjectPool('connection_2')
    private readonly pool2: DatabasePool,
  ) {}

  async findAll() {
    return await this.pool.many<Photo>(sql`SELECT *
                                           FROM photos;`);
  }

  async create() {
    return this.pool
      .one<Photo>(sql`INSERT INTO photos (name, description, views)
                      VALUES ('Nest', 'Is great!', 6000)
                      RETURNING *;`);
  }
}
