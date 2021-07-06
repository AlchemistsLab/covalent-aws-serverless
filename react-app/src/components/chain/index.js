import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Media, Form, FormGroup, Label, Input, FormText, Button } from 'reactstrap';

const Chain = props => {
  const chainsData = useSelector(content => content.data.chains_data);
  const chainSelected = useSelector(content => content.preferences.chain_selected) || (props.match && props.match.params && props.match.params.chain_name);

  const chainData = chainSelected && chainsData && chainsData[chainsData.findIndex(chainData => chainData.name === chainSelected)];
  const [redirectPath, setRedirectPath] = useState(null);

  const search = e => {
    e.preventDefault();
    const id = e.target && e.target[0] && e.target[0].value;
    if (id) {
      setRedirectPath(`/${chainSelected}${id.length > 40 && id.length < 45 ? '/address' : '/tx'}/${id}`);
    }
  };

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      window.location.reload();
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }

  return (
    <div className="m-4">
      {chainData && (
        <Media className="d-inline-flex align-items-center">
          <Media left style={{ marginRight: '.75rem' }}>
            <Media object src={chainData.logo_url} alt={chainData.name} style={{ maxWidth: '3rem' }} />
          </Media>
          <Media body style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {chainData.label}
          </Media>
        </Media>
      )}
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
