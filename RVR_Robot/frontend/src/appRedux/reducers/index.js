import { combineReducers } from 'redux';
import Auth from './Auth';
import Camera from './Camera';
import Robot from './Robot';

const createRootReducer = () => combineReducers({
  auth: Auth,
  camera:Camera,
  robot:Robot

});

export default createRootReducer;
