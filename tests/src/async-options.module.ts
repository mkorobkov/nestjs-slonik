import { Module } from '@nestjs/common';
import { SlonikModule } from '../../lib';
import { PhotoModule } from './photo/photo.module';

@Module({
  imports: [
    SlonikModule.forRootAsync({
      useFactory: () => ({
        connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
    SlonikModule.forRoot({
      name: 'connection_2',
      connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
      retryAttempts: 2,
      retryDelay: 1000,
    }),
    PhotoModule,
  ],
})
export class AsyncOptionsFactoryModule {}
