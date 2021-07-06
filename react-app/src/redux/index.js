import { combineReducers } from 'redux';
import data from './data/reducer';
import preferences from './preferences/reducer';

const reducers = combineReducers({ data, preferences });

export default reducers;
