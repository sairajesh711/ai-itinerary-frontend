<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { AnimationService } from '$lib/services/AnimationService';
  import { ANIMATIONS } from '$lib/utils/constants';

  export let pathData: string = 'M 0,10 L 20,10'; // SVG path data
  export let strokeWidth: number = 2;
  export let strokeColor: string = '#64748b';
  export let strokeStyle: 'solid' | 'dashed' | 'dotted' = 'dashed';
  export let animationType: 'draw' | 'fade' | 'scale' = 'draw';
  export let triggerOffset: number = 0.2; // When animation starts (0-1)
  export let easing: 'linear' | 'ease-out' | 'ease-in-out' = 'ease-out';
  export let animated: boolean = true;
  export let uniqueId: string;

  const dispatch = createEventDispatcher();
  const animationService = AnimationService.getInstance();
  
  let svgElement: SVGSVGElement;
  let pathElement: SVGPathElement;
  let containerElement: HTMLElement;
  let animationProgress = 0;

  $: strokeDashArray = strokeStyle === 'dashed' ? '4 6' : strokeStyle === 'dotted' ? '2 3' : 'none';
  
  onMount(() => {
    if (animated && pathElement && containerElement) {
      // Register for scroll-triggered animation
      animationService.registerScrollAnimation(
        uniqueId,
        containerElement,
        handleAnimationProgress
      );
    } else if (!animated) {
      // Show immediately if not animated
      animationProgress = 1;
      updatePathAppearance();
    }
  });

  onDestroy(() => {
    if (animated) {
      animationService.unregisterScrollAnimation(uniqueId);
    }
  });

  function handleAnimationProgress(progress: number) {
    // Apply trigger offset
    const adjustedProgress = Math.max(0, (progress - triggerOffset) / (1 - triggerOffset));
    animationProgress = Math.min(1, adjustedProgress);
    
    updatePathAppearance();
    
    // Dispatch progress events
    dispatch('progress', { progress: animationProgress });
    
    if (animationProgress >= 1) {
      dispatch('complete');
    }
  }

  function updatePathAppearance() {
    if (!pathElement) return;

    switch (animationType) {
      case 'draw':
        animationService.animatePathDrawing(pathElement, animationProgress, easing);
        break;
      case 'fade':
        animationService.animateFadeIn(pathElement, animationProgress, 0, easing);
        break;
      case 'scale':
        animationService.animateScale(pathElement, animationProgress, 0, 1, easing);
        break;
    }
  }

  // Expose method to manually trigger animation
  export function triggerAnimation() {
    if (pathElement) {
      animationProgress = 1;
      updatePathAppearance();
      dispatch('complete');
    }
  }

  // Reset animation
  export function resetAnimation() {
    animationProgress = 0;
    updatePathAppearance();
  }
</script>

<div 
  bind:this={containerElement}
  class="animated-path-container"
  style="--stroke-color: {strokeColor}; --stroke-width: {strokeWidth}px"
>
  <svg 
    bind:this={svgElement}
    class="path-svg" 
    viewBox="0 0 100 40"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      bind:this={pathElement}
      d={pathData}
      fill="none"
      stroke="var(--stroke-color)"
      stroke-width="var(--stroke-width)"
      stroke-dasharray={strokeDashArray}
      stroke-linecap="round"
      stroke-linejoin="round"
      class="animated-path {strokeStyle}"
    />
  </svg>
</div>

<style>
  .animated-path-container {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
  }

  .path-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .animated-path {
    transition: stroke-width 0.2s ease;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }

  .animated-path.dashed {
    stroke-dasharray: 4 6;
  }

  .animated-path.dotted {
    stroke-dasharray: 2 3;
  }

  /* Hand-drawn effect */
  .animated-path {
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* Hover effect for interactivity */
  .animated-path-container:hover .animated-path {
    stroke-width: calc(var(--stroke-width) * 1.2);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  }

  /* Accessibility - respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animated-path {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .animated-path {
      stroke: #000;
      stroke-width: calc(var(--stroke-width) * 1.5);
    }
  }
</style>