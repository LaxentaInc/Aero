// Core Configuration Interface
export interface SpamProtectionConfig {
  enabled: boolean;
  logChannelId: string | null;
  
  // Keywords to block
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
  
  // Mention limits
  mentionLimit: number;
  
  // Preset filters
  blockProfanity: boolean;
  blockSexualContent: boolean;
  blockSlurs: boolean;
  
  // Actions
  blockMessage: boolean;
  timeoutDuration: number; // seconds, 0 = disabled
  sendAlert: boolean;
  
  lastUpdated: Date | null;
}

// Database Document Interface
export interface SpamProtectionDocument {
  guildId: string;
  config: SpamProtectionConfig;
  createdAt: Date;
  lastUpdated: Date;
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Partial update interface for PATCH requests
export interface SpamProtectionConfigUpdate {
  enabled?: boolean;
  logChannelId?: string | null;
  keywords?: string[];
  regexPatterns?: string[];
  allowList?: string[];
  mentionLimit?: number;
  blockProfanity?: boolean;
  blockSexualContent?: boolean;
  blockSlurs?: boolean;
  blockMessage?: boolean;
  timeoutDuration?: number;
  sendAlert?: boolean;
}

// Request body interfaces
export interface ToggleModuleRequest {
  guildId: string;
  enabled: boolean;
}

export interface UpdateConfigRequest {
  guildId: string;
  config: SpamProtectionConfig;
}

export interface PatchConfigRequest {
  guildId: string;
  updates: SpamProtectionConfigUpdate;
}

// Frontend form interfaces
export interface KeywordFilterForm {
  keywords: string[];
  regexPatterns: string[];
  allowList: string[];
}

export interface MentionSpamForm {
  mentionLimit: number;
}

export interface PresetFiltersForm {
  blockProfanity: boolean;
  blockSexualContent: boolean;
  blockSlurs: boolean;
}

export interface ActionsForm {
  blockMessage: boolean;
  timeoutDuration: number;
  sendAlert: boolean;
}

export interface LogChannelForm {
  logChannelId: string | null;
}

// Status and validation interfaces
export interface ModuleStatus {
  enabled: boolean;
  lastUpdated: Date | null;
  hasActiveRules?: boolean;
  rulesCount?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Constants and Enums
export const TIMEOUT_LIMITS = {
  MIN: 60, // 1 minute
  MAX: 2419200, // 28 days
  DEFAULT: 300 // 5 minutes
} as const;

export const MENTION_LIMITS = {
  MIN: 0,
  MAX: 50,
  DEFAULT: 5
} as const;

export const ARRAY_LIMITS = {
  KEYWORDS_MAX: 100,
  REGEX_MAX: 10,
  ALLOWLIST_MAX: 50
} as const;

// Default configurations
export const DEFAULT_KEYWORDS = [
  'discord.gg/',
  'free nitro',
  'virus',
  'malware',
  'raid time',
  'mass dm',
  'nuke server'
] as const;

export const DEFAULT_REGEX_PATTERNS = [
  'discord\\.gg\\/[a-zA-Z0-9]+',
  '@(everyone|here)\\s*@(everyone|here)'
] as const;

export const DEFAULT_ALLOWLIST = [
  'discord support',
  'discord official'
] as const;

// Utility type for making all properties optional (for updates)
export type PartialConfig = Partial<SpamProtectionConfig>;

// Type guards
export function isSpamProtectionConfig(obj: any): obj is SpamProtectionConfig {
  return (
    typeof obj === 'object' &&
    typeof obj.enabled === 'boolean' &&
    (obj.logChannelId === null || typeof obj.logChannelId === 'string') &&
    Array.isArray(obj.keywords) &&
    Array.isArray(obj.regexPatterns) &&
    Array.isArray(obj.allowList) &&
    typeof obj.mentionLimit === 'number' &&
    typeof obj.blockProfanity === 'boolean' &&
    typeof obj.blockSexualContent === 'boolean' &&
    typeof obj.blockSlurs === 'boolean' &&
    typeof obj.blockMessage === 'boolean' &&
    typeof obj.timeoutDuration === 'number' &&
    typeof obj.sendAlert === 'boolean'
  );
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    typeof obj.success === 'boolean' &&
    (obj.data === undefined || obj.data !== undefined) &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.message === undefined || typeof obj.message === 'string')
  );
}

// Validation functions
export function validateTimeout(duration: number): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (duration < 0) {
    errors.push({
      field: 'timeoutDuration',
      message: 'Timeout duration cannot be negative'
    });
  }
  
  if (duration > TIMEOUT_LIMITS.MAX) {
    errors.push({
      field: 'timeoutDuration',
      message: `Timeout duration cannot exceed ${TIMEOUT_LIMITS.MAX} seconds (28 days)`
    });
  }
  
  if (duration > 0 && duration < TIMEOUT_LIMITS.MIN) {
    errors.push({
      field: 'timeoutDuration',
      message: `Timeout duration must be at least ${TIMEOUT_LIMITS.MIN} seconds (1 minute) when enabled`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateMentionLimit(limit: number): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (limit < MENTION_LIMITS.MIN) {
    errors.push({
      field: 'mentionLimit',
      message: `Mention limit cannot be less than ${MENTION_LIMITS.MIN}`
    });
  }
  
  if (limit > MENTION_LIMITS.MAX) {
    errors.push({
      field: 'mentionLimit',
      message: `Mention limit cannot exceed ${MENTION_LIMITS.MAX}`
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateKeywords(keywords: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (keywords.length > ARRAY_LIMITS.KEYWORDS_MAX) {
    errors.push({
      field: 'keywords',
      message: `Cannot have more than ${ARRAY_LIMITS.KEYWORDS_MAX} keywords`
    });
  }
  
  const emptyKeywords = keywords.filter(k => !k || k.trim() === '');
  if (emptyKeywords.length > 0) {
    errors.push({
      field: 'keywords',
      message: 'Keywords cannot be empty'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateConfig(config: Partial<SpamProtectionConfig>): ValidationResult {
  const allErrors: ValidationError[] = [];
  
  if (config.timeoutDuration !== undefined) {
    const timeoutValidation = validateTimeout(config.timeoutDuration);
    allErrors.push(...timeoutValidation.errors);
  }
  
  if (config.mentionLimit !== undefined) {
    const mentionValidation = validateMentionLimit(config.mentionLimit);
    allErrors.push(...mentionValidation.errors);
  }
  
  if (config.keywords !== undefined) {
    const keywordValidation = validateKeywords(config.keywords);
    allErrors.push(...keywordValidation.errors);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}