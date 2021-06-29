import { Type, ModuleMetadata } from '@nestjs/common';
import { ClientConfigurationInputType } from 'slonik';

export interface SlonikOptions {
  connectionUri: string;
  clientConfigurationInput?: ClientConfigurationInputType;
}

export interface SlonikModuleOptions extends SlonikOptions {
  /**
   * Connection pool name
   */
  name?: string;

  /**
   * Function that determines whether the module should
   * attempt to connect upon failure.
   *
   * @param err error that was thrown
   * @returns whether to retry connection or not
   */
  toRetry?: (err: any) => boolean;
  /**
   * If `true`, will show verbose error messages on each connection retry.
   */
  verboseRetryLog?: boolean;
  /**
   * Number of times to retry connecting
   * Default: 10
   */
  retryAttempts?: number;
  /**
   * Delay between connection retry attempts (ms)
   * Default: 3000
   */
  retryDelay?: number;
}

export interface SlonikOptionsFactory {
  createSlonikOptions(
    poolName?: string,
  ): Promise<SlonikModuleOptions> | SlonikModuleOptions;
}

export interface SlonikModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  useExisting?: Type<SlonikOptionsFactory>;
  useClass?: Type<SlonikOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<SlonikModuleOptions> | SlonikModuleOptions;
  inject?: any[];
}
