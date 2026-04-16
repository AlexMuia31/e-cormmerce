import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {CartLayout} from './CartMain';
import {CartForm, Money, type OptimisticCart} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';
import {CartDiscounts} from './CartDiscounts';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
};

export function CartSummary({cart, layout}: CartSummaryProps) {
  const isPageLayout = layout === 'page';
  const subtotalAmount = cart?.cost?.subtotalAmount?.amount;

  return (
    <div
      id="cart-summary"
      aria-labelledby="cart-summary-heading"
      className={`
        rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50
        transition-all duration-200 hover:shadow-md
        ${isPageLayout ? 'max-w-2xl mx-auto' : 'sticky top-24'}
      `}
    >
      {/* Header */}
      <div className="mb-6 border-b border-gray-100 pb-4">
        <h2
          id="cart-summary-heading"
          className="text-xl font-semibold tracking-tight text-gray-900"
        >
          Order summary
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Taxes and shipping calculated at checkout
        </p>
      </div>

      {/* Subtotal row */}
      <dl className="flex items-center justify-between py-2 text-base">
        <dt className="font-medium text-gray-700">Subtotal</dt>
        <dd className="text-lg font-semibold text-gray-900">
          {cart?.cost?.subtotalAmount ? (
            <Money data={cart.cost.subtotalAmount} />
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </dd>
      </dl>

      {/* Discounts & Gift Cards (with spacing and subtle styling) */}
      <div className="mt-3 space-y-3">
        <CartDiscounts discountCodes={cart?.discountCodes} />
        <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />
      </div>

      {/* Divider before checkout */}
      <div className="my-5 h-px bg-linear-to-r from-gray-100 via-gray-200 to-gray-100" />

      {/* Checkout button */}
      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />

      {/* Extra reassurance note (optional) */}
      <p className="mt-4 text-center text-xs text-gray-400">
        Secure checkout • 30‑day return policy
      </p>
    </div>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl?: string}) {
  if (!checkoutUrl) return null;

  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
    }
  }, [giftCardAddFetcher.data]);

  return (
    <div>
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cart-discount">
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
                &nbsp;
                <button type="submit">Remove</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </dl>
      )}

      <AddGiftCardForm fetcherKey="gift-card-add">
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit" disabled={giftCardAddFetcher.state !== 'idle'}>
            Apply
          </button>
        </div>
      </AddGiftCardForm>
    </div>
  );
}

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {children}
    </CartForm>
  );
}
