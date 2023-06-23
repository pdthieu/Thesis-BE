import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class WitnessUtxo {
  @ApiProperty({ type: 'string', format: 'binary' })
  script: Buffer;

  @ApiProperty()
  value: number;
}

export class InputData {
  @ApiProperty()
  hash: string;

  @ApiProperty()
  index: number;

  @ApiProperty({ type: WitnessUtxo })
  witnessUtxo: WitnessUtxo;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  witnessScript?: Buffer;

  @ApiProperty()
  wif: string;

  @ApiProperty()
  @IsOptional()
  m?: number;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  finalScriptWitness?: Buffer;
}

export class OutputData {
  @ApiProperty()
  value: number;

  @ApiProperty()
  address: string;
}

export class SelectUtxosDto {
  @ApiProperty({ type: [InputData] })
  utxos: InputData[];

  @ApiProperty({ type: [OutputData] })
  outputs: OutputData[];

  @ApiProperty()
  feeRate: number;

  @ApiProperty()
  changeAddress: string;
}

export class SelectUtxosResponse {
  @ApiProperty({ type: [InputData] })
  inputs: InputData[];

  @ApiProperty({ type: [OutputData] })
  outputs: OutputData[];

  @ApiProperty()
  txSize: number;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  feeRate: number;
}
