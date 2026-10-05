import React from 'react';
import cguLogoImg from '../../assets/images/cgu_odisha_official_logo_1791002593989.jpg';

interface CGULogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'full' | 'icon' | 'badge';
}

export { cguLogoImg };

export const CGUWatermark: React.FC<{
  className?: string;
  opacity?: string;
  dark?: boolean;
}> = ({
  className = 'w-96 h-96',
  opacity = 'opacity-[0.06]',
  dark = false,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none flex items-center justify-center ${opacity} ${className}`}
    >
      <img
        src={cguLogoImg}
        alt=""
        className={`w-full h-full object-contain ${dark ? 'filter invert brightness-200' : ''}`}
      />
    </div>
  );
};

export const CGULogo: React.FC<CGULogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
  variant = 'icon',
}) => {
  const [imgError, setImgError] = React.useState(false);

  const style = size ? { width: size, height: size } : undefined;

  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`} style={style}>
      <div className="relative rounded-full overflow-hidden shrink-0 bg-white flex items-center justify-center shadow-xs border border-red-900/20 aspect-square w-full h-full">
        {!imgError ? (
          <img
            src={cguLogoImg}
            alt="C. V. Raman Global University Logo"
            className="w-full h-full object-contain p-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Crisp scalable SVG recreation of C. V. Raman Global University Emblem */
          <svg viewBox="0 0 300 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Outer red rim */}
            <circle cx="150" cy="150" r="145" fill="#f8fafc" stroke="#b91c1c" strokeWidth="6" />
            <circle cx="150" cy="150" r="138" fill="none" stroke="#64748b" strokeWidth="2" />

            {/* Silver/grey circular band */}
            <circle cx="150" cy="150" r="132" fill="#cbd5e1" stroke="#b91c1c" strokeWidth="3" />
            <circle cx="150" cy="150" r="88" fill="#ffffff" stroke="#b91c1c" strokeWidth="3" />

            {/* Circular text path for C.V. RAMAN GLOBAL UNIVERSITY */}
            <path
              id="cguTextPathTop"
              d="M 32 150 A 118 118 0 1 1 268 150"
              fill="none"
            />
            <text fill="#0f172a" fontSize="18" fontWeight="bold" letterSpacing="2.5">
              <textPath href="#cguTextPathTop" startOffset="50%" textAnchor="middle">
                C. V. RAMAN GLOBAL UNIVERSITY
              </textPath>
            </text>

            {/* Lower text for ODISHA ESTD ~ 2020 */}
            <path
              id="cguTextPathBottom"
              d="M 265 150 A 115 115 0 0 1 35 150"
              fill="none"
            />
            <text fill="#0f172a" fontSize="16" fontWeight="bold" letterSpacing="3">
              <textPath href="#cguTextPathBottom" startOffset="50%" textAnchor="middle">
                ODISHA · ESTD ~ 2020
              </textPath>
            </text>

            {/* Inner Shield */}
            <path
              d="M 95 105 Q 150 95 205 105 Q 210 160 150 220 Q 90 160 95 105 Z"
              fill="#ffffff"
              stroke="#b91c1c"
              strokeWidth="4"
            />

            {/* Open Book within Shield */}
            {/* Left page */}
            <path
              d="M 115 135 Q 132 138 147 142 L 147 182 Q 132 178 115 174 Z"
              fill="#f8fafc"
              stroke="#b91c1c"
              strokeWidth="2.5"
            />
            {/* Right page */}
            <path
              d="M 153 142 Q 168 138 185 135 L 185 174 Q 168 178 153 182 Z"
              fill="#f8fafc"
              stroke="#b91c1c"
              strokeWidth="2.5"
            />

            {/* Pen Nib Stem */}
            <path
              d="M 148 142 L 152 142 L 151 170 L 149 170 Z"
              fill="#b91c1c"
            />
            <polygon points="150,175 146,165 154,165" fill="#b91c1c" />

            {/* Flame of Wisdom above Nib */}
            <path
              d="M 150 115 C 142 124 145 133 150 138 C 155 133 158 124 150 115 Z"
              fill="#ef4444"
              stroke="#b91c1c"
              strokeWidth="1.5"
            />
            <circle cx="150" cy="128" r="2.5" fill="#fbbf24" />
          </svg>
        )}
      </div>

      {showText && (
        <div className="min-w-0">
          <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
            UDIS
          </span>
          <span className="text-[11px] text-slate-500 block leading-tight">
            C. V. Raman Global University
          </span>
        </div>
      )}
    </div>
  );
};
