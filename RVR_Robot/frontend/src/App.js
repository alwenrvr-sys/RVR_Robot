import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Joystick from "./components/Joystick";
import Dashboard from "./components/Dashboard";
import MLTeach from "./components/MLTeach";
import MLTrain from "./components/MLTrain";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="joystick" element={<Joystick />} />
        <Route path="ml-teach" element={<MLTeach />} />
        <Route path="ml-train" element={<MLTrain />} />
      </Route>
    </Routes>
  );
}
