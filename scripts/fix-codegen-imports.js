#!/usr/bin/env node

/**
 * This script fixes issues in the generated codegen files:
 * 1. Removes .js extensions from relative imports (for Next.js Turbopack)
 * 2. Fixes TypeScript errors with default empty objects for required properties
 * 
 * Run this after `bun run codegen` to fix the issues.
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';

const GENERATED_DIR = join(process.cwd(), 'apps/web/contracts/generated');

async function fixImportsInFile(filePath) {
  let content = await readFile(filePath, 'utf-8');
  let modified = false;
  
  // Fix 1: Replace .js extensions in relative imports with no extension
  // This regex matches: from './path/to/file.js' or from '../path/to/file.js'
  const fixedImports = content.replace(
    /from\s+['"](\.[^'"]+)\.js['"]/g,
    "from '$1'"
  );
  if (content !== fixedImports) {
    content = fixedImports;
    modified = true;
  }
  
  // Fix 2: Remove default `= {}` from function parameters where package is required
  // This fixes: `function foo(options: FooOptions = {})` -> `function foo(options: FooOptions)`
  const fixedDefaults = content.replace(
    /\(options:\s*(\w+Options)\s*=\s*\{\}\)/g,
    '(options: $1)'
  );
  if (content !== fixedDefaults) {
    content = fixedDefaults;
    modified = true;
  }
  
  // Fix 3: Add type annotation to empty parameterNames arrays
  // This fixes: `const parameterNames = [];` -> `const parameterNames: string[] = [];`
  const fixedEmptyArrays = content.replace(
    /const parameterNames = \[\];/g,
    'const parameterNames: string[] = [];'
  );
  if (content !== fixedEmptyArrays) {
    content = fixedEmptyArrays;
    modified = true;
  }
  
  if (modified) {
    await writeFile(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  return false;
}

async function processDirectory(dirPath) {
  let fixedCount = 0;
  const entries = await readdir(dirPath);
  
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      fixedCount += await processDirectory(fullPath);
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      const wasFixed = await fixImportsInFile(fullPath);
      if (wasFixed) fixedCount++;
    }
  }
  
  return fixedCount;
}

async function main() {
  console.log('Fixing .js imports in generated files...');
  console.log(`Directory: ${GENERATED_DIR}`);
  
  try {
    const fixedCount = await processDirectory(GENERATED_DIR);
    console.log(`\nDone! Fixed ${fixedCount} file(s).`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Generated directory not found. Run codegen first.');
    } else {
      throw error;
    }
  }
}

main();
