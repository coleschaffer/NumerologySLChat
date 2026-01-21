'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useConversationStore } from '@/store/conversationStore';

interface PaywallModalProps {
  isPersonalOnly?: boolean;
}

const tiers = [
  {
    id: 1,
    name: 'Personal Deep Dive',
    price: 9,
    originalPrice: 47,
    description: 'Your complete numerology profile',
    features: [
      'All 6 core numbers decoded',
      'Year-ahead forecast with KEY DATES',
      'Career & purpose alignment',
      'Hidden talents revealed',
      'Lucky numbers, colors & elements',
    ],
  },
  {
    id: 2,
    name: 'Relationship Matrix',
    price: 19,
    originalPrice: 97,
    popular: true,
    description: 'Unlock your compatibility secrets',
    features: [
      'Everything in Personal Deep Dive',
      'Complete compatibility analysis',
      'The harmony points between you',
      'The warning signs to navigate',
      'Communication style translation',
      '"Soul Contract" reading',
    ],
  },
  {
    id: 3,
    name: 'Inner Circle',
    price: 29,
    originalPrice: 147,
    description: 'Understand all your relationships',
    features: [
      'Everything in Relationship Matrix',
      'Add up to 5 people to your matrix',
      'Family dynamics analysis',
      '"Who to trust" readings',
      'Relationship web visualization',
    ],
  },
];

const testimonials = [
  {
    quote: "The compatibility reading saved my marriage. We finally understood why we kept fighting about the same things.",
    name: "David M.",
    location: "Chicago, IL",
  },
  {
    quote: "It was like the Oracle knew things about my relationship that I hadn't even admitted to myself...",
    name: "Michelle K.",
    location: "Austin, TX",
  },
  {
    quote: "I've done numerology readings before, but nothing this specific. The critical dates have been eerily accurate.",
    name: "Sarah L.",
    location: "Denver, CO",
  },
];

export default function PaywallModal({ isPersonalOnly = false }: PaywallModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedTier, setSelectedTier] = useState(isPersonalOnly ? 1 : 2);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPaid, otherPerson, compatibility, addOracleMessages, setPhase } =
    useConversationStore();

  // Randomly select a testimonial
  const testimonial = testimonials[Math.floor(Math.random() * testimonials.length)];

  const handlePurchase = async () => {
    setIsProcessing(true);

    // Simulate payment processing (MVP - no actual payment)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setPaid(selectedTier);
    setPhase('paid_reading');

    // Deliver the reading
    if (compatibility && otherPerson) {
      await addOracleMessages([
        'The veil is lifted...',
        `Your compatibility with ${otherPerson.name} reveals itself.`,
        `Overall Harmony: ${compatibility.score}%`,
        `Communication: ${compatibility.areas.communication}% - ${getCompatibilityText(compatibility.areas.communication)}`,
        `Emotional Connection: ${compatibility.areas.emotional}% - ${getCompatibilityText(compatibility.areas.emotional)}`,
        `Physical Chemistry: ${compatibility.areas.physical}% - ${getCompatibilityText(compatibility.areas.physical)}`,
        `Long-term Potential: ${compatibility.areas.longTerm}% - ${getCompatibilityText(compatibility.areas.longTerm)}`,
        getCompatibilityAdvice(compatibility.level),
      ]);
    } else {
      // Personal reading only
      await addOracleMessages([
        'The complete picture emerges...',
        'Your numerology profile reveals patterns that have shaped your entire life.',
        'Use this knowledge wisely. The numbers show possibility, not fate.',
        'You have the power to align with your highest path.',
      ]);
    }

    setIsProcessing(false);
  };

  const getCompatibilityText = (score: number): string => {
    if (score >= 80) return 'Exceptional alignment';
    if (score >= 60) return 'Strong potential';
    if (score >= 40) return 'Requires awareness';
    return 'Challenging but growthful';
  };

  const getCompatibilityAdvice = (level: string): string => {
    switch (level) {
      case 'high':
        return 'This connection has powerful potential. The numbers suggest a deep, lasting bond if nurtured with intention.';
      case 'moderate':
        return 'This pairing offers growth through both harmony and healthy friction. Communication will be your greatest tool.';
      default:
        return 'This connection challenges you both to evolve. The friction you feel can become the fire that forges strength.';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full max-w-3xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] rounded-2xl border border-[#d4af37]/30 overflow-hidden my-4"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#d4af37]/20 text-center">
            <h2 className="text-2xl font-semibold text-white">
              {isPersonalOnly ? 'Your Complete Numerology Blueprint' : 'Your Complete Numerology Blueprint'}
            </h2>
            <p className="text-white/60 mt-1 text-sm">
              Most people pay $97+ for a professional numerology reading.
              <br />
              Your personalized Oracle reading is available now for a fraction of that.
            </p>
          </div>

          {/* Tiers */}
          <div className={`p-6 grid gap-4 ${isPersonalOnly ? 'md:grid-cols-1 max-w-md mx-auto' : 'md:grid-cols-3'}`}>
            {(isPersonalOnly ? tiers.filter(t => t.id === 1) : tiers).map((tier) => (
              <motion.button
                key={tier.id}
                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative p-5 rounded-xl text-left transition-all ${
                  selectedTier === tier.id
                    ? 'bg-[#d4af37]/10 border-2 border-[#d4af37]'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#d4af37] text-[#0a0a1a] text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="mb-3">
                  <h3 className="text-lg font-medium text-white">{tier.name}</h3>
                  <p className="text-sm text-white/50">{tier.description}</p>
                </div>

                {/* Price with anchoring */}
                <div className="mb-4">
                  <span className="text-white/40 line-through text-lg mr-2">
                    ${tier.originalPrice}
                  </span>
                  <span className="text-3xl font-bold text-[#d4af37]">
                    ${tier.price}
                  </span>
                  <span className="text-white/40 ml-1 text-sm">one-time</span>
                </div>

                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.button>
            ))}
          </div>

          {/* Testimonial */}
          <div className="px-6 pb-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-1 text-[#d4af37] mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/80 text-sm italic mb-2">"{testimonial.quote}"</p>
              <p className="text-white/50 text-xs">— {testimonial.name}, {testimonial.location}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-5 border-t border-[#d4af37]/20 bg-black/20">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b8941f] text-[#0a0a1a] font-semibold text-lg
                       hover:from-[#e0c04a] hover:to-[#c9a632] transition-all box-glow-gold disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Unlock for $${tiers.find((t) => t.id === selectedTier)?.price}`
              )}
            </motion.button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-4 text-white/50">
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>60-day guarantee</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Instant delivery</span>
              </div>
            </div>

            {/* Guarantee text */}
            <p className="text-center text-xs text-white/40 mt-4 max-w-md mx-auto">
              If your reading doesn't reveal at least one profound truth about yourself or your relationships,
              email us within 60 days for a complete refund. No questions asked.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
