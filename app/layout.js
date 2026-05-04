import './globals.css';

export const metadata = {
  title: 'MailPulse | Elite Bulk Mailing System',
  description: 'A premium SaaS for bulk email distribution with real-time analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="glow-mesh"></div>
        {children}
      </body>
    </html>
  );
}
