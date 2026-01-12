// Configurações (Idealmente, isso viria do .env.local, explico abaixo)
const TELEGRAM_TOKEN = "8501317309:AAHRFvwvFTcG23GGqt2R-KMFq9NjTqIZgjM";
const CHAT_ID = "6021688560";

export const enviarNotificacao = async (mensagem: string): Promise<boolean> => {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: mensagem,
        parse_mode: 'Markdown',
      }),
    });

    if (response.ok) {
      console.log("✅ Notificação enviada!");
      return true;
    } else {
      console.error("❌ Erro ao enviar:", await response.text());
      return false;
    }
  } catch (error) {
    console.error("❌ Erro de conexão:", error);
    return false;
  }
};
