// Espera o DOM (estrutura HTML) ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('landingPageBriefingForm');

    // --- Elementos Relevantes para o Cálculo de Preço ---
    const featureCheckboxes = document.querySelectorAll('#landingPageBriefingForm input[name="features"]');
    const timelineSelect = document.getElementById('timeline');
    const priceDisplayElement = document.getElementById('estimatedPrice'); // Span para mostrar o preço

    // --- Configuração de Preços (!!! AJUSTE ESTES VALORES CONFORME SUA REALIDADE !!!) ---
    const BASE_PRICE = 1200; // Exemplo: Preço base para uma landing page padrão

    // Mapeamento de custo por funcionalidade (usa o ID do checkbox como chave)
    const featureCosts = {};
    featureCheckboxes.forEach(checkbox => {
        const cost = parseFloat(checkbox.getAttribute('data-cost'));
        featureCosts[checkbox.id] = !isNaN(cost) ? cost : 0; // Usa ID como chave, pega custo do data-atribute
    });

     // Mapeamento de multiplicador por urgência (usa o value do option como chave)
     const urgencyMultipliers = {};
      Array.from(timelineSelect.options).forEach(option => {
         const multiplier = parseFloat(option.getAttribute('data-multiplier'));
         urgencyMultipliers[option.value] = !isNaN(multiplier) ? multiplier : 1.0; // Usa value como chave, pega multi do data-atribute
      });


    // --- Função para Calcular o Preço Estimado ---
    const calculatePrice = () => {
        let currentPrice = BASE_PRICE;

        // Adiciona custo das funcionalidades selecionadas
        featureCheckboxes.forEach(checkbox => {
            // Verifica se está marcado e se existe um custo associado ao seu ID
            if (checkbox.checked && featureCosts.hasOwnProperty(checkbox.id)) {
                currentPrice += featureCosts[checkbox.id];
            }
        });

        // Aplica multiplicador de urgência
        const selectedTimelineValue = timelineSelect.value;
        const multiplier = urgencyMultipliers[selectedTimelineValue] || 1.0; // Pega multiplicador ou usa 1.0 padrão
        currentPrice *= multiplier;

        return currentPrice;
    };

    // --- Função para Formatar e Exibir o Preço ---
    const displayPrice = () => {
        if (!priceDisplayElement) return 0; // Sai se o elemento não existir

        const calculatedPrice = calculatePrice();
        // Formata para moeda brasileira (BRL)
        const formattedPrice = calculatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        priceDisplayElement.textContent = formattedPrice;

        return calculatedPrice; // Retorna o número para uso posterior
    };

    // --- Adiciona Listeners para recalcular o preço quando as opções mudam ---
    featureCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', displayPrice);
    });
    if (timelineSelect) {
        timelineSelect.addEventListener('change', displayPrice);
    }

    // --- Calcula e exibe o preço inicial ao carregar a página ---
    displayPrice();


    // --- Lógica para mostrar/esconder status da entrega de copy (Mantida) ---
    const copyDeliveryStatusGroup = document.getElementById('copy_delivery_status');
    const copySourceRadios = document.querySelectorAll('input[name="copywritingSource"]');
    const copyStatusSelect = document.getElementById('copyStatus'); // Referência ao select

    const toggleCopyStatus = () => {
        // Verifica se os elementos existem antes de acessá-los
        if (!copyDeliveryStatusGroup || !copySourceRadios.length) return;

        const selectedSourceRadio = document.querySelector('input[name="copywritingSource"]:checked');
        const selectedSource = selectedSourceRadio ? selectedSourceRadio.value : null;

        if (selectedSource === 'Cliente Fornece') {
            copyDeliveryStatusGroup.style.display = 'block';
            if(copyStatusSelect) copyStatusSelect.required = true; // Torna obrigatório se visível
        } else {
            copyDeliveryStatusGroup.style.display = 'none';
             if(copyStatusSelect) copyStatusSelect.required = false; // Não obrigatório se escondido
        }
    };

    copySourceRadios.forEach(radio => {
        radio.addEventListener('change', toggleCopyStatus);
    });
    toggleCopyStatus(); // Estado inicial


    // --- Função para Lidar com o Envio do Formulário ---
    const handleSubmit = (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário HTML

        // Força validação HTML5 antes de prosseguir
        if (!form.checkValidity()) {
            form.reportValidity(); // Mostra mensagens de erro padrão do navegador se houver campos inválidos
            return;
        }


        // Coleta dados do formulário de forma mais robusta
        const formData = new FormData(form);
        const data = {};
        const featuresSelectedLabels = [];

        formData.forEach((value, key) => {
            const element = form.elements[key];

            // Tratamento especial para checkboxes 'features'
            if (key === 'features') {
                // Como múltiplos checkboxes podem ter a mesma 'name', precisamos coletar todos
                // Fazemos isso fora do loop principal (veja abaixo)
                return;
            }

            // Tratamento para Radio buttons (pegar apenas o selecionado)
            if (element && element.type === 'radio') {
                if (element.checked) {
                    data[key] = typeof value === 'string' ? value.trim() : value;
                }
            }
            // Tratamento para outros campos
            else {
                 data[key] = typeof value === 'string' ? value.trim() : value;
            }
        });

        // Coleta os labels dos checkboxes 'features' que estão marcados
         featureCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                 const label = form.querySelector(`label[for="${checkbox.id}"]`);
                 featuresSelectedLabels.push(label ? label.textContent.trim() : checkbox.value); // Adiciona nome legível
            }
         });
         data['features'] = featuresSelectedLabels; // Adiciona o array de labels ao objeto data

        // --- Calcula o preço FINAL no momento do envio ---
        const finalCalculatedPrice = calculatePrice(); // Recalcula para garantir
        const formattedFinalPrice = finalCalculatedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // --- Monta a Mensagem Detalhada para o WhatsApp ---
        // Usa pt-BR para formatação e %0A para quebra de linha URL-encoded
        let message = `*Novo Briefing Detalhado - Landing Page (Vita Septem)*%0A%0A`;

        message += `*1. Contato*%0A`;
        message += `  Nome: ${data.name || 'N/A'}%0A`;
        message += `  WhatsApp: ${data.whatsapp || 'N/A'}%0A`;
        message += `  Email: ${data.email || 'N/A'}%0A`;
        message += `  Empresa/Projeto: ${data.company || 'N/A'}%0A%0A`;

        message += `*2. Objetivo e Público*%0A`;
        message += `  Objetivo Principal: ${data.pageObjective || 'N/A'}%0A`;
        message += `  Público-alvo: ${data.targetAudience || 'N/A'}%0A`;
        message += `  Mensagem Principal: ${data.mainMessage || 'N/A'}%0A`;
        message += `  Texto CTA Principal: ${data.mainCTA || 'N/A'}%0A%0A`;

        message += `*3. Conteúdo e Estrutura*%0A`;
        message += `  Seções Imaginadas: ${data.sections || 'N/A'}%0A`;
        message += `  Serviços/Produtos: ${data.servicesProducts || 'N/A'}%0A`;
        message += `  Diferenciais: ${data.differentials || 'N/A'}%0A`;
        message += `  Fonte Textos: ${data.copywritingSource || 'N/A'}%0A`;
        // Inclui status da copy apenas se relevante
        if (data.copywritingSource === 'Cliente Fornece') {
             message += `  Status Textos: ${data.copyStatus || 'N/A'}%0A`;
        }
        message += `  Fonte Mídias: ${data.mediaSource || 'N/A'}%0A%0A`;

        message += `*4. Estilo Visual*%0A`;
        message += `  Possui ID Visual: ${data.brandingStatus || 'N/A'}%0A`;
        message += `  Ref. (Gosta): ${data.visualReferences || 'N/A'}%0A`;
        message += `  Ref. (NÃO Gosta): ${data.visualDislikes || 'N/A'}%0A`;
        message += `  Tom de Voz: ${data.pageTone || 'N/A'}%0A%0A`;

        message += `*5. Funcionalidades Adicionais*%0A`;
        const featuresText = data.features && data.features.length > 0
                           ? `  - ${data.features.join('%0A  - ')}` // Lista com marcadores
                           : '  Nenhuma selecionada';
        message += `${featuresText}%0A%0A`;

        message += `*6. Detalhes Técnicos*%0A`;
        message += `  Domínio: ${data.domain || 'Não informado/Não possui'}%0A`;
        message += `  Hospedagem: ${data.hosting || 'Não informado/Não possui'}%0A%0A`;

        message += `*7. Prazos e Orçamento*%0A`;
        const timelineOptionText = timelineSelect ? timelineSelect.options[timelineSelect.selectedIndex].text : 'N/A';
        const budgetOptionText = budget ? budget.options[budget.selectedIndex].text : 'N/A';
        message += `  Urgência: ${timelineOptionText}%0A`;
        message += `  Faixa Orçamento: ${budgetOptionText}%0A`;
        message += `  *Estimativa Calculada: ${formattedFinalPrice}*%0A`; // *** PREÇO INCLUÍDO ***
        message += `  _(Baseado nas seleções. Sujeito a análise.)_%0A%0A`;

        // Inclui detalhes adicionais se houver
        if (data.details) {
             message += `*8. Observações Adicionais*%0A${data.details}%0A%0A`;
        }
        message += `--- Fim do Briefing ---`;

        // --- Abre o WhatsApp ---
        const yourWhatsAppNumber = '5599981543912'; // <<< SEU NÚMERO CORRIGIDO AQUI

        // Validação básica do número
        if (!yourWhatsAppNumber || !/^\d{12,13}$/.test(yourWhatsAppNumber.replace(/\D/g, ''))) {
            alert("Erro: Número de WhatsApp do destinatário inválido no script2.js.");
            console.error("Verifique a variável 'yourWhatsAppNumber' no script.js. Formato esperado: 55+DDD+Numero (12 ou 13 dígitos)");
            return;
        }

        // Codifica a mensagem final para URL (mais seguro que replace)
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`;

        // Abre em uma nova aba (_blank)
        window.open(whatsappURL, '_blank');

        console.log("Briefing formatado com estimativa e pronto para envio via WhatsApp.");

        // Opcional: feedback visual ou reset do formulário
        // form.reset(); // Limpa o formulário
        // displayPrice(); // Recalcula e mostra o preço base novamente
        // setTimeout(() => alert('Você foi redirecionado para o WhatsApp. Confirme o envio da mensagem por lá!'), 500); // Pequeno delay para feedback
    };

    // Adiciona o listener de 'submit' ao formulário
    if (form) {
        form.addEventListener('submit', handleSubmit);
    } else {
        console.error("Elemento do formulário não encontrado! Verifique o ID 'landingPageBriefingForm' no HTML.");
    }

}); // Fim do DOMContentLoaded