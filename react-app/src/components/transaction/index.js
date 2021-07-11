import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { request as covalentRequest } from '../../api/covalent';
import { Row, Col, Jumbotron, UncontrolledTooltip } from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Clipboard, ClipboardCheck, EmojiDizzy, CheckCircle, XCircle } from 'react-bootstrap-icons';
import _ from 'lodash';
import convert from 'ether-converter';
import moment from 'moment';
import numeral from 'numeral';
import { numberOptimizeDecimal, getChainExtraFields } from '../../utils';
import Loader from 'react-loader-spinner';

// transaction component
const Transaction = props => {
  // chains data from redux
  const chainsData = useSelector(content => content.data.chains_data);
  // chain from redux
  const chainSelected = useSelector(content => content.preferences.chain_selected) || (props.match && props.match.params && props.match.params.chain_name);
  // transaction hash query string parameter
  const txnHash = props.match && props.match.params && props.match.params.txn_hash;

  // data
  const [data, setData] = useState(null);
  // data loaded parameter
  const [loaded, setLoaded] = useState(false);

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

  // trasaction copied
  const [txCopied, setTxCopied] = useState(false);
  useEffect(() => {
    const t = txCopied ? setTimeout(() => setTxCopied(false), 1 * 1000) : null;
    return () => clearTimeout(t);
  }, [txCopied, setTxCopied]);

  // from address copied
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

  // request transaction: '/${chain_id}/transaction_v2/${tx_hash}/'
  useEffect(() => {
    const getData = async () => {
      if (chainData && chainData.chain_id && txnHash) {
        try {
          const response = await covalentRequest(`/${chainData.chain_id}/transaction_v2/${txnHash}/`, {});
          if (response) {
            setData(response.data && response.data.items ? response.data.items[0] : null);
          }
          setLoaded(true);
        } catch (error) {}
      }
    };
    getData();
    // interval request (30 sec)
    const interval = setInterval(() => getData(), 30 * 1000);
    return () => clearInterval(interval);
  }, [chainData, txnHash]);

  return (
    <div className="m-4" style={{ overflowWrap: 'anywhere' }}>
      {/* title */}
      <h2 style={{ textAlign: width <= 575 ? 'left' : 'center' }}>
        {"Transaction: "}
        <CopyToClipboard text={txnHash} className={`text-${txCopied ? 'success' : 'info'} d-inline-flex`} style={{ textAlign: 'left', fontWeight: 300, cursor: 'pointer' }}>
          <div onClick={useCallback(() => setTxCopied(true), [setTxCopied])}>
            <span id="tx">{txnHash.length > 17 ? `${txnHash.substring(0, 8)}...${txnHash.substring(txnHash.length - 9)}` : txnHash}</span>
            <UncontrolledTooltip target="tx" placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
              {txnHash}
            </UncontrolledTooltip>
            {txCopied ? <ClipboardCheck style={{ marginTop: '.125rem', marginLeft: '.75rem' }} /> : <Clipboard style={{ marginTop: '.125rem', marginLeft: '.75rem' }} />}
          </div>
        </CopyToClipboard>
      </h2>
      {!loaded ?
        // spinner
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
          <Loader type="ThreeDots" color="#0b5ed7" />
        </div>
        :
        !data ?
          // data not found message
          <div className="d-flex align-items-center justify-content-center" style={{ maxWidth: '40rem', minHeight: '40vh', margin: 'auto' }}>
            <Jumbotron>
              <h1 className="display-3 d-flex align-items-center justify-content-center"><EmojiDizzy style={{ marginRight: '1rem' }} />{"Not found!"}</h1>
              <p className="lead">{"Sorry, We are unable to locate this transaction."}</p>
            </Jumbotron>
          </div>
          :
          // trasaction infomation
          <Row style={{ maxWidth: '65rem', margin: `${width <= 575 ? 0 : '1.5rem'} auto` }}>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Status:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-3 mt-md-4">
              <div className={`text-${data.successful ? 'success' : 'danger'} d-flex align-items-center`} style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {data.successful ? <CheckCircle /> : <XCircle />}&nbsp;
                {data.successful ? 'Success' : 'Failed'}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Time:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {moment(data.block_signed_at).fromNow()}&nbsp;
                <span className="text-muted" style={{ fontWeight: 300 }}>({moment(data.block_signed_at).format('MMM D, YYYY LTS')})</span>
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Block:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {data.block_height}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"From:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {data.from_address ?
                  <>
                    <Link to={`/${chainSelected}/address/${data.from_address}`}>{data.from_address}</Link>
                    <CopyToClipboard text={data.from_address} className={`text-${fromAddressCopied ? 'success' : 'info'} d-inline-flex`} style={{ fontSize: '1rem', fontWeight: 400, cursor: 'pointer' }}>
                      <div onClick={() => setFromAddressCopied(true)}>
                        {fromAddressCopied ? <ClipboardCheck style={{ marginLeft: '.5rem' }} /> : <Clipboard style={{ marginLeft: '.5rem' }} />}
                      </div>
                    </CopyToClipboard>
                  </>
                  :
                  'N/A'
                }
              </div>
              {data.from_address_label && (<div className="text-info" style={{ fontSize: '.75rem', fontWeight: 300 }}>{data.from_address_label}</div>)}
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"To:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {data.to_address ?
                  <>
                    <Link to={`/${chainSelected}/address/${data.to_address}`}>{data.to_address}</Link>
                    <CopyToClipboard text={data.to_address} className={`text-${toAddressCopied ? 'success' : 'info'} d-inline-flex`} style={{ fontSize: '1rem', fontWeight: 400, cursor: 'pointer' }}>
                      <div onClick={() => setToAddressCopied(true)}>
                        {toAddressCopied ? <ClipboardCheck style={{ marginLeft: '.5rem' }} /> : <Clipboard style={{ marginLeft: '.5rem' }} />}
                      </div>
                    </CopyToClipboard>
                  </>
                  :
                  'N/A'
                }
              </div>
              {data.to_address_label && (<div className="text-info" style={{ fontSize: '.75rem', fontWeight: 300 }}>{data.to_address_label}</div>)}
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Value:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                <div style={{ fontWeight: 600, marginRight: '.25rem' }}>{convert(Number(data.value), 'wei', 'ether')}&nbsp;{getChainExtraFields(chainSelected).unit}</div>
                {typeof data.value_quote === 'number' && (<span className="text-info">{"($"}{numberOptimizeDecimal(numeral(data.value_quote).format(data.value_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))}{")"}</span>)}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Transaction Fee:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {typeof data.gas_quote === 'number' && typeof data.gas_quote_rate === 'number' ? <>{numberOptimizeDecimal(numeral(data.gas_quote / data.gas_quote_rate).format(data.gas_quote / data.gas_quote_rate > 1.01 ? '0,0.00' : '0,0.0000000000'))}&nbsp;{getChainExtraFields(chainSelected).unit}&nbsp;</> : 'N/A'}
                {typeof data.gas_quote === 'number' && (<span className="text-info">{"($"}{numberOptimizeDecimal(numeral(data.gas_quote).format(data.gas_quote > 1.01 ? '0,0.00' : '0,0.0000000000'))}{")"}</span>)}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Gas Limit:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {numeral(data.gas_offered).format('0,0')}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Gas Used by Transaction:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {numeral(data.gas_spent).format('0,0')}&nbsp;{"("}{numeral(data.gas_spent / data.gas_offered).format('0.00%')}{")"}
              </div>
            </Col>
            <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ textAlign: 'left', fontWeight: 600 }}>
              {"Gas Price:"}
            </Col>
            <Col xl="9" lg="8" md="8" xs="12" className="d-inline-flex align-items-center mt-2 mt-md-4">
              <div className="d-flex align-items-center" style={{ textAlign: 'left', fontSize: '1rem', fontWeight: 400 }}>
                {convert(data.gas_price, 'wei', 'gwei')}&nbsp;{getChainExtraFields(chainSelected).gas_unit || 'Gwei'}
              </div>
            </Col>
            {data.log_events && data.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length > 0 && (
              <>
                <Col xl="3" lg="4" md="4" xs="12" className="d-inline-flex align-items-center mt-4" style={{ height: 'fit-content', textAlign: 'left', fontWeight: 600 }}>
                  {"Tokens Transferred:"}
                  {data.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length > 1 && (
                    <div className="text-info" style={{ fontSize: '1rem', fontWeight: 400 }}>
                      &nbsp;{"("}{data.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer').length}{")"}
                    </div>
                  )}
                </Col>
                <Col xl="9" lg="8" md="8" xs="12" className="d-grid mt-2 mt-md-4">
                  {_.reverse(_.cloneDeep(data.log_events.filter(e => e.decoded && e.decoded.name && e.decoded.name.toLowerCase() === 'transfer'))).map((e, key) => {
                    const from = _.head(e.decoded.params.filter(p => p.name === 'from' && p.type === 'address'));
                    if (from && from.value) {
                      from.address_label = from.value === data.from_address && data.from_address_label ? data.from_address_label : from.value === data.to_address && data.to_address_label ? data.to_address_label : '';
                    }
                    const to = _.head(e.decoded.params.filter(p => p.name === 'to' && p.type === 'address'));
                    if (to && to.value) {
                      to.address_label = to.value === data.from_address && data.from_address_label ? data.from_address_label : to.value === data.to_address && data.to_address_label ? data.to_address_label : '';
                    }
                    const value = _.head(e.decoded.params.filter(p => p.name === 'value' && p.type === 'uint256'));
                    return (
                      <div key={key} className={`mt-${key > 0 ? '3 mt-md-2' : '0'}`} style={{ textAlign: 'left', fontSize: '.75rem', flexFlow: 'wrap' }}>
                        <div className="d-inline-flex align-items-center" style={{ marginRight: '.25rem' }}>
                          <span style={{ minWidth: 'fit-content', fontWeight: 600 }}>{"From"}</span>&nbsp;
                          <Link id={`from-${key}`} to={`/${chainSelected}/address/${from.value}`} className="text-truncate" style={{ maxWidth: '12.5rem' }}>{from.address_label || from.value}</Link>
                          <UncontrolledTooltip target={`from-${key}`} placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
                            {from.value}{from.address_label && (<><br /><span style={{ fontWeight: 600 }}>({from.address_label})</span></>)}
                          </UncontrolledTooltip>
                        </div>
                        <div className="d-inline-flex align-items-center" style={{ marginRight: '.25rem' }}>
                          <span style={{ minWidth: 'fit-content', fontWeight: 600 }}>{"To"}</span>&nbsp;
                          <Link id={`to-${key}`} to={`/${chainSelected}/address/${to.value}`} className="text-truncate" style={{ maxWidth: '12.5rem' }}>{to.address_label || to.value}</Link>
                          <UncontrolledTooltip target={`to-${key}`} placement="top" style={{ minWidth: 'fit-content', textAlign: 'center', fontSize: '.75rem', fontWeight: 300 }}>
                            {to.value}{to.address_label && (<><br /><span style={{ fontWeight: 600 }}>({to.address_label})</span></>)}
                          </UncontrolledTooltip>
                        </div>
                        <div className="d-inline-flex align-items-center">
                          <span style={{ minWidth: 'fit-content', fontWeight: 600 }}>{"For"}</span>&nbsp;
                          <span className="d-inline-flex align-items-center" style={{ minWidth: 'fit-content' }}>
                            {numberOptimizeDecimal(numeral(value.value * Math.pow(10, -1 * e.sender_contract_decimals)).format('0,0.0000000000'))}&nbsp;
                            {e.sender_logo_url && (<><img className="avatar-sm avatar-no-min-width" src={e.sender_logo_url} alt="" />&nbsp;</>)}
                            {e.sender_name}&nbsp;
                            {e.sender_contract_ticker_symbol && (<>&nbsp;<div className="text-info" style={{ fontWeight: 600 }}>{e.sender_contract_ticker_symbol}</div></>)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </Col>
              </>
            )}
          </Row>
      }
    </div>
  );
}

export default Transaction;
