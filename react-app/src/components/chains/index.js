import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { request as covalentRequest } from '../../api/covalent';
import { Row, Col, Card, CardImg, CardBody, CardTitle, CardText } from 'reactstrap';
import Moment from 'react-moment';
import Loader from 'react-loader-spinner';

// chains component
const Chains = props => {
  // chains data
  const [chainsData, setChainsData] = useState([]);
  // chains loaded parameter
  const [loaded, setLoaded] = useState(false);

  // request chains' status: '/chains/status/'
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await covalentRequest('/chains/status/', {});
        if (response) {
          setChainsData(response.data ? response.data.items : []);
        }
        setLoaded(true);
      } catch (error) {}
    };
    getData();
    // interval request (10 sec)
    const interval = setInterval(() => getData(), 10 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-4">
      {/* title */}
      <h2>{process.env.REACT_APP_APP_NAME || 'Example React App'}</h2>
      {!loaded ?
        // spinner
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
          <Loader type="Oval" color="#0b5ed7" />
        </div>
        :
        <Row className="mt-4">
          {chainsData && chainsData.map((chainData, key) => (
            <Col key={key} xl="3" lg="4" md="6" xs="12" className="mb-4">
              {/* chain infomation */}
              <Card className="p-3">
                <Link to={`/${chainData.name}`} style={{ textAlign: 'left' }}>
                  <CardImg top src={chainData.logo_url} alt="" className="avatar-lg" />
                </Link>
                <CardBody className="p-0 pt-3">
                  <CardTitle tag="h5" className="mb-0" style={{ fontWeight: 600, textAlign: 'left' }}>
                    <Link to={`/${chainData.name}`}>{chainData.name}</Link>
                  </CardTitle>
                  <CardText className="text-muted mb-2" style={{ fontSize: '.75rem', fontWeight: 400, textAlign: 'left' }}>
                    {"Chain ID: "}{chainData.chain_id}
                  </CardText>
                  <CardText className="mb-2" style={{ fontSize: '.85rem', fontWeight: 400, textAlign: 'left' }}>
                    {"Synced Block: "}{chainData.synced_block_height}
                  </CardText>
                  <CardText className="text-muted" style={{ fontSize: '.75rem', fontWeight: 300, textAlign: 'left' }}>
                    <Moment format="[Signed at] MMM D, YYYY LTS">{chainData.synced_blocked_signed_at}</Moment>
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      }
    </div>
  );
}

export default Chains;
