export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: 'Method not allowed',
      docs: 'null'
    });
  }

  const { message } = req.body;
  
  // Validação apenas da mensagem (chat_id é fixo)
  if (!message) {
    return res.status(400).json({ 
      error: 'Bad request',
      required: { 
        message: "string"
      },
      note: "chat_id is fixed to predefined value"
    });
  }

  try {
    const fullMessage = `${message}`;
    const FIXED_CHAT_ID = process.env.CHAT_ID;
    
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: FIXED_CHAT_ID,
        text: fullMessage
      }),
    });

    const data = await telegramResponse.json();

    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return res.status(502).json({ 
        error: 'Telegram API failed',
        description: data.description
      });
    }

    return res.status(200).json({ 
      success: true,
      sent_message: fullMessage,
      chat_id: FIXED_CHAT_ID,
      message_id: data.result.message_id
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
