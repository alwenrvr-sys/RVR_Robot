import { useEffect, useState } from "react";
import {
  Layout,
  List,
  Card,
  Image,
  Button,
  Modal,
  Input,
  Typography,
  Space,
  Tag,
  message,
  Spin,
  Divider,
} from "antd";
import { ReloadOutlined, TagsOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text } = Typography;

const API_BASE = "http://localhost:8000";

// -----------------------------
// Generic API helper
// -----------------------------
async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
}

export default function MLTrain() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [labelModal, setLabelModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const [labelValue, setLabelValue] = useState("");

  // ---------------------------------
  // Fetch groups for training
  // ---------------------------------
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await apiPost("/ml/get-groups");

      if (data.success) {
        setGroups(data.groups);
      }
    } catch (err) {
      message.error("Failed to load groups");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ---------------------------------
  // Assign Label
  // ---------------------------------
  const handleAssignLabel = async () => {
    if (!labelValue || !activeGroup) return;

    try {
      await apiPost("/ml/assign-label", {
        group_id: activeGroup.group_id,
        label: labelValue,
      });

      message.success("Label assigned successfully");

      setLabelModal(false);
      setLabelValue("");
      fetchGroups(); // refresh list
    } catch (err) {
      message.error("Failed to assign label");
    }
  };

  // ---------------------------------
  // Rebuild Model
  // ---------------------------------
  const handleRebuild = async () => {
    message.loading({ content: "Rebuilding model...", key: "rebuild" });

    try {
      const data = await apiPost("/ml/rebuild");

      message.success({
        content: `Model rebuilt (${data.samples} samples)`,
        key: "rebuild",
      });
    } catch (err) {
      message.error({
        content: "Rebuild failed",
        key: "rebuild",
      });
    }
  };

  return (
    <Layout style={{ height: "100vh", background: "#f5f5f5" }}>
      {/* LEFT SIDEBAR */}
      <Sider width={300} style={{ background: "#fff", padding: 20 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <h3>Unlabeled Groups</h3>

          <Button icon={<ReloadOutlined />} onClick={fetchGroups} block>
            Refresh
          </Button>

          {loading ? (
            <Spin />
          ) : (
            <List
              dataSource={groups}
              renderItem={(group) => (
                <Card
                  size="small"
                  hoverable
                  style={{ marginBottom: 10 }}
                  onClick={() => {
                    setActiveGroup(group);
                    setLabelModal(true);
                  }}
                >
                  <Space direction="vertical">
                    <Text strong>{group.group_id}</Text>
                    <Tag color="red">Unknown</Tag>
                    <Text type="secondary">{group.image_count} images</Text>
                  </Space>
                </Card>
              )}
            />
          )}
        </Space>
      </Sider>

      {/* RIGHT PANEL */}
      <Content style={{ padding: 30 }}>
        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            onClick={handleRebuild}
          >
            Rebuild Model
          </Button>
        </div>

        {!activeGroup && <Card>Select a group to label</Card>}

        {activeGroup && (
          <Card
            title={
              <Space>
                <Text strong>{activeGroup.group_id}</Text>
                <Tag color="red">Unknown</Tag>
              </Space>
            }
          >
            <Divider />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
              }}
            >
              {activeGroup.images?.map((img, i) => (
                <Image
                  key={i}
                  src={`${API_BASE}${img}`}
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              ))}
            </div>
          </Card>
        )}
      </Content>

      {/* LABEL MODAL */}
      <Modal
        title="Assign Label"
        open={labelModal}
        onOk={handleAssignLabel}
        onCancel={() => setLabelModal(false)}
      >
        <Input
          placeholder="Enter object name (e.g. M8_Bolt)"
          value={labelValue}
          onChange={(e) => setLabelValue(e.target.value)}
        />
      </Modal>
    </Layout>
  );
}
