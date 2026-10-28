'use client';

export default function ConfirmForm({ action, pesan, children }: { action: () => void | Promise<void>; pesan: string; children: React.ReactNode }) {
  return (
    <form action={action} className="inline" onSubmit={(e) => { if (!confirm(pesan)) e.preventDefault(); }}>
      {children}
    </form>
  );
}
