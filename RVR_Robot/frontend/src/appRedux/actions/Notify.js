import {
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION,
} from "../../constants/ActionType";

export const showNotification = (tag, message) => ({
  type: SHOW_NOTIFICATION,
  payload: { tag, message },
});

export const hideNotification = () => ({
  type: HIDE_NOTIFICATION,
});
