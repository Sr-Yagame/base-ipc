export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://redirecting-wait.netlify.app');
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

  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      hint: 'Include valid Authorization header'
    });
  }

  const { message, chat_id } = req.body;
  if (!message || !chat_id) {
    return res.status(400).json({ 
      error: 'Bad request',
      required: { 
        message: "string", 
        chat_id: "number|string (Telegram Chat ID)" 
      },
      example: { 
        message: "Hello World", 
        chat_id: "123456789" 
      }
    });
  }

  try {
    const fullMessage = `${message}`;
    
    const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat_id,
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
      chat_id: chat_id,
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
