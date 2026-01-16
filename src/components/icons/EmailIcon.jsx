export default function EmailIcon({ 
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
        d="M3 4h14a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
      <path 
        d="M2 5l8 5 8-5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
      />
    </svg>
  );
}