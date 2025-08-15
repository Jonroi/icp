import type { ICPTemplate } from './b2b-templates';
import { B2B_TEMPLATES } from './b2b-templates';
import { B2C_TEMPLATES } from './b2c-templates';
import { B2B2C_TEMPLATES } from './b2b2c-templates';

// Re-export types and templates
export type { ICPTemplate };
export { B2B_TEMPLATES, B2C_TEMPLATES, B2B2C_TEMPLATES };

// Combined templates object for easy access
export const ICP_TEMPLATES = {
  B2B: B2B_TEMPLATES,
  B2C: B2C_TEMPLATES,
  B2B2C: B2B2C_TEMPLATES,
} as const;
