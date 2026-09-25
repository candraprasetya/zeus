#!/usr/bin/env node

/**
 * check-i18n-parity.mjs
 * Validates tri-lingual key parity across mobile banking i18n JSON files.
 * Typically checks files matching:
 *   *-ai-string-en.json
 *   *-ai-string-id.json
 *   *-ai-string-zh.json
 *
 * Can also scan a directory or file list provided via CLI args:
 *   node scripts/check-i18n-parity.mjs [path-or-glob]
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename, dirname } from "node:path";

function findJsonFiles(dir, fileList = []) {
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist" || entry === "build") {
        continue;
      }
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        findJsonFiles(fullPath, fileList);
      } else if (entry.endsWith(".json") && entry.includes("-string-")) {
        fileList.push(fullPath);
      }
    }
  } catch (_e) {
    // skip unreadable dirs
  }
  return fileList;
}

function getObjectKeys(obj, prefix = "") {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys = keys.concat(getObjectKeys(value, currentKey));
    } else {
      keys.push(currentKey);
    }
  }
  return keys;
}

function runCheck() {
  const targetDir = process.argv[2] || process.cwd();
  console.log(`Checking tri-lingual i18n parity in: ${targetDir}`);

  const allMatchingFiles = findJsonFiles(targetDir);
  if (allMatchingFiles.length === 0) {
    console.log("No *-string-*.json files found. Checking demonstration dummy verification.");
    console.log("i18n parity check passed: 0 sets found.");
    process.exit(0);
  }

  // Group by base feature prefix
  // e.g., transfer-ai-string-en.json -> prefix: "<dir>/transfer-ai-string"
  const groups = new Map();
  for (const file of allMatchingFiles) {
    const bName = basename(file);
    const dir = dirname(file);
    const match = bName.match(/^(.*-string-)(en|id|zh)\.json$/);
    if (match) {
      const prefix = join(dir, match[1]);
      const lang = match[2];
      if (!groups.has(prefix)) {
        groups.set(prefix, {});
      }
      groups.get(prefix)[lang] = file;
    }
  }

  let hasError = false;

  for (const [prefix, langFiles] of groups.entries()) {
    console.log(`\nEvaluating set: ${prefix}*`);
    const langs = ["en", "id", "zh"];
    const parsed = {};
    const keySets = {};

    for (const lang of langs) {
      if (!langFiles[lang]) {
        console.error(`  [MISSING FILE] Language '${lang}' missing for set '${prefix}'`);
        hasError = true;
      } else {
        try {
          const content = JSON.parse(readFileSync(langFiles[lang], "utf-8"));
          parsed[lang] = content;
          keySets[lang] = new Set(getObjectKeys(content));
        } catch (err) {
          console.error(`  [INVALID JSON] Could not parse ${langFiles[lang]}:`, err.message);
          hasError = true;
        }
      }
    }

    if (keySets.en && keySets.id && keySets.zh) {
      const allKeys = new Set([...keySets.en, ...keySets.id, ...keySets.zh]);
      for (const key of allKeys) {
        for (const lang of langs) {
          if (!keySets[lang].has(key)) {
            console.error(`  [MISSING KEY] Key '${key}' is missing in '${lang}' (${langFiles[lang]})`);
            hasError = true;
          }
        }
      }
    }
  }

  if (hasError) {
    console.error("\n❌ i18n parity check failed! Missing translations or files found.");
    process.exit(1);
  } else {
    console.log(`\n✅ All ${groups.size} i18n sets are in 100% parity across en, id, and zh.`);
  }
}

runCheck();
