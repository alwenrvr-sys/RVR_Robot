import React, { useState } from "react";
import { Layout } from "antd";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useRef } from "react";
import logo from "../assets/RVR.png";
import {
  ControlOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  CameraOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { RobotPing, enableRobot, setAutoMode } from "../appRedux/actions/Robot";
import { CameraPing } from "../appRedux/actions/Camera";
import { hideNotification } from "../appRedux/actions/Notify";

const { Header, Content } = Layout;

export default function MainLayout() {
  const initializedRef = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { connected: robotConnected } = useSelector((state) => state.robot);
  const [closing, setClosing] = useState(false);
  const { connected: cameraConnected } = useSelector((state) => state.camera);
  const notify = useSelector((state) => state.notify);

  useEffect(() => {
    dispatch(RobotPing());
  }, [dispatch]);

  useEffect(() => {
    dispatch(CameraPing());
  }, [dispatch]);

  useEffect(() => {
    if (!robotConnected) return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    dispatch(enableRobot());
    dispatch(setAutoMode());
  }, [robotConnected, dispatch]);

  useEffect(() => {
    if (!notify.visible) return;

    setClosing(false);

    const t = setTimeout(() => {
      setClosing(true);
    }, 2000);

    const cleanup = setTimeout(() => {
      dispatch(hideNotification());
    }, 2500);

    return () => {
      clearTimeout(t);
      clearTimeout(cleanup);
    };
  }, [notify.visible, dispatch]);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: 56,
          padding: "0 16px",
          background: "#020202",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        {/* Left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          <img
            src={logo}
            alt="RVR Logo"
            style={{
              height: 45,
              width: "auto",
              paddingLeft: 8,
            }}
          />
          <span>Vision and Robot</span>
        </div>

        {/* Right Status */}
        {/* STATUS LINE (BEHIND CENTER MENU) */}
        <div />
        <div
          style={{
            position: "absolute",
            top: 9,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            gap: 160,
            pointerEvents: "auto",
            zIndex: 1001,
          }}
        >
          <div className="status-wrapper robot">
            {notify.visible && notify.tag === "robot" && (
              <div className={`status-notify robot ${closing ? "out" : "in"}`}>
                {notify.message}
              </div>
            )}

            <div className="status-icon">
              <IconStatus icon={<RobotOutlined />} connected={robotConnected} />
            </div>
          </div>

          <div className="status-wrapper camera">
            {notify.visible && notify.tag === "camera" && (
              <div className={`status-notify camera ${closing ? "out" : "in"}`}>
                {notify.message}
              </div>
            )}

            <div className="status-icon">
              <IconStatus
                icon={<CameraOutlined />}
                connected={cameraConnected}
              />
            </div>
          </div>
        </div>
        {/* Center Icon Menu */}
        <div
          onMouseEnter={() => setMenuOpen(true)}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: "absolute",
            left: "50%",
            top: 25,
            transform: "translateX(-50%)",
            cursor: "pointer",

            width: 72,
            height: 36,
            background: "#f5f5f5",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,

            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 6,

            zIndex: 2001,
          }}
        >
          <AppstoreOutlined
            className={`menu-icon ${menuOpen ? "open" : ""}`}
            style={{ fontSize: 24, color: "#000000" }}
          />
        </div>

        {/* ================= USER PROFILE ================= */}
        <div
          style={{ position: "relative" }}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <div
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              color: "#fff",
              padding: "6px 10px",
              paddingRight: 25,
              borderRadius: 8,
            }}
          >
            <UserOutlined style={{ fontSize: 18 }} />
            <span style={{ fontSize: 14 }}>Admin</span>
          </div>

          {/* ---------- DROPDOWN ---------- */}
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 42,
                minWidth: 180,
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                padding: 8,
                zIndex: 2000,
              }}
            >
              <ProfileItem label="Robot IP" value="192.168.1.10" />
              <ProfileItem label="Camera IP" value="192.168.1.20" />

              <div
                style={{
                  height: 1,
                  background: "#eee",
                  margin: "6px 0",
                }}
              />

              <div
                onClick={() => console.log("Logout")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "#ff4d4f",
                }}
              >
                <LogoutOutlined />
                Logout
              </div>
            </div>
          )}
        </div>
      </Header>
      {/* ================= MENU DRAWER (UNDER TOP BAR) ================= */}
      <div
        onMouseLeave={() => setMenuOpen(false)}
        style={{
          position: "fixed",
          top: 56,
          left: "50%",
          zIndex: 999,

          background: "#f5f5f5",
          borderRadius: "0 0 16px 16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",

          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "10px 16px",

          /* animation */
          transition: "all 0.25s ease",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "translate(-50%, 0)" : "translate(-50%, -10px)",
        }}
      >
        <DrawerItem
          icon={<DashboardOutlined />}
          label="Dashboard"
          active
          onClick={() => navigate("/")}
        />
        <DrawerItem
          icon={<ControlOutlined />}
          label="Control Panel"
          active
          onClick={() => navigate("/joystick")}
        />
        <DrawerItem
          icon={<RobotOutlined />}
          label="ML Train"
          active
          onClick={() => navigate("/ml-train")}
        />
        <DrawerItem
          icon={<NodeIndexOutlined />}
          label="ML Test"
          active
          onClick={() => navigate("/ml-teach")}
        />
      </div>
      {/* ================= CONTENT ================= */}
      <Content
        style={{
          marginTop: 56,
          height: "100%",
          background: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}

/* ================= DRAWER ITEM ================= */
function DrawerItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        minWidth: 90,
        padding: "8px 14px",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        background: active ? "#e6f4ff" : "transparent",
        color: active ? "#1677ff" : "#333",
        fontWeight: active ? 500 : 400,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </div>
  );
}
function IconStatus({ icon, connected }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "black",
          border: `3px solid ${connected ? "#52c41a" : "#ff4d4f"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: connected ? "#52c41a" : "#ff4d4f",
          fontSize: 20,
        }}
      >
        {icon}
      </div>

      {hover && (
        <div
          style={{
            position: "absolute",
            top: 36,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#000",
            color: "#fff",
            padding: "4px 8px",
            fontSize: 11,
            borderRadius: 4,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {connected ? "Connected" : "Disconnected"}
        </div>
      )}
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 13,
        color: "#333",
      }}
    >
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  );
}
