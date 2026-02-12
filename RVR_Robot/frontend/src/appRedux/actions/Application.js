import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_STOP,
  RESET_ANALYSIS,
  DXF_PREVIEW,
  DXF_DRAW,
  DXF_RESET,
  APP_PICKSORT_START,
  APP_PICKSORT_STOP,
  SET_PRIORITY_ORDER_REQUEST,
} from "../../constants/ActionType";

export const startAutoPick = () => ({
  type: APP_PICKPLACE_START,
});

export const stopAutoPick = () => ({
  type: APP_PICKPLACE_STOP,
});

export const resetAnalysis = () => ({
  type: RESET_ANALYSIS,
});

export const previewDXF = (file) => ({
  type: DXF_PREVIEW,
  payload: file,
});

export const drawDXF = (params) => ({
  type: DXF_DRAW,
  payload: params,
});

export const resetDXF = () => ({
  type: DXF_RESET,
});

export const startAutoSort = () => ({
  type: APP_PICKSORT_START,
});

export const stopAutoSort = () => ({
  type: APP_PICKSORT_STOP,
});

export const setPriorityOrder = (order) => ({
  type: SET_PRIORITY_ORDER_REQUEST,
  payload: order,
});
