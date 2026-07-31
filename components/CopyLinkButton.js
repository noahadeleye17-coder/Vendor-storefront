'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import Button from './ui/Button';

export default function CopyLinkButton({ url, className }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail on non-HTTPS/older browsers - fall back silently,
      // the URL is still visible on screen for the vendor to select manually.
    }
  }

  return (
    <Button
      type="button"
      variant="marigold"
      size="md"
      onClick={handleCopy}
      className={className}
    >
      {copied ? <Check size={18} /> : <Copy size={18} />}
      {copied ? 'Copied!' : 'Copy link'}
    </Button>
  );
}