const net = require('net');
const bitcoin = require('bitcoinjs-lib');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');
const BigNumber = require('bignumber.js');

const address = 'tb1qw2c3lxufxqe2x9s4rdzh65tpf4d7fssjgh8nv6';
// const address =
//   'tb1qum9uzctu5qlsycnah0zzyxuqz8auv26t86zdamtaezqvj8uf3v5qm7h8el';

function toScripthash(addr) {
  const script = bitcoin.address.toOutputScript(addr, bitcoin.networks.testnet),
    hash = bitcoin.crypto.sha256(script),
    reversedHash = Buffer.from(hash.reverse());
  return reversedHash.toString('hex');
}
const [host, port] = ['electrum.blockstream.info', 60001];

var data = '';

const client = new net.Socket();
client
  .on('data', function (chunk) {
    data += chunk.toString();

    try {
      const response = JSON.parse(data),
        address = response.id,
        amount = Number(response.result.confirmed) / 100000000;
          // response.result.reduce((rs, el) => rs + el.value, 0) / 100000000;
      client.destroy();
      console.log(`address:${address} amount:${amount} btc`);

      // const dataJson = JSON.parse(data);
      // const docPath = path.resolve(__dirname, '../../docs/');
      // if (!existsSync(docPath)) {
      //   mkdirSync(docPath, { recursive: true });
      // }
      // writeFileSync(
      //   path.resolve(docPath, 'data.json'),
      //   JSON.stringify(dataJson, null, 2),
      // );
      // console.log('write done');
    } catch (error) {}
  })
  .on('end', function () {
    console.timeEnd('alive');
  })
  .connect(Number(port), host, () => {
    console.time('alive');
    client.setKeepAlive(true, 120000);
    // const scripthash = toScripthash(address),
    //   body = JSON.stringify({
    //     jsonrpc: '2.0',
    //     method: 'blockchain.scripthash.get_balance',
    //     id: address,
    //     params: [scripthash],
    //   });
    // console.log('body: ', body);
    // client.write(body + '\n');
  });
