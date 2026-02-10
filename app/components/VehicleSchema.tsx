// Vehicle/Product Schema Component for SEO
// Use this component on individual vehicle pages

interface VehicleSchemaProps {
  name: string;
  description: string;
  brand: string;
  model: string;
  image: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  fuelType?: string;
  numberOfDoors?: number;
  seatingCapacity?: number;
  transmission?: 'Manual' | 'Automatic';
}

export default function VehicleSchema({
  name,
  description,
  brand,
  model,
  image,
  price,
  currency = 'EUR',
  availability = 'InStock',
  fuelType,
  numberOfDoors,
  seatingCapacity,
  transmission,
}: VehicleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://hit-rent.com/vehicles/${model.toLowerCase().replace(/\s/g, '-')}`,
    name: name,
    description: description,
    image: image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    model: model,
    offers: {
      '@type': 'Offer',
      url: `https://hit-rent.com/vehicles/${model.toLowerCase().replace(/\s/g, '-')}`,
      priceCurrency: currency,
      price: price,
      availability: `https://schema.org/${availability}`,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      seller: {
        '@type': 'Organization',
        name: 'Family Rent a Car Croatia',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
    },
    additionalProperty: [
      ...(fuelType
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Fuel Type',
              value: fuelType,
            },
          ]
        : []),
      ...(numberOfDoors
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Number of Doors',
              value: numberOfDoors,
            },
          ]
        : []),
      ...(seatingCapacity
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Seating Capacity',
              value: seatingCapacity,
            },
          ]
        : []),
      ...(transmission
        ? [
            {
              '@type': 'PropertyValue',
              name: 'Transmission',
              value: transmission,
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Example usage:
// <VehicleSchema
//   name="BMW 3 Series Rental"
//   description="Premium BMW 3 Series available for rent in Croatia"
//   brand="BMW"
//   model="3 Series"
//   image="https://hit-rent.com/img/cars/bmw-3-series.jpg"
//   price={45}
//   fuelType="Diesel"
//   numberOfDoors={4}
//   seatingCapacity={5}
//   transmission="Automatic"
// />
