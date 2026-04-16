import {CartForm} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

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

  const hasDiscounts = codes.length > 0;

  return (
    <div className="space-y-4">
      {/* Applied discount(s) – displayed as a removable badge */}
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

      {/* Add discount input – always visible, but visually grouped */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="discount-code-input" className="sr-only">
            Discount code
          </label>
          <input
            id="discount-code-input"
            type="text"
            name="discountCode"
            placeholder="Gift card or discount code"
            className="block w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:flex-1"
          />
          <button
            type="submit"
            aria-label="Apply discount code"
            className="inline-flex items-center justify-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </UpdateDiscountForm>

      {/* Optional helper text */}
      <p className="text-xs text-gray-400">
        Limited to one discount code per order.
      </p>
    </div>
  );
}
