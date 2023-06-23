import { Injectable } from '@nestjs/common';

export enum ConfigKey {
  // redis
  REDIS_URL = 'REDIS_URL',

  // database
  POSTGRES_URL = 'POSTGRES_URL',
  POSTGRES_TEST_URL = 'POSTGRES_TEST_URL',
  POSTGRES_SYNCHRONIZE = 'POSTGRES_SYNCHRONIZE',
}

@Injectable()
export class SystemConfigProvider {
  public get isTestnetNetwork() {
    return this.getEnv('BITCOIN_NETWORK', 'testnet') === 'testnet';
  }

  public get isProduction() {
    return this.getEnv('NODE_ENV', 'development') === 'production';
  }

  public get isTest() {
    return this.getEnv('NODE_ENV', 'development') === 'test';
  }

  public get isDebugging() {
    return !!this.getEnv('DEBUG');
  }

  public get port(): number {
    return parseInt(this.getEnv('PORT', '3001'), 10);
  }

  public get enableSwagger() {
    return !this.isTest && (!this.isProduction || this.isDebugging);
  }

  public getEnv(key: string, defaultValue?: string) {
    return process.env[key] || defaultValue;
  }

  public getPostgresUrl() {
    return this.isTest
      ? this.getEnv(ConfigKey.POSTGRES_TEST_URL)
      : this.getEnv(ConfigKey.POSTGRES_URL);
  }

  public get postgresSynchronize() {
    return this.getEnv(ConfigKey.POSTGRES_SYNCHRONIZE, 'false');
  }
}

const systemConfig = new SystemConfigProvider();

export default systemConfig;
