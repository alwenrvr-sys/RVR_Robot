import {
  APP_PICKPLACE_START,
  APP_PICKPLACE_STOP,
  RESET_ANALYSIS,
  DXF_PREVIEW,
  DXF_DRAW,
  DXF_RESET,
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