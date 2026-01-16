export default function LockIcon({ 
  className = '', 
  width = 20, 
  height = 20,
  ...props 
}) {
  return (
    <svg 
      className={`icon ${className}`}
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect 
        x="3" 
        y="8" 
        width="14" 
        height="10" 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <path 
        d="M6 8V6a4 4 0 118 0v2" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
    </svg>
  );
}