export default function ErrorBanner({ message, className = '' }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`rounded-sm border border-rose/40 bg-rose-light px-4 py-3 text-sm text-rose ${className}`}
    >
      {message}
    </div>
  );
}
