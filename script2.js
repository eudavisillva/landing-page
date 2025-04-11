// Espera o DOM (estrutura HTML) ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('landingPageBriefingForm');

    // --- Elementos Relevantes para o Cálculo de Preço ---
    const featureCheckboxes = document.querySelectorAll('#landingPageBriefingForm input[name="features"]');
    const timelineSelect = document.getElementById('timeline');
    const priceDisplayElement = document.getElementById('estimatedPrice'); // Span para mostrar o preço
    const budgetSelect = document.getElementById('budget'); // Pegar select de orçamento (necessário para pegar texto da opção)

    // --- Configuração de Preços (!!! AJUSTE ESTES VALORES CONFORME SUA REALIDADE !!!) ---
    const BASE_PRICE = 1200; // Exemplo: Preço base

    const featureCosts = {};
    featureCheckboxes.forEach(checkbox => {
        const cost = parseFloat(checkbox.getAttribute('data-cost'));
        featureCosts[checkbox.id] = !isNaN(cost) ? cost : 0;
    });

     const urgencyMultipliers = {};
      Array.from(timelineSelect.options).forEach(option => {
         const multiplier = parseFloat(option.getAttribute('data-multiplier'));
         urgencyMultipliers[option.value] = !isNaN(multiplier) ? multiplier : 1.0;
      });

    // --- Função para Calcular o Preço Estimado ---
    const calculatePrice = () => {
        let currentPrice = BASE_PRICE;
        featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked && featureCosts.hasOwnProperty(checkbox.id)) {
                currentPrice += featureCosts[checkbox.id];
            }
        });
        const selectedTimelineValue = timelineSelect.value;
        const multiplier = urgencyMultipliers[selectedTimelineValue] || 1.0;
        currentPrice *= multiplier;
        return currentPrice;
    };

    // --- Função para Formatar e Exibir o Preço ---
    const displayPrice = () => {
        if (!priceDisplayElement) return 0;
        const calculatedPrice = calculatePrice();
        const formattedPrice = calculatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        priceDisplayElement.textContent = formattedPrice;
        return calculatedPrice;
    };

    // --- Adiciona Listeners para recalcular o preço ---
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', displayPrice);
    });
    if (timelineSelect) {
        timelineSelect.addEventListener('change', displayPrice);
    }
    displayPrice(); // Exibe preço inicial

    // --- Lógica para mostrar/esconder status da entrega de copy ---
    const copyDeliveryStatusGroup = document.getElementById('copy_delivery_status');
    const copySourceRadios = document.querySelectorAll('input[name="copywritingSource"]');
    const copyStatusSelect = document.getElementById('copyStatus');

    const toggleCopyStatus = () => {
        if (!copyDeliveryStatusGroup || !copySourceRadios.length) return;
        const selectedSourceRadio = document.querySelector('input[name="copywritingSource"]:checked');
        const selectedSource = selectedSourceRadio ? selectedSourceRadio.value : null;
        if (selectedSource === 'Cliente Fornece') {
            copyDeliveryStatusGroup.style.display = 'block';
            if(copyStatusSelect) copyStatusSelect.required = true;
        } else {
            copyDeliveryStatusGroup.style.display = 'none';
             if(copyStatusSelect) copyStatusSelect.required = false;
        }
    };
    copySourceRadios.forEach(radio => { radio.addEventListener('change', toggleCopyStatus); });
    toggleCopyStatus();

    // --- Função para Lidar com o Envio do Formulário (COM MENSAGEM CORRIGIDA) ---
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Coleta dados
        const formData = new FormData(form);
        const data = {};
        const featuresSelectedLabels = [];

        formData.forEach((value, key) => {
            const element = form.elements[key];
            if (key === 'features') return; // Trata features depois
            if (element && element.type === 'radio') {
                if (element.checked) data[key] = typeof value === 'string' ? value.trim() : value;
            } else {
                 data[key] = typeof value === 'string' ? value.trim() : value;
            }
        });

         featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                 const label = form.querySelector(`label[for="${checkbox.id}"]`);
                 featuresSelectedLabels.push(label ? label.textContent.trim() : checkbox.value);
            }
         });
         data['features'] = featuresSelectedLabels;

        // Calcula preço final
        const finalCalculatedPrice = calculatePrice();
        const formattedFinalPrice = finalCalculatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // --- Monta a Mensagem com Quebras de Linha Reais (\n) usando Template Literals ---
        //      (Note o uso das crases ` ` em vez de aspas simples ou duplas)
        let message = `*Novo Briefing Detalhado - Landing Page (Vita Septem)*\n\n`; // Use \n para nova linha

        message += `*1. Contato*\n`;
        message += `  Nome: ${data.name || 'N/A'}\n`;
        message += `  WhatsApp: ${data.whatsapp || 'N/A'}\n`;
        message += `  Email: ${data.email || 'N/A'}\n`;
        message += `  Empresa/Projeto: ${data.company || 'N/A'}\n\n`;

        message += `*2. Objetivo e Público*\n`;
        message += `  Objetivo Principal: ${data.pageObjective || 'N/A'}\n`;
        message += `  Público-alvo: ${data.targetAudience || 'N/A'}\n`;
        message += `  Mensagem Principal: ${data.mainMessage || 'N/A'}\n`;
        message += `  Texto CTA Principal: ${data.mainCTA || 'N/A'}\n\n`;

        message += `*3. Conteúdo e Estrutura*\n`;
        message += `  Seções Imaginadas: ${data.sections || 'N/A'}\n`;
        message += `  Serviços/Produtos: ${data.servicesProducts || 'N/A'}\n`;
        message += `  Diferenciais: ${data.differentials || 'N/A'}\n`;
        message += `  Fonte Textos: ${data.copywritingSource || 'N/A'}\n`;
        if (data.copywritingSource === 'Cliente Fornece') {
             message += `  Status Textos: ${data.copyStatus || 'N/A'}\n`;
        }
        message += `  Fonte Mídias: ${data.mediaSource || 'N/A'}\n\n`;

        message += `*4. Estilo Visual*\n`;
        message += `  Possui ID Visual: ${data.brandingStatus || 'N/A'}\n`;
        message += `  Ref. (Gosta): ${data.visualReferences || 'N/A'}\n`;
        message += `  Ref. (NÃO Gosta): ${data.visualDislikes || 'N/A'}\n`;
        message += `  Tom de Voz: ${data.pageTone || 'N/A'}\n\n`;

        message += `*5. Funcionalidades Adicionais*\n`;
        const featuresText = data.features && data.features.length > 0
                           ? `  - ${data.features.join('\n  - ')}` // Usa \n e marcador
                           : '  Nenhuma selecionada';
        message += `${featuresText}\n\n`;

        message += `*6. Detalhes Técnicos*\n`;
        message += `  Domínio: ${data.domain || 'Não informado/Não possui'}\n`;
        message += `  Hospedagem: ${data.hosting || 'Não informado/Não possui'}\n\n`;

        message += `*7. Prazos e Orçamento*\n`;
        // Pega o TEXTO da opção selecionada para clareza na mensagem Wpp
        const timelineOptionText = timelineSelect ? timelineSelect.options[timelineSelect.selectedIndex].text : 'N/A';
        const budgetOptionText = budgetSelect ? budgetSelect.options[budgetSelect.selectedIndex].text : 'N/A';
        message += `  Urgência: ${timelineOptionText}\n`;
        message += `  Faixa Orçamento: ${budgetOptionText}\n`;
        message += `  *Estimativa Calculada: ${formattedFinalPrice}*\n`; // *** PREÇO INCLUÍDO ***
        message += `  _(Baseado nas seleções. Sujeito a análise.)_\n\n`;

        if (data.details && data.details.length > 0) { // Verifica se há detalhes
             message += `*8. Observações Adicionais*\n${data.details}\n\n`;
        }
        message += `--- Fim do Briefing ---`;

        // --- Abre o WhatsApp ---
        const yourWhatsAppNumber = '5599981543912'; // <<< SEU NÚMERO CONFIRMADO

        if (!yourWhatsAppNumber || !/^\d{12,13}$/.test(yourWhatsAppNumber.replace(/\D/g, ''))) {
            alert("Erro: Número de WhatsApp do destinatário inválido no script2.js.");
            console.error("Verifique a variável 'yourWhatsAppNumber'. Formato: 55+DDD+Numero");
            return;
        }

        // *** encodeURIComponent AGORA VAI CONVERTER \n para %0A CORRETAMENTE ***
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`;

        window.open(whatsappURL, '_blank');
        console.log("WhatsApp URL Gerada (verifique a formatação no App):", whatsappURL);

    };

    // Adiciona o listener de 'submit' ao formulário
    if (form) {
        form.addEventListener('submit', handleSubmit);
    } else {
        console.error("Elemento do formulário não encontrado!");
    }

}); // Fim do DOMContentLoaded
