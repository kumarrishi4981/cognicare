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
  let resendFailed = false;
  let resendErrorMessage = '';

  // Option 1: Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`📧 Attempting to send email via Resend API to: ${options.email}`);
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
        console.warn('⚠️ Resend API Error:', data);
        resendFailed = true;
        resendErrorMessage = data.message || 'Resend failed';
      } else {
        console.log(`✅ Email sent via Resend API to ${options.email}. ID:`, data.id);
        return { messageId: data.id };
      }
    } catch (err) {
      console.warn('⚠️ Resend fetch threw error:', err.message);
      resendFailed = true;
      resendErrorMessage = err.message;
    }
  }

  // Option 2: Brevo HTTP API
  if (process.env.BREVO_API_KEY) {
    console.log(`📧 Attempting to send email via Brevo API to: ${options.email}`);
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
    if (res.ok) {
      console.log(`✅ Email sent via Brevo API to ${options.email}. ID:`, data.messageId);
      return { messageId: data.messageId };
    }
  }

  // Option 3: Standard SMTP / Gmail with Nodemailer
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT || 465;

  if (emailUser && emailPass) {
    const cleanPass = emailPass.replace(/\s+/g, '');
    console.log(`📧 Attempting to send email via Nodemailer/Gmail to: ${options.email}`);

    const transportConfig = emailHost && emailHost !== 'smtp.gmail.com'
      ? {
          host: emailHost,
          port: Number(emailPort),
          secure: Number(emailPort) === 465,
          auth: {
            user: emailUser,
            pass: cleanPass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        }
      : {
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: cleanPass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000,
        };

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from: process.env.FROM_EMAIL || `"CogniCare Support" <${emailUser}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent via Nodemailer to ${options.email}: %s`, info.messageId);
      return info;
    } catch (smtpErr) {
      console.error('❌ Nodemailer Error:', smtpErr.message);
      if (resendFailed) {
        throw new Error(`Email sending failed: ${resendErrorMessage}`);
      }
      throw smtpErr;
    }
  }

  if (resendFailed) {
    throw new Error(resendErrorMessage || 'Email could not be delivered.');
  }

  // Fallback if no credentials configured
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
};

export default sendEmail;
