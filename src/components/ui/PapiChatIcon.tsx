export const PapiChatIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    stroke="#FFD700"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <defs>
      <radialGradient id="goldGlow" cx="0.5" cy="0.5" r="0.6">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle
      cx="32"
      cy="32"
      r="30"
      fill="url(#goldGlow)"
      stroke="#FFD700"
      strokeWidth="1.5"
    />
    <path
      d="M19 20h26a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H27l-8 7v-7h0a5 5 0 0 1-5-5V25a5 5 0 0 1 5-5z"
      fill="none"
      stroke="#FFD700"
      strokeWidth="1.8"
    />
    <circle cx="27" cy="30" r="1.2" fill="#FFD700" />
    <circle cx="32" cy="30" r="1.2" fill="#FFD700" />
    <circle cx="37" cy="30" r="1.2" fill="#FFD700" />
    <path
      d="M48 14l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z"
      fill="none"
      stroke="#FFD700"
      strokeWidth="1.2"
    />
  </svg>
);
