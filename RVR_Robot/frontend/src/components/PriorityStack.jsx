import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setPriorityOrder } from "../appRedux/actions/Application";

function SortableItem({ id, group, expanded, toggle, isLocked }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      disabled: isLocked,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: isLocked ? "#aaa" : "#1677ff",
    color: "white",
    padding: "4px 10px",
    fontSize: 18,
    borderRadius: 5,
    marginBottom: 5,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    opacity: isLocked ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ marginBottom: 8 }}>
      <div style={style} {...attributes}>
        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => toggle(id)}>
          {group.group_id} ({group.object_ids.length})
        </div>

        {!isLocked && (
          <div
            {...listeners}
            style={{
              cursor: "grab",
              paddingLeft: 10,
              fontSize: 18,
            }}
          >
            ☰
          </div>
        )}
      </div>

      {expanded && (
        <div
          style={{
            background: "black",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            marginTop: 4,
          }}
        >
          {group.object_ids.map((id) => (
            <div key={id} style={{ fontSize: 13 }}>
              • Obj {id}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function PriorityStack() {
  const dispatch = useDispatch();
  const analyzeResult = useSelector((state) => state.camera.analyzeResult);
  const running = useSelector((state) => state.app.running);

  const groups = analyzeResult?.groups || [];
  const priorityOrder = useSelector((state) => state.app.priorityOrder);
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (running) {
      setLocked(true);
    }
  }, [running]);

  useEffect(() => {
    if (priorityOrder && priorityOrder.length > 0) {
      setItems(priorityOrder);
    } else {
      setItems(groups.map((g) => g.group_id));
    }
  }, [groups, priorityOrder]);

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDragEnd = (event) => {
    if (locked) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);

    setItems(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 400,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: 8,
          flexShrink: 0,
        }}
      >
        <h4 className="section-title" style={{ margin: 0 }}>
          Priority Order
        </h4>
        {groups.length > 0 && (
          <Button
            shape="circle"
            size="large"
            type={locked ? "primary" : "default"}
            onClick={() => {
              if (!locked) {
                dispatch(setPriorityOrder(items));
              }
              setLocked((prev) => !prev);
            }}
            disabled={running}
            icon={
              locked ? (
                <LockOutlined style={{ fontSize: 22 }} />
              ) : (
                <UnlockOutlined style={{ fontSize: 22 }} />
              )
            }
          />
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          paddingRight: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="priority-scroll"
      >
        {groups.length === 0 && (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "#999",
              fontSize: 14,
            }}
          >
            No groups available
          </div>
        )}

        {groups.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={items}
              strategy={verticalListSortingStrategy}
            >
              {items.map((gid) => {
                const group = groups.find((g) => g.group_id === gid);

                if (!group) return null;

                return (
                  <SortableItem
                    key={gid}
                    id={gid}
                    group={group}
                    expanded={expandedId === gid}
                    toggle={toggle}
                    isLocked={locked}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
