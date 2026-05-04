import MailingDashboard from '@/components/MailingDashboard';
import ResponsiveGate from '@/components/ResponsiveGate';

export default function Home() {
  return (
    <main style={{ height: '100vh', overflow: 'hidden' }}>
      <ResponsiveGate>
        <MailingDashboard />
      </ResponsiveGate>
    </main>
  );
}
