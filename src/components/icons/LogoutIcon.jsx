export default function LogoutIcon({
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
      {...props}>
      <path d="M13 3h3a2 2 0 012 2v10a2 2 0 01-2 2h-3M7 14l-5-4 5-4M2 10h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}