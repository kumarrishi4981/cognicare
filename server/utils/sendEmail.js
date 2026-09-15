import nodemailer from 'nodemailer';

/**
 * Send email using Nodemailer with fallback to console logging if credentials are missing.
 * @param {Object} options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Plain text message fallback
 * @param {string} options.html - HTML formatted email body
 * @returns {Promise<Object>}
 */
const sendEmail = async (options) => {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT || 587;

  // If credentials are not yet configured in .env, log directly to console for instant testing
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

  // Create transporter configuration
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
