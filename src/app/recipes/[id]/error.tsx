'use client';

import Link from 'next/link';

export default function RecipeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <h3 style={{ fontSize: 28, marginBottom: 8 }}>Recipe not found.</h3>
      <p style={{ color: '#8A7E72', marginBottom: 20 }}>This recipe may have been deleted.</p>
      <Link href="/" style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #D8CDB8', background: '#FFFDF8', fontSize: 13.5 }}>
        Back to all recipes
      </Link>
    </div>
  );
}
