// Temperature Configuration for Script Generation
// Varying temperature ensures diverse outputs

export const TEMPERATURE_SCHEDULE = [0.2, 0.35, 0.5, 0.65, 0.8] as const

export type Temperature = typeof TEMPERATURE_SCHEDULE[number]

// Temperature descriptions
export const TEMPERATURE_DESCRIPTIONS: Record<number, string> = {
  0.2: 'Very focused and conservative - sticks closely to patterns',
  0.35: 'Moderately focused - balanced with some creativity',
  0.5: 'Balanced - equal focus and creativity',
  0.65: 'More creative - explores different approaches',
  0.8: 'Very creative - generates unique and diverse ideas',
}

// Get temperature by batch index
export function getTemperatureForBatch(batchIndex: number): Temperature {
  return TEMPERATURE_SCHEDULE[batchIndex % TEMPERATURE_SCHEDULE.length]
}

// Get temperature description
export function getTemperatureDescription(temp: number): string {
  return TEMPERATURE_DESCRIPTIONS[temp] || 'Custom temperature'
}

// Default temperatures for different tasks
export const DEFAULT_TEMPERATURES = {
  persona_generation: 0.7,
  script_generation: 0.5, // Will be overridden by batch schedule
  scoring: 0.2, // More deterministic for scoring
  brief_generation: 0.6,
} as const
