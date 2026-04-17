const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, first_name, product } = req.body;

  if (!email || product !== 'COIBot') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('Missing RESEND_API_KEY');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const name = first_name ? `${first_name}` : 'Friend';

  const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #070d14; color: #e8f0f8; }
    .container { max-width: 600px; margin: 0 auto; padding: 2rem; }
    .header { padding-bottom: 2rem; border-bottom: 1px solid #0f1f2e; }
    .logo { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .logo-icon { width: 24px; height: 24px; }
    .logo-text { font-size: 1.125rem; font-weight: 700; color: #e8f0f8; }
    h1 { font-size: 1.75rem; line-height: 1.2; margin: 1.5rem 0 1rem; color: #e8f0f8; }
    .accent { color: #f59e0b; }
    .content { padding: 2rem 0; }
    p { color: #94a8b8; line-height: 1.7; margin: 1rem 0; }
    .cta-section { background: rgba(245, 158, 11, 0.08); border: 1px solid #0f1f2e; border-radius: 0.5rem; padding: 2rem; margin: 2rem 0; text-align: center; }
    .cta-text { color: #94a8b8; margin-bottom: 1rem; }
    .footer { border-top: 1px solid #0f1f2e; padding-top: 2rem; margin-top: 2rem; font-size: 0.875rem; color: #64748b; }
    .footer a { color: #f59e0b; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="logo-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span class="logo-text">COIBot</span>
      </div>
      <p style="margin: 0; color: #94a8b8; font-size: 0.875rem;">You're on the early access list</p>
    </div>

    <div class="content">
      <h1>You're in, ${name}.</h1>
      <p>Thanks for joining the COIBot early access list. We're excited to have you on board.</p>

      <p>Over the next few weeks, we'll be onboarding early users to test automated ACORD 25 certificate generation from AMS360. If you run an independent P&C agency and are tired of manually building COIs, this is for you.</p>

      <div class="cta-section">
        <p class="cta-text">What's happening next:</p>
        <p style="margin: 0.75rem 0; color: #e8f0f8;"><strong>Week 1:</strong> We confirm your agency uses AMS360 and schedule a quick onboarding call.</p>
        <p style="margin: 0.75rem 0; color: #e8f0f8;"><strong>Week 2:</strong> COIBot connects to your AMS360 instance. We load your insureds and set up templates.</p>
        <p style="margin: 0.75rem 0; color: #e8f0f8;"><strong>Week 3+:</strong> You start generating COIs. One click, 12 seconds, zero errors.</p>
      </div>

      <p>We'll email you within the next 2-3 days to confirm your details and schedule a short call. In the meantime, if you have any questions, just reply to this email.</p>

      <p>Thanks for the support.<br><strong>Dario</strong><br><a href="https://leanaistudio.com" style="color: #f59e0b; text-decoration: none;">LeanAI Studio</a></p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 0.5rem;">© 2026 LeanAI Studio srl</p>
      <p style="margin: 0;">You received this email because you signed up for COIBot early access.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@leanaistudio.com',
        to: email,
        subject: `You're on the COIBot early access list`,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Resend notify error:', error);
    return res.status(500).json({ error: error.message });
  }
};
