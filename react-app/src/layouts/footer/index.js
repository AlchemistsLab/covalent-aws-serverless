import React from 'react';
import moment from 'moment';
import { Heart } from 'react-bootstrap-icons';

// footer component
const Footer = props => {
  return (
    <div className="pt-4">
      {/* dev team message */}
      <div className="d-flex align-items-center justify-content-end overflow-auto px-2 px-md-3 px-lg-4 py-1" style={{ height: '2.5rem', fontSize: '.85rem', fontWeight: 300 }}>
        {"©"}&nbsp;{moment().format('YYYY')}&nbsp;{"made with"}<Heart style={{ width: '.75rem', height: '.75rem', margin: '.175rem .275rem 0 .2rem' }} />{"by"}<a href="https://coinhippo.io" target="_blank" rel="noopener noreferrer" className="mx-1">{"coinhippo"}</a>{"team."}
      </div>
    </div>
  );
}

export default Footer;
