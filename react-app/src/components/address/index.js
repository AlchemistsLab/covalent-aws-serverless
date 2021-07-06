import React from 'react';
import { useSelector } from 'react-redux';

const Address = props => {
  const chainsData = useSelector(content => content.data.chains_data);
  const chainSelected = useSelector(content => content.preferences.chain_selected) || (props.match && props.match.params && props.match.params.chain_name);
  const address = props.match && props.match.params && props.match.params.address;

  const chainData = chainSelected && chainsData && chainsData[chainsData.findIndex(chainData => chainData.name === chainSelected)];

  return (
    <div className="mx-4">
      <h2>{"Address: "}{address}</h2>
    </div>
  );
}

export default Address;
