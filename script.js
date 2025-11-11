const sendBtn = document.getElementById('sendBtn');

const promptEl = document.getElementById('prompt');

const responseEl = document.getElementById('response');

const modelEl = document.getElementById('model');


async function sendPrompt() {

  const prompt = promptEl.value.trim();

  if (!prompt) {

    alert('Digite uma pergunta!');

    return;

  }


  sendBtn.disabled = true;

  sendBtn.textContent = 'Enviando...';

  responseEl.textContent = 'Carregando...';


  try {

    // Faz POST para o seu backend seguro (ver server/server.js)

    const res = await fetch('/api/generate', {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ model: modelEl.value, prompt })

    });


    if (!res.ok) {

      const err = await res.text();

      responseEl.textContent = `Erro: ${res.status} — ${err}`;

    } else {

      const data = await res.json();

      // espera que o backend retorne { text: "..." }

      responseEl.textContent = data.text ?? JSON.stringify(data, null, 2);

    }

  } catch (err) {

    responseEl.textContent = 'Erro ao conectar com o servidor: ' + err.message;

  } finally {

    sendBtn.disabled = false;

    sendBtn.textContent = 'Enviar';

  }

}


sendBtn.addEventListener('click', sendPrompt);


// opcional: enviar com Ctrl+Enter

promptEl.addEventListener('keydown', (e) => {

  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendPrompt();

});

