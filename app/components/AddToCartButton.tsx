// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable react-hooks/rules-of-hooks */
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {useEffect, useState, useRef} from 'react';
import {Loader2, ShoppingBag} from 'lucide-react';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  afterAddToCart,
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  afterAddToCart?: () => void;
}) {
  const [addedToCart, setAddedToCart] = useState<boolean>(false);
  // Keep track of the previous fetcher state to detect when a submission finishes
  const prevStateRef = useRef<string>('idle');

  // Reset success message after 2.5 seconds
  useEffect(() => {
    if (addedToCart) {
      const timeout = setTimeout(() => setAddedToCart(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [addedToCart]);

  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => {
        const isSubmitting = fetcher.state === 'submitting';
        const hasErrors =
          fetcher.data?.errors && fetcher.data.errors.length > 0;
        const isSuccess =
          fetcher.state === 'idle' &&
          prevStateRef.current === 'submitting' &&
          !hasErrors &&
          fetcher.data; // data exists after a submission

        // Detect successful addition and trigger side effects
        useEffect(() => {
          if (isSuccess) {
            setAddedToCart(true);
            afterAddToCart?.();
          }
        }, [isSuccess]);

        // Update the previous state ref after every render
        useEffect(() => {
          prevStateRef.current = fetcher.state;
        }, [fetcher.state]);

        return (
          <>
            <input
              name="analytics"
              type="hidden"
              value={JSON.stringify(analytics)}
            />
            <button
              type="submit"
              onClick={onClick}
              disabled={disabled ?? isSubmitting}
              className={`w-full text-white font-source text-base transition-all duration-300 ease-in-out flex items-center
                 justify-center gap-3 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 
                 before:w-full before:h-full before:bg-white/10 before:-translate-x-full hover:before:translate-x-full 
                 before:transition-transform before:duration-700 disabled:before:hidden tracking-wider py-5 px-8 bg-brand-navy
                  hover:bg-brand-navyLight disabled:bg-brand-gray disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Adding...</span>
                </>
              ) : addedToCart ? (
                'Added ✓'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-medium">{children}</span>
                </>
              )}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}
