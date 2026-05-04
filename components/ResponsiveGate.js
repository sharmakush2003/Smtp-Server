'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, Laptop, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResponsiveGate({ children }) {
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isLargeScreen) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
        zIndex: 1000,
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div className="glow-mesh"></div>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            top: '20%', 
            left: '20%', 
            width: '400px', 
            height: '400px', 
            background: 'var(--primary)', 
            filter: 'blur(100px)', 
            borderRadius: '50%' 
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="glass-card"
          style={{ 
            maxWidth: '500px', 
            padding: '4rem 3rem', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8)',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{ marginBottom: '2.5rem', position: 'relative', display: 'inline-block' }}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              style={{ 
                position: 'absolute', 
                inset: '-10px', 
                border: '2px dashed rgba(14, 165, 233, 0.2)', 
                borderRadius: '50%' 
              }} 
            />
            <div style={{ 
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', 
              width: '100px', 
              height: '100px', 
              borderRadius: '2rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 20px 40px -10px var(--primary-glow)'
            }}>
              <Laptop size={48} color="white" />
            </div>
          </div>

          <h1 className="premium-gradient" style={{ fontSize: '2.25rem', marginBottom: '1.5rem', fontWeight: '900' }}>
            Desktop Optimized
          </h1>
          
          <p style={{ color: 'var(--muted)', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            MailPulse Elite's command center requires a larger canvas. 
            <span style={{ display: 'block', marginTop: '0.5rem', color: '#fff', opacity: 0.8 }}>
              Please access via Laptop or Desktop for the full experience.
            </span>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <Zap size={14} className="premium-gradient" />
              <span>Elite System</span>
            </div>
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <ShieldCheck size={14} className="premium-gradient" />
              <span>Admin Secure</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1 }}
          style={{ position: 'fixed', bottom: '3rem', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}
        >
          Product of ChittorTech
        </motion.div>
      </div>
    );
  }

  return children;
}
