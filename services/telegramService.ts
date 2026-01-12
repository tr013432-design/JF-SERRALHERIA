// services/telegramService.ts

export const enviarNotificacao = async (mensagem: string) => {
  // ⚠️ DADOS HARDCODED PARA TESTE (Depois voltamos para o .env)
  const token = "8501317309:AAHRFvwvFTcG23GGqt2R-KMFq9NjTqIZgjM";
  const chatId = "6021688560";

  console.log("1. Iniciando envio para o Telegram..."); // LOG 1

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagem,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    console.log("2. Resposta do Telegram:", data); // LOG 2

    if (data.ok) {
      alert("✅ Mensagem enviada com sucesso!");
    } else {
      console.error("❌ Erro do Telegram:", data);
      alert("❌ Erro: Veja o console (F12)");
    }

  } catch (error) {
    console.error("❌ Erro de Rede/Código:", error);
    alert("❌ Erro Crítico: Veja o console (F12)");
  }
};
