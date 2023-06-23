import { Body, Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CoinselectService } from './coinselect.service';
import { SelectUtxosDto, SelectUtxosResponse } from './coinselect.dto';

@ApiTags('coinselect')
@Controller('coinselect')
export class CoinselectController {
  constructor(private readonly srv: CoinselectService) {}

  @Get('/select-utxos')
  @ApiOkResponse({ type: SelectUtxosResponse })
  public selectUtxos(@Body() dto: SelectUtxosDto) {
    return this.selectUtxos(dto);
  }
}
