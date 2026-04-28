import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      {/* Left brand panel */}
      <div className="auth-panel auth-panel-left">
        <div className="auth-copy">
          <span className="eyebrow">AI-Enhanced Screening</span>
          <h1 className="hero-title">
            Pneumonia<br />Detection<br />Platform
          </h1>
          <p className="hero-text">
            Upload a chest X-ray, run model inference, review the
            AI prediction, and visualize Grad-CAM attention maps —
            all in one place.
          </p>
          <div className="auth-note">
            Screening aid only. All outputs require clinician review.
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-panel auth-panel-right">
        <div className="auth-card-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
