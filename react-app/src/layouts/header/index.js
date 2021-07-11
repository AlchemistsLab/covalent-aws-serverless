import React, { useState, useLayoutEffect } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Media, Form, FormGroup, Input, Button } from 'reactstrap';
import { CHAIN_SELECTED } from '../../redux/types';
import _ from 'lodash';

// header component
const Header = props => {
  // chains data from redux
  const chainsData = useSelector(content => content.data.chains_data);
  // chain from redux
  const chainSelected = useSelector(content => content.preferences.chain_selected);
  const dispatch = useDispatch();

  // path to redirect
  const [redirectPath, setRedirectPath] = useState(null);
  // chain dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(prevState => !prevState);

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

  // handle chain change
  const selectChain = (chainName, isNotRedirect) => {
    dispatch({ type: CHAIN_SELECTED, payload: chainName });
    if (!isNotRedirect) {
      setRedirectPath(`/${chainName}${_.slice(paths, 1).map(path => `/${path}`).join('')}`);
    }
  };

  // redirect
  if (redirectPath) {
    if (window.location && window.location.pathname === redirectPath) {
      setRedirectPath(null);
    }
    return (<Redirect to={redirectPath} />);
  }
  else if (chainsData) {
    // auto select chain
    if (paths.length > 0 && (!chainSelected || chainSelected !== paths[0]) && chainsData.findIndex(chainData => chainData.name === paths[0]) > -1) {
      selectChain(paths[0], true);
    }
  }

  // search address / trasaction component
  const searchComponent = props.pathname && (props.pathname.startsWith(`/${chainSelected}/address/`) || props.pathname.startsWith(`/${chainSelected}/tx/`)) && (
    <Form
      method="POST"
      onSubmit={search}
      className="w-100 d-flex align-items-center"
      style={{ maxWidth: '35rem', textAlign: 'left', marginLeft: 'auto' }}
    >
      <FormGroup className="w-100">
        <Input name="id" id="id" placeholder="Search by address / Txn Hash" />
      </FormGroup>
      <Button type="submit" color="primary" className="mx-1">{"Search"}</Button>
    </Form>
  );

  return (
    <>
      <div className="d-flex align-items-center mx-4" style={{ maxHeight: '5rem' }}>
        {/* logo */}
        <Link to="/">{props.logo}</Link>
        {/* search component on not mobile */}
        {width > 575 && searchComponent}
        {/* chains select dropdown */}
        {chainsData && (
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggle} style={{ marginLeft: 'auto' }}>
            <DropdownToggle caret outline color="primary" className="d-flex align-items-center">
              {chainSelected && chainsData.findIndex(chainData => chainData.name === chainSelected) > -1 ?
                chainsData.filter(chainData => chainData.name === chainSelected).map((chainData, key) => (
                  <Media key={key} className="d-inline-flex align-items-center">
                    <Media left style={{ marginRight: '.5rem' }}>
                      <Media object src={chainData.logo_url} alt="" className="avatar-sm" />
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
                      <Media left style={{ marginRight: '.5rem' }}>
                        <Media object src={chainData.logo_url} alt="" className="avatar-sm" />
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
        )}
      </div>
      {/* search component on mobile */}
      {width <= 575 && (
        <div className="mt-3 mx-4">{searchComponent}</div>
      )}
    </>
  );
}

export default Header;
