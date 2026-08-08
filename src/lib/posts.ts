// Blog Posts Store & Types for Aegis CMS

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  author: string;
  category: string;
  content: string;
}

// Default initial blog post
export const INITIAL_POSTS: BlogPostItem[] = [
  {
    id: "v1-0-0-release",
    slug: "v1-0-0-release",
    title: "Announcing Aegis v1.0.0: Zero-Trust Remote Environment Workstation",
    description: "Introducing Aegis v1.0.0 GA. Built for SREs and DevOps leads with WebGL terminal rendering, zero-knowledge Scrypt vault encryption, parallel multi-server execution, and live vitals telemetry.",
    pubDate: "2026-08-08",
    author: "Mukesh (@mukeshv-tech)",
    category: "Release Announcement",
    content: `We are excited to announce the general availability of **Aegis v1.0.0**, a desktop workstation engineered for DevOps leads, SREs, and security engineers managing multi-cloud remote environments.

### Key Capabilities in v1.0.0

#### 1. WebGL-Accelerated Terminal & Inline Zmodem
Powered by the official \`@xterm/xterm\` v5.5 engine, Aegis delivers smooth 60 FPS viewport rendering, search addons, clickable URLs, and native **inline Zmodem (\`sz\`/\`rz\`) file transfers** directly inside your terminal session.

#### 2. Zero-Knowledge Cryptographic Vault
All connection credentials and private keys are secured using **Scrypt key derivation** (\`N=16384, r=8, p=1\`) combined with **AES-256-GCM** authenticated encryption. Decrypted master key allocations in process memory are zero-filled immediately upon locking the vault.

#### 3. Zero-Trust Security Specification
- **Scrypt KDF**: GPU-resistant key derivation parameters.
- **AES-256-GCM**: 96-bit random IVs and 128-bit authentication tags.
- **Memory Hygiene**: \`masterKey.fill(0)\` RAM zeroing on lock.
- **Command Injection Guard**: \`escapeShellArg\` single-quote escaping.

### Getting Started
- **Releases Page**: [https://github.com/mukeshv-tech/Aegis/releases/](https://github.com/mukeshv-tech/Aegis/releases/)
- **Source Code**: [https://github.com/mukeshv-tech/Aegis](https://github.com/mukeshv-tech/Aegis)`
  }
];
