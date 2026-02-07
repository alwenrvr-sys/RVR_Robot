import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_STOP,
} from "../../constants/ActionType";

export const startAutoPick = () => ({
  type: APP_PICKPLACE_START,
});

export const stopAutoPick = () => ({
  type: APP_PICKPLACE_STOP,
});
