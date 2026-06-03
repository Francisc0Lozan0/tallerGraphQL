import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductsModule } from './modules/products/products.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { RolesModule } from './modules/roles/roles.module';
import { ScansModule } from './modules/scans/scans.module';
import { StorePricesModule } from './modules/store-prices/store-prices.module';
import { UsersModule } from './modules/users/users.module';
import { SeedModule } from './modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        synchronize: ((): boolean => {
          const syncValue = configService.get<string>('DB_SYNC');
          return syncValue ? syncValue === 'true' : false;
        })(),
        ssl: ((): boolean | { rejectUnauthorized: boolean } => {
          const sslValue = configService.get<string>('DB_SSL');
          const useSsl = sslValue ? sslValue === 'true' : true;
          return useSsl ? { rejectUnauthorized: false } : false;
        })(),
        extra: ((): { ssl: { rejectUnauthorized: boolean } } | undefined => {
          const sslValue = configService.get<string>('DB_SSL');
          const useSsl = sslValue ? sslValue === 'true' : true;
          return useSsl ? { ssl: { rejectUnauthorized: false } } : undefined;
        })(),
      }),
    }),
    AuthModule,
    InventoryModule,
    NutritionModule,
    NotificationsModule,
    ProductsModule,
    RecipesModule,
    RecommendationsModule,
    RolesModule,
    ScansModule,
    StorePricesModule,
    UsersModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
