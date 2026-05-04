# MailPulse Elite SaaS 🚀

MailPulse is a high-performance, premium bulk mailing system designed for modern enterprises. Built with Next.js and optimized for speed and delivery.

## ✨ Features
- **Elite UI/UX**: Glassmorphic design with smooth Framer Motion animations.
- **Bulk Broadcast**: Intelligent sequential mailing to handle large volumes.
- **Live Analytics**: Real-time dashboard tracking Success, Failed, and Total metrics.
- **Dynamic SMTP**: Configure any SMTP provider on-the-fly via the dashboard.
- **Activity Logging**: Detailed logs for every email sent in the session.
- **HTML Support**: Send beautiful HTML emails directly from the platform.

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (Premium Tokens)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Mailing**: Nodemailer
- **Effects**: Canvas Confetti

## 🚀 Getting Started

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` file:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Dashboard**:
   Open [http://localhost:3000](http://localhost:3000)

## 🔒 Security
MailPulse allows dynamic SMTP configuration. Ensure you use **App Passwords** for Gmail or similar providers for maximum security.

---
Built with ❤️ by Antigravity for the Elite.
