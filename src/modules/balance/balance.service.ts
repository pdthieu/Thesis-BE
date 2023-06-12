import { Inject, Injectable } from '@nestjs/common';
import { GetBalanceAddressesDto, IBalance } from './balance.dto';
import { AxiosInstance } from 'axios';

@Injectable()
export class BalanceService {
  constructor(
    @Inject('BLOCKCYPHER_TESTNET_AXIOS_V1')
    private readonly blockcypherTestnetAxiosV1: AxiosInstance,
  ) {}

  public async getBalanceAddresses(dto: GetBalanceAddressesDto) {
    const { addresses } = dto;

    const addrs = addresses.join(';')
    console.log(addrs);
    const { data } = await this.blockcypherTestnetAxiosV1.get<IBalance[]>(`/addrs/${addrs}?unspentonly=true`);
    
    return data;
  }
}
