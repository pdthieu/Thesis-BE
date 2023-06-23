import { CoinselectService } from '@modules/coinselect/coinselect.service';
import { multiInputs } from '@scripts/input-test';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CoinselectModule } from '@modules/coinselect/coinselect.module';

@Module({
  imports: [CoinselectModule],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly coinSelectSrv: CoinselectService) {}

  async onApplicationBootstrap(): Promise<void> {
    const utxos = multiInputs.map((input) => ({
      hash: input.hash,
      index: input.index,
      witnessUtxo: {
        script: Buffer.from(input.witnessUtxo.script.data),
        value: input.witnessUtxo.value,
      },
      wif: input.wif,
      m: input.m,
      witnessScript: Buffer.from(input.witnessScript.data),
    }));

    const dto = {
      utxos: utxos,
      outputs: [
        {
          address:
            'tb1qm89atjth5kpsghzkxrk26vmefgtge0d4zlma70svpm6lqk62a3kstqtl38',
          value: 22700,
        },
      ],
      feeRate: 1,
      changeAddress:
        'tb1qm89atjth5kpsghzkxrk26vmefgtge0d4zlma70svpm6lqk62a3kstqtl38',
    };

    const result = this.coinSelectSrv.selectUtxos(dto);

    console.log(result);
  }
}
async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule);
}
bootstrap();
