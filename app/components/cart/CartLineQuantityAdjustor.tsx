import {CartForm, type OptimisticCartLine} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {Loader2} from 'lucide-react';
import {useFetcher} from 'react-router';
import {useEffect, useState} from 'react';

/**
 * Provides the controls to update the quantity of a line item in the cart.
 * These controls are disabled when the line item is new, and the server
 * hasn't yet responded that it was successfully added to the cart.
 */
export type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="text-sm text-gray-500">Quantity:</span>
      <div className="flex items-center gap-1">
        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            aria-label="Decrease quantity"
            disabled={quantity <= 1 || !!isOptimistic}
            name="decrease-quantity"
            value={prevQuantity}
            className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-150"
          >
            <span className="text-lg leading-none">−</span>
          </button>
        </CartLineUpdateButton>

        <span className="w-8 text-center text-sm font-medium text-gray-900">
          {quantity}
        </span>

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
            disabled={!!isOptimistic}
            className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors duration-150"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </CartLineUpdateButton>
      </div>

      <CartLineRemoveButton lineIds={[lineId]} disabled={!!isOptimistic} />
    </div>
  );
}

/**
 * A button that removes a line item from the cart. It is disabled
 * when the line item is new, and the server hasn't yet responded
 * that it was successfully added to the cart.
 */
function CartLineRemoveButton({
  lineIds,
  disabled,
}: {
  lineIds: string[];
  disabled: boolean;
}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="ml-2 text-sm text-red-600 hover:text-red-800 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded px-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline disabled:hover:text-red-600 transition-colors duration-150"
      >
        Remove
      </button>
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  const lineIds = lines.map((line) => line.id);
  const [updating, setUpdating] = useState<boolean>(false);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {(fetcher) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (fetcher.state === 'loading') {
            setUpdating(true);
          } else if (fetcher.state === 'idle') {
            setTimeout(() => setUpdating(false), 200);
          }
        }, [fetcher.state]);

        if (updating) {
          //loading state to prevent multiple rapid clicks; this is especially important for mobile where users may tap multiple times while waiting for a response
          return (
            <div className="relative inline-flex items-center justify-center">
              <div className="opacity-50 pointer-events-none">{children}</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
              </div>
            </div>
          );
        }

        return children;
      }}
    </CartForm>
  );
}

/**
 * Returns a unique key for the update action. This is used to make sure actions modifying the same line
 * items are not run concurrently, but cancel each other. For example, if the user clicks "Increase quantity"
 * and "Decrease quantity" in rapid succession, the actions will cancel each other and only the last one will run.
 * @param lineIds - line ids affected by the update
 * @returns
 */
function getUpdateKey(lineIds: string[]) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}
