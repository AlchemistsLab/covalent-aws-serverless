import { combineReducers } from 'redux';
import data from './data/reducer';
import preferences from './preferences/reducer';

// reducers of data and preferences
const reducers = combineReducers({ data, preferences });

export default reducers;
