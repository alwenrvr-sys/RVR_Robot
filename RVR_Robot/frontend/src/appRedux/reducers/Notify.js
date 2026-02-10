import { SHOW_NOTIFICATION, HIDE_NOTIFICATION } from "../../constants/ActionType";

const initialState = {
  tag: null,
  message: "",
  visible: false,
};

export default function notify(state = initialState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
      return {
        tag: action.payload.tag,
        message: action.payload.message,
        visible: true,
      };

    case HIDE_NOTIFICATION:
      return { ...state, visible: false };

    default:
      return state;
  }
}
