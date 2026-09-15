import nodemailer from 'nodemailer';

/**
 * Send email using Resend HTTP API (recommended for Render), Brevo, or Nodemailer SMTP fallback.
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Plain text message fallback
 * @param {string} options.html - HTML formatted email body
 * @returns {Promise<Object>}
 */
const sendEmail = async (options) => {
  // Option 1: Resend HTTP API (Works flawlessly on Render free tier via HTTPS Port 443)
  if (process.env.RESEND_API_KEY) {
    console.log(`📧 Sending email via Resend API to: ${options.email}`);
    const fromAddress = process.env.FROM_EMAIL || 'CogniCare <onboarding@resend.dev>';

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [options.email],
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Resend API Error:', data);
      throw new Error(data.message || 'Resend API failed to dispatch email');
    }

    console.log(`✅ Email sent via Resend API to ${options.email}. ID:`, data.id);
    return { messageId: data.id };
  }

  // Option 2: Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    console.log(`📧 Sending email via Brevo API to: ${options.email}`);
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'CogniCare Support', email: process.env.FROM_EMAIL || 'no-reply@cognicare.app' },
        to: [{ email: options.email }],
        subject: options.subject,
        textContent: options.message,
        htmlContent: options.html || options.message,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('❌ Brevo API Error:', data);
      throw new Error(data.message || 'Brevo API failed to dispatch email');
    }

    console.log(`✅ Email sent via Brevo API to ${options.email}. ID:`, data.messageId);
    return { messageId: data.messageId };
  }

  // Option 3: Standard SMTP / Gmail with Nodemailer
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;

  if (!emailUser || !emailPass) {
    console.log('\n======================================================');
    console.log('📧 [CogniCare Development Email Service]');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('Message / Reset Link:');
    console.log(options.message);
    console.log('======================================================\n');

    return {
      messageId: 'dev-console-mode',
      preview: options.message,
    };
  }

  const transportConfig = emailHost
    ? {
        host: emailHost,
        port: Number(emailPort),
        secure: Number(emailPort) === 465,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      };

  const transporter = nodemailer.createTransport(transportConfig);

  const mailOptions = {
    from: process.env.FROM_EMAIL || `"CogniCare Support" <${emailUser}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${options.email}: %s`, info.messageId);
  return info;
};

export default sendEmail;
