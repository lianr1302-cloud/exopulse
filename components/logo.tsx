import Image from "next/image";

interface ExoPulseLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function ExoPulseLogo({ size = 34, className, priority = false }: ExoPulseLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ExoPulse logo"
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
}