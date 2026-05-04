'use client';

import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, CheckCircle, AlertCircle, BarChart3, Settings, Loader2, X, Terminal, Zap, Info, ShieldCheck, Mail as MailIcon, Activity, Cpu, Globe, Award, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function MailingDashboard() {
  const [emails, setEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0 });
  const [logs, setLogs] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [latency, setLatency] = useState('24ms');
  const [networkSpeed, setNetworkSpeed] = useState('Checking...');
  const [isOffline, setIsOffline] = useState(false);
  const [pendingEmails, setPendingEmails] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [verifyStep, setVerifyStep] = useState('idle'); 
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [smtpConfig, setSmtpConfig] = useState({ host: 'smtp.gmail.com', port: 465, user: '', pass: '', secure: true });
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState(null); // { type, title, message }

  // Load from LocalStorage ONLY on client mount
  useEffect(() => {
    setIsMounted(true);
    const savedConfig = localStorage.getItem('smtp_config');
    const savedEmails = localStorage.getItem('pulse_emails');
    const savedSubject = localStorage.getItem('pulse_subject');
    const savedBody = localStorage.getItem('pulse_body');
    const savedStats = localStorage.getItem('pulse_stats');
    const savedLogs = localStorage.getItem('pulse_logs');
    
    if (savedConfig) setSmtpConfig(JSON.parse(savedConfig));
    if (savedEmails) setEmails(savedEmails);
    if (savedSubject) setSubject(savedSubject);
    if (savedBody) setBody(savedBody);
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  // Save to LocalStorage ONLY after mounting and when data changes
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem('pulse_emails', emails);
    localStorage.setItem('pulse_subject', subject);
    localStorage.setItem('pulse_body', body);
    localStorage.setItem('pulse_stats', JSON.stringify(stats));
    localStorage.setItem('pulse_logs', JSON.stringify(logs));
    localStorage.setItem('smtp_config', JSON.stringify(smtpConfig));
  }, [emails, subject, body, stats, logs, smtpConfig, isMounted]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (!navigator.onLine) setIsOffline(true);

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowConfig(false);
        setShowBranding(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    const updateLatency = () => {
      const baseLatency = 24;
      const fluctuation = Math.floor(Math.random() * 8) - 4; // +/- 4ms
      setLatency(`${baseLatency + fluctuation}ms`);
    };
    
    updateLatency();
    const interval = setInterval(updateLatency, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const parseEmails = (input) => {
    return input.split(/[,\n]/).map(e => e.trim()).filter(e => e.includes('@'));
  };

  useEffect(() => {
    if (!isOffline && isPaused && pendingEmails.length > 0) {
      setLogs(prev => [{ email: 'SYSTEM', status: 'success', time: new Date().toLocaleTimeString(), message: 'CONNECTION RESTORED - RESUMING DISPATCH...' }, ...prev]);
      resumeSend(pendingEmails);
    }
  }, [isOffline]);

  const resumeSend = async (list) => {
    setIsSending(true);
    setIsPaused(false);
    const currentList = [...list];
    
    for (let i = 0; i < currentList.length; i++) {
      const email = currentList[i];
      if (!navigator.onLine) {
        setIsPaused(true);
        setPendingEmails(currentList.slice(i));
        setLogs(prev => [{ email: 'SYSTEM', status: 'error', error: 'CONNECTION LOST - DISPATCH PAUSED', time: new Date().toLocaleTimeString() }, ...prev]);
        return;
      }
      
      try {
        const res = await fetch('/api/send-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, subject, body, smtpConfig }),
        });
        const data = await res.json();
        if (data.success) {
          setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
          setLogs(prev => [{ email, status: 'success', time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        setLogs(prev => [{ email, status: 'error', error: error.message, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
      }
    }

    setIsSending(false);
    setPendingEmails([]);
    confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#00f2ff', '#7000ff', '#00ffaa'] });
  };

  const handleSend = async () => {
    const emailList = parseEmails(emails);
    if (emailList.length === 0) return alert('Please enter valid email addresses');
    if (!subject || !body) return alert('Please fill in subject and body');

    setIsSending(true);
    setStats({ total: emailList.length, sent: 0, failed: 0 });
    setLogs([]);
    setPendingEmails(emailList);
    
    resumeSend(emailList);
  };

  const requestOtp = async () => {
    if (!smtpConfig.user || !smtpConfig.pass || !smtpConfig.host) {
      return alert('Please fill in all SMTP details first');
    }
    
    setVerifyStep('sending');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      const res = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtpConfig, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyStep('pending_otp');
        setResendCooldown(30); // 30s cooldown
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      let friendlyMsg = 'Connection Failed. Please check your Server Address and Port.';
      if (error.message.includes('535')) {
        friendlyMsg = 'The Email or App Password you entered is incorrect. Please double-check your credentials.';
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
        friendlyMsg = 'The SMTP Server address seems incorrect. Please verify it.';
      } else if (error.message.includes('ETIMEDOUT')) {
        friendlyMsg = 'The server is taking too long to respond. Check your Port and Security settings.';
      }
      
      setNotification({
        type: 'error',
        title: 'SMTP SERVER ERROR',
        message: friendlyMsg
      });
      setVerifyStep('idle');
    }
  };

  const confirmVerification = () => {
    if (userOtp === generatedOtp) {
      localStorage.setItem('smtp_config', JSON.stringify(smtpConfig));
      setShowConfig(false);
      setVerifyStep('idle');
      setUserOtp('');
      setNotification({
        type: 'success',
        title: 'CHITTORTECH SECURE',
        message: 'SMTP Configuration Verified & Secured successfully.'
      });
    } else {
      setNotification({
        type: 'error',
        title: 'SECURITY ERROR',
        message: 'Invalid Verification Code. Please check your email again.'
      });
    }
  };

  const progress = stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;

  return (
    <div className="dashboard-wrapper" style={{ height: '100vh', padding: '1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '60px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '0.6rem', borderRadius: '50%', boxShadow: '0 0 20px var(--primary-glow)' }}
          >
            <Zap size={22} color="white" />
          </motion.div>
          <div>
            <h1 className="premium-gradient" style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }}>MAILPULSE ELITE</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <motion.div 
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--muted)', letterSpacing: '0.1em', fontWeight: '700' }}>SYSTEM ONLINE / SECURE ENDPOINT</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', marginRight: '2rem', paddingRight: '2rem', borderRight: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: '800' }}>SYSTEM LATENCY</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>{latency}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontWeight: '800' }}>CONNECTION</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>STABLE</div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowBranding(true)}
            className="glass-card" 
            style={{ 
              padding: '0.6rem', 
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.03)',
              color: '#fff',
              border: '1px solid var(--border)'
            }}
          >
            <Info size={18} />
          </button>
          
          <button 
            onClick={() => setShowConfig(true)}
            className="glass-card" 
            style={{ 
              padding: '0.6rem 1.25rem', 
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: '800',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: '1px solid var(--primary)',
              boxShadow: '0 0 15px rgba(0, 242, 255, 0.1)'
            }}
          >
            <Settings size={16} style={{ marginRight: '0.5rem' }} />
            SMTP PROTOCOL
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '1rem', overflow: 'hidden' }}>
        {/* Left Column: Recipients */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <section className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={18} className="premium-gradient" />
                <h2 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>RECIPIENTS</h2>
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                CSV / RAW
              </div>
            </div>
            <textarea 
              placeholder="Inject email database..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              style={{ flex: 1, resize: 'none', fontSize: '0.8rem', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.05)', background: '#050505' }}
            />
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '600' }}>READY FOR UPLOAD</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)' }}>{parseEmails(emails).length} NODES</div>
            </div>
          </section>
        </div>

        {/* Center Column: Content & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <section className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <Mail size={18} className="premium-gradient" />
              <h2 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>CONTENT BLUEPRINT</h2>
            </div>
            <input 
              type="text" 
              placeholder="Subject Line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ fontWeight: '800', fontSize: '1rem', background: '#050505' }}
            />
            <textarea 
              placeholder="Develop transmission payload (HTML enabled)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{ flex: 1, resize: 'none', background: '#050505' }}
            />
            
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 40px var(--primary-glow)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={isSending}
              style={{
                background: 'linear-gradient(135deg, #00f2ff 0%, #0072ff 100%)',
                color: '#000',
                padding: '1.25rem',
                borderRadius: '0.25rem',
                fontSize: '1.1rem',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '0.5rem',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0, 242, 255, 0.2)'
              }}
            >
              {isSending ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>TRANSMITTING BATCH... {stats.sent + stats.failed}/{stats.total}</span>
                </>
              ) : (
                <>
                  <Send size={24} />
                  <span>INITIALIZE DISPATCH</span>
                </>
              )}
            </motion.button>
          </section>
        </div>

        {/* Right Column: Stats & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
          <section className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Activity size={18} className="premium-gradient" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>ENGINE METRICS</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: '#050505', borderRadius: '0.25rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--muted)', fontWeight: '800' }}>QUEUE</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fff' }}>{stats.total}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(0, 255, 170, 0.05)', borderRadius: '0.25rem', border: '1px solid var(--success)' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--success)', fontWeight: '800' }}>SENT</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--success)' }}>{stats.sent}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255, 0, 85, 0.05)', borderRadius: '0.25rem', border: '1px solid var(--error)' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--error)', fontWeight: '800' }}>FAIL</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--error)' }}>{stats.failed}</div>
              </div>
            </div>
            {stats.total > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    style={{ height: '100%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary-glow)' }}
                  />
                </div>
              </div>
            )}
          </section>

          <section className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Terminal size={18} className="premium-gradient" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.05em' }}>COMMAND CONSOLE</h3>
            </div>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', fontSize: '0.7rem', fontFamily: 'monospace' }}>
              {logs.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', opacity: 0.5 }}>
                  $ idle_state_ready_for_input
                </div>
              ) : (
                logs.map((log, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        padding: '0.4rem 0.5rem', 
                        borderLeft: `2px solid ${log.status === 'success' ? 'var(--success)' : 'var(--error)'}`,
                        background: 'rgba(255,255,255,0.01)',
                        marginBottom: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <span style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>[{log.time}]</span>
                      <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.email} {log.message && <span style={{ opacity: 0.5 }}>— {log.message}</span>}
                      </div>
                      <span style={{ color: log.status === 'success' ? 'var(--success)' : 'var(--error)', fontWeight: '800' }}>
                        {log.error ? 'PAUSED' : log.status.toUpperCase()}
                      </span>
                    </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showBranding && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowBranding(false)}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(30px)',
              zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card" 
              style={{ 
                width: '100%', maxWidth: '440px', padding: '0', 
                overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
                background: '#000', boxShadow: '0 0 100px rgba(0, 242, 255, 0.1)'
              }}
            >
              <div style={{ height: '140px', background: 'linear-gradient(135deg, #00f2ff 0%, #7000ff 100%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>
                
                {/* Close Button */}
                <button 
                  onClick={() => setShowBranding(false)}
                  style={{ 
                    position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.3)', 
                    border: 'none', borderRadius: '50%', padding: '0.5rem', color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                  }}
                >
                  <X size={18} />
                </button>

                <motion.div 
                  initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  style={{ background: '#000', padding: '1rem', borderRadius: '1.5rem', border: '2px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  <img src="/chittortech-logo.png" alt="CT" style={{ height: '60px', width: 'auto' }} />
                </motion.div>
              </div>

              <div style={{ padding: '3rem 2.5rem 2.5rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>CHITTORTECH</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
                  <Award size={14} color="var(--primary)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: '800', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Engineering Excellence</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#050505', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(0, 255, 170, 0.2)' }}>
                    <ShieldCheck size={24} color="var(--success)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff' }}>Official Recognition</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>iStart Rajasthan Approved</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#050505', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
                    <Zap size={24} color="var(--primary)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#fff' }}>Startup India</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Founder Listed on Startup India</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    <a href="https://www.chittortech.online/" target="_blank" rel="noopener noreferrer" style={{ 
                      textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      gap: '0.75rem', background: '#fff', color: '#000', padding: '1rem', 
                      borderRadius: '0.25rem', fontWeight: '900', fontSize: '1rem', transition: '0.3s'
                    }}>
                      <Globe size={20} />
                      OFFICIAL WEBSITE
                    </a>
                    
                    <a href="mailto:chittortech@gmail.com" style={{ 
                      textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      gap: '0.5rem', color: 'var(--muted)', fontSize: '0.8rem', fontWeight: '700'
                    }}>
                      <MailIcon size={14} />
                      chittortech@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ marginTop: '3rem', fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.15em', opacity: 0.7, fontWeight: '700' }}>
                  DESIGNED & ENGINEERED BY CHITTORTECH<br/>
                  © {new Date().getFullYear()} ALL RIGHTS RESERVED
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfig && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', border: '1px solid var(--primary)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.05em' }}>SERVER SETTINGS</h2>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '700', marginTop: '0.2rem' }}>CONFIGURE YOUR OUTGOING MAIL SERVER</div>
                </div>
                <button onClick={() => setShowConfig(false)} style={{ background: 'none', color: 'var(--muted)' }}><X size={24} /></button>
              </div>
              
              {/* Presets */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', display: 'block', marginBottom: '0.75rem' }}>QUICK PRESETS</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { name: 'Gmail', host: 'smtp.gmail.com', port: 465 },
                    { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587 },
                    { name: 'Zoho', host: 'smtp.zoho.com', port: 465 },
                    { name: 'Other', host: '', port: 465 }
                  ].map(p => (
                    <button 
                      key={p.name}
                      onClick={() => setSmtpConfig({ ...smtpConfig, host: p.host, port: p.port })}
                      style={{ 
                        flex: 1, padding: '0.5rem', background: smtpConfig.host === p.host ? 'var(--primary)' : 'rgba(255,255,255,0.05)', 
                        color: smtpConfig.host === p.host ? '#000' : '#fff', border: '1px solid var(--border)', borderRadius: '0.25rem', 
                        fontSize: '0.7rem', fontWeight: '800' 
                      }}
                    >
                      {p.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>SMTP SERVER (e.g., smtp.gmail.com)</label>
                    <input value={smtpConfig.host} onChange={e => setSmtpConfig({...smtpConfig, host: e.target.value})} style={{ background: '#050505', padding: '0.75rem', fontSize: '0.9rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>PORT</label>
                    <input type="number" value={smtpConfig.port} onChange={e => setSmtpConfig({...smtpConfig, port: parseInt(e.target.value)})} style={{ background: '#050505', padding: '0.75rem', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>SENDER EMAIL ADDRESS</label>
                  <input value={smtpConfig.user} onChange={e => setSmtpConfig({...smtpConfig, user: e.target.value})} style={{ background: '#050505', padding: '0.75rem', fontSize: '0.9rem' }} placeholder="yourname@domain.com" />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: '800' }}>APP PASSWORD (NOT LOGIN PASS)</label>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '700' }}>GET KEY →</a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPass ? "text" : "password"} 
                      value={smtpConfig.pass} 
                      onChange={e => setSmtpConfig({...smtpConfig, pass: e.target.value})} 
                      style={{ background: '#050505', padding: '0.75rem', paddingRight: '2.5rem', fontSize: '0.9rem', width: '100%' }} 
                      placeholder="xxxx xxxx xxxx xxxx" 
                    />
                    <button 
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--muted)', padding: 0 }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--muted)', marginTop: '0.4rem', fontStyle: 'italic' }}>* Use an "App Password" generated from your account security settings.</div>
                </div>

                {verifyStep === 'pending_otp' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ border: '1px solid var(--primary)', padding: '1.25rem', borderRadius: '0.5rem', background: 'rgba(0, 242, 255, 0.05)', textAlign: 'center' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800', display: 'block', marginBottom: '0.5rem' }}>ENTER VERIFICATION CODE SENT TO EMAIL</label>
                    <input 
                      value={userOtp} 
                      onChange={e => setUserOtp(e.target.value)} 
                      style={{ background: '#000', textAlign: 'center', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.5rem', padding: '0.5rem', width: '100%', marginBottom: '1rem' }} 
                      maxLength={6}
                      placeholder="000000"
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={requestOtp}
                        disabled={resendCooldown > 0}
                        style={{ background: 'none', color: resendCooldown > 0 ? 'var(--muted)' : 'var(--primary)', fontSize: '0.7rem', fontWeight: '800', padding: 0, opacity: resendCooldown > 0 ? 0.5 : 1 }}
                      >
                        {resendCooldown > 0 ? `RESEND CODE IN ${resendCooldown}S` : 'RESEND CODE'}
                      </button>
                    </div>
                  </motion.div>
                )}

                <button 
                  onClick={verifyStep === 'pending_otp' ? confirmVerification : requestOtp}
                  disabled={verifyStep === 'sending'}
                  style={{ 
                    marginTop: '1rem', background: 'var(--primary)', color: '#000', 
                    padding: '1.25rem', borderRadius: '0.25rem', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.1em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                  }}
                >
                  {verifyStep === 'sending' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>INITIALIZING VERIFICATION...</span>
                    </>
                  ) : verifyStep === 'pending_otp' ? (
                    <>
                      <ShieldCheck size={18} />
                      <span>AUTHORIZE & SECURE</span>
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      <span>VERIFY & SAVE CONFIG</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(40px)',
              zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center', padding: '2rem'
            }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="glass-card" 
              style={{ maxWidth: '400px', border: '1px solid var(--error)', boxShadow: '0 0 50px rgba(239, 68, 68, 0.2)' }}
            >
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <AlertCircle size={40} color="var(--error)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '1rem' }}>SYSTEM OFFLINE</h2>
              
              {isPaused && pendingEmails.length > 0 ? (
                <div style={{ background: 'rgba(255, 242, 0, 0.05)', border: '1px solid rgba(255, 242, 0, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '800', marginBottom: '0.25rem' }}>TRANSMISSION PAUSED</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700' }}>
                    {stats.sent} / {stats.total} Emails Processed
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                    Will resume from the next recipient automatically.
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Critical connection lost. MailPulse Elite has suspended all operations to prevent data loss.
                </p>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--error)', fontWeight: '700' }}>
                <Loader2 size={16} className="animate-spin" />
                <span>AWAITING RECONNECTION...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ 
                width: '100%', maxWidth: '400px', background: '#020617', border: `1px solid ${notification.type === 'error' ? '#ef4444' : 'var(--primary)'}`, 
                borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
              }}
            >
              <div style={{ background: notification.type === 'error' ? '#ef4444' : 'var(--primary)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#000' }}>
                {notification.type === 'error' ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                <span style={{ fontWeight: '900', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{notification.title}</span>
              </div>
              <div style={{ padding: '2rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>{notification.message}</p>
                <button 
                  onClick={() => setNotification(null)}
                  style={{ 
                    marginTop: '2rem', width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid var(--border)', borderRadius: '0.5rem', color: '#fff', fontWeight: '800', fontSize: '0.8rem' 
                  }}
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
