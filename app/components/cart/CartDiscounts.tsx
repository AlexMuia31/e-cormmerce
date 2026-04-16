import {CartForm} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useState} from 'react';

// Updated to expose form state to children
function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children:
    | React.ReactNode
    | ((props: {state: 'idle' | 'submitting' | 'loading'}) => React.ReactNode);
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {({state}) =>
        typeof children === 'function' ? children({state}) : children
      }
    </CartForm>
  );
}

export function CartDiscounts({
  discountCodes,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const hasDiscounts = codes.length > 0;

  const handleCancel = () => {
    setIsAddingDiscount(false);
  };

  return (
    <div className="space-y-4">
      {/* Applied discount(s) */}
      {hasDiscounts && (
        <dl className="m-0 flex items-center justify-between text-sm">
          <dt className="font-medium text-gray-600">Discounts applied</dt>
          <dd>
            <UpdateDiscountForm discountCodes={codes}>
              {({state}) => (
                <div className="flex items-center gap-2">
                  <code className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {codes.join(', ')}
                  </code>
                  <button
                    type="submit"
                    aria-label="Remove discount"
                    disabled={state !== 'idle'}
                    className="text-sm font-medium text-red-500 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state !== 'idle' ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              )}
            </UpdateDiscountForm>
          </dd>
        </dl>
      )}

      {/* Add discount button (shown only when no discount and input hidden) */}
      {!hasDiscounts && !isAddingDiscount && (
        <button
          onClick={() => setIsAddingDiscount(true)}
          className="text-sm font-medium text-brand-gold transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded"
        >
          + Add discount code
        </button>
      )}

      {/* Discount code input (visible when toggled on) */}
      {isAddingDiscount && !hasDiscounts && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <UpdateDiscountForm discountCodes={codes}>
            {({state}) => {
              const isSubmitting = state !== 'idle';
              return (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label htmlFor="discount-code-input" className="sr-only">
                    Discount code
                  </label>
                  <input
                    id="discount-code-input"
                    type="text"
                    name="discountCode"
                    placeholder="Enter code"
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed sm:flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      aria-label="Apply discount code"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-1 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Applying...
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-red-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }}
          </UpdateDiscountForm>
          <p className="mt-2 text-xs text-gray-400">
            Limited to one discount code per order.
          </p>
        </div>
      )}
    </div>
  );
}
