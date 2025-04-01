import { useRef, useEffect } from 'react';
import { useScrollPosition } from './useScrollPosition';

export const useParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);
  const scrollY = useScrollPosition();

  useEffect(() => {
    if (!ref.current) return;
    
    const element = ref.current;
    const elementTop = element.getBoundingClientRect().top + window.scrollY;
    const elementHeight = element.offsetHeight;
    const viewportHeight = window.innerHeight;
    
    // Check if element is in viewport
    if (
      scrollY + viewportHeight > elementTop &&
      scrollY < elementTop + elementHeight
    ) {
      const offset = (scrollY - elementTop) * speed;
      const children = element.children;
      
      // Apply transform to first child (background image)
      if (children.length > 0 && children[0] instanceof HTMLElement) {
        (children[0] as HTMLElement).style.transform = `scale(1.1) translateY(${offset}px)`;
      }
    }
  }, [scrollY, speed]);

  return { ref };
};
