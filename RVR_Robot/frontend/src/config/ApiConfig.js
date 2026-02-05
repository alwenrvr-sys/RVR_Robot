export const APICONFIG = Object.freeze({
  HOST: "http://localhost:8000/",
  AUTH: {
    GETUSER: "auth/users",
  },
  CAMERA: {
    TRIGGER: "camera/trigger",
  },
  ROBOT: {
    TCP: "robot/tcp",
    PING: "robot/ping",
    MODE_AUTO: "robot/mode/auto",
    MODE_MANUAL: "robot/mode/manual",
    ENABLE: "robot/enable",
    DISABLE: "robot/disable",
    STOP: "robot/stop",
    RESET: "robot/reset",
    MOVEL: "robot/moveL",
  },
});
