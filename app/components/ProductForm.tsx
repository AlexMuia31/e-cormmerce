import {Link, useNavigate} from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  return (
    <div className="product-form space-y-8">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5 className="text-sm font-medium text-gray-900 mb-3">
              {option.name}
            </h5>
            <div className="product-options-grid flex flex-wrap gap-3">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                const commonClasses = `
                  relative flex items-center justify-center
                  min-w-[2.5rem] h-10 px-3 rounded-md
                  text-sm font-medium transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  ${selected ? 'ring-2 ring-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'}
                  ${!available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `;

                if (isDifferentProduct) {
                  // For child products that lead to a different URL (SEO anchor)
                  return (
                    <Link
                      key={option.name + name}
                      to={`/products/${handle}?${variantUriQuery}`}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      className={commonClasses}
                      aria-disabled={!available}
                      style={{opacity: available ? 1 : 0.4}}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // For same‑product variant change (button with JS navigation)
                  return (
                    <button
                      type="button"
                      key={option.name + name}
                      className={commonClasses}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected && exists) {
                          void navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                      aria-pressed={selected}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => open('cart')}
        lines={
          selectedVariant
            ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: 1,
                  selectedVariant,
                },
              ]
            : []
        }
      >
        <div>
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </div>
      </AddToCartButton>
    </div>
  );
}

// Optimized swatch component with better visuals
function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  // No swatch → show text label (e.g., "Small", "Large")
  if (!image && !color) {
    return <span className="truncate">{name}</span>;
  }

  // Color or image swatch
  return (
    <div
      className="w-6 h-6 rounded-full shadow-inner border border-gray-200 overflow-hidden"
      style={{backgroundColor: color || 'transparent'}}
      aria-label={name}
      title={name}
    >
      {image && (
        <img src={image} alt={name} className="w-full h-full object-cover" />
      )}
    </div>
  );
}
