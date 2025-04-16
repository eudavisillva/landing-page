document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos do DOM ---
    const paletteContainer = document.getElementById('palette-container');
    const copyTooltip = document.getElementById('copy-tooltip');
    const currentYearSpan = document.getElementById('current-year');
    const initialAdPopup = document.getElementById('initial-ad-popup');
    const closeAdPopupButton = document.getElementById('close-ad-popup');

    // --- Configurações ---
    const adFrequency = 6; // Mostrar um anúncio a cada X paletas
    const showInitialAd = true; // Mostrar o popup de anúncio inicial?
    const initialAdDelay = 1500; // Atraso em ms para mostrar o popup inicial

    // --- Atualiza o ano no rodapé ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Definição das Paletas (Mesmo array grande anterior) ---
    const palettes = [
        // ... (Cole aqui o array GIGANTE de paletas da resposta anterior) ...
        // Exemplo:
        { name: "Brisa do Oceano", colors: ["#BEE9E8", "#62B6CB", "#1B4965", "#CAE9FF", "#5FA8D3"] },
        { name: "Vibrações do Pôr do Sol", colors: ["#FFCDB2", "#FFB4A2", "#E5989B", "#B5838D", "#6D6875"] },
        { name: "Floresta Neon", colors: ["#C8F8F3", "#7CE5D3", "#3ED9A4", "#1FBC81", "#0A9A5C"] },
        { name: "Doce Nostalgia", colors: ["#F4A261", "#E76F51", "#E9C46A", "#2A9D8F", "#264653"] },
        { name: "Tons Terrosos Modernos", colors: ["#D8C3A5", "#8E8D8A", "#E98074", "#E85A4F", "#EAE7DC"] },
        { name: "Pastel Sonhador", colors: ["#A0D2DB", "#F7D1CD", "#F8EDEB", "#BEE3DB", "#89B0AE"] },
        { name: "Energia Vibrante", colors: ["#EF476F", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"] },
        { name: "Monocromático Elegante", colors: ["#CAD2C5", "#84A98C", "#52796F", "#354F52", "#2F3E46"] },
        { name: "Areias do Deserto", colors: ["#F4A261", "#E76F51", "#D8C3A5", "#8E8D8A", "#A07A54"] },
        { name: "Realeza Púrpura", colors: ["#4B0082", "#8A2BE2", "#9370DB", "#E6E6FA", "#C7B9E6"] },
        { name: "Retrô Anos 70", colors: ["#A86518", "#F58A07", "#F9A620", "#FBC204", "#7A4D0B"] },
        { name: "Tons Corporativos", colors: ["#003F5C", "#365F7C", "#6A8A9F", "#A4BAC8", "#E2EAF0"] },
        { name: "Flores da Primavera", colors: ["#FFB6C1", "#FFDAB9", "#98FB98", "#ADD8E6", "#E6E6FA"] },
        { name: "Folhas de Outono", colors: ["#A0522D", "#CD853F", "#DAA520", "#B8860B", "#8B4513"] },
        { name: "Inverno Gelado", colors: ["#F0FFFF", "#ADD8E6", "#B0C4DE", "#778899", "#4682B4"] },
        { name: "Doçura Candy", colors: ["#FFC0CB", "#FFD700", "#ADFF2F", "#87CEFA", "#EE82EE"] },
        { name: "Céu Galáctico", colors: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"] },
        { name: "Toque Metálico", colors: ["#C0C0C0", "#B0B0B0", "#A9A9A9", "#808080", "#778899"] },
        { name: "Paraíso Tropical", colors: ["#00A896", "#02C39A", "#F0F3BD", "#FF6B6B", "#FFE66D"] },
        { name: "Lavanda Suave", colors: ["#E6E6FA", "#D8BFD8", "#B0A4E3", "#9370DB", "#8A2BE2"] },
        { name: "Café Aconchegante", colors: ["#6F4E37", "#A0522D", "#D2B48C", "#F5F5DC", "#8B4513"] },
        { name: "Mar Profundo", colors: ["#001F3F", "#0074D9", "#7FDBFF", "#39CCCC", "#3D9970"] },
        { name: "Especiarias Exóticas", colors: ["#C1440E", "#E36414", "#F7B801", "#5F0F40", "#9A031E"] },
        { name: "Serenidade Cinza", colors: ["#F8F9FA", "#E9ECEF", "#DEE2E6", "#CED4DA", "#ADB5BD", "#6C757D"] },
        { name: "Verde Musgo", colors: ["#8FBC8F", "#556B2F", "#6B8E23", "#9ACD32", "#ADFF2F"] },
        { name: "Vinho Tinto", colors: ["#800000", "#A52A2A", "#B22222", "#DC143C", "#8B0000"] },
        { name: "Amanhecer Dourado", colors: ["#FFEC8B", "#FFD700", "#FFA500", "#FF8C00", "#FF4500"] },
        { name: "Cidade Noturna", colors: ["#2C3E50", "#34495E", "#95A5A6", "#BDC3C7", "#ECF0F1"] },
        { name: "Argila e Cerâmica", colors: ["#B85C38", "#E08E6D", "#F0A384", "#F8D4C4", "#5C3D2E"] },
        { name: "Frutas Cítricas", colors: ["#F4D03F", "#F5B041", "#EB984E", "#FAD7A0", "#FDEBD0"] },
        { name: "Aurora Boreal", colors: ["#4ECDC4", "#A2DED0", "#FF6B6B", "#FFE66D", "#1A535C"] },
        { name: "Pedras Preciosas", colors: ["#2E8B57", "#4682B4", "#B22222", "#FFD700", "#8A2BE2"] },
        { name: "Melancia Fresca", colors: ["#FF6B6B", "#FFE66D", "#3DCC91", "#2A9D8F", "#FFFFFF"] },
        { name: "Campo Florido", colors: ["#DDA0DD", "#EE82EE", "#DA70D6", "#BA55D3", "#9932CC"] },
        { name: "Manhã Nebulosa", colors: ["#D8D8D8", "#BDBDBD", "#A4A4A4", "#8C8C8C", "#737373"] },
        { name: "Terra Molhada", colors: ["#774F38", "#C1A791", "#E0D6C8", "#F5F0E9", "#8E6F5B"] },
        { name: "Festa Junina", colors: ["#FF6347", "#FFD700", "#32CD32", "#4169E1", "#FF4500"] },
        { name: "Sorvete Napolitano", colors: ["#D2B48C", "#FFC0CB", "#FFF8DC", "#A0522D", "#F5F5DC"] },
        { name: "Grafite Urbano", colors: ["#343A40", "#495057", "#6C757D", "#ADB5BD", "#DEE2E6"] },
        { name: "Biblioteca Antiga", colors: ["#8B4513", "#A0522D", "#D2691E", "#CD853F", "#F4A460"] }
        // ... (fim do array gigante)
    ];

    // --- Funções Auxiliares ---

    /**
     * Exibe o tooltip de feedback.
     */
    function showTooltip(message) {
        if (!copyTooltip) return;
        copyTooltip.textContent = message;
        copyTooltip.classList.add('visible');
        setTimeout(() => {
            copyTooltip.classList.remove('visible');
        }, 1500);
    }

    /**
     * Copia o código da cor para a área de transferência.
     */
    async function copyColorCode(colorCode, colorElement) {
        try {
            await navigator.clipboard.writeText(colorCode);
            const overlay = colorElement.querySelector('.copy-overlay');
            if (overlay) {
                overlay.classList.add('visible');
                setTimeout(() => overlay.classList.remove('visible'), 800);
            }
            showTooltip(`${colorCode} Copiado!`);
        } catch (err) {
            console.error('Falha ao copiar a cor: ', err);
            showTooltip('Erro ao copiar!');
        }
    }

     /**
     * Cria um elemento HTML para uma única cor da paleta.
     */
    function createColorElement(color) {
        const colorDiv = document.createElement('div');
        colorDiv.classList.add('palette__color');
        colorDiv.style.backgroundColor = color;
        colorDiv.setAttribute('title', `Clique para copiar ${color}`);
        colorDiv.setAttribute('role', 'button'); // Acessibilidade
        colorDiv.setAttribute('tabindex', '0'); // Acessibilidade (permite focar com Tab)

        const codeSpan = document.createElement('span');
        codeSpan.classList.add('palette__color-code');
        codeSpan.textContent = color;
        // codeSpan.setAttribute('aria-hidden', 'true'); // Esconder de leitores de tela (opcional)
        colorDiv.appendChild(codeSpan);

        const copyOverlay = document.createElement('div');
        copyOverlay.classList.add('copy-overlay');
        copyOverlay.textContent = 'Copiado!';
        copyOverlay.setAttribute('aria-hidden', 'true'); // Esconder de leitores de tela
        colorDiv.appendChild(copyOverlay);

        colorDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            copyColorCode(color, colorDiv);
        });

        // Copiar com Enter/Space também (Acessibilidade)
        colorDiv.addEventListener('keydown', (event) => {
             if (event.key === 'Enter' || event.key === ' ') {
                 event.preventDefault(); // Prevenir scroll da página com espaço
                 event.stopPropagation();
                 copyColorCode(color, colorDiv);
             }
         });

        return colorDiv;
    }

    /**
     * Cria um elemento HTML para uma paleta completa.
     */
    function createPaletteElement(paletteData) {
        const paletteDiv = document.createElement('article'); // Usar article para semântica
        paletteDiv.classList.add('palette');
        paletteDiv.setAttribute('aria-labelledby', `palette-name-${paletteData.name.replace(/\s+/g, '-')}`); // Acessibilidade

        const nameH3 = document.createElement('h3');
        nameH3.classList.add('palette__name');
        nameH3.textContent = paletteData.name;
        nameH3.id = `palette-name-${paletteData.name.replace(/\s+/g, '-')}`; // ID para aria-labelledby
        paletteDiv.appendChild(nameH3);

        const colorsContainer = document.createElement('div');
        colorsContainer.classList.add('palette__colors');
        paletteDiv.appendChild(colorsContainer);

        paletteData.colors.forEach(color => {
            const colorElement = createColorElement(color);
            colorsContainer.appendChild(colorElement);
        });

        return paletteDiv;
    }

     /**
     * Cria um elemento placeholder para anúncio in-content.
     * @param {number} index - O índice do anúncio (para IDs únicos de slot, se necessário).
     * @returns {HTMLElement} - O elemento div do anúncio criado.
     */
    function createAdElement(index) {
        const adDiv = document.createElement('div');
        adDiv.classList.add('ad-container', 'ad-container--in-content');
        adDiv.setAttribute('aria-hidden', 'true'); // Esconder container de acessibilidade (AdSense lida com o próprio)

        // Bloco de Anúncio AdSense In-Content
        // É crucial que SEU_AD_SLOT_ID_INCONTENT seja diferente para cada bloco ou que
        // você use o mesmo slot e deixe o AdSense otimizar (mais comum).
        // Consulte a documentação do AdSense sobre múltiplos blocos na mesma página.
        const adIns = document.createElement('ins');
        adIns.classList.add('adsbygoogle', 'ad-placeholder');
        adIns.style.display = 'block';
        // Use o MESMO client ID que você definiu no <head>
        adIns.setAttribute('data-ad-client', 'SEU_AD_CLIENT_ID');
        // Use um slot ID específico para anúncios in-content
        adIns.setAttribute('data-ad-slot', 'SEU_AD_SLOT_ID_INCONTENT'); // Pode ser o mesmo para todos os in-content
        adIns.setAttribute('data-ad-format', 'auto');
        adIns.setAttribute('data-full-width-responsive', 'true');
        adDiv.appendChild(adIns);

        const adScript = document.createElement('script');
        adScript.textContent = '(adsbygoogle = window.adsbygoogle || []).push({});';
        adDiv.appendChild(adScript); // Adiciona o script para inicializar este bloco

        return adDiv;
    }


    /**
     * Renderiza todas as paletas e anúncios no container principal.
     */
    function renderPalettesAndAds() {
        if (!paletteContainer) {
            console.error("Elemento 'palette-container' não encontrado!");
            return;
        }

        paletteContainer.innerHTML = ''; // Limpa o placeholder de loading

        if (palettes.length === 0) {
            paletteContainer.innerHTML = '<p>Nenhuma paleta encontrada.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        let adCounter = 0;
        palettes.forEach((palette, index) => {
            const paletteElement = createPaletteElement(palette);
            fragment.appendChild(paletteElement);

            // Inserir anúncio a cada 'adFrequency' paletas
            if ((index + 1) % adFrequency === 0 && index < palettes.length - 1) {
                adCounter++;
                const adElement = createAdElement(adCounter);
                fragment.appendChild(adElement);
            }
        });
        paletteContainer.appendChild(fragment);

        // Tenta reinicializar anúncios AdSense após adicionar dinamicamente
        // Isso pode ou não ser necessário dependendo de como AdSense funciona
        // if (window.adsbygoogle) {
        //     (adsbygoogle = window.adsbygoogle || []).push({});
        // } else {
        //      console.warn("AdSense script não carregado ainda.")
        // }
    }

    // --- Lógica do Anúncio Popup Inicial ---
    function setupInitialAd() {
        if (!initialAdPopup || !closeAdPopupButton || !showInitialAd) {
             if(showInitialAd) console.warn("Elementos do popup de anúncio inicial não encontrados.");
            return;
        }

        // Verifica se já foi fechado nesta sessão (opcional)
        // if (sessionStorage.getItem('initialAdClosed')) {
        //     return;
        // }

        // Mostra o popup após um atraso
        setTimeout(() => {
            initialAdPopup.classList.add('visible');
        }, initialAdDelay);

        // Fecha o popup ao clicar no botão
        closeAdPopupButton.addEventListener('click', () => {
            initialAdPopup.classList.remove('visible');
            // Marca como fechado na sessão (opcional)
            // sessionStorage.setItem('initialAdClosed', 'true');
        });

        // Fecha o popup se clicar fora da área de conteúdo (opcional)
        initialAdPopup.addEventListener('click', (event) => {
            if (event.target === initialAdPopup) { // Clicou no fundo escuro
                 initialAdPopup.classList.remove('visible');
                // sessionStorage.setItem('initialAdClosed', 'true');
            }
        });
    }


    // --- Inicialização ---
    renderPalettesAndAds();
    setupInitialAd();

}); // Fim do DOMContentLoaded

