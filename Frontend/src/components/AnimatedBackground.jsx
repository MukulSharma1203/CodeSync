// Global animated aurora + grid background.
// Purely decorative — sits behind all page content.
export default function AnimatedBackground() {
  return (
    <div className="app-bg" aria-hidden="true">
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
    </div>
  );
}
