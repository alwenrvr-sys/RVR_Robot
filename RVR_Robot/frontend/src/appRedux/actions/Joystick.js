import {
SET_JOYSTICK_MODE
} from "../../constants/ActionType";

export const setJoystickMode = (mode) => ({
  type: SET_JOYSTICK_MODE,
  payload: mode,
});