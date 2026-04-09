import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartLayout, LineItemChildrenMap} from './CartMain';
import {CartForm, Image, type OptimisticCartLine} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from '../ProductPrice';
import {useAside} from '../Aside';
import type {
  CartApiQueryFragment,
  CartLineFragment,
} from 'storefrontapi.generated';
import {CartLineQuantity} from './CartLineQuantityAdjustor';

export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineItem({
  layout,
  line,
  childrenMap,
}: {
  layout: CartLayout;
  line: CartLine;
  childrenMap: LineItemChildrenMap;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const lineItemChildren = childrenMap[id];
  const childrenLabelId = `cart-line-children-${id}`;

  return (
    <li key={id} className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex gap-4 sm:gap-6">
        {/* Product Image */}
        {image && (
          <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-md overflow-hidden bg-gray-100">
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              loading="lazy"
              width={100}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Product Details */}
        <div className="flex-1 flex flex-col gap-1.5">
          <Link
            prefetch="intent"
            to={lineItemUrl}
            onClick={() => {
              if (layout === 'aside') {
                close();
              }
            }}
            className="hover:underline"
          >
            <h3 className="font-playfair text-base font-medium text-brand-navy sm:text-lg">
              {product.title}
            </h3>
          </Link>

          <div className="text-gray-700">
            <ProductPrice price={line?.cost?.totalAmount} />
          </div>

          {/* Variant options */}
          {selectedOptions.length > 0 && (
            <ul className="text-sm text-gray-500 space-y-0.5">
              {selectedOptions.map((option) => (
                <li key={option.name}>
                  <span className="font-medium">{option.name}:</span>{' '}
                  {option.value}
                </li>
              ))}
            </ul>
          )}

          {/* Quantity controls */}
          <div className="mt-2">
            <CartLineQuantity line={line} />
          </div>
        </div>
      </div>

      {/* Nested children lines (warranty, gift wrap, etc.) */}
      {lineItemChildren ? (
        <div className="mt-4 pl-4 sm:pl-8 border-l-2 border-gray-100">
          <p id={childrenLabelId} className="sr-only">
            Line items with {product.title}
          </p>
          <ul aria-labelledby={childrenLabelId} className="space-y-4">
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
