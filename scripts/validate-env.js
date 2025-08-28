#!/usr/bin/env node

/**
 * Environment validation script for production deployments
 * Ensures all required environment variables are set and valid
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function loadEnvFile(filePath) {
	if (!existsSync(filePath)) {
		return {};
	}

	const content = readFileSync(filePath, 'utf-8');
	const env = {};

	content.split('\n').forEach((line) => {
		const match = line.match(/^([^=]+)=(.*)$/);
		if (match) {
			env[match[1].trim()] = match[2].trim();
		}
	});

	return env;
}

function validateUrl(url, name) {
	if (!url) {
		console.error(`❌ ${name} is required but not set`);
		return false;
	}

	try {
		const parsedUrl = new URL(url);

		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			console.error(`❌ ${name} must use HTTP or HTTPS protocol`);
			return false;
		}

		if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
			console.warn(`⚠️  ${name} uses localhost - this may not work in production`);
		}

		console.log(`✅ ${name}: ${url}`);
		return true;
	} catch (error) {
		console.error(`❌ ${name} is not a valid URL: ${url}`);
		return false;
	}
}

function validateApiKey(key, name) {
	if (!key) {
		console.error(`❌ ${name} is required but not set`);
		return false;
	}

	if (key.length < 10) {
		console.error(`❌ ${name} appears to be too short (less than 10 characters)`);
		return false;
	}

	if (key.includes('your_') || key.includes('example')) {
		console.error(`❌ ${name} appears to be a placeholder value`);
		return false;
	}

	console.log(`✅ ${name}: ${key.substring(0, 10)}...`);
	return true;
}

function main() {
	console.log('🔍 Validating environment configuration for production deployment...\n');

	const isProduction = process.env.NODE_ENV === 'production';

	// Load environment variables from various sources
	const envLocal = loadEnvFile(join(projectRoot, '.env.local'));
	const envFile = loadEnvFile(join(projectRoot, '.env'));
	const processEnv = process.env;

	// Merge environment variables (process.env takes precedence)
	const env = { ...envFile, ...envLocal, ...processEnv };

	console.log(`Environment: ${isProduction ? 'Production' : 'Development'}\n`);

	let hasErrors = false;

	// Validate required production variables
	if (isProduction || env.VITE_API_BASE) {
		if (!validateUrl(env.VITE_API_BASE, 'VITE_API_BASE')) {
			hasErrors = true;
		}
	} else {
		console.log('ℹ️  VITE_API_BASE not set - will use development proxy');
	}

	if (!validateApiKey(env.PUBLIC_MAPTILER_KEY, 'PUBLIC_MAPTILER_KEY')) {
		hasErrors = true;
	}

	// Check for common mistakes
	const suspiciousVars = Object.entries(env).filter(([key, value]) => {
		return key.startsWith('VITE_') || key.startsWith('PUBLIC_');
	});

	if (suspiciousVars.length > 0) {
		console.log('\n📋 Detected environment variables:');
		suspiciousVars.forEach(([key, value]) => {
			if (key.includes('KEY') || key.includes('SECRET')) {
				console.log(`   ${key}: ${value.substring(0, 10)}...`);
			} else {
				console.log(`   ${key}: ${value}`);
			}
		});
	}

	// Production-specific warnings
	if (isProduction) {
		console.log('\n🚨 Production deployment checklist:');
		console.log('   ✅ Environment variables validated');

		if (env.VITE_API_BASE && env.VITE_API_BASE.includes('localhost')) {
			console.log('   ⚠️  API uses localhost - ensure backend is accessible');
		} else {
			console.log('   ✅ API URL appears production-ready');
		}

		console.log('   ⚠️  Ensure backend CORS allows your domain');
		console.log('   ⚠️  Verify MapTiler API key has sufficient quota');
		console.log('   ⚠️  Test API endpoints are accessible via HTTPS');
	}

	if (hasErrors) {
		console.error('\n❌ Environment validation failed. Please fix the errors above.');
		process.exit(1);
	} else {
		console.log('\n✅ Environment validation passed!');
		process.exit(0);
	}
}

main();
