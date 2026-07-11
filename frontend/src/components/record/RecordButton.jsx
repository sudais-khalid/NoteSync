export default function RecordButton({ isListening, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isListening}
      className={`group relative flex h-24 w-24 items-center justify-center rounded-full border-2 font-mono text-xs uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        isListening
          ? 'border-rose bg-rose text-paper'
          : 'border-amber-dark bg-amber text-paper hover:bg-amber-dark'
      }`}
    >
      {isListening && (
        <span className="absolute inset-0 animate-ping rounded-full bg-rose/40" aria-hidden="true" />
      )}
      <span className="relative z-10">{isListening ? 'Stop' : 'Record'}</span>
    </button>
  );
}
