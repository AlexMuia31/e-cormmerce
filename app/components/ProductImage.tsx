// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {useState, useRef, useCallback, useEffect} from 'react';
import type {ProductVariantFragment} from 'storefrontapi.generated';
import {Image} from '@shopify/hydrogen';

type GalleryImage = {
  id: string | null;
  url: string;
  altText: string | null;
  width?: number | null;
  height?: number | null;
};

type ProductImageProps = {
  selectedVariantImage: ProductVariantFragment['image'];
  images: GalleryImage[];
};

export function ProductImage({
  selectedVariantImage,
  images,
}: ProductImageProps) {
  // Merge variant image at front, deduplicate by URL
  const allImages: GalleryImage[] = selectedVariantImage
    ? [
        {
          id: selectedVariantImage.id ?? null,
          url: selectedVariantImage.url,
          altText: selectedVariantImage.altText ?? null,
          width: selectedVariantImage.width ?? null,
          height: selectedVariantImage.height ?? null,
        },
        ...images.filter((img) => img.url !== selectedVariantImage.url),
      ]
    : images;

  const [activeIndex, setActiveIndex] = useState(0);

  // Keep active index in sync when the variant changes
  useEffect(() => {
    setActiveIndex(0);
  }, [selectedVariantImage?.url]);

  // ── Swipe handling ──────────────────────────────────────────────
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  }, [allImages.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
  }, [allImages.length]);

  if (!allImages.length) {
    return <div className="aspect-square bg-[#ede9e2]" />;
  }

  const currentImage = allImages[activeIndex];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Primary image */}
      <div
        className="relative flex-1 overflow-hidden bg-[#ede9e2] select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          alt={currentImage.altText || 'Product image'}
          aspectRatio="1/1"
          data={currentImage}
          key={currentImage.id ?? currentImage.url}
          sizes="(min-width: 45em) 50vw, 100vw"
          className="w-full h-full object-contain transition-opacity duration-300 mix-blend-multiply"
        />

        {/* Prev / Next arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#f7f4ef]/80 hover:bg-[#f7f4ef] transition-colors duration-200"
              aria-label="Previous image"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M9 2L4 7L9 12"
                  stroke="#1a1814"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#f7f4ef]/80 hover:bg-[#f7f4ef] transition-colors duration-200"
              aria-label="Next image"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5 2L10 7L5 12"
                  stroke="#1a1814"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, i) => (
            <button
              key={img.id ?? img.url}
              onClick={() => setActiveIndex(i)}
              className={[
                'shrink-0 w-16 h-16 overflow-hidden transition-all duration-200',
                i === activeIndex
                  ? 'ring-1 ring-[#1a1814] ring-offset-1 ring-offset-[#f7f4ef]'
                  : 'opacity-50 hover:opacity-80',
              ].join(' ')}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                alt={img.altText || `Product image ${i + 1}`}
                aspectRatio="1/1"
                data={img}
                sizes="64px"
                className="w-full h-full object-cover mix-blend-multiply bg-[#ede9e2]"
              />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators (mobile) */}
      {allImages.length > 1 && (
        <div className="flex justify-center gap-1.5 lg:hidden">
          {allImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={[
                'rounded-full transition-all duration-200',
                i === activeIndex
                  ? 'w-4 h-1.5 bg-[#1a1814]'
                  : 'w-1.5 h-1.5 bg-[#1a1814]/25',
              ].join(' ')}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
