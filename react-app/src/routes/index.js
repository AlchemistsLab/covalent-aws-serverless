import Chains from '../components/chains';
import Chain from '../components/chain';
import Address from '../components/address';
import Transaction from '../components/transaction';

export const routes = [
  { path: '/', Component: Chains, exact: true },
  { path: '/:chain_name', Component: Chain, exact: true },
  { path: '/:chain_name/address/:address', Component: Address, exact: true },
  { path: '/:chain_name/tx/:txn_hash', Component: Transaction, exact: true },
  { Component: Chains }
];
