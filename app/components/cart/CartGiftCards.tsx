import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

function AddGiftCardForm({
  fetcherKey,
  children,
}: {
  fetcherKey?: string;
  children: React.ReactNode | ((props: {state: string}) => React.ReactNode);
}) {
  return (
    <CartForm
      fetcherKey={fetcherKey}
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesAdd}
    >
      {({state}) =>
        typeof children === 'function' ? children({state}) : children
      }
    </CartForm>
  );
}

function RemoveGiftCardForm({
  giftCardId,
  children,
}: {
  giftCardId: string;
  children: React.ReactNode | ((props: {state: string}) => React.ReactNode);
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{
        giftCardCodes: [giftCardId],
      }}
    >
      {({state}) =>
        typeof children === 'function' ? children({state}) : children
      }
    </CartForm>
  );
}

export function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});
  const [isAddingGiftCard, setIsAddingGiftCard] = useState(false);

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current!.value = '';
      // Optionally hide the input after successful add?
      // We'll keep it open for multiple gift cards, but user can cancel.
    }
  }, [giftCardAddFetcher.data]);

  const hasGiftCards = giftCardCodes && giftCardCodes.length > 0;
  const isAdding = giftCardAddFetcher.state !== 'idle';

  const handleCancel = () => {
    setIsAddingGiftCard(false);
  };

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      {/* Applied gift cards section */}
      {hasGiftCards && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Gift cards applied
          </h3>
          <ul className="space-y-2">
            {giftCardCodes.map((giftCard) => (
              <li key={giftCard.id}>
                <RemoveGiftCardForm giftCardId={giftCard.id}>
                  {({state}) => {
                    const isRemoving = state !== 'idle';
                    return (
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-white px-2 py-0.5 font-mono text-xs text-gray-600 ring-1 ring-inset ring-gray-200">
                            ***{giftCard.lastCharacters}
                          </code>
                          <span className="text-gray-500">—</span>
                          <span className="font-medium text-gray-900">
                            <Money data={giftCard.amountUsed} />
                          </span>
                        </div>
                        <button
                          type="submit"
                          disabled={isRemoving}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRemoving ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    );
                  }}
                </RemoveGiftCardForm>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add gift card button (shown only when input is hidden) */}
      {!isAddingGiftCard && (
        <button
          onClick={() => setIsAddingGiftCard(true)}
          className="text-sm font-medium text-brand-gold transition hover:text-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 rounded"
        >
          + Add gift card
        </button>
      )}

      {/* Gift card input (visible when toggled on) */}
      {isAddingGiftCard && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <AddGiftCardForm fetcherKey="gift-card-add">
            {({state}) => {
              const isSubmitting = state !== 'idle';
              return (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label htmlFor="gift-card-input" className="sr-only">
                    Gift card code
                  </label>
                  <input
                    id="gift-card-input"
                    type="text"
                    name="giftCardCode"
                    placeholder="Enter gift card code"
                    ref={giftCardCodeInput}
                    disabled={isSubmitting}
                    className="block w-full rounded-md border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/20 disabled:bg-gray-100 disabled:cursor-not-allowed sm:flex-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-1 rounded-md bg-brand-navy px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-navy/50 disabled:opacity-70 disabled:cursor-not-allowed"
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
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }}
          </AddGiftCardForm>
          <p className="mt-2 text-xs text-gray-400">
            Gift cards are applied as store credit.
          </p>
        </div>
      )}
    </div>
  );
}
