import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CHAINS_DATA } from './redux/types';
import { request as covalentRequest } from './api/covalent';
import Header from './layouts/header';

const App = ({ children, location, match }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await covalentRequest('/chains/', {});
        if (response) {
          dispatch({ type: CHAINS_DATA, payload: response.data ? response.data.items : [] });
        }
      } catch (error) {}
    };
    getData();
    const interval = setInterval(() => getData(), 30 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="App">
      {!location.pathname || location.pathname === '/' ?
        <img src={logo} alt="logo" className="App-logo" style={{ maxWidth: '10rem', maxHeight: '10rem' }} />
        :
        <Header logo={<img src={logo} alt="logo" className="App-logo" style={{ maxWidth: '4rem', maxHeight: '4rem' }} />} />
      }
      {children}
    </div>
  );
}

export default withRouter(App);
