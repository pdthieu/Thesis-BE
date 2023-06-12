const Client = require('./client');
class ElectrumClient extends Client {
  constructor(port, host, protocol, options) {
    super(port, host, protocol, options);
  }
  onClose() {
    console.timeEnd('connected')
    super.onClose();
    const list = [
      'server.peers.subscribe',
      'blockchain.numblocks.subscribe',
      'blockchain.headers.subscribe',
      'blockchain.address.subscribe',
    ];
    list.forEach((event) => this.subscribe.removeAllListeners(event));
  }
  server_version(client_name, protocol_version) {
    return this.request('server.version', [client_name, protocol_version]);
  }
  server_banner() {
    return this.request('server.banner', []);
  }
  server_ping() {
    return this.request('server.ping', []);
  }
  server_addPeer(features) {
    return this.request('server.add_peer', [features]);
  }
  serverDonation_address() {
    return this.request('server.donation_address', []);
  }
  serverPeers_subscribe() {
    return this.request('server.peers.subscribe', []);
  }
  blockchainScripthash_getBalance(scripthash) {
    return this.request('blockchain.scripthash.get_balance', [scripthash]);
  }
  blockchainScripthash_getHistory(scripthash) {
    return this.request('blockchain.scripthash.get_history', [scripthash]);
  }
  blockchainScripthash_getMempool(scripthash) {
    return this.request('blockchain.scripthash.get_mempool', [scripthash]);
  }
  blockchainScripthash_listunspent(scripthash) {
    return this.request('blockchain.scripthash.listunspent', [scripthash]);
  }
  blockchainScripthash_subscribe(scripthash) {
    return this.request('blockchain.scripthash.subscribe', [scripthash]);
  }
  blockchainBlock_headers(start_height, count) {
    return this.request('blockchain.block.headeres', [start_height, count]);
  }
  blockchainEstimatefee(number) {
    return this.request('blockchain.estimatefee', [number]);
  }
  blockchainHeaders_subscribe(raw) {
    return this.request('blockchain.headers.subscribe', [raw ? raw : false]);
  }
  blockchain_relayfee() {
    return this.request('blockchain.relayfee', []);
  }
  blockchainTransaction_broadcast(rawtx) {
    return this.request('blockchain.transaction.broadcast', [rawtx]);
  }
  blockchainTransaction_get(tx_hash, verbose) {
    return this.request('blockchain.transaction.get', [
      tx_hash,
      verbose ? verbose : false,
    ]);
  }
  blockchainTransaction_getMerkle(tx_hash, height) {
    return this.request('blockchain.transaction.get_merkle', [tx_hash, height]);
  }
  mempool_getFeeHistogram() {
    return this.request('mempool.get_fee_histogram', []);
  }
}

module.exports = ElectrumClient;
