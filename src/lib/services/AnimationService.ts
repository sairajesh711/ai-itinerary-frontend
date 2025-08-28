import { ANIMATIONS } from '../utils/constants';

export class AnimationService {
  private static instance: AnimationService;
  private intersectionObserver: IntersectionObserver | null = null;
  private animatedElements: Map<string, HTMLElement> = new Map();
  private scrollCallbacks: Map<string, (progress: number) => void> = new Map();

  private constructor() {
    this.setupIntersectionObserver();
  }

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.getAttribute('data-animation-id');
          if (!elementId) return;

          const callback = this.scrollCallbacks.get(elementId);
          if (callback) {
            // Calculate intersection progress (0 to 1)
            const progress = Math.max(0, Math.min(1, entry.intersectionRatio));
            callback(progress);
          }
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0% to 100% in 1% increments
        rootMargin: '-10% 0px -10% 0px' // Start animation when element is 10% visible
      }
    );
  }

  registerScrollAnimation(
    elementId: string,
    element: HTMLElement,
    callback: (progress: number) => void
  ) {
    if (!this.intersectionObserver) return;

    element.setAttribute('data-animation-id', elementId);
    this.animatedElements.set(elementId, element);
    this.scrollCallbacks.set(elementId, callback);
    this.intersectionObserver.observe(element);
  }

  unregisterScrollAnimation(elementId: string) {
    const element = this.animatedElements.get(elementId);
    if (element && this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
    
    this.animatedElements.delete(elementId);
    this.scrollCallbacks.delete(elementId);
  }

  // Helper method to create smooth eased progress
  easeProgress(progress: number, easing: 'linear' | 'ease-out' | 'ease-in-out' = 'ease-out'): number {
    switch (easing) {
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 3);
      case 'ease-in-out':
        return progress < 0.5 
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      default:
        return progress;
    }
  }

  // Animation preset for drawing paths
  animatePathDrawing(
    pathElement: SVGPathElement,
    progress: number,
    easing: 'linear' | 'ease-out' | 'ease-in-out' = 'ease-out'
  ) {
    const easedProgress = this.easeProgress(progress, easing);
    const pathLength = pathElement.getTotalLength();
    
    pathElement.style.strokeDasharray = `${pathLength}`;
    pathElement.style.strokeDashoffset = `${pathLength * (1 - easedProgress)}`;
    pathElement.style.opacity = `${Math.max(0.2, easedProgress)}`;
  }

  // Animation preset for scaling elements
  animateScale(
    element: HTMLElement,
    progress: number,
    fromScale: number = 0,
    toScale: number = 1,
    easing: 'linear' | 'ease-out' | 'ease-in-out' = 'ease-out'
  ) {
    const easedProgress = this.easeProgress(progress, easing);
    const scale = fromScale + (toScale - fromScale) * easedProgress;
    element.style.transform = `scale(${scale})`;
    element.style.opacity = `${easedProgress}`;
  }

  // Animation preset for fade in
  animateFadeIn(
    element: HTMLElement,
    progress: number,
    delay: number = 0,
    easing: 'linear' | 'ease-out' | 'ease-in-out' = 'ease-out'
  ) {
    const adjustedProgress = Math.max(0, progress - delay);
    const normalizedProgress = delay < 1 ? adjustedProgress / (1 - delay) : adjustedProgress;
    const easedProgress = this.easeProgress(normalizedProgress, easing);
    
    element.style.opacity = `${easedProgress}`;
    element.style.transform = `translateY(${20 * (1 - easedProgress)}px)`;
  }

  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.animatedElements.clear();
    this.scrollCallbacks.clear();
  }
}