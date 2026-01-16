export default function UserProfileIcon({
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
      <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 18c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}