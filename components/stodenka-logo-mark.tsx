import { cn } from "@/lib/utils";

type StodenkaLogoMarkProps = {
  className?: string;
  title?: string;
};

export function StodenkaLogoMark({ className, title = "Стоденка" }: StodenkaLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 200 80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("block h-8 w-auto", className)}
    >
      <title>{title}</title>
      <rect width="100%" height="100%" fill="none" />
      <g transform="translate(8 6)">
        <text
          x="10"
          y="49"
          fontFamily="Arial, Helvetica, ui-sans-serif, system-ui, sans-serif"
          fontSize="45"
          fontWeight="700"
          fill="#222222"
        >
          10
        </text>
        <circle cx="78" cy="34" r="18" fill="#FF4B2B" />
        <circle cx="78" cy="34" r="6" fill="#FFFFFF" />
        <text
          x="105"
          y="44"
          fontFamily="Arial, Helvetica, ui-sans-serif, system-ui, sans-serif"
          fontSize="18"
          fontWeight="700"
          letterSpacing="2"
          fill="#444444"
        >
          СТОДЕНКА
        </text>
      </g>
    </svg>
  );
}
