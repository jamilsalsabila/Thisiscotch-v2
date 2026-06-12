export default function PublicLoading() {
  return (
    <section className="section" aria-busy="true" aria-live="polite">
      <div className="container" style={{ display: 'grid', gap: 24 }}>
        <div style={{ width: 96, height: 14, borderRadius: 999, background: 'var(--cream-dark)' }} />
        <div style={{ width: 'min(520px, 100%)', height: 64, borderRadius: 20, background: 'var(--cream-dark)' }} />
        <div style={{ width: 'min(640px, 100%)', height: 22, borderRadius: 999, background: 'var(--cream-dark)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginTop: 12 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              <div style={{ aspectRatio: '4 / 3', background: 'var(--cream-dark)' }} />
              <div style={{ padding: 20, display: 'grid', gap: 12 }}>
                <div style={{ height: 16, borderRadius: 999, background: 'var(--cream-dark)' }} />
                <div style={{ height: 16, width: '72%', borderRadius: 999, background: 'var(--cream-dark)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
