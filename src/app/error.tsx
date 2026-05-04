'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h3 style={{ fontFamily: 'inherit', fontSize: 28, marginBottom: 8 }}>Something went wrong.</h3>
      <p style={{ color: '#8A7E72', marginBottom: 20 }}>An unexpected error occurred.</p>
      <button onClick={reset} style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #D8CDB8', background: '#FFFDF8', cursor: 'pointer', fontSize: 13.5 }}>
        Try again
      </button>
    </div>
  );
}
