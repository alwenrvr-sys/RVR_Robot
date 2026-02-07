import { combineReducers } from 'redux';
import Auth from './Auth';
import Camera from './Camera';
import Robot from './Robot';
import Applications from './Application';

const createRootReducer = () => combineReducers({
  auth: Auth,
  camera:Camera,
  robot:Robot,
  app:Applications

});

export default createRootReducer;
