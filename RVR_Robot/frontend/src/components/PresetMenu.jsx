import { useEffect, useRef, useState } from "react";
import { Button, Modal, Input, InputNumber, message, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

export default function PresetMenu({ zLift = 0, simulate = true }) {
  const scrollRef = useRef(null);

  const [presets, setPresets] = useState({});
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit | delete
  const [name, setName] = useState("");
  const [pose, setPose] = useState([0, 0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState(null);

  const MAX_PRESETS = 4;

  /* ================= FETCH ================= */

  const fetchPresets = async () => {
    try {
      const res = await axios.get("http://localhost:8000/robot/presets");
      setPresets(res.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const presetKeys = Object.keys(presets);
  const isMaxReached = presetKeys.length >= MAX_PRESETS;

  /* ================= SCROLL ================= */

  const handleWheel = (e) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollBy({
      left: e.deltaY,
      behavior: "smooth",
    });
  };

  /* ================= MOVE ================= */

  const movePreset = async (presetName) => {
    try {
      await axios.post(
        `http://localhost:8000/robot/presets/${presetName}/move`,
        null,
        {
          params: {
            z_lift: simulate ? zLift : 0,
            simulate: simulate,
          },
        },
      );

      message.success(
        `${presetName} moving (zLift: ${simulate ? zLift : 0}, simulate: ${simulate})`,
      );
    } catch {
      message.error("Move failed");
    }
  };

  /* ================= OPEN MODALS ================= */

  const openAdd = () => {
    if (isMaxReached) return;
    setMode("add");
    setName("");
    setPose([0, 0, 0, 0, 0, 0]);
    setVisible(true);
  };

  const openEdit = () => {
    setMode("edit");
    setName("");
    setPose([0, 0, 0, 0, 0, 0]);
    setVisible(true);
  };

  const openDelete = () => {
    setMode("delete");
    setName("");
    setVisible(true);
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    try {
      if (mode === "add") {
        if (!name) return message.warning("Enter preset name");

        await axios.post("http://localhost:8000/robot/presets", null, {
          params: { name, pose },
        });

        message.success("Preset added");
      }

      if (mode === "edit") {
        if (!name) return message.warning("Select preset");

        await axios.put(`http://localhost:8000/robot/presets/${name}`, null, {
          params: { pose },
        });

        message.success("Preset updated");
      }

      if (mode === "delete") {
        if (!name) return message.warning("Select preset");

        await axios.delete(`http://localhost:8000/robot/presets/${name}`);

        message.success("Preset deleted");
      }

      setVisible(false);
      fetchPresets();
    } catch {
      message.error("Operation failed");
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Presets</h4>

        <div style={{ display: "flex", gap: 6 }}>
          {/* Hide Add if 4 presets */}
          {!isMaxReached && (
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAdd}
            />
          )}

          <Button size="small" icon={<EditOutlined />} onClick={openEdit} />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={openDelete}
          />
        </div>
      </div>

      {/* PRESET BUTTONS */}
      <div
        ref={scrollRef}
        className="preset-scroll-container"
        onWheel={handleWheel}
      >
        {presetKeys.map((preset) => (
          <button
            key={preset}
            className={`preset-btn ${activePreset === preset ? "preset-active" : ""}`}
            style={{
              flex: "0 0 auto",
              minWidth: "100px",
              height: "34px",
              fontSize: "12px",
            }}
            onClick={() => {
              setActivePreset(preset);
              movePreset(preset);
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* ================= MODAL ================= */}

      <Modal
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={handleSave}
        okText={
          mode === "add"
            ? "Create Preset"
            : mode === "edit"
              ? "Update Preset"
              : "Delete Preset"
        }
        okButtonProps={{
          danger: mode === "delete",
          disabled:
            (mode === "add" && !name) ||
            ((mode === "edit" || mode === "delete") && !name),
        }}
        title={
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {mode === "add"
              ? "Create New Preset"
              : mode === "edit"
                ? "Edit Preset"
                : "Delete Preset"}
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* SELECT PRESET (AntD) */}
          {(mode === "edit" || mode === "delete") && (
            <div>
              <div style={{ fontSize: 12, marginBottom: 6, color: "#777" }}>
                Select Preset
              </div>

              <Select
                placeholder="Select preset"
                value={name || undefined}
                style={{ width: "100%" }}
                options={presetKeys.map((p) => ({
                  label: p,
                  value: p,
                }))}
                onChange={(selected) => {
                  setName(selected);

                  if (mode === "edit") {
                    setPose(presets[selected] || [0, 0, 0, 0, 0, 0]);
                  }
                }}
              />
            </div>
          )}

          {/* NAME INPUT (ADD MODE) */}
          {mode === "add" && (
            <div>
              <div style={{ fontSize: 12, marginBottom: 6, color: "#777" }}>
                Preset Name
              </div>

              <Input
                placeholder="Enter preset name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {/* POSE GRID */}
          {(mode === "add" || (mode === "edit" && name)) && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  marginBottom: 10,
                  color: "#777",
                }}
              >
                Pose Configuration
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {["X", "Y", "Z", "Rx", "Ry", "Rz"].map((label, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "#999" }}>{label}</span>
                    <InputNumber
                      value={pose[i]}
                      style={{ width: "100%" }}
                      onChange={(v) =>
                        setPose((p) => {
                          const copy = [...p];
                          copy[i] = v ?? 0;
                          return copy;
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
