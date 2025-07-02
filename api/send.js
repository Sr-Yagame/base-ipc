export default async function handler(req, res) {
  const CHAT_ID = "SEU_CHAT_ID_AQUI";
  const MESSAGE_PREFIX = "[Minha App] ";

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  try {
    const fullMessage = `${MESSAGE_PREFIX}${message}`;
    
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: fullMessage,
        }),
      }
    );

    const data = await telegramResponse.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return res.status(200).json({ 
      success: true,
      sent_message: fullMessage,
      chat_id: CHAT_ID
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
  }
