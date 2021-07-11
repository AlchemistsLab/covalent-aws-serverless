import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CHAINS_DATA } from './redux/types';
import { request as covalentRequest } from './api/covalent';
import Header from './layouts/header';
import Footer from './layouts/footer';

const App = ({ children, location, match }) => {
  const dispatch = useDispatch();

  // request all chains: '/chains/'
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
    // interval request (30 sec)
    const interval = setInterval(() => getData(), 30 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="App">
      {/* header component */}
      {!location.pathname || location.pathname === '/' ?
        <img src={logo} alt="logo" className="App-logo" style={{ maxWidth: '10rem', maxHeight: '10rem' }} />
        :
        <Header pathname={location.pathname} logo={<img src={logo} alt="logo" className="App-logo" style={{ maxWidth: '4rem', maxHeight: '4rem' }} />} />
      }
      <div style={{ minHeight: '81vh' }}>
        {children} {/* component in each route */}
      </div>
      <Footer /> {/* footer component */}
    </div>
  );
}

export default withRouter(App);
