import { Module } from '@nestjs/common';
import {
  SlonikModule,
  SlonikModuleOptions,
  SlonikOptionsFactory,
} from '../../lib';
import { PhotoModule } from './photo/photo.module';

class ConfigService implements SlonikOptionsFactory {
  createSlonikOptions(): SlonikModuleOptions {
    return {
      connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
      retryAttempts: 2,
      retryDelay: 1000,
    };
  }
}

@Module({
  imports: [
    SlonikModule.forRootAsync({
      useClass: ConfigService,
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
export class AsyncOptionsClassModule {}
