export default function EyeClosedIcon({ 
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
      <path 
        d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <circle 
        cx="10" 
        cy="10" 
        r="3" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <line 
        x1="3" 
        y1="3" 
        x2="17" 
        y2="17" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
    </svg>
  );
}