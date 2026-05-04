import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { smtpConfig, otp } = await req.json();

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    // Read logo for CID attachment
    const logoPath = path.join(process.cwd(), 'public', 'chittortech-logo.png');
    const hasLogo = fs.existsSync(logoPath);

    const mailOptions = {
      from: `"CHITTORTECH" <${smtpConfig.user}>`,
      to: smtpConfig.user,
      subject: '🔐 Your SMTP Verification Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #020617; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="padding: 40px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
             ${hasLogo ? `<img src="cid:ctlogo" alt="CHITTORTECH" style="height: 60px; width: auto; margin: 0 auto; display: block;">` : `<div style="color: #0ea5e9; font-size: 24px; font-weight: 800; letter-spacing: 5px;">CHITTORTECH</div>`}
          </div>
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 10px; font-weight: 600;">Verification Required</h2>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin-bottom: 30px;">
              Use the following secure authorization code to finalize your SMTP server configuration on MailPulse Elite.
            </p>
            <div style="background: rgba(14, 165, 233, 0.1); border: 1px dashed #0ea5e9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
              <div style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otp}</div>
            </div>
            <p style="color: #64748b; font-size: 12px;">
              This code will expire shortly. If you did not request this, please ignore this email.
            </p>
          </div>
          <div style="background-color: rgba(255,255,255,0.02); padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="font-size: 10px; color: #475569; letter-spacing: 1px;">
              © 2026 CHITTORTECH
            </div>
          </div>
        </div>
      `,
      attachments: hasLogo ? [{
        filename: 'chittortech-logo.png',
        path: logoPath,
        cid: 'ctlogo'
      }] : []
    };

    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true, message: 'OTP sent to your email' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}
