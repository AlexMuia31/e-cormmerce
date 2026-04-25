import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

function loadDeferredData({context, params}: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  return (
    <div className="min-h-screen bg-[#f7f4ef] font-serif text-[#1a1814]">
      <div className="grid grid-cols-1 lg:grid-cols-2 pt-20">
        {/* ── Left: sticky image panel ── */}
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] bg-[#ede9e2] flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center p-12 [&_img]:max-w-full [&_img]:max-h-full [&_img]:object-contain [&_img]:mix-blend-multiply [&_img]:transition-transform [&_img]:duration-700 [&_img]:hover:scale-[1.02]">
            <ProductImage
              images={product.images.nodes.map(
                (node: {
                  id: any;
                  url: any;
                  altText: any;
                  width: any;
                  height: any;
                }) => ({
                  id: node.id,
                  url: node.url,
                  altText: node.altText,
                  width: node.width,
                  height: node.height,
                }),
              )}
              selectedVariantImage={undefined}
            />
          </div>
        </div>

        {/* ── Right: product details ── */}
        <div className="flex flex-col px-8 py-16 lg:px-14 lg:py-20 border-l border-black/10">
          {/* Vendor / breadcrumb */}
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#6b6760] mb-5">
            {product.vendor}&nbsp;&nbsp;/&nbsp;&nbsp;Collection
          </p>

          {/* Title */}
          <h1 className="text-5xl font-light leading-[1.08] tracking-tight text-[#1a1814] mb-2">
            {title}
          </h1>

          {/* Price */}
          <div
            className="flex items-baseline gap-3 mt-5 mb-8 pb-8 border-b border-black/10
            [&_.price]:font-serif [&_.price]:text-2xl [&_.price]:font-normal [&_.price]:tracking-wide
            [&_.compare-at-price]:font-mono [&_.compare-at-price]:text-sm [&_.compare-at-price]:text-[#b8b4ae] [&_.compare-at-price]:line-through"
          >
            <ProductPrice
              price={selectedVariant?.price}
              compareAtPrice={selectedVariant?.compareAtPrice}
            />
          </div>

          {/* Product form — variant selectors + add to cart */}
          {/*
            Tailwind arbitrary variant selectors target Hydrogen's generated markup.
            Adjust the selectors (e.g. [&_.product-options-item__label]) to match
            whatever class names your ProductForm component actually renders.
          */}
          <div
            className="
            [&_label]:font-mono [&_label]:text-[9px] [&_label]:tracking-[0.16em] [&_label]:uppercase [&_label]:text-[#6b6760] [&_label]:block [&_label]:mb-2.5
            [&_button]:font-mono [&_button]:text-[10px] [&_button]:tracking-[0.08em]
            [&_button]:border [&_button]:border-black/15 [&_button]:bg-transparent [&_button]:text-[#1a1814]
            [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-none
            [&_button]:transition-all [&_button]:duration-200
            hover:[&_button]:border-[#1a1814] hover:[&_button]:bg-[#ede9e2]
            [&_button[data-selected]]:bg-[#1a1814] [&_button[data-selected]]:text-[#f7f4ef] [&_button[data-selected]]:border-[#1a1814]
            [&_button[type=submit]]:w-full [&_button[type=submit]]:bg-[#1a1814] [&_button[type=submit]]:text-[#f7f4ef]
            [&_button[type=submit]]:border-0 [&_button[type=submit]]:py-4
            [&_button[type=submit]]:tracking-[0.18em] [&_button[type=submit]]:uppercase [&_button[type=submit]]:mt-5
            hover:[&_button[type=submit]]:bg-[#8a6e3a] hover:[&_button[type=submit]]:-translate-y-px
          "
          >
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

          {/* Accent divider */}
          <div className="w-10 h-px bg-[#c8a96e] my-10" />

          {/* Description */}
          <p className="font-mono text-[9px] tracking-[0.18em] uppercase text-[#6b6760] mb-4">
            About this piece
          </p>
          <div
            className="font-serif text-base font-light leading-[1.9] text-[#6b6760] [&_p]:mb-4 [&_strong]:text-[#1a1814] [&_strong]:font-normal"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />

          {/* Trust strip */}
          <div className="flex gap-8 mt-auto pt-8 border-t border-black/10">
            {[
              {title: 'Free shipping', sub: 'Orders over $75'},
              {title: 'Easy returns', sub: '30-day window'},
              {title: 'Secure checkout', sub: 'SSL encrypted'},
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#1a1814]">
                  {item.title}
                </span>
                <span className="font-serif text-sm text-[#6b6760]">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first:10) {
      nodes {
        id
        altText
        url
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
