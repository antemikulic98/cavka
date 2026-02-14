'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What do I need to rent a car in Croatia?',
    answer: 'To rent a car with Family Rent a Car, you need a valid driver\'s license (held for at least 2 years), a passport or ID, and a credit card in the driver\'s name. International customers may need an International Driving Permit depending on their country of origin.',
  },
  {
    question: 'What is included in the rental price?',
    answer: 'Our rental prices include basic insurance (CDW - Collision Damage Waiver and TP - Theft Protection), unlimited mileage, 24/7 roadside assistance, and all applicable taxes. Additional coverage and extras can be added during booking.',
  },
  {
    question: 'Can I pick up the car at one location and return it to another?',
    answer: 'Yes! We offer one-way rentals across Croatia. You can pick up your car in Zagreb and return it in Split, Dubrovnik, or any other location we service. A one-way fee may apply depending on the route.',
  },
  {
    question: 'What is your fuel policy?',
    answer: 'We operate a full-to-full fuel policy. You receive the car with a full tank and return it full. This is the fairest and most transparent fuel policy, ensuring you only pay for the fuel you use.',
  },
  {
    question: 'Do you offer airport pickup and delivery?',
    answer: 'Absolutely! We provide free pickup and delivery services at major Croatian airports including Zagreb, Split, and Dubrovnik airports. We can also arrange delivery to your hotel or accommodation for your convenience.',
  },
  {
    question: 'What happens if I have an accident or breakdown?',
    answer: 'Your safety is our priority. We provide 24/7 roadside assistance. In case of an accident, contact us immediately and follow the instructions provided. All our vehicles come with comprehensive insurance coverage.',
  },
  {
    question: 'Can I cross borders with the rental car?',
    answer: 'Yes, border crossing is allowed to most European countries with prior approval. Please inform us during booking if you plan to cross borders, as additional documentation and insurance may be required.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'We offer flexible cancellation! You can cancel free of charge up to 48 hours before your pickup time. Cancellations made within 48 hours may incur a fee. Check our terms and conditions for full details.',
  },
  {
    question: 'Are there any age restrictions for renting a car?',
    answer: 'Drivers must be at least 21 years old to rent a car with us. Drivers under 25 may be subject to a young driver surcharge. Some premium vehicles may have higher age requirements (25+).',
  },
  {
    question: 'How do I modify or extend my reservation?',
    answer: 'You can easily modify your reservation by contacting us via email or phone. Extensions are subject to vehicle availability. We recommend contacting us as soon as possible if you need to make changes to your booking.',
  },
];

// Generate FAQ Schema for SEO
const generateFAQSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className='py-20 bg-white'>
      {/* FAQ Schema for SEO */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFAQSchema()) }}
      />

      <div className='container mx-auto px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Frequently Asked <span className='text-green-800'>Questions</span>
            </h2>
            <p className='text-gray-600 text-lg'>
              Find answers to common questions about renting a car with Family Rent a Car
            </p>
            <div className='w-24 h-1 bg-green-800 mx-auto rounded-full mt-4'></div>
          </div>

          {/* FAQ Items */}
          <div className='space-y-4'>
            {faqData.map((faq, index) => (
              <div
                key={index}
                className='bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden'
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className='w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-green-800 focus:ring-offset-2 rounded-xl'
                  aria-expanded={openIndex === index}
                >
                  <h3 className='text-lg font-semibold text-gray-900 pr-8'>
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-6 w-6 text-green-800 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0 overflow-hidden'
                  }`}
                >
                  <div className='px-6 pb-6 pt-4'>
                    <p className='text-gray-700 leading-relaxed'>{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className='mt-12 text-center'>
            <p className='text-gray-600 mb-4'>
              Still have questions? We're here to help!
            </p>
            <a
              href='mailto:info@hit-rent.com'
              className='inline-block bg-green-800 text-white font-semibold px-8 py-3 rounded-xl hover:bg-green-900 transition-colors shadow-lg hover:shadow-xl'
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
