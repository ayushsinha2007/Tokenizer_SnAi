import React, { useRef, useEffect } from 'react';

export const HeroEnergyArena: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 480);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 480);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes orbiting on concentric rings
    const rings = [
      { radius: 65, speed: 0.007, angle: 0, dash: [4, 6], color: 'rgba(57, 139, 255, 0.45)' },
      { radius: 110, speed: -0.005, angle: 1.2, dash: [8, 12], color: 'rgba(98, 201, 245, 0.35)' },
      { radius: 160, speed: 0.003, angle: 2.5, dash: [12, 16], color: 'rgba(57, 139, 255, 0.25)' },
      { radius: 205, speed: -0.002, angle: 4.1, dash: [6, 14], color: 'rgba(98, 201, 245, 0.18)' },
    ];

    interface Particle {
      ringIndex: number;
      offsetAngle: number;
      size: number;
      label: string;
      alpha: number;
    }

    const particles: Particle[] = [
      { ringIndex: 0, offsetAngle: 0, size: 4, label: '9906', alpha: 0.9 },
      { ringIndex: 0, offsetAngle: Math.PI, size: 3.5, label: 'BPE', alpha: 0.8 },
      { ringIndex: 1, offsetAngle: 0.8, size: 3.5, label: 'token', alpha: 0.85 },
      { ringIndex: 1, offsetAngle: 2.6, size: 3, label: '0x48', alpha: 0.75 },
      { ringIndex: 1, offsetAngle: 4.8, size: 3, label: 'UTF-8', alpha: 0.7 },
      { ringIndex: 2, offsetAngle: 1.1, size: 3, label: 'cl100k', alpha: 0.8 },
      { ringIndex: 2, offsetAngle: 3.4, size: 3, label: 'o200k', alpha: 0.75 },
      { ringIndex: 2, offsetAngle: 5.2, size: 3, label: 'spin', alpha: 0.85 },
      { ringIndex: 3, offsetAngle: 2.1, size: 2.5, label: 'embed', alpha: 0.65 },
      { ringIndex: 3, offsetAngle: 4.3, size: 2.5, label: 'vocab', alpha: 0.6 },
    ];

    // Ambient floating dust particles
    const ambientStars = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 0.15,
    }));

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      pulse += 0.02;

      // 1. Ambient dust
      ambientStars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.fillStyle = `rgba(154, 170, 192, ${s.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Central glow gradient
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 130 + Math.sin(pulse) * 10
      );
      glowGrad.addColorStop(0, 'rgba(57, 139, 255, 0.22)');
      glowGrad.addColorStop(0.5, 'rgba(98, 201, 245, 0.08)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 160, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw concentric rings
      rings.forEach((ring) => {
        ring.angle += ring.speed;

        ctx.save();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.2;
        ctx.setLineDash(ring.dash);
        ctx.lineDashOffset = -ring.angle * 40;

        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Subtle energy lines (compass axes / arena grid)
      ctx.save();
      ctx.strokeStyle = 'rgba(57, 139, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.moveTo(centerX - 220, centerY);
      ctx.lineTo(centerX + 220, centerY);
      ctx.moveTo(centerX, centerY - 220);
      ctx.lineTo(centerX, centerY + 220);
      ctx.stroke();
      ctx.restore();

      // 5. Draw orbiting particle nodes with minimal motion trails
      particles.forEach((p) => {
        const ring = rings[p.ringIndex];
        const currentAngle = ring.angle + p.offsetAngle;
        const x = centerX + Math.cos(currentAngle) * ring.radius;
        const y = centerY + Math.sin(currentAngle) * ring.radius;

        // Motion trail
        const trailLength = 0.25;
        const trailDir = ring.speed > 0 ? -1 : 1;
        ctx.save();
        ctx.strokeStyle = 'rgba(98, 201, 245, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          ring.radius,
          currentAngle,
          currentAngle + trailDir * trailLength,
          ring.speed > 0
        );
        ctx.stroke();
        ctx.restore();

        // Node circle
        ctx.fillStyle = p.ringIndex % 2 === 0 ? '#398BFF' : '#62C9F5';
        ctx.shadowColor = '#398BFF';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Micro-label badge
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = `rgba(241, 245, 252, ${p.alpha * 0.8})`;
        ctx.fillText(p.label, x + 6, y - 4);
      });

      // 6. Central core node
      const coreR = 6 + Math.sin(pulse * 1.5) * 1.5;
      ctx.save();
      ctx.shadowColor = '#398BFF';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#398BFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Core white center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] lg:h-[480px] flex items-center justify-center">
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-radial from-[#398BFF]/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10"
        aria-label="Abstract circular energy-ring tokenizer visualization"
      />

      {/* Subtle outer circular boundary aura */}
      <div className="absolute inset-10 border border-[#398BFF]/15 rounded-full pointer-events-none animate-pulse-glow" />
    </div>
  );
};
