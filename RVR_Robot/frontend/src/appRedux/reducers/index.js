import { combineReducers } from 'redux';
import Auth from './Auth';

const createRootReducer = () => combineReducers({
  auth: Auth
});

export default createRootReducer;
