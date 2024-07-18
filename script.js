async function checkLinks() {
  const links = document.getElementById('links').value.split('\n').map(link => link.trim()).filter(link => link);
  const resultsDiv = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  resultsDiv.innerHTML = '';
  summaryDiv.innerHTML = '';

  let validos = 0;
  let invalidos = 0;
  
  for (const link of links) {
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('result');
    if (link.startsWith('https://discord.com/billing/promotions/') || link.startsWith('https://promos.discord.gg/')) {
      const codigo = link.replace('https://discord.com/billing/promotions/', '').replace('https://promos.discord.gg/', '');
      const url = `https://discord.com/api/v9/entitlements/gift-codes/${codigo}?country_code=BR&with_application=false&with_subscription_plan=true`;
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          const data = await response.json();
          if (!data.redeemed && data.uses < 1) {
            resultDiv.classList.add('valid');
            resultDiv.textContent = `[VALIDO] O link (${link}) é válido [EXPIRAÇÃO] ${expiryIn(data.expires_at)}`;
            validos++;
          } else {
            resultDiv.classList.add('invalid');
            resultDiv.textContent = `[INVALIDO] O link (${link}) é inválido`;
            invalidos++;
          }
        } else {
          resultDiv.classList.add('invalid');
          resultDiv.textContent = `[INVALIDO] O link (${link}) é inválido`;
          invalidos++;
        }
      } catch (error) {
        resultDiv.classList.add('invalid');
        resultDiv.textContent = `[INVALIDO] O link (${link}) é inválido`;
        invalidos++;
      }
    } else {
      resultDiv.classList.add('invalid');
      resultDiv.textContent = `[ERRO] Esse link (${link}) não é suportado pelo checker!`;
      invalidos++;
    }
    resultsDiv.appendChild(resultDiv);
  }
  summaryDiv.innerHTML = `[FINALIZADO] | Validos: ${validos} | Invalidos: ${invalidos} | Total: ${links.length}`;
}

function expiryIn(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
          }
