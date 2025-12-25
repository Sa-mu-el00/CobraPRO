export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#004D40', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#00E676', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* S estilizado com seta de crescimento */}
      <path
        d="M 70 25 C 70 15, 60 10, 50 10 C 40 10, 30 15, 30 25 C 30 35, 40 40, 50 40 C 60 40, 70 45, 70 55 C 70 65, 60 70, 50 70 C 40 70, 30 65, 30 55 L 30 50 L 75 50 L 80 35 L 90 45 L 80 55 L 75 50"
        fill="url(#logoGradient)"
        strokeWidth="0"
      />
      
      {/* Símbolo do infinito/fluxo contínuo */}
      <circle cx="85" cy="45" r="3" fill="#00E676" />
    </svg>
  );
}
