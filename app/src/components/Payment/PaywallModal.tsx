'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useConversationStore } from '@/store/conversationStore';

const tiers = [
  {
    id: 1,
    name: 'Personal Deep Dive',
    price: 9,
    description: 'Your complete numerology profile',
    features: [
      'Full personal numerology profile',
      'Year ahead forecast with key dates',
      'Lucky numbers, colors & elements',
      'Career alignment analysis',
    ],
  },
  {
    id: 2,
    name: 'Relationship Matrix',
    price: 19,
    popular: true,
    description: 'Unlock your compatibility secrets',
    features: [
      'Everything in Personal Deep Dive',
      'Full compatibility analysis',
      'Communication style guide',
      'Conflict resolution insights',
      '"Soul Contract" reading',
    ],
  },
  {
    id: 3,
    name: 'Inner Circle',
    price: 29,
    description: 'Understand all your relationships',
    features: [
      'Everything in Relationship Matrix',
      'Add up to 5 people',
      'Family dynamics analysis',
      '"Who to trust" readings',
      'Relationship web visualization',
    ],
  },
];

export default function PaywallModal() {
  const [selectedTier, setSelectedTier] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setPaid, otherPerson, compatibility, addOracleMessages, setPhase } =
    useConversationStore();

  const handlePurchase = async () => {
    setIsProcessing(true);

    // Simulate payment processing
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-3xl bg-gradient-to-br from-[#0a0a1a] to-[#1a0a2e] rounded-2xl border border-[#d4af37]/30 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#d4af37]/20 text-center">
            <h2 className="text-2xl font-semibold text-white">
              Unlock Your Complete Reading
            </h2>
            <p className="text-white/60 mt-1">
              The Oracle has revealed much. Will you see the full picture?
            </p>
          </div>

          {/* Tiers */}
          <div className="p-6 grid md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <motion.button
                key={tier.id}
                whileHover={{ scale: 1.02 }}
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

                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#d4af37]">
                    ${tier.price}
                  </span>
                  <span className="text-white/40 ml-1">one-time</span>
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

          {/* CTA */}
          <div className="px-6 py-5 border-t border-[#d4af37]/20 bg-black/20">
            <motion.button
              whileHover={{ scale: 1.02 }}
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

            <p className="text-center text-xs text-white/40 mt-3">
              Secure payment • Instant access • 30-day guarantee
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
