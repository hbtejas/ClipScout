'use client';

import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  showVideo?: boolean;
  particleCount?: number;
  className?: string;
}

export function AnimatedBackground({
  showVideo = true,
  particleCount = 35,
  className = ''
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for subtle neural / video network aesthetic
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      alphaSpeed: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        alphaSpeed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
      });
    }

    // Mouse tracking for interactive glow spotlight
    let mouseX = width / 2;
    let mouseY = height / 3;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      // Lerp mouse coordinates for smooth inertia
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle interactive mouse spotlight
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 400);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.02)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Update & draw particles and connector lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.alpha += p.alphaSpeed;
        if (p.alpha > 0.5 || p.alpha < 0.1) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black select-none ${className}`}
      style={{ maxHeight: '100vh' }}
    >
      {/* Ambient Looping Video */}
      {showVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-20"
          src="https://l4wlsi8vxy8hre4v.public.blob.vercel-storage.com/video/glass-animation-5-f0gPcjmKFIV3ot5MGOdNy2r4QHBoXt.mp4"
        />
      )}

      {/* Smooth Drifting Multi-Color Aurora Glow Spheres */}
      <div className="absolute -top-[20%] left-[10%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-600/15 to-transparent blur-[140px] animate-aurora-1 pointer-events-none" />
      <div className="absolute top-[30%] right-[0%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-cyan-500/18 via-blue-600/12 to-transparent blur-[160px] animate-aurora-2 pointer-events-none" />
      <div className="absolute -bottom-[15%] left-[25%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-violet-600/18 via-fuchsia-500/12 to-transparent blur-[150px] animate-aurora-3 pointer-events-none" />

      {/* Vertical Luminous Light Beams */}
      <div className="absolute left-[18%] top-0 w-[1px] h-[70vh] bg-gradient-to-b from-transparent via-white/20 to-transparent animate-beam-1 pointer-events-none" />
      <div className="absolute right-[22%] top-0 w-[1px] h-[80vh] bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-beam-2 pointer-events-none" />

      {/* Interactive Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      />

      {/* Animated Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-35 animate-grid-glow pointer-events-none" />

      {/* Gradient Vignette Depth Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 100px 140px 120px rgb(0, 0, 0)' }}
      />
    </div>
  );
}
