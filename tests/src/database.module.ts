import { DynamicModule, Module } from '@nestjs/common';
import { SlonikModule } from '../../lib';

@Module({})
export class DatabaseModule {
  static async forRoot(): Promise<DynamicModule> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      module: DatabaseModule,
      imports: [
        SlonikModule.forRoot({
          connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
          retryAttempts: 2,
          retryDelay: 1000,
        }),
        SlonikModule.forRoot({
          name: 'connection_2',
          connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
          retryAttempts: 2,
          retryDelay: 1000,
        }),
      ],
    };
  }
}
