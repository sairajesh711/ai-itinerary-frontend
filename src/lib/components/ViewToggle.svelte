<script lang="ts">
  import { ui } from '$lib/stores';
  
  function toggleView(mode: 'timeline' | 'map') {
    ui.update(state => ({ ...state, mode }));
  }
</script>

<div class="view-toggle" role="tablist" aria-label="View mode selection">
  <button
    type="button"
    role="tab"
    aria-selected={$ui.mode === 'timeline'}
    aria-controls="main-content"
    class="toggle-btn {$ui.mode === 'timeline' ? 'active' : ''}"
    on:click={() => toggleView('timeline')}
  >
    <!-- Hand-drawn timeline icon -->
    <svg viewBox="0 0 16 16" class="icon" aria-hidden="true">
      <g stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round">
        <!-- Timeline spine -->
        <path d="M3 2v12" />
        <!-- Timeline nodes -->
        <circle cx="3" cy="4" r="1.5" fill="currentColor" />
        <circle cx="3" cy="7.5" r="1.5" fill="currentColor" />
        <circle cx="3" cy="11" r="1.5" fill="currentColor" />
        <!-- Content lines (hand-drawn style) -->
        <path d="M5.5 3.5h7" />
        <path d="M5.5 4.5h5" />
        <path d="M5.5 7h6.5" />
        <path d="M5.5 8h4" />
        <path d="M5.5 10.5h7" />
        <path d="M5.5 11.5h5.5" />
      </g>
    </svg>
    <span>Timeline</span>
  </button>
  
  <button
    type="button" 
    role="tab"
    aria-selected={$ui.mode === 'map'}
    aria-controls="main-content"
    class="toggle-btn {$ui.mode === 'map' ? 'active' : ''}"
    on:click={() => toggleView('map')}
  >
    <!-- Hand-drawn map icon -->
    <svg viewBox="0 0 16 16" class="icon" aria-hidden="true">
      <g stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round">
        <!-- Map outline (slightly irregular) -->
        <path d="M2.5 3c0 0 1.5-1 4-0.5s3.5 1.5 6 0.5c0.5 0.3 1 1.2 1 2v7c0 0.5-0.3 1-1 1-2.5 1-3.5-1.5-6-0.5s-4 0.5-4 0.5c-0.5-0.2-1-0.8-1-1.5V4.5c0-0.7 0.5-1.3 1-1.5z" />
        <!-- Map fold lines -->
        <path d="M6.5 2.5v11" />
        <path d="M10.5 2.5v11" />
        <!-- Small landmarks -->
        <circle cx="4" cy="6" r="0.8" fill="currentColor" />
        <circle cx="8" cy="8.5" r="0.8" fill="currentColor" />
        <circle cx="12" cy="5.5" r="0.8" fill="currentColor" />
      </g>
    </svg>
    <span>Map</span>
  </button>
</div>

<style>
  .view-toggle {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(15, 23, 42, 0.12);
    border-radius: 16px;
    padding: 4px;
    box-shadow: 
      0 2px 8px rgba(15, 23, 42, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    position: sticky;
    top: 20px;
    z-index: 10;
  }
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #64748b;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    min-width: 100px;
    justify-content: center;
  }
  
  .toggle-btn:hover {
    color: #334155;
    background: rgba(15, 23, 42, 0.04);
  }
  
  .toggle-btn:focus-visible {
    outline: 2px solid #0f172a;
    outline-offset: 2px;
  }
  
  .toggle-btn.active {
    background: #0f172a;
    color: white;
    box-shadow: 
      0 2px 6px rgba(15, 23, 42, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .toggle-btn.active:hover {
    background: #1e293b;
    color: white;
  }
  
  .icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
  
  /* Journal-like texture on hover */
  .toggle-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(15, 23, 42, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.02) 1px, transparent 1px);
    background-size: 12px 12px, 16px 16px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .toggle-btn:hover::before {
    opacity: 1;
  }
  
  .toggle-btn.active::before {
    opacity: 0;
  }
  
  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .toggle-btn {
      transition: none;
    }
  }
  
  @media (prefers-contrast: high) {
    .view-toggle {
      border-color: #0f172a;
      background: white;
    }
    
    .toggle-btn {
      color: #0f172a;
    }
    
    .toggle-btn.active {
      background: #0f172a;
      color: white;
    }
  }
</style>