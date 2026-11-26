#!/usr/bin/env node

/**
 * Hermit Intelligence — Daily Brief Cron Trigger Script
 *
 * Automatically generates a fresh executive intelligence brief for the day
 * and forwards it as a Word document (.docx) and rich HTML email to the
 * recipient configured in .env (or --recipient flag).
 *
 * Usage:
 *   node scripts/daily-brief-cron.mjs
 *   node scripts/daily-brief-cron.mjs --target=remote
 *   node scripts/daily-brief-cron.mjs --target=local
 *   node scripts/daily-brief-cron.mjs --recipient=custom@example.com
 *   node scripts/daily-brief-cron.mjs --dry-run
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load .env and .env.local manually if not already in process.env
function loadEnvFile(filename) {
  const filePath = path.join(rootDir, filename);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

// Parse CLI flags
const args = process.argv.slice(2);
const flags = {};
for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    flags[key] = value !== undefined ? value : true;
  }
}

const isDryRun = Boolean(flags['dry-run']);
const recipientOverride = flags['recipient'] || flags['to'];
const targetMode = flags['target'] || (flags['local'] ? 'local' : 'remote');

const cronSecret = process.env.CRON_SECRET || 'hermit_cron_2026_auto_refresh_ok';
const configuredRecipients = recipientOverride || process.env.REPORT_RECIPIENTS || process.env.ALERT_EMAIL_TO || '';

let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hermit-fawn.vercel.app';
if (targetMode === 'local') {
  appUrl = 'http://localhost:3009';
} else if (flags['url']) {
  appUrl = flags['url'];
}

// Strip trailing slash
appUrl = appUrl.replace(/\/+$/, '');

console.log('\n======================================================');
console.log(' Hermit Investments — Daily Brief Cron Dispatcher');
console.log('======================================================');
console.log(` Target URL:   ${appUrl}`);
console.log(` Recipient(s): ${configuredRecipients || '(none found in .env!)'}`);
console.log(` Cron Secret:  ${cronSecret ? 'configured (****)' : 'MISSING'}`);
console.log(` Mode:         ${isDryRun ? 'DRY-RUN (verification only)' : 'LIVE DISPATCH'}`);
console.log('------------------------------------------------------\n');

if (!configuredRecipients) {
  console.error('❌ Error: No email recipient found! Please set REPORT_RECIPIENTS in .env');
  process.exit(1);
}

if (!cronSecret) {
  console.error('❌ Error: CRON_SECRET is not configured.');
  process.exit(1);
}

if (isDryRun) {
  console.log('✅ Dry-run configuration check passed! Ready for automated scheduling.');
  process.exit(0);
}

async function triggerDailyBrief() {
  const endpoint = recipientOverride
    ? `${appUrl}/api/daily-brief/send`
    : `${appUrl}/api/cron/daily-email`;

  console.log(`📡 Disagreeing / Calling endpoint: ${endpoint}...`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cronSecret}`
  };

  const body = recipientOverride
    ? JSON.stringify({ recipients: [recipientOverride] })
    : undefined;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(60000)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`❌ Dispatch failed with status ${res.status}:`, data.error || data);
      process.exit(1);
    }

    console.log('\n🎉 Daily Brief successfully generated and emailed!');
    console.log('------------------------------------------------------');
    console.log(` 📰 Headline:    ${data.headline || '(Dynamic AI Headline)'}`);
    console.log(` 📅 Brief Date:  ${data.briefDate || new Date().toISOString().split('T')[0]}`);
    console.log(` 📧 Delivered to:${(data.recipients || [configuredRecipients]).join(', ')}`);
    if (data.filename) console.log(` 📎 Attachment:  ${data.filename}`);
    if (data.emailId)  console.log(` 🆔 Resend ID:   ${data.emailId}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Request error:', err.message);
    if (err.message.includes('ECONNREFUSED') && targetMode === 'local') {
      console.error('\nTip: If testing locally, make sure Next.js dev server is running on port 3009:');
      console.error('  npm run dev\n');
    }
    process.exit(1);
  }
}

triggerDailyBrief();
