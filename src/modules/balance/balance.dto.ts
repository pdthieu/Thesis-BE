import { ApiProperty } from '@nestjs/swagger';

export class GetBalanceAddressesDto {
  @ApiProperty({ type: [String] })
  addresses: string[];
}

export class ITxRef {
  @ApiProperty()
  txHash?: string;

  @ApiProperty()
  blockHeight?: number;

  @ApiProperty()
  txInputN?: number;

  @ApiProperty()
  txOutputN?: number;

  @ApiProperty()
  value?: number;

  @ApiProperty()
  refBalance?: number;

  @ApiProperty()
  spent?: boolean;

  @ApiProperty()
  confirmations?: number;

  @ApiProperty({ type: Date })
  confirmed?: Date;

  @ApiProperty()
  doubleSpend?: boolean;
}

export class IBalance {
  @ApiProperty()
  address?: string;

  @ApiProperty()
  totalReceived?: number;

  @ApiProperty()
  totalSent?: number;

  @ApiProperty()
  balance?: number;

  @ApiProperty()
  unconfirmedBalance?: number;

  @ApiProperty()
  finalBalance?: number;

  @ApiProperty()
  nTx?: number;

  @ApiProperty()
  unconfimedNTx?: number;

  @ApiProperty()
  finalNTx?: number;

  @ApiProperty({ type: [ITxRef] })
  txrefs?: ITxRef[];

  @ApiProperty()
  txUrl?: string;
}
