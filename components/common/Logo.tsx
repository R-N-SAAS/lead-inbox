// Lead Inbox Logo - L with slash design
// Place in: components/common/Logo.tsx

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 40, text: 'text-lg' },
  xl: { icon: 56, text: 'text-xl' },
};

export default function Logo({ size = 'md', className = '', showText = true }: LogoProps) {
  const { icon, text } = sizes[size];
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* L Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* L shape with outline */}
        <path
          d="M25 15 L25 75 L75 75"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        {/* Inner L outline */}
        <path
          d="M33 23 L33 67 L67 67"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          fill="none"
        />
        {/* Diagonal slash */}
        <path
          d="M45 50 L85 20"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="square"
          fill="none"
        />
        {/* Lower slash accent */}
        <path
          d="M50 55 L75 85"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="square"
          fill="none"
        />
      </svg>
      
      {showText && (
        <span className={`font-semibold text-white ${text}`}>
          Lead Inbox
        </span>
      )}
    </div>
  );
}

// Compact logo for favicon/small spaces
export function LogoIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* L shape with outline */}
      <path
        d="M25 15 L25 75 L75 75"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
      {/* Inner L outline */}
      <path
        d="M33 23 L33 67 L67 67"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      />
      {/* Diagonal slash */}
      <path
        d="M45 50 L85 20"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="square"
        fill="none"
      />
      {/* Lower slash accent */}
      <path
        d="M50 55 L75 85"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}
