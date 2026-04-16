import {CartForm} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useState} from 'react';

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
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
              <div className="flex items-center gap-2">
                <code className="rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {codes.join(', ')}
                </code>
                <button
                  type="submit"
                  aria-label="Remove discount"
                  className="text-sm font-medium text-red-500 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 rounded"
                >
                  Remove
                </button>
              </div>
            </UpdateDiscountForm>
          </dd>
        </dl>
      )}

      {/* Add discount button (only shown when input is hidden and no discount applied?) 
          We always show it, but if there's already a discount, we still allow adding another? 
          Shopify typically supports only one discount code. So we can hide the button if a discount exists,
          or keep it but clear the existing one. For better UX, we'll show it only when no discount is applied,
          and also hide it when the input is open. */}
      {!hasDiscounts && !isAddingDiscount && (
        <button
          onClick={() => setIsAddingDiscount(true)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded"
        >
          + Add discount code
        </button>
      )}

      {/* Discount code input (visible when toggled on) */}
      {isAddingDiscount && !hasDiscounts && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <UpdateDiscountForm discountCodes={codes}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="discount-code-input" className="sr-only">
                Discount code
              </label>
              <input
                id="discount-code-input"
                type="text"
                name="discountCode"
                placeholder="Enter code"
                className="block w-full rounded-md border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-1"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  aria-label="Apply discount code"
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </UpdateDiscountForm>
          <p className="mt-2 text-xs text-gray-400">
            Limited to one discount code per order.
          </p>
        </div>
      )}
    </div>
  );
}
