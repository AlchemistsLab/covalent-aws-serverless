import { CHAIN_SELECTED } from '../types';

const initial_state = {
  chain_selected: null,
};

// preferences reducer
const reducer = (state = initial_state, action) => {
  switch (action.type) {
    case CHAIN_SELECTED:
      return { ...state, chain_selected: action.payload };
    default: return { ...state };
  }
};

export default reducer;
