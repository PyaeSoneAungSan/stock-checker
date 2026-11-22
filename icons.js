// Product visual illustration vectors for offline & instant visual recognition
export const productIllustrations = {
  bulb: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bulbGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="100%" stop-color="#f59e0b" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="42" r="32" fill="url(#bulbGlow)"/>
      <path d="M34 56 Q36 70 42 74 L58 74 Q64 70 66 56 Z" fill="#fbbf24"/>
      <rect x="42" y="74" width="16" height="5" rx="2" fill="#94a3b8"/>
      <rect x="43" y="80" width="14" height="4" rx="2" fill="#64748b"/>
      <rect x="45" y="85" width="10" height="4" rx="2" fill="#475569"/>
      <path d="M42 42 Q47 30 50 30 Q53 30 58 42" fill="none" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M46 42 L48 55 M54 42 L52 55" stroke="#b45309" stroke-width="2"/>
    </svg>
  `,
  plug: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="50" height="48" rx="10" fill="#334155"/>
      <rect x="27" y="32" width="46" height="44" rx="8" fill="#1e293b"/>
      <!-- UK/MY 3 pins -->
      <rect x="46" y="12" width="8" height="20" rx="2" fill="#eab308"/>
      <rect x="30" y="44" width="12" height="6" rx="1.5" fill="#ca8a04"/>
      <rect x="58" y="44" width="12" height="6" rx="1.5" fill="#ca8a04"/>
      <rect x="42" y="76" width="16" height="12" rx="3" fill="#0f172a"/>
      <text x="50" y="65" font-size="8" fill="#94a3b8" text-anchor="middle" font-weight="bold">13A SIRIM</text>
    </svg>
  `,
  glue: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,10 44,28 56,28" fill="#dc2626"/>
      <rect x="45" y="28" width="10" height="8" fill="#f87171"/>
      <path d="M38 36 L62 36 L66 84 L34 84 Z" fill="#facc15"/>
      <rect x="36" y="52" width="28" height="18" fill="#b91c1c" rx="2"/>
      <text x="50" y="65" font-size="11" fill="#ffffff" font-weight="900" text-anchor="middle">502</text>
      <text x="50" y="80" font-size="7" fill="#854d0e" font-weight="bold" text-anchor="middle">SUPER GLUE</text>
    </svg>
  `,
  tape: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#0f172a"/>
      <circle cx="50" cy="50" r="30" fill="#334155"/>
      <circle cx="50" cy="50" r="20" fill="#f8fafc"/>
      <circle cx="50" cy="50" r="14" fill="#cbd5e1"/>
      <path d="M78 30 L90 22 L86 16 L74 24 Z" fill="#0f172a"/>
      <text x="50" y="53" font-size="6.5" fill="#475569" font-weight="bold" text-anchor="middle">PVC TAPE</text>
    </svg>
  `,
  lock: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 46 V32 A16 16 0 0 1 66 32 V46" fill="none" stroke="#94a3b8" stroke-width="7" stroke-linecap="round"/>
      <rect x="26" y="44" width="48" height="42" rx="6" fill="#d97706"/>
      <rect x="29" y="47" width="42" height="36" rx="4" fill="#f59e0b"/>
      <circle cx="50" cy="62" r="5" fill="#78350f"/>
      <polygon points="48,65 52,65 53,74 47,74" fill="#78350f"/>
      <text x="50" y="81" font-size="6" fill="#92400e" font-weight="bold" text-anchor="middle">40mm BRASS</text>
    </svg>
  `,
  faucet: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="44" width="28" height="14" rx="3" fill="#0284c7"/>
      <rect x="42" y="38" width="16" height="36" rx="4" fill="#0369a1"/>
      <path d="M46 54 Q65 54 68 68 L68 76 L58 76 L58 68 Q56 62 46 62 Z" fill="#0284c7"/>
      <!-- tap handle -->
      <rect x="45" y="24" width="10" height="14" fill="#38bdf8"/>
      <rect x="30" y="20" width="40" height="8" rx="4" fill="#ef4444"/>
      <circle cx="50" cy="24" r="3" fill="#ffffff"/>
      <text x="50" y="90" font-size="7" fill="#0369a1" font-weight="bold" text-anchor="middle">1/2" PVC</text>
    </svg>
  `,
  tie: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 75 C 20 40, 45 20, 75 22 C 85 24, 88 38, 75 48 C 60 60, 40 68, 26 76" fill="none" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
      <rect x="18" y="68" width="14" height="16" rx="3" fill="#cbd5e1"/>
      <rect x="22" y="73" width="6" height="6" fill="#475569"/>
      <line x1="38" y1="38" x2="42" y2="34" stroke="#94a3b8" stroke-width="2"/>
      <line x1="46" y1="32" x2="50" y2="28" stroke="#94a3b8" stroke-width="2"/>
      <line x1="56" y1="28" x2="60" y2="25" stroke="#94a3b8" stroke-width="2"/>
      <text x="50" y="90" font-size="7" fill="#64748b" font-weight="bold" text-anchor="middle">200mm / 100s</text>
    </svg>
  `,
  pill: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="25" width="56" height="52" rx="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2"/>
      <!-- blisters -->
      <circle cx="36" cy="38" r="8" fill="#ef4444"/>
      <circle cx="64" cy="38" r="8" fill="#ef4444"/>
      <circle cx="36" cy="62" r="8" fill="#3b82f6"/>
      <circle cx="64" cy="62" r="8" fill="#3b82f6"/>
      <text x="50" y="52" font-size="7" fill="#1e293b" font-weight="900" text-anchor="middle">PANADOL</text>
    </svg>
  `,
  lozenge: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="34" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
      <circle cx="50" cy="50" r="24" fill="#fef08a"/>
      <!-- S mark -->
      <text x="50" y="58" font-size="28" fill="#b45309" font-weight="900" text-anchor="middle">S</text>
      <text x="50" y="92" font-size="7" fill="#78350f" font-weight="bold" text-anchor="middle">STREPSILS</text>
    </svg>
  `,
  oil: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="42" y="14" width="16" height="12" rx="3" fill="#15803d"/>
      <rect x="45" y="24" width="10" height="6" fill="#86efac"/>
      <rect x="34" y="30" width="32" height="52" rx="8" fill="#047857"/>
      <rect x="38" y="42" width="24" height="30" fill="#ffffff" rx="3"/>
      <!-- Axe silhouette -->
      <path d="M48 50 L52 50 L52 66 L48 66 Z" fill="#991b1b"/>
      <path d="M46 50 Q56 46 56 54 L48 54 Z" fill="#991b1b"/>
      <text x="50" y="70" font-size="5.5" fill="#166534" font-weight="900" text-anchor="middle">CAP KAPAK</text>
    </svg>
  `,
  herbal: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="20" width="50" height="62" rx="4" fill="#eab308" stroke="#ca8a04" stroke-width="2"/>
      <rect x="30" y="28" width="40" height="46" fill="#fffbeb" rx="2"/>
      <text x="50" y="42" font-size="9" fill="#991b1b" font-weight="900" text-anchor="middle">德安</text>
      <text x="50" y="54" font-size="6.5" fill="#854d0e" font-weight="bold" text-anchor="middle">CHI KIT</text>
      <text x="50" y="64" font-size="6.5" fill="#854d0e" font-weight="bold" text-anchor="middle">TECK AUN</text>
      <circle cx="50" cy="71" r="2.5" fill="#451a03"/>
    </svg>
  `,
  sachet: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <polygon points="36,15 64,15 68,85 32,85" fill="#059669"/>
      <rect x="36" y="20" width="28" height="4" fill="#34d399"/>
      <rect x="34" y="38" width="32" height="24" fill="#ffffff" rx="2"/>
      <text x="50" y="50" font-size="7" fill="#065f46" font-weight="900" text-anchor="middle">GAVISCON</text>
      <text x="50" y="58" font-size="5" fill="#047857" font-weight="bold" text-anchor="middle">DOUBLE ACTION</text>
      <path d="M32 82 L68 82" stroke="#047857" stroke-width="3" stroke-dasharray="2 2"/>
    </svg>
  `,
  cream: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <polygon points="34,80 66,80 62,35 38,35" fill="#dc2626"/>
      <rect x="42" y="22" width="16" height="14" rx="2" fill="#ffffff"/>
      <text x="50" y="55" font-size="6.5" fill="#ffffff" font-weight="900" text-anchor="middle" transform="rotate(-90 50 55)">COUNTERPAIN</text>
      <rect x="40" y="40" width="20" height="20" fill="#fef08a" opacity="0.3" rx="2"/>
    </svg>
  `,
  bandage: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="38" width="56" height="24" rx="12" fill="#d4a373" stroke="#bc6c25" stroke-width="2"/>
      <rect x="40" y="39" width="20" height="22" fill="#fefae0"/>
      <!-- ventilation holes -->
      <circle cx="28" cy="50" r="1.5" fill="#bc6c25"/>
      <circle cx="34" cy="46" r="1.5" fill="#bc6c25"/>
      <circle cx="34" cy="54" r="1.5" fill="#bc6c25"/>
      <circle cx="66" cy="46" r="1.5" fill="#bc6c25"/>
      <circle cx="66" cy="54" r="1.5" fill="#bc6c25"/>
      <circle cx="72" cy="50" r="1.5" fill="#bc6c25"/>
      <text x="50" y="53" font-size="5" fill="#8d99ae" font-weight="bold" text-anchor="middle">HANSAPLAST</text>
    </svg>
  `,
  defaultDiy: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="36" fill="#e0f2fe"/>
      <path d="M38 62 L62 38 M60 36 L64 40 M36 60 L40 64" stroke="#0284c7" stroke-width="6" stroke-linecap="round"/>
      <circle cx="62" cy="38" r="4" fill="#0369a1"/>
    </svg>
  `,
  defaultMed: `
    <svg viewBox="0 0 100 100" class="w-full h-full p-2" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="36" fill="#fce7f3"/>
      <path d="M50 30 V70 M30 50 H70" stroke="#db2777" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `
};

export function getProductSvg(svgKey, section) {
  if (svgKey && productIllustrations[svgKey]) {
    return productIllustrations[svgKey];
  }
  return section === 'DIY' ? productIllustrations.defaultDiy : productIllustrations.defaultMed;
}
