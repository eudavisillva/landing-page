document.addEventListener('DOMContentLoaded', () => {
    // --- Constantes de Configuração ---
    const PALETTES_JSON_URL = 'palettes.json'; // Caminho para o seu arquivo JSON
    const AD_CLIENT_ID = 'ca-pub-2564342045205144'; // SEU Client ID do AdSense (Atualizado)
    // ATENÇÃO: Usando o mesmo Slot ID para in-content e popup.
    // Para melhor rastreamento, considere criar blocos de anúncio separados no AdSense
    // com IDs de slot diferentes para cada posicionamento (ex: in-content, popup, header, footer).
    const AD_SLOT_ID_INCONTENT = '9244164690'; // SEU Slot ID (Atualizado)
    const AD_SLOT_ID_POPUP = '9244164690'; // SEU Slot ID para Popup (Atualizado - Usando o mesmo por enquanto)

    const AD_FREQUENCY = 6; // Mostrar um anúncio a cada X paletas
    const SHOW_INITIAL_AD = false; // Mostrar o popup de anúncio inicial?
    const INITIAL_AD_DELAY = 2500; // Atraso em ms para mostrar o popup inicial (aumentado ligeiramente)

    // --- Elementos do DOM (Cache) ---
    const paletteContainer = document.getElementById('palette-container');
    const copyTooltip = document.getElementById('copy-tooltip');
    const currentYearSpan = document.getElementById('current-year');
    // Seletores atualizados para corresponder ao HTML fornecido
    const popupAd = document.getElementById('popup-ad'); // Atualizado de initialAdPopup
    const closeAdPopupButton = document.getElementById('close-ad-popup');
    const loadingIndicator = document.getElementById('loading-indicator'); // Certifique-se que este ID existe no HTML

    // --- Funções Auxiliares ---

    /** Exibe o tooltip de feedback. */
    function showTooltip(message) {
        if (!copyTooltip) return;
        copyTooltip.textContent = message;
        copyTooltip.classList.add('visible');
        setTimeout(() => {
            copyTooltip.classList.remove('visible');
        }, 1500);
    }

    /** Copia o código da cor para a área de transferência. */
    async function copyColorCode(colorCode, colorElement) {
        if (!navigator.clipboard) {
            showTooltip('Navegador não suporta cópia.');
            console.warn('Clipboard API não disponível.');
            return;
        }
        try {
            await navigator.clipboard.writeText(colorCode);
            const overlay = colorElement.querySelector('.copy-overlay');
            if (overlay) {
                overlay.classList.add('visible');
                setTimeout(() => overlay.classList.remove('visible'), 800);
            }
            showTooltip(`${colorCode} Copiado!`);
        } catch (err) {
            console.error('Falha ao copiar a cor:', err);
            showTooltip('Erro ao copiar!');
        }
    }

    /** Cria um elemento HTML para uma única cor da paleta. */
    function createColorElement(color) {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette__color'; // Use classes do seu CSS (01.css)
        colorDiv.style.backgroundColor = color;
        colorDiv.title = `Clique para copiar ${color}`;
        colorDiv.setAttribute('role', 'button');
        colorDiv.tabIndex = 0;

        const codeSpan = document.createElement('span');
        codeSpan.className = 'palette__color-code'; // Use classes do seu CSS (01.css)
        codeSpan.textContent = color;
        colorDiv.appendChild(codeSpan);

        const copyOverlay = document.createElement('div');
        copyOverlay.className = 'copy-overlay'; // Use classes do seu CSS (01.css)
        copyOverlay.textContent = 'Copiado!';
        copyOverlay.setAttribute('aria-hidden', 'true');
        colorDiv.appendChild(copyOverlay);

        colorDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            copyColorCode(color, colorDiv);
        });

        colorDiv.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                event.stopPropagation();
                copyColorCode(color, colorDiv);
            }
        });

        return colorDiv;
    }

    /** Cria um elemento HTML para uma paleta completa. */
    function createPaletteElement(paletteData) {
        const paletteDiv = document.createElement('article');
        paletteDiv.className = 'palette'; // Use classes do seu CSS (01.css)
        // Gera um ID mais seguro para aria-labelledby
        const safeName = paletteData.name.replace(/[^a-zA-Z0-9-_]/g, '') || 'unnamed';
        const paletteId = `palette-${safeName}-${Math.random().toString(36).substring(2, 7)}`;
        paletteDiv.setAttribute('aria-labelledby', `${paletteId}-name`);

        const nameH3 = document.createElement('h3');
        nameH3.className = 'palette__name'; // Use classes do seu CSS (01.css)
        nameH3.textContent = paletteData.name;
        nameH3.id = `${paletteId}-name`;
        paletteDiv.appendChild(nameH3);

        const colorsContainer = document.createElement('div');
        colorsContainer.className = 'palette__colors'; // Use classes do seu CSS (01.css)
        paletteDiv.appendChild(colorsContainer);

        paletteData.colors.forEach(color => {
            const colorElement = createColorElement(color);
            colorsContainer.appendChild(colorElement);
        });

        return paletteDiv;
    }

    /** Cria um elemento placeholder para anúncio in-content AdSense. */
    function createAdElement(index) {
        const adDiv = document.createElement('div');
        // Use as classes definidas no seu 01.css para estilizar o container do anúncio
        adDiv.className = 'ad-container ad-container--in-content';
        adDiv.setAttribute('aria-hidden', 'true');

        const adIns = document.createElement('ins');
        adIns.className = 'adsbygoogle ad-placeholder'; // Classe para estilização/placeholder
        adIns.style.display = 'block'; // Necessário para AdSense
        adIns.setAttribute('data-ad-client', AD_CLIENT_ID);
        adIns.setAttribute('data-ad-slot', AD_SLOT_ID_INCONTENT); // Slot específico para in-content
        adIns.setAttribute('data-ad-format', 'auto');
        adIns.setAttribute('data-full-width-responsive', 'true');
        adDiv.appendChild(adIns);

        const adScript = document.createElement('script');
        // Essencial para inicializar este bloco de anúncio específico
        adScript.textContent = '(adsbygoogle = window.adsbygoogle || []).push({});';
        adDiv.appendChild(adScript);

        return adDiv;
    }

    /** Renderiza todas as paletas e anúncios no container principal. */
    function renderPalettesAndAds(palettes) {
        if (!paletteContainer) {
            console.error("Elemento 'palette-container' não encontrado!");
            return;
        }
        paletteContainer.innerHTML = ''; // Limpa indicador de loading ou conteúdo antigo

        if (!palettes || palettes.length === 0) {
            paletteContainer.innerHTML = '<p>Nenhuma paleta de cores encontrada.</p>'; // Mensagem amigável
            return;
        }

        const fragment = document.createDocumentFragment();
        let adCounter = 0;

        palettes.forEach((palette, index) => {
            if (!palette || !palette.name || !Array.isArray(palette.colors)) {
                console.warn(`Dados de paleta inválidos no índice ${index}:`, palette);
                return; // Pula esta paleta
            }
            try {
                const paletteElement = createPaletteElement(palette);
                fragment.appendChild(paletteElement);
            } catch (error) {
                 console.error(`Erro ao criar elemento para a paleta "${palette.name}":`, error);
            }

            // Inserir anúncio AdSense a cada 'AD_FREQUENCY' paletas
            if ((index + 1) % AD_FREQUENCY === 0 && index < palettes.length - 1) {
                adCounter++;
                try {
                   const adElement = createAdElement(adCounter);
                   fragment.appendChild(adElement);
                } catch(error){
                    console.error("Erro ao criar elemento de anúncio in-content:", error);
                }
            }
        });

        paletteContainer.appendChild(fragment);
    }

    /** Configura e exibe o anúncio popup inicial. */
    function setupInitialAd() {
         // Usa a variável 'popupAd' que seleciona '#popup-ad'
        if (!popupAd || !closeAdPopupButton || !SHOW_INITIAL_AD) {
            if (SHOW_INITIAL_AD) console.warn("Elementos do popup de anúncio (#popup-ad ou #close-ad-popup) não encontrados ou exibição desativada.");
            return;
        }

        // Tenta inicializar o AdSense dentro do popup ANTES de exibi-lo
        const adInsPopup = popupAd.querySelector('.adsbygoogle');
        if (adInsPopup) {
             // Define o slot ID correto para o popup
             adInsPopup.setAttribute('data-ad-slot', AD_SLOT_ID_POPUP);
             try {
                (adsbygoogle = window.adsbygoogle || []).push({});
                console.log("AdSense push chamado para o popup.");
             } catch(e){
                 console.error("Erro ao chamar push do AdSense para popup:", e);
             }
        } else {
            console.warn("Tag <ins> do AdSense não encontrada dentro de #popup-ad.");
        }


        // Mostra o popup após um atraso
        setTimeout(() => {
            // Verifica se o anúncio carregou minimamente antes de mostrar
            // (Isso é uma heurística, pode não ser 100% preciso)
            const adContent = popupAd.querySelector('.adsbygoogle ins'); // Procura conteúdo dentro da tag ins
            if (adContent && adContent.innerHTML.length > 10) { // Verifica se há algum conteúdo injetado pelo AdSense
                 console.log("Conteúdo do anúncio popup detectado, exibindo popup.");
                 popupAd.style.display = 'block'; // Ou use uma classe CSS 'visible'
                 popupAd.classList.add('visible'); // Adiciona a classe para animação/estilo
            } else if (adInsPopup && adInsPopup.getAttribute('data-ad-status') === 'filled') {
                 // Método alternativo verificando status (se AdSense o definir)
                 console.log("Status 'filled' do anúncio popup detectado, exibindo popup.");
                 popupAd.style.display = 'block';
                 popupAd.classList.add('visible');
            }
            else {
                 console.warn("Anúncio popup parece não ter carregado, não exibindo o popup automaticamente.");
                 // Você pode decidir exibir mesmo assim ou tentar novamente mais tarde
                 // popupAd.style.display = 'block'; // Descomente se quiser exibir mesmo sem conteúdo detectado
                 // popupAd.classList.add('visible');
            }
        }, INITIAL_AD_DELAY);

        // Fecha o popup ao clicar no botão X
        closeAdPopupButton.addEventListener('click', () => {
            popupAd.style.display = 'none'; // Ou remova a classe 'visible'
            popupAd.classList.remove('visible');
        });

        // Opcional: Fecha se clicar fora do conteúdo do popup (no overlay)
        popupAd.addEventListener('click', (event) => {
            // Verifica se o clique foi diretamente no elemento de fundo (popupAd)
            // e não em um de seus filhos (como o ad-popup-content)
            if (event.target === popupAd) {
                popupAd.style.display = 'none';
                popupAd.classList.remove('visible');
            }
        });
    }

    /** Atualiza o ano no rodapé. */
    function updateFooterYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        } else {
            console.warn("Elemento span#current-year não encontrado no footer.");
        }
    }

    /** Função para inicializar os anúncios fixos (header/footer) */
    function initializeFixedAds() {
        const fixedAdContainers = document.querySelectorAll('#top-ad .adsbygoogle, #footer-ad .adsbygoogle');
        if (fixedAdContainers.length > 0) {
            console.log(`Encontrados ${fixedAdContainers.length} anúncios fixos (header/footer). Tentando inicializar.`);
            fixedAdContainers.forEach(adIns => {
                // Certifique-se que o slot ID está correto (pode ser diferente do in-content/popup)
                 // Se você criou slots específicos para header/footer, defina-os aqui.
                 // Ex: adIns.setAttribute('data-ad-slot', 'SEU_SLOT_HEADER_FOOTER');
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch(e) {
                     console.error("Erro ao chamar push do AdSense para anúncio fixo:", e);
                }
            });
             // Mostra os containers após tentar inicializar (AdSense controla o preenchimento)
             document.getElementById('top-ad')?.setAttribute('style', 'display: block; margin-bottom: 1em;'); // Adiciona margem
             document.getElementById('footer-ad')?.setAttribute('style', 'display: block; margin-top: 1em;'); // Adiciona margem
        } else {
             console.log("Nenhum anúncio fixo (header/footer) encontrado para inicializar.");
        }
    }


    /** Função principal de inicialização */
    async function initializeApp() {
        updateFooterYear(); // Atualiza o ano imediatamente

        // Não chame setupInitialAd aqui se ele depende do carregamento do AdSense
        // É melhor chamá-lo depois que o AdSense provavelmente carregou

        if (!paletteContainer) {
             console.error("Container de paletas '#palette-container' não encontrado. Abortando carregamento de paletas.");
             if(loadingIndicator) loadingIndicator.textContent = 'Erro: Container principal não encontrado.';
             return;
        }
        if(loadingIndicator) loadingIndicator.style.display = 'block';

        try {
            const response = await fetch(PALETTES_JSON_URL);
            if (!response.ok) {
                // Tenta fornecer mais detalhes sobre o erro HTTP
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}, Mensagem: ${response.statusText}, Detalhes: ${errorText}`);
            }
            const palettes = await response.json();

            if(loadingIndicator) loadingIndicator.style.display = 'none';

            renderPalettesAndAds(palettes);

            // Tenta inicializar anúncios fixos e popup APÓS renderizar o conteúdo principal
            // Isso dá mais tempo para o script principal do AdSense carregar
            initializeFixedAds();
            setupInitialAd(); // Agora chama a configuração do popup

        } catch (error) {
            console.error("Falha ao carregar ou renderizar paletas:", error);
            if(loadingIndicator) loadingIndicator.style.display = 'none';
            // Exibe a mensagem de erro de forma mais visível
            paletteContainer.innerHTML = `<p class="error-message" style="color: red; font-weight: bold; padding: 1rem;">Erro ao carregar as paletas de cores. Verifique o console para detalhes e se o arquivo '${PALETTES_JSON_URL}' existe e está acessível. (${error.message})</p>`;
        }
    }

    // --- Inicialização ---
    initializeApp();

}); // Fim do DOMContentLoaded
