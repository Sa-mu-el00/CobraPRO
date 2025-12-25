import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ConfettiProps {
  show: boolean;
  onComplete?: () => void;
}

export function Confetti({ show, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Gerar partículas de confete nas cores do CobraPro
      const colors = ['#00E676', '#004D40', '#26A69A', '#80CBC4'];
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -20 - 10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setParticles(newParticles);

      // Limpar após animação
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: '50vw',
            y: '20vh',
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            x: `calc(50vw + ${particle.x}vw)`,
            y: '120vh',
            opacity: 0,
            scale: 0.5,
            rotate: particle.rotation,
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: 'easeOut',
          }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </div>
  );
}
