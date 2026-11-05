import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const SIZE_PX = {
  sm: 16,
  md: 24,
  lg: 40,
} as const;

type LoaderSize = keyof typeof SIZE_PX | number;

type LoaderProps = {
  size?: LoaderSize;
  className?: string;
  label?: string;
};

function resolveSize(size: LoaderSize): number {
  return typeof size === "number" ? size : SIZE_PX[size];
}

/** Loader de marca: envuelve el Spinner de shadcn con tamaños y label en español. */
export function Loader({
  size = "md",
  className,
  label = "Cargando",
}: LoaderProps) {
  const px = resolveSize(size);

  return (
    <Spinner
      aria-label={label}
      className={cn("text-current", className)}
      style={{ width: px, height: px }}
    />
  );
}
