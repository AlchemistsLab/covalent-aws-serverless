import { CHAINS_DATA } from '../types';

const initial_state = {
  chains_data: null,
};

// data reducer
const reducer = (state = initial_state, action) => {
  switch (action.type) {
    case CHAINS_DATA:
      return { ...state, chains_data: action.payload };
    default: return { ...state };
  }
};

export default reducer;
