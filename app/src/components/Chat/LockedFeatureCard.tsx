'use client';

import { motion } from 'framer-motion';

interface LockedSection {
  title: string;
  teaser?: string;
  tier?: 'basic' | 'premium' | 'ultimate';
}

interface LockedFeatureCardProps {
  sections: LockedSection[];
  onUnlock?: (tier: string) => void;
}

/**
 * Tier configurations for unlock buttons
 */
const tierConfig: Record<string, { label: string; color: string; bgGradient: string }> = {
  basic: {
    label: 'Basic Reading',
    color: '#d4af37',
    bgGradient: 'from-[#d4af37]/20 to-[#d4af37]/10',
  },
  premium: {
    label: 'Premium Reading',
    color: '#a855f7',
    bgGradient: 'from-[#a855f7]/20 to-[#a855f7]/10',
  },
  ultimate: {
    label: 'Ultimate Reading',
    color: '#f59e0b',
    bgGradient: 'from-[#f59e0b]/20 to-[#f59e0b]/10',
  },
};

/**
 * LockedFeatureCard - Displays locked premium content with blur effect
 *
 * Shows locked sections like "THE BOND", "YOUR STRENGTHS" as premium
 * content previews with a lock icon and unlock button.
 */
export default function LockedFeatureCard({ sections, onUnlock }: LockedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-4"
    >
      <div className="space-y-3">
        {sections.map((section, index) => {
          const tier = section.tier || 'premium';
          const config = tierConfig[tier];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${config.color}30`,
                boxShadow: `0 4px 20px ${config.color}10, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* Lock icon in top-right */}
              <div
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `${config.color}20`,
                  border: `1px solid ${config.color}40`,
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={config.color}
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Card content */}
              <div className="p-5">
                {/* Section title */}
                <h3
                  className="text-lg font-semibold uppercase tracking-wider mb-2"
                  style={{
                    color: config.color,
                    fontFamily: 'var(--font-cinzel), serif',
                    textShadow: `0 0 20px ${config.color}40`,
                  }}
                >
                  {section.title}
                </h3>

                {/* Blurred teaser content */}
                <div className="relative">
                  <p
                    className="text-white/40 text-sm leading-relaxed"
                    style={{
                      filter: 'blur(4px)',
                      userSelect: 'none',
                    }}
                  >
                    {section.teaser ||
                      'This section reveals deep insights about your numerological profile that could transform your understanding of your path...'}
                  </p>

                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 0%, rgba(10, 10, 26, 0.9) 100%)`,
                    }}
                  />
                </div>

                {/* Unlock button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUnlock?.(tier)}
                  className={`mt-4 w-full py-2.5 px-4 rounded-lg font-medium text-sm uppercase tracking-wider transition-all bg-gradient-to-r ${config.bgGradient}`}
                  style={{
                    border: `1px solid ${config.color}50`,
                    color: config.color,
                  }}
                >
                  Unlock with {config.label}
                </motion.button>
              </div>

              {/* Decorative corner elements */}
              <div
                className="absolute top-0 left-0 w-16 h-16 -translate-x-8 -translate-y-8 opacity-20"
                style={{
                  background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-24 h-24 translate-x-12 translate-y-12 opacity-10"
                style={{
                  background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/**
 * Detect locked section patterns in message content
 * Returns array of locked sections found, or empty array if none
 */
export function detectLockedSections(content: string): LockedSection[] {
  const sections: LockedSection[] = [];

  // Common locked section patterns (with or without markdown)
  const patterns = [
    { regex: /\*?\*?THE BOND\*?\*?/i, title: 'THE BOND', tier: 'premium' as const },
    { regex: /\*?\*?YOUR STRENGTHS\*?\*?/i, title: 'YOUR STRENGTHS', tier: 'basic' as const },
    { regex: /\*?\*?YOUR CHALLENGES\*?\*?/i, title: 'YOUR CHALLENGES', tier: 'basic' as const },
    { regex: /\*?\*?RELATIONSHIP DYNAMICS\*?\*?/i, title: 'RELATIONSHIP DYNAMICS', tier: 'premium' as const },
    { regex: /\*?\*?FUTURE PREDICTIONS\*?\*?/i, title: 'FUTURE PREDICTIONS', tier: 'ultimate' as const },
    { regex: /\*?\*?CAREER INSIGHTS\*?\*?/i, title: 'CAREER INSIGHTS', tier: 'premium' as const },
    { regex: /\*?\*?SOUL PURPOSE\*?\*?/i, title: 'SOUL PURPOSE', tier: 'ultimate' as const },
    { regex: /\*?\*?HIDDEN TALENTS\*?\*?/i, title: 'HIDDEN TALENTS', tier: 'basic' as const },
    { regex: /\*?\*?LIFE CYCLES\*?\*?/i, title: 'LIFE CYCLES', tier: 'premium' as const },
    { regex: /\*?\*?COMPATIBILITY SECRETS\*?\*?/i, title: 'COMPATIBILITY SECRETS', tier: 'ultimate' as const },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      // Extract a teaser if there's content after the title
      const match = content.match(new RegExp(`${pattern.regex.source}[:\\s]*([^*\\n]{20,100})`, 'i'));
      const teaser = match?.[1]?.trim();

      sections.push({
        title: pattern.title,
        teaser: teaser || undefined,
        tier: pattern.tier,
      });
    }
  }

  return sections;
}
