import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import { routes } from './routes';
import store from './store';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'video-react/dist/video-react.css';

ReactDOM.render(
  <Fragment>
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <App>
            {/* iterate all routes */}
            {routes.map(({ path, Component, exact }) => (
              <Route key={path ? path : ''} path={path} exact={exact}>
                {({ location, match }) => {
                  // redirect path end with multiple '/'
                  if (location.pathname.length > 1 && location.pathname.endsWith('/')) {
                    let redirectPath = location.pathname;
                    while (redirectPath.endsWith('/')) {
                      redirectPath = redirectPath.substring(0, redirectPath.length - 1);
                    }
                    return (<Redirect to={redirectPath} />);
                  }
                  // start filter route
                  if (!path && match) {
                    if (match.isExact || location.key) {
                      match = null;
                    }
                    else {
                      if (routes.filter(route => route.path).findIndex(route => {
                        const routeSplit = route.path.split('/');
                        const pathSplit = location.pathname.split('/');
                        if (routeSplit.length !== pathSplit.length)
                          return false;
                        return routeSplit.findIndex((x, i) => !(x === pathSplit[i] || x.startsWith(':'))) > -1 ? false : true;
                      }) > -1) {
                        match = null;
                      }
                    }
                  }
                  if (match && match.url !== match.path && routes.findIndex(route => route.path === match.url) > -1) {
                    match = null;
                  }
                  // end filter route
                  return match && (<Component match={match} />); // return component for each route
                }}
              </Route>
            ))}
          </App>
        </Switch>
      </BrowserRouter>
    </Provider>
  </Fragment>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();