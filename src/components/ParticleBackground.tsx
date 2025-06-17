import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle colors - beautiful gradient colors
    const colors = [
      'rgba(59, 130, 246, 0.6)',   // Blue
      'rgba(147, 51, 234, 0.6)',   // Purple
      'rgba(236, 72, 153, 0.6)',   // Pink
      'rgba(34, 197, 94, 0.6)',    // Green
      'rgba(251, 191, 36, 0.6)',   // Yellow
      'rgba(239, 68, 68, 0.6)',    // Red
      'rgba(14, 165, 233, 0.6)',   // Sky blue
      'rgba(168, 85, 247, 0.6)',   // Violet
    ];

    // Create particles
    const createParticle = (): Particle => {
      const maxLife = 300 + Math.random() * 200;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: maxLife,
        maxLife
      };
    };

    // Initialize particles
    const particleCount = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;

        // Mouse attraction effect
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.01;
          particle.vy += (dy / distance) * force * 0.01;
        }

        // Apply some friction
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        particle.vz *= 0.99;

        // Boundary wrapping
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.z < 0) particle.z = 1000;
        if (particle.z > 1000) particle.z = 0;

        // Update life
        particle.life--;
        if (particle.life <= 0) {
          particlesRef.current[index] = createParticle();
          return;
        }

        // Calculate 3D perspective
        const perspective = 800;
        const scale = perspective / (perspective + particle.z);
        const x2d = particle.x * scale + (canvas.width * (1 - scale)) / 2;
        const y2d = particle.y * scale + (canvas.height * (1 - scale)) / 2;
        const size = particle.size * scale;

        // Calculate opacity based on life and depth
        const lifeOpacity = particle.life / particle.maxLife;
        const depthOpacity = Math.max(0.1, 1 - particle.z / 1000);
        const finalOpacity = particle.opacity * lifeOpacity * depthOpacity;

        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 2);
        const baseColor = particle.color.replace('0.6', finalOpacity.toString());
        const centerColor = particle.color.replace('0.6', (finalOpacity * 0.8).toString());
        
        gradient.addColorStop(0, centerColor);
        gradient.addColorStop(0.5, baseColor);
        gradient.addColorStop(1, 'transparent');

        // Draw particle with blur effect
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = `blur(${Math.max(0.5, size * 0.3)}px)`;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Draw connecting lines between nearby particles
        particlesRef.current.forEach((otherParticle, otherIndex) => {
          if (index >= otherIndex) return;
          
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const dz = particle.z - otherParticle.z;
          const distance3d = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance3d < 100) {
            const otherScale = perspective / (perspective + otherParticle.z);
            const otherX2d = otherParticle.x * otherScale + (canvas.width * (1 - otherScale)) / 2;
            const otherY2d = otherParticle.y * otherScale + (canvas.height * (1 - otherScale)) / 2;
            
            const lineOpacity = Math.max(0, (100 - distance3d) / 100) * 0.2 * finalOpacity;
            
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.filter = 'blur(0.5px)';
            
            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(otherX2d, otherY2d);
            ctx.stroke();
            
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default ParticleBackground;