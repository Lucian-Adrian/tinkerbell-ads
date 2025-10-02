// Guerrilla Marketing Seed Keywords
// These seeds ensure diverse and unique script ideas

export const GUERRILLA_SEEDS = [
  'unconventional_approach',
  'surprise_element',
  'emotional_hook',
  'problem_agitate_solve',
  'contrarian_viewpoint',
  'social_proof_extreme',
  'urgency_scarcity',
  'curiosity_gap',
  'transformation_story',
  'insider_secret',
  'myth_busting',
  'before_after_dramatic',
  'challenge_accepted',
  'exclusive_access',
  'hidden_benefit',
  'reverse_psychology',
  'fear_of_missing_out',
  'aspirational_identity',
  'pain_amplification',
  'unique_mechanism',
] as const

export type GuerrillaSeed = typeof GUERRILLA_SEEDS[number]

// Seed descriptions for context
export const SEED_DESCRIPTIONS: Record<string, string> = {
  unconventional_approach: 'Break industry norms with unexpected solutions',
  surprise_element: 'Shock value that captures attention instantly',
  emotional_hook: 'Tap into deep emotions and personal stories',
  problem_agitate_solve: 'Identify pain, make it worse, then offer relief',
  contrarian_viewpoint: 'Challenge common beliefs and assumptions',
  social_proof_extreme: 'Overwhelming evidence of success and popularity',
  urgency_scarcity: 'Limited time or availability creates FOMO',
  curiosity_gap: 'Create a knowledge gap that demands to be filled',
  transformation_story: 'Dramatic before/after success narratives',
  insider_secret: 'Reveal what industry insiders don\'t want you to know',
  myth_busting: 'Debunk common myths and misconceptions',
  before_after_dramatic: 'Show extreme transformation visually',
  challenge_accepted: 'Dare your audience to try and prove it',
  exclusive_access: 'VIP treatment and insider opportunities',
  hidden_benefit: 'Reveal unexpected advantages',
  reverse_psychology: 'Tell them NOT to do it (making them want it)',
  fear_of_missing_out: 'Everyone else is doing it, why aren\'t you?',
  aspirational_identity: 'Become the person you want to be',
  pain_amplification: 'Make the problem feel unbearable',
  unique_mechanism: 'A special method that only we have',
}

// Get a seed by index (for batch rotation)
export function getSeedByIndex(index: number): GuerrillaSeed {
  return GUERRILLA_SEEDS[index % GUERRILLA_SEEDS.length]
}

// Get random seed
export function getRandomSeed(): GuerrillaSeed {
  return GUERRILLA_SEEDS[Math.floor(Math.random() * GUERRILLA_SEEDS.length)]
}

// Get seed description
export function getSeedDescription(seed: GuerrillaSeed): string {
  return SEED_DESCRIPTIONS[seed] || ''
}
