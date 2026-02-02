import React, { useState } from "react";
import { Layout } from "antd";
import { useNavigate} from "react-router-dom";
import { Outlet } from "react-router-dom";
import {
  ControlOutlined,
  RobotOutlined,
  NodeIndexOutlined,
  AppstoreOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* ================= TOP BAR ================= */}
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
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 600 }}>
          Robot UI
        </div>

        {/* Center Icon Menu */}
        {/* Center Icon Menu */}
        {/* Center Icon Menu */}
        <div
          onMouseEnter={() => setMenuOpen(true)}
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: "absolute",
            left: "50%",
            top: 20, // inside navbar
            transform: "translateX(-50%)",
            cursor: "pointer",

            /* inverted half-oval */
            width: 72,
            height: 36,
            background: "#f5f5f5",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,

            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 6,

            zIndex: 1001,
          }}
        >
          <AppstoreOutlined style={{ fontSize: 18, color: "#001529" }} />
        </div>

        {/* Right placeholder */}
        <div style={{ width: 80 }} />
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
