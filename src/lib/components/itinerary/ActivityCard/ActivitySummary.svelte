<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
  import { DateFormatter, MoneyFormatter } from '$lib/utils/formatters';
  import type { Activity } from '$lib/types';
  import { INTERACTIONS } from '$lib/utils/constants';

  export let activity: Activity;
  export let isExpanded = false;
  export let isHovered = false;
  export let componentId: string;

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('toggle', { expanded: !isExpanded });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }

  $: timeRange = DateFormatter.formatTimeRange(activity.start_time, activity.end_time);
  $: estimatedCost = MoneyFormatter.formatCurrency(activity.estimated_cost);
  $: hasExpandableContent = !!(activity.description || activity.tips?.length || activity.booking);
</script>

<div 
  class="activity-summary {isExpanded ? 'expanded' : ''} {isHovered ? 'hovered' : ''}"
  class:clickable={hasExpandableContent}
  on:click={hasExpandableContent ? handleClick : undefined}
  on:keydown={hasExpandableContent ? handleKeydown : undefined}
  tabindex={hasExpandableContent ? 0 : undefined}
  role={hasExpandableContent ? 'button' : undefined}
  aria-expanded={hasExpandableContent ? isExpanded : undefined}
  aria-label={hasExpandableContent ? `${isExpanded ? 'Collapse' : 'Expand'} details for ${activity.title}` : undefined}
  id={componentId}
>
  <div class="summary-content">
    <!-- Category Icon & Title -->
    <div class="title-section">
      <div class="category-icon">
        <CategoryIcon name={activity.category} size={18}/>
      </div>
      
      <div class="title-content">
        <h3 class="activity-title">
          {activity.title}
          {#if hasExpandableContent}
            <button 
              class="expand-indicator"
              aria-hidden="true"
              tabindex="-1"
            >
              <svg 
                viewBox="0 0 16 16" 
                class="chevron {isExpanded ? 'rotated' : ''}"
              >
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          {/if}
        </h3>
        
        <!-- Cost Badge -->
        {#if estimatedCost}
          <span class="cost-badge">
            {estimatedCost}
          </span>
        {/if}
      </div>
    </div>

    <!-- Time & Location -->
    <div class="meta-info">
      {#if timeRange}
        <span class="time-info">{timeRange}</span>
      {/if}
      
      {#if activity.place?.name}
        {#if timeRange}
          <span class="separator">•</span>
        {/if}
        <span class="location-info">{activity.place.name}</span>
      {/if}
    </div>
  </div>

  <!-- Interaction Ripple -->
  {#if hasExpandableContent}
    <div class="interaction-ripple"></div>
  {/if}
</div>

<style>
  .activity-summary {
    position: relative;
    padding: 16px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    overflow: hidden;
  }

  .activity-summary.clickable {
    cursor: pointer;
  }

  .activity-summary.clickable:hover {
    background: rgba(15, 23, 42, 0.02);
    transform: scale(1.02);
    box-shadow: 
      0 2px 8px rgba(15, 23, 42, 0.08),
      0 1px 3px rgba(15, 23, 42, 0.06);
  }

  .activity-summary.clickable:focus-visible {
    outline: 2px solid #0f172a;
    outline-offset: 2px;
  }

  .activity-summary.clickable:active {
    transform: scale(0.98);
  }

  .activity-summary.expanded {
    background: rgba(15, 23, 42, 0.03);
  }

  .summary-content {
    position: relative;
    z-index: 2;
  }

  .title-section {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 8px;
  }

  .category-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: #64748b;
    transition: color 0.2s ease;
  }

  .activity-summary.hovered .category-icon {
    color: #334155;
  }

  .title-content {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .activity-title {
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.4;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .expand-indicator {
    background: none;
    border: none;
    padding: 2px;
    color: #64748b;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
  }

  .expand-indicator:hover {
    color: #334155;
    background: rgba(15, 23, 42, 0.05);
  }

  .chevron {
    width: 14px;
    height: 14px;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .chevron.rotated {
    transform: rotate(90deg);
  }

  .cost-badge {
    font-size: 0.75rem;
    font-weight: 500;
    color: #059669;
    background: rgba(5, 150, 105, 0.1);
    border: 1px solid rgba(5, 150, 105, 0.2);
    border-radius: 6px;
    padding: 2px 6px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .meta-info {
    font-size: 0.875rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .time-info {
    font-weight: 500;
    color: #475569;
  }

  .separator {
    opacity: 0.6;
  }

  .location-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .interaction-ripple {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 40%, rgba(15, 23, 42, 0.01) 1px, transparent 1px),
      radial-gradient(circle at 70% 60%, rgba(15, 23, 42, 0.01) 1px, transparent 1px);
    background-size: 16px 16px, 20px 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    border-radius: inherit;
  }

  .activity-summary.hovered .interaction-ripple {
    opacity: 1;
  }

  /* Accessibility & Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .activity-summary {
      transition: background-color 0.1s ease;
    }
    
    .activity-summary.clickable:hover {
      transform: none;
    }
    
    .activity-summary.clickable:active {
      transform: none;
    }
    
    .chevron {
      transition: none;
    }
    
    .interaction-ripple {
      transition: none;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .activity-summary.clickable:hover {
      background: #f1f5f9;
      box-shadow: 0 0 0 2px #0f172a;
    }
    
    .cost-badge {
      background: white;
      border: 2px solid #059669;
      color: #059669;
    }
    
    .expand-indicator:hover {
      background: #e2e8f0;
    }
  }
</style>