import { combineReducers } from 'redux';
import Auth from './Auth';
import Camera from './Camera';
import Robot from './Robot';
import Applications from './Application';
import Notify from './Notify';
import joystick from './Joystick';

const createRootReducer = () => combineReducers({
  auth: Auth,
  notify:Notify,
  camera:Camera,
  robot:Robot,
  app:Applications,
  joystick:joystick

});

export default createRootReducer;
