<a name="nestjs-slonik"></a>
## Description

[Slonik](https://github.com/gajus/slonik) module for [Nest 8/9/10](https://github.com/nestjs/nest)

This module is based on [@nestjs/typeorm](https://github.com/nestjs/typeorm) and [@nestjs/sequelize](https://github.com/nestjs/sequelize) modules.

This README is based on nest.js [documentation](https://github.com/nestjs/docs.nestjs.com/blob/ed5ebf0a4c19edfa74b48ff108ed48088c7f6a2c/content/techniques/sql.md).

## Contents
* [nestjs-slonik](#nestjs-slonik)
    * [Installation](#installation)
    * [Basic import](#basic-import)
    * [Multiple databases](#multiple-databases)
    * [Testing](#testing)
    * [Async configuration](#async-configuration)
    * [Routing queries to different connections](#routing-queries-to-different-connections)
    * [License](#license)

<a name="installation"></a>
### Installation

###### npm

```bash
npm i --save nestjs-slonik slonik
```

###### yarn

```bash
yarn add nestjs-slonik slonik
```

<a name="basic-import"></a>
### Basic import

Once the installation process is complete, we can import the `SlonikModule` into the root `AppModule`.


> app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { SlonikModule } from 'nestjs-slonik';

@Module({
  imports: [
    SlonikModule.forRoot({
      connectionUri: 'postgres://root:root@localhost/test',
    }),
  ],
})
export class AppModule {}
```

The `forRoot()` method supports configuration properties described below.

<table>
  <tr>
    <td colspan='2'><b>Slonik options</b></td>
  </tr>
  <tr>
    <td><code>connectionUri</code></td>
    <td><a href='https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING'>Connection URI</a></td>
  </tr>
  <tr>
    <td><code>clientConfiguration</code></td>
    <td><a href='https://github.com/gajus/slonik#api'>Slonik configuration object</a></td>
  </tr>
  <tr>
    <td colspan='2'><b>SlonikModule options</b></td>
  </tr>
  <tr>
    <td><code>name</code></td>
    <td>Connection pool name. Used to inject different db connections (default: <code>default</code>)</td>
  </tr>
  <tr>
    <td><code>toRetry</code></td>
    <td>Function that determines whether the module should attempt to connect upon failure
<br><code>(err: any) => boolean</code>
<br>err parameter is error that was thrown</td>
  </tr>
  <tr>
    <td><code>verboseRetryLog</code></td>
    <td>If <code>true</code>, will show verbose error messages on each connection retry (default: <code>false</code>)</td>
  </tr>
  <tr>
    <td><code>retryAttempts</code></td>
    <td>Number of attempts to connect to the database (default: <code>10</code>)</td>
  </tr>
  <tr>
    <td><code>retryDelay</code></td>
    <td>Delay between connection retry attempts (ms) (default: <code>3000</code>)</td>
  </tr>
</table>

Once this is done, the Slonik pool will be available to inject across the entire project (without needing to
import any modules), for example:

> app.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectPool } from 'nestjs-slonik';
import { DatabasePool, sql } from 'slonik';

@Injectable()
export class AppService {
  constructor(@InjectPool() private pool: DatabasePool) {}

  getHello(): Promise<string> {
    return this.pool.oneFirst<string>(sql`SELECT 'Hello World!';`);
  }
}
```

<a name="multiple-databases"></a>
### Multiple databases

Some projects require multiple database connections. This can also be achieved with this module.
To work with multiple pools, first create the pools. In this case, pool naming becomes **mandatory**.

```typescript
@Module({
  imports: [
    SlonikModule.forRoot({
      connectionUri: 'postgres://user:pwd@user_db_host:5432/users',
    }),
    SlonikModule.forRoot({
      name: 'albumsConnection',
      connectionUri: 'postgres://user:pwd@album_db_host:5432/albums',
    }),
  ],
})
export class AppModule {}
```

> **Notice** If you don't set the `name` for a pool, its name is set to `default`. Please note that you shouldn't
> have multiple pools without a name, or with the same name, otherwise they will get overridden.

Now you can inject the Slonik pool for a given pool name:

```typescript
@Injectable()
export class AlbumsService {
  constructor(
    @InjectPool()
    private usersPool: DatabasePool,
    @InjectPool('albumsConnection')
    private albumsPool: DatabasePool,
  ) {}
}
```

It's also possible to inject any Slonik pool instance to the providers:

```typescript
import { DatabasePool } from 'slonik';
import { getPoolToken } from 'nestjs-slonik';

@Module({
  providers: [
    {
      provide: AlbumsService,
      useFactory: (albumsConnection: DatabasePool) => {
        return new AlbumsService(albumsConnection);
      },
      inject: [getPoolToken('albumsConnection')],
    },
  ],
})
export class AlbumsModule {}
```

<a name="testing"></a>
### Testing

When it comes to unit testing an application, we usually want to avoid making a database connection,
keeping our test suites independent and their execution process as fast as possible. But our classes might
depend on Slonik pool instance. How do we handle that? The solution is to create mock pool. In order to achieve
that, we set up [custom providers](https://docs.nestjs.com/fundamentals/custom-providers).
Each registered pool is automatically represented by an `<poolName='default'>SlonikPool` token.

The `nestjs-slonik` package exposes the `getPoolToken()` function which returns a prepared token based on a given
pool name.

```typescript
@Module({
  providers: [
    UsersService,
    {
      provide: getPoolToken(),
      useValue: mockPool,
    },
  ],
})
export class UsersModule {}
```

Now a substitute `mockPool` will be used as the Slonik pool. Whenever any class asks for Slonik pool using
an `@InjectPool()` decorator, Nest will use the registered `mockPool` object.

#### How to create mockPool

- https://github.com/gajus/slonik#mocking-slonik
- https://github.com/oguimbal/pg-mem/wiki/Libraries-adapters#-slonik

> example of pg-mem usage
```typescript
import { newDb } from 'pg-mem';

const mockDb = newDb();
mockDb.public.none(`create table users(id text);
                    insert into users values ('john doe');`);
const mockPool = mockDb.adapters.createSlonik();
```

You can read more about pg-mem [here](https://github.com/oguimbal/pg-mem#-usage)

<a name="async-configuration"></a>
### Async configuration

You may want to pass your `SlonikModule` options asynchronously instead of statically.
In this case, use the `forRootAsync()` method, which provides several ways to deal with async configuration.

One approach is to use a factory function:

```typescript
SlonikModule.forRootAsync({
  useFactory: () => ({
    connectionUri: 'postgres://root:root@0.0.0.0:5432/test',
  }),
});
```

Our factory behaves like any other [asynchronous provider](https://docs.nestjs.com/fundamentals/async-providers)
(e.g., it can be `async` and it's able to inject dependencies through `inject`).

```typescript
SlonikModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    connectionUri: configService.get('DATABASE_URL'),
    clientConfigurationInput: {
      interceptors: [
        createFieldNameTransformationInterceptor({ format: 'CAMEL_CASE' }),
      ],
    },
  }),
  inject: [ConfigService],
});
```

Alternatively, you can use the `useClass` syntax:

```typescript
SlonikModule.forRootAsync({
  useClass: SlonikConfigService,
});
```

The construction above will instantiate `SlonikConfigService` inside `SlonikModule` and use it to provide
an options object by calling `createSlonikOptions()`. Note that this means that the `SlonikConfigService`
has to implement the `SlonikOptionsFactory` interface, as shown below:

```typescript
@Injectable()
class SlonikConfigService implements SlonikOptionsFactory {
  createSlonikOptions(): SlonikModuleOptions {
    return {
      connectionUri: 'postgres://root:root@localhost/test',
    };
  }
}
```

In order to prevent the creation of `SlonikConfigService` inside `SlonikModule` and use a provider imported
from a different module, you can use the `useExisting` syntax.

```typescript
SlonikModule.forRootAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

This construction works the same as `useClass` with one critical difference - `SlonikModule` will lookup
imported modules to reuse an existing `ConfigService` instead of instantiating a new one.

> Make sure that the `name` property is defined at the same level as the `useFactory`, `useClass`, or
> `useValue` property. This will allow Nest to properly register the pool under the appropriate injection token.

<a name="routing-queries-to-different-connections"></a>
### Routing queries to different connections

Read more about this pattern here: [Slonik docs](https://github.com/gajus/slonik#routing-queries-to-different-connections)

```typescript
@Module({
  imports: [
    SlonikModule.forRoot({
      name: 'slave',
      connectionUri: 'postgres://slave',
    }),
    SlonikModule.forRootAsync({
      inject: [getPoolToken('slave')],
      useFactory: (slavePool: DatabasePool) => ({
        connectionUri: 'postgres://master',
        clientConfigurationInput: {
          interceptors: [
            {
              beforePoolConnection: async (connectionContext) => {
                if (connectionContext?.query?.sql?.includes('SELECT')) {
                  return slavePool;
                }
              },
            },
          ],
        },
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

We register `master` pool as the default pool, but use Slonik interceptors to return
`slave` pool on SELECT queries.

> app.controller.ts
```typescript
import { Controller, Get } from '@nestjs/common';
import { InjectPool } from 'nestjs-slonik';
import { DatabasePool, sql } from 'slonik';

@Controller()
export class AppController {
  constructor(@InjectPool() private readonly pool: DatabasePool) {}

  @Get()
  async getHello() {
    await this.pool.query(sql`UPDATE 1`);
    return this.pool.oneFirst(sql`SELECT 1`);
  }
}
```

The first query will use `postgres://master` connection.

The second query will use `postgres://slave` connection.

<a name="license"></a>
## License

[MIT license](LICENSE)
