import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Workspace from "./pages/Workspace";
import Compare from "./pages/Compare";
import Arena from "./pages/Arena";
import Vault from "./pages/Vault";
import Analytics from "./pages/Analytics";
import Tools from "./pages/Tools";
import Studio from "./pages/Studio";
import VideoStudio from "./pages/VideoStudio";
import VisualFlow from "./pages/VisualFlow";
import TestMode from "./pages/TestMode";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Workspace />} />
            <Route path="compare" element={<Compare />} />
            <Route path="arena" element={<Arena />} />
            <Route path="studio" element={<Studio />} />
            <Route path="video" element={<VideoStudio />} />
            <Route path="flow" element={<VisualFlow />} />
            <Route path="vault" element={<Vault />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="tools" element={<Tools />} />
            <Route path="test" element={<TestMode />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
