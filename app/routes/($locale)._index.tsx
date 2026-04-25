import {Await, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/_index';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {ProductItem} from '~/components/ProductItem';

// --- Types for new sections ---
interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

interface CraftsmanshipData {
  title: string;
  description: string;
  image: string;
  stats: Array<{label: string; value: string}>;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

export const meta: Route.MetaFunction = () => {
  return [{title: 'Artisan Home | Handcrafted Goods'}];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  // Static content for hero, craftsmanship, testimonials
  const hero: HeroData = {
    title: 'Timeless Craftsmanship',
    subtitle:
      'Discover heirloom-quality pieces made by master artisans around the world',
    ctaText: 'Explore Collection',
    ctaLink: '/collections/all',
    backgroundImage:
      'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
  };

  const craftsmanship: CraftsmanshipData = {
    title: 'Where heritage meets modern design',
    description:
      'Each piece in our collection is thoughtfully crafted by skilled artisans who have honed their techniques over generations. We travel the world to find the most exceptional materials and time-honored methods, then collaborate with makers to create pieces that tell a story. From hand-turned wood to hand-thrown ceramics, every item carries the mark of its maker.',
    image:
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
    stats: [
      {label: 'Artisan Partners', value: '120+'},
      {label: 'Years of Heritage', value: '50+'},
      {label: 'Craft Techniques', value: '24'},
      {label: 'Countries Sourced', value: '18'},
    ],
  };

  const testimonials: Testimonial[] = [
    {
      id: 't1',
      name: 'Elena Rodriguez',
      role: 'Interior Designer',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: 'The attention to detail in every piece is remarkable. My clients are always impressed by the unique character of these handcrafted items.',
      rating: 5,
    },
    {
      id: 't2',
      name: 'David Chen',
      role: 'Verified Buyer',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: 'I purchased the walnut bowl and it’s stunning. You can feel the quality and see the craftsmanship in every curve.',
      rating: 5,
    },
    {
      id: 't3',
      name: 'Sophia Laurent',
      role: 'Product Designer',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      text: 'Finally, a brand that values real craftsmanship over mass production. Each piece has its own subtle variations that make it special.',
      rating: 4,
    },
  ];

  return {
    ...deferredData,
    ...criticalData,
    hero,
    craftsmanship,
    testimonials,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const [{collections}] = await Promise.all([
    context.storefront.query(FEATURED_COLLECTION_QUERY),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {
    featuredCollection: collections.nodes[0],
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const recommendedProducts = context.storefront
    .query(RECOMMENDED_PRODUCTS_QUERY)
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    recommendedProducts,
  };
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="home bg-white">
      {/* Hero section */}
      <HeroSection hero={data.hero} />

      {/* Featured Collection */}
      <FeaturedCollection collection={data.featuredCollection} />

      {/* Recommended products */}
      <RecommendedProducts products={data.recommendedProducts} />

      {/* Craftsmanship */}
      <CraftsmanshipSection data={data.craftsmanship} />

      {/* Testimonials */}
      <TestimonialsSection testimonials={data.testimonials} />
    </div>
  );
}

// --- Hero Section ---
function HeroSection({hero}: {hero: HeroData}) {
  return (
    <section className="relative h-[85vh] min-h-150 flex items-center justify-center text-white overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.backgroundImage}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wide">
            Since 1972
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
            {hero.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={hero.ctaLink}
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {hero.ctaText}
            </Link>
            <Link
              to="/pages/about"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Our Story
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

// --- Craftsmanship Section ---
function CraftsmanshipSection({data}: {data: CraftsmanshipData}) {
  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <div>
            <span className="text-sm uppercase tracking-wider text-amber-600 font-semibold">
              Our Philosophy
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mt-2 mb-6 text-gray-900 leading-tight">
              {data.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {data.description}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {data.stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className="border-l-4 border-amber-500 pl-4"
                >
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/pages/craftsmanship"
              className="inline-flex items-center gap-2 text-gray-900 font-medium border-b-2 border-gray-900 pb-1 hover:gap-3 transition-all"
            >
              Discover our process
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>

          {/* Image with decorative badge */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={data.image}
                alt="Artisan at work"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-amber-100 rounded-xl p-4 shadow-lg max-w-45 backdrop-blur-sm">
              <p className="text-sm font-medium text-amber-800">
                True luxury is time well made
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Testimonials Section ---
function TestimonialsSection({testimonials}: {testimonials: Testimonial[]}) {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm uppercase tracking-wider text-amber-600 font-semibold">
            Kind Words
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2 mb-4 text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy customers who&apos;ve discovered the beauty
            of handmade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={`star-${i}`}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? 'text-amber-400'
                        : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote text */}
              <div className="grow">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {testimonial.text}&quot;
                </p>
              </div>

              {/* Author info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/pages/reviews"
            className="inline-flex items-center gap-2 text-amber-700 font-medium hover:gap-3 transition-all"
          >
            Read all 500+ reviews
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// --- Existing FeaturedCollection (improved styling) ---
function FeaturedCollection({
  collection,
}: {
  collection: FeaturedCollectionFragment & {description?: string | null};
}) {
  if (!collection) return null;
  const image = collection?.image;
  const description = collection.description ?? '';
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          {image && (
            <div className="relative overflow-hidden rounded-2xl shadow-xl group">
              <Image
                data={image}
                sizes="100vw"
                className="w-full h-full object-cover aspect-4/3 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
          )}

          {/* Text side */}
          <div className="text-center lg:text-left">
            <span className="text-sm uppercase tracking-wider text-amber-600 font-semibold">
              Featured Collection
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2 mb-4 text-gray-900">
              {collection.title}
            </h2>
            {description ? (
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {description}
              </p>
            ) : null}
            <Link
              to={`/collections/${collection.handle}`}
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-md hover:shadow-lg"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- Existing RecommendedProducts (improved styling) ---
function RecommendedProducts({
  products,
}: {
  products: Promise<RecommendedProductsQuery | null>;
}) {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
            Recommended Products
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Hand-picked pieces that complement your style
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-12 text-gray-500">Loading...</div>
          }
        >
          <Await resolve={products}>
            {(response) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {response
                  ? response.products.nodes.map((product) => (
                      <ProductItem key={product.id} product={product} />
                    ))
                  : null}
              </div>
            )}
          </Await>
        </Suspense>

        <div className="text-center mt-12">
          <Link
            to="/collections/all"
            className="inline-block border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment ProductItemFragment on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first:2){
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...ProductItemFragment
      }
    }
  }
` as const;
