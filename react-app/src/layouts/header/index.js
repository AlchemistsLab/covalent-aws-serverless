import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Media } from 'reactstrap';
import { CHAIN_SELECTED } from '../../redux/types';
import _ from 'lodash';

const Header = props => {
  const chainsData = useSelector(content => content.data.chains_data);
  const chainSelected = useSelector(content => content.preferences.chain_selected);
  const dispatch = useDispatch();

  const [redirectPath, setRedirectPath] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);

  const selectChain = (chainName, isNotRedirect) => {
    dispatch({ type: CHAIN_SELECTED, payload: chainName });
    const paths = window.location.pathname && window.location.pathname.split('/').filter(path => path);
    if (!isNotRedirect) {
      setRedirectPath(`/${chainName}${_.slice(paths, 1).map(path => `/${path}`).join('')}`);
    }
  };

  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      window.location.reload();
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }
  else if (chainsData) {
    const paths = window.location.pathname && window.location.pathname.split('/').filter(path => path);
     if (paths.length > 0 && (!chainSelected || chainSelected !== paths[0]) && chainsData.findIndex(chainData => chainData.name === paths[0]) > -1) {
      selectChain(paths[0], true);
    }
  }

  return (
    <div className="d-flex align-items-center mx-4" style={{ maxHeight: '5rem' }}>
      <Link to="/">{props.logo}</Link>
      <ButtonDropdown isOpen={dropdownOpen} toggle={toggle} style={{ marginLeft: 'auto' }}>
        <DropdownToggle caret outline color="primary" className="d-flex align-items-center">
          {chainSelected && chainsData && chainsData.findIndex(chainData => chainData.name === chainSelected) > -1 ?
            chainsData.filter(chainData => chainData.name === chainSelected).map((chainData, key) => (
              <Media key={key} className="d-inline-flex align-items-center">
                <Media left style={{ marginRight: '.25rem' }}>
                  <Media object src={chainData.logo_url} alt={chainData.name} style={{ maxWidth: '1.5rem' }} />
                </Media>
                <Media body style={{ fontSize: '.75rem' }}>
                  {chainData.label}
                </Media>
              </Media>
            ))
            :
            'Select Chain'
          }
        </DropdownToggle>
        <DropdownMenu style={{ left: 'unset', right: 0, minWidth: 'max-content' }}>
          {chainsData ?
            chainsData.map((chainData, key) => (
              <DropdownItem
                key={key}
                disabled={chainSelected === chainData.name}
                onClick={() => selectChain(chainData.name)}
              >
                <Media className="d-flex align-items-center">
                  <Media left style={{ marginRight: '.25rem' }}>
                    <Media object src={chainData.logo_url} alt={chainData.name} style={{ maxWidth: '1.5rem' }} />
                  </Media>
                  <Media body style={{ fontSize: '.75rem' }}>
                    {chainData.label}
                  </Media>
                </Media>
              </DropdownItem>
            ))
            :
            []
          }
        </DropdownMenu>
      </ButtonDropdown>
    </div>
  );
}

export default Header;
