import React from "react";

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <div className="w-16 h-16 border-4 border-t-transparent border-[var(--color-accent)] rounded-full animate-spin"></div>
  </div>
);

export default Spinner;
