import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { request as covalentRequest } from '../../api/covalent';
import { Row, Col, Jumbotron, UncontrolledTooltip, Button, Nav, NavItem, Card, CardImg, CardBody, CardTitle, CardText } from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Clipboard, ClipboardCheck, EmojiDizzy, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'react-bootstrap-icons';
import _ from 'lodash';
import convert from 'ether-converter';
import moment from 'moment';
import numeral from 'numeral';
import { numberOptimizeDecimal, getChainExtraFields, fixNFTImageData } from '../../utils';
import BootstrapTable from 'react-bootstrap-table-next';
import Slider from 'react-slick';
import { Img } from 'react-image';
import { Player } from 'video-react';
import parse from 'html-react-parser';
import Linkify from 'react-linkify';
import Loader from 'react-loader-spinner';

// address component
const Address = props => {
  // chains data from redux
  const chainsData = useSelector(content => content.data.chains_data);
  // chain from redux
  const chainSelected = useSelector(content => content.preferences.chain_selected) || (props.match && props.match.params && props.match.params.chain_name);
  // address query string parameter
  const address = props.match && props.match.params && props.match.params.address;
  // asset type selected query string parameter
  const assetTypeSelected = props.match && props.match.params && props.match.params.type && props.match.params.type.toLowerCase() === 'nft' ? 'nft' : 'asset';

  // asset types
  const assetTypes = ['asset', 'nft'];

  // balances data
  const [balances, setBalances] = useState([]);
  // first page of balances loaded parameter
  const [balancesLoaded, setBalancesLoaded] = useState(false);
  // first time all page of balances loaded parameter
  const [balancesFullLoaded, setBalancesFullLoaded] = useState(false);
  // balances loading state
  const [balancesLoading, setBalancesLoading] = useState(false);
  // balances see more state
  const [balancesSeeMore, setBalancesSeeMore] = useState(false);

  // contract data
  const [contract, setContract] = useState(null);

  // transactions data
  const [transactions, setTransactions] = useState([]);
  // first page of transactions loaded parameter
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  // first time all page of transactions loaded parameter
  const [transactionsFullLoaded, setTransactionsFullLoaded] = useState(false);
  // transactions loading state
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  // transactions no more page parameter
  const [transactionsEnd, setTransactionsEnd] = useState(false);
  // transactions table page selected
  const [transactionsPage, setTransactionsPage] = useState(0);
  // transactions see more button disabled state
  const [transactionsSeeMoreButtonDisabled, setTransactionsSeeMoreButtonDisabled] = useState(false);
  // num transcation per page
  const transactionsPageSize = 10;

  // responsive width
  const useWindowSize = () => {
    const [size, setSize] = useState(null);
    useLayoutEffect(() => {
      const updateSize = () => setSize(window.screen.width);
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  };
  const width = useWindowSize();

  // address copied
  const [addressCopied, setAddressCopied] = useState(false);
  useEffect(() => {
    const t = addressCopied ? setTimeout(() => setAddressCopied(false), 1 * 1000) : null;
    return () => clearTimeout(t);
  }, [addressCopied, setAddressCopied]);

  // transaction copied
  const [txCopied, setTxCopied] = useState(false);
  useEffect(() => {
    const t = txCopied ? setTimeout(() => setTxCopied(false), 1 * 1000) : null;
    return () => clearTimeout(t);
  }, [txCopied, setTxCopied]);

  //from address copied
  const [fromAddressCopied, setFromAddressCopied] = useState(false);
  useEffect(() => {
    const t = fromAddressCopied ? setTimeout(() => setFromAddressCopied(false), 1 * 1000) : null;
    return () => clearTimeout(t);
  }, [fromAddressCopied, setFromAddressCopied]);

  // to address copied
  const [toAddressCopied, setToAddressCopied] = useState(false);
  useEffect(() => {
    const t = toAddressCopied ? setTimeout(() => setToAddressCopied(false), 1 * 1000) : null;
    return () => clearTimeout(t);
  }, [toAddressCopied, setToAddressCopied]);

  // chain data
  const chainData = chainSelected && chainsData && chainsData[chainsData.findIndex(chainData => chainData.name === chainSelected)];

  // request address's balances: '/{chain_id}/address/{address}/balances_v2/'
  useEffect(() => {
    const getData = async () => {
      if (chainData && chainData.chain_id && address) {
        const data = balances ? balances : [];
        // start pagination
        let size = 0;
        let page = 0;
        let hasMore = true;
        while (hasMore) {
          try {
            setBalancesLoading(true);
            const response = await covalentRequest(`/${chainData.chain_id}/address/${address}/balances_v2/`, { nft: true, 'page-number': page });
            if (response && response.data) {
              if (response.data.items) {
                for (let i = 0; i < response.data.items.length; i++) {
                  if (response.data.items[i].type === 'nft' && response.data.items[i].nft_data) {
                    for (let j = 0; j < response.data.items[i].nft_data.length; j++) {
                      response.data.items[i].nft_data[j] = await fixNFTImageData(response.data.items[i].nft_data[j]);
                    }
                  }
                  data[size++] = response.data.items[i];
                }
                setBalances(data);
                // set first page of data loaded
                setBalancesLoaded(true);
              }
              hasMore = response.data.pagination && response.data.pagination.has_more;
            }
            else {
              hasMore = false;
            }
            setBalancesLoading(false);
          } catch (error) {}
          page++;
        }
        // end pagination
        data.length = size;
        setBalances(data);
        // set first time all page of data loaded
        setBalancesFullLoaded(true);
      }
    };
    getData();
    // interval request (90 sec)
    const interval = setInterval(() => getData(), 90 * 1000);
    return () => clearInterval(interval);
  }, [chainData, address, balances]);

  // request contract: '/pricing/historical_by_addresses_v2/{chain_id}/{currency}/{address}/'
  useEffect(() => {
    const getData = async () => {
      if (chainData && chainData.chain_id && address) {
        try {
          const response = await covalentRequest(`/pricing/historical_by_addresses_v2/${chainData.chain_id}/usd/${address}/`, {});
          if (response) {
            setContract(response.data ? response.data[0] : null);
          }
        } catch (error) {}
      }
    };
    getData();
    // interval request (120 sec)
    const interval = setInterval(() => getData(), 120 * 1000);
    return () => clearInterval(interval);
  }, [chainData, address]);

  /********************
   * request transactions:
   * nft: /{chain_id}/tokens/{contract_address}/nft_transactions/{token_id}/
   * asset: /{chain_id}/address/{address}/transactions_v2/
   ********************/
  useEffect(() => {
    const getData = async () => {
      if (chainData && chainData.chain_id && address) {
        const data = transactions ? transactions : [];
        // start pagination
        let size = 0;
        let page = 0;
        let hasMore = true;
        // nft transactions
        if (assetTypeSelected === 'nft') {
          const nfts = balances && balances.filter(balance => balance.type === 'nft' && balance.nft_data).flatMap(balance => balance.nft_data.map(nft => { return { ...nft, contract_address: balance.contract_address }; }));
          if (nfts && nfts.length > 0) {
            let iNft = 0;
            while (iNft < nfts.length) {
              try {
                setTransactionsLoading(true);
                const response = await covalentRequest(`/${chainData.chain_id}/tokens/${nfts[iNft].contract_address}/nft_transactions/${nfts[iNft].token_id}/`, {});
                if (response && response.data) {
                  if (response.data.items) {
                    response.data.items = response.data.items.filter(item => item.nft_transactions).flatMap(item => item.nft_transactions);
                    for (let i = 0; i < response.data.items.length; i++) {
                      data[size++] = { ...response.data.items[i], type: assetTypeSelected };
                    }
                    setTransactions(data);
                    // set first page of data loaded
                    setTransactionsLoaded(true);
                    if (size >= (transactionsPage + 1) * transactionsPageSize) {
                      hasMore = false;
                    }
                  }
                }
                setTransactionsLoading(false);
              } catch (error) {}
              iNft++;
            }
            hasMore = !(iNft >= nfts.length) && hasMore;
          }
          else {
            setTransactionsLoaded(true);
            hasMore = false;
          }
        }
        // asset transactions
        else {
          while (hasMore && page <= transactionsPage) {
            try {
              setTransactionsLoading(true);
              const response = await covalentRequest(`/${chainData.chain_id}/address/${address}/transactions_v2/`, { 'page-number': page, 'page-size': transactionsPageSize });
              if (response && response.data) {
                if (response.data.items) {
                  for (let i = 0; i < response.data.items.length; i++) {
                    data[size++] = response.data.items[i];
                  }
                  setTransactions(data);
                  // set first page of data loaded
                  setTransactionsLoaded(true);
                }
                hasMore = response.data.pagination && response.data.pagination.has_more;
              }
              else {
                hasMore = false;
              }
              setTransactionsLoading(false);
            } catch (error) {}
            page++;
          }
        }
        // end pagination
        data.length = size;
        setTransactions(data);
        // set first time all page of data loaded
        setTransactionsFullLoaded(true);
        if (!hasMore) {
          // set transactions no more page
          setTransactionsEnd(true);
        }
        // set see more button enable
        setTransactionsSeeMoreButtonDisabled(false);
      }
    };
    // run after balances full loaded
    if (balancesFullLoaded) {
      getData();
    }
    // interval request (180 sec)
    const interval = setInterval(() => getData(), 180 * 1000);
    return () => clearInterval(interval);
  }, [chainData, address, transactions, transactionsPage, assetTypeSelected, balances, balancesFullLoaded]);

  // handle chain or address or asset type change
  useEffect(() => {
    balances.length = 0;
    setBalances(balances);
    setBalancesLoaded(false);
    setBalancesFullLoaded(false);
    setBalancesLoading(false);
    setBalancesSeeMore(false);
    transactions.length = 0;
    setTransactions(transactions);
    setTransactionsLoaded(false);
    setTransactionsFullLoaded(false);
    setTransactionsLoading(false);
    setTransactionsEnd(false);
    setTransactionsPage(0);
    setTransactionsSeeMoreButtonDisabled(false);
  }, [chainSelected, address, assetTypeSelected, balances, transactions]);

  // normalize and filter balances data
  let filteredBalances = balances && balances.map(balance => {
    return { ...balance, balance: Number(balance.balance) };
  }).filter(balance => assetTypeSelected === 'nft' ? balance.type === assetTypeSelected : balance.type !== 'nft');
  filteredBalances = filteredBalances && filteredBalances.filter((balance, i) => assetTypeSelected === 'nft' || balance.balance > 0 || (filteredBalances.findIndex(_balance => _balance.balance > 0) < 0 && i < 3));

  // normalize and filter transactions data
  const filteredTransactions = transactions && _.orderBy(transactions.map((transaction, i) => {
    return {
      ...transaction,
      index: i,
      value: typeof transaction.value === 'number' ? transaction.value : Number(transaction.value),
      transaction_fee: typeof transaction.gas_quote === 'number' && typeof transaction.gas_quote_rate === 'number' ? transaction.gas_quote / transaction.gas_quote_rate : null,
      from_address_label: transaction.transfers && transaction.transfers.findIndex(t => t.from_address_label) > -1 ? transaction.transfers[transaction.transfers.findIndex(t => t.from_address_label)].from_address_label : transaction.from_address_label,
      to_address_label: transaction.transfers && transaction.transfers.findIndex(t => t.to_address_label) > -1 ? transaction.transfers[transaction.transfers.findIndex(t => t.to_address_label)].to_address_label : transaction.to_address_label,
    };
  }).filter(transaction => assetTypeSelected === 'nft' ? transaction.type === 'nft' : transaction.type !== 'nft').map(transaction => {
    return {
      ...transaction,
      tx_hash_component: (
        <div className="d-inline-flex align-items-center">
          <Link id={`tx-${transaction.tx_hash}`} to={`/${chainSelected}/tx/${transaction.tx_hash}`}>
            {transaction.tx_hash.length > 16 ? `${transaction.tx_hash.substring(0, 9)}...${transaction.tx_hash.substring(transaction.tx_hash.length - 10)}` : transaction.tx_hash}
          </Link>
          <UncontrolledTooltip target={`tx-${transaction.tx_hash}`} placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
            {transaction.tx_hash}
          </UncontrolledTooltip>
          <CopyToClipboard text={transaction.tx_hash} className={`text-${txCopied === transaction.tx_hash ? 'success' : 'info'} d-inline-flex`} style={{ fontSize: '1rem', cursor: 'pointer' }}>
            <div onClick={() => setTxCopied(transaction.tx_hash)}>
              {txCopied === transaction.tx_hash ? <ClipboardCheck style={{ marginLeft: '.5rem' }} /> : <Clipboard style={{ marginLeft: '.5rem' }} />}
            </div>
          </CopyToClipboard>
        </div>
      ),
      from_address_component: !transaction.from_address ? 'N/A' : (
        <>
          <div className="d-inline-flex align-items-center">
            <Link id={`from-${transaction.tx_hash}`} to={`/${chainSelected}/address/${transaction.from_address}`}>
              {transaction.from_address.length > 13 ? `${transaction.from_address.substring(0, 6)}...${transaction.from_address.substring(transaction.from_address.length - 7)}` : transaction.from_address}
            </Link>
            <UncontrolledTooltip target={`from-${transaction.tx_hash}`} placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
              {transaction.from_address}
            </UncontrolledTooltip>
            <CopyToClipboard text={transaction.from_address} className={`text-${fromAddressCopied === `from-${transaction.tx_hash}` ? 'success' : 'info'} d-inline-flex`} style={{ fontSize: '1rem', cursor: 'pointer' }}>
              <div onClick={() => setFromAddressCopied(`from-${transaction.tx_hash}`)}>
                {fromAddressCopied === `from-${transaction.tx_hash}` ? <ClipboardCheck style={{ marginLeft: '.5rem' }} /> : <Clipboard style={{ marginLeft: '.5rem' }} />}
              </div>
            </CopyToClipboard>
          </div>
          {transaction.from_address_label && (<div className="text-info" style={{ fontSize: '.75rem', fontWeight: 300 }}>{transaction.from_address_label}</div>)}
        </>
      ),
      to_address_component: !transaction.to_address ? 'N/A' : (
        <>
          <div className="d-inline-flex align-items-center">
            <Link id={`to-${transaction.tx_hash}`} to={`/${chainSelected}/address/${transaction.to_address}`}>
              {transaction.to_address.length > 13 ? `${transaction.to_address.substring(0, 6)}...${transaction.to_address.substring(transaction.to_address.length - 7)}` : transaction.to_address}
            </Link>
            <UncontrolledTooltip target={`to-${transaction.tx_hash}`} placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
              {transaction.to_address}
            </UncontrolledTooltip>
            <CopyToClipboard text={transaction.to_address} className={`text-${toAddressCopied === `to-${transaction.tx_hash}` ? 'success' : 'info'} d-inline-flex`} style={{ fontSize: '1rem', cursor: 'pointer' }}>
              <div onClick={() => setToAddressCopied(`to-${transaction.tx_hash}`)}>
                {toAddressCopied === `to-${transaction.tx_hash}` ? <ClipboardCheck style={{ marginLeft: '.5rem' }} /> : <Clipboard style={{ marginLeft: '.5rem' }} />}
              </div>
            </CopyToClipboard>
          </div>
          {transaction.from_address_label && (<div className="text-info" style={{ fontSize: '.75rem', fontWeight: 300 }}>{transaction.from_address_label}</div>)}
        </>
      ),
    }
  }), ['block_signed_at'], ['desc']);

  // balances see more size threshold
  const balancesSeeMoreThreshold = width <= 575 ? 4 : width <= 991 ? 6 : 8;

  // nft slick settings
  const nftSlickSettings = {
    centerMode: true,
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    centerPadding: 0,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 10000,
  };

  return (
    <div className="m-4" style={{ overflowWrap: 'anywhere' }}>
      {/* title */}
      <h2 className="d-grid d-sm-flex align-items-center justify-content-start justify-content-sm-center mx-auto" style={{ maxWidth: '50rem', textAlign: width <= 575 ? 'left' : 'center' }}>
        {contract ? 'Contract' : 'Address'}{":"}&nbsp;
        <CopyToClipboard text={address} className={`text-${addressCopied ? 'success' : 'info'} d-inline-flex`} style={{ textAlign: 'left', fontWeight: 300, cursor: 'pointer' }}>
          <div onClick={useCallback(() => setAddressCopied(true), [setAddressCopied])}>
            <span id="address">{address.length > 13 ? `${address.substring(0, 6)}...${address.substring(address.length - 7)}` : address}</span>
            <UncontrolledTooltip target="address" placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
              {address}
            </UncontrolledTooltip>
            {addressCopied ? <ClipboardCheck style={{ marginTop: '.125rem', marginLeft: '.75rem' }} /> : <Clipboard style={{ marginTop: '.125rem', marginLeft: '.75rem' }} />}
          </div>
        </CopyToClipboard>
        {contract && (
          <div className="d-flex align-items-center mt-3 mt-sm-0" style={{ marginLeft: width <= 575 ? 0 : 'auto' }}>
            <img className="avatar avatar-no-min-width" src={contract.logo_url} alt="" />
            <div style={{ textAlign: 'left', marginLeft: '.5rem' }}>
              <div className="d-flex align-items-center" style={{ fontSize: '1rem', fontWeight: 700 }}>
                {contract.contract_name}&nbsp;
                {contract.prices.findIndex(price => typeof price.price === 'number') > -1 && [contract.prices[contract.prices.findIndex(price => typeof price.price === 'number')]].map((price, key) => (
                  <div key={key} className="text-primary" style={{ fontSize: '1rem', fontWeight: 400 }}>
                    {"$"}{numberOptimizeDecimal(numeral(price.price).format(price.price > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                  </div>
                ))}
              </div>
              {contract.contract_ticker_symbol && (<div className="text-info mt-1" style={{ fontSize: '.75rem', fontWeight: 600, marginLeft: '.0625rem' }}>{contract.contract_ticker_symbol}</div>)}
            </div>
          </div>
        )}
      </h2>
      {!balancesLoaded ?
        // spinner
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
          <Loader type="Grid" color="#0b5ed7" width="2rem" height="2rem" />
        </div>
        :
        !balances ?
          // data not found message
          <div className="d-flex align-items-center justify-content-center" style={{ maxWidth: '40rem', minHeight: '40vh', margin: 'auto' }}>
            <Jumbotron>
              <h1 className="display-3 d-flex align-items-center justify-content-center"><EmojiDizzy style={{ marginRight: '1rem' }} />{"Not found!"}</h1>
              <p className="lead">{"Sorry, We are unable to locate this address."}</p>
            </Jumbotron>
          </div>
          :
          <div className="mt-4 mt-lg-5 mx-0 mx-lg-4">
            <Row className="mb-3">
              {/* asset type select */}
              <Col lg="6" md="6" xs="6" className="d-flex align-items-center">
                <Nav pills>
                  {assetTypes.map((assetType, key) => (
                    <NavItem key={key}>
                      <Link to={`/${chainSelected}/address/${address}${assetType === 'nft' ? `/${assetType}` : ''}`} className={`nav-link${assetTypeSelected === assetType ? ' active' : ''}`}>{assetType.toUpperCase()}</Link>
                    </NavItem>
                  ))}
                </Nav>
              </Col>
              {/* balances value */}
              <Col lg="6" md="6" xs="6" style={{ textAlign: 'right' }}>
                <div className="text-info d-flex align-items-center justify-content-end" style={{ minWidth: 'fit-content', fontWeight: 600 }}>
                  {assetTypeSelected === 'nft' ? 'Amount' : 'Balance'}
                  {!balancesFullLoaded && balancesLoading && (
                    <Loader type="Oval" color="#0b5ed7" width="1rem" height="1rem" style={{ marginTop: '-.125rem', marginLeft: '.25rem' }} />
                  )}
                </div>
                <div className="text-primary">
                  {assetTypeSelected === 'nft' ?
                    <>
                      {filteredBalances ? numeral(filteredBalances.length).format('0,0') : '-'}&nbsp;
                      {"NFT"}{filteredBalances && filteredBalances.length > 1 ? 's' : ''}
                    </>
                    :
                    <>
                      {"$"}
                      {numberOptimizeDecimal(numeral(_.sumBy(filteredBalances, 'quote')).format(_.sumBy(filteredBalances, 'quote') > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                    </>
                  }
                </div>
              </Col>
            </Row>
            {filteredBalances.length < 1 ?
              // data not found message
              <div className="d-flex align-items-center justify-content-center" style={{ maxWidth: '40rem', minHeight: '40vh', margin: 'auto' }}>
                <Jumbotron>
                  <h1 className="display-3 d-flex align-items-center justify-content-center"><EmojiDizzy style={{ marginRight: '1rem' }} />{"Not found!"}</h1>
                  <p className="lead">{"There is no "}{assetTypeSelected === 'nft' ? 'NFTs' : 'balances'}{" in this address."}</p>
                </Jumbotron>
              </div>
              :
              <Row>
                {filteredBalances.filter((balance, i) => balancesSeeMore || i < balancesSeeMoreThreshold).map((balance, key) => (
                  <Col key={key} xl="3" lg="4" sm="6" xs="12" className="mb-3 mb-sm-4">
                    {assetTypeSelected === 'nft' ?
                      // nft information
                      <Card className="h-100">
                        <CardTitle tag="h5" className="mb-0 p-3" style={{ fontWeight: 600, textAlign: 'left' }}>
                          <Link to={`/${chainSelected}/address/${balance.contract_address}${assetTypeSelected === 'nft' ? `/${assetTypeSelected}` : ''}`} className="d-flex align-items-center" style={{ wordBreak: 'break-word' }}>
                            <CardImg top src={balance.logo_url} alt="" className="avatar avatar-no-min-width" style={{ marginRight: balance.logo_url ? '.125rem' : null }} />
                            <span style={{ fontSize: '1rem', marginRight: '.5rem' }}>{balance.contract_name}</span>
                            <span className="text-muted ml-auto" style={{ minWidth: '2rem', textAlign: 'right', fontSize: '.65rem', fontWeight: 500, marginLeft: 'auto' }}>
                              {balance.contract_ticker_symbol}
                            </span>
                          </Link>
                        </CardTitle>
                        {balance.nft_data && balance.nft_data.length > 0 && (
                          <CardBody className="p-0 pb-3">
                            <Slider {...nftSlickSettings}>
                              {balance.nft_data.map((nft, key) => (
                                <div key={key} className="carousel-item">
                                  {nft.external_data && nft.external_data.animation_url ?
                                    <Player
                                      playsInline
                                      poster={nft.external_data.image}
                                      src={nft.external_data.animation_url}
                                      className="w-100 h-100 mx-auto"
                                      style={{ minHeight: width > 575 ? '10rem' : '', maxHeight: '30rem' }}
                                    />
                                    :
                                    <a href={nft.external_data ? nft.external_data.image ? nft.external_data.image : nft.external_data.external_url ? nft.external_data.external_url : nft.token_url : nft.token_url} target="_blank" rel="noopener noreferrer" className="d-block" style={{ minHeight: width > 575 ? '10rem' : null }}>
                                      <Img src={nft.external_data ? nft.external_data.image : null} alt="" className="w-100 h-100 mx-auto" style={{ maxHeight: '30rem' }} />
                                    </a>
                                  }
                                  <div className="pt-3 px-3">
                                    <CardText className="text-primary mb-2" style={{ fontSize: '.85rem', fontWeight: 500, textAlign: 'left' }}>
                                      <a href={nft.token_url} target="_blank" rel="noopener noreferrer">
                                        {nft.external_data && nft.external_data.name ?
                                          <span title={nft.external_data.name} style={{ display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>{nft.external_data.name}</span>
                                          :
                                          '-'
                                        }
                                      </a>
                                    </CardText>
                                    <CardText className="text-muted mb-2" style={{ fontSize: '.75rem', fontWeight: 300, textAlign: 'left' }}>
                                      {nft.external_data && nft.external_data.description && (
                                        <span title={nft.external_data.description} style={{ display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', whiteSpace: 'pre-wrap', overflow: 'hidden' }}><Linkify>{parse(nft.external_data.description)}</Linkify></span>
                                      )}
                                    </CardText>
                                    <CardText className="mb-2" style={{ fontSize: '.85rem', fontWeight: 600, textAlign: 'left' }}>
                                      {"Token ID: "}
                                      {nft.token_id ?
                                        <>{"#"}{nft.token_id}</>
                                        :
                                        '-'
                                      }
                                    </CardText>
                                  </div>
                                </div>
                              ))}
                            </Slider>
                          </CardBody>
                        )}
                      </Card>
                      :
                      // asset infomation
                      <Card className="p-3">
                        <CardTitle tag="h5" className="mb-0" style={{ fontWeight: 600, textAlign: 'left' }}>
                          <Link to={`/${chainSelected}/address/${balance.contract_address}${assetTypeSelected === 'nft' ? `/${assetTypeSelected}` : ''}`} className="d-flex align-items-center" style={{ wordBreak: 'break-word' }}>
                            <CardImg top src={balance.logo_url} alt="" className="avatar avatar-no-min-width" style={{ marginRight: balance.logo_url ? '.5rem' : null }} />
                            <span style={{ fontSize: '1rem', marginRight: '.5rem' }}>{balance.contract_name}</span>
                            <span className="text-muted ml-auto" style={{ minWidth: '2rem', textAlign: 'right', fontSize: '.65rem', fontWeight: 500, marginLeft: 'auto' }}>
                              {balance.contract_ticker_symbol}
                            </span>
                          </Link>
                        </CardTitle>
                        <CardBody className="p-0 pt-3">
                          <CardText className="text-primary mb-2" style={{ fontSize: '.85rem', fontWeight: 400, textAlign: 'left' }}>
                            {"Price: "}
                            {typeof balance.quote_rate === 'number' ?
                              <>{"$"}{numberOptimizeDecimal(numeral(balance.quote_rate).format(balance.quote_rate > 1.01 ? '0,0.00' : '0,0.0000000000'))}</>
                              :
                              '-'
                            }
                          </CardText>
                          <CardText className="d-flex align-items-top mb-2" style={{ fontSize: '.85rem', fontWeight: 600, textAlign: 'left' }}>
                            <span style={{ marginRight: '.25rem' }}>{"Balance:"}</span>
                            <span className="d-grid">
                              {numberOptimizeDecimal(numeral(balance.balance * Math.pow(10, -1 * balance.contract_decimals)).format(balance.balance * Math.pow(10, -1 * balance.contract_decimals) > 1.01 ? '0,0.00' : '0,0.0000000000'))}
                              {typeof balance.quote === 'number' && (<span className="text-info" style={{ fontSize: '.85rem' }}>{typeof balance.quote_rate === 'number' ? <>{"($"}{numberOptimizeDecimal(numeral(balance.quote).format(balance.quote > 1.01 ? '0,0.00' : '0,0.0000000000'))}{")"}</> : '-'}</span>)}
                            </span>
                          </CardText>
                        </CardBody>
                      </Card>
                    }
                  </Col>
                ))}
              </Row>
            }
            {/* balances see more button */}
            {filteredBalances && filteredBalances.length > balancesSeeMoreThreshold && (
              <Button onClick={() => setBalancesSeeMore(!balancesSeeMore)}>
                {"See"}&nbsp;{balancesSeeMore ? 'less' : 'more'}&nbsp;
                {balancesSeeMore ? <ChevronUp /> : <ChevronDown />}
              </Button>
            )}
          </div>
      }
      <div className="mt-4 mt-lg-5 mx-0 mx-lg-4">
        {/* transactions title */}
        <Row className="mb-3">
          <Col lg="6" md="6" xs="12" className="d-flex align-items-center">
            <h3 className="d-flex align-items-center mb-0" style={{ fontWeight: 600 }}>
              {"Transactions"}
              {!transactionsFullLoaded && transactionsLoading && (
                <Loader type="Oval" color="#0b5ed7" width="1.5rem" height="1.5rem" style={{ marginTop: '-.125rem', marginLeft: '.5rem' }} />
              )}
            </h3>
          </Col>
        </Row>
        {/* transactions table */}
        <BootstrapTable
          keyField="index"
          bordered={false}
          noDataIndication={transactionsLoaded && transactions ? 'No Data' : <span className="d-flex align-items-center justify-content-center">{"Loading"}<Loader type="ThreeDots" color="#0b5ed7" width="14" height="14" className="mt-1" style={{ marginLeft: '.25rem' }} /></span>}
          classes="table-responsive pb-0"
          data={!transactions ? [] : filteredTransactions}
          columns={[
            {
              dataField: 'tx_hash_component',
              text: 'Txn Hash',
              headerStyle: {
                minWidth: '14rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
            }, {
              dataField: 'successful',
              text: 'Status',
              headerStyle: {
                minWidth: '6rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
              formatter: cell => (
                <div className={`text-${cell ? 'success' : 'danger'} d-flex align-items-center`}>
                  {cell ? <CheckCircle /> : <XCircle />}&nbsp;
                  {cell ? 'Success' : 'Failed'}
                </div>
              ),
            }, {
              dataField: 'block_signed_at',
              text: 'Time',
              headerStyle: {
                minWidth: '12rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
              formatter: cell => (
                <div className="d-grid">
                  {moment(cell).fromNow()}&nbsp;
                  <span className="text-muted" style={{ fontSize: '.75rem', fontWeight: 300 }}>({moment(cell).format('MMM D, YYYY LTS')})</span>
                </div>
              ),
            }, {
              dataField: 'block_height',
              text: 'Block',
              headerStyle: {
                minWidth: '6rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
            }, {
              dataField: 'from_address_component',
              text: 'From',
              headerStyle: {
                minWidth: '12rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
            }, {
              dataField: 'to_address_component',
              text: 'To',
              headerStyle: {
                minWidth: '12rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'left',
              align: 'left',
            }, {
              dataField: 'value',
              text: 'Value',
              headerStyle: {
                minWidth: '10rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'right',
              align: 'right',
              formatter: (cell, row) => (
                <div className="d-grid">
                  <div style={{ fontWeight: 600 }}>{numberOptimizeDecimal(numeral(convert(Number(cell), 'wei', 'ether')).format('0,0.0000000000'))}&nbsp;{getChainExtraFields(chainSelected).unit}</div>
                  {typeof row.value_quote === 'number' && (<span className="text-info">{"($"}{numberOptimizeDecimal(numeral(row.value_quote).format(row.value_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))}{")"}</span>)}
                </div>
              ),
            }, {
              dataField: 'transaction_fee',
              text: 'Transaction Fee',
              headerStyle: {
                minWidth: '12rem',
              },
              style: {
                fontSize: '.85rem',
              },
              headerAlign: 'right',
              align: 'right',
              formatter: (cell, row) => (
                <div className="d-grid">
                  {typeof cell === 'number' ? <>{numberOptimizeDecimal(numeral(cell).format(cell > 1.01 ? '0,0.00' : '0,0.0000000000'))}&nbsp;{getChainExtraFields(chainSelected).unit}</> : 'N/A'}
                  {typeof row.gas_quote === 'number' && (<div className="text-info">{"($"}{numberOptimizeDecimal(numeral(row.gas_quote).format(row.gas_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))}{")"}</div>)}
                  <div className="text-info" style={{ fontSize: '.75rem' }}>
                    {"Gas Price:"}&nbsp;{convert(row.gas_price, 'wei', 'gwei')}&nbsp;{getChainExtraFields(chainSelected).gas_unit || 'Gwei'}
                  </div>
                </div>
              ),
            },
          ]}
        />
        {/* transactions table see more button */}
        {!transactionsEnd && transactions && transactions.length >= transactionsPageSize && (
          <Button
            disabled={transactionsSeeMoreButtonDisabled}
            onClick={() => { setTransactionsSeeMoreButtonDisabled(true); setTransactionsPage(transactionsPage + 1); }}
          >
            {transactionsSeeMoreButtonDisabled && transactionsLoading ?
              <span className="d-flex align-items-center justify-content-center">{"Loading"}<Loader type="ThreeDots" color="white" width="14" height="14" className="mt-1" style={{ marginLeft: '.25rem' }} /></span>
              :
              'See more'
            }
          </Button>
        )}
      </div>
    </div>
  );
}

export default Address;
