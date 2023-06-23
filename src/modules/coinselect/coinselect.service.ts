import systemConfig from '@core/config/system';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bitcoin from 'bitcoinjs-lib';
import { SelectUtxosDto, InputData, OutputData } from './coinselect.dto';

@Injectable()
export class CoinselectService {
  BYTES_BASE = 4 + 1 + 1 + 4 + 2 / 4; // nVersion, inputCount, outputCount, nLockTime, Segwit marker and flag
  MAX_TRIES = 100000;

  public selectUtxos(dto: SelectUtxosDto) {
    const result = this.branchAndBound(dto);
    if (result !== null) return result;
    return this.accumulativeWitness(dto);
  }

  public coinSelectMax(
    utxos: InputData[],
    output: OutputData,
    feeRate: number,
  ) {
    let outputsAccum = 0;
    const outputBytes = this.outputBytesWitness(output, 0);
    const byteBased = this.BYTES_BASE + outputBytes;
    let bytesAccum = byteBased;
    const inputs = [];

    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      const effectiveValue = this.utxoScore(utxo, feeRate);
      if (effectiveValue <= 0) continue;
      bytesAccum = bytesAccum + this.inputBytesWitness(utxo, inputs.length);
      inputs.push(utxo);
      outputsAccum = outputsAccum + effectiveValue;
    }

    const outputValue = Math.floor(outputsAccum - byteBased * feeRate);

    return outputValue <= 0 ? 0 : outputValue;
  }

  private branchAndBound(dto: SelectUtxosDto) {
    const { utxos, outputs, feeRate, changeAddress } = dto;
    const effectiveUtxos = utxos
      .map((utxo) => ({
        utxo: utxo,
        effectiveValue: this.utxoScore(utxo, feeRate),
      }))
      .filter((utxo) => utxo.effectiveValue > 0)
      .sort((utxo1, utxo2) => utxo2.effectiveValue - utxo1.effectiveValue);
    if (effectiveUtxos.length === 0) {
      throw new NotFoundException('Not found the right utxos');
    }

    const outputsAccum = outputs.reduce((sum, output) => sum + output.value, 0);
    const outputBytes = outputs.reduce(
      (sum, output, index) => sum + this.outputBytesWitness(output, index),
      0,
    );
    let bytesAccum = this.BYTES_BASE + outputBytes;
    const selected = this.search(
      effectiveUtxos,
      outputsAccum + bytesAccum * feeRate,
      feeRate,
      changeAddress,
    );
    if (selected != null) {
      const inputs = [];
      let currentInputAmount = 0;
      effectiveUtxos.forEach((el, index) => {
        if (selected[index]) {
          inputs.push(el.utxo);
          bytesAccum += this.inputBytesWitness(el.utxo, currentInputAmount++);
        }
      });
      return this.finalize(inputs, outputs, feeRate, bytesAccum, changeAddress);
    }
    return null;
  }

  private search(
    effectiveUtxos: { utxo: InputData; effectiveValue: number }[],
    target: number,
    feeRate: number,
    changeAddress: string,
  ) {
    let tries = this.MAX_TRIES;

    const changeCost = this.costOfChange(
      changeAddress,
      feeRate,
      effectiveUtxos[0].utxo,
    );

    const selected = []; // Array of T/F if true this utxo is selected
    let selectedAccum = 0; // sum of selected utxos
    const traversingExclusion = []; // Array of T/F if true traversing omitting branch at this index

    let done = false;
    let backtrack = false;

    let remaining = effectiveUtxos.reduce(function (sum, utxo) {
      return sum + utxo.effectiveValue;
    }, 0);
    let depth = 0;

    while (!done) {
      if (tries <= 0) {
        // Too many tries, exit
        return;
      } else if (selectedAccum > target + changeCost) {
        // Selected value is out of range, go back and try other branch

        backtrack = true;
      } else if (selectedAccum >= target) {
        // Selected value is within range
        done = true;
      } else if (depth >= effectiveUtxos.length) {
        // Leaf node
        backtrack = true;
      } else if (selectedAccum + remaining < target) {
        // Cannot possibly reach target with amount remaining
        if (depth === 0) {
          // At the first utxo it means insufficient funds
          return;
        } else {
          backtrack = true;
        }
      } else {
        // Continue down this branch
        // Remove this utxo from the remaining utxo amount
        remaining -= effectiveUtxos[depth].effectiveValue;
        // Inclusion branch first
        selected[depth] = true;
        selectedAccum += effectiveUtxos[depth].effectiveValue;
        depth++;
      }

      // Step back to the previous utxo and try the other branch
      if (backtrack) {
        backtrack = false;
        depth--;
        // Walk backwards to find the first utxo which has not has its second branch traversed
        while (traversingExclusion[depth]) {
          // Reset this utxo's selection
          if (selected[depth]) {
            selectedAccum -= effectiveUtxos[depth].effectiveValue;
          }
          selected[depth] = false;
          traversingExclusion[depth] = false;
          remaining += effectiveUtxos[depth].effectiveValue;

          // Step back one
          depth--;

          if (depth < 0) {
            // We have walked back to the first utxo and no branch is untraversed. No solution, exit.
            return;
          }
        }

        if (!done) {
          // Now traverse the second branch of the utxo we have arrived at.
          traversingExclusion[depth] = true;

          // These were always included first, try excluding now
          selected[depth] = false;
          selectedAccum -= effectiveUtxos[depth].effectiveValue;
          depth++;
        }
      }
      tries--;
    }

    return selected;
  }

  private finalize(
    inputs: InputData[],
    outputs: OutputData[],
    feeRate: number,
    bytesAccum: number,
    changeAddress: string,
  ) {
    const changeOutput = {
      address: changeAddress,
    };
    const changeOutputBytes = this.outputBytesWitness(
      changeOutput,
      outputs.length,
    );
    const feeAfterAddChangeOutput = feeRate * (bytesAccum + changeOutputBytes);
    let remainAfterAddChangeOutput =
      inputs.reduce((sum, utxo) => sum + utxo.witnessUtxo.value, 0) -
      feeAfterAddChangeOutput -
      outputs.reduce((sum, output) => sum + output.value, 0);
    remainAfterAddChangeOutput = Math.floor(remainAfterAddChangeOutput);
    if (
      remainAfterAddChangeOutput >
      this.inputBytesWitness(inputs[0], inputs.length) * feeRate // if this amount can be used in future with same fee
    ) {
      // assume change address is same type with utxo
      // changeOutput.value = remainAfterAddChangeOutput;
      outputs = outputs.concat({
        ...changeOutput,
        value: remainAfterAddChangeOutput,
      });
      bytesAccum += changeOutputBytes;
    }
    const txSize = bytesAccum;
    const fee =
      inputs.reduce((sum, utxo) => sum + utxo.witnessUtxo.value, 0) -
      outputs.reduce((sum, output) => sum + output.value, 0);
    return {
      inputs,
      outputs,
      txSize,
      fee,
      feeRate: +(fee / txSize).toFixed(2),
    };
  }

  private accumulativeWitness = (dto: SelectUtxosDto) => {
    const { outputs, feeRate, changeAddress } = dto;
    let utxos = dto.utxos;
    utxos = utxos
      .concat()
      .sort(
        (utxo1, utxo2) => utxo2.witnessUtxo.value - utxo1.witnessUtxo.value,
      );
    let inputsAccum = 0;
    const outputsAccum = outputs.reduce((sum, output) => sum + output.value, 0);
    let bytesAccum = this.BYTES_BASE;
    const outputBytes = outputs.reduce(
      (sum, output, index) => sum + this.outputBytesWitness(output, index),
      0,
    );
    bytesAccum += outputBytes;
    const inputs = [];
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      const inputBytes = this.inputBytesWitness(utxo, inputs.length);
      const utxoValue = utxo.witnessUtxo.value;
      const utxoFee = inputBytes * feeRate;
      if (utxoFee > utxoValue) continue;

      bytesAccum += inputBytes;
      inputsAccum += utxoValue;
      inputs.push(utxo);

      const fee = feeRate * bytesAccum;
      if (inputsAccum < fee + outputsAccum) continue;
      return this.finalize(inputs, outputs, feeRate, bytesAccum, changeAddress);
    }

    throw new NotFoundException('Not found the right utxos')
  };

  private utxoScore(utxo: InputData, feeRate: number) {
    const inputBytes = this.inputBytesWitness(utxo, 0);
    const utxoValue = utxo.witnessUtxo.value;
    const utxoFee = inputBytes * feeRate;
    return utxoValue - utxoFee;
  }

  private inputBytesWitness(input: InputData, currentInputAmount: number) {
    const inputCountAffect =
      this.inputOutputCountAddedBytes(currentInputAmount);
    const network = this.getNetwork();
    const witnessBytes = input.witnessScript // p2wsh - multisig require n cosigner
      ? 1 + // OP_0
        73 * bitcoin.payments.p2ms({ output: input.witnessScript, network }).m + // m cosigner signature
        this.calSizeVarInt(input.witnessScript.length) + // redeem script length
        input.witnessScript.length // redeem script
      : input.finalScriptWitness // in case psbt is fully signed
      ? input.finalScriptWitness.length
      : 73 + 34; // p2wpkh (signature + pubkey)
    const totalBytesAdded =
      inputCountAffect +
      32 + // txid
      4 + // index
      1 + // scriptsig length (always 1 for segwit (00))
      4 + // nSequence
      1 / 4 + // witness item count (1 is more than enough)
      witnessBytes / 4 +
      this.calSizeVarInt(witnessBytes);
    return totalBytesAdded;
  }

  private outputBytesWitness(
    output: { address: string },
    currentOutputAmount: number,
  ) {
    const outputCountAffect =
      this.inputOutputCountAddedBytes(currentOutputAmount);
    const scriptPubKey = bitcoin.address.toOutputScript(
      output.address,
      this.getNetwork(),
    );
    const outputByte =
      outputCountAffect +
      8 +
      this.calSizeVarInt(scriptPubKey.length) +
      scriptPubKey.length;
    return outputByte;
  }

  private costOfChange(
    changeAddress: string,
    feeRate: number,
    utxoInput: InputData,
  ) {
    return (
      (this.inputBytesWitness(utxoInput, 0) +
        this.outputBytesWitness({ address: changeAddress }, 0)) *
      feeRate
    );
  }

  private inputOutputCountAddedBytes(currentInputAmount: number) {
    // when input reach specific limit, we need more bytes for inputCount
    switch (currentInputAmount) {
      case 252:
      case 65535:
        return 2;
      case 4294967295:
        return 4;
      default:
        return 0;
    }
  }

  private calSizeVarInt(size: number) {
    if (size <= 252) return 1;
    if (size <= 65535) return 3;
    if (size <= 4294967295) return 5;
    return 9;
  }

  private getNetwork() {
    return systemConfig.isTestnetNetwork
      ? bitcoin.networks.testnet
      : bitcoin.networks.bitcoin;
  }
}
