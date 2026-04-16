import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-left">
        <div className="auth-copy">
          <span className="eyebrow">AI-Enhanced Screening</span>
          <h1 className="hero-title">Pneumonia Detection Platform</h1>
          <p className="hero-text">
            Upload a chest X-ray, run model inference, review the prediction,
            visualize Grad-CAM attention, and download a simple report.
          </p>
          <div className="auth-note">
            Screening aid only. All outputs require human review.
          </div>
        </div>
      </div>

      <div className="auth-panel auth-panel-right">
        <div className="auth-card-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
