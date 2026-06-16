'use client';

import { useRef } from 'react';

export default function ContactForm({ email }: { email: string }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const replyRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = nameRef.current?.value ?? '';
    const reply = replyRef.current?.value ?? '';
    const msg = msgRef.current?.value ?? '';
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${reply}\n\n${msg}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">Name</label>
        <input ref={nameRef} type="text" name="name" className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-ink focus:border-accent" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">Email</label>
        <input ref={replyRef} type="email" name="email" className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-ink focus:border-accent" required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">Message</label>
        <textarea ref={msgRef} name="message" rows={4} className="w-full rounded-lg border border-hairline bg-card px-3 py-2 text-ink focus:border-accent" required></textarea>
      </div>
      <button type="submit" className="w-full rounded-xl bg-ink py-2.5 font-semibold text-white transition-colors hover:bg-black">
        Email Support
      </button>
    </form>
  );
}
