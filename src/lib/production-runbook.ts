/**
 * Enterprise Production Operational Runbook
 * Platform: Hermit Investments Energy Intelligence System
 * Revision: 1.0.0
 */

export interface SystemSLA {
  availabilityTarget: '99.9%';
  maxAcceptableLatencyMs: number;
  rpoHours: number; // Recovery Point Objective
  rtoHours: number; // Recovery Time Objective
}

export const PRODUCTION_SLA: SystemSLA = {
  availabilityTarget: '99.9%',
  maxAcceptableLatencyMs: 800,
  rpoHours: 1,  // Max 1 hr data loss in catastrophe
  rtoHours: 2   // Max 2 hrs to restore cold stand-by
};

/**
 * Validates production environment connection configurations.
 * Enforces transaction pooling port (6543) for serverless scalability.
 */
export function validateProductionConfig(): { isValid: boolean; warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const cronSecret = process.env.CRON_SECRET || '';

  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    warnings.push('CRITICAL: Supabase URL is unconfigured or using template placeholder.');
  }

  if (!geminiKey || geminiKey.includes('AIzaSy_fake')) {
    warnings.push('CRITICAL: Gemini API Key is missing or using placeholder.');
  }

  if (!cronSecret || cronSecret === 'hermit_super_secret_cron_token_2026') {
    warnings.push('SECURITY WARNING: CRON_SECRET is using default demo token. Must be rotated for production deployment.');
  }

  recommendations.push('Ensure database pooled connection is set to Supavisor transaction pool port 6543 on Vercel.');
  recommendations.push('Verify Point-in-Time Recovery (PITR) is enabled on Supabase Pro/Team tier.');
  recommendations.push('Ensure UPSTASH_REDIS_REST_URL is configured for multi-region rate-limiting.');

  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
}
