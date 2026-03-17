// ===== ctOS MOBILE INTERFACE =====
// Watch Dogs Hacking Simulation

(function() {
    'use strict';

    // ===== STATE =====
    const state = {
        currentScreen: 'boot',
        hacks: 0,
        profiles: 0,
        cameras: 0,
        startTime: Date.now(),
        currentCam: 0,
        audioFreq: 142.7,
        intercepting: false,
        cameraStream: null,
    };

    // ===== DATA =====
    const NAMES = [
        'Carlos Mendoza', 'Ana García', 'Miguel Torres', 'Lucía Fernández',
        'Alejandro Ruiz', 'María López', 'Javier Sánchez', 'Elena Martín',
        'Pablo Rodríguez', 'Sofia Morales', 'Diego Hernández', 'Valentina Cruz',
        'Andrés Ramírez', 'Camila Flores', 'Fernando Díaz', 'Laura Vega',
        'Roberto Silva', 'Clara Ortiz', 'Eduardo Romero', 'Patricia Castro',
        'Daniel Reyes', 'Isabella Navarro', 'Luis Jiménez', 'Natalia Rojas',
        'Oscar Molina', 'Adriana Peña', 'Ricardo Guerrero', 'Gabriela Santos',
    ];

    const JOBS = [
        'Ingeniero de Software', 'Contable', 'Profesor', 'Médico',
        'Abogado', 'Diseñador Gráfico', 'Chef', 'Periodista',
        'Arquitecto', 'Enfermero/a', 'Electricista', 'Vendedor',
        'Investigador', 'Piloto', 'Traductor', 'Farmacéutico',
        'Consultor', 'Programador', 'Artista', 'Mecánico',
        'Policía retirado', 'Administrador de red', 'Freelancer',
        'Emprendedor', 'Analista de datos', 'Ciberseguridad',
    ];

    const SECRETS = [
        'Descarga software ilegal habitualmente',
        'Tiene un segundo teléfono oculto',
        'Evade impuestos desde 2019',
        'Historial de búsqueda comprometedor',
        'Cuenta offshore en Islas Caimán',
        'Relación extramarital activa',
        'Ganó la lotería y lo oculta',
        'Adicción a las apuestas online',
        'Compra documentos falsificados',
        'Trabaja como informante',
        'Tráfico de influencias',
        'Accede a redes WiFi ajenas',
        'Hackea cuentas de redes sociales',
        'Almacena datos robados en la nube',
        'Identidad falsa registrada',
        'Miembro de foro clandestino',
        'Soborna funcionarios públicos',
        'Acceso no autorizado a sistemas ctOS',
        'Vende información personal de terceros',
        'Mantiene criptomonedas no declaradas',
    ];

    const THREAT_LEVELS = [
        { level: 'BAJO', class: 'low', weight: 50 },
        { level: 'MEDIO', class: 'medium', weight: 35 },
        { level: 'ALTO', class: 'high', weight: 15 },
    ];

    const BOOT_MESSAGES = [
        '> Inicializando kernel ctOS v4.7.2...',
        '> Cargando módulos de red...',
        '> Conectando a nodo central...',
        '> Verificando credenciales: ADMINISTRADOR',
        '> Descargando base de datos ciudadanos...',
        '> Activando protocolos de vigilancia...',
        '> Enlazando cámaras del distrito...',
        '> Cargando interfaz de hackeo...',
        '> Estableciendo conexión cifrada...',
        '> Calibrando antenas de interceptación...',
        '> Sistemas de perfilado: ONLINE',
        '> Control de infraestructura: ACTIVO',
        '> ADVERTENCIA: Acceso no autorizado detectado',
        '> Ocultando rastro digital...',
        '> Sistema ctOS completamente operativo.',
    ];

    const CAM_DATA = [
        { id: 'CAM-001', location: 'DISTRITO CENTRAL - CALLE 5', status: 'online' },
        { id: 'CAM-042', location: 'ZONA INDUSTRIAL - NAVE 12', status: 'online' },
        { id: 'CAM-107', location: 'PLAZA MAYOR - FUENTE NORTE', status: 'online' },
        { id: 'CAM-203', location: 'PUERTO - ALMACÉN 3B', status: 'offline' },
    ];

    const MAP_TARGETS = [
        { x: 0.2, y: 0.3, type: 'node', name: 'NODO ctOS #1', desc: 'Centro de datos principal' },
        { x: 0.6, y: 0.2, type: 'camera', name: 'CLUSTER CÁMARAS A', desc: '12 cámaras activas' },
        { x: 0.8, y: 0.6, type: 'alert', name: 'ZONA RESTRINGIDA', desc: 'Seguridad nivel 4' },
        { x: 0.4, y: 0.7, type: 'target', name: 'OBJETIVO PRINCIPAL', desc: 'Servidor central ctOS' },
        { x: 0.15, y: 0.65, type: 'node', name: 'NODO ctOS #2', desc: 'Subestación eléctrica' },
        { x: 0.7, y: 0.4, type: 'camera', name: 'CLUSTER CÁMARAS B', desc: '8 cámaras activas' },
        { x: 0.5, y: 0.5, type: 'target', name: 'ROUTER PRINCIPAL', desc: 'Backbone de red' },
        { x: 0.35, y: 0.15, type: 'alert', name: 'COMISARÍA', desc: 'Comunicaciones policiales' },
    ];

    const CONVERSATIONS = [
        [
            { speaker: 'SUJETO A', text: '¿Tienes la mercancía lista?' },
            { speaker: 'SUJETO B', text: 'Sí, el envío llega esta noche al muelle 4.' },
            { speaker: 'SUJETO A', text: 'Bien. Asegúrate de que nadie nos vea.' },
            { speaker: 'SUJETO B', text: 'Tengo gente vigilando. No habrá problemas.' },
        ],
        [
            { speaker: 'OPERADOR', text: 'Las cámaras del sector 7 están fuera de línea.' },
            { speaker: 'CENTRAL', text: 'Enviando equipo de mantenimiento.' },
            { speaker: 'OPERADOR', text: 'No, espera. Creo que alguien las ha hackeado.' },
            { speaker: 'CENTRAL', text: 'Activar protocolo de seguridad alfa.' },
        ],
        [
            { speaker: 'ANÓNIMO', text: 'El pago se ha realizado. 50.000 en cripto.' },
            { speaker: 'CONTACTO', text: 'Confirmado. Los documentos están en la ubicación acordada.' },
            { speaker: 'ANÓNIMO', text: 'Necesito que desaparezca todo rastro.' },
            { speaker: 'CONTACTO', text: 'Entendido. Limpieza completa en 24 horas.' },
        ],
        [
            { speaker: 'AGENTE 1', text: 'El sospechoso se mueve hacia el norte.' },
            { speaker: 'AGENTE 2', text: 'Lo tengo en visual. Confirmo dirección norte.' },
            { speaker: 'AGENTE 1', text: 'Mantener distancia. No queremos alertarlo.' },
            { speaker: 'AGENTE 2', text: 'Recibido. Siguiendo a 200 metros.' },
        ],
        [
            { speaker: 'HACKER', text: 'He conseguido acceso a la base de datos.' },
            { speaker: 'CLIENTE', text: '¿Toda la información está ahí?' },
            { speaker: 'HACKER', text: 'Nombres, direcciones, cuentas bancarias. Todo.' },
            { speaker: 'CLIENTE', text: 'Excelente. Transfiere todo al servidor seguro.' },
        ],
    ];

    const HACK_TERMINAL_LINES = {
        traffic: [
            { text: '> Accediendo a sistema de control de tráfico...', type: 'info' },
            { text: '> Localizando semáforos del distrito...', type: '' },
            { text: '> 47 semáforos encontrados en el perímetro', type: 'info' },
            { text: '> Inyectando código de override...', type: '' },
            { text: '> Bypasseando protocolo de seguridad...', type: 'warning' },
            { text: '> ADVERTENCIA: Detección de intrusión activa', type: 'warning' },
            { text: '> Ocultando firma digital...', type: '' },
            { text: '> Override aplicado con éxito', type: 'success' },
            { text: '> Todos los semáforos bajo control ctOS', type: 'success' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
        barriers: [
            { text: '> Conectando a sistema de barreras viales...', type: 'info' },
            { text: '> Enumerando barreras activas...', type: '' },
            { text: '> 23 barreras detectadas', type: 'info' },
            { text: '> Enviando señal de activación...', type: '' },
            { text: '> Desactivando seguros mecánicos...', type: 'warning' },
            { text: '> Confirmación de motor recibida', type: '' },
            { text: '> Barreras respondiendo a comandos', type: 'success' },
            { text: '> Control total de barreras establecido', type: 'success' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
        blackout: [
            { text: '> ACCEDIENDO A RED ELÉCTRICA...', type: 'error' },
            { text: '> Conectando a subestación principal...', type: 'info' },
            { text: '> ADVERTENCIA: Operación de alto riesgo', type: 'error' },
            { text: '> Sobrecargando transformadores...', type: 'warning' },
            { text: '> Capacitor 1... SOBRECARGADO', type: 'warning' },
            { text: '> Capacitor 2... SOBRECARGADO', type: 'warning' },
            { text: '> Capacitor 3... SOBRECARGADO', type: 'warning' },
            { text: '> ¡¡¡ APAGÓN INICIADO !!!', type: 'error' },
            { text: '> Toda la zona sin electricidad', type: 'error' },
            { text: '> Estimación de restauración: 30 segundos', type: 'info' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
        pipes: [
            { text: '> Accediendo a sistema de presión hidráulica...', type: 'info' },
            { text: '> Mapeando red de tuberías...', type: '' },
            { text: '> 156 nodos de presión identificados', type: 'info' },
            { text: '> Aumentando presión en nodo crítico...', type: 'warning' },
            { text: '> Presión: 150%... 200%... 280%...', type: 'warning' },
            { text: '> ADVERTENCIA: Presión excesiva', type: 'error' },
            { text: '> ¡Tubería principal reventada!', type: 'error' },
            { text: '> Agua fluyendo en la superficie', type: 'success' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
        comms: [
            { text: '> Escaneando frecuencias de radio...', type: 'info' },
            { text: '> Banda: 140MHz - 160MHz', type: '' },
            { text: '> Señales activas detectadas: 14', type: 'info' },
            { text: '> Generando ruido blanco en frecuencias...', type: '' },
            { text: '> Amplificando interferencia...', type: 'warning' },
            { text: '> Potencia de señal: 0 / Interferencia: MAX', type: 'warning' },
            { text: '> Todas las comunicaciones bloqueadas', type: 'success' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
        doors: [
            { text: '> Buscando cerraduras electrónicas...', type: 'info' },
            { text: '> 8 cerraduras en rango Bluetooth', type: 'info' },
            { text: '> Atacando protocolo de autenticación...', type: '' },
            { text: '> Probando claves: 0x4F2A... 0x9B71... 0xE3D5...', type: '' },
            { text: '> Clave maestra encontrada: 0xA7C3F1', type: 'warning' },
            { text: '> Enviando señal de desbloqueo...', type: '' },
            { text: '> ¡Cerraduras desbloqueadas!', type: 'success' },
            { text: '> [HACK COMPLETADO]', type: 'success' },
        ],
    };

    // ===== UTILITY =====
    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function pick(arr) {
        return arr[rand(0, arr.length - 1)];
    }

    function $(sel) {
        return document.querySelector(sel);
    }

    function $$(sel) {
        return document.querySelectorAll(sel);
    }

    function vibrate(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // ===== SCREENS =====
    function showScreen(name) {
        const screens = $$('.screen');
        screens.forEach(s => s.classList.remove('active'));
        const target = $(`#screen-${name}`);
        if (target) {
            target.classList.add('active');
            state.currentScreen = name;
            vibrate(30);
        }
    }

    // ===== BOOT SEQUENCE =====
    function startBoot() {
        const log = $('#boot-log');
        const fill = $('#boot-progress-fill');
        const percent = $('#boot-percent');
        let lineIndex = 0;
        let progress = 0;

        const bootInterval = setInterval(() => {
            if (lineIndex < BOOT_MESSAGES.length) {
                const div = document.createElement('div');
                div.textContent = BOOT_MESSAGES[lineIndex];
                if (BOOT_MESSAGES[lineIndex].includes('ADVERTENCIA')) {
                    div.style.color = '#ffcc00';
                }
                if (BOOT_MESSAGES[lineIndex].includes('operativo')) {
                    div.style.color = '#00f0ff';
                }
                log.appendChild(div);
                log.scrollTop = log.scrollHeight;
                lineIndex++;
            }

            progress += rand(3, 8);
            if (progress > 100) progress = 100;
            fill.style.width = progress + '%';
            percent.textContent = progress + '%';

            if (progress >= 100 && lineIndex >= BOOT_MESSAGES.length) {
                clearInterval(bootInterval);
                setTimeout(() => {
                    vibrate([50, 50, 50]);
                    showScreen('hub');
                }, 600);
            }
        }, 200);
    }

    // ===== TIME =====
    function updateTime() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        const timeEl = $('#status-time');
        if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;

        // Cam timestamp
        const ts = $('#cam-timestamp');
        if (ts) ts.textContent = `${h}:${m}:${s}`;

        // Uptime
        const upEl = $('#sys-uptime');
        if (upEl) {
            const diff = Math.floor((Date.now() - state.startTime) / 1000);
            const uh = String(Math.floor(diff / 3600)).padStart(2, '0');
            const um = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
            const us = String(diff % 60).padStart(2, '0');
            upEl.textContent = `${uh}:${um}:${us}`;
        }
    }

    // ===== NAVIGATION =====
    function setupNavigation() {
        $$('.hub-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                showScreen(screen);
                if (screen === 'profiler') initProfiler();
                if (screen === 'surveillance') initSurveillance();
                if (screen === 'map') initMap();
                if (screen === 'audio') initAudio();
            });
        });

        $$('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                showScreen(screen);
                stopCamera();
                if (state.audioAnimFrame) {
                    cancelAnimationFrame(state.audioAnimFrame);
                }
            });
        });
    }

    // ===== PROFILER =====
    async function initProfiler() {
        try {
            if (!state.cameraStream) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                state.cameraStream = stream;
                const video = $('#camera-video');
                video.srcObject = stream;
            }
        } catch (e) {
            // Camera not available, show fallback
            const feed = $('#camera-feed');
            feed.style.background = 'linear-gradient(135deg, #0a0f1a, #0f1520)';
            const video = $('#camera-video');
            video.style.display = 'none';
            drawFallbackCamera();
        }
    }

    function drawFallbackCamera() {
        const canvas = $('#camera-canvas');
        if (!canvas) return;
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;

        function draw() {
            ctx.fillStyle = 'rgba(10, 15, 25, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw noise
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const brightness = Math.random() * 40;
                ctx.fillStyle = `rgba(0, ${brightness + 180}, ${brightness + 200}, 0.1)`;
                ctx.fillRect(x, y, 2, 2);
            }

            // Draw grid
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvas.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Center text
            ctx.font = '24px "Share Tech Mono"';
            ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
            ctx.textAlign = 'center';
            ctx.fillText('CÁMARA NO DISPONIBLE', canvas.width / 2, canvas.height / 2);
            ctx.font = '14px "Share Tech Mono"';
            ctx.fillText('Toca ESCANEAR para simular', canvas.width / 2, canvas.height / 2 + 30);

            if (state.currentScreen === 'profiler') {
                requestAnimationFrame(draw);
            }
        }
        draw();
    }

    function stopCamera() {
        if (state.cameraStream) {
            state.cameraStream.getTracks().forEach(t => t.stop());
            state.cameraStream = null;
        }
    }

    function scanProfile() {
        const scanLine = $('#scan-line');
        const card = $('#profile-card');

        scanLine.classList.add('scanning');
        card.classList.remove('visible');
        card.classList.add('hidden');
        vibrate([30, 50, 30]);

        setTimeout(() => {
            scanLine.classList.remove('scanning');
            generateProfile();
            card.classList.remove('hidden');
            card.classList.add('visible');
            vibrate([50, 30, 80]);

            state.profiles++;
            updateStats();
            showNotification('PERFIL ESCANEADO', 'Datos del ciudadano obtenidos con éxito');
        }, 2000);
    }

    function generateProfile() {
        const name = pick(NAMES);
        const age = rand(18, 72);
        const job = pick(JOBS);
        const income = (rand(12, 95) * 1000).toLocaleString('es-ES');
        const secret = pick(SECRETS);
        const bank = `ES${rand(10,99)} ${rand(1000,9999)} ${rand(1000,9999)} ${rand(10,99)} ${rand(1000000000,9999999999)}`;
        const phone = `+34 ${rand(600,699)} ${rand(100,999)} ${rand(100,999)}`;
        const id = `CTZ-${rand(100000, 999999)}`;

        // Threat level
        const r = rand(1, 100);
        let threat;
        if (r <= 50) threat = THREAT_LEVELS[0];
        else if (r <= 85) threat = THREAT_LEVELS[1];
        else threat = THREAT_LEVELS[2];

        $('#profile-name').textContent = name;
        $('#profile-age').textContent = age + ' años';
        $('#profile-job').textContent = job;
        $('#profile-income').textContent = income + ' €/año';
        $('#profile-secret').textContent = secret;
        $('#profile-bank').textContent = bank;
        $('#profile-phone').textContent = phone;
        $('#profile-id').textContent = 'ID: ' + id;

        const threatEl = $('#profile-threat');
        threatEl.textContent = 'AMENAZA: ' + threat.level;
        threatEl.className = 'profile-threat ' + threat.class;
    }

    // ===== HACKING =====
    function setupHacking() {
        $$('.hack-card').forEach(card => {
            card.addEventListener('click', () => {
                const hack = card.dataset.hack;
                if (card.classList.contains('hacking') || card.classList.contains('hacked')) return;
                startHack(hack, card);
            });
        });

        $('#terminal-close').addEventListener('click', () => {
            closeTerminal();
        });
    }

    function startHack(hackType, card) {
        const terminal = $('#hack-terminal');
        const body = $('#terminal-body');
        body.innerHTML = '';

        terminal.classList.remove('hidden');
        terminal.classList.add('visible');
        card.classList.add('hacking');
        card.querySelector('.hack-status').textContent = 'HACKEANDO...';
        card.querySelector('.hack-status').classList.add('active');

        vibrate([30, 50, 30, 50, 30]);

        const lines = HACK_TERMINAL_LINES[hackType] || HACK_TERMINAL_LINES.traffic;
        const fill = card.querySelector('.hack-fill');
        let i = 0;

        const interval = setInterval(() => {
            if (i < lines.length) {
                const div = document.createElement('div');
                div.className = `line ${lines[i].type}`;
                div.textContent = lines[i].text;
                div.style.animationDelay = '0s';
                body.appendChild(div);
                body.scrollTop = body.scrollHeight;

                fill.style.width = ((i + 1) / lines.length * 100) + '%';
                i++;
                vibrate(15);
            } else {
                clearInterval(interval);
                card.classList.remove('hacking');
                card.classList.add('hacked');
                card.querySelector('.hack-status').textContent = 'HACKEADO';
                card.querySelector('.hack-status').classList.remove('active');
                card.querySelector('.hack-status').classList.add('complete');

                state.hacks++;
                updateStats();

                if (hackType === 'blackout') {
                    triggerBlackout();
                }

                vibrate([100, 50, 100]);
                showNotification('HACK EXITOSO', `${hackType.toUpperCase()} hackeado con éxito`);
            }
        }, 400);
    }

    function closeTerminal() {
        const terminal = $('#hack-terminal');
        terminal.classList.add('hidden');
        terminal.classList.remove('visible');
    }

    function triggerBlackout() {
        const overlay = document.createElement('div');
        overlay.className = 'blackout-overlay';
        document.body.appendChild(overlay);
        vibrate([200, 100, 200, 100, 500]);
        setTimeout(() => overlay.remove(), 3200);
    }

    // ===== SURVEILLANCE =====
    function initSurveillance() {
        drawSurveillanceFeed();
        updateCamInfo();
    }

    function drawSurveillanceFeed() {
        const canvas = $('#surveillance-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;

        const cam = CAM_DATA[state.currentCam];
        const isOffline = cam.status === 'offline';

        function draw() {
            // Dark background
            ctx.fillStyle = '#0a0f0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isOffline) {
                // Static noise for offline
                for (let i = 0; i < 5000; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const gray = Math.random() * 100;
                    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.5)`;
                    ctx.fillRect(x, y, 2, 2);
                }
                ctx.font = 'bold 28px "Share Tech Mono"';
                ctx.fillStyle = '#ff2d55';
                ctx.textAlign = 'center';
                ctx.fillText('SEÑAL PERDIDA', canvas.width / 2, canvas.height / 2);
            } else {
                // Green-tinted surveillance look
                for (let i = 0; i < 800; i++) {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const g = rand(20, 60);
                    ctx.fillStyle = `rgba(0, ${g}, ${Math.floor(g * 0.3)}, 0.15)`;
                    ctx.fillRect(x, y, rand(2, 6), rand(2, 4));
                }

                // Simulate some shapes (buildings/objects)
                ctx.strokeStyle = 'rgba(0, 200, 50, 0.15)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 6; i++) {
                    const bx = rand(50, canvas.width - 200);
                    const by = rand(100, canvas.height - 150);
                    const bw = rand(60, 200);
                    const bh = rand(40, 120);
                    ctx.strokeRect(bx, by, bw, bh);
                }

                // Moving person simulation
                const time = Date.now() * 0.001;
                const px = (Math.sin(time * 0.5) * 0.3 + 0.5) * canvas.width;
                const py = (Math.cos(time * 0.3) * 0.2 + 0.6) * canvas.height;
                ctx.fillStyle = 'rgba(0, 255, 100, 0.4)';
                ctx.beginPath();
                ctx.arc(px, py, 8, 0, Math.PI * 2);
                ctx.fill();

                // Target box around person
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
                ctx.lineWidth = 1;
                ctx.strokeRect(px - 20, py - 30, 40, 60);
                ctx.font = '10px "Share Tech Mono"';
                ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
                ctx.fillText('OBJETIVO', px - 20, py - 35);

                // Grain overlay
                for (let y = 0; y < canvas.height; y += 4) {
                    if (Math.random() > 0.97) {
                        ctx.fillStyle = `rgba(0, 255, 100, ${Math.random() * 0.05})`;
                        ctx.fillRect(0, y, canvas.width, 2);
                    }
                }
            }

            if (state.currentScreen === 'surveillance') {
                requestAnimationFrame(draw);
            }
        }
        draw();
    }

    function updateCamInfo() {
        const cam = CAM_DATA[state.currentCam];
        $('#cam-id').textContent = cam.id;
        $('#cam-location').textContent = cam.location;

        $$('.cam-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === state.currentCam);
        });
    }

    function setupSurveillance() {
        $('#cam-prev').addEventListener('click', () => {
            state.currentCam = (state.currentCam - 1 + CAM_DATA.length) % CAM_DATA.length;
            state.cameras++;
            updateCamInfo();
            drawSurveillanceFeed();
            updateStats();
            vibrate(20);
        });

        $('#cam-next').addEventListener('click', () => {
            state.currentCam = (state.currentCam + 1) % CAM_DATA.length;
            state.cameras++;
            updateCamInfo();
            drawSurveillanceFeed();
            updateStats();
            vibrate(20);
        });

        $('#cam-capture').addEventListener('click', () => {
            vibrate([50, 30, 50]);
            showNotification('CAPTURA GUARDADA', `Imagen de ${CAM_DATA[state.currentCam].id} almacenada`);
        });

        $$('.cam-thumb').forEach((t, i) => {
            t.addEventListener('click', () => {
                state.currentCam = i;
                state.cameras++;
                updateCamInfo();
                drawSurveillanceFeed();
                updateStats();
                vibrate(20);
            });
        });
    }

    // ===== MAP =====
    function initMap() {
        drawMap();
    }

    function drawMap() {
        const canvas = $('#map-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        const w = canvas.width;
        const h = canvas.height;

        let animFrame;
        let selectedTarget = null;

        function draw() {
            const time = Date.now() * 0.001;

            // Background
            ctx.fillStyle = '#060810';
            ctx.fillRect(0, 0, w, h);

            // Grid
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = 0; x < w; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }

            // Roads (random lines)
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
            ctx.lineWidth = 3;
            // Horizontal roads
            [0.25, 0.45, 0.65, 0.85].forEach(yp => {
                ctx.beginPath();
                ctx.moveTo(0, h * yp);
                ctx.lineTo(w, h * yp);
                ctx.stroke();
            });
            // Vertical roads
            [0.15, 0.35, 0.55, 0.75, 0.9].forEach(xp => {
                ctx.beginPath();
                ctx.moveTo(w * xp, 0);
                ctx.lineTo(w * xp, h);
                ctx.stroke();
            });

            // Blocks (buildings)
            ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
            ctx.lineWidth = 1;
            const blocks = [
                [0.02, 0.02, 0.12, 0.2], [0.17, 0.02, 0.16, 0.2],
                [0.37, 0.02, 0.16, 0.2], [0.57, 0.02, 0.16, 0.2],
                [0.02, 0.28, 0.12, 0.15], [0.17, 0.28, 0.16, 0.15],
                [0.37, 0.28, 0.16, 0.15], [0.57, 0.28, 0.16, 0.15],
                [0.77, 0.02, 0.21, 0.35], [0.02, 0.48, 0.31, 0.15],
                [0.37, 0.48, 0.16, 0.15], [0.57, 0.48, 0.31, 0.15],
                [0.02, 0.68, 0.31, 0.15], [0.37, 0.68, 0.36, 0.15],
                [0.77, 0.48, 0.21, 0.35],
                [0.02, 0.88, 0.31, 0.1], [0.37, 0.88, 0.36, 0.1],
                [0.77, 0.88, 0.21, 0.1],
            ];
            blocks.forEach(b => {
                ctx.fillRect(w * b[0], h * b[1], w * b[2], h * b[3]);
                ctx.strokeRect(w * b[0], h * b[1], w * b[2], h * b[3]);
            });

            // Data flow lines (animated)
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 8]);
            ctx.lineDashOffset = -time * 30;
            for (let i = 0; i < MAP_TARGETS.length - 1; i++) {
                const a = MAP_TARGETS[i];
                const b = MAP_TARGETS[i + 1];
                ctx.beginPath();
                ctx.moveTo(a.x * w, a.y * h);
                ctx.lineTo(b.x * w, b.y * h);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // Targets
            MAP_TARGETS.forEach((t, idx) => {
                const tx = t.x * w;
                const ty = t.y * h;
                let color;
                switch (t.type) {
                    case 'node': color = '#00ff41'; break;
                    case 'camera': color = '#00f0ff'; break;
                    case 'alert': color = '#ff2d55'; break;
                    case 'target': color = '#ffcc00'; break;
                    default: color = '#00f0ff';
                }

                // Outer pulse
                const pulseR = 12 + Math.sin(time * 2 + idx) * 4;
                ctx.beginPath();
                ctx.arc(tx, ty, pulseR, 0, Math.PI * 2);
                ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba').replace('#', '');
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                // Convert hex to rgba for fill
                const r = parseInt(color.slice(1,3),16);
                const g = parseInt(color.slice(3,5),16);
                const b2 = parseInt(color.slice(5,7),16);
                ctx.fillStyle = `rgba(${r},${g},${b2},0.15)`;
                ctx.fill();
                ctx.stroke();

                // Inner dot
                ctx.beginPath();
                ctx.arc(tx, ty, 4, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // Label
                ctx.font = '11px "Share Tech Mono"';
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.fillText(t.name, tx, ty - 18);
            });

            // Player position (radar ping)
            const playerX = w * 0.5;
            const playerY = h * 0.5;
            const pingR = (time * 40) % 80;
            ctx.beginPath();
            ctx.arc(playerX, playerY, pingR, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 1 - pingR / 80) * 0.4})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Player dot
            ctx.beginPath();
            ctx.arc(playerX, playerY, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(playerX, playerY, 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (state.currentScreen === 'map') {
                animFrame = requestAnimationFrame(draw);
            }
        }
        draw();

        // Touch/click on map
        canvas.addEventListener('click', (e) => {
            const rect2 = canvas.getBoundingClientRect();
            const cx = (e.clientX - rect2.left) / rect2.width;
            const cy = (e.clientY - rect2.top) / rect2.height;

            let closest = null;
            let minDist = 0.08;
            MAP_TARGETS.forEach(t => {
                const dist = Math.hypot(t.x - cx, t.y - cy);
                if (dist < minDist) {
                    minDist = dist;
                    closest = t;
                }
            });

            const info = $('#map-target-info');
            if (closest) {
                $('#map-target-name').textContent = closest.name;
                $('#map-target-desc').textContent = closest.desc;
                info.classList.remove('hidden');
                vibrate(20);
            } else {
                info.classList.add('hidden');
            }
        });

        // Map hack button
        $('#map-hack-btn').addEventListener('click', () => {
            state.hacks++;
            updateStats();
            vibrate([50, 30, 80]);
            showNotification('NODO HACKEADO', 'Acceso total al nodo conseguido');
            $('#map-target-info').classList.add('hidden');
        });
    }

    // ===== AUDIO =====
    function initAudio() {
        drawAudioWaves();
    }

    function drawAudioWaves() {
        const canvas = $('#audio-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        const w = canvas.width;
        const h = canvas.height;

        function draw() {
            ctx.fillStyle = 'rgba(15, 17, 24, 0.3)';
            ctx.fillRect(0, 0, w, h);

            const time = Date.now() * 0.002;

            // Center line
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            ctx.lineTo(w, h / 2);
            ctx.stroke();

            // Waveforms
            if (state.intercepting) {
                // Active waveform
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const y = h / 2 +
                        Math.sin((x * 0.02) + time) * 30 +
                        Math.sin((x * 0.05) + time * 1.5) * 15 +
                        Math.sin((x * 0.01) + time * 0.7) * 20 +
                        (Math.random() - 0.5) * 10;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Second wave (echo)
                ctx.strokeStyle = 'rgba(0, 255, 65, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const y = h / 2 +
                        Math.sin((x * 0.03) + time * 0.8) * 20 +
                        Math.sin((x * 0.07) + time * 1.2) * 10;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            } else {
                // Idle noise
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (let x = 0; x < w; x++) {
                    const y = h / 2 + (Math.random() - 0.5) * 8;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            if (state.currentScreen === 'audio') {
                state.audioAnimFrame = requestAnimationFrame(draw);
            }
        }
        draw();
    }

    function setupAudio() {
        $('#btn-intercept').addEventListener('click', () => {
            if (state.intercepting) return;
            state.intercepting = true;
            vibrate([30, 50, 30]);
            showNotification('INTERCEPTANDO', `Frecuencia ${state.audioFreq.toFixed(1)} MHz capturada`);

            const conversation = pick(CONVERSATIONS);
            const lines = $('#transcript-lines');
            lines.innerHTML = '';

            let i = 0;
            const interval = setInterval(() => {
                if (i < conversation.length) {
                    const line = conversation[i];
                    const div = document.createElement('div');
                    div.className = 't-line';
                    div.innerHTML = `<div class="t-speaker">${line.speaker}</div>${line.text}`;
                    lines.appendChild(div);
                    lines.scrollTop = lines.scrollHeight;
                    vibrate(15);
                    i++;
                } else {
                    clearInterval(interval);
                    state.intercepting = false;
                    showNotification('INTERCEPCIÓN COMPLETA', 'Conversación grabada con éxito');
                }
            }, 2500);
        });

        $('#btn-freq-up').addEventListener('click', () => {
            state.audioFreq = Math.min(200, state.audioFreq + 0.3);
            $('#audio-freq').textContent = state.audioFreq.toFixed(1) + ' MHz';
            vibrate(15);
        });

        $('#btn-freq-down').addEventListener('click', () => {
            state.audioFreq = Math.max(100, state.audioFreq - 0.3);
            $('#audio-freq').textContent = state.audioFreq.toFixed(1) + ' MHz';
            vibrate(15);
        });
    }

    // ===== SYSTEM =====
    function setupSystem() {
        $('#btn-reset').addEventListener('click', () => {
            vibrate([100, 50, 100, 50, 200]);
            showNotification('REINICIANDO SISTEMA', 'ctOS se reiniciará en 3 segundos...');
            setTimeout(() => {
                showScreen('boot');
                // Reset hacked cards
                $$('.hack-card').forEach(c => {
                    c.classList.remove('hacked', 'hacking');
                    c.querySelector('.hack-status').textContent = 'DISPONIBLE';
                    c.querySelector('.hack-status').className = 'hack-status';
                    c.querySelector('.hack-fill').style.width = '0%';
                });
                closeTerminal();
                setTimeout(startBoot, 500);
            }, 2000);
        });

        $('#btn-clear-data').addEventListener('click', () => {
            state.hacks = 0;
            state.profiles = 0;
            state.cameras = 0;
            updateStats();
            vibrate(50);
            showNotification('DATOS BORRADOS', 'Todos los registros han sido eliminados');
        });

        // Fluctuate system bars
        setInterval(() => {
            if (state.currentScreen === 'system') {
                const cpu = rand(20, 75);
                const ram = rand(40, 80);
                const net = rand(80, 99);
                $('#sys-cpu').style.width = cpu + '%';
                $('#sys-ram').style.width = ram + '%';
                $('#sys-network').style.width = net + '%';
            }
        }, 2000);
    }

    // ===== STATS =====
    function updateStats() {
        const hackEl = $('#stat-hacks');
        const profEl = $('#stat-profiles');
        const camEl = $('#stat-cameras');
        if (hackEl) hackEl.textContent = state.hacks;
        if (profEl) profEl.textContent = state.profiles;
        if (camEl) camEl.textContent = state.cameras;

        // System page too
        const sh = $('#sys-hacks-total');
        const sp = $('#sys-profiles-total');
        if (sh) sh.textContent = state.hacks;
        if (sp) sp.textContent = state.profiles;
    }

    // ===== NOTIFICATION =====
    function showNotification(title, text) {
        const notif = $('#notification');
        $('#notif-title').textContent = title;
        $('#notif-text').textContent = text;
        notif.classList.remove('hidden');
        notif.classList.add('visible');

        setTimeout(() => {
            notif.classList.remove('visible');
            setTimeout(() => notif.classList.add('hidden'), 300);
        }, 2500);
    }

    // ===== PROFILER ACTIONS =====
    function setupProfilerActions() {
        $('#btn-scan').addEventListener('click', scanProfile);

        $('#btn-hack-bank').addEventListener('click', () => {
            const amount = (rand(50, 5000)).toLocaleString('es-ES');
            vibrate([50, 30, 80]);
            showNotification('CUENTA HACKEADA', `${amount} € transferidos a tu cuenta`);
            state.hacks++;
            updateStats();
        });

        $('#btn-track').addEventListener('click', () => {
            vibrate([30, 50, 30, 50, 30]);
            showNotification('RASTREO ACTIVO', 'Ubicación del objetivo marcada en el mapa');
        });
    }

    // ===== INIT =====
    function init() {
        setupNavigation();
        setupHacking();
        setupSurveillance();
        setupAudio();
        setupSystem();
        setupProfilerActions();
        updateStats();

        // Time
        updateTime();
        setInterval(updateTime, 1000);

        // Start boot
        setTimeout(startBoot, 300);
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
