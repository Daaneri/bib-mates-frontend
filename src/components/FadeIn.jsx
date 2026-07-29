import { useEffect, useRef, useState } from 'react';

/**
 * Envolvé cualquier bloque con <FadeIn> para que aparezca con una animación
 * sutil (opacidad + desplazamiento) cuando entra en el viewport.
 *
 * Uso:
 *   <FadeIn>...</FadeIn>
 *   <FadeIn delay={150} direction="left">...</FadeIn>
 */
export default function FadeIn({ children, delay = 0, direction = 'up', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const offsets = {
    up: 'translate-y-6',
    left: 'translate-x-6',
    right: '-translate-x-6',
    none: '',
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0 translate-x-0' : `opacity-0 ${offsets[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}