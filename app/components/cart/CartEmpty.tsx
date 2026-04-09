import {ShoppingBag} from 'lucide-react';
import {Link} from 'react-router';
import {useAside} from '../Aside';
import type {CartMainProps} from './CartMain';

export function CartEmpty({
  hidden = false,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div
      hidden={hidden}
      className="flex flex-col items-center justify-center text-center px-6 py-12 min-h-[60vh]"
    >
      {/* Icon */}
      <div className="w-24 h-24 mb-6 rounded-full bg-brand-cream flex items-center justify-center">
        <ShoppingBag className="w-10 h-10 text-gray-400" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h3 className="text-xl font-playfair text-gray-900 mb-2">
        Your cart is empty
      </h3>

      {/* Description */}
      <p className="text-gray-500 mb-8 max-w-xs">
        Looks like you haven&rsquo;t added anything yet. Let&rsquo;s get you
        started!
      </p>

      {/* CTA Button */}
      <Link
        to="/collections/all"
        onClick={close}
        prefetch="viewport"
        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-navy hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        Continue shopping →
      </Link>

      {/* Contact Information Section */}
      <div className="mt-8 pt-6 border-t border-gray-200 w-full max-w-xs">
        <p className="text-sm text-gray-500 mb-2">Need assistance?</p>
        <p className="text-sm text-gray-500">
          Email us at{' '}
          <a
            href="mailto:support@example.com"
            className="text-brand-navy hover:underline"
          >
            support@example.com
          </a>{' '}
          or call{' '}
          <a href="tel:+1234567890" className="text-brand-navy hover:underline">
            (123) 456-7890
          </a>
        </p>
        <p className="text-xs text-gray-400 mt-2">Mon–Fri, 9am–6pm (EST)</p>
      </div>
    </div>
  );
}
