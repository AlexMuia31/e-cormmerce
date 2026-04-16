import {Suspense, useState} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-brand-navy py-12 text-center text-white">
          Loading footer...
        </div>
      }
    >
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="bg-brand-navy text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Main footer grid */}
              <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12">
                {/* Brand / About column */}
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-bold tracking-tight text-brand-gold">
                    {header.shop.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-300">
                    Your go‑to destination for quality products. Designed with
                    care and shipped worldwide.
                  </p>
                </div>

                {/* Menu links (dynamic from footer menu) */}
                <div className="md:col-span-4">
                  {footer?.menu && (
                    <FooterMenu
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain?.url || ''}
                      publicStoreDomain={publicStoreDomain}
                    />
                  )}
                </div>

                {/* Newsletter signup */}
                <div className="md:col-span-4">
                  <NewsletterSection />
                </div>
              </div>

              {/* Copyright bar */}
              <div className="border-t border-gray-700 py-6 text-center text-sm text-gray-400">
                <p>
                  &copy; {new Date().getFullYear()} {header.shop.name}. All
                  rights reserved.
                </p>
              </div>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

// ---------- Footer Menu (enhanced with columns) ----------
function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  const menuItems = (menu || FALLBACK_FOOTER_MENU).items;

  // Split items into two columns for better layout (optional)
  const midPoint = Math.ceil(menuItems.length / 2);
  const firstColumn = menuItems.slice(0, midPoint);
  const secondColumn = menuItems.slice(midPoint);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        {firstColumn.map((item) => (
          <FooterLink
            key={item.id}
            item={item}
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
          />
        ))}
      </div>
      <div className="space-y-3">
        {secondColumn.map((item) => (
          <FooterLink
            key={item.id}
            item={item}
            primaryDomainUrl={primaryDomainUrl}
            publicStoreDomain={publicStoreDomain}
          />
        ))}
      </div>
    </div>
  );
}

function FooterLink({
  item,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  item: any;
  primaryDomainUrl: string;
  publicStoreDomain: string;
}) {
  if (!item.url) return null;

  // Normalize internal URLs
  const url =
    item.url.includes('myshopify.com') ||
    item.url.includes(publicStoreDomain) ||
    item.url.includes(primaryDomainUrl)
      ? new URL(item.url).pathname
      : item.url;

  const isExternal = !url.startsWith('/');

  const linkClasses =
    'text-sm text-gray-300 transition hover:text-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 rounded';

  if (isExternal) {
    return (
      <a
        href={url}
        key={item.id}
        rel="noopener noreferrer"
        target="_blank"
        className={linkClasses}
      >
        {item.title}
      </a>
    );
  }

  return (
    <NavLink
      end
      key={item.id}
      prefetch="intent"
      to={url}
      className={linkClasses}
    >
      {({isActive, isPending}) => (
        <span
          style={{
            fontWeight: isActive ? 'bold' : undefined,
            color: isPending ? 'grey' : undefined,
          }}
        >
          {item.title}
        </span>
      )}
    </NavLink>
  );
}

// ---------- Newsletter Section ----------
function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    // Simulate API call – replace with your actual newsletter endpoint
    try {
      // Example: await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) })
      new Promise((resolve) => setTimeout(resolve, 1000))
        .then(() => {
          // Success
          setStatus('success');
          setMessage('Thanks for subscribing! 🎉');
          setEmail('');
          // Reset success message after 3 seconds
          setTimeout(() => setStatus('idle'), 3000);
        })
        .catch(() => {
          setStatus('error');
          setMessage('Something went wrong. Please try again.');
        });
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-brand-gold">
        Stay in the loop
      </h3>
      <p className="mt-1 text-sm text-gray-300">
        Get exclusive offers, new arrivals, and tips straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            disabled={status === 'loading'}
            className="flex-1 rounded-lg border-gray-600 bg-gray-800 px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-navy transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 disabled:opacity-70"
          >
            {status === 'loading' ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
        {message && (
          <p
            className={`mt-2 text-xs ${
              status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

// ---------- Fallback menu (kept from original) ----------
const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};
