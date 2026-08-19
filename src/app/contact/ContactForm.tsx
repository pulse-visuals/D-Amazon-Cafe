"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function ContactForm({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from ${name || "website visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${contactEmail})`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase text-jungle-500 mb-1.5 block">Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-jungle-500 mb-1.5 block">Your Email</label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
            className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase text-jungle-500 mb-1.5 block">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full rounded-xl border-2 border-jungle-100 px-3.5 py-2.5 text-sm focus:border-jungle-400 focus:outline-none resize-none"
        />
      </div>
      <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-jungle-600 px-6 py-3 font-bold text-white hover:bg-jungle-700">
        <Send size={16} /> Send Message
      </button>
    </form>
  );
}
