<!-- Debug page for CORS testing -->
<script lang="ts">
	import { debugFetch, testCORS } from '$lib/debug-api';
	import { onMount } from 'svelte';

	let debugOutput = '';
	let testRunning = false;

	function addToOutput(message: string) {
		debugOutput += new Date().toLocaleTimeString() + ': ' + message + '\n';
	}

	// Override console methods to capture output
	onMount(() => {
		const originalLog = console.log;
		const originalError = console.error;
		
		console.log = (...args) => {
			originalLog(...args);
			addToOutput('LOG: ' + args.join(' '));
		};
		
		console.error = (...args) => {
			originalError(...args);
			addToOutput('ERROR: ' + args.join(' '));
		};

		return () => {
			console.log = originalLog;
			console.error = originalError;
		};
	});

	async function runCORSTest() {
		testRunning = true;
		debugOutput = '';
		
		addToOutput('Starting CORS test...');
		addToOutput(`Current URL: ${window.location.href}`);
		addToOutput(`VITE_API_BASE: ${import.meta.env.VITE_API_BASE || 'not set'}`);
		
		try {
			await testCORS();
			addToOutput('✅ Test completed successfully!');
		} catch (error) {
			addToOutput(`❌ Test failed: ${error}`);
		}
		
		testRunning = false;
	}

	function clearBrowserCache() {
		// Clear various types of cache
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations().then(registrations => {
				registrations.forEach(registration => registration.unregister());
			});
		}
		
		// Force hard refresh
		window.location.reload();
	}
</script>

<svelte:head>
	<title>CORS Debug Tool</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	<h1 class="text-2xl font-bold mb-6">🔧 CORS Debug Tool</h1>
	
	<div class="space-y-4">
		<div class="bg-blue-50 p-4 rounded-lg">
			<h2 class="font-semibold mb-2">Environment Info</h2>
			<p><strong>Current Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'server'}</p>
			<p><strong>API Base:</strong> {import.meta.env.VITE_API_BASE || 'not configured (using proxy)'}</p>
			<p><strong>Mode:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}</p>
			<p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 60) + '...' : 'N/A'}</p>
			<p><strong>Browser:</strong> {typeof navigator !== 'undefined' ? 
				(navigator.userAgent.includes('Chrome') ? 'Chrome' : 
				 navigator.userAgent.includes('Firefox') ? 'Firefox' : 
				 navigator.userAgent.includes('Safari') ? 'Safari' : 'Other') : 'Unknown'}</p>
		</div>

		<div class="space-x-4">
			<button 
				on:click={runCORSTest} 
				disabled={testRunning}
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
			>
				{testRunning ? '🔄 Testing...' : '🧪 Run CORS Test'}
			</button>
			
			<button 
				on:click={clearBrowserCache}
				class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
			>
				🗑️ Clear Cache & Reload
			</button>
		</div>

		{#if debugOutput}
			<div class="bg-gray-900 text-green-400 p-4 rounded-lg">
				<h3 class="text-white font-semibold mb-2">Debug Output:</h3>
				<pre class="text-sm overflow-auto whitespace-pre-wrap">{debugOutput}</pre>
			</div>
		{/if}
	</div>
</div>