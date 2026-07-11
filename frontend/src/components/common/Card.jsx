export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-sm border border-hairline bg-paper-raised shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
