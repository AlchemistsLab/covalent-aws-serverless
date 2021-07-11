import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Media, Form, FormGroup, Label, Input, FormText, Button } from 'reactstrap';
import _ from 'lodash';

// chain component
const Chain = props => {
  // chains data from redux
  const chainsData = useSelector(content => content.data.chains_data);
  // chain from redux
  const chainSelected = useSelector(content => content.preferences.chain_selected) || (props.match && props.match.params && props.match.params.chain_name);

  // chain data
  const chainData = chainSelected && chainsData && chainsData[chainsData.findIndex(chainData => chainData.name === chainSelected)];
  // redirect parameter
  const [redirectPath, setRedirectPath] = useState(null);

  // split path to list
  const paths = window.location.pathname && window.location.pathname.split('/').filter(path => path);

  // handle search
  const search = e => {
    e.preventDefault();
    const id = e.target && e.target[0] && e.target[0].value;
    if (id) {
      setRedirectPath(`/${chainSelected}${id.length > 40 && id.length < 45 ? '/address' : '/tx'}/${id}${_.slice(paths, 3).map(path => `/${path}`).join('')}`);
    }
  };

  // redirect
  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }

  return (
    <div className="m-4">
      {/* title */}
      {chainData && (
        <Media className="d-inline-flex align-items-center">
          <Media left style={{ marginRight: '.75rem' }}>
            <Media object src={chainData.logo_url} alt="" className="avatar" />
          </Media>
          <Media body style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {chainData.label}
          </Media>
        </Media>
      )}
      {/* search component */}
      <Form
        method="POST"
        onSubmit={search}
        className="d-flex align-items-center mx-auto"
        style={{ maxWidth: '35rem', minHeight: '40vh', textAlign: 'left' }}
      >
        <FormGroup className="w-100">
          <Label for="id" className="mb-4" style={{ fontWeight: 600 }}>{"Search address or transaction"}</Label>
          <Input name="id" id="id" placeholder="Search by address / Txn Hash" />
          <FormText color="muted" className="d-flex align-items-center justify-content-center mt-3">
            {"Data taken from"}
            <a href="https://covalenthq.com/" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center">
              <img src="https://www.covalenthq.com/static/images/covalent-logomark.png" alt="" className="mx-2" style={{ height: '1rem' }} />
              {"Covalent"}
            </a>
          </FormText>
        </FormGroup>
        <Button type="submit" color="primary" style={{ marginTop: '.75rem', marginLeft: '.25rem' }}>{"Search"}</Button>
      </Form>
    </div>
  );
}

export default Chain;
