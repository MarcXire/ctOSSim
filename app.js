// ===== ctOS MOBILE INTERFACE =====
// Watch Dogs Hacking Simulation

(function() {
    'use strict';

    // ===== STATE =====
    const state = {
        currentScreen: 'boot',
        hacks: 0,
        profiles: 0,
        money: 0,
        cameras: 0,
        startTime: Date.now(),
        currentCam: 0,
        audioFreq: 142.7,
        intercepting: false,
        cameraStream: null,
        myLat: null,
        myLng: null,
        customMarkers: [], // Array of {lat, lng, type, title, id}
        trackedTargets: [], // Array of {lat, lng, id}
        activeCrimes: []    // Array of {lat, lng, id, reward}
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

    const MAP_TYPES = {
        node: { color: '#00ff41', name: 'NODO ctOS' },
        camera: { color: '#00f0ff', name: 'CÁMARA' },
        alert: { color: '#ff2d55', name: 'ALERTA' },
        target: { color: '#ffcc00', name: 'OBJETIVO' },
        crime: { color: '#ff0000', name: 'DELITO EN CURSO' },
        tracked: { color: '#ff9500', name: 'OBJETIVO RASTREADO' },
        custom: { color: '#00f0ff', name: 'WAYPOINT' }
    };

    let map = null;
    let mapMarkers = []; // Static markers
    let dynamicMarkers = {}; // Dynamic markers indexed by ID
    let playerMarker = null;
    let watchId = null;

    // ===== LOCAL STORAGE =====
    function saveState() {
        const data = {
            hacks: state.hacks,
            profiles: state.profiles,
            money: state.money,
            customMarkers: state.customMarkers,
            trackedTargets: state.trackedTargets,
            activeCrimes: state.activeCrimes
        };
        localStorage.setItem('ctos_save', JSON.stringify(data));
        updateStats();
    }

    function loadState() {
        try {
            const data = localStorage.getItem('ctos_save');
            if (data) {
                const parsed = JSON.parse(data);
                state.hacks = parsed.hacks || 0;
                state.profiles = parsed.profiles || 0;
                state.money = parsed.money || 0;
                state.customMarkers = parsed.customMarkers || [];
                state.trackedTargets = parsed.trackedTargets || [];
                state.activeCrimes = parsed.activeCrimes || [];
            }
        } catch (e) {
            console.error('Error loading save:', e);
        }
        updateStats();
    }

    // Distance calculation (Haversine formula in meters)
    function getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; 
    }

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
            
            // Fix Leaflet map sizing issue when unhiding container
            if (name === 'map' && map) {
                setTimeout(() => map.invalidateSize(), 100);
            }
            
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

    // ===== REAL MAP (LEAFLET) =====
    function initMap() {
        if (map) return; // Already initialized

        // Default to Madrid if geolocation fails
        const defaultLat = 40.4168;
        const defaultLng = -3.7038;

        map = L.map('map-leaflet', {
            zoomControl: true,
            attributionControl: true
        }).setView([defaultLat, defaultLng], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Initial setup
        if (navigator.geolocation) {
            // Get initial position quickly
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    state.myLat = latitude;
                    state.myLng = longitude;
                    map.setView([latitude, longitude], 16);
                    updateCoordsLabel(latitude, longitude);
                    seedCtosMarkers(latitude, longitude);
                    updatePlayerMarker(latitude, longitude);
                    refreshDynamicMarkers();
                },
                (err) => {
                    console.warn('Geolocation error:', err);
                    seedCtosMarkers(defaultLat, defaultLng);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );

            // Continuously track position (Pokemon GO style)
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    state.myLat = latitude;
                    state.myLng = longitude;
                    updateCoordsLabel(latitude, longitude);
                    updatePlayerMarker(latitude, longitude);
                    checkProximity();
                },
                (err) => console.warn('Watch error:', err),
                { enableHighAccuracy: true, maximumAge: 5000 }
            );
        } else {
            seedCtosMarkers(defaultLat, defaultLng);
        }

        // Map events
        map.on('move', () => {
            const center = map.getCenter();
            updateCoordsLabel(center.lat, center.lng);
        });

        // Add custom markers on long press / double click
        map.on('dblclick', (e) => {
            const id = 'WP-' + Date.now();
            state.customMarkers.push({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
                type: 'custom',
                title: 'WAYPOINT PERSONAL',
                id: id
            });
            saveState();
            refreshDynamicMarkers();
            vibrate(50);
            showNotification('WAYPOINT FIJADO', 'Coordenadas guardadas en local');
        });
    }

    function updatePlayerMarker(lat, lng) {
        if (!playerMarker) {
            const playerIcon = L.divIcon({
                className: 'ctos-marker player',
                html: '<div class="marker-pin" style="background:#00f0ff; width:16px; height:16px; border:2px solid #fff; box-shadow:0 0 15px #00f0ff"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            playerMarker = L.marker([lat, lng], { icon: playerIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
            playerMarker.setLatLng([lat, lng]);
        }
    }

    function checkProximity() {
        if (!state.myLat || !state.myLng) return;
        const PROXIMITY_RADIUS = 30; // meters

        // Check Crimes
        for (let i = state.activeCrimes.length - 1; i >= 0; i--) {
            const crime = state.activeCrimes[i];
            const dist = getDistance(state.myLat, state.myLng, crime.lat, crime.lng);
            
            // If physically close
            if (dist < PROXIMITY_RADIUS) {
                state.money += crime.reward;
                state.hacks++;
                
                vibrate([100, 50, 100, 50, 300]);
                showNotification('DELITO FRUSTRADO', `¡Has llegado a la zona! Recompensa: ${crime.reward.toLocaleString('es-ES')} €`);
                
                // Remove crime
                state.activeCrimes.splice(i, 1);
                saveState();
                refreshDynamicMarkers();
            }
        }

        // Check Tracked Profiles
        for (let i = state.trackedTargets.length - 1; i >= 0; i--) {
            const target = state.trackedTargets[i];
            const dist = getDistance(state.myLat, state.myLng, target.lat, target.lng);
            
            if (dist < PROXIMITY_RADIUS) {
                const reward = rand(1000, 8000);
                state.money += reward;
                
                vibrate([100, 50, 200]);
                showNotification('OBJETIVO INTERCEPTADO', `Datos extraídos. Recompensa: ${reward.toLocaleString('es-ES')} €`);
                
                state.trackedTargets.splice(i, 1);
                saveState();
                refreshDynamicMarkers();
            }
        }
    }

    function refreshDynamicMarkers() {
        if (!map) return;

        // Clear existing dynamic markers
        Object.values(dynamicMarkers).forEach(m => map.removeLayer(m));
        dynamicMarkers = {};

        // Helper to add marker
        const addMarker = (item, typeKey, labelPrefix) => {
            const style = MAP_TYPES[typeKey];
            const icon = L.divIcon({
                className: 'ctos-marker dynamic',
                html: `<div class="marker-pin" style="background:${style.color}; border:1.5px solid #fff; box-shadow:0 0 10px ${style.color}"></div><div class="marker-label" style="border-color:${style.color}; color:${style.color}">${style.name}</div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            const marker = L.marker([item.lat, item.lng], { icon: icon }).addTo(map);
            
            marker.on('click', () => {
                const info = $('#map-target-info');
                $('#map-target-name').textContent = labelPrefix + item.id.split('-')[1];
                if (typeKey === 'crime') $('#map-target-desc').textContent = 'Recompensa: ' + item.reward.toLocaleString() + ' €';
                else if (typeKey === 'custom') $('#map-target-desc').textContent = 'Punto de interés personal';
                else $('#map-target-desc').textContent = 'Última posición conocida';
                info.classList.remove('hidden');
                vibrate(20);
            });
            dynamicMarkers[item.id] = marker;
        };

        // Render all saved dynamic points
        state.customMarkers.forEach(m => addMarker(m, 'custom', 'WP-'));
        state.trackedTargets.forEach(t => addMarker(t, 'tracked', 'OBJ-'));
        state.activeCrimes.forEach(c => addMarker(c, 'crime', 'CRIMEN-'));
    }

    function seedCtosMarkers(lat, lng) {
        // Clear old static markers
        mapMarkers.forEach(m => map.removeLayer(m));
        mapMarkers = [];

        const types = ['node', 'camera', 'alert', 'target'];
        const descriptions = [
            'Nodo de conexión local ctOS',
            'Cámara de vigilancia de alta resolución',
            'Punto de acceso restringido detectado',
            'Servidor central de datos municipales',
            'Subestación eléctrica hackeable',
            'Repetidor de comunicaciones'
        ];

        for (let i = 0; i < 12; i++) {
            const mLat = lat + (Math.random() - 0.5) * 0.015;
            const mLng = lng + (Math.random() - 0.5) * 0.015;
            const type = pick(types);
            const style = MAP_TYPES[type];
            
            const icon = L.divIcon({
                className: 'ctos-marker',
                html: `<div class="marker-pin" style="background:${style.color}; border:1.5px solid #fff;"></div><div class="marker-label">${style.name}</div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });

            const marker = L.marker([mLat, mLng], { icon: icon }).addTo(map);
            marker.on('click', () => {
                const info = $('#map-target-info');
                $('#map-target-name').textContent = style.name + ' #' + rand(100, 999);
                $('#map-target-desc').textContent = pick(descriptions);
                info.classList.remove('hidden');
                vibrate(20);
            });
            mapMarkers.push(marker);
        }
    }

    // Map hack button (keep existing listener but hide info)
    $('#map-hack-btn').addEventListener('click', () => {
        state.hacks++;
        updateStats();
        vibrate([50, 30, 80]);
        showNotification('NODO HACKEADO', 'Acceso total al nodo conseguido');
        $('#map-target-info').classList.add('hidden');
    });

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
                    
                    // Spawn a crime nearby if we have GPS
                    if (state.myLat && state.myLng) {
                        const angle = Math.random() * Math.PI * 2;
                        const distanceDeg = (rand(200, 500) / 111320);
                        const cLat = state.myLat + (Math.cos(angle) * distanceDeg);
                        const cLng = state.myLng + (Math.sin(angle) * distanceDeg);
                        const reward = rand(3000, 15000);
                        
                        state.activeCrimes.push({
                            lat: cLat,
                            lng: cLng,
                            reward: reward,
                            id: 'CRM-' + Date.now()
                        });
                        saveState();
                        if (map) refreshDynamicMarkers();
                        
                        setTimeout(() => {
                            showNotification('DELITO DETECTADO', 'Posible actividad criminal marcada en el mapa');
                            vibrate([50, 50, 100, 50, 100]);
                        }, 2000);
                    }
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
            state.money = 0;
            state.cameras = 0;
            state.customMarkers = [];
            state.trackedTargets = [];
            state.activeCrimes = [];
            saveState();
            if (map) refreshDynamicMarkers();
            
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
        const moneyEl = $('#stat-money');
        if (hackEl) hackEl.textContent = state.hacks;
        if (profEl) profEl.textContent = state.profiles;
        if (moneyEl) moneyEl.textContent = state.money.toLocaleString('es-ES');

        // System page too
        const sh = $('#sys-hacks-total');
        const sp = $('#sys-profiles-total');
        const sm = $('#sys-money-total');
        if (sh) sh.textContent = state.hacks;
        if (sp) sp.textContent = state.profiles;
        if (sm) sm.textContent = state.money.toLocaleString('es-ES');
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
            const amount = rand(50, 5000);
            vibrate([50, 30, 80]);
            showNotification('CUENTA HACKEADA', `${amount.toLocaleString('es-ES')} € transferidos a tu cuenta`);
            state.hacks++;
            state.money += amount;
            saveState();
        });

        $('#btn-track').addEventListener('click', () => {
            if (state.myLat && state.myLng) {
                // Spawn tracked target marker randomly within 150-300m
                const angle = Math.random() * Math.PI * 2;
                const distanceDeg = (rand(150, 300) / 111320); // rough meter to degree conversion
                const tLat = state.myLat + (Math.cos(angle) * distanceDeg);
                const tLng = state.myLng + (Math.sin(angle) * distanceDeg);
                
                const id = 'TRK-' + Date.now();
                state.trackedTargets.push({ lat: tLat, lng: tLng, id });
                saveState();
                
                if (map) refreshDynamicMarkers(); // update map if already loaded
            }
            vibrate([30, 50, 30, 50, 30]);
            showNotification('RASTREO ACTIVO', 'Ubicación del objetivo marcada en el mapa');
        });
    }

    // ===== INIT =====
    function init() {
        loadState();
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
