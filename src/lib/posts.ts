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

// Default initial blog post seeded into Cloudflare D1 Database & API
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

Remote infrastructure management has historically forced engineers to compromise between speed, visibility, and cryptographic security. Aegis eliminates these tradeoffs by uniting high-performance terminal emulation, zero-knowledge credential vaulting, and multi-server batch execution into a secure local application.

---

### Key Capabilities in v1.0.0

#### 1. WebGL-Accelerated Terminal & Inline Zmodem
Powered by the official \`@xterm/xterm\` v5.5 engine, Aegis delivers smooth 60 FPS viewport rendering, search addons, clickable URLs, and native **inline Zmodem (\`sz\`/\`rz\`) file transfers** directly inside your terminal session.

#### 2. Zero-Knowledge Cryptographic Vault
All connection credentials and private keys are secured using **Scrypt key derivation** (\`N=16384, r=8, p=1\`) combined with **AES-256-GCM** authenticated encryption. Decrypted master key allocations in process memory are zero-filled immediately upon locking the vault.

#### 3. SFTP Browser & Remote Editor
Manage remote files through a multi-pane SFTP explorer featuring drag-and-drop file transfers, direct file editing, permission management, and single-click directory compression and extraction (\`.tar.gz\` and \`.zip\`).

#### 4. Parallel Multi-Server Automation
Run automation scripts across dozens of remote servers simultaneously with real-time log aggregation and reusable command templates supporting dynamic \${variable} parameter substitution.

#### 5. Cross-Distro Live System Telemetry
Monitor real-time CPU, RAM, and Disk utilization metrics polled every 3000ms. Tested and verified across Ubuntu, Debian, CentOS, RHEL, Arch, Alpine Linux, and macOS/BSD hosts.

#### 6. Microsecond Session Recording & Replay
Record terminal sessions with microsecond precision and replay recordings inside Aegis using integrated playback controls (\`1x-4x\` speed and timeline scrubbing).

---

### Zero-Trust Security Specification

Security is the primary design pillar of Aegis. v1.0.0 incorporates several cryptographic safeguards:

- **GPU-Resistant Scrypt KDF**: Replaced legacy derivation algorithms with Scrypt (\`N=16384, r=8, p=1\`) utilizing 16-byte random salts to withstand brute-force attempts.
- **AES-256-GCM Authenticated Payload Protection**: Every vault item uses a 96-bit random IV and a 128-bit authentication tag to verify data integrity before decryption.
- **Volatile Process Memory Wiping**: Master key Buffer objects allocated in process RAM are zero-filled (\`masterKey.fill(0)\`) immediately upon vault lock or application shutdown.
- **Command Injection Guardrails**: Remote shell parameters pass through single-quote argument escaping (\`escapeShellArg\`) to neutralize subshell execution attempts.
- **Path Boundary Validation**: File operations enforce strict \`path.basename()\` boundary checks to prevent path traversal vulnerability vectors.
- **Atomic Storage Handlers**: File storage implementations execute inside atomic \`try/catch\` blocks without TOCTOU pre-checks.

---

### Zero-Defect Quality Gate

Aegis v1.0.0 has completed rigorous verification:
- **40 / 40 Automated Integration Tests Passing** across 12 test suites.
- **0 TypeScript Compiler Errors** & **0 ESLint Warnings**.
- Full CI/CD automation via GitHub Actions matrix workflows.

---

### Getting Started with v1.0.0

Download the production Windows NSIS installer or inspect the source code directly on GitHub:

- **Releases Page**: [https://github.com/mukeshv-tech/Aegis/releases/](https://github.com/mukeshv-tech/Aegis/releases/)
- **Source Code**: [https://github.com/mukeshv-tech/Aegis](https://github.com/mukeshv-tech/Aegis)`
  }
];
