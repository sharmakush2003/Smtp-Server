import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const { email, subject, body, smtpConfig } = await request.json();

    if (!email || !subject || !body) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Use provided SMTP config or default to environment variables
    const emailUser = smtpConfig?.user || process.env.EMAIL_USER;
    const emailPass = smtpConfig?.pass || process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return NextResponse.json({ 
        message: 'Email credentials missing. Please configure SMTP settings.', 
        success: false 
      }, { status: 401 });
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig?.host || 'smtp.gmail.com',
      port: smtpConfig?.port || 465,
      secure: smtpConfig?.secure !== false, // default to true
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Read logo for CID attachment
    const logoPath = path.join(process.cwd(), 'public', 'chittortech-logo.png');
    const hasLogo = fs.existsSync(logoPath);

    const mailOptions = {
      from: `"CHITTORTECH" <${emailUser}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #020617; padding: 40px; text-align: center;">
            ${hasLogo ? `<img src="cid:ctlogo" alt="CHITTORTECH" style="height: 80px; width: auto; margin: 0 auto; display: block;">` : `<div style="color: #0ea5e9; font-size: 26px; font-weight: 800; letter-spacing: 5px;">CHITTORTECH</div>`}
          </div>
          <div style="padding: 40px 35px; color: #1e293b; line-height: 1.8;">
            <div style="font-size: 16px;">
              ${body.replace(/\n/g, '<br/>')}
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">
              Secure Transmission by <span style="color: #0ea5e9;">CHITTORTECH</span>
            </p>
            <div style="margin-top: 15px; font-size: 10px; color: #94a3b8; letter-spacing: 1px;">
              © 2026 CHITTORTECH. ALL RIGHTS RESERVED.
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
    return NextResponse.json({ 
      message: 'Email sent successfully', 
      success: true 
    });

  } catch (error) {
    console.error('Error in send-bulk API:', error);
    return NextResponse.json({ 
      message: `Failed to send email: ${error.message}`, 
      success: false 
    }, { status: 500 });
  }
}
