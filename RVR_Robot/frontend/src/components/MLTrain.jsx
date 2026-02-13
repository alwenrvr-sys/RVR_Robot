import { useState } from "react";
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
} from "antd";
import {
  ReloadOutlined,
  TagsOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text } = Typography;

export default function MLTrain() {
  // -------------------------------
  // Dummy Data
  // -------------------------------
  const [groups] = useState([
    {
      group_id: "G1",
      image_count: 5,
      label: "Bolt",
      images: [
        "https://picsum.photos/200?1",
        "https://picsum.photos/200?2",
        "https://picsum.photos/200?3",
        "https://picsum.photos/200?4",
        "https://picsum.photos/200?5",
      ],
    },
    {
      group_id: "G2",
      image_count: 4,
      label: null,
      images: [
        "https://picsum.photos/200?6",
        "https://picsum.photos/200?7",
        "https://picsum.photos/200?8",
        "https://picsum.photos/200?9",
      ],
    },
    {
      group_id: "G3",
      image_count: 3,
      label: "Nut",
      images: [
        "https://picsum.photos/200?10",
        "https://picsum.photos/200?11",
        "https://picsum.photos/200?12",
      ],
    },
  ]);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [labelModal, setLabelModal] = useState(false);
  const [labelValue, setLabelValue] = useState("");
  const [activeGroup, setActiveGroup] = useState(null);

  // -------------------------------
  // Select Group (Stack)
  // -------------------------------
  const handleSelectGroup = (group) => {
    const exists = selectedGroups.find(
      (g) => g.group_id === group.group_id
    );
    if (!exists) {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  // -------------------------------
  // Remove Group
  // -------------------------------
  const handleRemoveGroup = (groupId) => {
    setSelectedGroups(
      selectedGroups.filter((g) => g.group_id !== groupId)
    );
    message.success("Group removed (UI only)");
  };

  // -------------------------------
  // Assign / Rename Label
  // -------------------------------
  const handleAssignLabel = () => {
    if (!labelValue || !activeGroup) return;

    const updated = selectedGroups.map((g) =>
      g.group_id === activeGroup.group_id
        ? { ...g, label: labelValue }
        : g
    );

    setSelectedGroups(updated);
    setLabelModal(false);
    setLabelValue("");
  };

  // -------------------------------
  // Global Rebuild
  // -------------------------------
  const handleRebuild = () => {
    message.loading({ content: "Rebuilding model...", key: "rebuild" });

    setTimeout(() => {
      message.success({
        content: "Model Rebuilt! (UI Only)",
        key: "rebuild",
      });
    }, 1500);
  };

  return (
    <Layout style={{ height: "100vh", background: "#f5f5f5" }}>
      {/* ---------------- LEFT SIDEBAR ---------------- */}
      <Sider width={320} style={{ background: "#fff", padding: 20 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <h3 style={{ fontWeight: 600 }}>Detected Groups</h3>

          <Button icon={<ReloadOutlined />} block>
            Refresh
          </Button>

          <List
            dataSource={groups}
            renderItem={(item) => (
              <Card
                size="small"
                hoverable
                onClick={() => handleSelectGroup(item)}
                style={{ marginBottom: 10 }}
              >
                <Space direction="vertical">
                  <Text strong style={{ fontSize: 16 }}>
                    {item.group_id}
                  </Text>

                  <Text type="secondary">
                    {item.image_count} images
                  </Text>

                  {item.label && (
                    <Tag color="green">{item.label}</Tag>
                  )}
                </Space>
              </Card>
            )}
          />
        </Space>
      </Sider>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <Content style={{ padding: 30, overflowY: "auto" }}>
        {/* GLOBAL REBUILD */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <Button
            icon={<ReloadOutlined />}
            type="primary"
            onClick={handleRebuild}
          >
            Rebuild Model
          </Button>
        </div>

        {selectedGroups.length === 0 && (
          <Card>
            <h4>Select a group to review</h4>
          </Card>
        )}

        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {selectedGroups.map((group) => (
            <Card
              key={group.group_id}
              title={
                <Space>
                  <Text strong style={{ fontSize: 18 }}>
                    {group.group_id}
                  </Text>

                  {group.label && (
                    <Tag color="green">{group.label}</Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  <Button
                    icon={<TagsOutlined />}
                    onClick={() => {
                      setActiveGroup(group);
                      setLabelValue(group.label || "");
                      setLabelModal(true);
                    }}
                  >
                    {group.label
                      ? "Rename Label"
                      : "Assign Label"}
                  </Button>

                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() =>
                      handleRemoveGroup(group.group_id)
                    }
                  >
                    Remove
                  </Button>
                </Space>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 16,
                }}
              >
                {group.images.map((img, i) => (
                  <Image
                    key={i}
                    src={img}
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
          ))}
        </Space>
      </Content>

      {/* ---------------- LABEL MODAL ---------------- */}
      <Modal
        title={
          activeGroup?.label
            ? "Rename Label"
            : "Assign Label"
        }
        open={labelModal}
        onOk={handleAssignLabel}
        onCancel={() => setLabelModal(false)}
        okText="Save"
      >
        <Input
          placeholder="Enter label name"
          value={labelValue}
          onChange={(e) => setLabelValue(e.target.value)}
        />
      </Modal>
    </Layout>
  );
}
