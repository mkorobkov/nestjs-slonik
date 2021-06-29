import { Module } from '@nestjs/common';
import { SlonikModule } from '../../lib';

@Module({
  imports: [
    SlonikModule.forRoot({
      connectionUri: 'postgres://root:badpassword@0.0.0.0:5432/test', // pass bad password
      retryAttempts: 1,
      retryDelay: 1000,
    }),
  ],
})
export class AppAuthenticateModule {}
