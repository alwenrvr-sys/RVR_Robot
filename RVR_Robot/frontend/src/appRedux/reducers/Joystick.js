import { SET_JOYSTICK_MODE } from "../../constants/ActionType";

const initialState = {
  mode: "pick",
};

export default function joystick(state = initialState, action) {
  switch (action.type) {
    case SET_JOYSTICK_MODE:
      return {
        ...state,
        mode: action.payload,
      };
    default:
      return state;
  }
}
