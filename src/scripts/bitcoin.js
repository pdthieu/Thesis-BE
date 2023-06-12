const ElectrumClient = require('./electrum/electrum-client');
const bitcoin = require('bitcoinjs-lib');

const address = 'tb1qw2c3lxufxqe2x9s4rdzh65tpf4d7fssjgh8nv6';
const address2 =
  'tb1qum9uzctu5qlsycnah0zzyxuqz8auv26t86zdamtaezqvj8uf3v5qm7h8el';

function toScripthash(addr) {
  const script = bitcoin.address.toOutputScript(addr, bitcoin.networks.testnet),
    hash = bitcoin.crypto.sha256(script),
    reversedHash = Buffer.from(hash.reverse());
  return reversedHash.toString('hex');
}

const sleep = (ms) =>
  new Promise((resolve, _) => setTimeout(() => resolve(), ms));

const main = async () => {
  const socket = new ElectrumClient(60001, 'electrum.blockstream.info');
  await socket.connect();

  myInterval = async () => {
    console.log('hehe');
    await socket.server_version("3.0.5", "1.1");
  }
  setInterval(myInterval, 3000);
  console.time('connected');
  try {
    while (true) {
      const balance = await socket.blockchainScripthash_getBalance(
        toScripthash(address),
      );
      console.log(`${new Date()} :`, balance);
      await sleep(50000);
      const unspent = await socket.blockchainScripthash_listunspent(
        toScripthash(address),
      );
      console.log(`${new Date()} :`, unspent[0]);
      await sleep(63000);
      const balance2 = await socket.blockchainScripthash_getBalance(
        toScripthash(address2),
      );
      console.log(`${new Date()} :`, balance2);
    }
  } catch (error) {
    console.log(error);
  }
};

main().catch(console.log);
