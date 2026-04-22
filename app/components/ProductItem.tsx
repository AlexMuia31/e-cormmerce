import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const secondImage = product.images?.nodes?.[1]; // Second image (index 1)

  return (
    <Link
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      className="group bg-brand-cream rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block"
    >
      {/* Image container with hover swap */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {/* First image (default) */}
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              secondImage ? 'group-hover:opacity-0' : ''
            }`}
          />
        )}

        {/* Second image (on hover) */}
        {secondImage && (
          <Image
            alt={secondImage.altText || product.title}
            aspectRatio="1/1"
            data={secondImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        )}
      </div>

      {/* Product info */}
      <div className="p-5">
        <h4 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h4>
        <div className="text-xl font-bold text-amber-700">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
