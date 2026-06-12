export default function AdminLoading() {
  return (
    <div style={{ display: 'grid', gap: 20 }} aria-busy="true" aria-live="polite">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              minHeight: 104,
            }}
          />
        ))}
      </div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 16,
          minHeight: 280,
        }}
      />
    </div>
  )
}
