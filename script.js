// Espera o DOM (estrutura HTML) ser completamente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    /**
     * =============================================
     * MENU MOBILE (HAMBURGER)
     * =============================================
     */
    const menuToggleButton = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link'); // Pegar os links do menu

    if (menuToggleButton && navMenu) {
        menuToggleButton.addEventListener('click', () => {
            // Alterna a classe 'active' no botão (para animar o 'X')
            menuToggleButton.classList.toggle('active');
            // Alterna a classe 'active' no menu (para mostrar/esconder e animar)
            navMenu.classList.toggle('active');

            // Trava/Destrava a rolagem do body quando o menu está aberto
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden'; // Trava a rolagem
            } else {
                document.body.style.overflow = ''; // Libera a rolagem
            }
        });

        // Fecha o menu ao clicar em um link (útil para single page)
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    menuToggleButton.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = ''; // Libera a rolagem
                }
            });
        });

        // Opcional: Fechar o menu se clicar fora dele (em telas mobile)
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnToggleButton = menuToggleButton.contains(event.target);

            if (!isClickInsideMenu && !isClickOnToggleButton && navMenu.classList.contains('active')) {
                 menuToggleButton.classList.remove('active');
                 navMenu.classList.remove('active');
                 document.body.style.overflow = '';
            }
        });
    }


    /**
     * =============================================
     * HEADER COM EFEITO AO ROLAR (SCROLLED)
     * =============================================
     */
    const header = document.querySelector('.site-header');
    const scrollThreshold = 50; // Distância em pixels para ativar o efeito

    if (header) {
        const handleScrollHeader = () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', handleScrollHeader);
        handleScrollHeader(); // Verifica o estado inicial ao carregar a página
    }


    /**
     * =============================================
     * BOTÃO VOLTAR AO TOPO (BACK TO TOP)
     * =============================================
     */
    const backToTopButton = document.querySelector('.back-to-top');
    const backToTopThreshold = 300; // Distância em pixels para mostrar o botão

     if (backToTopButton) {
        const handleScrollBackToTop = () => {
            if (window.scrollY > backToTopThreshold) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        };

         window.addEventListener('scroll', handleScrollBackToTop);
         handleScrollBackToTop(); // Verifica estado inicial
     }


    /**
     * =============================================
     * ROLAGEM SUAVE PARA LINKS INTERNOS
     * =============================================
     */
    const smoothScrollLinks = document.querySelectorAll('.scroll-link, .nav-link[href^="#"]'); // Pega links com classe e links de nav que começam com #

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Previne o comportamento padrão de pular

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0; // Pega altura do header dinamicamente
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Opcional: Atualiza a classe 'active' no link de navegação clicado
                 if (link.classList.contains('nav-link')) {
                    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('active'));
                    link.classList.add('active');
                 }
            }
        });
    });

    /**
     * =============================================
     * ATUALIZAR LINK ATIVO NA NAVEGAÇÃO AO ROLAR (Scrollspy)
     * =============================================
     */
     const sections = document.querySelectorAll('section[id]'); // Pega todas as seções com ID
     const navLinksForScrollspy = document.querySelectorAll('.nav-menu .nav-link[href^="#"]');

     if (sections.length > 0 && navLinksForScrollspy.length > 0) {
         const handleScrollspy = () => {
             const scrollPosition = window.scrollY;
             const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;

             sections.forEach(section => {
                 const sectionTop = section.offsetTop - headerHeight - 50; // Offset para ativar um pouco antes
                 const sectionHeight = section.offsetHeight;
                 const sectionId = section.getAttribute('id');
                 const correspondingLink = document.querySelector(`.nav-menu .nav-link[href="#${sectionId}"]`);

                 if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    // Remove 'active' de todos os links
                    navLinksForScrollspy.forEach(link => link.classList.remove('active'));
                    // Adiciona 'active' ao link correspondente
                    if (correspondingLink) {
                         correspondingLink.classList.add('active');
                     }
                 }
             });

             // Caso especial: se estiver muito no topo, ativa o link 'Início'
             const heroSection = document.querySelector('#hero');
             if (heroSection && scrollPosition < heroSection.offsetTop + heroSection.offsetHeight - headerHeight - 50) {
                 navLinksForScrollspy.forEach(link => link.classList.remove('active'));
                 const homeLink = document.querySelector('.nav-menu .nav-link[href="#hero"]');
                 if (homeLink) homeLink.classList.add('active');
             }
         };

         window.addEventListener('scroll', handleScrollspy);
         handleScrollspy(); // Verifica estado inicial
     }


    /**
     * =============================================
     * ACCORDION DO FAQ
     * =============================================
     */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionButton = item.querySelector('.faq-question');
        const answerDiv = item.querySelector('.faq-answer');

        if (questionButton && answerDiv) {
            questionButton.addEventListener('click', () => {
                const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

                // Fecha todos os outros itens (comportamento de accordion) - Opcional
                // faqItems.forEach(otherItem => {
                //     if (otherItem !== item) {
                //         otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                //         const otherAnswer = otherItem.querySelector('.faq-answer');
                //         otherAnswer.classList.remove('open');
                //         otherAnswer.style.maxHeight = null;
                //     }
                // });

                // Alterna o estado do item clicado
                questionButton.setAttribute('aria-expanded', !isExpanded);
                answerDiv.classList.toggle('open');

                if (!isExpanded) {
                    // Ao abrir: define max-height para o scrollHeight para animar
                    answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
                } else {
                    // Ao fechar: reseta max-height para null (ou 0)
                    answerDiv.style.maxHeight = null;
                }
            });

            // Garante que a resposta esteja com max-height = null inicialmente se não estiver aberta
             if (questionButton.getAttribute('aria-expanded') !== 'true') {
                 answerDiv.style.maxHeight = null;
             } else {
                 // Se começar aberto (raro), calcula altura inicial
                 answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
             }
        }
    });


    /**
     * =============================================
     * ATUALIZAR ANO NO COPYRIGHT
     * =============================================
     */
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    /**
     * =============================================
     * PLACEHOLDER PARA ENVIO DE FORMULÁRIO (Exemplo com Formspree/Netlify)
     * =============================================
     */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.querySelector('.form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Previne o envio padrão do navegador

            // --- Opção 1: Se usar um serviço como Formspree ou Getform ---
            // Basta configurar o 'action' no HTML para a URL do serviço.
            // O JavaScript aqui seria mais para mostrar mensagens de sucesso/erro
            // ou fazer validações extras antes do envio padrão.
            // Exemplo de validação simples (pode ser mais robusta):
            const nameInput = contactForm.querySelector('#name');
            const emailInput = contactForm.querySelector('#email');
            if (!nameInput.value || !emailInput.value) {
                 if(formStatus) formStatus.textContent = 'Por favor, preencha nome e email.';
                 if(formStatus) formStatus.className = 'form-status error';
                 return; // Interrompe o envio se inválido
            }
            // Se tudo ok, pode deixar o envio padrão ocorrer (removendo preventDefault)
            // ou adicionar lógica de AJAX abaixo.

             // --- Opção 2: Envio via JavaScript (AJAX) para Netlify ou API própria ---
             if (formStatus) {
                 formStatus.textContent = 'Enviando...';
                 formStatus.className = 'form-status'; // Reset style
             }
             const formData = new FormData(contactForm);
             try {
                 // IMPORTANTE: Substitua a URL abaixo pela URL do seu endpoint
                 // Para Netlify, não precisa de URL específica se o form tiver 'data-netlify="true"' no HTML
                 // Para Formspree, use a URL deles
                  const response = await fetch(contactForm.action, { // Usa a action definida no HTML
                      method: 'POST',
                      body: formData,
                      headers: {
                          'Accept': 'application/json' // Para Formspree/serviços que respondem JSON
                      }
                  });

                  if (response.ok) {
                     if(formStatus) formStatus.textContent = 'Mensagem enviada com sucesso!';
                     if(formStatus) formStatus.className = 'form-status success';
                     contactForm.reset(); // Limpa o formulário
                 } else {
                     // Tenta pegar erro do corpo da resposta se for JSON
                     const data = await response.json().catch(() => ({})); // Previne erro se não for JSON
                      if(formStatus) formStatus.textContent = data.error || 'Ocorreu um erro ao enviar. Tente novamente.';
                      if(formStatus) formStatus.className = 'form-status error';
                 }
             } catch (error) {
                 console.error('Erro no envio do formulário:', error);
                 if(formStatus) formStatus.textContent = 'Ocorreu um erro de rede. Tente novamente.';
                 if(formStatus) formStatus.className = 'form-status error';
             }

            // Remove a mensagem de status após alguns segundos
            setTimeout(() => {
                if(formStatus) formStatus.textContent = '';
                if(formStatus) formStatus.className = 'form-status';
            }, 5000); // 5 segundos
        });
    }

    // Fim do DOMContentLoaded
});