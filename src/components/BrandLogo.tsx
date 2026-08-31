import Image from "next/image";

export default function BrandLogo({ size = 36, showText = true, className = "" }: { size?: number; showText?: boolean; className?: string }) {
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl shadow-sm flex-shrink-0" style={{ width: size, height: size }}>
        <Image src="/icon-512.png" alt="DateBu Logo" fill className="object-cover" priority />
      </div>
      {showText && (
        <span className="font-bold tracking-tight text-gray-900 text-lg">
          DateBu<span className="text-[#7C3AED]">.</span>
        </span>
      )}
    </div>
  );
}
