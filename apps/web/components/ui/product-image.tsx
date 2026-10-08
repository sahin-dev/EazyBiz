import Image from "next/image";

export function ProductImage({ src, alt, className, width = 320, height = 220 }: { src: string; alt: string; className?: string; width?: number; height?: number }) {
  return <Image src={src} alt={alt} className={className} width={width} height={height} sizes="(max-width: 700px) 50vw, 240px" unoptimized={!src.startsWith("/")} />;
}
