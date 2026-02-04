import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from "react";
import { getUser } from '../appRedux/actions/Auth';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  /* ================= DUMMY DATA ================= */
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(getUser());
    console.log("Dispatched getUser action");
    }, []);

  const pickRateData = {
    labels: ["10:00", "10:05", "10:10", "10:15", "10:20", "10:25"],
    datasets: [
      {
        label: "Parts / min",
        data: [3, 5, 2, 6, 4, 5],
        borderColor: "#ff4d4f",
        backgroundColor: "rgba(255,77,79,0.2)",
        tension: 0.3,
      },
    ],
  };

  const partDistributionData = {
    labels: ["Accepted", "Rejected", "Unknown"],
    datasets: [
      {
        label: "Parts",
        data: [12, 6, 3],
        backgroundColor: ["#52c41a", "#ff4d4f", "#faad14"],
        borderRadius: 6,
      },
    ],
  };

  const pickRateOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div style={page}>
      {/* ================= TOP METRICS ================= */}
      <div style={topRow}>
        <Metric title="System State" value="Production" />
        <Metric title="Good Parts" value="3 parts" />
        <Metric title="Cycle Time" value="3.28 s" />
        <Metric title="Fill Percentage" value="12 %" />
      </div>

      {/* ================= MIDDLE ROW ================= */}
      <div style={middleRow}>
        {/* Current Results */}
        <div style={panelLarge}>
          <h4 style={panelTitle}>Current Results</h4>

          <div style={resultsRow}>
            <div style={cameraBox}>
              <div style={fakeCamera}>Camera View</div>
            </div>

            <table style={table}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ color: "green" }}>
                  <td>Accepted</td>
                  <td>3</td>
                </tr>
                <tr style={{ color: "red" }}>
                  <td>Rejected</td>
                  <td>1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pick Rate */}
        <div style={panel}>
          <h4 style={panelTitle}>Pick Rate</h4>
          <div style={chartBox}>
            <Line data={pickRateData} options={pickRateOptions} />
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ROW ================= */}
      <div style={bottomRow}>
        <div style={panel}>
          <h4 style={panelTitle}>Part Distribution</h4>
          <div style={chartBox}>
            <Bar data={partDistributionData} options={barOptions} />
          </div>
        </div>

        <div style={panel}>
          <h4 style={panelTitle}>Production Timeline</h4>
          <Timeline />
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Metric({ title, value }) {
  return (
    <div style={metric}>
      <div style={metricTitle}>{title}</div>
      <div style={metricValue}>{value}</div>
    </div>
  );
}

function Timeline() {
  const steps = ["Start", "Pick", "Place", "Inspect", "End"];

  return (
    <div style={timeline}>
      {steps.map((s, i) => (
        <div key={i} style={timelineItem}>
          <div style={dot} />
          <span>{s}</span>
        </div>
      ))}
    </div>
  );
}

/* ================= STYLES ================= */

const page = {
  padding: 16,
  height: "100%",
};

const topRow = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
  marginBottom: 16,
};

const middleRow = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 16,
  marginBottom: 16,
};

const bottomRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const panel = {
  background: "#fff",
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
  display: "flex",
  flexDirection: "column",
};

const panelLarge = { ...panel };

const panelTitle = {
  marginBottom: 8,
  fontWeight: 600,
};

const chartBox = {
  flex: 1,
  minHeight: 180,
};

const metric = {
  background: "#fff",
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
};

const metricTitle = {
  fontSize: 12,
  color: "#666",
};

const metricValue = {
  fontSize: 18,
  fontWeight: 600,
};

const resultsRow = {
  display: "flex",
  gap: 12,
};

const cameraBox = {
  flex: 1,
};

const fakeCamera = {
  height: 180,
  background: "#eaeaea",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#777",
};

const table = {
  flex: 1,
  borderCollapse: "collapse",
};

/* TIMELINE */
const timeline = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: 180,
};

const timelineItem = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
};

const dot = {
  width: 10,
  height: 10,
  borderRadius: "50%",
  background: "#1677ff",
};
