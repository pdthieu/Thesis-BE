import { Module } from '@nestjs/common';
import axios from 'axios';

const BlockCypherTestnetAxiosProviderV1 = {
  provide: 'BLOCKCYPHER_TESTNET_AXIOS_V1',
  useFactory: async () => {
    return axios.create({
      baseURL: 'https://api.blockcypher.com/v1/btc/test3',
    });
  },
};

@Module({
  providers: [BlockCypherTestnetAxiosProviderV1],
  exports: [BlockCypherTestnetAxiosProviderV1],
})
export class BlockcypherModule {}
