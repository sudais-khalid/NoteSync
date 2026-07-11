import NavBar from './NavBar';

export default function PageShell({ children, wide = false }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <NavBar />
      <main className={`mx-auto px-6 py-10 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}>{children}</main>
    </div>
  );
}
