/* Corevix Technology Master JavaScript Engine | Frontend Restructuring & Dynamic Renderer */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';

document.addEventListener('DOMContentLoaded', () => {

    // 1. Scroll Progress Top Bar Indicator
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScroll > 0 && progressBar) {
            const progress = (window.scrollY / totalScroll) * 100;
            progressBar.style.width = `${progress}%`;
        }
    });

    // 2. Mobile Navigation Hamburger Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');

    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener('click', () => {
            mobileDrawer.classList.toggle('active');
            mobileToggle.innerHTML = mobileDrawer.classList.contains('active') ? '✕' : '☰';
        });

        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.remove('active');
                mobileToggle.innerHTML = '☰';
            });
        });
    }

    // 3. Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // 4. Roaming Pixel Box Starfield Background (Pure Pixel Boxes Roaming Like Stars in Space)
    const container = document.getElementById('three-hero-container');
    if (container && typeof THREE !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 4.8;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
        container.appendChild(renderer.domElement);

        // Pixel Box Starfield (Roaming square pixel particles in deep 3D space)
        const particleCount = isMobile ? 110 : 260;
        const posArray = new Float32Array(particleCount * 3);
        const colorArray = new Float32Array(particleCount * 3);
        const velocities = [];

        // Corevix High-Tech Palette: Emerald, Bright Green, Soft Mint, Subtle Cyan
        const palette = [
            new THREE.Color(0x10B981), // Corevix Emerald (60%)
            new THREE.Color(0x34D399), // Bright Emerald (20%)
            new THREE.Color(0x6EE7B7), // Mint Ice (12%)
            new THREE.Color(0x38BDF8)  // Soft Cyber Cyan (8%)
        ];

        const spreadX = 14;
        const spreadY = 10;
        const spreadZ = 8;

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            posArray[i3] = (Math.random() - 0.5) * spreadX;
            posArray[i3 + 1] = (Math.random() - 0.5) * spreadY;
            posArray[i3 + 2] = (Math.random() - 0.5) * spreadZ;

            // Smooth cosmic roaming velocity
            const speed = isMobile ? 0.0035 : 0.0045;
            velocities.push({
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                vz: (Math.random() - 0.5) * (speed * 0.7)
            });

            // Color distribution
            const rand = Math.random();
            let c;
            if (rand < 0.60) c = palette[0];
            else if (rand < 0.80) c = palette[1];
            else if (rand < 0.92) c = palette[2];
            else c = palette[3];

            colorArray[i3] = c.r;
            colorArray[i3 + 1] = c.g;
            colorArray[i3 + 2] = c.b;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        // In Three.js, PointsMaterial without a texture map renders as sharp, crisp square pixel boxes
        const particleMat = new THREE.PointsMaterial({
            size: isMobile ? 0.065 : 0.055,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Smooth interactive mouse parallax
        let mouseX = 0;
        let mouseY = 0;
        let targetCamX = 0;
        let targetCamY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            targetCamX = mouseX * 0.45;
            targetCamY = -mouseY * 0.35;
        });

        // Pause animation when hero is offscreen for peak performance
        let isHeroVisible = true;
        const heroSection = document.getElementById('hero');
        if (heroSection && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isHeroVisible = entry.isIntersecting;
                });
            }, { threshold: 0.05 });
            observer.observe(heroSection);
        }

        const halfX = spreadX * 0.5;
        const halfY = spreadY * 0.5;
        const halfZ = spreadZ * 0.5;

        const animate = () => {
            requestAnimationFrame(animate);
            if (!isHeroVisible) return;

            // Camera subtle organic tilt & parallax
            camera.position.x += (targetCamX - camera.position.x) * 0.035;
            camera.position.y += (targetCamY - camera.position.y) * 0.035;
            camera.lookAt(0, 0, 0);

            // Update roaming pixel box positions & wrap around boundaries in space
            const pos = particleGeo.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const v = velocities[i];

                pos[i3] += v.vx;
                pos[i3 + 1] += v.vy;
                pos[i3 + 2] += v.vz;

                // Infinite space wrap
                if (pos[i3] < -halfX) pos[i3] = halfX;
                else if (pos[i3] > halfX) pos[i3] = -halfX;

                if (pos[i3 + 1] < -halfY) pos[i3] = halfY;
                else if (pos[i3 + 1] > halfY) pos[i3] = -halfY;

                if (pos[i3 + 2] < -halfZ) pos[i3] = halfZ;
                else if (pos[i3 + 2] > halfZ) pos[i3] = -halfZ;
            }
            particleGeo.attributes.position.needsUpdate = true;

            // Slow cosmic rotation of the starfield
            particles.rotation.y -= 0.0007;
            particles.rotation.x += 0.0002;

            renderer.render(scene, camera);
        };
        animate();

        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    // 5. FAQ Accordion Click Handler
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');
                faqItems.forEach(otherItem => otherItem.classList.remove('open'));
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        }
    });

    // 6. Interactive Industry Telemetry Matrix (industries-tech.html & index.html)
    const indCards = document.querySelectorAll('.ind-matrix-card');
    const matrixTitle = document.getElementById('matrix-tech-title');
    const matrixDesc = document.getElementById('matrix-tech-desc');
    const matrixBadges = document.getElementById('matrix-tech-badges');
    const matrixCaseBtn = document.getElementById('matrix-case-btn');

    const indData = {
        finance: {
            title: "Finance & Banking Technology Stack",
            desc: "High-volume distributed ledger engines, sub-12ms payment reconciliation, and security practices aligned with ISO 27001 principles.",
            badges: ["React", "Next.js", "Node.js", ".NET Core", "PostgreSQL", "Redis Caching", "Tokenization Engine", "OpenAI Risk RAG"],
            btnText: "View Case Study: Financial Analytics Platform (340% Throughput Boost) →",
            btnLink: "case-studies.html"
        },
        healthcare: {
            title: "Healthcare & Telehealth Stack",
            desc: "HIPAA-compliant EHR integration, WebRTC telemedicine video portals, and encrypted patient data vaults.",
            badges: ["React Native", "TypeScript", "Python FastAPI", "PostgreSQL", "WebRTC Video", "HL7 / FHIR APIs", "AWS HealthLake"],
            btnText: "Explore Healthcare Security SLA Standards →",
            btnLink: "contact.html"
        },
        manufacturing: {
            title: "Manufacturing & IoT Sensor Telemetry",
            desc: "Real-time edge sensor streaming, automated dispatch logic, and predictive equipment maintenance algorithms.",
            badges: ["Node.js", "Go Microservices", "MQTT Broker", "TimescaleDB", "Docker / K8s", "Grafana Monitoring"],
            btnText: "Request IoT Telemetry Architecture Audit →",
            btnLink: "contact.html"
        },
        logistics: {
            title: "Logistics & Fleet Optimization Engine",
            desc: "Sub-50ms driver routing calculation, warehouse inventory sync, and real-time GPS tracking webhooks.",
            badges: ["Vue 3", "Node.js", "Redis Pub/Sub", "PostgreSQL", "Mapbox GL", "WebSockets"],
            btnText: "Schedule Fleet System Scoping →",
            btnLink: "contact.html"
        },
        retail: {
            title: "Omnichannel Retail & E-Commerce Platform",
            desc: "Multi-tenant inventory synchronization, instant checkout gateways, and personalized AI recommendation models.",
            badges: ["Next.js 14", "Stripe API", "MongoDB Atlas", "Elasticsearch", "Redis", "Tailwind CSS"],
            btnText: "Explore Retail Platform Deliveries →",
            btnLink: "case-studies.html"
        },
        realestate: {
            title: "PropTech Asset & Lease Management",
            desc: "Automated lease document processing, tenant portal accounts, and multi-property financial ledgers.",
            badges: ["React.js", "Python Django", "PostgreSQL", "AWS S3 Vault", "OpenAI Document OCR"],
            btnText: "Schedule PropTech Scoping Session →",
            btnLink: "contact.html"
        },
        education: {
            title: "EdTech & Learning Management Infrastructure",
            desc: "Interactive video classrooms, DRM content protection, automated student quiz grading engines, and SCORM integration.",
            badges: ["React", "Node.js", "HLS Streaming", "PostgreSQL", "Redis", "Socket.io"],
            btnText: "Schedule EdTech Scoping Session →",
            btnLink: "contact.html"
        },
        hospitality: {
            title: "Hospitality Mobile Check-In & Booking CRM",
            desc: "Mobile keyless check-in, direct booking revenue engines, and automated multi-channel guest CRM communications.",
            badges: ["React Native", "Node.js", "Stripe Connect", "PostgreSQL", "Twilio API"],
            btnText: "Schedule Hospitality Scoping Session →",
            btnLink: "contact.html"
        }
    };

    if (indCards.length > 0 && matrixTitle) {
        indCards.forEach(card => {
            card.addEventListener('click', () => {
                const indKey = card.getAttribute('data-ind-key');
                const data = indData[indKey];

                if (data) {
                    indCards.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');

                    matrixTitle.innerText = data.title;
                    matrixDesc.innerText = data.desc;
                    if (matrixCaseBtn) {
                        matrixCaseBtn.innerText = data.btnText;
                        matrixCaseBtn.href = data.btnLink;
                    }

                    if (matrixBadges) {
                        matrixBadges.innerHTML = data.badges.map(b => `<span class="tech-badge-tag highlight">${b}</span>`).join('');
                    }
                }
            });
        });
    }

    // 7. Interactive Floating AI Assistant Powered by Google Gemini
    const initCorevixAssistant = () => {
        const contactPath = window.location.pathname.includes('/services/') ? '../contact.html' : 'contact.html';
        const whatsAppUrl = 'https://wa.me/919243238242';

        // 7.1 Floating Cora AI Assistant Trigger
        if (!document.getElementById('ai-chatbot-bubble')) {
            const chatBubble = document.createElement('div');
            chatBubble.id = 'ai-chatbot-bubble';
            chatBubble.setAttribute('aria-label', 'Chat with Cora - Corevix AI Project Assistant');
            chatBubble.title = 'Chat with Cora - Corevix Technology AI Project Assistant';
            chatBubble.innerHTML = `
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>Chat with Cora</span>
            `;
            document.body.appendChild(chatBubble);
        }

        if (!document.getElementById('ai-chatbot-window')) {
            const chatWin = document.createElement('div');
            chatWin.id = 'ai-chatbot-window';
            chatWin.innerHTML = `
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">
                            <svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7zm6 3v2m4-2v2"/></svg>
                        </div>
                        <div>
                            <div class="chat-title">Cora</div>
                            <div class="chat-subtitle" id="ai-chat-status-text">● Live | Corevix AI Project Assistant</div>
                        </div>
                    </div>
                    <button class="chat-close-btn" id="ai-chat-close-btn" aria-label="Close Assistant">✕</button>
                </div>
                <div id="ai-chat-messages" class="chat-messages"></div>
                <div id="ai-chat-chips" class="chat-chips-grid"></div>
                <div class="chat-footer">
                    <form class="chat-input-form" id="ai-chat-form">
                        <input type="text" id="ai-chat-input" placeholder="Type a message or select an option above..." autocomplete="off">
                        <button type="submit" class="chat-send-btn" id="ai-chat-send">Send</button>
                    </form>
                </div>
            `;
            document.body.appendChild(chatWin);
        }

        const chatBubble = document.getElementById('ai-chatbot-bubble');
        const chatWin = document.getElementById('ai-chatbot-window');
        const chatCloseBtn = document.getElementById('ai-chat-close-btn');
        const chatMessages = document.getElementById('ai-chat-messages');
        const chatChips = document.getElementById('ai-chat-chips');
        const chatInput = document.getElementById('ai-chat-input');
        const chatForm = document.getElementById('ai-chat-form');

        let chatHistory = [];

        // Cora Conversation State
        const coraState = {
            step: 'greeting', // 'greeting' | 'q1' | 'q2' | 'handoff' | 'capture_meeting' | 'capture_call'
            service: '',
            projectType: '',
            details: '',
            handoffChoice: '',
            contactName: '',
            company: '',
            contactInfo: '',
            preferredTime: ''
        };

        // Markdown formatter helper
        const formatMarkdown = (text) => {
            if (!text) return '';
            let html = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Code blocks
            html = html.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
            // Inline code
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            // Bold
            html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            // Italic
            html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            // Links [text](url)
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--emerald-green); font-weight:700; text-decoration:underline;">$1</a>');

            // Bullets
            const lines = html.split('\n');
            let inList = false;
            const outputLines = [];

            for (let line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    if (!inList) {
                        outputLines.push('<ul>');
                        inList = true;
                    }
                    outputLines.push(`<li>${trimmed.substring(2)}</li>`);
                } else if (/^\d+\.\s/.test(trimmed)) {
                    if (!inList) {
                        outputLines.push('<ol>');
                        inList = true;
                    }
                    outputLines.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
                } else {
                    if (inList) {
                        outputLines.push('</ul>');
                        inList = false;
                    }
                    if (trimmed.length > 0) {
                        outputLines.push(`<p>${trimmed}</p>`);
                    }
                }
            }
            if (inList) outputLines.push('</ul>');

            return outputLines.join('');
        };

        const appendMessage = (sender, content, isHtml = false) => {
            const div = document.createElement('div');
            div.className = `chat-msg ${sender === 'user' ? 'user chat-msg-user' : 'bot chat-msg-bot'}`;
            if (isHtml) {
                div.innerHTML = content;
            } else {
                div.innerHTML = formatMarkdown(content);
            }
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return div;
        };

        let typingNode = null;
        const showTypingIndicator = () => {
            if (typingNode) return;
            typingNode = document.createElement('div');
            typingNode.className = 'chat-msg bot chat-msg-bot';
            typingNode.style.display = 'flex';
            typingNode.style.alignItems = 'center';
            typingNode.style.gap = '8px';
            typingNode.innerHTML = `
                <span style="font-size: 11px; color: var(--emerald-green); font-weight: 700;">Cora is typing</span>
                <div class="typing-dots"><span></span><span></span><span></span></div>
            `;
            chatMessages.appendChild(typingNode);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const hideTypingIndicator = () => {
            if (typingNode && typingNode.parentNode) {
                typingNode.parentNode.removeChild(typingNode);
            }
            typingNode = null;
        };

        const setChips = (chipsList) => {
            chatChips.innerHTML = '';
            if (!chipsList || chipsList.length === 0) return;

            chipsList.forEach(item => {
                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'chat-chip';
                chip.innerText = item.label;
                chip.addEventListener('click', () => {
                    item.action();
                });
                chatChips.appendChild(chip);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        // Open/Close toggle
        const toggleChat = () => {
            const isActive = chatWin.classList.contains('active') || chatWin.style.display === 'flex';
            if (isActive) {
                chatWin.classList.remove('active');
                chatWin.style.display = 'none';
            } else {
                chatWin.classList.add('active');
                chatWin.style.display = 'flex';
                if (chatMessages.children.length === 0) {
                    renderCoraGreeting();
                }
                setTimeout(() => chatInput.focus(), 250);
            }
        };

        chatBubble.addEventListener('click', toggleChat);
        chatCloseBtn.addEventListener('click', () => {
            chatWin.classList.remove('active');
            chatWin.style.display = 'none';
        });

        // -------------------------------------------------------------
        // STAGE 1: GREETING & 9 PRIMARY SERVICE OPTIONS
        // -------------------------------------------------------------
        const renderCoraGreeting = () => {
            coraState.step = 'greeting';
            coraState.service = '';
            coraState.projectType = '';
            coraState.details = '';
            coraState.handoffChoice = '';
            chatInput.placeholder = "Type a message or select an option below...";

            appendMessage('bot', `
                Hi! Welcome to Corevix Technology. 👋<br><br>
                What are you looking to build or improve?
            `, true);

            setChips([
                { label: 'Custom Software', action: () => handleSelectService('Custom Software') },
                { label: 'ERP / CRM', action: () => handleSelectService('ERP / CRM') },
                { label: 'Website / Web App', action: () => handleSelectService('Website / Web App') },
                { label: 'Mobile App', action: () => handleSelectService('Mobile App') },
                { label: 'SaaS Product', action: () => handleSelectService('SaaS Product') },
                { label: 'AI Automation', action: () => handleSelectService('AI Automation') },
                { label: 'Fintech Solution', action: () => handleSelectService('Fintech Solution') },
                { label: 'Existing Software', action: () => handleSelectService('Existing Software') },
                { label: 'Not Sure', action: () => handleSelectService('Not Sure') },
                { label: '💬 Talk on WhatsApp (+91 92432 38242)', action: () => openDirectWhatsApp() }
            ]);
        };

        const openDirectWhatsApp = () => {
            const waLink = 'https://wa.me/919243238242?text=Hello%20Corevix%20Technology%2C%20I%20would%20like%20to%20speak%20with%20your%20engineering%20team%20about%20a%20software%20project.';
            window.open(waLink, '_blank');
        };

        // -------------------------------------------------------------
        // SERVICE BRANCH LOGIC (1–2 Concise Follow-ups Max)
        // -------------------------------------------------------------
        const handleSelectService = (serviceName) => {
            coraState.service = serviceName;
            appendMessage('user', serviceName);
            chatChips.innerHTML = '';

            setTimeout(() => {
                switch (serviceName) {
                    case 'Custom Software':
                        coraState.step = 'q1';
                        appendMessage('bot', 'Great. What type of business software are you looking to build?');
                        setChips([
                            { label: 'Internal Business Tool', action: () => handleCustomSoftwareQ2('Internal Business Tool') },
                            { label: 'Workflow Automation', action: () => handleCustomSoftwareQ2('Workflow Automation') },
                            { label: 'Customer Portal', action: () => handleCustomSoftwareQ2('Customer Portal') },
                            { label: 'Enterprise Management', action: () => handleCustomSoftwareQ2('Enterprise Management') },
                            { label: 'Other', action: () => handleCustomSoftwareQ2('Other Custom Software') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'ERP / CRM':
                        coraState.step = 'q1';
                        appendMessage('bot', 'What type of business system are you looking for?');
                        setChips([
                            { label: 'ERP System (Operations & Inventory)', action: () => handleErpCrmQ2('ERP System') },
                            { label: 'CRM System (Sales & Clients)', action: () => handleErpCrmQ2('CRM System') },
                            { label: 'Combined ERP + CRM', action: () => handleErpCrmQ2('Combined ERP + CRM') },
                            { label: 'Custom Business System', action: () => handleErpCrmQ2('Custom Business System') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'Website / Web App':
                        coraState.step = 'q1';
                        appendMessage('bot', 'What type of website or web application do you need?');
                        setChips([
                            { label: 'Modern Corporate Website', action: () => handleWebQ2('Corporate Website') },
                            { label: 'Custom Web Application / Portal', action: () => handleWebQ2('Web Application / Portal') },
                            { label: 'E-Commerce Platform', action: () => handleWebQ2('E-Commerce Platform') },
                            { label: 'High-Performance Landing Page', action: () => handleWebQ2('Landing Page') },
                            { label: 'Other', action: () => handleWebQ2('Other Web Solution') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'Mobile App':
                        coraState.step = 'q1';
                        appendMessage('bot', 'Great. What type of mobile app are you planning to build?');
                        setChips([
                            { label: 'Customer App', action: () => handleMobileQ2('Customer App') },
                            { label: 'Business / Internal App', action: () => handleMobileQ2('Business / Internal App') },
                            { label: 'E-commerce App', action: () => handleMobileQ2('E-commerce App') },
                            { label: 'Fintech App', action: () => handleMobileQ2('Fintech App') },
                            { label: 'On-demand App', action: () => handleMobileQ2('On-demand App') },
                            { label: 'Other', action: () => handleMobileQ2('Other Mobile App') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'SaaS Product':
                        coraState.step = 'q1';
                        appendMessage('bot', 'Exciting! What type of SaaS product are you planning?');
                        setChips([
                            { label: 'B2B Enterprise SaaS', action: () => handleSaasQ2('B2B Enterprise SaaS') },
                            { label: 'B2C Platform / App', action: () => handleSaasQ2('B2C Platform / App') },
                            { label: 'Multi-Tenant Workflow Tool', action: () => handleSaasQ2('Multi-Tenant Platform') },
                            { label: 'MVP / Proof of Concept', action: () => handleSaasQ2('MVP / Proof of Concept') },
                            { label: 'Other', action: () => handleSaasQ2('Other SaaS') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'AI Automation':
                        coraState.step = 'q1';
                        appendMessage('bot', 'What business process or workflow do you want to automate or improve with AI?');
                        setChips([
                            { label: 'Customer Support / AI Agents', action: () => handleAiQ2('AI Chatbots & Agents') },
                            { label: 'Document Processing & OCR', action: () => handleAiQ2('Document Processing & OCR') },
                            { label: 'Workflow & Data Automation', action: () => handleAiQ2('Workflow & RPA Automation') },
                            { label: 'Predictive Analytics / ML', action: () => handleAiQ2('Predictive Analytics / ML') },
                            { label: 'Other', action: () => handleAiQ2('Other AI Solution') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'Fintech Solution':
                        coraState.step = 'q1';
                        appendMessage('bot', 'What type of fintech solution are you looking to build?');
                        setChips([
                            { label: 'Payment Gateway & Processing', action: () => handleFintechQ2('Payment Gateway / Processing') },
                            { label: 'Financial Analytics & SaaS Platform', action: () => handleFintechQ2('Financial Analytics & SaaS Platform') },
                            { label: 'Digital Wallet / Neo-Banking', action: () => handleFintechQ2('Digital Wallet / Neo-Banking') },
                            { label: 'Lending & Credit System', action: () => handleFintechQ2('Lending & Credit System') },
                            { label: 'Other', action: () => handleFintechQ2('Other Fintech Solution') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'Existing Software':
                        coraState.step = 'q1';
                        appendMessage('bot', 'What would you like to improve, replace, or modernize in your existing software?');
                        setChips([
                            { label: 'Modernize Legacy Tech Stack', action: () => handleExistingQ2('Modernize Legacy Tech Stack') },
                            { label: 'Fix Performance & Scalability', action: () => handleExistingQ2('Performance & Scalability') },
                            { label: 'Add New Features & APIs', action: () => handleExistingQ2('New Features & APIs') },
                            { label: 'Cloud Migration & Security', action: () => handleExistingQ2('Cloud Migration & Security') },
                            { label: 'Complete Rebuild', action: () => handleExistingQ2('Complete System Rebuild') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    case 'Not Sure':
                        coraState.step = 'q1';
                        appendMessage('bot', 'No problem! What are you trying to improve, automate, or achieve in your business?');
                        setChips([
                            { label: 'Automate manual operations', action: () => finishBranchWith('Automate manual operations', 'Exploring possibilities') },
                            { label: 'Build an online platform or app', action: () => finishBranchWith('Build online platform or app', 'Exploring possibilities') },
                            { label: 'Launch a new digital product', action: () => finishBranchWith('Launch new digital product', 'Exploring possibilities') },
                            { label: 'Connect disconnected tools', action: () => finishBranchWith('Connect disconnected tools', 'Exploring possibilities') },
                            { label: 'Just exploring possibilities', action: () => finishBranchWith('Exploring software solutions', 'Exploring possibilities') },
                            { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                        ]);
                        break;

                    default:
                        renderStage2Handoff();
                        break;
                }
            }, 180);
        };

        // Branch Question 2 handlers
        const handleCustomSoftwareQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Is this starting from scratch or does it need to integrate with your existing systems?');
                setChips([
                    { label: 'Brand new project', action: () => finishBranchWith(type, 'Brand new build from scratch') },
                    { label: 'Integrate with existing systems', action: () => finishBranchWith(type, 'Needs integration with existing database/systems') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleErpCrmQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', "Do you currently use spreadsheets or legacy software you'd like to replace/migrate?");
                setChips([
                    { label: 'Migrating from spreadsheets / legacy', action: () => finishBranchWith(type, 'Migrating from spreadsheets or legacy software') },
                    { label: 'Starting fresh (Clean slate)', action: () => finishBranchWith(type, 'Starting clean slate without migration') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleWebQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Do you already have designs/branding ready, or do you need end-to-end design & engineering?');
                setChips([
                    { label: 'Designs & wireframes are ready', action: () => finishBranchWith(type, 'Designs & wireframes already prepared') },
                    { label: 'Need end-to-end design & build', action: () => finishBranchWith(type, 'Need full UI/UX design and engineering') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleMobileQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Is this a completely new project or do you already have a website/backend that the app needs to connect with?');
                setChips([
                    { label: 'Completely new project', action: () => finishBranchWith(type, 'Completely new build') },
                    { label: 'Connect with existing website / backend', action: () => finishBranchWith(type, 'Connects to existing backend/website') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleSaasQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Are you looking to launch an MVP from scratch or scale/enhance an existing product?');
                setChips([
                    { label: 'Build MVP from scratch', action: () => finishBranchWith(type, 'Build new MVP from scratch') },
                    { label: 'Scale & enhance existing SaaS', action: () => finishBranchWith(type, 'Scale and modernize existing SaaS architecture') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleAiQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Where is your current workflow or data located?');
                setChips([
                    { label: 'Cloud databases & APIs', action: () => finishBranchWith(type, 'Data in cloud databases & APIs') },
                    { label: 'Spreadsheets & manual documents', action: () => finishBranchWith(type, 'Data in spreadsheets and manual documents') },
                    { label: 'Exploring options / Greenfield', action: () => finishBranchWith(type, 'Exploring options from scratch') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleFintechQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'Do you require third-party financial API integrations or compliance architecture?');
                setChips([
                    { label: 'Yes, specific payment / banking APIs', action: () => finishBranchWith(type, 'Specific banking and payment gateway APIs required') },
                    { label: 'Need end-to-end architecture & guidance', action: () => finishBranchWith(type, 'Need full architectural advisory & compliance guidance') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const handleExistingQ2 = (type) => {
            coraState.projectType = type;
            appendMessage('user', type);
            coraState.step = 'q2';
            setTimeout(() => {
                appendMessage('bot', 'What is your current core technology stack or database?');
                setChips([
                    { label: 'PHP / Python / Node.js / .NET', action: () => finishBranchWith(type, 'Standard web backend (PHP/Python/Node/.NET)') },
                    { label: 'Relational DB (SQL / PostgreSQL)', action: () => finishBranchWith(type, 'SQL / PostgreSQL relational database') },
                    { label: 'Custom / Legacy proprietary system', action: () => finishBranchWith(type, 'Custom legacy system') },
                    { label: 'Not sure / Need assessment', action: () => finishBranchWith(type, 'Need technical assessment from Corevix team') },
                    { label: '💬 Talk on WhatsApp', action: () => openDirectWhatsApp() }
                ]);
            }, 180);
        };

        const finishBranchWith = (projectType, details) => {
            if (projectType && !coraState.projectType) coraState.projectType = projectType;
            if (details) coraState.details = details;
            if (details) appendMessage('user', details);
            chatChips.innerHTML = '';
            setTimeout(() => {
                renderStage2Handoff();
            }, 200);
        };

        // -------------------------------------------------------------
        // STAGE 2: QUICK HUMAN HANDOFF
        // -------------------------------------------------------------
        const renderStage2Handoff = () => {
            coraState.step = 'handoff';
            appendMessage('bot', `
                Thanks! I have a good understanding of what you're looking for.<br><br>
                I can share these details with our team so they can discuss the right approach with you.<br><br>
                <strong>How would you like to continue?</strong>
            `, true);

            setChips([
                { label: '💬 Talk to us on WhatsApp', action: () => handleHandoffWhatsApp() },
                { label: '📅 Schedule a Meeting', action: () => handleHandoffMeeting() },
                { label: '📞 Request a Call', action: () => handleHandoffCall() },
                { label: '🔄 Start Over', action: () => renderCoraGreeting() }
            ]);
        };

        // -------------------------------------------------------------
        // STAGE 3: HANDOFF EXECUTION & OPTIONAL CONTACT DETAILS
        // -------------------------------------------------------------
        const logLeadToBackend = async (payload) => {
            try {
                await fetch(`${API_BASE}/consultation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.log('Consultation logging:', err.message);
            }
        };

        // Path 1: WhatsApp
        const handleHandoffWhatsApp = () => {
            coraState.handoffChoice = 'WhatsApp';
            const serviceText = coraState.service || 'Custom Software';
            const typeText = coraState.projectType || 'Engineering Project';
            const detailText = coraState.details || 'Discuss scope';

            const waMsg = `Hi Corevix team, I spoke with Cora on your website.\n\nMy project requirement:\n• Service: ${serviceText}\n• Type: ${typeText}\n• Details: ${detailText}\n\nI'd like to discuss the right approach with your team.`;
            const waLink = `https://wa.me/919243238242?text=${encodeURIComponent(waMsg)}`;

            // Log consultation in background
            logLeadToBackend({
                name: 'Website Visitor (WhatsApp Handoff)',
                company: 'Direct Lead',
                contact: '+91 92432 38242 (WhatsApp)',
                service: serviceText,
                projectType: typeText,
                handoffChoice: 'WhatsApp',
                details: detailText
            });

            appendMessage('bot', `
                Connecting you directly to WhatsApp with your project summary! 🚀<br><br>
                If WhatsApp did not open automatically, <a href="${waLink}" target="_blank" style="color:#25D366; font-weight:800; text-decoration:underline;">Click here to chat on WhatsApp (+91 92432 38242)</a>. Our senior engineers will take it from here.
            `, true);

            window.open(waLink, '_blank');

            setChips([
                { label: '📅 Schedule a Meeting instead', action: () => handleHandoffMeeting() },
                { label: '📞 Request a Call instead', action: () => handleHandoffCall() },
                { label: '🔄 Start New Inquiry', action: () => renderCoraGreeting() }
            ]);
        };

        // Path 2: Schedule a Meeting
        const handleHandoffMeeting = () => {
            coraState.handoffChoice = 'Schedule a Meeting';
            coraState.step = 'capture_meeting';
            chatChips.innerHTML = '';

            appendMessage('bot', `
                To schedule a technical session with our senior architects, please confirm your details:
                <form class="cora-inline-form" id="cora-meeting-form">
                    <div>
                        <label>Your Full Name *</label>
                        <input type="text" id="cora-m-name" placeholder="e.g. Alex Rivera" required autocomplete="name" />
                    </div>
                    <div>
                        <label>Business / Company Name *</label>
                        <input type="text" id="cora-m-company" placeholder="e.g. Acme Enterprises / Tech Startup" required />
                    </div>
                    <div>
                        <label>Work Email or WhatsApp Number *</label>
                        <input type="text" id="cora-m-contact" placeholder="e.g. alex@acme.com or +91 98765 43210" required />
                    </div>
                    <button type="submit">Confirm & Choose Meeting Time &rarr;</button>
                </form>
            `, true);

            setTimeout(() => {
                const form = document.getElementById('cora-meeting-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const name = document.getElementById('cora-m-name').value.trim();
                        const company = document.getElementById('cora-m-company').value.trim();
                        const contact = document.getElementById('cora-m-contact').value.trim();

                        if (!name || !contact) return;

                        form.innerHTML = '<div style="color:var(--emerald-green); font-weight:700; font-size:12px; padding:6px 0;">✓ Scope logged! Opening calendar scheduler...</div>';

                        await logLeadToBackend({
                            name,
                            company,
                            contact,
                            service: coraState.service || 'Custom Software',
                            projectType: coraState.projectType || 'Software Solution',
                            handoffChoice: 'Schedule a Meeting',
                            details: coraState.details
                        });

                        appendMessage('bot', `
                            <strong>Thanks, ${name}!</strong> I've shared your project requirements with our senior technical team.<br><br>
                            You can choose a convenient time slot directly on our consultation calendar below, or our team will contact you at <strong>${contact}</strong>:<br><br>
                            <a href="${contactPath}#consultation" class="cora-handoff-btn" style="text-align:center; justify-content:center; background:var(--emerald-green); color:#050811;">
                                📅 Open Calendar & Choose Time Slot &rarr;
                            </a>
                        `, true);

                        setChips([
                            { label: '💬 Chat on WhatsApp (+91 92432 38242)', action: () => handleHandoffWhatsApp() },
                            { label: '🔄 Start New Inquiry', action: () => renderCoraGreeting() }
                        ]);
                    });
                }
            }, 100);
        };

        // Path 3: Request a Call
        const handleHandoffCall = () => {
            coraState.handoffChoice = 'Request a Call';
            coraState.step = 'capture_call';
            chatChips.innerHTML = '';

            appendMessage('bot', `
                Our engineering leads can call you directly to discuss your project. Please provide the best details:
                <form class="cora-inline-form" id="cora-call-form">
                    <div>
                        <label>Your Full Name *</label>
                        <input type="text" id="cora-c-name" placeholder="e.g. David Vance" required autocomplete="name" />
                    </div>
                    <div>
                        <label>Business / Company Name *</label>
                        <input type="text" id="cora-c-company" placeholder="e.g. Apex Global" required />
                    </div>
                    <div>
                        <label>Best Phone / WhatsApp Number *</label>
                        <input type="tel" id="cora-c-phone" placeholder="e.g. +91 98765 43210" required />
                    </div>
                    <div>
                        <label>Preferred Time for Call</label>
                        <select id="cora-c-time">
                            <option value="ASAP / Urgent">ASAP / Urgent</option>
                            <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                            <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                            <option value="Evening (5 PM - 8 PM)">Evening (5 PM - 8 PM)</option>
                        </select>
                    </div>
                    <button type="submit">Request Call Back &rarr;</button>
                </form>
            `, true);

            setTimeout(() => {
                const form = document.getElementById('cora-call-form');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const name = document.getElementById('cora-c-name').value.trim();
                        const company = document.getElementById('cora-c-company').value.trim();
                        const phone = document.getElementById('cora-c-phone').value.trim();
                        const time = document.getElementById('cora-c-time').value;

                        if (!name || !phone) return;

                        form.innerHTML = '<div style="color:var(--emerald-green); font-weight:700; font-size:12px; padding:6px 0;">✓ Call request registered with engineering desk!</div>';

                        await logLeadToBackend({
                            name,
                            company,
                            phone,
                            preferredTime: time,
                            service: coraState.service || 'Custom Software',
                            projectType: coraState.projectType || 'Software Solution',
                            handoffChoice: 'Request a Call',
                            details: coraState.details
                        });

                        appendMessage('bot', `
                            <strong>Thank you, ${name}!</strong> Our technical team at Corevix Technology will call you at <strong>${phone}</strong> (${time}).<br><br>
                            We have prepared your requirement summary for <strong>${coraState.service || 'Software Engineering'}</strong>.<br><br>
                            If you need an answer immediately, you can also reach our team on WhatsApp:
                            <div style="margin-top:10px;">
                                <a href="https://wa.me/919243238242?text=Hello%20Corevix%20Team%2C%20I%20just%20requested%20a%20call%20for%20my%20project%20(${encodeURIComponent(coraState.service || 'Software')})." target="_blank" class="cora-handoff-btn wa-primary" style="text-align:center; justify-content:center;">
                                    💬 WhatsApp Our Team Now &rarr;
                                </a>
                            </div>
                        `, true);

                        setChips([
                            { label: '🔄 Start New Inquiry', action: () => renderCoraGreeting() }
                        ]);
                    });
                }
            }, 100);
        };

        // -------------------------------------------------------------
        // FREE-FORM TEXT QUERY ENGINE (GEMINI AI BACKED)
        // -------------------------------------------------------------
        const handleSendQuery = async (queryText) => {
            if (!queryText || !queryText.trim()) return;
            const text = queryText.trim();

            appendMessage('user', text);
            chatInput.value = '';
            chatChips.innerHTML = '';
            chatInput.disabled = true;
            showTypingIndicator();

            try {
                const res = await fetch(`${API_BASE}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history: chatHistory
                    })
                });

                const data = await res.json();
                hideTypingIndicator();
                chatInput.disabled = false;
                chatInput.focus();

                if (data.success && data.reply) {
                    appendMessage('bot', data.reply);
                    chatHistory.push({ sender: 'user', text: text });
                    chatHistory.push({ sender: 'bot', text: data.reply });

                    setChips([
                        {
                            label: '💬 Talk to us on WhatsApp',
                            action: () => handleHandoffWhatsApp()
                        },
                        {
                            label: '📅 Schedule a Meeting',
                            action: () => handleHandoffMeeting()
                        },
                        {
                            label: '📞 Request a Call',
                            action: () => handleHandoffCall()
                        },
                        {
                            label: '🚀 Scope My Project Requirement',
                            action: () => renderCoraGreeting()
                        }
                    ]);
                } else {
                    appendMessage('bot', `I'm here to connect you with our engineering leads at Corevix Technology. Would you like to discuss your project directly on WhatsApp or schedule a meeting?`, false);
                    setChips([
                        { label: '💬 Talk on WhatsApp (+91 92432 38242)', action: () => handleHandoffWhatsApp() },
                        { label: '📅 Schedule a Meeting', action: () => handleHandoffMeeting() },
                        { label: '📞 Request a Call', action: () => handleHandoffCall() }
                    ]);
                }
            } catch (err) {
                hideTypingIndicator();
                chatInput.disabled = false;
                chatInput.focus();
                appendMessage('bot', `You can connect directly with our senior software architects on <a href="${whatsAppUrl}" target="_blank" style="color:#25D366; font-weight:700;">WhatsApp (+91 92432 38242)</a> or <a href="${contactPath}" style="color:var(--emerald-green); font-weight:700;">Schedule a Meeting</a>.`, true);
                setChips([
                    { label: '💬 WhatsApp (+91 92432 38242)', action: () => handleHandoffWhatsApp() },
                    { label: '📅 Schedule Meeting', action: () => handleHandoffMeeting() }
                ]);
            }
        };

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSendQuery(chatInput.value);
        });
    };

    initCorevixAssistant();

    // 8. DYNAMIC PUBLISHED SOFTWARE PROFILES RENDERER (TARGET: case-studies.html & index.html)
    const renderPublishedSoftwareProfiles = async () => {
        const caseStudiesContainer = document.getElementById('dynamic-published-projects-container') || document.getElementById('dynamic-admin-projects-container');
        const homeProjectsContainer = document.getElementById('dynamic-home-projects-container');

        if (!caseStudiesContainer && !homeProjectsContainer) return;

        let softwareProfiles = [];

        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (res.ok) {
                softwareProfiles = await res.json();
            }
        } catch (err) {
            console.warn('Network error fetching projects, checking cache:', err);
        }

        if (softwareProfiles.length > 0) {
            localStorage.setItem('corevix_software_profiles', JSON.stringify(softwareProfiles));
        } else {
            const localProfiles = JSON.parse(localStorage.getItem('corevix_software_profiles') || '[]');
            if (localProfiles.length > 0) {
                softwareProfiles = localProfiles;
            }
        }

        const staticFeatured = [
            {
                id: 2,
                name: "Sub-12ms Financial Analytics & Reconciliation Platform",
                tagline: "High-concurrency payment clearinghouse handling 120,000+ daily streams.",
                desc: "Engineered a distributed payment reconciliation engine for an enterprise bank with automated ledger settlement, audit tracking, and sub-12ms response times.",
                tech: ["React", "Node.js", "PostgreSQL", "Redis Cluster", "Kafka"],
                industry: "Fintech Infrastructure",
                metric: "340% Throughput Boost & Sub-12ms Latency",
                shot1: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
                logo: "assets/corevix-logo-icon.png"
            },
            {
                id: 3,
                name: "HIPAA-Compliant Patient Telehealth Portal",
                tagline: "End-to-end encrypted medical consultation platform with WebRTC.",
                desc: "Architected an end-to-end encrypted medical consultation platform integrating real-time WebRTC video calls, EHR synchronization, and automated billing.",
                tech: ["Next.js", "FastAPI", "WebRTC", "HIPAA Encrypted", "PostgreSQL"],
                industry: "Healthcare Telehealth",
                metric: "85,000+ Monthly Consultations",
                shot1: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80",
                logo: "assets/corevix-logo-icon.png"
            },
            {
                id: 4,
                name: "AI Supply Chain Demand Forecasting Engine",
                tagline: "Multi-echelon inventory optimization using transformer forecasting models.",
                desc: "Deployed real-time logistics tracking and dynamic re-order prediction models for an enterprise distributor with over 45 regional warehouse hubs.",
                tech: ["Python", "PyTorch", "Docker", "TimescaleDB", "GCP"],
                industry: "Logistics & Supply Chain",
                metric: "42% Reduction in Stockout Events",
                shot1: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
                logo: "assets/corevix-logo-icon.png"
            },
            {
                id: 5,
                name: "Multi-Tenant B2B SaaS Billing & Metering Engine",
                tagline: "Usage-based dynamic subscription billing handling millions in recurring ARR.",
                desc: "High-throughput metering engine aggregating event-based telemetry across API endpoints and calculating invoice deductions with zero drift.",
                tech: ["Go", "Kafka", "ClickHouse", "Stripe API", "Kubernetes"],
                industry: "Enterprise SaaS",
                metric: "99.999% Metering Accuracy",
                shot1: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
                logo: "assets/corevix-logo-icon.png"
            }
        ];

        const defaultLogo = 'assets/corevix-logo-icon.png';
        const defaultShot = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22450%22%20viewBox%3D%220%200%20800%20450%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d1324%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23050811%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%2310B981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECorevix%20Enterprise%20Software%3C%2Ftext%3E%3C%2Fsvg%3E';

        const renderSingleCard = (item, isCarouselItem = false, index = 0) => {
            const techList = Array.isArray(item.tech) 
                ? item.tech 
                : (typeof item.tech === 'string' ? item.tech.split(',') : []);

            const logoSrc = item.logo || item.shot1 || defaultLogo;
            const shotSrc = item.shot1 || item.logo || defaultShot;

            const rawDesc = item.desc || item.tagline || '';
            const cleanDesc = rawDesc.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            const detailUrl = `case-study-detail.html?id=${encodeURIComponent(item.id)}`;

            if (isCarouselItem) {
                // Exact transformation card structure matching media_1790186841129.png
                const stepNum = String(index + 1).padStart(2, '0');
                const shortDesc = cleanDesc.length > 115 ? cleanDesc.substring(0, 115).trim() + '...' : cleanDesc;
                const flowIndex = (index % 5) + 1;

                return `
                <a href="${detailUrl}" class="transformation-card flow-${flowIndex}">
                    <div class="trans-step-indicator">
                        <span class="trans-step-num">STEP ${stepNum}</span>
                    </div>
                    <div class="from-container">
                        <span class="from-label">FROM</span>
                        <div class="from-text">${item.name}</div>
                    </div>
                    <div class="animated-flow-arrow">
                        <svg viewBox="0 0 24 24"><path d="M12 4v14M6 13l6 6 6-6"/></svg>
                    </div>
                    <div class="to-container">
                        <span class="to-label">ENGINEERED OUTCOME</span>
                        <div class="to-text">${item.tagline || item.name}</div>
                    </div>
                    <p class="outcome-desc">${shortDesc}</p>
                    <span class="impact-tag">⚡ ${item.metric || 'Production Ready & Verified'}</span>
                </a>
                `;
            }

            // Compact full card for case-studies.html
            const shortDesc = cleanDesc.length > 110 ? cleanDesc.substring(0, 110).trim() + '...' : cleanDesc;
            return `
            <div class="glass-card tilt-card reveal active cs-directory-card">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 4px;">
                        <span style="font-size: 9.5px; font-weight: 800; color: var(--emerald-green); text-transform: uppercase; letter-spacing: 0.8px;">${item.industry || 'Enterprise Software'}</span>
                        <span style="font-size: 9px; background: rgba(16,185,129,0.15); border: 1px solid var(--border-emerald); color: var(--emerald-green); padding: 2px 7px; border-radius: 10px; font-weight: 700;">PROVEN OUTCOME</span>
                    </div>

                    <div class="cs-card-header" style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
                        <img src="${logoSrc}" alt="${item.name}" class="cs-card-logo" onerror="this.onerror=null;this.src='${defaultLogo}';" style="width: 36px; height: 36px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-emerald); flex-shrink: 0; background: rgba(16,185,129,0.1);">
                        <div style="min-width: 0;">
                            <h3 class="cs-card-title" style="font-size: 15px; font-weight: 800; color: #FFF; line-height: 1.25; word-break: break-word; margin: 0;">${item.name}</h3>
                            ${item.tagline ? `<div style="font-size: 11px; color: var(--emerald-green); font-weight: 600; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.tagline}</div>` : ''}
                        </div>
                    </div>

                    ${shotSrc ? `
                        <div class="cs-card-screenshot" style="margin-bottom: 10px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3);">
                            <img src="${shotSrc}" alt="${item.name} Screenshot" onerror="this.onerror=null;this.src='${defaultShot}';" style="width: 100%; height: 125px; object-fit: cover; display: block;">
                        </div>
                    ` : ''}

                    <div style="font-size: 12px; color: var(--text-slate); margin-bottom: 10px; line-height: 1.45;">
                        <p style="margin: 0;">${shortDesc}</p>
                    </div>

                    ${techList.length > 0 ? `
                        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px;">
                            ${techList.slice(0, 3).map(t => `<span class="tech-badge-tag highlight" style="font-size: 9.5px; padding: 2px 7px;">${t.trim()}</span>`).join('')}
                            ${techList.length > 3 ? `<span class="tech-badge-tag" style="font-size: 9.5px; padding: 2px 7px;">+${techList.length - 3} more</span>` : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="cs-card-impact-bar">
                    <span style="color: var(--emerald-green); font-weight: 700; font-size: 11px; line-height: 1.3;">✓ Impact: ${item.metric || '100% IP Handover'}</span>
                    <a href="${detailUrl}" class="btn-pill btn-emerald cs-card-learn-btn" style="padding: 5px 12px; font-size: 11px;">Learn more &rarr;</a>
                </div>
            </div>
            `;
        };

        // Render on Case Studies Page (Full Grid - Database Projects Only)
        if (caseStudiesContainer && softwareProfiles.length > 0) {
            caseStudiesContainer.innerHTML = softwareProfiles.map((item, idx) => renderSingleCard(item, false, idx)).join('');
        }

        // Render on Home Page (ONLY real software deliveries from database - strictly NO dummy case studies)
        if (homeProjectsContainer) {
            const realHomeProfiles = softwareProfiles.slice(0, 4);

            if (realHomeProfiles.length > 0) {
                homeProjectsContainer.innerHTML = realHomeProfiles.map((item, idx) => renderSingleCard(item, true, idx)).join('');
            } else {
                homeProjectsContainer.innerHTML = `
                    <div style="text-align: center; color: var(--text-slate); padding: 40px; width: 100%;">
                        No published software deliveries yet. Add projects via the Admin Portal.
                    </div>
                `;
            }
        }
    };

    renderPublishedSoftwareProfiles();

    // 9. DYNAMIC PUBLISHED BLOG POSTS RENDERER (TARGET: blog.html & index.html bottom)
    const renderPublishedBlogs = async () => {
        const blogContainer = document.getElementById('dynamic-admin-blogs-container');
        const homeBlogContainer = document.getElementById('dynamic-home-blogs-container');

        let blogs = [];
        try {
            const res = await fetch(`${API_BASE}/blogs`);
            if (res.ok) {
                blogs = await res.json();
            }
        } catch (err) {
            console.warn('Network error fetching blogs, checking cache:', err);
        }

        const localBlogs = JSON.parse(localStorage.getItem('corevix_blogs') || '[]');
        if (blogs.length === 0 && localBlogs.length > 0) {
            blogs = localBlogs;
        } else if (localBlogs.length > 0) {
            const existingIds = new Set(blogs.map(b => String(b.id)));
            const unmerged = localBlogs.filter(b => !existingIds.has(String(b.id)));
            if (unmerged.length > 0) {
                blogs = [...unmerged, ...blogs];
            }
        }

        if (blogs.length > 0) {
            const defaultBlogImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
            const blogHtml = blogs.map(b => {
                const rawContent = b.content || '';
                const cleanContent = rawContent.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
                const shortContent = cleanContent.length > 130 ? cleanContent.substring(0, 130).trim() + '...' : cleanContent;
                const blogUrl = `blog-detail.html?id=${encodeURIComponent(b.id)}`;
                const imgSrc = b.image || defaultBlogImg;

                return `
                <div class="glass-card tilt-card reveal active" style="padding: 24px; border-color: var(--border-emerald); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="font-size: 10px; font-weight: 800; color: var(--emerald-green); text-transform: uppercase; margin-bottom: 8px;">${b.category || 'ENGINEERING INSIGHT'}</div>
                        <div style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);">
                            <img src="${imgSrc}" alt="${b.title}" onerror="this.onerror=null;this.src='${defaultBlogImg}';" style="width: 100%; height: 160px; object-fit: cover; display: block;">
                        </div>
                        <h3 style="font-size: 18px; font-weight: 800; color: #FFF; margin-bottom: 8px; line-height: 1.35;">${b.title}</h3>
                        <p style="font-size: 13px; color: var(--text-slate); line-height: 1.5; margin-bottom: 14px;">${shortContent}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06);">
                        <span>📅 ${b.date || 'Recent'}</span>
                        <a href="${blogUrl}" class="btn-pill btn-emerald" style="padding: 6px 14px; font-size: 11px; font-weight: 700; text-decoration: none;">Learn more &rarr;</a>
                    </div>
                </div>
                `;
            }).join('');

            if (blogContainer) {
                blogContainer.innerHTML = blogHtml;
            }
            if (homeBlogContainer) {
                homeBlogContainer.innerHTML = blogHtml;
            }
        }
    };

    renderPublishedBlogs();

    // DEDICATED CASE STUDY DETAIL PAGE HYDRATOR (case-study-detail.html)
    const initCaseStudyDetailPage = async () => {
        const contentBox = document.getElementById('cs-content-box');
        if (!contentBox) return;

        const spinner = document.getElementById('cs-loading-spinner');
        const errorBox = document.getElementById('cs-error-box');

        const params = new URLSearchParams(window.location.search);
        const projectId = params.get('id');

        if (!projectId) {
            if (spinner) spinner.style.display = 'none';
            if (errorBox) errorBox.style.display = 'block';
            return;
        }

        let project = null;

        try {
            const local = JSON.parse(localStorage.getItem('corevix_software_profiles') || '[]');
            project = local.find(p => String(p.id) === String(projectId));
        } catch (e) {}

        try {
            const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`);
            if (res.ok) {
                project = await res.json();
            }
        } catch (err) {
            console.warn('Network error loading project details:', err);
        }

        if (!project) {
            try {
                const resAll = await fetch(`${API_BASE}/projects`);
                if (resAll.ok) {
                    const allProjects = await resAll.json();
                    project = allProjects.find(p => String(p.id) === String(projectId));
                }
            } catch (e) {}
        }

        if (!project) {
            if (spinner) spinner.style.display = 'none';
            if (errorBox) errorBox.style.display = 'block';
            return;
        }

        const pageTitle = document.getElementById('page-title');
        const pageMetaDesc = document.getElementById('page-meta-desc');
        const csBreadcrumb = document.getElementById('cs-breadcrumb');
        const csIndustryBadge = document.getElementById('cs-industry-badge');
        const csDateBadge = document.getElementById('cs-date-badge');
        const csTitle = document.getElementById('cs-title');
        const csTagline = document.getElementById('cs-tagline');
        const csMetricHighlight = document.getElementById('cs-metric-highlight');
        const csLogo = document.getElementById('cs-logo');
        const csShot = document.getElementById('cs-shot');
        const csDescription = document.getElementById('cs-description');
        const csTechTags = document.getElementById('cs-tech-tags');
        const csLinkContainer = document.getElementById('cs-link-container');
        const csLiveUrl = document.getElementById('cs-live-url');

        if (pageTitle) pageTitle.textContent = `${project.name} | Case Study Details | Corevix Technology`;
        if (pageMetaDesc) pageMetaDesc.setAttribute('content', project.tagline || (project.desc || '').substring(0, 160));
        if (csBreadcrumb) csBreadcrumb.textContent = project.name;
        if (csIndustryBadge) csIndustryBadge.textContent = (project.industry || 'ENTERPRISE SOFTWARE').toUpperCase();
        if (csDateBadge) csDateBadge.textContent = project.date ? `Published: ${project.date}` : 'Verified Delivery';
        if (csTitle) csTitle.textContent = project.name;
        if (csTagline) csTagline.textContent = project.tagline || '';
        if (csMetricHighlight) csMetricHighlight.textContent = project.metric || '100% IP Handover & Production Deployed';

        const defaultLogo = 'assets/corevix-logo-icon.png';
        const defaultShot = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22450%22%20viewBox%3D%220%200%20800%20450%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d1324%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23050811%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%2310B981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECorevix%20Enterprise%20Software%3C%2Ftext%3E%3C%2Fsvg%3E';

        if (csLogo) {
            const logoSrc = project.logo || project.shot1 || defaultLogo;
            csLogo.src = logoSrc;
            csLogo.alt = `${project.name} Logo`;
            csLogo.onerror = () => { csLogo.src = defaultLogo; };
        }

        if (csShot) {
            const shotSrc = project.shot1 || project.logo || defaultShot;
            csShot.src = shotSrc;
            csShot.alt = `${project.name} Architecture Screenshot`;
            csShot.onerror = () => { csShot.src = defaultShot; };
        }

        if (csDescription) {
            csDescription.textContent = project.desc || 'Detailed specification available upon request.';
        }

        if (csTechTags) {
            const techList = Array.isArray(project.tech) 
                ? project.tech 
                : (typeof project.tech === 'string' ? project.tech.split(',') : []);

            if (techList.length > 0) {
                csTechTags.innerHTML = techList.map(t => `<span class="tech-badge-tag highlight" style="font-size: 12px; padding: 6px 14px;">${t.trim()}</span>`).join('');
            } else {
                csTechTags.innerHTML = '<span class="tech-badge-tag highlight">Custom Enterprise Stack</span>';
            }
        }

        if (csLinkContainer && csLiveUrl) {
            if (project.url && project.url.trim().length > 0) {
                csLiveUrl.href = project.url;
                csLinkContainer.style.display = 'block';
            } else {
                csLinkContainer.style.display = 'none';
            }
        }

        if (spinner) spinner.style.display = 'none';
        contentBox.style.display = 'block';
    };

    initCaseStudyDetailPage();

    // DEDICATED BLOG ARTICLE DETAIL PAGE HYDRATOR (blog-detail.html)
    const initBlogDetailPage = async () => {
        const contentBox = document.getElementById('blog-content-box');
        if (!contentBox) return;

        const spinner = document.getElementById('blog-loading-spinner');
        const errorBox = document.getElementById('blog-error-box');

        const params = new URLSearchParams(window.location.search);
        const blogId = params.get('id');

        if (!blogId) {
            if (spinner) spinner.style.display = 'none';
            if (errorBox) errorBox.style.display = 'block';
            return;
        }

        let blog = null;

        try {
            const local = JSON.parse(localStorage.getItem('corevix_blogs') || '[]');
            blog = local.find(b => String(b.id) === String(blogId));
        } catch (e) {}

        try {
            const res = await fetch(`${API_BASE}/blogs/${encodeURIComponent(blogId)}`);
            if (res.ok) {
                blog = await res.json();
            }
        } catch (err) {
            console.warn('Network error loading blog details:', err);
        }

        if (!blog) {
            try {
                const resAll = await fetch(`${API_BASE}/blogs`);
                if (resAll.ok) {
                    const allBlogs = await resAll.json();
                    blog = allBlogs.find(b => String(b.id) === String(blogId));
                }
            } catch (e) {}
        }

        if (!blog) {
            if (spinner) spinner.style.display = 'none';
            if (errorBox) errorBox.style.display = 'block';
            return;
        }

        const blogMetaTitle = document.getElementById('blog-meta-title');
        const blogMetaDesc = document.getElementById('blog-meta-desc');
        const blogBreadcrumb = document.getElementById('blog-breadcrumb');
        const blogCategory = document.getElementById('blog-category');
        const blogDate = document.getElementById('blog-date');
        const blogReadTime = document.getElementById('blog-read-time');
        const blogTitle = document.getElementById('blog-title');
        const blogImage = document.getElementById('blog-image');
        const blogContent = document.getElementById('blog-content');

        if (blogMetaTitle) blogMetaTitle.textContent = `${blog.title} | Engineering Insights | Corevix Technology`;
        if (blogMetaDesc) blogMetaDesc.setAttribute('content', (blog.content || '').substring(0, 160));
        if (blogBreadcrumb) blogBreadcrumb.textContent = blog.title;
        if (blogCategory) blogCategory.textContent = (blog.category || 'ENGINEERING INSIGHT').toUpperCase();
        if (blogDate) blogDate.textContent = `Published: ${blog.date || 'Recent'}`;

        const wordCount = (blog.content || '').split(/\s+/).filter(Boolean).length;
        const readMins = Math.max(1, Math.ceil(wordCount / 200));
        if (blogReadTime) blogReadTime.textContent = `${readMins} min read`;

        if (blogTitle) blogTitle.textContent = blog.title;

        const defaultBlogImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
        if (blogImage) {
            const imgSrc = blog.image || defaultBlogImg;
            blogImage.src = imgSrc;
            blogImage.alt = blog.title;
            blogImage.onerror = () => { blogImage.src = defaultBlogImg; };
        }

        if (blogContent) {
            blogContent.textContent = blog.content || '';
        }

        if (spinner) spinner.style.display = 'none';
        contentBox.style.display = 'block';
    };

    initBlogDetailPage();

    // 10. ADMIN PANEL INTERACTIVITY & FORM HANDLERS (admin.html)
    const adminPasscodeModal = document.getElementById('admin-passcode-modal');
    const adminPasscodeBtn = document.getElementById('admin-passcode-btn');
    const adminPasscodeInput = document.getElementById('admin-passcode-input');
    const passcodeError = document.getElementById('passcode-error');

    if (adminPasscodeBtn && adminPasscodeModal) {
        adminPasscodeBtn.addEventListener('click', () => {
            const inputVal = adminPasscodeInput.value.trim();
            if (inputVal === 'trade2026admin') {
                adminPasscodeModal.style.display = 'none';
            } else {
                if (passcodeError) passcodeError.style.display = 'block';
            }
        });
    }

    // Admin Tab Switching (Project Upload vs Blog Upload)
    const tabBtnProject = document.getElementById('tab-btn-project');
    const tabBtnBlog = document.getElementById('tab-btn-blog');
    const tabBtnWhatsapp = document.getElementById('tab-btn-whatsapp');
    const sectionProject = document.getElementById('section-project-upload');
    const sectionBlog = document.getElementById('section-blog-upload');
    const sectionWhatsapp = document.getElementById('section-whatsapp-bot');

    // Function to load WhatsApp Bot Status and Recent Leads
    const loadWhatsAppStatusAndLeads = async () => {
        const badge = document.getElementById('wa-bot-status-badge');
        const container = document.getElementById('wa-leads-table-container');

        // Check bot status
        try {
            const res = await fetch('/api/whatsapp/status');
            const data = await res.json();
            if (badge) {
                if (data.connected) {
                    badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #4ADE80; display: inline-block;"></span> Online & Active (+91 92432 38242)';
                    badge.style.borderColor = '#22C55E';
                    badge.style.color = '#4ADE80';
                } else {
                    badge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span> Bot Ready to Connect (+91 92432 38242)';
                    badge.style.borderColor = '#F59E0B';
                    badge.style.color = '#FBBF24';
                }
            }
        } catch (e) {
            console.warn('WhatsApp status check skipped:', e.message);
        }

        // Fetch recent consultations / leads
        if (!container) return;
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-slate);">Loading inquiries...</div>';

        try {
            const res = await fetch('/api/consultations');
            const leads = await res.json();

            if (!Array.isArray(leads) || leads.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-slate); font-size: 13px;">No client inquiries recorded yet.</div>';
                return;
            }

            let html = `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                        <thead>
                            <tr style="background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.1); color: #94A3B8;">
                                <th style="padding: 12px 16px;">Client Name</th>
                                <th style="padding: 12px 16px;">Contact</th>
                                <th style="padding: 12px 16px;">Service</th>
                                <th style="padding: 12px 16px;">Source</th>
                                <th style="padding: 12px 16px;">Date</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            leads.slice(0, 15).forEach((item, idx) => {
                const isWA = (item.source || '').includes('WhatsApp') || (item.handoffChoice || '').includes('WhatsApp');
                const badgeColor = isWA ? '#22C55E' : '#38BDF8';
                const sourceTag = isWA ? '💬 WhatsApp Bot' : '🌐 Web Form';
                const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent';

                html += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06); background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'};">
                        <td style="padding: 12px 16px; font-weight: 700; color: #FFF;">${item.name || 'Anonymous Client'}</td>
                        <td style="padding: 12px 16px; color: var(--text-slate);">
                            <div>📞 ${item.phone || 'N/A'}</div>
                            <div style="font-size: 11px; color: #64748B;">${item.email || ''}</div>
                        </td>
                        <td style="padding: 12px 16px; color: #E2E8F0; max-width: 220px;">
                            <div style="font-weight: 600;">${item.service || 'General Scoping'}</div>
                            ${item.details ? `<div style="font-size: 11px; color: #94A3B8; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${item.details}</div>` : ''}
                        </td>
                        <td style="padding: 12px 16px;">
                            <span style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px; background: rgba(255,255,255,0.05); color: ${badgeColor}; border: 1px solid ${badgeColor};">${sourceTag}</span>
                        </td>
                        <td style="padding: 12px 16px; font-size: 11px; color: #64748B; white-space: nowrap;">${dateStr}</td>
                    </tr>
                `;
            });

            html += `</tbody></table></div>`;
            container.innerHTML = html;

        } catch (e) {
            container.innerHTML = `<div style="padding: 24px; text-align: center; color: #EF4444;">Error loading leads: ${e.message}</div>`;
        }
    };

    const switchAdminTab = (activeTab) => {
        if (tabBtnProject) tabBtnProject.className = activeTab === 'project' ? 'btn-pill btn-emerald' : 'btn-pill btn-glass';
        if (tabBtnBlog) tabBtnBlog.className = activeTab === 'blog' ? 'btn-pill btn-emerald' : 'btn-pill btn-glass';
        if (tabBtnWhatsapp) tabBtnWhatsapp.className = activeTab === 'whatsapp' ? 'btn-pill btn-emerald' : 'btn-pill btn-glass';

        if (sectionProject) sectionProject.style.display = activeTab === 'project' ? 'block' : 'none';
        if (sectionBlog) sectionBlog.style.display = activeTab === 'blog' ? 'block' : 'none';
        if (sectionWhatsapp) sectionWhatsapp.style.display = activeTab === 'whatsapp' ? 'block' : 'none';

        if (activeTab === 'whatsapp') {
            loadWhatsAppStatusAndLeads();
        }
    };

    if (tabBtnProject) tabBtnProject.addEventListener('click', () => switchAdminTab('project'));
    if (tabBtnBlog) tabBtnBlog.addEventListener('click', () => switchAdminTab('blog'));
    if (tabBtnWhatsapp) tabBtnWhatsapp.addEventListener('click', () => switchAdminTab('whatsapp'));

    const refreshWaLeadsBtn = document.getElementById('btn-refresh-wa-leads');
    if (refreshWaLeadsBtn) {
        refreshWaLeadsBtn.addEventListener('click', () => loadWhatsAppStatusAndLeads());
    }

    // Admin Industry Selector Custom "Other" Toggle
    const industrySelect = document.getElementById('p-industry');
    const customIndustryBox = document.getElementById('custom-industry-box');

    if (industrySelect && customIndustryBox) {
        industrySelect.addEventListener('change', () => {
            if (industrySelect.value === 'Other') {
                customIndustryBox.style.display = 'block';
            } else {
                customIndustryBox.style.display = 'none';
            }
        });
    }

    // 10. High-Performance Client-Side Image Resizer & Compressor
    const compressImageFile = (file, maxWidth = 1000, quality = 0.82) => {
        return new Promise((resolve) => {
            if (!file) return resolve('');
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUri = e.target.result;
                const img = new Image();
                img.onload = () => {
                    try {
                        let width = img.naturalWidth || img.width || 800;
                        let height = img.naturalHeight || img.height || 450;

                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }

                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
                        resolve(compressedUrl);
                    } catch (err) {
                        resolve(dataUri);
                    }
                };
                img.onerror = () => resolve(dataUri);
                img.src = dataUri;
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
        });
    };

    // Live Image Previews in Admin Form
    const setupImagePreview = (fileInputId, urlInputId, previewContainerId) => {
        const fileInput = document.getElementById(fileInputId);
        const urlInput = document.getElementById(urlInputId);
        const previewBox = document.getElementById(previewContainerId);
        if (!previewBox) return;
        const previewImg = previewBox.querySelector('img');

        const showPreview = (src) => {
            if (src && previewImg) {
                previewImg.src = src;
                previewBox.style.display = 'block';
            }
        };

        if (fileInput) {
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files[0];
                if (file) {
                    // Instant preview with FileReader so user sees their photo right away!
                    const previewReader = new FileReader();
                    previewReader.onload = (e) => showPreview(e.target.result);
                    previewReader.readAsDataURL(file);

                    // Simultaneously compress in background
                    const compressed = await compressImageFile(file, fileInputId.includes('logo') ? 320 : 1000, 0.82);
                    fileInput.dataset.compressedData = compressed;
                }
            });
        }

        if (urlInput) {
            urlInput.addEventListener('input', () => {
                const url = urlInput.value.trim();
                if (url) {
                    showPreview(url);
                }
            });
        }
    };

    setupImagePreview('p-logo-file', 'p-logo-url', 'p-logo-preview');
    setupImagePreview('p-shot1-file', 'p-shot1-url', 'p-shot1-preview');
    setupImagePreview('b-image-file', 'b-image-url', 'b-image-preview');

    // Admin Project Upload & Edit Form Submission
    const projectUploadForm = document.getElementById('admin-upload-form');
    if (projectUploadForm) {
        projectUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editingId = projectUploadForm.dataset.editingId;
            const isEditing = Boolean(editingId);

            const submitBtn = document.getElementById('btn-submit-project') || projectUploadForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Publish';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = isEditing ? '⏳ Updating Profile & Image...' : '⏳ Optimizing & Publishing Profile...';
            }

            const name = document.getElementById('p-name').value.trim();
            const tagline = document.getElementById('p-tagline').value.trim();
            const industry = document.getElementById('p-industry').value;
            const customIndustry = document.getElementById('p-custom-industry') ? document.getElementById('p-custom-industry').value.trim() : '';
            const desc = document.getElementById('p-desc').value.trim();
            const tech = document.getElementById('p-tech').value.trim();
            const metric = document.getElementById('p-metric').value.trim();
            const url = document.getElementById('p-url').value.trim();

            const logoFileInput = document.getElementById('p-logo-file');
            const logoUrlInput = document.getElementById('p-logo-url');
            const shot1FileInput = document.getElementById('p-shot1-file');
            const shot1UrlInput = document.getElementById('p-shot1-url');

            // 1. Resolve compressed Logo Data URL
            let logoBase64 = (logoUrlInput && logoUrlInput.value.trim()) || '';
            if (!logoBase64 && logoFileInput && logoFileInput.files[0]) {
                logoBase64 = logoFileInput.dataset.compressedData || await compressImageFile(logoFileInput.files[0], 320, 0.85);
            }
            if (!logoBase64 && isEditing && projectUploadForm.dataset.existingLogo) {
                logoBase64 = projectUploadForm.dataset.existingLogo;
            }

            // 2. Resolve compressed Screenshot Data URL
            let shot1Base64 = (shot1UrlInput && shot1UrlInput.value.trim()) || '';
            if (!shot1Base64 && shot1FileInput && shot1FileInput.files[0]) {
                shot1Base64 = shot1FileInput.dataset.compressedData || await compressImageFile(shot1FileInput.files[0], 1000, 0.82);
            }
            if (!shot1Base64 && isEditing && projectUploadForm.dataset.existingShot) {
                shot1Base64 = projectUploadForm.dataset.existingShot;
            }

            const statusBox = document.getElementById('project-upload-status');
            const showStatus = (msg, isError = false) => {
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                    statusBox.style.color = isError ? '#EF4444' : 'var(--emerald-green)';
                    statusBox.style.border = isError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-emerald)';
                    statusBox.innerHTML = msg;
                }
            };

            // If user only uploaded one image, use it for both logo and screenshot
            if (!logoBase64 && shot1Base64) logoBase64 = shot1Base64;
            if (!shot1Base64 && logoBase64) shot1Base64 = logoBase64;

            if (!shot1Base64 && !isEditing) {
                showStatus('⚠️ Please select an image file or paste an image URL for the screenshot.', true);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
                return;
            }

            showStatus(isEditing ? '⏳ Updating profile and photo in database...' : '⏳ Uploading and publishing your case study with custom photo...');

            const finalInd = (industry === 'Other' && customIndustry) ? customIndustry : industry;

            const payload = {
                name,
                tagline,
                industry: finalInd,
                customIndustry,
                desc,
                tech,
                metric,
                url,
                logoBase64,
                shot1Base64,
                logo: logoBase64,
                shot1: shot1Base64
            };

            try {
                const endpoint = isEditing ? `${API_BASE}/admin/projects/${editingId}` : `${API_BASE}/admin/projects`;
                const method = isEditing ? 'PUT' : 'POST';

                const res = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Server error saving project');
                }

                const savedProject = data.project || { id: isEditing ? Number(editingId) : Date.now(), ...payload, logo: logoBase64, shot1: shot1Base64 };
                let existing = JSON.parse(localStorage.getItem('corevix_software_profiles') || '[]');
                if (isEditing) {
                    existing = existing.map(p => String(p.id) === String(editingId) ? { ...p, ...savedProject } : p);
                } else {
                    existing.unshift(savedProject);
                }
                try {
                    localStorage.setItem('corevix_software_profiles', JSON.stringify(existing));
                } catch (e) {}

                showStatus(isEditing ? '✓ Software profile and photo updated live! Redirecting...' : '✓ Project published live with your uploaded image! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'case-studies.html';
                }, 800);
            } catch (err) {
                console.error('Project save error:', err);
                showStatus('⚠️ Error: ' + (err.message || 'Please check your connection and try again.'), true);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }

    // Admin Blog Upload Form Submission
    const blogUploadForm = document.getElementById('admin-blog-form');
    if (blogUploadForm) {
        blogUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('btn-submit-blog') || blogUploadForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerText : 'Publish';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = '⏳ Publishing Blog Article...';
            }

            const statusBox = document.getElementById('blog-upload-status');
            const showStatus = (msg, isError = false) => {
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
                    statusBox.style.color = isError ? '#EF4444' : 'var(--emerald-green)';
                    statusBox.style.border = isError ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-emerald)';
                    statusBox.innerHTML = msg;
                }
            };

            const title = document.getElementById('b-title').value.trim();
            const category = document.getElementById('b-category').value;
            const content = document.getElementById('b-content').value.trim();

            const imageFileInput = document.getElementById('b-image-file');
            const imageUrlInput = document.getElementById('b-image-url');

            let imageBase64 = (imageUrlInput && imageUrlInput.value.trim()) || '';
            if (!imageBase64 && imageFileInput && imageFileInput.files[0]) {
                imageBase64 = imageFileInput.dataset.compressedData || await compressImageFile(imageFileInput.files[0], 1000, 0.8);
            }

            if (!imageBase64) {
                showStatus('⚠️ Please select or upload a featured cover image for the blog!', true);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
                return;
            }

            showStatus('⏳ Publishing blog article...');

            const payload = {
                title,
                category,
                content,
                imageBase64
            };

            try {
                const res = await fetch(`${API_BASE}/admin/blogs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Server error uploading blog');
                }

                const savedBlog = data.blog || { id: Date.now(), ...payload, image: imageBase64 };
                const existing = JSON.parse(localStorage.getItem('corevix_blogs') || '[]');
                existing.unshift(savedBlog);
                try {
                    localStorage.setItem('corevix_blogs', JSON.stringify(existing));
                } catch (e) {}

                showStatus('✓ Blog article published live! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'blog.html';
                }, 800);
            } catch (err) {
                console.error('Blog upload error:', err);
                showStatus('⚠️ Upload error: ' + (err.message || 'Please check your connection and try again.'), true);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                }
            }
        });
    }

    // Admin Manage Published Projects List & Delete Feature
    const renderAdminProjectsList = async () => {
        const listContainer = document.getElementById('admin-projects-list-container');
        if (!listContainer) return;

        let projects = [];
        try {
            const res = await fetch(`${API_BASE}/projects`);
            if (res.ok) {
                projects = await res.json();
            }
        } catch (e) {}

        const localProfiles = JSON.parse(localStorage.getItem('corevix_software_profiles') || '[]');
        if (projects.length === 0 && localProfiles.length > 0) {
            projects = localProfiles;
        } else if (localProfiles.length > 0) {
            const ids = new Set(projects.map(p => String(p.id)));
            const unmerged = localProfiles.filter(p => !ids.has(String(p.id)));
            if (unmerged.length > 0) projects = [...unmerged, ...projects];
        }

        if (projects.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: var(--text-slate); padding: 20px;">No published software profiles yet. Use the uploader above to add one.</div>';
            return;
        }

        const defaultLogo = 'assets/corevix-logo-icon.png';
        const defaultShot = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22450%22%20viewBox%3D%220%200%20800%20450%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d1324%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23050811%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%2310B981%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ECorevix%20Enterprise%20Software%3C%2Ftext%3E%3C%2Fsvg%3E';

        listContainer.innerHTML = projects.map(p => {
            const shot = p.shot1 || p.logo || defaultShot;
            const logo = p.logo || p.shot1 || defaultLogo;
            return `
                <div class="glass-card" style="padding: 16px; border-color: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <img src="${shot}" alt="${p.name}" onerror="this.onerror=null;this.src='${defaultShot}';" style="width: 70px; height: 50px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-emerald);">
                        <div>
                            <div style="font-size: 14.5px; font-weight: 800; color: #FFF;">${p.name}</div>
                            <div style="font-size: 11px; color: var(--emerald-green); font-weight: 700; text-transform: uppercase;">${p.industry || 'Software'} &bull; ${p.date || 'Published'}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <a href="case-study-detail.html?id=${encodeURIComponent(p.id)}" target="_blank" class="btn-pill btn-glass" style="padding: 6px 14px; font-size: 11px;">View Live &rarr;</a>
                        <button class="btn-pill btn-edit-project" data-id="${p.id}" style="padding: 6px 14px; font-size: 11px; background: rgba(16,185,129,0.15); color: var(--emerald-green); border: 1px solid var(--border-emerald); cursor: pointer;">✏️ Edit / Photo</button>
                        <button class="btn-pill btn-delete-project" data-id="${p.id}" style="padding: 6px 14px; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer;">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');

        listContainer.querySelectorAll('.btn-edit-project').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const project = projects.find(item => String(item.id) === String(id));
                if (!project) return;

                const formSection = document.getElementById('section-project-upload');
                if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });

                const nameInput = document.getElementById('p-name');
                if (nameInput) nameInput.value = project.name || '';
                const taglineInput = document.getElementById('p-tagline');
                if (taglineInput) taglineInput.value = project.tagline || '';

                const indSelect = document.getElementById('p-industry');
                const customBox = document.getElementById('p-custom-industry-box');
                const customInput = document.getElementById('p-custom-industry');
                const standardIndustries = ['Finance & Banking', 'Healthcare & Telehealth', 'E-Commerce & Retail', 'Logistics & Supply Chain', 'EdTech & Learning', 'Cybersecurity & Defense', 'AI & Machine Learning', 'Enterprise SaaS', 'Website Development'];
                if (indSelect) {
                    if (standardIndustries.includes(project.industry)) {
                        indSelect.value = project.industry;
                        if (customBox) customBox.style.display = 'none';
                    } else {
                        indSelect.value = 'Other';
                        if (customBox) customBox.style.display = 'block';
                        if (customInput) customInput.value = project.industry || '';
                    }
                }

                const descInput = document.getElementById('p-desc');
                if (descInput) descInput.value = project.desc || '';
                const techInput = document.getElementById('p-tech');
                if (techInput) techInput.value = typeof project.tech === 'string' ? project.tech : (project.tech || []).join(', ');
                const metricInput = document.getElementById('p-metric');
                if (metricInput) metricInput.value = project.metric || '';
                const urlInput = document.getElementById('p-url');
                if (urlInput) urlInput.value = project.url || '';

                const shotPreview = document.getElementById('p-shot1-preview');
                if (shotPreview && (project.shot1 || project.logo)) {
                    shotPreview.style.display = 'block';
                    const img = shotPreview.querySelector('img');
                    if (img) img.src = project.shot1 || project.logo;
                    const readyLabel = shotPreview.querySelector('span');
                    if (readyLabel) readyLabel.innerHTML = '✓ Current image loaded (Select a new file below to replace it)';
                }

                projectUploadForm.dataset.editingId = project.id;
                projectUploadForm.dataset.existingShot = project.shot1 || '';
                projectUploadForm.dataset.existingLogo = project.logo || '';

                const submitBtn = document.getElementById('btn-submit-project');
                if (submitBtn) {
                    submitBtn.innerHTML = `💾 Update Software Profile & Photo (#${project.id}) &rarr;`;
                }

                const statusBox = document.getElementById('project-upload-status');
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = 'rgba(56,189,248,0.15)';
                    statusBox.style.color = '#38BDF8';
                    statusBox.style.border = '1px solid rgba(56,189,248,0.3)';
                    statusBox.innerHTML = `✏️ <strong>Editing "${project.name}"</strong>: Select a new image below to update its photo, then click Update. <button type="button" id="btn-cancel-edit" style="margin-left: 10px; background: rgba(255,255,255,0.1); border: 1px solid #38BDF8; color: #38BDF8; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">Cancel</button>`;

                    document.getElementById('btn-cancel-edit')?.addEventListener('click', () => {
                        delete projectUploadForm.dataset.editingId;
                        delete projectUploadForm.dataset.existingShot;
                        delete projectUploadForm.dataset.existingLogo;
                        projectUploadForm.reset();
                        if (shotPreview) shotPreview.style.display = 'none';
                        if (submitBtn) submitBtn.innerHTML = 'Publish Software Profile Live &rarr;';
                        statusBox.style.display = 'none';
                    });
                }
            });
        });

        listContainer.querySelectorAll('.btn-delete-project').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (!confirm('Are you sure you want to delete this software profile?')) return;
                btn.disabled = true;
                btn.innerText = 'Deleting...';

                try {
                    await fetch(`${API_BASE}/admin/projects/${id}`, { method: 'DELETE' });
                } catch (e) {}

                // Remove from localStorage
                let local = JSON.parse(localStorage.getItem('corevix_software_profiles') || '[]');
                local = local.filter(item => String(item.id) !== String(id));
                localStorage.setItem('corevix_software_profiles', JSON.stringify(local));

                renderAdminProjectsList();
            });
        });
    };

    renderAdminProjectsList();
    const refreshAdminBtn = document.getElementById('btn-refresh-admin-list');
    if (refreshAdminBtn) {
        refreshAdminBtn.addEventListener('click', renderAdminProjectsList);
    }

    // 11. Contact Form Submission
    const contactForm = document.getElementById('corevix-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            btn.innerText = '⏳ Submitting Inquiry...';

            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const phoneInput = contactForm.querySelector('input[type="tel"]');
            const serviceSelect = contactForm.querySelector('select');
            const messageTextarea = contactForm.querySelector('textarea');

            const payload = {
                name: nameInput ? nameInput.value : '',
                email: emailInput ? emailInput.value : '',
                phone: phoneInput ? phoneInput.value : '',
                service: serviceSelect ? serviceSelect.value : '',
                message: messageTextarea ? messageTextarea.value : ''
            };

            try {
                const res = await fetch(`${API_BASE}/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();
                btn.innerText = '✅ Inquiry Sent! Our Architects Will Reach Out.';
                btn.style.background = '#10B981';
                btn.style.color = '#050811';

                setTimeout(() => {
                    alert(data.message || 'Thank you for contacting Corevix Technology. Our team will review your inquiry and get back to you within 2 hours.');
                    contactForm.reset();
                    btn.innerText = 'Schedule Consultation →';
                }, 1000);
            } catch (err) {
                btn.innerText = '✅ Inquiry Sent!';
                setTimeout(() => {
                    alert('Thank you for contacting Corevix Technology. Our team will review your inquiry within 2 hours.');
                    contactForm.reset();
                    btn.innerText = 'Schedule Consultation →';
                }, 1000);
            }
        });
    }
});


