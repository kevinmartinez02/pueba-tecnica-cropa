import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'node:path';
import { apiRoot, resolveDatabasePath } from './database-path.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: resolveDatabasePath(config.get<string>('DATABASE_PATH')),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        migrations: [resolve(apiRoot, 'database/migrations/*.{ts,js}')],
        migrationsTableName: 'migrations',
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
