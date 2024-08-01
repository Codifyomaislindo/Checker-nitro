 const TOKENS = [
            'MTE5ODE5OTk7MzM2ODU3ODE0OA.G2-_CW.-xfTpWGx-ujcpK83P4Q2AYD2-XAKsc5QNo5DHo',
            'MTI2NjM5NTQ5MjMwMTAxNzExOA.GkrpKg.jQRc_3FvGFSrhJsf87JxuihjiAkP9zfYO-5KjI'
        ];
        const PROXY_URL = 'http://20.206.106.192:8123';
        let useProxy = false;
        let validLinks = [];

        function getToken() {
            const token = TOKENS.shift();
            TOKENS.push(token);
            return token;
        }

        function toggleProxy() {
            useProxy = !useProxy;
            const proxyToggleBtn = document.getElementById('proxyToggleBtn');
            if (useProxy) {
                proxyToggleBtn.textContent = 'Desativar Proxy';
                proxyToggleBtn.style.backgroundColor = '#dc3545';
                proxyToggleBtn.style.color = '#ffffff';
                proxyToggleBtn.onmouseover = () => { proxyToggleBtn.style.backgroundColor = '#c82333'; };
            } else {
                proxyToggleBtn.textContent = 'Ativar Proxy';
                proxyToggleBtn.style.backgroundColor = '#ffc107';
                proxyToggleBtn.style.color = '#ffffff';
                proxyToggleBtn.onmouseover = () => { proxyToggleBtn.style.backgroundColor = '#e0a800'; };
            }
        }

        async function checkLink(link) {
            const apiUrl = `https://discord.com/api/v9/entitlements/gift-codes/${link.split('/').pop()}?with_application=false&with_subscription_plan=true`;
            const token = getToken();

            const options = {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const finalUrl = useProxy ? PROXY_URL : apiUrl;
            const fetchOptions = useProxy ? {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: apiUrl,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            } : options;

            try {
                const response = await fetch(finalUrl, fetchOptions);

                if (response.ok) {
                    const data = await response.json();
                    let validity = '';

                    if (!data.redeemed && data.uses === 0) {
                        const now = new Date();
                        const expiresAt = new Date(data.expires_at);

                        if (expiresAt > now) {
                            validity = 'válido, expira em ' + expiresAt.toLocaleString();
                        } else {
                            validity = 'válido, mas expirou em ' + expiresAt.toLocaleString();
                        }
                    } else {
                        validity = 'inválido';
                    }

                    let planInfo = '';
                    if (data.subscription_plan) {
                        const planLength = data.subscription_plan.interval_count;
                        if (planLength === 1) {
                            planInfo = 'Plano mensal';
                        } else if (planLength === 3) {
                            planInfo = 'Plano trimestral';
                        } else {
                            planInfo = 'Plano desconhecido';
                        }
                    } else {
                        planInfo = 'Plano desconhecido';
                    }

                    return { validity, planInfo };
                } else {
                    return { validity: 'inválido', planInfo: 'Plano desconhecido' };
                }
            } catch (error) {
                console.error('Erro ao verificar o link:', error);
                return { validity: 'erro na verificação', planInfo: 'Plano desconhecido' };
            }
        }

        document.getElementById('linkForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const linksInput = document.getElementById('linksInput');
            const results = document.getElementById('results');
            const summary = document.getElementById('summary');
            const loading = document.getElementById('loading');
            const downloadBtn = document.getElementById('downloadBtn');
            results.innerHTML = '';
            summary.innerHTML = '';
            validLinks = [];

            const links = linksInput.value.match(/https:\/\/(?:discord\.com\/billing\/promotions|promos\.discord\.gg)\/[^\s]+/g) || [];
          if (links.length === 0) {
                results.innerHTML = '<p>Nenhum link de promoção do Discord encontrado.</p>';
                return;
            }

            loading.style.display = 'block';
            let validCount = 0;
            let invalidCount = 0;
            let errorCount = 0;

            for (const link of links) {
                const { validity, planInfo } = await checkLink(link);
                let statusClass = '';
                if (validity.startsWith('válido')) {
                    validCount++;
                    validLinks.push(link);
                    statusClass = 'valid';
                } else if (validity === 'inválido') {
                    invalidCount++;
                    statusClass = 'invalid';
                } else {
                    errorCount++;
                    statusClass = 'error';
                }

                const item = document.createElement('div');
                item.classList.add('result-item', statusClass);
                item.innerHTML = `${link} - ${validity}<br><span class="plan-info">${planInfo}</span>`;
                results.appendChild(item);
            }

            loading.style.display = 'none';
            summary.innerHTML = `Total de links válidos: ${validCount}<br>Total de links inválidos: ${invalidCount}<br>Total de erros na verificação: ${errorCount}`;

            if (validLinks.length > 0) {
                downloadBtn.style.display = 'block';
            } else {
                downloadBtn.style.display = 'none';
            }
        });

        function downloadValidLinks() {
            const blob = new Blob([validLinks.join('\n')], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'validos.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
