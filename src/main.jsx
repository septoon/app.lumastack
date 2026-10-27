import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LazyMotion, MotionConfig } from "motion/react";
const loadMotion = () => import("./motionFeatures").then(module => module.default);
import "./styles/global.css";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LazyMotion features={loadMotion} strict>
      <MotionConfig reducedMotion="user"><App /></MotionConfig>
    </LazyMotion>
  </StrictMode>,
);

import "./styles/portal.css";
