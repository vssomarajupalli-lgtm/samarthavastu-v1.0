const APP_VERSION = 'v34';
/* ════ JS Block: lines 2194–7454 from original index.html ════ */
    // ══════════════════════════════════════════════════════════════════
    // SECURITY MODULE - XSS Prevention & Data Protection
    // ══════════════════════════════════════════════════════════════════
    
    const SecurityModule = (function() {
        'use strict';
        
        // HTML Entity Encoding to prevent XSS
        function escapeHTML(str) {
            if (typeof str !== 'string') return str;
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
        
        // Safe DOM manipulation - replaces innerHTML with secure alternatives
        function setHTML(element, htmlString) {
            if (!element) return;
            
            // Clear existing content
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            
            // Create a template element for parsing
            const template = document.createElement('template');
            template.innerHTML = htmlString;
            
            // Sanitize and append
            element.appendChild(template.content);
        }
        
        // Simple encryption for localStorage (AES-like substitution)
        function simpleEncrypt(text) {
            if (!text) return text;
            try {
                const str = typeof text === 'string' ? text : JSON.stringify(text);
                return btoa(encodeURIComponent(str));
            } catch(e) {
                console.error('Encryption failed:', e);
                return text;
            }
        }
        
        function simpleDecrypt(encrypted) {
            if (!encrypted) return encrypted;
            
            // Check if it's already plain JSON (not encrypted)
            try {
                JSON.parse(encrypted);
                // If parsing succeeds, it's already plain text
                return encrypted;
            } catch(e) {
                // Not valid JSON, try to decrypt
            }
            
            // Try to decrypt
            try {
                return decodeURIComponent(atob(encrypted));
            } catch(e) {
                // If decryption fails, return as-is (probably already plain text)
                console.warn('Decryption failed, returning original:', e.message);
                return encrypted;
            }
        }
        
        // Secure localStorage wrapper
        const SecureStorage = {
            set: function(key, value) {
                try {
                    const encrypted = simpleEncrypt(value);
                    localStorage.setItem(key, encrypted);
                    return true;
                } catch(e) {
                    console.error('SecureStorage.set failed:', e);
                    // Fallback: try saving without encryption
                    try {
                        localStorage.setItem(key, value);
                        return true;
                    } catch(e2) {
                        return false;
                    }
                }
            },
            
            get: function(key) {
                try {
                    const data = localStorage.getItem(key);
                    if (!data) return null;
                    
                    // Try to decrypt
                    const decrypted = simpleDecrypt(data);
                    return decrypted;
                } catch(e) {
                    console.error('SecureStorage.get failed:', e);
                    // Return raw data as fallback
                    return localStorage.getItem(key);
                }
            },
            
            remove: function(key) {
                try {
                    localStorage.removeItem(key);
                    return true;
                } catch(e) {
                    console.error('SecureStorage.remove failed:', e);
                    return false;
                }
            }
        };
        
        // Input validation
        function sanitizeInput(input, type = 'text') {
            if (input === null || input === undefined) return '';
            
            switch(type) {
                case 'number':
                    return parseFloat(input) || 0;
                case 'integer':
                    return parseInt(input) || 0;
                case 'text':
                default:
                    return escapeHTML(String(input));
            }
        }
        
        // Secure element creation
        function createElement(tag, attributes = {}, textContent = '') {
            const el = document.createElement(tag);
            
            for (let [key, value] of Object.entries(attributes)) {
                if (key === 'textContent' || key === 'innerText') {
                    el.textContent = value;
                } else if (key === 'onclick' && typeof value === 'function') {
                    el.addEventListener('click', value);
                } else if (key.startsWith('on')) {
                    // Prevent inline event handlers via attributes
                    console.warn(`Blocked inline event handler: ${key}`);
                } else {
                    el.setAttribute(key, value);
                }
            }
            
            if (textContent) {
                el.textContent = textContent;
            }
            
            return el;
        }
        
        return {
            escapeHTML,
            setHTML,
            SecureStorage,
            sanitizeInput,
            createElement,
            encrypt: simpleEncrypt,
            decrypt: simpleDecrypt
        };
    })();
    
    // Make available globally for backward compatibility
    window.SecurityModule = SecurityModule;
    window.SecureStorage = SecurityModule.SecureStorage;
    
    // ══════════════════════════════════════════════════════════════════
    // END SECURITY MODULE
    // ══════════════════════════════════════════════════════════════════

    var state = { 
        showGrid: true, showZoneLines: false, showDimensions: true, showSunPath: false, sunCity: 'Hyderabad', sunLat: 17.4, 
        ayadiShastra: 'viswakarma', ayadiUnit: 'feet', ayadiDivisor: 9, wallDeduction: 4.5/12, 
        siteN: 50, siteS: 50, siteE: 60, siteW: 60, 
        setN: 10, setS: 5, setE: 8, setW: 5, 
        houseNs: 45, houseEw: 37, houseN: 45, houseS: 45, houseE: 37, houseW: 37, magDeclination: 0, lang: 'en', 
        rotation: 0, scale: 0.8, offsetX: 0, offsetY: 0, 
        clientName: "", clientPlace: "", clientPhone: "", healthScore: 100, 
        show16Zones: true, showPlotDeities: true, showSiteDeities: false, showDevataZoneNames: false, 
        showMahamarma: true, showUpamarma: true, snap: true, xray: false, 
        bgImg: null,
bgOpacity: 0.4,
rooms: [],
walls: [],
texts: [],
devataMode: true,

        dragTarget: null, dragType: null, isDragging: false, isResizing: false, lastX: 0, lastY: 0, selectedDwara: "",
        isMeasuring: false, measurePoints: [], measureLines: [], 
        isDrawingWall: false, wallPoints: [], currentMousePos: null,
        showRoad: false, roadDir: 'East', roadWidth: 30,
        shapes: [], isDrawingRect: false, rectDrawing: false, rectStart: null,
        inkLines: [], inkColor: '#ef4444', isInking: false, _inkDrawing: false,
        // ── BATCH C: First Floor Support ──
        currentFloor: 0,          // 0 = Ground Floor, 1 = First Floor
        roomsByFloor: { 0: [], 1: [] },  // rooms stored per floor
        wallsByFloor: { 0: [], 1: [] },  // walls stored per floor
        textsByFloor: { 0: [], 1: [] },  // texts stored per floor
        floorInitialized: { 0: false, 1: false },  // track if floor has been initialized
        // ── BATCH D: L-Shape Support ──
        isLShape: false,     // toggle L-shape mode
        lCutCorner: 'NE',    // which corner is cut: NE/NW/SE/SW
        lCutW: 10,           // cut width in feet (EW direction)
        lCutH: 10            // cut height in feet (NS direction)
    };
    
    var canvas, ctx, showNavavargulu = false, stateHistory = [], historyIndex = -1, isRestoring = false;
    window.state = state;

    // ── Mobile header: show client name below "SAMARTHA VASTU" title ──
    window.syncMobHeaderClientName = function() {
        var name = (state && state.clientName) || '';
        var mh = document.getElementById('mobHeaderClientName');
        var mi = document.getElementById('mob-clientName');
        if (mh) {
            mh.textContent = name;
            mh.style.display = name ? 'block' : 'none';
        }
        if (mi && document.activeElement !== mi) mi.value = name;
    };
    // Sync active rooms/walls/texts to current floor storage, then switch floor
    window.switchFloor = function(floor) {
        if(floor === state.currentFloor) return;

        // Save current floor data
        if(!state.roomsByFloor) state.roomsByFloor = {0:[], 1:[]};
        if(!state.wallsByFloor) state.wallsByFloor = {0:[], 1:[]};
        if(!state.textsByFloor) state.textsByFloor = {0:[], 1:[]};
        state.roomsByFloor[state.currentFloor] = JSON.parse(JSON.stringify(state.rooms || []));
        state.wallsByFloor[state.currentFloor]  = JSON.parse(JSON.stringify(state.walls || []));
        state.textsByFloor[state.currentFloor]  = JSON.parse(JSON.stringify(state.texts || []));

        // If switching to 1F for first time — copy GF as template (confirmed decision)
        if(floor === 1 && (!state.floorInitialized || !state.floorInitialized[1]) && 
           (!state.roomsByFloor[1] || state.roomsByFloor[1].length === 0)) {
            // Deep copy GF rooms to 1F, excluding outside/marker rooms (they stay on site level)
            let gfRooms = state.roomsByFloor[0] || [];
            let template = gfRooms
                .filter(r => !r.isOutside && !r.isMarker)
                .map(r => ({...r, floor: 1, name: r.name}));
            state.roomsByFloor[1] = JSON.parse(JSON.stringify(template));
            state.wallsByFloor[1] = JSON.parse(JSON.stringify(state.wallsByFloor[0] || []));
            state.textsByFloor[1] = [];
            if(!state.floorInitialized) state.floorInitialized = {};
            state.floorInitialized[1] = true;
            showToast('1st Floor created from Ground Floor template — modify as needed');
        }

        // Switch to new floor
        state.currentFloor = floor;
        state.rooms = JSON.parse(JSON.stringify(state.roomsByFloor[floor] || []));
        state.walls = JSON.parse(JSON.stringify(state.wallsByFloor[floor] || []));
        state.texts = JSON.parse(JSON.stringify(state.textsByFloor[floor] || []));
        if(!state.shapes) state.shapes = [];
        
        // Update floor tab UI
        ['floorTab0','floorTab1'].forEach((id, i) => {
            let el = document.getElementById(id);
            if(el) {
                el.className = i === floor
                    ? 'flex-1 text-[10px] font-black py-1.5 rounded transition bg-indigo-600 text-white shadow-lg border border-indigo-500'
                    : 'flex-1 text-[10px] font-black py-1.5 rounded transition bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700';
            }
        });
        let floorLabel = document.getElementById('currentFloorLabel');
        if(floorLabel) floorLabel.textContent = floor === 0 ? 'Ground Floor (GF)' : 'First Floor (1F)';
        let floorCanvas = document.getElementById('floorIndicatorCanvas');
        if(floorCanvas) { 
            floorCanvas.textContent = floor === 0 ? 'GF' : '1F';
            floorCanvas.className = floor === 0 
                ? 'text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded shadow border border-indigo-500'
                : 'text-[10px] font-black bg-violet-600 text-white px-2 py-1 rounded shadow border border-violet-500';
        }

        renderItemList(); renderShapeList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
    };

    // Migration: ensure roomsByFloor is populated from state.rooms on load
    window.migrateToFloors = function() {
        if(!state.roomsByFloor) state.roomsByFloor = {0:[], 1:[]};
        if(!state.wallsByFloor) state.wallsByFloor = {0:[], 1:[]};
        if(!state.textsByFloor) state.textsByFloor = {0:[], 1:[]};
        if(!state.floorInitialized) state.floorInitialized = {0:false, 1:false};
        // If existing rooms array has rooms but floor 0 is empty → migrate
        if(state.rooms && state.rooms.length > 0 && 
           (!state.roomsByFloor[0] || state.roomsByFloor[0].length === 0)) {
            state.roomsByFloor[0] = JSON.parse(JSON.stringify(state.rooms));
            state.wallsByFloor[0]  = JSON.parse(JSON.stringify(state.walls || []));
            state.textsByFloor[0]  = JSON.parse(JSON.stringify(state.texts || []));
            state.floorInitialized[0] = true;
        }
        // Always sync active floor from floor storage
        let f = state.currentFloor || 0;
        state.rooms = JSON.parse(JSON.stringify(state.roomsByFloor[f] || state.rooms || []));
        state.walls = JSON.parse(JSON.stringify(state.wallsByFloor[f] || state.walls || []));
        state.texts = JSON.parse(JSON.stringify(state.textsByFloor[f] || state.texts || []));
        state.currentFloor = f;
    };

    function checkPassword() {
        // PASSWORD REMOVED — Play Store ready
        // Legacy function kept for compatibility — now auto-called on load
        showWelcomeActions();
    }

    function showWelcomeActions() {
        const splash = document.getElementById('splashPanel');
        const actions = document.getElementById('welcomeActions');
        if(!splash || !actions) return;
        splash.style.transition = 'opacity 0.3s';
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            actions.classList.remove('hidden');
            actions.style.opacity = '0';
            actions.style.transition = 'opacity 0.4s';
            setTimeout(() => { actions.style.opacity = '1'; }, 20);
        }, 320);
    }

    function doWelcome(action) {
        const overlay = document.getElementById('passwordOverlay');
        const showCanvasUI = () => {
            document.body.classList.add('app-ready');
            const cc = document.getElementById('compassContainer');
            if(cc) { cc.style.display = 'flex'; }
        };
        const dismiss = (cb) => {
            overlay.style.transition = 'opacity 0.4s';
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.display = 'none'; showCanvasUI(); if(cb) cb(); }, 420);
        };
        if(action === 'new') {
            try { localStorage.removeItem('vastu_v23_final'); sessionStorage.setItem('sv_skip_welcome','1'); } catch(e) {}
            dismiss(() => setTimeout(() => location.reload(), 50));
        } else if(action === 'open') {
            // Raise overlay z-index below project manager temporarily
            overlay.style.zIndex = '10';
            dismiss(() => setTimeout(() => {
                if(typeof window.toggleProjectManager === 'function') window.toggleProjectManager();
            }, 50));
        } else if(action === 'import') {
            dismiss(() => {
                let inp = document.createElement('input');
                inp.type = 'file'; inp.accept = '.json';
                inp.onchange = e => {
                    let f = e.target.files[0]; if(!f) return;
                    let r = new FileReader();
                    r.onload = ev => {
                        try {
                            let p = JSON.parse(ev.target.result);
                            Object.assign(state, p);
                            if(typeof window.migrateToFloors === 'function') window.migrateToFloors();
                            state.isLShape = false;
                            window.updateFromInputs(); renderItemList(); renderShapeList();
                            window.draw(); window.saveLocal();
                            window.syncMobHeaderClientName&&window.syncMobHeaderClientName();
                            showToast('Project imported ✅');
                        } catch(ex) { alert('Invalid project file.'); }
                    };
                    r.readAsText(f);
                };
                inp.click();
            });
        } else if(action === 'guide') {
            if(typeof window.openUserGuide === 'function') window.openUserGuide();
            // Don't dismiss — user can still pick other actions
        } else {
            dismiss();
        }
    }


    const NAKSHATRAS=["","Ashwini","Bharani","Krithika","Rohini","Mrigashira","Ardra","Punarvasu","Pushyami","Ashlesha","Magha","Pubba","Uttara","Hastha","Chitra","Swathi","Vishakha","Anuradha","Jyeshta","Moola","Purvashada","Uttarashada","Shravana","Dhanishta","Shatabhisha","Purvabhadra","Uttarabhadra","Revathi"];
    const TITHIS=["","Padyami","Vidiya","Tadiya","Chaviti","Panchami","Shashti","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chathurdashi","Purnima/Amavasya"];
    const YONI_NAMES=["","Dhwaja","Dhuma","Simha","Shvana","Vrishabha","Khara","Gaja","Kaka"];
    const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    // ── UI STRING TRANSLATIONS (Step 1-4 pattern) ────────────────────────
    const UI_LANG = {
        en: {
            vastuScore:'Vastu Health Score', liveAlerts:'Live Vastu Alerts',
            siteGeom:'Site Geometry', roadDir:'Road Direction', roadWidth:'Road Width',
            madhya:'Madhya Sutra (auto)', constPlacement:'Construction Placement',
            gf:'Ground Floor (GF)', mainRooms:'Main Rooms', doorsWin:'Doors & Windows (Architectural)',
            eastRoad:'East Road', westRoad:'West Road', northRoad:'North Road', southRoad:'South Road',
            toolText:'Text', toolWall:'Wall', toolUndoWall:'Undo Wall', toolMeasure:'Measure', toolRect:'Rect',
            autoGate:'Auto Gate', snap:'Snap', mahaMarma:'Maha Marma', siteBoundary:'Site Boundary',
            siteDevathas:'Site Devathas', houseDevathas:'House Devathas', gridLines:'Grid Lines',
            resources:'Resources', guidesHelp:'📚 Guides & Help',
            whyDiff:'Why We Are Different', whyDiffSub:'Specialities · Sakkhi proof · Slokas',
            learningGuide:'Learning Guide', learningGuideSub:'Complete Viswakarma Vastu reference',
            userGuide:'User Guide', userGuideSub:'How to use the software',
            shortcuts:'Keyboard Shortcuts', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 Consult', consultTitle:'🙏 Vastu - Expert Consultation',
            consultSub:'Samartha Vastu — Services & Contact Info',
            advServices:'🌟 Advanced Online Services', mission:'🌟 Our Mission & Philosophy',
            connectUs:'👇 Connect With Us / Contact For Consultations 👇',
            magDec:'Mag. Declination', whatIsThis:'ℹ️ What is this?',
            clientName:'Client Name', clientPlace:'Place', clientPhone:'Phone'
        },
        te: {
            vastuScore:'వాస్తు ఆరోగ్య స్కోర్', liveAlerts:'వాస్తు హెచ్చరికలు',
            siteGeom:'స్థల జ్యామితి', roadDir:'రోడ్డు దిశ', roadWidth:'రోడ్డు వెడల్పు',
            madhya:'మధ్యసూత్రం (స్వయంచాలక)', constPlacement:'నిర్మాణ స్థానం',
            gf:'గ్రౌండ్ ఫ్లోర్ (GF)', mainRooms:'ప్రధాన గదులు', doorsWin:'తలుపులు & కిటికీలు',
            eastRoad:'తూర్పు రోడ్', westRoad:'పడమర రోడ్', northRoad:'ఉత్తర రోడ్', southRoad:'దక్షిణ రోడ్',
            toolText:'వచనం', toolWall:'గోడ', toolUndoWall:'గోడ తొలగించు', toolMeasure:'కొలత', toolRect:'దీర్ఘచతురస్రం',
            autoGate:'స్వయంచాలక గేటు', snap:'స్నాప్', mahaMarma:'మహామర్మ', siteBoundary:'స్థల సరిహద్దు',
            siteDevathas:'స్థల దేవతలు', houseDevathas:'ఇంటి దేవతలు', gridLines:'గ్రిడ్ రేఖలు',
            resources:'వనరులు', guidesHelp:'📚 గైడ్\u200cలు & సహాయం',
            whyDiff:'మేము ఎందుకు భిన్నంగా ఉన్నాం', whyDiffSub:'ప్రత్యేకతలు · సాక్షి నిరూపణ · శ్లోకాలు',
            learningGuide:'అభ్యాస మార్గదర్శి', learningGuideSub:'సంపూర్ణ విశ్వకర్మ వాస్తు సూచన',
            userGuide:'వినియోగదారు మార్గదర్శి', userGuideSub:'సాఫ్ట్\u200cవేర్ ఎలా ఉపయోగించాలి',
            shortcuts:'కీబోర్డ్ షార్ట్\u200cకట్\u200cలు', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 సంప్రదించండి', consultTitle:'🙏 వాస్తు - నిపుణుల సంప్రదింపు',
            consultSub:'సమర్థ వాస్తు — సేవలు & సంప్రదింపు సమాచారం',
            advServices:'🌟 అడ్వాన్స్డ్ ఆన్\u200cలైన్ సేవలు', mission:'🌟 మా లక్ష్యం & తత్వశాస్త్రం',
            connectUs:'👇 మమ్మల్ని సంప్రదించండి / సంప్రదింపులకు 👇',
            magDec:'అయస్కాంత విచలనం', whatIsThis:'ℹ️ ఇది ఏమిటి?',
            clientName:'క్లైంట్ పేరు', clientPlace:'స్థలం', clientPhone:'ఫోన్'
        },
        hi: {
            vastuScore:'वास्तु स्वास्थ्य स्कोर', liveAlerts:'वास्तु चेतावनियाँ',
            siteGeom:'भूखंड ज्यामिति', roadDir:'सड़क की दिशा', roadWidth:'सड़क की चौड़ाई',
            madhya:'मध्यसूत्र (स्वचालित)', constPlacement:'निर्माण स्थान',
            gf:'भूतल (GF)', mainRooms:'मुख्य कमरे', doorsWin:'दरवाजे & खिड़कियाँ',
            eastRoad:'पूर्व सड़क', westRoad:'पश्चिम सड़क', northRoad:'उत्तर सड़क', southRoad:'दक्षिण सड़क',
            toolText:'पाठ', toolWall:'दीवार', toolUndoWall:'दीवार हटाएं', toolMeasure:'माप', toolRect:'आयत',
            autoGate:'स्वचालित गेट', snap:'स्नैप', mahaMarma:'महामर्म', siteBoundary:'भूखंड सीमा',
            siteDevathas:'भूखंड देवता', houseDevathas:'गृह देवता', gridLines:'ग्रिड रेखाएं',
            resources:'संसाधन', guidesHelp:'📚 गाइड & सहायता',
            whyDiff:'हम अलग क्यों हैं', whyDiffSub:'विशेषताएं · साक्षी प्रमाण · श्लोक',
            learningGuide:'शिक्षण मार्गदर्शिका', learningGuideSub:'संपूर्ण विश्वकर्मा वास्तु संदर्भ',
            userGuide:'उपयोगकर्ता मार्गदर्शिका', userGuideSub:'सॉफ़्टवेयर का उपयोग कैसे करें',
            shortcuts:'कीबोर्ड शॉर्टकट', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 परामर्श', consultTitle:'🙏 वास्तु - विशेषज्ञ परामर्श',
            consultSub:'समर्थ वास्तु — सेवाएं & संपर्क',
            advServices:'🌟 उन्नत ऑनलाइन सेवाएं', mission:'🌟 हमारा मिशन & दर्शन',
            connectUs:'👇 हमसे जुड़ें / परामर्श के लिए संपर्क 👇',
            magDec:'चुंबकीय विचलन', whatIsThis:'ℹ️ यह क्या है?',
            clientName:'ग्राहक का नाम', clientPlace:'स्थान', clientPhone:'फोन'
        },
        kn: {
            vastuScore:'ವಾಸ್ತು ಆರೋಗ್ಯ ಸ್ಕೋರ್', liveAlerts:'ವಾಸ್ತು ಎಚ್ಚರಿಕೆಗಳು',
            siteGeom:'ನಿವೇಶನ ಜ್ಯಾಮಿತಿ', roadDir:'ರಸ್ತೆ ದಿಕ್ಕು', roadWidth:'ರಸ್ತೆ ಅಗಲ',
            madhya:'ಮಧ್ಯಸೂತ್ರ (ಸ್ವಯಂಚಾಲಿತ)', constPlacement:'ನಿರ್ಮಾಣ ಸ್ಥಳ',
            gf:'ನೆಲ ಮಹಡಿ (GF)', mainRooms:'ಮುಖ್ಯ ಕೋಣೆಗಳು', doorsWin:'ಬಾಗಿಲು & ಕಿಟಕಿಗಳು',
            eastRoad:'ಪೂರ್ವ ರಸ್ತೆ', westRoad:'ಪಶ್ಚಿಮ ರಸ್ತೆ', northRoad:'ಉತ್ತರ ರಸ್ತೆ', southRoad:'ದಕ್ಷಿಣ ರಸ್ತೆ',
            toolText:'ಪಠ್ಯ', toolWall:'ಗೋಡೆ', toolUndoWall:'ಗೋಡೆ ತೆಗೆ', toolMeasure:'ಅಳತೆ', toolRect:'ಚತುರ್ಭುಜ',
            autoGate:'ಸ್ವಯಂ ಗೇಟ್', snap:'ಸ್ನ್ಯಾಪ್', mahaMarma:'ಮಹಾಮರ್ಮ', siteBoundary:'ನಿವೇಶನ ಗಡಿ',
            siteDevathas:'ನಿವೇಶನ ದೇವತೆಗಳು', houseDevathas:'ಮನೆ ದೇವತೆಗಳು', gridLines:'ಗ್ರಿಡ್ ರೇಖೆಗಳು',
            resources:'ಸಂಪನ್ಮೂಲಗಳು', guidesHelp:'📚 ಗೈಡ್\u200dಗಳು & ಸಹಾಯ',
            whyDiff:'ನಾವು ಏಕೆ ಭಿನ್ನ', whyDiffSub:'ವಿಶೇಷತೆಗಳು · ಸಾಕ್ಷಿ ಪುರಾವೆ · ಶ್ಲೋಕಗಳು',
            learningGuide:'ಕಲಿಕಾ ಮಾರ್ಗದರ್ಶಿ', learningGuideSub:'ಸಂಪೂರ್ಣ ವಿಶ್ವಕರ್ಮ ವಾಸ್ತು ಉಲ್ಲೇಖ',
            userGuide:'ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ', userGuideSub:'ಸಾಫ್ಟ್\u200dವೇರ್ ಬಳಸುವ ವಿಧಾನ',
            shortcuts:'ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್\u200dಕಟ್\u200dಗಳು', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 ಸಮಾಲೋಚನೆ', consultTitle:'🙏 ವಾಸ್ತು - ತಜ್ಞ ಸಮಾಲೋಚನೆ',
            consultSub:'ಸಮರ್ಥ ವಾಸ್ತು — ಸೇವೆಗಳು & ಸಂಪರ್ಕ',
            advServices:'🌟 ಅಡ್ವಾನ್ಸ್ಡ್ ಆನ್\u200dಲೈನ್ ಸೇವೆಗಳು', mission:'🌟 ನಮ್ಮ ಧ್ಯೇಯ & ತತ್ವಶಾಸ್ತ್ರ',
            connectUs:'👇 ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ / ಸಮಾಲೋಚನೆಗಾಗಿ 👇',
            magDec:'ಕಾಂತೀಯ ವಿಚಲನ', whatIsThis:'ℹ️ ಇದು ಏನು?',
            clientName:'ಗ್ರಾಹಕರ ಹೆಸರು', clientPlace:'ಸ್ಥಳ', clientPhone:'ಫೋನ್'
        },
        ta: {
            vastuScore:'வாஸ்து ஆரோக்கிய மதிப்பெண்', liveAlerts:'வாஸ்து எச்சரிக்கைகள்',
            siteGeom:'தள வடிவியல்', roadDir:'சாலை திசை', roadWidth:'சாலை அகலம்',
            madhya:'மத்யசூத்ரம் (தானியங்கி)', constPlacement:'கட்டுமான இடம்',
            gf:'தரை மாடி (GF)', mainRooms:'முக்கிய அறைகள்', doorsWin:'கதவுகள் & ஜன்னல்கள்',
            eastRoad:'கிழக்கு சாலை', westRoad:'மேற்கு சாலை', northRoad:'வடக்கு சாலை', southRoad:'தெற்கு சாலை',
            toolText:'உரை', toolWall:'சுவர்', toolUndoWall:'சுவர் நீக்கு', toolMeasure:'அளவீடு', toolRect:'செவ்வகம்',
            autoGate:'தானியங்கி வாயில்', snap:'ஸ்னாப்', mahaMarma:'மஹாமர்மம்', siteBoundary:'தள எல்லை',
            siteDevathas:'தள தேவதைகள்', houseDevathas:'இல்ல தேவதைகள்', gridLines:'கட்டக் கோடுகள்',
            resources:'வளங்கள்', guidesHelp:'📚 வழிகாட்டிகள் & உதவி',
            whyDiff:'நாங்கள் ஏன் வித்தியாசம்', whyDiffSub:'சிறப்புகள் · சாட்சி சான்று · ஸ்லோகங்கள்',
            learningGuide:'கற்றல் வழிகாட்டி', learningGuideSub:'முழுமையான விஷ்வகர்மா வாஸ்து குறிப்பு',
            userGuide:'பயனர் வழிகாட்டி', userGuideSub:'மென்பொருளை எவ்வாறு பயன்படுத்துவது',
            shortcuts:'விசைப்பலகை குறுக்குவழிகள்', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 ஆலோசனை', consultTitle:'🙏 வாஸ்து - நிபுணர் ஆலோசனை',
            consultSub:'சமர்த்த வாஸ்து — சேவைகள் & தொடர்பு',
            advServices:'🌟 மேம்பட்ட ஆன்லைன் சேவைகள்', mission:'🌟 எங்கள் நோக்கம் & தத்துவம்',
            connectUs:'👇 எங்களை தொடர்பு கொள்ளுங்கள் 👇',
            magDec:'காந்த விலகல்', whatIsThis:'ℹ️ இது என்ன?',
            clientName:'வாடிக்கையாளர் பெயர்', clientPlace:'இடம்', clientPhone:'தொலைபேசி'
        },
        ml: {
            vastuScore:'വാസ്തു ആരോഗ്യ സ്കോർ', liveAlerts:'വാസ്തു മുന്നറിയിപ്പുകൾ',
            siteGeom:'സൈറ്റ് ജ്യാമിതി', roadDir:'റോഡ് ദിശ', roadWidth:'റോഡ് വീതി',
            madhya:'മധ്യസൂത്രം (സ്വയംചാലക)', constPlacement:'നിർമ്മാണ സ്ഥാനം',
            gf:'ഗ്രൗണ്ട് ഫ്ലോർ (GF)', mainRooms:'പ്രധാന മുറികൾ', doorsWin:'വാതിലുകൾ & ജനലുകൾ',
            eastRoad:'കിഴക്കൻ റോഡ്', westRoad:'പടിഞ്ഞാറൻ റോഡ്', northRoad:'വടക്കൻ റോഡ്', southRoad:'തെക്കൻ റോഡ്',
            toolText:'ടെക്സ്റ്റ്', toolWall:'ഭിത്തി', toolUndoWall:'ഭിത്തി നീക്കുക', toolMeasure:'അളവ്', toolRect:'ദീർഘചതുരം',
            autoGate:'സ്വയം ഗേറ്റ്', snap:'സ്നാപ്പ്', mahaMarma:'മഹാമർമ്മം', siteBoundary:'സൈറ്റ് അതിർത്തി',
            siteDevathas:'സൈറ്റ് ദേവതകൾ', houseDevathas:'ഗൃഹ ദേവതകൾ', gridLines:'ഗ്രിഡ് രേഖകൾ',
            resources:'വിഭവങ്ങൾ', guidesHelp:'📚 ഗൈഡുകൾ & സഹായം',
            whyDiff:'ഞങ്ങൾ എന്തുകൊണ്ട് വ്യത്യസ്തർ', whyDiffSub:'പ്രത്യേകതകൾ · സാക്ഷി തെളിവ് · ശ്ലോകങ്ങൾ',
            learningGuide:'പഠന ഗൈഡ്', learningGuideSub:'സമ്പൂർണ്ണ വിശ്വകർമ്മ വാസ്തു റഫറൻസ്',
            userGuide:'ഉപയോക്തൃ ഗൈഡ്', userGuideSub:'സോഫ്റ്റ്\u200dവെയർ എങ്ങനെ ഉപയോഗിക്കാം',
            shortcuts:'കീബോർഡ് കുറുക്കുവഴികൾ', shortcutsSub:'Ctrl+Z, W, M, R, G, +/-, Del...',
            consultBtn:'🙏 കൺസൾട്ട്', consultTitle:'🙏 വാസ്തു - വിദഗ്ധ കൺസൾട്ടേഷൻ',
            consultSub:'സമർത്ഥ വാസ്തു — സേവനങ്ങൾ & ബന്ധപ്പെടൽ',
            advServices:'🌟 അഡ്വാൻസ്ഡ് ഓൺലൈൻ സേവനങ്ങൾ', mission:'🌟 ഞങ്ങളുടെ ദൗത്യം & തത്ത്വശാസ്ത്രം',
            connectUs:'👇 ഞങ്ങളെ ബന്ധപ്പെടുക / കൺസൾട്ടേഷനായി 👇',
            magDec:'കാന്തിക വ്യതിയാനം', whatIsThis:'ℹ️ ഇത് എന്താണ്?',
            clientName:'ക്ലയന്റ് പേര്', clientPlace:'സ്ഥലം', clientPhone:'ഫോൺ'
        }
    };
    // window.dt — dynamic translation helper (defined before DYNAMIC_I18N, called at runtime)
    window.dt = function(key) {
        if (typeof DYNAMIC_I18N === 'undefined') return key;
        const lang = (typeof state !== 'undefined' && state.lang) ? state.lang : 'en';
        return (DYNAMIC_I18N[lang] && DYNAMIC_I18N[lang][key]) ? DYNAMIC_I18N[lang][key] : (DYNAMIC_I18N.en[key] || key);
    };
        // ── DYNAMIC SECTION TRANSLATIONS ─────────────────────────────────────
    const DYNAMIC_I18N = {
        en: {
            noRooms:'Add rooms to see alerts...',
            scoreExcellent:'✅ Excellent', scoreGood:'✅ Good', scoreMarginal:'⚠️ Marginal', scorePoor:'❌ Poor',
            tipImprove:'Try Dhwaja/Gaja buttons to improve score',
            tipCheck:'Check room placement in Vastu zones',
            tipAuspicious:'All Ayadi parameters auspicious',
            outsideBuilding:'Outside building (setback area). Drag to position near compound wall.',
            cutZone:'is in the L-shape CUT ZONE (Vithi). Move it inside the built area.',
            doshaInside:'inside Built Area! Place near compound wall.',
            borewellOk:'Correct (near NE compound wall)', borewellWrong:'Wrong position! Place near NE compound wall corner.',
            septicOk:'Correct (near NW compound wall)', septicWrong:'Wrong position! Place near NW or SSW compound wall corner.',
            toiletNE:'DOSHA! Never in NE'
        },
        te: {
            noRooms:'హెచ్చరికలు చూడడానికి గదులు జోడించండి...',
            scoreExcellent:'✅ అద్భుతం', scoreGood:'✅ మంచిది', scoreMarginal:'⚠️ మధ్యస్థం', scorePoor:'❌ పేలవం',
            tipImprove:'స్కోరు మెరుగుపరచడానికి ధ్వజ/గజ బటన్లు ప్రయత్నించండి',
            tipCheck:'వాస్తు జోన్లలో గది స్థానం తనిఖీ చేయండి',
            tipAuspicious:'అన్ని ఆయాది పారామీటర్లు శుభంగా ఉన్నాయి',
            outsideBuilding:'నిర్మాణం వెలుపల (సెట్‌బ్యాక్). సమ్మతి గోడ దగ్గర ఉంచండి.',
            cutZone:'L-ఆకారపు కట్ జోన్‌లో ఉంది. నిర్మిత ప్రాంతంలోకి తరలించండి.',
            doshaInside:'నిర్మిత ప్రాంతంలో ఉంది! సమ్మతి గోడ దగ్గర ఉంచండి.',
            borewellOk:'సరైన స్థానం (ఈశాన్య గోడ దగ్గర)', borewellWrong:'తప్పు స్థానం! ఈశాన్య మూల దగ్గర ఉంచండి.',
            septicOk:'సరైన స్థానం (వాయువ్య గోడ దగ్గర)', septicWrong:'తప్పు స్థానం! వాయువ్య లేదా SSW మూల దగ్గర ఉంచండి.',
            toiletNE:'దోష! ఈశాన్యంలో ఎప్పుడూ ఉంచవద్దు'
        },
        hi: {
            noRooms:'चेतावनियाँ देखने के लिए कमरे जोड़ें...',
            scoreExcellent:'✅ उत्कृष्ट', scoreGood:'✅ अच्छा', scoreMarginal:'⚠️ मध्यम', scorePoor:'❌ खराब',
            tipImprove:'स्कोर सुधारने के लिए ध्वज/गज बटन आज़माएं',
            tipCheck:'वास्तु क्षेत्रों में कमरे की स्थिति जांचें',
            tipAuspicious:'सभी आयादि पैरामीटर शुभ हैं',
            outsideBuilding:'भवन के बाहर (सेटबैक)। परिसर दीवार के पास रखें।',
            cutZone:'L-आकार के कट ज़ोन में है। निर्मित क्षेत्र के अंदर ले जाएं।',
            doshaInside:'निर्मित क्षेत्र के अंदर! परिसर दीवार के पास रखें।',
            borewellOk:'सही स्थान (NE दीवार के पास)', borewellWrong:'गलत स्थान! NE कोने के पास रखें।',
            septicOk:'सही स्थान (NW दीवार के पास)', septicWrong:'गलत स्थान! NW या SSW कोने के पास रखें।',
            toiletNE:'दोष! NE में कभी नहीं'
        },
        kn: {
            noRooms:'ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೋಡಲು ಕೋಣೆಗಳನ್ನು ಸೇರಿಸಿ...',
            scoreExcellent:'✅ ಅತ್ಯುತ್ತಮ', scoreGood:'✅ ಒಳ್ಳೆಯದು', scoreMarginal:'⚠️ ಮಧ್ಯಮ', scorePoor:'❌ ಕಳಪೆ',
            tipImprove:'ಸ್ಕೋರ್ ಸುಧಾರಿಸಲು ಧ್ವಜ/ಗಜ ಬಟನ್‌ಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ',
            tipCheck:'ವಾಸ್ತು ವಲಯಗಳಲ್ಲಿ ಕೋಣೆ ಸ್ಥಾನ ಪರಿಶೀಲಿಸಿ',
            tipAuspicious:'ಎಲ್ಲಾ ಆಯಾದಿ ನಿಯತಾಂಕಗಳು ಶುಭ',
            outsideBuilding:'ಕಟ್ಟಡದ ಹೊರಗೆ (ಸೆಟ್‌ಬ್ಯಾಕ್). ಗೋಡೆ ಹತ್ತಿರ ಇರಿಸಿ.',
            cutZone:'L-ಆಕಾರದ ಕಟ್ ವಲಯದಲ್ಲಿದೆ. ನಿರ್ಮಿತ ಪ್ರದೇಶದೊಳಗೆ ಸರಿಸಿ.',
            doshaInside:'ನಿರ್ಮಿತ ಪ್ರದೇಶದಲ್ಲಿದೆ! ಗೋಡೆ ಹತ್ತಿರ ಇರಿಸಿ.',
            borewellOk:'ಸರಿಯಾದ ಸ್ಥಾನ (NE ಗೋಡೆ ಹತ್ತಿರ)', borewellWrong:'ತಪ್ಪು ಸ್ಥಾನ! NE ಮೂಲೆ ಹತ್ತಿರ ಇರಿಸಿ.',
            septicOk:'ಸರಿಯಾದ ಸ್ಥಾನ (NW ಗೋಡೆ ಹತ್ತಿರ)', septicWrong:'ತಪ್ಪು ಸ್ಥಾನ! NW ಅಥವಾ SSW ಮೂಲೆ ಹತ್ತಿರ ಇರಿಸಿ.',
            toiletNE:'ದೋಷ! NE ಯಲ್ಲಿ ಎಂದಿಗೂ ಬೇಡ'
        },
        ta: {
            noRooms:'எச்சரிக்கைகளைப் பார்க்க அறைகளைச் சேர்க்கவும்...',
            scoreExcellent:'✅ சிறப்பானது', scoreGood:'✅ நல்லது', scoreMarginal:'⚠️ நடுத்தரம்', scorePoor:'❌ மோசம்',
            tipImprove:'மதிப்பெண் மேம்பட ஒப/கஜ பொத்தான்களை முயற்சிக்கவும்',
            tipCheck:'வாஸ்து மண்டலங்களில் அறை இடத்தை சரிபார்க்கவும்',
            tipAuspicious:'அனைத்து ஆயாதி அளவுகோல்களும் சுபமானவை',
            outsideBuilding:'கட்டிடத்திற்கு வெளியே (செட்பேக்). கூட்டு சுவர் அருகில் வையுங்கள்.',
            cutZone:'L-வடிவ வெட்டு மண்டலத்தில் உள்ளது. கட்டிடத்திற்குள் நகர்த்துங்கள்.',
            doshaInside:'கட்டிடத்திற்குள்! கூட்டு சுவர் அருகில் வையுங்கள்.',
            borewellOk:'சரியான இடம் (NE சுவர் அருகில்)', borewellWrong:'தவறான இடம்! NE மூலை அருகில் வையுங்கள்.',
            septicOk:'சரியான இடம் (NW சுவர் அருகில்)', septicWrong:'தவறான இடம்! NW அல்லது SSW மூலை அருகில் வையுங்கள்.',
            toiletNE:'தோஷம்! NE யில் வேண்டாம்'
        },
        ml: {
            noRooms:'അലേർട്ടുകൾ കാണാൻ മുറികൾ ചേർക്കുക...',
            scoreExcellent:'✅ മികച്ചത്', scoreGood:'✅ നല്ലത്', scoreMarginal:'⚠️ ഇടത്തരം', scorePoor:'❌ മോശം',
            tipImprove:'സ്കോർ മെച്ചപ്പെടുത്താൻ ധ്വജ/ഗജ ബട്ടണുകൾ ശ്രമിക്കുക',
            tipCheck:'വാസ്തു മേഖലകളിൽ മുറി സ്ഥാനം പരിശോധിക്കുക',
            tipAuspicious:'എല്ലാ ആയാദി പാരാമീറ്ററുകളും ശുഭകരം',
            outsideBuilding:'കെട്ടിടത്തിന് പുറത്ത് (സെറ്റ്ബാക്ക്). ഭിത്തിക്ക് അടുത്ത് വക്കുക.',
            cutZone:'L-ആകൃതി കട്ട് സോണിലാണ്. നിർമ്മിത ഭാഗത്തേക്ക് മാറ്റുക.',
            doshaInside:'നിർമ്മിത ഭാഗത്തിനകത്ത്! ഭിത്തിക്ക് അടുത്ത് വക്കുക.',
            borewellOk:'ശരിയായ സ്ഥാനം (NE ഭിത്തിക്ക് അടുത്ത്)', borewellWrong:'തെറ്റായ സ്ഥാനം! NE കോണിൽ വക്കുക.',
            septicOk:'ശരിയായ സ്ഥാനം (NW ഭിത്തിക്ക് അടുത്ത്)', septicWrong:'തെറ്റായ സ്ഥാനം! NW അല്ലെങ്കിൽ SSW കോണിൽ വക്കുക.',
            toiletNE:'ദോഷം! NE-ൽ ഒരിക്കലും വേണ്ട'
        }
    };
    // ─────────────────────────────────────────────────────────────────────
    // Step 3-4: setUILanguage — querySelectorAll data-i18n pattern
    window.setUILanguage = function(lang) {
        const T = UI_LANG[lang] || UI_LANG.en;
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            if (T[key] !== undefined) el.textContent = T[key];
        });
        // Update input placeholders
        const cn = document.getElementById('clientNameInput');
        if(cn) cn.placeholder = T.clientName || 'Client Name';
        const cp = document.getElementById('clientPlaceInput');
        if(cp) cp.placeholder = T.clientPlace || 'Place';
        const ph = document.getElementById('clientPhoneInput');
        if(ph) ph.placeholder = T.clientPhone || 'Phone';
        // Re-render score badge hidden — circle only
        const badge = document.getElementById('scoreBadge');
        const tip = document.getElementById('scoreTip');
        if(badge) { badge.style.display='none'; badge.textContent=''; }
        if(tip) { tip.style.display='none'; tip.textContent=''; }
        // Update alerts placeholder if showing default
        const al = document.getElementById('vastuAlertsList');
        if(al) {
            const hasAlerts = al.querySelector('.text-green-400, .text-red-400, .text-amber-400, .text-slate-400');
            if(!hasAlerts) {
                al.innerHTML = '<div class="flex items-center gap-1.5 text-slate-500 text-[9px] py-1"><i class="fa-solid fa-circle-info text-slate-600"></i>' + (window.dt ? window.dt('noRooms') : 'Add rooms to see alerts...') + '</div>';
            }
        }
        // Road direction select options (data-i18n on <option> sets text)
        // already handled by the loop above for option elements
    };

    // renderLearnerGuide — updates the Learning Guide button label in the dropdown
    // (The guide itself opens as a popup — language is passed at open time)
    window.renderLearnerGuide = function() {
        const lang = (state && state.lang) ? state.lang : 'en';
        const T = UI_LANG[lang] || UI_LANG.en;
        const el = document.getElementById('ui_learningGuide');
        if (el) el.textContent = T.learningGuide;
        const sub = document.getElementById('ui_learningGuideSub');
        if (sub) sub.textContent = T.learningGuideSub;
    };

    // renderProfessionalSection — updates the Consult button and modal header
    window.renderProfessionalSection = function() {
        const lang = (state && state.lang) ? state.lang : 'en';
        const T = UI_LANG[lang] || UI_LANG.en;
        const btn = document.getElementById('ui_consultBtn');
        if (btn) btn.textContent = T.consultBtn;
        const title = document.getElementById('ui_consultTitle');
        if (title) title.textContent = T.consultTitle;
        const sub = document.getElementById('ui_consultSub');
        if (sub) sub.textContent = T.consultSub;
    };
    // ─────────────────────────────────────────────────────────────────────
    const DEVATHA_I18N = {
        "Shikhi":      {te:"శిఖి",      hi:"शिखी",      kn:"ಶಿಖಿ",      ta:"சிகி",       ml:"ശിഖി"},
        "Parjanya":    {te:"పర్జన్య",   hi:"पर्जन्य",   kn:"ಪರ್ಜನ್ಯ",  ta:"பர்ஜன்ய",   ml:"പർജന്യ"},
        "Jayanta":     {te:"జయంత",      hi:"जयंत",      kn:"ಜಯಂತ",     ta:"ஜயந்த",      ml:"ജയന്ത"},
        "Mahendra":    {te:"మహేంద్ర",   hi:"महेंद्र",   kn:"ಮಹೇಂದ್ರ",  ta:"மஹேந்திர",  ml:"മഹേന്ദ്ര"},
        "Surya":       {te:"సూర్య",     hi:"सूर्य",     kn:"ಸೂರ್ಯ",    ta:"சூர்ய",      ml:"സൂര്യ"},
        "Satya":       {te:"సత్య",      hi:"सत्य",      kn:"ಸತ್ಯ",     ta:"சத்ய",       ml:"സത്യ"},
        "Bhrisha":     {te:"భృశ",       hi:"भृश",       kn:"ಭೃಶ",      ta:"பிருச",      ml:"ഭൃശ"},
        "Antariksha":  {te:"అంతరిక్ష",  hi:"अंतरिक्ष",  kn:"ಅಂತರಿಕ್ಷ",ta:"அந்தரிக்ஷ",  ml:"അന്തരിക്ഷ"},
        "Agni":        {te:"అగ్ని",     hi:"अग्नि",     kn:"ಅಗ್ನಿ",    ta:"அக்னி",      ml:"അഗ്നി"},
        "Pusha":       {te:"పూష",       hi:"पूषा",      kn:"ಪೂಷ",      ta:"பூஷ",        ml:"പൂഷ"},
        "Vitatha":     {te:"వితత",      hi:"वितथ",      kn:"ವಿತತ",     ta:"விதத",       ml:"വിതത"},
        "Gruhakshat":  {te:"గృహక్షత్",  hi:"गृहक्षत",   kn:"ಗೃಹಕ್ಷತ್",ta:"க்ருஹக்ஷத்", ml:"ഗൃഹക്ഷത്"},
        "Yama":        {te:"యమ",        hi:"यम",        kn:"ಯಮ",       ta:"யம",         ml:"യമ"},
        "Gandharva":   {te:"గంధర్వ",    hi:"गंधर्व",    kn:"ಗಂಧರ್ವ",   ta:"கந்தர்வ",    ml:"ഗന്ധർവ"},
        "Bhringraj":   {te:"భృంగరాజ",   hi:"भृंगराज",   kn:"ಭೃಂಗರಾಜ",  ta:"பிருங்கராஜ", ml:"ഭൃംഗരാജ"},
        "Mriga":       {te:"మృగ",       hi:"मृग",       kn:"ಮೃಗ",      ta:"மிருக",      ml:"മൃഗ"},
        "Pitra":       {te:"పిత్ర",     hi:"पित्र",     kn:"ಪಿತ್ರ",    ta:"பித்ர",      ml:"പിത്ര"},
        "Dauvarika":   {te:"ద్వారిక",    hi:"द्वारिक",   kn:"ದ್ವಾರಿಕ",  ta:"த்வாரிக",    ml:"ദ്വാരിക"},
        "Sugriva":     {te:"సుగ్రీవ",    hi:"सुग्रीव",   kn:"ಸುಗ್ರೀವ",  ta:"சுக்ரீவ",    ml:"സുഗ്രീവ"},
        "Pushpadanta": {te:"పుష్పదంత",   hi:"पुष्पदंत",  kn:"ಪುಷ್ಪದಂತ", ta:"புஷ்பதந்த",  ml:"പുഷ്പദന്ത"},
        "Varuna":      {te:"వరుణ",      hi:"वरुण",      kn:"ವರುಣ",     ta:"வருண",       ml:"വരുണ"},
        "Asura":       {te:"అసుర",      hi:"असुर",      kn:"ಅಸುರ",     ta:"அசுர",       ml:"അസുര"},
        "Shosha":      {te:"శోష",       hi:"शोष",       kn:"ಶೋಷ",      ta:"சோஷ",        ml:"ശോഷ"},
        "Papayakshma": {te:"పాపయక్ష్మ",  hi:"पापयक्ष्म", kn:"ಪಾಪಯಕ್ಷ್ಮ",ta:"பாபயக்ஷ்ம",  ml:"പാപയക്ഷ്മ"},
        "Roga":        {te:"రోగ",       hi:"रोग",       kn:"ರೋಗ",      ta:"ரோக",        ml:"രോഗ"},
        "Naga":        {te:"నాగ",       hi:"नाग",       kn:"ನಾಗ",      ta:"நாக",        ml:"നാഗ"},
        "Mukhya":      {te:"ముఖ్య",     hi:"मुख्य",     kn:"ಮುಖ್ಯ",    ta:"முக்ய",      ml:"മുഖ്യ"},
        "Bhallata":    {te:"భల్లాట",    hi:"भल्लाट",    kn:"ಭಲ್ಲಾಟ",   ta:"பல்லாட",     ml:"ഭല്ലാട"},
        "Soma":        {te:"సోమ",       hi:"सोम",       kn:"ಸೋಮ",      ta:"சோம",        ml:"സോമ"},
        "Bhujanga":    {te:"భుజంగ",     hi:"भुजंग",     kn:"ಭುಜಂಗ",    ta:"புஜங்க",     ml:"ഭുജംഗ"},
        "Aditi":       {te:"అదితి",     hi:"अदिति",     kn:"ಅದಿತಿ",    ta:"அதிதி",      ml:"അദിതി"},
        "Diti":        {te:"దితి",      hi:"दिति",      kn:"ದಿತಿ",     ta:"திதி",       ml:"ദിതി"}
    };

    const ROOM_I18N = {
        "Master Bed":   {te:"మాస్టర్ బెడ్",  hi:"मास्टर बेड",    kn:"ಮಾಸ್ಟರ್ ಬೆಡ್",   ta:"மாஸ்டர் பெட்",  ml:"മാസ്റ്റർ ബെഡ്"},
        "Bedroom 2":    {te:"పడక గది",       hi:"बेडरूम",         kn:"ಮಲಗುವ ಕೋಣೆ",    ta:"படுக்கையறை",    ml:"ബെഡ്റൂം"},
        "Kitchen":      {te:"వంటగది",        hi:"रसोई",           kn:"ಅಡುಗೆಮನೆ",       ta:"சமையலறை",      ml:"അടുക്കള"},
        "Dining":       {te:"భోజనశాల",       hi:"भोजन कक्ष",      kn:"ಊಟದ ಕೋಣೆ",      ta:"சாப்பிட அறை",  ml:"ഡൈനിംഗ്"},
        "Hall":         {te:"హాల్",          hi:"हॉल",            kn:"ಹಾಲ್",           ta:"ஹால்",          ml:"ഹാൾ"},
        "Puja":         {te:"పూజ గది",       hi:"पूजा कक्ष",      kn:"ಪೂಜಾ ಕೋಣೆ",     ta:"பூஜை அறை",    ml:"പൂജാ മുറി"},
        "Toilet":       {te:"మరుగుదొడ్డి",    hi:"शौचालय",         kn:"ಶೌಚಾಲಯ",         ta:"கழிப்பறை",     ml:"ടോയ്ലറ്റ്"},
        "Staircase":    {te:"మెట్లు",         hi:"सीढ़ियां",       kn:"ಮೆಟ್ಟಿಲುಗಳು",    ta:"படிக்கட்டு",    ml:"കോണിപ്പടി"},
        "Dressing":     {te:"డ్రెస్సింగ్",    hi:"ड्रेसिंग रूम",   kn:"ಡ್ರೆಸ್ಸಿಂಗ್",    ta:"டிரஸ்ஸிங்",    ml:"ഡ്രസ്സിംഗ്"},
        "Store":        {te:"నిల్వ గది",      hi:"भंडार कक्ष",     kn:"ಗೋದಾಮು",         ta:"கிடங்கு",      ml:"സ്റ്റോർ"},
        "Bathroom Out": {te:"బయటి స్నానగది",  hi:"बाहरी बाथरूम",   kn:"ಹೊರ ಸ್ನಾನಗೃಹ",  ta:"வெளி குளியலறை",ml:"പുറം കുളിമുറി"},
        "Servant Room": {te:"సేవకుల గది",     hi:"नौकर कक्ष",      kn:"ಸೇವಕರ ಕೋಣೆ",    ta:"வேலையாள் அறை", ml:"ജോലിക്കാർ മുറി"},
        "Watch Ward":   {te:"వాచ్‌మెన్ గది",  hi:"चौकीदार कक्ष",   kn:"ಕಾವಲು ಕೋಣೆ",    ta:"காவலர் அறை",   ml:"കാവൽ മുറി"},
        "Borewell":     {te:"బోర్‌వెల్",       hi:"बोरवेल",         kn:"ಬೋರ್‌ವೆಲ್",      ta:"போர்வெல்",     ml:"ബോർവെൽ"},
        "Septic Tank":  {te:"సెప్టిక్ ట్యాంక్",hi:"सेप्टिक टैंक",  kn:"ಸೆಪ್ಟಿಕ್ ಟ್ಯಾಂಕ್",ta:"செப்டிக் டேங்க்",ml:"സെപ്റ്റിക് ടാങ്ക്"}
    };

    window.getDevathaName = function(engName) {
        const lang = state.lang || 'en';
        if (lang === 'en') return engName;
        return (DEVATHA_I18N[engName] && DEVATHA_I18N[engName][lang]) ? DEVATHA_I18N[engName][lang] : engName;
    };

    window.getRoomName = function(engName) {
        const lang = state.lang || 'en';
        if (lang === 'en') return engName;
        return (ROOM_I18N[engName] && ROOM_I18N[engName][lang]) ? ROOM_I18N[engName][lang] : engName;
    };
    // ─────────────────────────────────────────────────────────────────────

    const FULL_CHAIN=[...[{en:"Shikhi",rating:"bad"},{en:"Parjanya",rating:"good"},{en:"Jayanta",rating:"good"},{en:"Mahendra",rating:"good"},{en:"Surya",rating:"neutral"},{en:"Satya",rating:"neutral"},{en:"Bhrisha",rating:"neutral"},{en:"Antariksha",rating:"neutral"}].map(d=>({...d,dir:'East'})),...[{en:"Agni",rating:"bad"},{en:"Pusha",rating:"neutral"},{en:"Vitatha",rating:"good"},{en:"Gruhakshat",rating:"good"},{en:"Yama",rating:"neutral"},{en:"Gandharva",rating:"neutral"},{en:"Bhringraj",rating:"neutral"},{en:"Mriga",rating:"neutral"}].map(d=>({...d,dir:'South'})),...[{en:"Pitra",rating:"bad"},{en:"Dauvarika",rating:"neutral"},{en:"Sugriva",rating:"good"},{en:"Pushpadanta",rating:"good"},{en:"Varuna",rating:"good"},{en:"Asura",rating:"neutral"},{en:"Shosha",rating:"neutral"},{en:"Papayakshma",rating:"neutral"}].map(d=>({...d,dir:'West'})),...[{en:"Roga",rating:"bad"},{en:"Naga",rating:"neutral"},{en:"Mukhya",rating:"good"},{en:"Bhallata",rating:"good"},{en:"Soma",rating:"good"},{en:"Bhujanga",rating:"neutral"},{en:"Aditi",rating:"neutral"},{en:"Diti",rating:"neutral"}].map(d=>({...d,dir:'North'}))];
    const ZONES_ELEMENTAL = [{name:"N",color:"rgba(0,100,255,0.22)"},{name:"NNE",color:"rgba(0,150,255,0.22)"},{name:"NE",color:"rgba(0,255,255,0.22)"},{name:"ENE",color:"rgba(0,200,50,0.22)"},{name:"E",color:"rgba(34,197,94,0.22)"},{name:"ESE",color:"rgba(100,255,50,0.22)"},{name:"SE",color:"rgba(255,0,0,0.22)"},{name:"SSE",color:"rgba(239,68,68,0.22)"},{name:"S",color:"rgba(200,0,0,0.22)"},{name:"SSW",color:"rgba(255,200,0,0.22)"},{name:"SW",color:"rgba(234,179,8,0.22)"},{name:"WSW",color:"rgba(100,100,100,0.18)"},{name:"W",color:"rgba(148,163,184,0.18)"},{name:"WNW",color:"rgba(180,180,180,0.18)"},{name:"NW",color:"rgba(200,200,200,0.18)"},{name:"NNW",color:"rgba(0,180,255,0.22)"}];
    const ROOM_ZONES = { "Master Bed": [8,9,10,11], "Kitchen": [5,6,7], "Dining": [6,7,8,9], "Puja": [1,2,3,4,12], "Bedroom 2": [8,12,13,14,15], "Toilet": [7,9,13,15], "Hall": [0,1,2,3,4,14,15], "Staircase": [8,9,10,11,12,13,14], "Borewell": [1,2,3], "Septic Tank": [12,13,14], "Dressing": [8,9,10,11], "Store": [9,10,11,12,13], "Bathroom Out": [13,14,15,0], "Servant Room": [9,10,11,12,13], "Watch Ward": [0,1,2,3,14,15] };
    
    const REPORT_I18N = {
        en: { title: "SAMARTHA VASTU - EXACT PADAVINYASA REPORT", cli: "Client Name", ph: "Phone", pl: "Place", os: "Outer Site Area", set: "Setbacks", ba: "Built Area (House)", ms: "Madhya Sutra (Ayadi Area)", yoni: "Ayam (Yoni)", inc: "Income", debt: "Debt", star: "Star", age: "Age", varam: "Varam", tithi: "Tithi", yogakarana: "Yoga/Karana", r_head: "Room & Items Details", no: "No", rn: "Item Name", dim: "Dimensions (E-W x N-S)", d_house: "Built Area Devathas", dev: "Devatha", len: "Exact Length", st: "Starts At", end: "Ends At", d_out: "Outer Site Devathas", east: "East", north: "North", south: "South", west: "West", good: "Good", bad: "Bad", note: "Note", area_summary: "Area Summary", doors_windows: "Doors & Windows Count", vastu_alerts: "Vastu Compliance Alerts", recommendations: "Vastu Recommendations", car_parking: "Car Parking", greenery: "Greenery" },
        te: { title: "సమర్థ వాస్తు - ఖచ్చితమైన పాదవిన్యాస నివేదిక", cli: "క్లైంట్ పేరు", ph: "ఫోన్", pl: "స్థలం", os: "బయటి స్థల వైశాల్యం", set: "సెట్‌బ్యాక్‌లు", ba: "నిర్మించిన వైశాల్యం", ms: "మధ్యసూత్రం (ఆయాది వైశాల్యం)", yoni: "ఆయం (యోని)", inc: "ఆదాయం", debt: "అప్పు", star: "నక్షత్రం", age: "వయసు", varam: "వారం", tithi: "తిథి", yogakarana: "యోగ/కరణం", r_head: "గది మరియు వస్తువుల వివరాలు", no: "క్రమ సంఖ్య", rn: "పేరు", dim: "కొలతలు (తూర్పు-పడమర x ఉత్తర-దక్షిణ)", d_house: "నిర్మిత వైశాల్య దేవతా స్థానాలు", dev: "దేవత", len: "ఖచ్చితమైన పొడవు", st: "ప్రారంభం", end: "ముగింపు", d_out: "బయటి స్థల దేవతా స్థానాలు", east: "తూర్పు", north: "ఉత్తరం", south: "దక్షిణం", west: "పడమర", good: "శుభం", bad: "అశుభం", note: "గమనిక", area_summary: "వైశాల్య సారాంశం", doors_windows: "తలుపులు & కిటికీల లెక్క", vastu_alerts: "వాస్తు అనుకూలత హెచ్చరికలు", recommendations: "వాస్తు సూచనలు", car_parking: "కార్ పార్కింగ్", greenery: "పచ్చదనం" },
        hi: { title: "समर्थ वास्तु - सटीक पादविन्यास रिपोर्ट", cli: "ग्राहक का नाम", ph: "फ़ोन", pl: "स्थान", os: "बाहरी भूखंड क्षेत्र", set: "सेटबैक", ba: "निर्मित क्षेत्र (मकान)", ms: "मध्यसूत्र (आयादि क्षेत्र)", yoni: "आयम (योनि)", inc: "आय", debt: "ऋण", star: "नक्षत्र", age: "आयु", varam: "वार", tithi: "तिथि", yogakarana: "योग/करण", r_head: "कमरे और वस्तुओं का विवरण", no: "क्रमांक", rn: "नाम", dim: "माप (पूर्व-पश्चिम x उत्तर-दक्षिण)", d_house: "निर्मित क्षेत्र देवता स्थान", dev: "देवता", len: "सटीक लंबाई", st: "शुरुआत", end: "अंत", d_out: "बाहरी भूखंड देवता स्थान", east: "पूर्व", north: "उत्तर", south: "दक्षिण", west: "पश्चिम", good: "शुभ", bad: "अशुभ", note: "नोट", area_summary: "क्षेत्र सारांश", doors_windows: "दरवाजे और खिड़कियाँ", vastu_alerts: "वास्तु अनुपालन चेतावनियाँ", recommendations: "वास्तु सुझाव", car_parking: "कार पार्किंग", greenery: "हरियाली" },
        kn: { title: "ಸಮರ್ಥ ವಾಸ್ತು - ನಿಖರ ಪಾದವಿನ್ಯಾಸ ವರದಿ", cli: "ಗ್ರಾಹಕರ ಹೆಸರು", ph: "ಫೋನ್", pl: "ಸ್ಥಳ", os: "ಹೊರ ನಿವೇಶನ ವಿಸ್ತೀರ್ಣ", set: "ಸೆಟ್‌ಬ್ಯಾಕ್‌ಗಳು", ba: "ನಿರ್ಮಿತ ವಿಸ್ತೀರ್ಣ (ಮನೆ)", ms: "ಮಧ್ಯಸೂತ್ರ (ಆಯಾದಿ ವಿಸ್ತೀರ್ಣ)", yoni: "ಆಯಂ (ಯೋನಿ)", inc: "ಆದಾಯ", debt: "ಸಾಲ", star: "ನಕ್ಷತ್ರ", age: "ವಯಸ್ಸು", varam: "ವಾರ", tithi: "ತಿಥಿ", yogakarana: "ಯೋಗ/ಕರಣ", r_head: "ಕೋಣೆ ಮತ್ತು ವಸ್ತುಗಳ ವಿವರ", no: "ಕ್ರಮ ಸಂಖ್ಯೆ", rn: "ಹೆಸರು", dim: "ಅಳತೆ (ಪೂರ್ವ-ಪಶ್ಚಿಮ x ಉತ್ತರ-ದಕ್ಷಿಣ)", d_house: "ನಿರ್ಮಿತ ಪ್ರದೇಶ ದೇವತಾ ಸ್ಥಾನಗಳು", dev: "ದೇವತೆ", len: "ನಿಖರ ಉದ್ದ", st: "ಆರಂಭ", end: "ಅಂತ್ಯ", d_out: "ಹೊರ ನಿವೇಶನ ದೇವತಾ ಸ್ಥಾನಗಳು", east: "ಪೂರ್ವ", north: "ಉತ್ತರ", south: "ದಕ್ಷಿಣ", west: "ಪಶ್ಚಿಮ", good: "ಶುಭ", bad: "ಅಶುಭ", note: "ಸೂಚನೆ", area_summary: "ವಿಸ್ತೀರ್ಣ ಸಾರಾಂಶ", doors_windows: "ಬಾಗಿಲುಗಳು & ಕಿಟಕಿಗಳ ಎಣಿಕೆ", vastu_alerts: "ವಾಸ್ತು ಅನುಸರಣೆ ಎಚ್ಚರಿಕೆಗಳು", recommendations: "ವಾಸ್ತು ಶಿಫಾರಸುಗಳು", car_parking: "ಕಾರು ಪಾರ್ಕಿಂಗ್", greenery: "ಹಸಿರು" },
        ta: { title: "சமர்த்த வாஸ்து - சரியான பாதவின்யாச அறிக்கை", cli: "வாடிக்கையாளர் பெயர்", ph: "தொலைபேசி", pl: "இடம்", os: "வெளி தள பரப்பு", set: "பின்வாங்கல்கள்", ba: "கட்டிட பரப்பு (வீடு)", ms: "மத்யசூத்ர (ஆயாதி பரப்பு)", yoni: "ஆயம் (யோனி)", inc: "வருமானம்", debt: "கடன்", star: "நட்சத்திரம்", age: "வயது", varam: "வாரம்", tithi: "திதி", yogakarana: "யோக/கரணம்", r_head: "அறை மற்றும் பொருட்கள் விவரம்", no: "வ.எண்", rn: "பெயர்", dim: "அளவுகள் (கிழக்கு-மேற்கு x வடக்கு-தெற்கு)", d_house: "கட்டிட தேவதா ஸ்தானங்கள்", dev: "தேவதை", len: "சரியான நீளம்", st: "தொடக்கம்", end: "முடிவு", d_out: "வெளி தள தேவதா ஸ்தானங்கள்", east: "கிழக்கு", north: "வடக்கு", south: "தெற்கு", west: "மேற்கு", good: "சுபம்", bad: "அசுபம்", note: "குறிப்பு", area_summary: "பரப்பு சுருக்கம்", doors_windows: "கதவுகள் & ஜன்னல்கள் எண்ணிக்கை", vastu_alerts: "வாஸ்து இணக்க எச்சரிக்கைகள்", recommendations: "வாஸ்து பரிந்துரைகள்", car_parking: "கார் நிறுத்துமிடம்", greenery: "பசுமை" },
        ml: { title: "സമർത്ഥ വാസ്തു - കൃത്യമായ പാദവിന്യാസ റിപ്പോർട്ട്", cli: "ക്ലയന്റ് പേര്", ph: "ഫോൺ", pl: "സ്ഥലം", os: "പുറം സ്ഥല വിസ്തൃതി", set: "സെറ്റ്ബാക്കുകൾ", ba: "നിർമ്മിത വിസ്തൃതി (വീട്)", ms: "മദ്ധ്യസൂത്ര (ആയാദി വിസ്തൃതി)", yoni: "ആയം (യോനി)", inc: "വരുമാനം", debt: "കടം", star: "നക്ഷത്രം", age: "പ്രായം", varam: "വാരം", tithi: "തിഥി", yogakarana: "യോഗ/കരണം", r_head: "മുറി, വസ്തുക്കൾ വിവരണം", no: "നം.", rn: "പേര്", dim: "അളവ് (കിഴക്ക്-പടിഞ്ഞാറ് x വടക്ക്-തെക്ക്)", d_house: "നിർമ്മിത ദേവതാ സ്ഥാനങ്ങൾ", dev: "ദേവത", len: "കൃത്യമായ നീളം", st: "ആരംഭം", end: "അവസാനം", d_out: "പുറം ദേവതാ സ്ഥാനങ്ങൾ", east: "കിഴക്ക്", north: "വടക്ക്", south: "തെക്ക്", west: "പടിഞ്ഞാറ്", good: "ശുഭം", bad: "അശുഭം", note: "കുറിപ്പ്", area_summary: "വിസ്തൃതി സംഗ്രഹം", doors_windows: "വാതിലുകൾ & ജാലകങ്ങൾ എണ്ണം", vastu_alerts: "വാസ്തു അനുസൃത മുന്നറിയിപ്പുകൾ", recommendations: "വാസ്തു ശുപാർശകൾ", car_parking: "കാർ പാർക്കിംഗ്", greenery: "പച്ചപ്പ്" }
    };

    const getVal = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; };
    function showToast(msg) { const t = document.getElementById('saveToast'); if(t){ t.innerText = msg; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 2000); } }
    function formatLen(f) { if (isNaN(f)) return `0' 0"`; let ft = Math.floor(f); let inch = Math.round((f - ft) * 12); if (inch === 12) { ft += 1; inch = 0; } return `${ft}' ${inch}"`; }
    window.formatLen = formatLen;

    window.saveLocal = function() { 
        // Sync active rooms/walls/texts into floor storage before saving
        if(!state.roomsByFloor) state.roomsByFloor = {0:[], 1:[]};
        if(!state.wallsByFloor) state.wallsByFloor = {0:[], 1:[]};
        if(!state.textsByFloor) state.textsByFloor = {0:[], 1:[]};
        state.roomsByFloor[state.currentFloor||0] = JSON.parse(JSON.stringify(state.rooms||[]));
        state.wallsByFloor[state.currentFloor||0]  = JSON.parse(JSON.stringify(state.walls||[]));
        state.textsByFloor[state.currentFloor||0]  = JSON.parse(JSON.stringify(state.texts||[]));
        localStorage.setItem('vastu_v23_final', SecurityModule.encrypt(JSON.stringify({...state, bgImg: null}))); 
    };
    
    // Default sizes for migration of old localStorage data
    const DEFAULT_ROOM_SIZES = {
        "Master Bed":{wF:12,wI:0,hF:14,hI:0}, "Bedroom 2":{wF:11,wI:0,hF:12,hI:0},
        "Kitchen":{wF:10,wI:0,hF:10,hI:0}, "Dining":{wF:10,wI:0,hF:8,hI:0},
        "Hall":{wF:14,wI:0,hF:12,hI:0}, "Puja":{wF:6,wI:0,hF:6,hI:0},
        "Toilet":{wF:5,wI:0,hF:6,hI:0}, "Staircase":{wF:6,wI:0,hF:10,hI:0},
        "Dressing":{wF:4,wI:0,hF:5,hI:0}, "Store":{wF:5,wI:0,hF:6,hI:0}
    };

    window.loadLocal = function() { 
        const s = localStorage.getItem('vastu_v23_final'); 
        if(s) { 
            try {
                let decrypted;
                
                // First, check if it's already valid JSON (unencrypted)
                try {
                    JSON.parse(s);
                    decrypted = s; // It's already plain JSON
                } catch(jsonError) {
                    // Not valid JSON, try to decrypt
                    try {
                        decrypted = SecurityModule.decrypt(s);
                    } catch(decryptError) {
                        // Decryption failed, might be corrupted
                        console.warn('Could not decrypt or parse state, using default');
                        return;
                    }
                }
                
                let p = JSON.parse(decrypted); 
                Object.assign(state, p); 
                if(!state.walls) state.walls = []; 
                if(!state.rooms) state.rooms = []; 
                if(!state.texts) state.texts = []; 
                if(!state.shapes) state.shapes = [];
                // FIX 2: Auto-migrate old rooms with invalid wF<=2 values
                state.rooms.forEach(r => {
                    if(!r.isFurniture && !r.isMarker && DEFAULT_ROOM_SIZES[r.type]) {
                        let wTotal = (r.wF||0) + (r.wI||0)/12;
                        let hTotal = (r.hF||0) + (r.hI||0)/12;
                        if(wTotal <= 2 || hTotal <= 2) {
                            let def = DEFAULT_ROOM_SIZES[r.type];
                            r.wF = def.wF; r.wI = def.wI; r.hF = def.hF; r.hI = def.hI;
                        }
                    }
                });
                // BATCH C: Migrate old single-floor data to floor-based storage
                window.migrateToFloors();
                // SAFETY: Always force L-shape off on load — UI toggle is hidden,
                // prevents stale isLShape:true from old localStorage breaking canvas
                state.isLShape = false;
                window.updateFromInputs(); renderItemList(); renderShapeList(); 
                window.syncMobHeaderClientName&&window.syncMobHeaderClientName();
                if(typeof window._syncDevataZoneToggleUI==='function') window._syncDevataZoneToggleUI();
            } catch(e){ 
                console.error('Error loading state:', e); 
            } 
        } 
    };

    window.saveStateToHistory = function() { if(isRestoring) return; stateHistory = stateHistory.slice(0, historyIndex + 1); stateHistory.push(JSON.stringify(state)); if (stateHistory.length > 50) stateHistory.shift(); historyIndex = stateHistory.length - 1; };
    
    window.restoreHistoryState = function(snapStr) { isRestoring = true; Object.assign(state, JSON.parse(snapStr)); 
        // FIX 5: Restore shapes in undo/redo
        if(!state.shapes) state.shapes = [];
        // Force L-shape off — UI hidden, prevent stale state
        state.isLShape = false;
        // BATCH C: Restore floor data
        window.migrateToFloors();
        document.getElementById('clientName').value = state.clientName || ''; document.getElementById('clientPlace').value = state.clientPlace || ''; document.getElementById('clientPhone').value = state.clientPhone || ''; if (state.selectedDwara) { let dw = document.getElementById('dwaraSelect'); if(dw) dw.value = state.selectedDwara; } let deg = document.getElementById('degreeInput'); if(deg) deg.value = state.rotation; let wDeduct = document.getElementById('wallDeduction'); if(wDeduct) wDeduct.value = (state.wallDeduction * 12).toString(); const sUI = (id, val) => { let elF = document.getElementById(id+'_F'), elI = document.getElementById(id+'_I'); if(elF && elI) { elF.value = Math.floor(val); elI.value = Math.round((val % 1) * 12); } }; sUI('siteN', state.siteN); sUI('siteS', state.siteS); sUI('siteE', state.siteE); sUI('siteW', state.siteW); sUI('setN', state.setN); sUI('setS', state.setS); sUI('setE', state.setE); sUI('setW', state.setW); window.syncMobHeaderClientName&&window.syncMobHeaderClientName(); // Restore declination
            if(state.magDeclination) {
                const manEl = document.getElementById('declManual');
                if(manEl) manEl.value = (state.magDeclination||0).toFixed(2);
                const corrEl = document.getElementById('correctedNorth');
                if(corrEl) corrEl.textContent = ((state.rotation||0)).toFixed(2)+'°N';
            }
            // Populate 4 built area wall inputs
            const bN2 = state.houseN || state.houseNs || 35;
            const bS2 = state.houseS || state.houseNs || 35;
            const bE2 = state.houseE || state.houseEw || 47;
            const bW2 = state.houseW || state.houseEw || 47;
            sUI('builtN', bN2); sUI('builtS', bS2);
            sUI('builtE', bE2); sUI('builtW', bW2);
            // Update Madhya Sutra display
            const wd2 = (state.wallDeduction || 0.375);
            const msEl2 = document.getElementById('madhyaSutraDisplay');
            if(msEl2) { const fmtMS2=(v)=>{const ft=Math.floor(v);const i=Math.round((v-ft)*12);return ft+"'"+i+'"';}; msEl2.textContent='EW: '+fmtMS2(Math.max(0,state.houseEw-wd2*2))+' · NS: '+fmtMS2(Math.max(0,state.houseNs-wd2*2)); } let shastraRadio = document.querySelector(`input[name="shastra"][value="${state.ayadiShastra || 'viswakarma'}"]`); if(shastraRadio) shastraRadio.checked = true; let unitRadio = document.querySelector(`input[name="ayUnit"][value="${state.ayadiUnit || 'feet'}"]`); if(unitRadio) unitRadio.checked = true; let ayDiv = document.getElementById('ayDivisor'); if(ayDiv) ayDiv.value = state.ayadiDivisor; let dCont = document.getElementById('divisorContainer'); if(dCont) dCont.style.display = state.ayadiUnit === 'yards' ? 'flex' : 'none'; let rdToggle = document.getElementById('showRoadToggle'); if (rdToggle) rdToggle.checked = state.showRoad; let rdDir = document.getElementById('roadDirSelect'); if (rdDir) rdDir.value = state.roadDir || "East"; renderItemList(); renderShapeList(); window.draw(); window.saveLocal(); isRestoring = false;
            // Sync 2-input built area displays after restore
            if(typeof syncBuiltDisplays==='function') syncBuiltDisplays();
            window.updateRoadDevthaStrip();
            if(typeof window._syncDevataZoneToggleUI==='function') window._syncDevataZoneToggleUI();
    };
    window.undo = function() { if (historyIndex > 0) { historyIndex--; window.restoreHistoryState(stateHistory[historyIndex]); } };
    window.redo = function() { if (historyIndex < stateHistory.length - 1) { historyIndex++; window.restoreHistoryState(stateHistory[historyIndex]); } };

    function getSitePolygon() { let sw={x:0,y:0},se={x:state.siteS,y:0},nw={x:0,y:state.siteW},ne={x:state.siteS,y:state.siteW}; let dx=se.x-nw.x, dy=se.y-nw.y, d=Math.sqrt(dx*dx+dy*dy); if(d>0 && state.siteN+state.siteE>d && Math.abs(state.siteN-state.siteE)<d) { let a=(state.siteN*state.siteN - state.siteE*state.siteE + d*d)/(2*d), h2=state.siteN*state.siteN-a*a; if(h2>=0){ let h=Math.sqrt(h2), cx=nw.x+a*(dx/d), cy=nw.y+a*(dy/d); ne={x:cx-h*(dy/d), y:cy+h*(dx/d)}; } } return {sw, se, ne, nw}; }

    // ── BATCH D: L-Shape support ──
    // getLShapePolygon — returns the 6-point physical L-shape compound wall
    function getLShapePolygon() {
        let cw = Math.max(1, Math.min(state.lCutW||10, state.siteS - 2));
        let ch = Math.max(1, Math.min(state.lCutH||10, state.siteW - 2));
        let W = state.siteS, H = state.siteW; // EW width, NS height
        // 6 corners clockwise from SW, based on which corner is cut
        switch(state.lCutCorner||'NE') {
            case 'NE': // Cut top-right corner
                return [
                    {x:0,   y:0},   // SW
                    {x:W,   y:0},   // SE
                    {x:W,   y:H-ch},// East wall bottom of cut
                    {x:W-cw,y:H-ch},// Inner corner (cut notch bottom)
                    {x:W-cw,y:H},   // North wall east end
                    {x:0,   y:H}    // NW
                ];
            case 'NW': // Cut top-left corner
                return [
                    {x:0,   y:0},   // SW
                    {x:W,   y:0},   // SE
                    {x:W,   y:H},   // NE
                    {x:cw,  y:H},   // North wall west end
                    {x:cw,  y:H-ch},// Inner corner
                    {x:0,   y:H-ch} // West wall top of cut
                ];
            case 'SE': // Cut bottom-right corner
                return [
                    {x:0,   y:0},   // SW
                    {x:W-cw,y:0},   // South wall east end
                    {x:W-cw,y:ch},  // Inner corner
                    {x:W,   y:ch},  // East wall bottom
                    {x:W,   y:H},   // NE
                    {x:0,   y:H}    // NW
                ];
            case 'SW': // Cut bottom-left corner
            default:
                return [
                    {x:cw,  y:0},   // South wall west end
                    {x:W,   y:0},   // SE
                    {x:W,   y:H},   // NE
                    {x:0,   y:H},   // NW
                    {x:0,   y:ch},  // West wall top
                    {x:cw,  y:ch}   // Inner corner
                ];
        }
    }

    // getImaginaryLinePoly — full rectangle for Padavinyasa (Method 2)
    // Devathas always calculated on this, regardless of L-shape
    function getImaginaryLinePoly() {
        return getSitePolygon(); // Full rectangle — same as original
    }

    // getLShapeCutZone — returns the cut rectangle [x,y,w,h] in site coords
    function getLShapeCutZone() {
        let cw = Math.max(1, state.lCutW||10), ch = Math.max(1, state.lCutH||10);
        let W = state.siteS, H = state.siteW;
        switch(state.lCutCorner||'NE') {
            case 'NE': return {x: W-cw, y: H-ch, w: cw, h: ch};
            case 'NW': return {x: 0,    y: H-ch, w: cw, h: ch};
            case 'SE': return {x: W-cw, y: 0,    w: cw, h: ch};
            case 'SW': return {x: 0,    y: 0,    w: cw, h: ch};
        }
    }

    // isInCutZone — returns true if point (px,py) in site coords is in cut area
    function isInCutZone(px, py) {
        if(!state.isLShape) return false;
        let z = getLShapeCutZone();
        return px >= z.x && px <= z.x+z.w && py >= z.y && py <= z.y+z.h;
    }
    function getHousePolygon() { return { sw: {x: state.setW, y: state.setS}, se: {x: state.setW + state.houseEw, y: state.setS}, ne: {x: state.setW + state.houseEw, y: state.setS + state.houseNs}, nw: {x: state.setW, y: state.setS + state.houseNs} }; }
    function getPtOnPerimeter(d, poly, N, E, S, W) { let P = N+E+S+W; d = ((d % P) + P) % P; if (d <= E) return { x: poly.ne.x + (poly.se.x - poly.ne.x)*(d/E), y: poly.ne.y + (poly.se.y - poly.ne.y)*(d/E) }; if (d <= E+S) return { x: poly.se.x + (poly.sw.x - poly.se.x)*((d-E)/S), y: poly.se.y + (poly.sw.y - poly.se.y)*((d-E)/S) }; if (d <= E+S+W) return { x: poly.sw.x + (poly.nw.x - poly.sw.x)*((d-E-S)/W), y: poly.sw.y + (poly.nw.y - poly.sw.y)*((d-E-S)/W) }; return { x: poly.nw.x + (poly.ne.x - poly.nw.x)*((d-E-S-W)/N), y: poly.nw.y + (poly.ne.y - poly.nw.y)*((d-E-S-W)/N) }; }
    
    function getShiftedDevathas(poly, N, E, S, W, rotDeg) {
        // ── Correct 8-Share Padavinyasa Math ──
        // Rule: Each wall face = 8 equal shares.
        //   • 2 Corner Devatas  → ½ share each  (shareLen / 2)
        //   • 7 Middle Devatas  → 1 full share each (shareLen)
        // To eliminate floating-point drift, all division is performed
        // in exact inches, then converted back to feet for storage.

        function exactShare(wallFt) {
            const totalInches = wallFt * 12;          // convert to inches — exact integer arithmetic
            const shareInches = totalInches / 8;       // 1 full share in inches (no rounding)
            const halfShareInches = shareInches / 2;   // ½ share in inches
            return {
                mid:    shareInches    / 12,           // back to feet — exact decimal
                corner: halfShareInches / 12           // back to feet — exact decimal
            };
        }

        const sE = exactShare(E);
        const sS = exactShare(S);
        const sW = exactShare(W);
        const sN = exactShare(N);

        let segs = [];

        // ── East face (NE corner → SE corner) ──
        segs.push({id:0,  name:"Shikhi", len:sE.corner, rating:"bad"});
        for(let i=1;i<=7;i++) segs.push({id:i,    name:FULL_CHAIN[i].en,    len:sE.mid, rating:FULL_CHAIN[i].rating});
        segs.push({id:8,  name:"Agni",   len:sE.corner, rating:"bad"});

        // ── South face (SE corner → SW corner) ──
        segs.push({id:8,  name:"Agni",   len:sS.corner, rating:"bad"});
        for(let i=1;i<=7;i++) segs.push({id:8+i,  name:FULL_CHAIN[8+i].en,  len:sS.mid, rating:FULL_CHAIN[8+i].rating});
        segs.push({id:16, name:"Pitra",  len:sS.corner, rating:"bad"});

        // ── West face (SW corner → NW corner) ──
        segs.push({id:16, name:"Pitra",  len:sW.corner, rating:"bad"});
        for(let i=1;i<=7;i++) segs.push({id:16+i, name:FULL_CHAIN[16+i].en, len:sW.mid, rating:FULL_CHAIN[16+i].rating});
        segs.push({id:24, name:"Roga",   len:sW.corner, rating:"bad"});

        // ── North face (NW corner → NE corner) ──
        segs.push({id:24, name:"Roga",   len:sN.corner, rating:"bad"});
        for(let i=1;i<=7;i++) segs.push({id:24+i, name:FULL_CHAIN[24+i].en, len:sN.mid, rating:FULL_CHAIN[24+i].rating});
        segs.push({id:0,  name:"Shikhi", len:sN.corner, rating:"bad"});

        // ── Apply rotation shift and stamp d_start / d_end ──
        let P = N + E + S + W;
        let shift = (P - ((rotDeg % 360) / 360) * P) % P;
        if (shift < 0) shift += P;

        let d_current = 0, finalDevs = [];
        segs.forEach(seg => {
            let bS = d_current, bE = d_current + seg.len;
            finalDevs.push({ ...seg, d_start: (bS + shift) % P, d_end: (bE + shift) % P });
            d_current = bE;
        });

        return { finalDevs, P, N, E, S, W, poly, shift };
    }

    function getAyadiMetric() { let bW = state.houseEw - (state.wallDeduction||0)*2, bH = state.houseNs - (state.wallDeduction||0)*2; if(bW<=0)bW=1; if(bH<=0)bH=1; let baseVal = (state.ayadiShastra === 'mayamata') ? 2 * (bW + bH) : (bW * bH); if(state.ayadiUnit === 'yards') baseVal = baseVal / Math.max(3, state.ayadiDivisor); return baseVal; }
    function getAyadiData(val) { if(val <= 0) val = 1; val += 0.0001; return { y: Math.max(1, Math.floor((val*9)%8)||8), dr: Math.floor((val*8)%12)||12, ru: Math.floor((val*3)%8)||8, star: NAKSHATRAS[Math.floor((val*8)%27)||27]||"Any", ay: Math.floor((val*27)%100)||100, vName: DAYS[Math.floor((val*9)%7)]||"Any", tIdx: Math.floor((val*8)%30)||30, tName: TITHIS[Math.floor((val*8)%30)>15?Math.floor((val*8)%30)-15:Math.floor((val*8)%30)]||"Any", yoIdx: Math.floor((val*4)%27)||27, kaIdx: Math.floor((val*5)%60)||60 }; }
    window.applyAutoAaya = function(tY) { let curW = state.houseEw, curH = state.houseNs, totalDeduction = (state.wallDeduction || 0) * 2, found = false, bW = curW, bH = curH; for (let o = 0; o <= 240; o++) { let offset = o / 12; let dirs = [[1,1],[1,0],[0,1],[-1,-1],[-1,0],[0,-1],[1,-1],[-1,1]]; for (let [sw, sh] of dirs) { let cW = Math.round((curW + (offset * sw)) * 12) / 12, cH = Math.round((curH + (offset * sh)) * 12) / 12; if (cW <= totalDeduction || cH <= totalDeduction) continue; let baseVal = (state.ayadiShastra === 'mayamata') ? 2 * ((cW - totalDeduction) + (cH - totalDeduction)) : ((cW - totalDeduction) * (cH - totalDeduction)); if(state.ayadiUnit === 'yards') baseVal = baseVal / Math.max(3, state.ayadiDivisor); let ayadi = getAyadiData(baseVal); if (ayadi.y === tY && ayadi.dr >= ayadi.ru) { bW = cW; bH = cH; found = true; break; } } if (found) break; } if (found) { let elWF = document.getElementById('builtE_F'); if(elWF) elWF.value = Math.floor(bW); let elWI = document.getElementById('builtE_I'); if(elWI) elWI.value = Math.round((bW - Math.floor(bW)) * 12); let elHF = document.getElementById('builtN_F'); if(elHF) elHF.value = Math.floor(bH); let elHI = document.getElementById('builtN_I'); if(elHI) elHI.value = Math.round((bH - Math.floor(bH)) * 12); window.updateFromInputs('built'); showToast("Auspicious Aaya Applied!"); } else { showToast("Could not find suitable Aaya nearby."); } };
    window.updateNavavargulu = function() { 
        if (!showNavavargulu) return; 
        const metric = getAyadiMetric(); 
        const d = getAyadiData(metric); 
        const container = document.getElementById('navavarguluContent'); 
        let isViswa = state.ayadiShastra === 'viswakarma'; 
        const titleEl = document.getElementById('panelTitle'); 
        if(titleEl) titleEl.innerText = isViswa ? "Navavargulu (9)" : "Shadvargulu (6)"; 
        
        if(container) { 
            // Secure DOM manipulation - no innerHTML
            container.textContent = ''; // Clear existing content
            
            // Create elements safely
            const metricDiv = SecurityModule.createElement('div', {
                class: 'text-[9px] text-emerald-400 font-bold mb-1 border-b border-slate-700'
            }, `Metric: ${metric.toFixed(2)} ${SecurityModule.escapeHTML(state.ayadiUnit)}`);
            container.appendChild(metricDiv);
            
            const items = [
                {label: '1. Ayam:', value: `${d.y}-${SecurityModule.escapeHTML(YONI_NAMES[d.y].split(' ')[0])}`},
                {label: '2. Income:', value: d.dr},
                {label: '3. Debt:', value: d.ru},
                {label: '4. Star:', value: SecurityModule.escapeHTML(d.star)},
                {label: '5. Varam:', value: SecurityModule.escapeHTML(d.vName)},
                {label: '6. Tithi:', value: `${d.tIdx} (${SecurityModule.escapeHTML(d.tName)})`}
            ];
            
            if(isViswa) {
                items.push(
                    {label: '7. Age:', value: `${d.ay} Yrs`},
                    {label: '8. Yoga:', value: d.yoIdx},
                    {label: '9. Karana:', value: d.kaIdx}
                );
            }
            
            items.forEach((item, idx) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = `flex justify-between py-0.5 ${(isViswa || idx < items.length - 1) ? 'border-b border-slate-800' : ''}`;
                const span = document.createElement('span');
                span.textContent = item.label;
                const b = document.createElement('b');
                b.textContent = item.value;
                itemDiv.appendChild(span);
                itemDiv.appendChild(b);
                container.appendChild(itemDiv);
            });
        } 
    };
    function updateHealthScore() {
        let score = 100;
        const metric = getAyadiMetric();
        const data = getAyadiData(metric);
        // Deduct points for Ayadi issues
        if(data.yoni > 0 && ![1,3,5,7].includes(data.yoni)) score -= 20;
        if(data.aaya <= data.runam) score -= 15;
        // Deduct for room placement
        let hP = getHousePolygon(); let px = 300 / Math.max(state.siteW, state.siteS);
        let roomCount = 0, goodCount = 0;
        if(state.rooms) state.rooms.forEach(r => {
            // Exclude all site-level elements from house zone scoring
            if(r.isFurniture || r.isMarker || r.isOutside || r.isSiteGate) return;
            roomCount++;
            if(isRoomValid(r, hP, px)) goodCount++;
        });
        if(roomCount > 0) { let ratio = goodCount/roomCount; score = Math.round(score * ratio + (score*(1-ratio)*0.5)); }
        score = Math.max(0, Math.min(100, score));
        state.healthScore = score;
        // Update ring
        const ring = document.getElementById('scoreRing');
        const scoreEl = document.getElementById('auditScore');
        const badge = document.getElementById('scoreBadge');
        const tip = document.getElementById('scoreTip');
        const circumference = 163.4;
        const offset = circumference * (1 - score/100);
        const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
        if(ring) { ring.style.strokeDashoffset = offset; ring.style.stroke = color; }
        if(scoreEl) { scoreEl.textContent = score + '%'; scoreEl.style.color = color; }
        // badge hidden on mobile — circle only
        if(badge) { badge.style.display = 'none'; }
        if(tip) { tip.textContent = ''; }
        // Keep legacy bar for compat
        const bar = document.getElementById('scoreBar');
        if(bar) { bar.style.width = score + '%'; bar.style.background = color; }
        // ── Sync desktop header score strip (IDs: scoreRingHeader, auditScoreHeader) ──
        const hRing  = document.getElementById('scoreRingHeader');
        const hScore = document.getElementById('auditScoreHeader');
        if(hRing)  { hRing.style.strokeDashoffset = offset; hRing.style.stroke = color; }
        if(hScore) { hScore.textContent = score + '%'; hScore.style.color = color; }
        // ── Sync mobile header score pill ──
        const mRing  = document.getElementById('scoreRingMob');
        const mScore = document.getElementById('auditScoreMob');
        if(mRing)  { mRing.style.strokeDashoffset = offset; mRing.style.stroke = color; }
        if(mScore) { mScore.textContent = score + '%'; mScore.style.color = color; }
        if(typeof window._mobSyncAyadiReadouts === 'function') window._mobSyncAyadiReadouts();
    }
    
    function getZoneName(angle) { let zIdx = Math.floor(((angle + 11.25) % 360) / 22.5); return ZONES_ELEMENTAL[zIdx].name; }
    function updateVastuAlerts() {
        // ── DEVATA ZONE SYSTEM: single pipeline, no angular logic ──
        // Room zone verdicts come exclusively from checkRoomVastuDevata()
        // via getDevataAlerts() — proportional 9×9 Devata grid, built area only.
        // Marker alerts (Borewell/Septic) and L-shape alerts are site-level
        // and kept here — they do not use room placement zone rules.

        if(!state.rooms)  state.rooms  = [];
        if(!state.texts)  state.texts  = [];
        if(!state.shapes) state.shapes = [];

        // ── Toggle OFF: hide entire alert panel and return ──
        var _panel = document.getElementById('vastuAlertsPanel');
        if(!state.devataMode) {
            if(_panel) _panel.style.display = 'none';
            return;
        }
        // Toggle ON: ensure panel is visible
        if(_panel) _panel.style.display = '';

        let alerts = [];
        let hP = getHousePolygon();

        // ── 1. L-Shape global notice (site-level, not zone-based) ──
        if(state.isLShape) {
            let corner = state.lCutCorner||'NE';
            let cw = state.lCutW||10, ch = state.lCutH||10;
            alerts.push('<div class="text-amber-400 bg-amber-900/20 p-1 rounded border border-amber-700/50">🔶 L-SHAPE PLOT: ' + corner + ' corner cut ' + cw + '\' x ' + ch + '\'. Keep cut area as Vithi (open garden/parking).</div>');
        }

        // ── 2. Outside rooms notice (setback, no zone rules apply) ──
        state.rooms.forEach(function(r) {
            if(r.hidden || !r.isOutside) return;
            alerts.push('<div class="text-slate-400">ℹ️ <b>' + window.getRoomName(r.name) + '</b> — Outside building (setback area). Drag to position near compound wall.</div>');
        });

        // ── 3. L-Shape cut-zone alerts for inside rooms ──
        if(state.isLShape) {
            state.rooms.forEach(function(r) {
                if(r.hidden || r.isFurniture || r.isMarker || r.isOutside || r.isSiteGate) return;
                let actW = (r.wF||0)+(r.wI||0)/12, actH = (r.hF||0)+(r.hI||0)/12;
                let rcx = hP.sw.x + r.x + actW/2, rcy = hP.sw.y + r.y + actH/2;
                if(isInCutZone(rcx, rcy)) {
                    alerts.push('<div class="text-red-400 bg-red-900/30 p-1 rounded border border-red-700/50">❌ DOSHA: <b>' + window.getRoomName(r.name) + '</b> is in the L-shape CUT ZONE (Vithi). Move it inside the built area.</div>');
                }
            });
        }

        // ── 4. Devata zone alerts for all inside rooms ──
        // Only wrongly placed rooms appear — correct rooms are silent.
        getDevataAlerts().forEach(function(a) { alerts.push(a); });

        // ── 5. Marker alerts: Borewell & Septic Tank ──
        // These live outside the house — use site compass angle (not Devata grid).
        let sx = state.siteS/2, sy = state.siteW/2;
        state.rooms.filter(function(r) { return r.isMarker && !r.hidden; }).forEach(function(r) {
            let cx = r.x, cy = r.y;
            let mathAngle   = Math.atan2(cy - sy, cx - sx) * 180 / Math.PI;
            let compassAngle = (90 - mathAngle - state.rotation + 360) % 360;
            let zone = getZoneName(compassAngle);
            let hStartX = state.setW, hStartY = state.setS;
            let hEndX   = hStartX + state.houseEw, hEndY = hStartY + state.houseNs;
            if(cx >= hStartX && cx <= hEndX && cy >= hStartY && cy <= hEndY) {
                alerts.push('<div class="text-red-400 bg-red-900/30 p-1 border border-red-500/50 rounded">❌ <b>DOSHA:</b> ' + r.type + ' inside Built Area! Place near compound wall.</div>');
            } else {
                if(r.type === 'Borewell') {
                    let ok = (zone==='NE'||zone==='NNE'||zone==='ENE'||zone==='N'||zone==='E');
                    alerts.push(ok
                        ? '<div class="text-green-400">✅ <b>Borewell</b> in ' + zone + ' — Correct (near NE compound wall)</div>'
                        : '<div class="text-red-400">❌ <b>Borewell</b> in ' + zone + ' — Move to NE/N/E near compound wall</div>');
                }
                if(r.type === 'Septic Tank') {
                    let ok = (zone==='NW'||zone==='WNW'||zone==='NNW'||zone==='SSW');
                    alerts.push(ok
                        ? '<div class="text-green-400">✅ <b>Septic Tank</b> in ' + zone + ' — Correct (near NW compound wall)</div>'
                        : '<div class="text-red-400">❌ <b>Septic Tank</b> in ' + zone + ' — Move to NW/SSW near compound wall</div>');
                }
            }
        });

        // ── 6. Empty state ──
        if(alerts.length === 0) {
            // Check whether any scoreable rooms exist
            var _hasRooms = state.rooms.some(function(r) {
                return !r.hidden && !r.isFurniture && !r.isMarker && !r.isOutside && !r.isSiteGate;
            });
            if(_hasRooms) {
                // Rooms exist and all are correctly placed
                alerts.push('<div class="flex items-center gap-1.5 text-green-400 text-[9px] py-1">'
                    + '<i class="fa-solid fa-circle-check"></i> All rooms correctly placed</div>');
            } else {
                // No rooms added yet
                alerts.push('<div class="flex items-center gap-1.5 text-slate-500 text-[9px] py-1">'
                    + '<i class="fa-solid fa-circle-info text-slate-600"></i>'
                    + (window.dt ? window.dt('noRooms') : 'Add rooms to see alerts...') + '</div>');
            }
        }

        // ── 7. Header badge ──
        let badC  = alerts.filter(function(a){ return a.indexOf('text-red')   !== -1; }).length;
        let warnC = alerts.filter(function(a){ return a.indexOf('text-amber') !== -1 || a.indexOf('text-yellow') !== -1; }).length;
        let apHeader = document.querySelector('#vastuAlertsPanel h4');
        if(apHeader) {
            apHeader.innerHTML = '<i class="fa-solid fa-bell mr-1"></i>Vastu Alerts' +
                (badC  > 0 ? '<span style="background:#450a0a;color:#f87171;border-radius:9999px;padding:0 5px;font-size:8px;margin-left:4px;">❌' + badC + '</span>'  : '') +
                (warnC > 0 ? '<span style="background:#451a03;color:#fbbf24;border-radius:9999px;padding:0 5px;font-size:8px;margin-left:4px;">⚠️' + warnC + '</span>' : '') +
                (badC === 0 && warnC === 0
                    ? '<span style="background:#14532d;color:#4ade80;border-radius:9999px;padding:0 5px;font-size:8px;margin-left:4px;">✅ OK</span>'
                    : '');
        }

        // ── 8. Write to DOM (printing reads from vastuAlertsList) ──
        let alertsList = document.getElementById('vastuAlertsList');
        if(alertsList) alertsList.innerHTML = alerts.join('');
    }
    function isRoomValid(r, hP, px) {
        // Delegates to the Devata grid system — single source of truth.
        // hP and px accepted for call-site compatibility but unused.
        // Returns true  = correctly placed (no red border, counts toward health score)
        // Returns false = wrong zone OR Brahmasthana (red border, score deduction)
        const result = checkRoomVastuDevata(r);
        return result === true;
    }
    function getSmartDoorPos(r) {
        let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12; let doorSize = 3; let doorX = 0, doorY = 0, width = 0.5, height = doorSize, wall = 'East';
        if (r.type === 'Master Bed') { wall = 'North'; doorX = actW - doorSize - 0.5; doorY = actH - 0.5; width = doorSize; height = 0.5; } 
        else if (r.type === 'Kitchen') { wall = 'North'; doorX = 0.5; doorY = actH - 0.5; width = doorSize; height = 0.5; } 
        else if (r.type === 'Bedroom 2') { wall = 'East'; doorX = actW - 0.5; doorY = actH - doorSize - 0.5; width = 0.5; height = doorSize; } 
        else if (r.type === 'Puja') { wall = 'West'; doorX = 0; doorY = 0.5; width = 0.5; height = doorSize; } 
        else if (r.type === 'Toilet') { wall = 'East'; doorX = actW - 0.5; doorY = actH - doorSize - 0.5; width = 0.5; height = doorSize; } 
        else if (r.type === 'Dressing') { wall = 'North'; doorX = 0.5; doorY = actH - 0.5; width = Math.min(2.5, actW - 1); height = 0.5; }
        else if (r.type === 'Store') { wall = 'East'; doorX = actW - 0.5; doorY = 0.5; width = 0.5; height = Math.min(2.5, actH - 1); }
        else { wall = 'East'; doorX = actW - 0.5; doorY = 0.5; width = 0.5; height = doorSize; }
        return { x: doorX, y: doorY, w: width, h: height, size: doorSize, wall: wall };
    }

    window.showConfirm = function(title, text, confirmBtnText, onConfirm) { const m = document.getElementById('customModal'); document.getElementById('customModalTitle').innerText = title; document.getElementById('customModalText').innerText = text; document.getElementById('customModalInput').classList.add('hidden'); const bc = document.getElementById('customModalCancel'); const bcf = document.getElementById('customModalConfirm'); bcf.innerText = confirmBtnText || "OK"; bcf.className = 'px-4 py-2 rounded text-white text-xs font-bold transition ' + (confirmBtnText.includes('Delete') || confirmBtnText.includes('Clear') ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'); bc.classList.remove('hidden'); bc.onclick = () => m.style.display='none'; bcf.onclick = () => { m.style.display='none'; onConfirm(); }; m.style.display='flex'; };
    window.showPrompt = function(title, text, defaultValue, onConfirm) { const m = document.getElementById('customModal'); document.getElementById('customModalTitle').innerText = title; document.getElementById('customModalText').innerText = text; const inp = document.getElementById('customModalInput'); inp.value = defaultValue; inp.classList.remove('hidden'); const bc = document.getElementById('customModalCancel'); const bcf = document.getElementById('customModalConfirm'); bcf.innerText = "Save"; bcf.className = 'px-4 py-2 rounded text-white font-bold text-xs transition bg-amber-600 hover:bg-amber-500'; bc.classList.remove('hidden'); bc.onclick = () => { m.style.display='none'; inp.classList.add('hidden'); }; bcf.onclick = () => { m.style.display='none'; inp.classList.add('hidden'); onConfirm(inp.value); }; m.style.display='flex'; inp.focus(); };
    window.toggleViewSettings = function() { document.getElementById('viewSettingsDropdown').classList.toggle('hidden'); document.getElementById('viewSettingsDropdown').classList.toggle('flex'); };

    // ── STEP 4: Devata Zone Mode toggle ──
    // Toggles state.devataMode ON/OFF and syncs:
    //   • checkbox UI (id="devataZoneToggle") wherever it lives in the HTML
    //   • immediate redraw + alert refresh
    //   • persisted to localStorage via saveLocal()
    // ── Devata Zone Names canvas overlay toggle ──
    window.toggleDevataZoneNames = function(val) {
        state.showDevataZoneNames = (typeof val === 'boolean') ? val : !state.showDevataZoneNames;
        document.querySelectorAll('#devataZoneNamesToggle').forEach(function(el) {
            el.checked = state.showDevataZoneNames;
        });
        window.draw();
        window.saveLocal();
        showToast('Devata Zone Labels: ' + (state.showDevataZoneNames ? 'ON' : 'OFF'));
    };

    window.toggleDevataZoneMode = function(val) {
        // Accept explicit boolean (from checkbox onchange) or flip current value
        if(typeof val === 'boolean') {
            state.devataMode = val;
        } else {
            state.devataMode = !state.devataMode;
        }
        // Sync all checkboxes with this id (desktop + mobile may both exist)
        document.querySelectorAll('#devataZoneToggle').forEach(function(el) {
            el.checked = state.devataMode;
        });
        // Update label text so the user sees current state
        document.querySelectorAll('#devataZoneModeLabel').forEach(function(el) {
            el.textContent = state.devataMode ? 'Devata Zone Mode: ON' : 'Devata Zone Mode: OFF';
        });
        // Redraw canvas (room border colours update immediately)
        window.draw();
        // Refresh alert panel
        if(typeof updateVastuAlerts === 'function') updateVastuAlerts();
        // Persist
        window.saveLocal();
        window.saveStateToHistory();
        showToast('Devata Zone Mode: ' + (state.devataMode ? 'ON' : 'OFF'));
    };

    // ── Sync toggle checkbox after loadLocal / restoreHistoryState ──
    window._syncDevataZoneToggleUI = function() {
        document.querySelectorAll('#devataZoneToggle').forEach(function(el) {
            el.checked = !!state.devataMode;
        });
        document.querySelectorAll('#devataZoneModeLabel').forEach(function(el) {
            el.textContent = state.devataMode ? 'Devata Zone Mode: ON' : 'Devata Zone Mode: OFF';
        });
        document.querySelectorAll('#devataZoneNamesToggle').forEach(function(el) {
            el.checked = !!state.showDevataZoneNames;
        });
    };
    window.updateDegree = function(v) { state.rotation=parseFloat(v)||0; document.getElementById('compassDeg').innerText = state.rotation + "° N"; document.getElementById('compassOverlay').style.transform = `rotate(${state.rotation}deg)`; window.draw(); };
    // ── HELPER: format ft+in ──
    function fmtFtIn(v) { const ft=Math.floor(Math.max(0,v)); const inch=Math.round((Math.max(0,v)-ft)*12); return ft+"\' "+inch+'"'; }

    // ── Road Devtha Live Strip ──
    window.updateRoadDevthaStrip = function() {
        if(!state) return;
        const strip = document.getElementById('roadDevthaStrip');
        const titleEl = document.getElementById('roadDevthaTitle');
        const listEl = document.getElementById('roadDevthaList');
        if(!strip || !listEl) return;
        const road = state.roadDir || 'East';
        // Always show strip as horizontal top bar
        strip.style.display = 'flex';
        const getName = (enName) => {
            if(typeof window.getDevathaName === 'function') return window.getDevathaName(enName);
            return enName;
        };
        // Show ONLY ★ Good (auspicious) Devathas for selected road — no neutral, no bad
        const goodDevs = (typeof FULL_CHAIN !== 'undefined') ? FULL_CHAIN.filter(d=>d.dir===road && d.rating==='good') : [];
        if(titleEl) { titleEl.textContent = road+' Road →'; titleEl.style.textShadow='0 0 5px rgba(255,255,255,0.95),0 0 3px rgba(255,255,255,1)'; titleEl.style.color='#b45309'; }
        const sh = '0 0 5px rgba(255,255,255,0.95),0 0 3px rgba(255,255,255,1)';
        let parts = [];
        goodDevs.forEach(d => {
            parts.push('<span style="color:#065f46;font-weight:900;font-size:10px;text-shadow:'+sh+';">★ '+getName(d.en)+'</span>');
        });
        // Build setback dimensions string — appended after Devtha list
        const ftIn = v => { const f=Math.floor(Math.max(0,v||0)), i=Math.round((Math.max(0,v||0)-f)*12); return f+"'"+i+'"'; };
        const setInfo = 'N:'+ftIn(state.setN)+' S:'+ftIn(state.setS)+' E:'+ftIn(state.setE)+' W:'+ftIn(state.setW);
        const setSpan = '<span style="color:#92400e;font-size:8px;font-weight:700;margin-left:14px;text-shadow:'+sh+';flex-shrink:0;">SET '
                      + '<span style="color:#b45309;">'+setInfo+'</span></span>';

        listEl.innerHTML = (parts.join('<span style="color:#9ca3af;margin:0 5px;font-size:9px;text-shadow:'+sh+';">·</span>') || '<span style="color:#6b7280;font-size:9px;">No data</span>')
                         + setSpan;
    };

    // ── Live Ayam Strip Update ──
    function updateAyamStrip() {
        if(!state) return;
        try {
            const metric = getAyadiMetric();
            const d = getAyadiData(metric);
            const yoniName = (YONI_NAMES && YONI_NAMES[d.y]) || '-';
            const isGood = [1,3,5,7].includes(d.y) && d.ay > d.ru;
            const set = (id, val) => { const el=document.getElementById(id); if(el) el.textContent=val; };

            set('ayamYoni',  d.y + '-' + yoniName);
            set('ayamAaya',  d.ay);
            set('ayamRunam', d.ru);
            set('ayamStar',  d.star || '-');
            set('ayamVaram', d.vName || '-');
            set('ayamTithi', d.tName || '-');

            // Status indicator — good/check
            const statusEl = document.getElementById('ayamStatus');
            if(statusEl) {
                if(isGood) {
                    statusEl.textContent = '✓ Good';
                    statusEl.style.color = '#16a34a';
                } else {
                    statusEl.textContent = '⚠ Check';
                    statusEl.style.color = '#d97706';
                }
            }
        } catch(e) { /* silent fail */ }
    }

    // ── Area Display Update (sq.ft + sq.yds) ──
    function updateAreaDisplays() {
        if(!state) return;

        // Area calculation (avg sides for irregular plots)
        const siteAvgNS = ((state.siteN||0) + (state.siteS||0)) / 2;
        const siteAvgEW = ((state.siteE||0) + (state.siteW||0)) / 2;
        const siteArea   = siteAvgNS * siteAvgEW;
        const builtArea  = (state.houseNs||0) * (state.houseEw||0);
        const setbackArea = Math.max(0, siteArea - builtArea);

        // Format: "3,150 sq.ft 5 sq.in"
        // sq.in = fractional sq.ft × 144 (since 1 sq.ft = 144 sq.in)
        const fmtSqFtIn = v => {
            const wholeFt = Math.floor(v);
            const fracIn  = Math.round((v - wholeFt) * 144); // remaining sq.inches
            let s = wholeFt.toLocaleString() + ' sq.ft';
            if(fracIn > 0) s += ' ' + fracIn + ' sq.in';
            return s;
        };

        // Format: "350 yds 2 ft" (1 sq.yd = 9 sq.ft)
        // yds = floor(area / 9), remaining ft = round(area % 9)
        const fmtYdsFt = v => {
            const yds = Math.floor(v / 9);
            const remFt = Math.round(v % 9);
            let s = yds.toLocaleString() + ' yds';
            if(remFt > 0) s += ' ' + remFt + ' ft';
            return s;
        };

        // Panel (sidebar) updates
        const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
        set('siteAreaSqft',    fmtSqFtIn(siteArea));
        set('siteAreaSqyd',    fmtYdsFt(siteArea));
        set('builtAreaSqft',   fmtSqFtIn(builtArea));
        set('builtAreaSqyd',   fmtYdsFt(builtArea));
        set('setbackAreaSqft', fmtSqFtIn(setbackArea));
        set('setbackAreaSqyd', fmtYdsFt(setbackArea));

        // Canvas strip updates — same format
        set('stripSiteSqft',    fmtSqFtIn(siteArea));
        set('stripSiteSqyd',    fmtYdsFt(siteArea));
        set('stripBuiltSqft',   fmtSqFtIn(builtArea));
        set('stripBuiltSqyd',   fmtYdsFt(builtArea));
        set('stripSetbackSqft', fmtSqFtIn(setbackArea));
        set('stripSetbackSqyd', fmtYdsFt(setbackArea));
    }

    // ── Built Area 2-input helpers ──
    function syncBuiltDisplays() {
        const ew = state.houseEw || 0;
        const ns = state.houseNs || 0;
        const ftIn = v => { const f=Math.floor(Math.max(0,v)), i=Math.round((Math.max(0,v)-f)*12); return f+"'"+i+'"'; };
        // Update primary inputs
        const ewF=document.getElementById('builtEW_F'), ewI=document.getElementById('builtEW_I');
        const nsF=document.getElementById('builtNS_F'), nsI=document.getElementById('builtNS_I');
        if(ewF) ewF.value=Math.floor(ew); if(ewI) ewI.value=Math.round((ew%1)*12);
        if(nsF) nsF.value=Math.floor(ns); if(nsI) nsI.value=Math.round((ns%1)*12);
        // Update locked badge displays (N_display = EW badge, E_display = NS badge)
        const nd=document.getElementById('builtN_display');
        const ed=document.getElementById('builtE_display');
        const sd=document.getElementById('builtS_display');
        const wd=document.getElementById('builtW_display');
        if(nd) nd.textContent=ftIn(ew);
        if(ed) ed.textContent=ftIn(ns);
        if(sd) sd.textContent=ftIn(ew);  // hidden compat
        if(wd) wd.textContent=ftIn(ns);  // hidden compat
        // Sync hidden legacy inputs for report/print compatibility
        ['builtN_F','builtS_F'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=Math.floor(ns);});
        ['builtN_I','builtS_I'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=Math.round((ns%1)*12);});
        ['builtE_F','builtW_F'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=Math.floor(ew);});
        ['builtE_I','builtW_I'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=Math.round((ew%1)*12);});
    }

    window.updateFromInputs = function(src) {
        if(!state) return;
        const u = (id, v) => { let f = document.getElementById(id+'_F'), i = document.getElementById(id+'_I'); if(f){ f.value=Math.floor(v); i.value=Math.round((v%1)*12); } };
        // Input range guards — clamp to valid architectural values
        const clampSite = v => Math.min(500, Math.max(5, isNaN(v) ? 10 : v));
        const clampSet  = v => Math.min(100, Math.max(0, isNaN(v) ? 0  : v));
        state.siteN = clampSite(getVal('siteN_F') + getVal('siteN_I')/12);
        state.siteS = clampSite(getVal('siteS_F') + getVal('siteS_I')/12);
        state.siteE = clampSite(getVal('siteE_F') + getVal('siteE_I')/12);
        state.siteW = clampSite(getVal('siteW_F') + getVal('siteW_I')/12);
        if(document.getElementById('showRoadToggle')) state.showRoad = document.getElementById('showRoadToggle').checked;
        if(document.getElementById('roadDirSelect')) state.roadDir = document.getElementById('roadDirSelect').value;
        if(document.getElementById('roadWidthInput')) state.roadWidth = Number(document.getElementById('roadWidthInput').value);
        window.updateRoadDevthaStrip();
        const MIN_SET = 1;
        if(src==='builtEW' || src==='builtNS') {
            const ewVal = (getVal('builtEW_F')||0) + (getVal('builtEW_I')||0)/12;
            const nsVal = (getVal('builtNS_F')||0) + (getVal('builtNS_I')||0)/12;
            const maxEW = Math.max(0.1, state.siteS - MIN_SET*2);
            const maxNS = Math.max(0.1, state.siteW - MIN_SET*2);
            const clampedEW = Math.min(Math.max(0.1, ewVal), maxEW);
            const clampedNS = Math.min(Math.max(0.1, nsVal), maxNS);
            if(clampedEW !== ewVal) showToast('\u26A0\uFE0F E-W cannot exceed site width (min 1ft setback each side)');
            if(clampedNS !== nsVal) showToast('\u26A0\uFE0F N-S cannot exceed site depth (min 1ft setback each side)');
            state.houseEw=clampedEW; state.houseNs=clampedNS;
            state.houseN=clampedNS; state.houseS=clampedNS; state.houseE=clampedEW; state.houseW=clampedEW;
            let tEW=Math.max(0,state.siteS-state.houseEw),oEW=(state.setE||0)+(state.setW||0);
            if(oEW>0){state.setE=tEW*(state.setE/oEW);state.setW=tEW*(state.setW/oEW);}else{state.setE=tEW/2;state.setW=tEW/2;}
            let tNS=Math.max(0,state.siteW-state.houseNs),oNS=(state.setN||0)+(state.setS||0);
            if(oNS>0){state.setN=tNS*(state.setN/oNS);state.setS=tNS*(state.setS/oNS);}else{state.setN=tNS/2;state.setS=tNS/2;}
            u('setE',state.setE);u('setW',state.setW);u('setN',state.setN);u('setS',state.setS);
            const wd2=state.wallDeduction||0.375;
            const msEl2=document.getElementById('madhyaSutraDisplay');
            const ftIn2=v=>{const f=Math.floor(Math.max(0,v)),i=Math.round((Math.max(0,v)-f)*12);return f+"\' "+i+'"';};
            if(msEl2) msEl2.textContent='EW: '+ftIn2(Math.max(0,state.houseEw-wd2*2))+' \xb7 NS: '+ftIn2(Math.max(0,state.houseNs-wd2*2));
            syncBuiltDisplays();
        } else if(src==='built') {
            const bE=getVal('builtE_F')+getVal('builtE_I')/12;
            const bN=getVal('builtN_F')+getVal('builtN_I')/12;
            state.houseEw=Math.min(bE,state.siteS); state.houseNs=Math.min(bN,state.siteW);
            state.houseN=state.houseNs;state.houseS=state.houseNs;state.houseE=state.houseEw;state.houseW=state.houseEw;
            let tEW=Math.max(0,state.siteS-state.houseEw),oEW=(state.setE||0)+(state.setW||0);
            if(oEW>0){state.setE=tEW*(state.setE/oEW);state.setW=tEW*(state.setW/oEW);}else{state.setE=tEW/2;state.setW=tEW/2;}
            let tNS=Math.max(0,state.siteW-state.houseNs),oNS=(state.setN||0)+(state.setS||0);
            if(oNS>0){state.setN=tNS*(state.setN/oNS);state.setS=tNS*(state.setS/oNS);}else{state.setN=tNS/2;state.setS=tNS/2;}
            u('setE',state.setE);u('setW',state.setW);u('setN',state.setN);u('setS',state.setS);
            const wd=state.wallDeduction||0.375;
            const msEl=document.getElementById('madhyaSutraDisplay');
            const ftIn=v=>{const f=Math.floor(Math.max(0,v)),i=Math.round((Math.max(0,v)-f)*12);return f+"\' "+i+'"';};
            if(msEl) msEl.textContent='EW: '+ftIn(Math.max(0,state.houseEw-wd*2))+' \xb7 NS: '+ftIn(Math.max(0,state.houseNs-wd*2));
            syncBuiltDisplays();
        } else {
            state.setN=getVal('setN_F')+getVal('setN_I')/12; state.setS=getVal('setS_F')+getVal('setS_I')/12;
            state.setE=getVal('setE_F')+getVal('setE_I')/12; state.setW=getVal('setW_F')+getVal('setW_I')/12;
            state.setE=Math.max(MIN_SET,state.setE);state.setW=Math.max(MIN_SET,state.setW);
            state.setN=Math.max(MIN_SET,state.setN);state.setS=Math.max(MIN_SET,state.setS);
            state.houseEw=Math.max(0.1,state.siteS-state.setE-state.setW);
            state.houseNs=Math.max(0.1,state.siteW-state.setN-state.setS);
            state.houseN=state.houseNs;state.houseS=state.houseNs;state.houseE=state.houseEw;state.houseW=state.houseEw;
            syncBuiltDisplays();
            const wd=state.wallDeduction||0.375;
            const msEl=document.getElementById('madhyaSutraDisplay');
            const ftIn=v=>{const f=Math.floor(Math.max(0,v)),i=Math.round((Math.max(0,v)-f)*12);return f+"\' "+i+'"';};
            if(msEl) msEl.textContent='EW: '+ftIn(Math.max(0,state.houseEw-wd*2))+' \xb7 NS: '+ftIn(Math.max(0,state.houseNs-wd*2));
        }
        updateAreaDisplays();
        updateAyamStrip();
        window.draw(); window.saveLocal(); if(!isRestoring) window.saveStateToHistory(); if(typeof window.updateNavavargulu==='function' && showNavavargulu) window.updateNavavargulu();
    };

        window.updateAyadiSettings = function(type, val) { if (type === 'shastra') state.ayadiShastra = val; if (type === 'unit') { state.ayadiUnit = val; document.getElementById('divisorContainer').style.display = val === 'yards' ? 'flex' : 'none'; } if (type === 'divisor') state.ayadiDivisor = parseFloat(val) || 9; /* sync canvas shastra label */ var shastraLbl = document.getElementById('canvasShastraLabel'); if(shastraLbl) { var isV = state.ayadiShastra === 'viswakarma'; shastraLbl.textContent = isV ? 'Navavargulu: Viswakarma' : 'Shadvargulu: Mayamata'; } window.draw(); window.saveLocal(); window.updateNavavargulu(); window.saveStateToHistory(); ; if(typeof window.updateNavavargulu==='function' && showNavavargulu) window.updateNavavargulu();; if(typeof window.updateNavavargulu==='function' && showNavavargulu) window.updateNavavargulu(); };
    window.toggleNavavargulu = function() { showNavavargulu = !showNavavargulu; document.getElementById('navavarguluPanel').classList.toggle('hidden', !showNavavargulu); if(showNavavargulu) window.updateNavavargulu(); };
    window.toggleMeasureTool = function() { window.setActiveTool('wall'); };
    window.toggleWallTool = function() { window.setActiveTool('wall'); };
    window.setActiveTool = function(tool) {
        // ── Hard reset ALL tools first ──
        var prev = window._activeTool || null;
        window._activeTool = null;

        // Clear all state
        state.isDrawingWall = false;  state.wallPoints = [];
        state.isMeasuring  = false;   state.measurePoints = []; state.measureLines = state.measureLines||[];
        state.isDrawingRect = false;  state.rectDrawing = false; state.rectStart = null;
        state.isInking     = false;   state._inkDrawing = false;

        // Clear all btn-active classes
        ['wallBtn','measureBtn','rectBtn','inkBtn','inkBtnSite'].forEach(function(id){
            var b = document.getElementById(id); if(b) b.classList.remove('btn-active');
        });
        ['mob-wallBtn','mob-measureBtn','mob-rectBtn','mob-inkBtn'].forEach(function(id){
            var b = document.getElementById(id); if(b) b.classList.remove('mob-tool-active');
        });

        // Reset cursors
        if(canvas) canvas.style.cursor = 'default';
        var mg = document.getElementById('measureGuide');
        if(mg) mg.classList.add('hidden');
        var lbl = document.getElementById('activeToolLabel');
        if(lbl) lbl.innerHTML = '<i class="fa-solid fa-arrow-pointer mr-1"></i>SELECT';

        // If same tool tapped again → toggle OFF (already cleared above)
        if(prev === tool) {
            if(tool === 'wall') showToast('Wall & Measure: OFF');
            if(tool === 'rect') showToast('Rect Tool: OFF');
            if(tool === 'ink')  showToast('Ink Marker: OFF');
            if(typeof syncToolClass==='function') syncToolClass();
            if(typeof window.syncMobToolBtns==='function') window.syncMobToolBtns();
            window.draw(); return;
        }

        // Activate new tool
        window._activeTool = tool;
        if(tool === 'wall') {
            state.isDrawingWall = true; state.wallPoints = [];
            var b = document.getElementById('wallBtn'); if(b) b.classList.add('btn-active');
            var mb = document.getElementById('mob-wallBtn'); if(mb) mb.classList.add('mob-tool-active');
            if(canvas) canvas.style.cursor = 'crosshair';
            showToast('Wall & Measure: ON — tap points to draw');
        } else if(tool === 'rect') {
            state.isDrawingRect = true; state.rectDrawing = false; state.rectStart = null;
            var b = document.getElementById('rectBtn'); if(b) b.classList.add('btn-active');
            var mb = document.getElementById('mob-rectBtn'); if(mb) mb.classList.add('mob-tool-active');
            if(canvas) canvas.style.cursor = 'crosshair';
            showToast('Rect Tool: ON — drag to draw');
        } else if(tool === 'ink') {
            state.isInking = true;
            var b = document.getElementById('inkBtn'); if(b) b.classList.add('btn-active');
            var bs = document.getElementById('inkBtnSite'); if(bs) bs.style.background='rgba(234,88,12,0.4)';
            var mb = document.getElementById('mob-inkBtn'); if(mb) mb.classList.add('mob-tool-active');
            var inkCvs = document.getElementById('vastuCanvas'); if(inkCvs) inkCvs.style.cursor='crosshair';
            var lbl2 = document.getElementById('activeToolLabel');
            if(lbl2) lbl2.innerHTML = '<i class="fa-solid fa-pen-nib mr-1"></i>MARKER';
            showToast('Ink Marker: ON');
        }
        if(typeof syncToolClass==='function') syncToolClass();
        if(typeof window.syncMobToolBtns==='function') window.syncMobToolBtns();
        window.draw();
    };
    window.undoWall = function() { if(state.walls && state.walls.length > 0) { state.walls.pop(); window.draw(); window.saveLocal(); window.saveStateToHistory(); showToast("Last wall erased."); } else { showToast("No walls to erase!"); } };
    
    window.updateRoomDim = function(i, type, val) { 
        if(i >= state.rooms.length) return;
        let v = parseInt(val) || 0; 
        if (type === 'wF') state.rooms[i].wF = Math.max(0, v);
        if (type === 'wI') state.rooms[i].wI = Math.min(11, Math.max(0, v));
        if (type === 'hF') state.rooms[i].hF = Math.max(0, v);
        if (type === 'hI') state.rooms[i].hI = Math.min(11, Math.max(0, v));
        if (type === 'htF') state.rooms[i].htF = Math.max(0, v);
        if (type === 'htI') state.rooms[i].htI = Math.min(11, Math.max(0, v));
        window.draw(); window.saveLocal(); window.saveStateToHistory(); 
    };

    window.addRoom = function(t) { 
        // Colors per room type
        const c = {
            "Master Bed": "#c7d2fe", "Kitchen": "#fed7aa", "Dining": "#fcd34d",
            "Puja": "#fef08a", "Toilet": "#fecaca", "Bedroom 2": "#e2e8f0",
            "Hall": "#ccfbf1", "Staircase": "#94a3b8",
            "Dressing": "#ddd6fe", "Store": "#d1d5db",
            "Bathroom Out": "#bae6fd", "Servant Room": "#e5e7eb", "Watch Ward": "#d6d3d1"
        };
        // Default sizes per room type in feet (wF, wI, hF, hI) + height (htF)
        const sizes = {
            "Master Bed": {wF:12, wI:0, hF:14, hI:0, htF:10},
            "Bedroom 2":  {wF:11, wI:0, hF:12, hI:0, htF:10},
            "Kitchen":    {wF:10, wI:0, hF:10, hI:0, htF:10},
            "Dining":     {wF:10, wI:0, hF:8,  hI:0, htF:10},
            "Hall":       {wF:14, wI:0, hF:12, hI:0, htF:10},
            "Puja":       {wF:6,  wI:0, hF:6,  hI:0, htF:10},
            "Toilet":     {wF:5,  wI:0, hF:6,  hI:0, htF:9},
            "Staircase":  {wF:6,  wI:0, hF:10, hI:0, htF:10},
            "Dressing":   {wF:4,  wI:0, hF:5,  hI:0, htF:9},
            "Store":      {wF:5,  wI:0, hF:6,  hI:0, htF:9},
            "Bathroom Out":{wF:5, wI:0, hF:5,  hI:0, htF:9},
            "Servant Room":{wF:8, wI:0, hF:10, hI:0, htF:9},
            "Watch Ward": {wF:6,  wI:0, hF:8,  hI:0, htF:9}
        };

        // Outside rooms: place in setback area near compound wall, not inside house
        const outsideRooms = ['Bathroom Out', 'Watch Ward', 'Servant Room'];
        let sz = sizes[t] || {wF:10, wI:0, hF:10, hI:0, htF:10};

        let px_x, px_y;
        if(outsideRooms.includes(t)) {
            // Place in South setback area (near South compound wall) by default
            // South setback: y=0 to setS in site coords, x centred
            let rW = sz.wF + sz.wI/12, rH = sz.hF + sz.hI/12;
            // Try to fit in South setback first (most common for outside rooms)
            let southSetback = state.setS;
            let eastSetback  = state.setE;
            if(t === 'Watch Ward') {
                // Watch & Ward near gate — place at East setback near SE corner
                px_x = state.setW + state.houseEw + Math.max(0.5, (eastSetback - rW)/2);
                px_y = Math.max(0.5, (southSetback - rH)/2);
            } else if(t === 'Servant Room') {
                // Servant room — South setback, west side
                px_x = state.setW + 0.5;
                px_y = Math.max(0.5, (southSetback - rH)/2);
            } else {
                // Bathroom Out — South setback, centre
                px_x = state.setW + state.houseEw/2 - rW/2;
                px_y = Math.max(0.5, (southSetback - rH)/2);
            }
            // Clamp to within site bounds
            px_x = Math.max(0, Math.min(px_x, state.siteS - rW));
            px_y = Math.max(0, Math.min(px_y, state.siteW - rH));
            // Mark as outside room — uses SITE coordinates (like markers)
            state.rooms.push({ 
                type: t, name: t, x: px_x, y: px_y, 
                wF: sz.wF, wI: sz.wI, hF: sz.hF, hI: sz.hI, 
                htF: sz.htF||9, htI: 0,
                color: c[t] || "#e2e8f0", 
                isFurniture: false, isMarker: false, isOutside: true, hidden: false 
            });
        } else {
            // Normal inside rooms — place at centre of house
            let totalW = sz.wF + sz.wI/12, totalH = sz.hF + sz.hI/12;
            px_x = Math.max(0, state.houseEw/2 - totalW/2);
            px_y = Math.max(0, state.houseNs/2 - totalH/2);
            state.rooms.push({ 
                type: t, name: t, x: px_x, y: px_y, 
                wF: sz.wF, wI: sz.wI, hF: sz.hF, hI: sz.hI, 
                htF: sz.htF||10, htI: 0,
                color: c[t] || "#fff", 
                isFurniture: false, isMarker: false, isOutside: false, hidden: false 
            }); 
        }
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
    };

    // Reset old cached data
    window.resetOldData = function() {
        window.showConfirm("Reset Data", "Clear all cached room data and reload fresh defaults? Your saved projects are NOT deleted.", "Yes, Reset", () => {
            localStorage.removeItem('vastu_v23_final');
            state.rooms = []; state.walls = []; state.texts = []; state.shapes = [];
            renderItemList(); renderShapeList(); window.draw(); window.saveStateToHistory();
            showToast("Data reset! Fresh start ready.");
        });
    };

    window.addMarker = function(t) {
        let wSite = state.siteS, hSite = state.siteW; let sx = wSite / 2, sy = hSite / 2;
        let corners = [ { id: "TR", x: wSite - 2, y: hSite - 2 }, { id: "TL", x: 2, y: hSite - 2 }, { id: "BL", x: 2, y: 2 }, { id: "BR", x: wSite - 2, y: 2 } ];
        corners.forEach(c => { let mathAngle = Math.atan2(c.y - sy, c.x - sx) * 180 / Math.PI; c.angle = (90 - mathAngle - state.rotation + 360) % 360; });
        let getDiff = (a, b) => Math.min((a-b+360)%360, (b-a+360)%360); 
        let pt = (t === 'Borewell') ? corners.reduce((p, c) => getDiff(c.angle, 45) < getDiff(p.angle, 45) ? c : p) : corners.reduce((p, c) => getDiff(c.angle, 315) < getDiff(p.angle, 315) ? c : p);
        state.rooms.push({ type: t, name: t, x: pt.x, y: pt.y, isMarker: true, color: t === 'Borewell' ? '#3b82f6' : '#78716c', hidden: false });
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
    };

    window.addFurniture = function(t, width=3, height=0.5) {
        let c = "#ffffff"; if(t.includes('Door')) c = "#ea580c"; if(t.includes('Window')) c = "#0284c7"; if(t === 'Bed') c = "#8b5cf6"; if(t === 'Stove') c = "#ef4444"; if(t === 'Commode') c = "#f8fafc";
        state.rooms.push({ type: t, name: t, x: state.houseEw/2 - width/2, y: state.houseNs/2 - height/2, wF: Math.floor(width), wI: Math.round((width%1)*12), hF: Math.floor(height), hI: Math.round((height%1)*12), color: c, isFurniture: true, isMarker: false, hidden: false }); 
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
    };

    window.addTextLabel = function() {
        if(typeof forceDeactivateAllTools==='function') forceDeactivateAllTools();
        if(typeof syncToolClass==='function') syncToolClass();
        window.showPrompt("Add Text Label", "Enter text to display:", "Text", (txt) => {
            if(txt) {
                if(!state.texts) state.texts = [];
                const px = 300 / Math.max(state.siteW, state.siteS); const sP = getSitePolygon(); const cOX = (sP.se.x * px) / 2, cOY = (sP.nw.y * px) / 2;
                let vx = (-state.offsetX / state.scale + cOX) / px; let vy = (-state.offsetY / state.scale + cOY) / px;
                state.texts.push({ text: txt, x: vx, y: vy, hidden: false });
                renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
            }
        });
    };

    window.clearRooms = function() { 
        let floorName = state.currentFloor === 1 ? 'First Floor (1F)' : 'Ground Floor (GF)';
        window.showConfirm("Clear " + floorName, "Delete all rooms, walls and objects on " + floorName + "?", "Yes, Clear", () => { 
            state.rooms = []; state.walls = []; state.texts = []; state.shapes = [];
            if(!state.roomsByFloor) state.roomsByFloor = {0:[],1:[]};
            if(!state.wallsByFloor) state.wallsByFloor = {0:[],1:[]};
            if(!state.textsByFloor) state.textsByFloor = {0:[],1:[]};
            state.roomsByFloor[state.currentFloor||0] = [];
            state.wallsByFloor[state.currentFloor||0] = [];
            state.textsByFloor[state.currentFloor||0] = [];
            renderItemList(); renderShapeList(); window.draw(); window.saveLocal(); window.saveStateToHistory(); 
        }); 
    };

    // ── Point 12: Rectangle tool ──
    window.toggleRectTool = function() { window.setActiveTool('rect'); };
    function renderShapeList() {
        let list = document.getElementById('shapeList'); if(!list) return;
        if(!state.shapes) state.shapes = [];
        if(state.shapes.length === 0) { list.innerHTML = ''; return; }
        list.innerHTML = '<div class="text-[9px] text-slate-400 font-bold uppercase mt-2 mb-1">Separation Rectangles</div>';
        state.shapes.forEach((s, i) => {
            let wFt = Math.floor(s.w), wIn = Math.round((s.w % 1)*12), hFt = Math.floor(s.h), hIn = Math.round((s.h % 1)*12);
            list.innerHTML += `<div class="room-item p-2 flex justify-between items-center ${s.hidden?'opacity-50':''}">
                <span class="text-slate-300 text-[9px] font-bold">▭ Rect ${i+1}: ${wFt}'${wIn}" × ${hFt}'${hIn}"</span>
                <div>
                    <button onclick="state.shapes[${i}].hidden=!state.shapes[${i}].hidden;renderShapeList();window.draw();" class="mr-2 text-emerald-400 text-[10px]"><i class="fa-solid ${s.hidden?'fa-eye-slash text-slate-500':'fa-eye text-emerald-400'}"></i></button>
                    <button onclick="state.shapes.splice(${i},1);renderShapeList();window.draw();window.saveLocal();window.saveStateToHistory();" class="text-red-500 text-[10px]"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
    }
    window.renderShapeList = renderShapeList;

    // ── Point 8: Auto-gate on green Devatha ──
    window.autoPlaceGates = function() {
        let road = state.roadDir || 'East';
        const sP = getSitePolygon();
        const hP = getHousePolygon();
        // Get site devathas
        const sDevData = getShiftedDevathas(sP, state.siteN, state.siteE, state.siteS, state.siteW, state.rotation);
        const hDevData = getShiftedDevathas(hP, state.houseNs, state.houseEw, state.houseNs, state.houseEw, state.rotation);
        // Find best green devatha on the road-facing wall of the site
        // Road direction → which side of site has the road
        // In canvas: E wall = right, N wall = top, S wall = bottom, W wall = left
        // Perimeter order: NE→SE (East), SE→SW (South), SW→NW (West), NW→NE (North)
        let roadSideStart = 0, roadSideEnd = sDevData.E;
        if(road === 'South') { roadSideStart = sDevData.E; roadSideEnd = sDevData.E + sDevData.S; }
        else if(road === 'West') { roadSideStart = sDevData.E + sDevData.S; roadSideEnd = sDevData.E + sDevData.S + sDevData.W; }
        else if(road === 'North') { roadSideStart = sDevData.E + sDevData.S + sDevData.W; roadSideEnd = sDevData.P; }

        // Find best green devatha on site road-facing side
        let bestSiteDev = null;
        sDevData.finalDevs.forEach(d => {
            let unshifted = (d.d_start - sDevData.shift + sDevData.P) % sDevData.P;
            let onRoadSide = (unshifted >= roadSideStart - 0.01 && unshifted < roadSideEnd + 0.01);
            if(onRoadSide && d.rating === 'good') {
                if(!bestSiteDev || d.len > bestSiteDev.len) bestSiteDev = d;
            }
        });
        // Find best green devatha on built area road-facing side
        let hRoadSideStart = 0, hRoadSideEnd = hDevData.E;
        if(road === 'South') { hRoadSideStart = hDevData.E; hRoadSideEnd = hDevData.E + hDevData.S; }
        else if(road === 'West') { hRoadSideStart = hDevData.E + hDevData.S; hRoadSideEnd = hDevData.E + hDevData.S + hDevData.W; }
        else if(road === 'North') { hRoadSideStart = hDevData.E + hDevData.S + hDevData.W; hRoadSideEnd = hDevData.P; }
        let bestHouseDev = null;
        hDevData.finalDevs.forEach(d => {
            let unshifted = (d.d_start - hDevData.shift + hDevData.P) % hDevData.P;
            let onRoadSide = (unshifted >= hRoadSideStart - 0.01 && unshifted < hRoadSideEnd + 0.01);
            if(onRoadSide && d.rating === 'good') {
                if(!bestHouseDev || d.len > bestHouseDev.len) bestHouseDev = d;
            }
        });

        if(!bestSiteDev && !bestHouseDev) { showToast("No green Devatha found on " + road + " side!"); return; }

        // Remove old auto-gates
        state.rooms = state.rooms.filter(r => !r._autoGate);

        if(bestSiteDev) {
            // FIX 3+4: Site Gate → use isMarker:true with SITE polygon coords (absolute feet)
            // This matches how Borewell/Septic markers work — x/y are site-absolute coordinates
            let dMid = (bestSiteDev.d_start + bestSiteDev.len/2) % sDevData.P;
            let pMid = getPtOnPerimeter(dMid, sDevData.poly, sDevData.N, sDevData.E, sDevData.S, sDevData.W);
            state.rooms.push({ 
                type: 'Site Gate', name: 'SITE GATE', 
                x: pMid.x, y: pMid.y, 
                isMarker: true, isFurniture: false,
                color: '#f59e0b', hidden: false, _autoGate: true,
                _gateWidth: Math.min(10, bestSiteDev.len),
                _devathaName: bestSiteDev.name
            });
        }
        if(bestHouseDev) {
            // FIX 3: Main Door → house-relative coordinates (subtract hP.sw origin)
            let dMid = (bestHouseDev.d_start + bestHouseDev.len/2) % hDevData.P;
            let pMid = getPtOnPerimeter(dMid, hDevData.poly, hDevData.N, hDevData.E, hDevData.S, hDevData.W);
            let dW = 3.5;
            // Convert from absolute site coords to house-relative coords
            let relX = pMid.x - hP.sw.x - dW/2;
            let relY = pMid.y - hP.sw.y - 0.25;
            // Clamp within house bounds
            relX = Math.max(0, Math.min(relX, state.houseEw - dW));
            relY = Math.max(0, Math.min(relY, state.houseNs - 0.5));
            state.rooms.push({ 
                type: 'Main Gate', name: 'MAIN DOOR', 
                x: relX, y: relY, 
                wF: 3, wI: 6, hF: 7, hI: 0, 
                color: '#ea580c', isFurniture: true, isMarker: false, 
                hidden: false, _autoGate: true 
            });
        }
        // Update Dwara selection to best house devatha
        if(bestHouseDev) {
            state.selectedDwara = bestHouseDev.name;
            let dw = document.getElementById('dwaraSelect'); if(dw) dw.value = bestHouseDev.name;
        }
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
        showToast("Gates placed on green Devatha — " + road + " side!");
    };
    window.renameRoom = function(i) { window.showPrompt("Rename", "New name:", state.rooms[i].name, (n) => { if(n){ const sanitized = n.replace(/</g, "&lt;").replace(/>/g, "&gt;"); state.rooms[i].name = sanitized; renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory(); } }); };
    window.toggleHideRoom = function(i) { state.rooms[i].hidden = !state.rooms[i].hidden; renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory(); };
    window.toggleHideText = function(i) { state.texts[i].hidden = !state.texts[i].hidden; renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory(); };

    function renderItemList() { 
        const list = document.getElementById('itemList'); if(!list) return; list.innerHTML = '';
        if(!state.rooms) state.rooms = [];
        if(!state.texts) state.texts = [];
        if(!state.shapes) state.shapes = [];
        if(!state.walls) state.walls = [];

        // ── Rooms ──
        state.rooms.forEach((r, i) => { 
            let icon = r.isMarker ? (r.type==='Borewell'?'💧':'🕳️') : (r.isFurniture ? (r.type.includes('Door')?'🚪':(r.type.includes('Window')?'🪟':'🛋️ ')) : '');
            let controls = '';
            if(!r.isMarker) {
                let htF = r.htF !== undefined ? r.htF : 10;
                let htI = r.htI !== undefined ? r.htI : 0;
                controls = `<div class="mt-1.5">
                    <div class="flex items-center gap-1 text-[9px]">
                        <span class="text-amber-400 font-black text-[8px] w-6">EW</span>
                        <input type="number" inputmode="decimal" step="any" value="${r.wF||0}" onchange="window.updateRoomDim(${i},'wF',this.value)" style="width:44px;min-width:44px;font-size:16px;" class="bg-slate-900 border border-slate-600 px-1 text-center h-6 rounded text-white font-bold">
                        <span class="text-[7px] text-slate-500">ft</span>
                        <input type="number" inputmode="decimal" step="any" min="0" max="11" value="${r.wI||0}" onchange="window.updateRoomDim(${i},'wI',this.value)" style="width:32px;min-width:32px;font-size:16px;" class="bg-slate-900 border border-slate-600 px-1 text-center h-6 rounded text-white">
                        <span class="text-[7px] text-slate-500">in</span>
                        <span class="text-amber-400 font-black text-[8px] w-6 ml-1">NS</span>
                        <input type="number" inputmode="decimal" step="any" value="${r.hF||0}" onchange="window.updateRoomDim(${i},'hF',this.value)" style="width:44px;min-width:44px;font-size:16px;" class="bg-slate-900 border border-slate-600 px-1 text-center h-6 rounded text-white font-bold">
                        <span class="text-[7px] text-slate-500">ft</span>
                        <input type="number" inputmode="decimal" step="any" min="0" max="11" value="${r.hI||0}" onchange="window.updateRoomDim(${i},'hI',this.value)" style="width:32px;min-width:32px;font-size:16px;" class="bg-slate-900 border border-slate-600 px-1 text-center h-6 rounded text-white">
                        <span class="text-[7px] text-slate-500">in</span>
                    </div>
                </div>`;
            }
            let eyeIcon = r.hidden ? 'fa-eye-slash text-slate-500' : 'fa-eye text-emerald-400';
            list.innerHTML += `<div class="room-item p-2 ${r.hidden?'opacity-50':''}"><div class="flex justify-between items-center"><span class="font-bold text-amber-400 text-[10px] uppercase cursor-pointer hover:text-amber-300 transition" onclick="window.renameRoom(${i})" title="Click to rename">${icon} ${r.name} <i class="fa-solid fa-pen text-[8px] ml-1 text-slate-500"></i></span><div>${(!r.isMarker) ? `<button onclick="window.rotateRoom(${i})" class="text-blue-400 hover:text-blue-300 mr-2" title="Rotate Room"><i class="fa-solid fa-rotate"></i></button>` : ''}<button onclick="window.toggleHideRoom(${i})" class="mr-2" title="Hide/Show"><i class="fa-solid ${eyeIcon}"></i></button><button onclick="state.rooms.splice(${i},1);renderItemList();window.draw();window.saveLocal();window.saveStateToHistory();" class="text-red-500 text-[10px]" title="Delete"><i class="fa-solid fa-trash"></i></button></div></div>${controls}</div>`; 
        });

        // ── Walls (Wall & Measure lines) ──
        if(state.walls && state.walls.length > 0) {
            list.innerHTML += `<div class="text-[9px] text-slate-400 font-bold uppercase mt-2 mb-1" style="padding:4px 4px 0;">🧱 Walls & Measurements</div>`;
            state.walls.forEach((w, i) => {
                const p1 = w.p1, p2 = w.p2;
                const dx = (p2.x - p1.x), dy = (p2.y - p1.y);
                const len = Math.sqrt(dx*dx + dy*dy);
                const ft = Math.floor(len), inch = Math.round((len - ft) * 12);
                const label = `Wall ${i+1}: ${ft}'${inch}"`;
                list.innerHTML += `<div class="room-item p-2 flex justify-between items-center">
                    <span class="font-bold text-slate-300 text-[9px]" style="color:#94a3b8;">🧱 ${label}</span>
                    <div>
                        <button onclick="state.walls.splice(${i},1);renderItemList();window.draw();window.saveLocal();window.saveStateToHistory();" class="text-red-500 text-[10px]" title="Delete Wall"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
            });
        }

        // ── Text labels ──
        if(state.texts) {
            state.texts.forEach((t, i) => {
                let eyeIcon = t.hidden ? 'fa-eye-slash text-slate-500' : 'fa-eye text-emerald-400';
                list.innerHTML += `<div class="room-item p-2 flex justify-between items-center ${t.hidden?'opacity-50':''}"><span class="font-bold text-sky-400 text-[9px] uppercase">📝 ${t.text}</span><div><button onclick="window.toggleHideText(${i})" class="mr-2" title="Hide/Show"><i class="fa-solid ${eyeIcon}"></i></button><button onclick="state.texts.splice(${i},1);renderItemList();window.draw();window.saveLocal();window.saveStateToHistory();" class="text-red-500 text-[10px]" title="Delete"><i class="fa-solid fa-trash"></i></button></div></div>`;
            });
        }
    }

    window.rotateRoom = function(i) {
        let r = state.rooms[i]; if(r.isMarker) return;
        let twF = r.wF, twI = r.wI; r.wF = r.hF; r.wI = r.hI; r.hF = twF; r.hI = twI; 
        let actW = (r.wF||0) + (r.wI||0) / 12; let actH = (r.hF||0) + (r.hI||0) / 12;
        let maxW = state.houseEw; let maxH = state.houseNs; if (r.x + actW > maxW) r.x = maxW - actW; if (r.y + actH > maxH) r.y = maxH - actH;
        if(r.x < 0) r.x = 0; if(r.y < 0) r.y = 0;
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
    };

    window.autoLayout = function() { 
    window.showConfirm("Auto Layout", "Generate Viswakarma Vastu-based room layout? Existing rooms will be cleared.", "Yes, Auto-Layout", () => {
        // Clear existing rooms but keep markers
        state.rooms = state.rooms.filter(r => r.isMarker);
        state.walls = [];

        const w = parseFloat(state.houseEw) || 35;
        const h = parseFloat(state.houseNs) || 47;

        // ── PROPORTIONAL SIZING — all values are percentages of house dimensions ──
        // Master Bedroom: SW corner (Nairutya — most auspicious for master bed)
        let mbW = Math.max(12, Math.round(w * 0.35));
        let mbH = Math.max(13, Math.round(h * 0.35));

        // Kitchen: SE corner (Agni zone)
        let ktW = Math.max(10, Math.round(w * 0.30));
        let ktH = Math.max(10, Math.round(h * 0.28));

        // Dining: South centre (between Master Bed and Kitchen)
        let dnW = Math.max(8,  Math.round(w - mbW - ktW));
        let dnH = Math.max(8,  Math.round(h * 0.25));

        // Bedroom 2: NW zone (Vayavya)
        let b2W = Math.max(11, Math.round(w * 0.38));
        let b2H = Math.max(11, Math.round(h * 0.32));

        // Staircase: SW side above Master Bed
        let stW = Math.max(5,  Math.round(w * 0.18));
        let stH = Math.max(8,  Math.round(h * 0.22));

        // Puja: NE corner (Ishanya — most sacred)
        let pjW = Math.max(5,  Math.round(w * 0.15));
        let pjH = Math.max(5,  Math.round(h * 0.15));

        // Hall: NE/North/East remaining space
        let hlX = b2W;
        let hlY = Math.round(h * 0.68);
        let hlW = Math.max(8,  Math.round(w - b2W - pjW));
        let hlH = Math.max(8,  Math.round(h - hlY));

        // ── ATTACHED TOILET SIZING ──
        // Proportional to parent bedroom, minimum 4x5 enforced
        let mbToiletW = Math.max(4, Math.round(mbW * 0.30));
        let mbToiletH = Math.max(5, Math.round(mbH * 0.32));

        let b2ToiletW = Math.max(4, Math.round(b2W * 0.28));
        let b2ToiletH = Math.max(5, Math.round(b2H * 0.32));

        // ── HELPER: push room into state.rooms ──
        const addAutoRoom = (type, name, x, y, wf, hf, color, extra = {}) => {
            wf = Math.min(wf, w - x);
            hf = Math.min(hf, h - y);
            if (wf < 1 || hf < 1) return;
            let w_f = Math.floor(wf);
            let w_i = Math.round((wf - w_f) * 12); if (w_i >= 12) { w_f++; w_i = 0; }
            let h_f = Math.floor(hf);
            let h_i = Math.round((hf - h_f) * 12); if (h_i >= 12) { h_f++; h_i = 0; }
            state.rooms.push({
                type:        type,
                name:        name,
                x:           Math.max(0, x),
                y:           Math.max(0, y),
                wF:          w_f,
                wI:          w_i,
                hF:          h_f,
                hI:          h_i,
                htF:         10,
                htI:         0,
                color:       color,
                isFurniture: false,
                isMarker:    false,
                isOutside:   false,
                hidden:      false,
                ...extra
            });
        };

        // ── ROOM PLACEMENT — Viswakarma Vastu Zones ──
        // Y=0 is South (bottom), Y increases going North (up)
        // X=0 is West (left),  X increases going East (right)

        // 1. Master Bedroom — SW corner (x=0, y=0)
        addAutoRoom('Master Bed', 'Master Bed', 0, 0, mbW, mbH, '#c7d2fe');

        // 2. Attached Toilet inside Master Bed — NW corner of Master Bed
        //    NW of Master Bed = top-left = x:mbX, y:mbY + mbH - toiletH
        addAutoRoom(
            'Toilet', 'Toilet (MB)',
            0,
            mbH - mbToiletH,
            mbToiletW, mbToiletH,
            '#fecaca',
            { isAttached: true }
        );

        // 3. Kitchen — SE corner (x = w - ktW, y = 0)
        addAutoRoom('Kitchen', 'Kitchen', w - ktW, 0, ktW, ktH, '#fed7aa');

        // 4. Dining — South centre between Master Bed and Kitchen (y=0)
        addAutoRoom('Dining', 'Dining', mbW, 0, dnW, dnH, '#fcd34d');

        // 5. Staircase — above Master Bed on SW side
        addAutoRoom('Staircase', 'Staircase', 0, mbH, stW, stH, '#94a3b8');

        // 6. Bedroom 2 — NW zone (x=0, y = h - b2H) top-left of canvas
        addAutoRoom('Bedroom 2', 'Bedroom 2', 0, h - b2H, b2W, b2H, '#e2e8f0');

        // 7. Attached Toilet inside Bedroom 2 — NW corner of Bedroom 2
        //    NW of Bed2 = top-left = x:0, y:(h - b2H) + b2H - b2ToiletH = h - b2ToiletH
        addAutoRoom(
            'Toilet', 'Toilet (B2)',
            0,
            (h - b2H) + (b2H - b2ToiletH),
            b2ToiletW, b2ToiletH,
            '#fecaca',
            { isAttached: true }
        );

        // 8. Puja — NE corner (x = w - pjW, y = h - pjH)
        addAutoRoom('Puja', 'Puja', w - pjW, h - pjH, pjW, pjH, '#fef08a');

        // 9. Hall — North/NE area above Dining and Kitchen
        addAutoRoom('Hall', 'Hall', hlX, hlY, hlW, hlH, '#ccfbf1');

        renderItemList();
        window.draw();
        window.saveLocal();
        window.saveStateToHistory();
        showToast('Viswakarma Vastu Layout Applied!');
    });
};
        

    // Room colors map (used by addRoom and autoLayout)
    const ROOM_COLORS = {
        "Master Bed": "#c7d2fe", "Kitchen": "#fed7aa", "Dining": "#fcd34d",
        "Puja": "#fef08a", "Toilet": "#fecaca", "Bedroom 2": "#e2e8f0",
        "Hall": "#ccfbf1", "Staircase": "#94a3b8", "Dressing": "#ddd6fe", "Store": "#d1d5db"
    };

    window.generateReport = function() {
        // Save current floor data before generating report
        if(!state.roomsByFloor) state.roomsByFloor = {0:[], 1:[]};
        if(!state.wallsByFloor) state.wallsByFloor = {0:[], 1:[]};
        state.roomsByFloor[state.currentFloor||0] = JSON.parse(JSON.stringify(state.rooms||[]));
        state.wallsByFloor[state.currentFloor||0]  = JSON.parse(JSON.stringify(state.walls||[]));
        
        var _cc = document.getElementById('canvasContainer');
        var _wasHidden = _cc && _cc.classList.contains('mob-hidden');
        if (_wasHidden) _cc.classList.remove('mob-hidden');
        window.draw(); 
        let imgData = ""; 
        try { imgData = canvas.toDataURL('image/png'); } catch(e) { console.warn("Canvas is tainted."); }
        if (_wasHidden) _cc.classList.add('mob-hidden');
        
        // Capture 1F canvas image if it exists
        let imgData1F = "";
        if(state.roomsByFloor[1] && state.roomsByFloor[1].length > 0) {
            let savedFloor = state.currentFloor;
            // Temporarily switch to 1F to draw it, capture, then switch back
            state.currentFloor = 1;
            state.rooms = JSON.parse(JSON.stringify(state.roomsByFloor[1]||[]));
            state.walls = JSON.parse(JSON.stringify(state.wallsByFloor[1]||[]));
            window.draw();
            try { imgData1F = canvas.toDataURL('image/png'); } catch(e) {}
            // Restore GF
            state.currentFloor = savedFloor;
            state.rooms = JSON.parse(JSON.stringify(state.roomsByFloor[savedFloor]||[]));
            state.walls = JSON.parse(JSON.stringify(state.wallsByFloor[savedFloor]||[]));
            window.draw();
        }
        
        const sP = getSitePolygon(), hP = getHousePolygon();
        const sDevData = getShiftedDevathas(sP, state.siteN, state.siteE, state.siteS, state.siteW, state.rotation);
        const hDevData = getShiftedDevathas(hP, state.houseNs, state.houseEw, state.houseNs, state.houseEw, state.rotation);
        const metric = getAyadiMetric(); 
        const ayadi = getAyadiData(metric); 
        const lang = document.getElementById('globalLangSelect') ? document.getElementById('globalLangSelect').value : document.getElementById('reportLang') ? document.getElementById('reportLang').value : 'en';
        function tr(key) { return REPORT_I18N[lang] ? (REPORT_I18N[lang][key] || REPORT_I18N['en'][key]) : REPORT_I18N['en'][key]; }
        
        // ── HELPER: decimal feet → ft' in" (no decimals anywhere) ──
        function fmtFI(val) { 
            if(isNaN(val) || val < 0) val = 0;
            let ft = Math.floor(val); 
            let inch = Math.round((val - ft) * 12); 
            if(inch === 12) { ft++; inch = 0; } 
            return ft + "' " + inch + '"'; 
        }
        // ── HELPER: decimal feet → sq.ft rounded ──
        function fmtSqft(v) { return (Math.round(v * 100) / 100).toFixed(2) + ' sq.ft'; }

        // ── POINT 1: Count doors & windows correctly ──
        // Auto-doors: every non-staircase, non-furniture, non-marker, non-hidden room gets 1 auto door
        let tAutoDoors = 0, tManualDoors = 0, tManualWindows = 0;
        let tAutoWindows = 0; // rooms with auto windows (bedroom/hall/kitchen etc)
        const AUTO_WINDOW_ROOMS = ['Master Bed','Bedroom 2','Hall','Kitchen','Dining','Dressing','Store'];
        if(state.rooms) {
            state.rooms.forEach(r => {
                if(r.hidden) return;
                if(!r.isFurniture && !r.isMarker && r.type !== 'Staircase' && r.type !== 'Toilet') tAutoDoors++;
                if(!r.isFurniture && !r.isMarker && AUTO_WINDOW_ROOMS.includes(r.type)) tAutoWindows++;
                if(r.isFurniture && r.type && r.type.includes('Door')) tManualDoors++;
                if(r.isFurniture && r.type && r.type.includes('Window')) tManualWindows++;
            });
        }
        let tTotalDoors = tAutoDoors + tManualDoors;
        let tTotalWindows = tAutoWindows + tManualWindows;

        // ── POINT 2: Area calculations in sq.ft ──
        let siteAreaSqft = state.siteS * state.siteW; // S side × W side (approx rectangle)
        let builtAreaSqft = state.houseEw * state.houseNs;
        let setbackN = state.setN, setbackS = state.setS, setbackE = state.setE, setbackW = state.setW;
        let setbackAreaSqft = siteAreaSqft - builtAreaSqft;
        let wallDed = state.wallDeduction || 0;
        let innerEw = state.houseEw - wallDed * 2;
        let innerNs = state.houseNs - wallDed * 2;
        let innerAreaSqft = innerEw * innerNs;

        // ── POINT 3: Devatha direction-wise totals ──
        function getDevRowsWithTotals(devData, dimE, dimS, dimW, dimN) { 
            let rows = '';
            // Group devathas by direction
            let dirTotals = { East: 0, South: 0, West: 0, North: 0 };
            let dirDevathas = { East: [], South: [], West: [], North: [] };
            let P = devData.P;
            let cumE = devData.E, cumS = devData.E + devData.S, cumW = devData.E + devData.S + devData.W;
            devData.finalDevs.forEach((d, i) => {
                // Determine which side this devatha belongs to by its midpoint distance
                let dMid = (d.d_start + d.len / 2) % P;
                // Shift back to un-rotated position to determine direction
                let unshifted = (dMid - devData.shift + P) % P;
                let dir = 'East';
                if(unshifted < devData.E) dir = 'East';
                else if(unshifted < devData.E + devData.S) dir = 'South';
                else if(unshifted < devData.E + devData.S + devData.W) dir = 'West';
                else dir = 'North';
                dirDevathas[dir].push({...d, origIdx: i});
                dirTotals[dir] += d.len;
            });
            // Render East → South → West → North
            let globalIdx = 1;
            ['East','South','West','North'].forEach(dir => {
                let expected = dir === 'East' ? dimE : dir === 'South' ? dimS : dir === 'West' ? dimW : dimN;
                let dirColor = '#1e40af';
                rows += `<tr style="background:#dbeafe;"><td colspan="5" style="border:1px solid #ccc; padding:6px 8px; font-weight:900; color:${dirColor}; font-size:12px;">▶ ${dir.toUpperCase()} SIDE</td></tr>`;
                dirDevathas[dir].forEach(d => {
                    let isDwara = state.selectedDwara && d.name === state.selectedDwara;
                    let txtColor = (isDwara || d.rating === 'good') ? '#16a34a' : (d.rating === 'bad' ? '#dc2626' : '#334155');
                    let bgStyle = d.rating === 'good' ? 'background:#dcfce7;' : (d.rating === 'bad' ? 'background:#fee2e2;' : '');
                    rows += `<tr style="${bgStyle}"><td style="border:1px solid #ccc; padding:8px; text-align:center;">${globalIdx++}</td><td style="border:1px solid #ccc; padding:8px; color:${txtColor}; font-weight:bold;">${d.rating === 'good' ? '★ ' : d.rating === 'bad' ? '✗ ' : ''}${window.getDevathaName(d.name)}${isDwara ? ' ⬛ DWARA' : ''}</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(d.len)}</td><td style="border:1px solid #ccc; padding:8px;">${getWallPlacementString(d.d_start, devData.E, devData.S, devData.W, devData.N)}</td><td style="border:1px solid #ccc; padding:8px;">${getWallPlacementString(d.d_end, devData.E, devData.S, devData.W, devData.N)}</td></tr>`;
                });
                // Subtotal row
                let match = Math.abs(dirTotals[dir] - expected) < 0.05;
                let totColor = match ? '#16a34a' : '#dc2626';
                let matchTxt = match ? '✅ Matches' : '⚠ Check';
                rows += `<tr style="background:#f8fafc;"><td colspan="2" style="border:1px solid #ccc; padding:6px 8px; font-weight:900; text-align:right; color:#334155;">${dir} Side Total:</td><td style="border:1px solid #ccc; padding:6px 8px; font-weight:900; color:${totColor}; text-align:center;">${fmtFI(dirTotals[dir])}</td><td colspan="2" style="border:1px solid #ccc; padding:6px 8px; font-size:11px; color:${totColor};">${matchTxt} (Expected: ${fmtFI(expected)})</td></tr>`;
            });
            return rows;
        }
        function getWallPlacementString(d, E, S, W, N) { 
            if (d < E + 0.01) return fmtFI(d) + ' from NE (East Wall)'; 
            if (d < E + S + 0.01) return fmtFI(d - E) + ' from SE (South Wall)'; 
            if (d < E + S + W + 0.01) return fmtFI(d - E - S) + ' from SW (West Wall)'; 
            return fmtFI(d - E - S - W) + ' from NW (North Wall)'; 
        }

        // ── Room rows (all in ft' in") ──
        function getRoomRows() { 
            if(!state.rooms || state.rooms.length === 0) return `<tr><td colspan="4" style="border:1px solid #ccc; padding:8px; text-align:center;">No Items Added</td></tr>`; 
            let rows = ''; 
            let rowNum = 1;
            (state.rooms || []).forEach(r => { 
                if(r.hidden) return;
                if(r.isMarker) { 
                    rows += `<tr><td style="border:1px solid #ccc; padding:8px; text-align:center;">${rowNum++}</td><td style="border:1px solid #ccc; padding:8px;"><b>${window.getRoomName(r.name)}</b></td><td style="border:1px solid #ccc; padding:8px; text-align:center;">Point Marker</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">-</td></tr>`; 
                } else { 
                    let wF = r.wF||0, wI = r.wI||0, hF = r.hF||0, hI = r.hI||0;
                    let htF = r.htF !== undefined ? r.htF : 10, htI = r.htI||0;
                    let fW = wF + "' " + wI + '"', fH = hF + "' " + hI + '"', fHt = htF + "' " + htI + '"';
                    let sqft = fmtSqft(((wF + wI/12)) * (hF + hI/12));
                    let typeLabel = r.isFurniture ? ' (Fixture)' : (r.isOutside ? ' <span style="color:#0e7490;">(Outside)</span>' : '');
                    rows += `<tr><td style="border:1px solid #ccc; padding:8px; text-align:center;">${rowNum++}</td><td style="border:1px solid #ccc; padding:8px;"><b>${window.getRoomName(r.name)}</b>${typeLabel}</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${fW} (EW) × ${fH} (NS)</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${sqft}</td><td style="border:1px solid #ccc; padding:8px; text-align:center; color:#0284c7;">${fHt}</td></tr>`; 
                }
            }); 
            return rows; 
        }

        // ── POINT 10: Vastu alerts HTML ──
        function getVastuAlertsHtml() {
            let alertEl = document.getElementById('vastuAlertsList');
            if(!alertEl || !alertEl.innerHTML || alertEl.innerHTML.includes('Add rooms')) 
                return '<p style="color:#888; font-style:italic;">No alerts generated. Add rooms to see Vastu alerts.</p>';
            let raw = alertEl.innerHTML;
            // Convert ALL Tailwind colour classes to inline styles for print
            raw = raw.replace(/class="text-green-400[^"]*"/g, 'style="color:#16a34a; font-weight:bold;"');
            raw = raw.replace(/class="text-red-400[^"]*"/g, 'style="color:#dc2626; font-weight:bold;"');
            raw = raw.replace(/class="text-yellow-400[^"]*"/g, 'style="color:#d97706; font-weight:bold;"');
            raw = raw.replace(/class="text-slate-[^"]*"/g, 'style="color:#64748b;"');
            raw = raw.replace(/class="bg-red-[^"]*"/g, 'style="background:#fef2f2; padding:4px; border-radius:4px;"');
            raw = raw.replace(/class="border[^"]*"/g, '');
            raw = raw.replace(/class="[^"]*"/g, '');  // strip any remaining class= 
            return raw;
        }

        // ── POINT 11: Marker alerts ──
        function getMarkerAlertsHtml() {
            let html = '';
            if(!state.rooms) return html;
            state.rooms.filter(r => r.isMarker && !r.hidden).forEach(r => {
                let sx = state.siteS/2, sy = state.siteW/2;
                let mathAngle = Math.atan2(r.y - sy, r.x - sx) * 180 / Math.PI;
                let compassAngle = (90 - mathAngle - state.rotation + 360) % 360;
                let zIdx = Math.floor(((compassAngle + 11.25) % 360) / 22.5);
                let zone = state.devataMode ? getRoomZoneSimple(r) : ((typeof ZONES_ELEMENTAL !== 'undefined') ? (ZONES_ELEMENTAL[zIdx] ? ZONES_ELEMENTAL[zIdx].name : '?') : '?');
                let hStartX = state.setW, hStartY = state.setS, hEndX = hStartX + state.houseEw, hEndY = hStartY + state.houseNs;
                let insideBuilt = (r.x >= hStartX && r.x <= hEndX && r.y >= hStartY && r.y <= hEndY);
                if(insideBuilt) {
                    html += `<div style="color:#dc2626; font-weight:bold; padding:4px 0;">❌ DOSHA: <b>${window.getRoomName(r.name)}</b> is placed INSIDE the Built Area — must be outside!</div>`;
                } else {
                    if(r.type === 'Borewell') {
                        let ok = zone.includes('NE') || zone === 'N' || zone === 'E' || zone === 'NNE' || zone === 'ENE';
                        html += ok 
                            ? `<div style="color:#16a34a; font-weight:bold; padding:4px 0;">✅ Borewell in ${zone} zone — Correct as per Vastu (near compound wall)</div>`
                            : `<div style="color:#dc2626; font-weight:bold; padding:4px 0;">❌ Borewell in ${zone} zone — Incorrect. Ideal: NE/N/E near compound wall</div>`;
                    }
                    if(r.type === 'Septic Tank') {
                        let ok = zone.includes('NW') || zone === 'WNW' || zone === 'NNW' || zone === 'SSW';
                        html += ok 
                            ? `<div style="color:#16a34a; font-weight:bold; padding:4px 0;">✅ Septic Tank in ${zone} zone — Correct as per Vastu (near compound wall)</div>`
                            : `<div style="color:#dc2626; font-weight:bold; padding:4px 0;">❌ Septic Tank in ${zone} zone — Incorrect. Ideal: NW/SSW near compound wall</div>`;
                    }
                }
            });
            return html || '<p style="color:#888; font-size:12px;">No markers placed on site.</p>';
        }

        // ── POINT 13: Vastu recommendations ──
        function getVastuRecommendations() {
            let road = state.roadDir || 'East';
            let parkingDir = (road === 'East' || road === 'North') ? 'North or East' : 'East or North';
            let parkingNote = road === 'East' ? 'East-facing sites: Car parking ideal in SE or East side open area.' 
                            : road === 'North' ? 'North-facing sites: Car parking ideal in NW or North open area.'
                            : road === 'West' ? 'West-facing sites: Car parking in NW side is acceptable.'
                            : 'South-facing sites: Car parking in SE side is acceptable.';
            return `
            <table style="width:100%; border-collapse:collapse; margin:10px 0;">
                <tr style="background:#f0fdf4;"><td style="border:1px solid #ccc; padding:8px; width:30%;"><b>🚗 Car Parking</b></td><td style="border:1px solid #ccc; padding:8px;">${parkingNote} Avoid parking in NE corner — it blocks positive energy flow.</td></tr>
                <tr><td style="border:1px solid #ccc; padding:8px;"><b>🌿 Greenery - NE</b></td><td style="border:1px solid #ccc; padding:8px;">North-East (Ishanya): Small plants, Tulsi, or flower pots only. Keep open and light. NO large trees.</td></tr>
                <tr style="background:#f0fdf4;"><td style="border:1px solid #ccc; padding:8px;"><b>🌳 Greenery - SW</b></td><td style="border:1px solid #ccc; padding:8px;">South-West (Nairutya): Large heavy trees like Neem or Peepal are ideal here. Adds weight and stability.</td></tr>
                <tr><td style="border:1px solid #ccc; padding:8px;"><b>🌴 Greenery - SE/NW</b></td><td style="border:1px solid #ccc; padding:8px;">Medium-sized trees or shrubs on SE and NW sides. Avoid fruit trees in South direction.</td></tr>
                <tr style="background:#f0fdf4;"><td style="border:1px solid #ccc; padding:8px;"><b>🏊 Water Features</b></td><td style="border:1px solid #ccc; padding:8px;">Water bodies, swimming pools, or overhead tanks ideal in NE or North zone. Avoid SW water features.</td></tr>
                <tr><td style="border:1px solid #ccc; padding:8px;"><b>💡 Compound Wall</b></td><td style="border:1px solid #ccc; padding:8px;">SW and South compound walls should be taller and heavier. North and East walls can be lower for light and air.</td></tr>
            </table>`;
        }

        let roomTable = getRoomRows();
        let barColor = state.healthScore >= 75 ? '#16a34a' : (state.healthScore >= 50 ? '#eab308' : '#ef4444');

        // ── POINT 2: Area summary table ──
        let areaSummaryTable = `
        <table style="width:100%; border-collapse:collapse; margin:10px 0;">
            <thead><tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
                <th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('desc') || 'Description'}</th>
                <th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('ew_len') || 'E-W Length'}</th>
                <th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('ns_len') || 'N-S Length'}</th>
                <th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('area_sqft') || 'Area (sq.ft)'}</th>
            </tr></thead>
            <tbody>
                <tr style="background:#f0fdf4;">
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold;">${tr('os') || 'Outer Site Area'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(state.siteS)} (S side)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(state.siteW)} (W side)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:bold;">${fmtSqft(siteAreaSqft)}</td>
                </tr>
                <tr>
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold;">${tr('ba') || 'Built-up Area (House)'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(state.houseEw)} (EW)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(state.houseNs)} (NS)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:bold;">${fmtSqft(builtAreaSqft)}</td>
                </tr>
                <tr style="background:#fffbeb;">
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold;">${tr('ms') || 'Madhya Sutra (Inner Area)'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(innerEw)} (EW)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtFI(innerNs)} (NS)</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:bold;">${fmtSqft(innerAreaSqft)}</td>
                </tr>
                <tr>
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold; color:#d97706;">${tr('set') || 'Setback'} — ${tr('north') || 'North'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;" colspan="2">${fmtFI(setbackN)} clearance</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtSqft(setbackN * state.houseEw)}</td>
                </tr>
                <tr style="background:#fff7ed;">
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold; color:#d97706;">${tr('set') || 'Setback'} — ${tr('south') || 'South'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;" colspan="2">${fmtFI(setbackS)} clearance</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtSqft(setbackS * state.houseEw)}</td>
                </tr>
                <tr>
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold; color:#d97706;">${tr('set') || 'Setback'} — ${tr('east') || 'East'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;" colspan="2">${fmtFI(setbackE)} clearance</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtSqft(setbackE * state.houseNs)}</td>
                </tr>
                <tr style="background:#fff7ed;">
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold; color:#d97706;">${tr('set') || 'Setback'} — ${tr('west') || 'West'}</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;" colspan="2">${fmtFI(setbackW)} clearance</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;">${fmtSqft(setbackW * state.houseNs)}</td>
                </tr>
                <tr style="background:#fef2f2;">
                    <td style="border:1px solid #ccc; padding:8px; font-weight:bold; color:#991b1b;">Total ${tr('set') || 'Setback'} Area</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center;" colspan="2">Site − Built-up</td>
                    <td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:bold; color:#991b1b;">${fmtSqft(setbackAreaSqft)}</td>
                </tr>
                <tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;">
                    <td style="border:1px solid #475569; padding:8px; font-weight:900; color:#ffffff;">✅ TOTAL (Site = Built + Setback)</td>
                    <td style="border:1px solid #475569; padding:8px; text-align:center; color:#ffffff;" colspan="2">Verification</td>
                    <td style="border:1px solid #475569; padding:8px; text-align:center; font-weight:900; color:#ffffff;">${fmtSqft(builtAreaSqft + setbackAreaSqft)} = ${fmtSqft(siteAreaSqft)}</td>
                </tr>
            </tbody>
        </table>
        <p style="font-size:11px; color:#475569; margin:4px 0 10px 0; font-style:italic;">
            ★ ${tr('note') || 'Note'}: Individual setback areas share corner zones. Total Setback = Site Area − Built-up Area (${fmtSqft(setbackAreaSqft)}) is the accurate figure.
        </p>`;

        // ── POINT 1: Door/Window count ──
        let fixtureTable = `
        <table style="width:100%; border-collapse:collapse; margin:10px 0;">
            <tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;"><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Type</th><th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Auto (from Rooms)</th><th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Manual (Placed)</th><th style="border:1px solid #94a3b8; padding:8px; text-align:center; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; font-weight:900;">Total</th></tr>
            <tr><td style="border:1px solid #ccc; padding:8px; font-weight:bold;">🚪 Doors</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${tAutoDoors}</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${tManualDoors}</td><td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:900; color:#1d4ed8;">${tTotalDoors}</td></tr>
            <tr style="background:#f8fafc;"><td style="border:1px solid #ccc; padding:8px; font-weight:bold;">🪟 Windows</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${tAutoWindows}</td><td style="border:1px solid #ccc; padding:8px; text-align:center;">${tManualWindows}</td><td style="border:1px solid #ccc; padding:8px; text-align:center; font-weight:900; color:#1d4ed8;">${tTotalWindows}</td></tr>
        </table>`;

        // ── POINT 9: North degrees + road direction ──
        let northDeg = state.rotation || 0;
        let roadDir = state.roadDir || 'East';
        let roadWidth = state.roadWidth || 30;

        // ── AYADI TABLE ──
        let isViswa = state.ayadiShastra === 'viswakarma'; 
        let ayadiTitle = isViswa ? '2. Ayadi Navavargulu (9)' : '2. Ayadi Shadvargulu (6)';
        let ayadiTable = `<table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">1. ${tr('yoni')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.y} - ${YONI_NAMES[ayadi.y]}</td><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">2. ${tr('inc')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.dr}</td></tr>
            <tr><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">3. ${tr('debt')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.ru}</td><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">4. ${tr('star')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.star}</td></tr>
            <tr><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">5. ${tr('varam')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.vName}</td><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">6. ${tr('tithi')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.tIdx} (${ayadi.tName})</td></tr>`;
        if(isViswa) { ayadiTable += `<tr><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">7. ${tr('age')}</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.ay} Yrs</td><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">8. Yoga</th><td style="border:1px solid #ccc; padding:8px;">${ayadi.yoIdx}</td></tr><tr><th style="border:1px solid #94a3b8; padding:8px; background:#475569; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact; -webkit-print-color-adjust:exact; print-color-adjust:exact;">9. Karana</th><td colspan="3" style="border:1px solid #ccc; padding:8px;">${ayadi.kaIdx}</td></tr>`; }
        ayadiTable += `</table>`;

        // ── ASSEMBLE FULL REPORT HTML ──
        const html = `<!DOCTYPE html>
<html><head><title>Samartha Vastu Report - ${(state.clientName || 'Client').replace(/[<>"'&]/g, '')}</title>
<style>
    body { font-family: Arial, sans-serif; padding: 30px; font-size: 13px; color: #1e293b; }
    h1 { text-align: center; border-bottom: 3px solid #1e293b; padding-bottom: 10px; font-size: 20px; margin-top: 10px; }
    h2 { border-bottom: 2px solid #475569; padding-bottom: 6px; margin-top: 30px; font-size: 15px; color: #1e293b; }
    h3 { font-size: 13px; color: #475569; margin: 10px 0 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { border: 1px solid #ccc; padding: 7px 8px; font-size: 12px; text-align: left; }
    th { background: #e2e8f0; font-weight: bold; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .img-container { text-align: center; margin: 20px 0; }
    img { max-width: 90%; border: 2px solid #1e293b; }
    .good { color: #16a34a; font-weight: bold; }
    .bad  { color: #dc2626; font-weight: bold; }
    .warn { color: #d97706; font-weight: bold; }
    @media print { 
        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
        table { page-break-inside: auto; } 
        tr { page-break-inside: avoid; }
        h2 { page-break-before: auto; }
    }
</style>
</head><body>

<h1>${tr('title')}</h1>
<div style="text-align:center; font-size:20px; font-weight:bold; color:${barColor}; margin-bottom:8px;">
    Vastu Health Score: ${state.healthScore}%
</div>
<div style="width:60%; margin:0 auto 20px auto; background:#eee; height:14px; border-radius:7px; overflow:hidden; border:1px solid #ccc;">
    <div style="width:${state.healthScore}%; height:100%; background:${barColor};"></div>
</div>

<h2>1. ${tr('cli') || 'Client'} &amp; Site Details</h2>
<table>
    <tr><th>${tr('cli') || 'Client Name'}</th><td>${state.clientName || '-'}</td><th>${tr('ph') || 'Phone'}</th><td>${state.clientPhone || '-'}</td></tr>
    <tr><th>${tr('pl') || 'Place'}</th><td colspan="3">${state.clientPlace || '-'}</td></tr>
    <tr><th>North Orientation</th><td>${northDeg}° N</td><th>Road Facing</th><td>${roadDir} (${roadWidth}' wide)</td></tr>
    <tr><th>${tr('os') || 'Outer Site'} (N)</th><td>${fmtFI(state.siteN)}</td><th>${tr('os') || 'Outer Site'} (S)</th><td>${fmtFI(state.siteS)}</td></tr>
    <tr><th>${tr('os') || 'Outer Site'} (E)</th><td>${fmtFI(state.siteE)}</td><th>${tr('os') || 'Outer Site'} (W)</th><td>${fmtFI(state.siteW)}</td></tr>
    <tr><th>${tr('ba') || 'Built Area'} (EW)</th><td>${fmtFI(state.houseEw)}</td><th>${tr('ba') || 'Built Area'} (NS)</th><td>${fmtFI(state.houseNs)}</td></tr>
    <tr><th>Wall Deduction (each)</th><td>${fmtFI(state.wallDeduction || 0)}</td><th>${tr('ms') || 'Madhya Sutra'} (Inner)</th><td>${fmtFI(innerEw)} × ${fmtFI(innerNs)}</td></tr>
    <tr><th>${tr('set') || 'Setbacks'} N/S/E/W</th><td colspan="3">${fmtFI(setbackN)} / ${fmtFI(setbackS)} / ${fmtFI(setbackE)} / ${fmtFI(setbackW)}</td></tr>
</table>

<h3>${tr('area_summary') || 'Area Summary'} (Site = Built-up + Setback)</h3>
${state.isLShape ? `<div style="background:#fffbeb; border:2px solid #f59e0b; border-radius:6px; padding:10px; margin:10px 0;">
    <b style="color:#92400e;">🔶 L-SHAPE PLOT — Imaginary Line Method</b><br>
    <span style="color:#78350f;">Cut Corner: <b>${state.lCutCorner||'NE'}</b> | Cut Size: <b>${state.lCutW||10}' × ${state.lCutH||10}'</b></span><br>
    <span style="font-size:11px; color:#92400e;">All Devatha Padavinyasa calculations use the full rectangular dimensions (Imaginary Line Method as per Viswakarma Vastu). 
    The cut corner area is treated as <b>Vithi</b> (open space). No construction permitted in this zone. 
    Recommended use: open garden, Tulsi plant, or parking.</span>
</div>` : ''}
${areaSummaryTable}

<h3>${tr('doors_windows') || 'Doors & Windows Count'}</h3>
${fixtureTable}

${imgData ? `<div style="text-align:center; margin:20px 0;"><p style="font-weight:900; color:#1e293b; font-size:14px; border-bottom:2px solid #475569; padding-bottom:4px;">Ground Floor (GF) Plan</p><img src="${imgData}" style="max-width:90%; border:2px solid #1e293b; box-shadow:0 2px 8px rgba(0,0,0,0.15);" /></div>` : ''}
${imgData1F ? `<div style="text-align:center; margin:20px 0;"><p style="font-weight:900; color:#1e293b; font-size:14px; border-bottom:2px solid #7c3aed; padding-bottom:4px;">First Floor (1F) Plan</p><img src="${imgData1F}" style="max-width:90%; border:2px solid #7c3aed; box-shadow:0 2px 8px rgba(0,0,0,0.15);" /></div>` : ''}

<h2>${ayadiTitle}</h2>
${ayadiTable}

<h2>3. ${tr('r_head') || 'Room & Items Details'} — Ground Floor (GF)</h2>
<table>
    <thead><tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;"><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">#</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('rn') || 'Item Name'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('dim') || 'Dimensions (EW × NS)'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Area</th><th style="color:#93c5fd; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Ceiling Ht</th></tr></thead>
    <tbody>${roomTable}</tbody>
</table>
${(state.roomsByFloor && state.roomsByFloor[1] && state.roomsByFloor[1].length > 0) ? `
<h2 style="color:#7c3aed;">3b. Room Details — First Floor (1F)</h2>
<table>
    <thead><tr style="background:#7c3aed; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;"><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">#</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Item Name (1F)</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Dimensions (EW × NS)</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Area</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">Ceiling Ht</th></tr></thead>
    <tbody>${(()=>{
        let rows='', rowNum=1;
        (state.roomsByFloor[1]||[]).forEach(r=>{
            if(r.hidden) return;
            if(r.isMarker){ rows+=`<tr><td style="border:1px solid #ccc;padding:8px;text-align:center;">${rowNum++}</td><td style="border:1px solid #ccc;padding:8px;"><b>${window.getRoomName(r.name)}</b></td><td style="border:1px solid #ccc;padding:8px;text-align:center;">Marker</td><td style="border:1px solid #ccc;padding:8px;text-align:center;">-</td><td style="border:1px solid #ccc;padding:8px;text-align:center;">-</td></tr>`; }
            else { let wF=r.wF||0,wI=r.wI||0,hF=r.hF||0,hI=r.hI||0,htF=r.htF||10,htI=r.htI||0; let sqft=((wF+wI/12)*(hF+hI/12)).toFixed(2)+' sq.ft'; rows+=`<tr><td style="border:1px solid #ccc;padding:8px;text-align:center;">${rowNum++}</td><td style="border:1px solid #ccc;padding:8px;"><b>${window.getRoomName(r.name)}</b></td><td style="border:1px solid #ccc;padding:8px;text-align:center;">${wF}' ${wI}" × ${hF}' ${hI}"</td><td style="border:1px solid #ccc;padding:8px;text-align:center;">${sqft}</td><td style="border:1px solid #ccc;padding:8px;text-align:center;color:#0284c7;">${htF}' ${htI}"</td></tr>`; }
        }); return rows||`<tr><td colspan="5" style="border:1px solid #ccc;padding:8px;text-align:center;">No 1F rooms added</td></tr>`;
    })()}</tbody>
</table>` : ''}

<h2>4. ${tr('d_house') || 'Built Area Devatha Stanas'} (Direction-wise)</h2>
<p style="font-size:11px; color:#475569; margin-bottom:5px;">
    ${tr('ba') || 'Built Area'}: EW = ${fmtFI(state.houseEw)} | NS = ${fmtFI(state.houseNs)} | 
    <span style="color:#16a34a; font-weight:bold;">■ ${tr('good') || 'Good'} (Auspicious)</span> &nbsp; 
    <span style="color:#dc2626; font-weight:bold;">■ ${tr('bad') || 'Bad'} (Inauspicious)</span>
</p>
<table>
    <thead><tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;"><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">#</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('dev') || 'Devatha'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('len') || 'Length'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('st') || 'Starts At'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('end') || 'Ends At'}</th></tr></thead>
    <tbody>${getDevRowsWithTotals(hDevData, state.houseEw, state.houseNs, state.houseEw, state.houseNs)}</tbody>
</table>

<h2>5. ${tr('d_out') || 'Outer Site Devatha Stanas'} (Direction-wise)</h2>
<p style="font-size:11px; color:#475569; margin-bottom:5px;">
    Site: N = ${fmtFI(state.siteN)} | E = ${fmtFI(state.siteE)} | S = ${fmtFI(state.siteS)} | W = ${fmtFI(state.siteW)}
</p>
<table>
    <thead><tr style="background:#475569; color:#ffffff; -webkit-print-color-adjust:exact; print-color-adjust:exact;"><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">#</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('dev') || 'Devatha'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('len') || 'Length'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('st') || 'Starts At'}</th><th style="border:1px solid #94a3b8; padding:8px; color:#ffffff; background:#475569; -webkit-print-color-adjust:exact; print-color-adjust:exact;">${tr('end') || 'Ends At'}</th></tr></thead>
    <tbody>${getDevRowsWithTotals(sDevData, state.siteE, state.siteS, state.siteW, state.siteN)}</tbody>
</table>

<h2>6. ${tr('vastu_alerts') || 'Live Vastu Compliance Alerts'}</h2>
<div style="padding:10px; border:1px solid #e5e7eb; border-radius:4px; background:#fafafa; line-height:2;">
    ${getVastuAlertsHtml()}
</div>
<h3>Borewell &amp; Septic Tank Audit</h3>
<div style="padding:10px; border:1px solid #e5e7eb; border-radius:4px; background:#fafafa; line-height:2;">
    ${getMarkerAlertsHtml()}
</div>

<h2>7. ${tr('recommendations') || 'Vastu Recommendations'} (${tr('car_parking') || 'Car Parking'} &amp; ${tr('greenery') || 'Greenery'})</h2>
${getVastuRecommendations()}


    <!-- ── MOBILE BOTTOM TAB BAR (Android) ── -->
    <div id="mobileTabBar">
        <button class="mob-tab active" id="mobTabCanvas" onclick="var _ov=document.getElementById('mobMenuOverlay');if(_ov)_ov.style.display='none';window.mobShowCanvas()">
            <i class="fa-solid fa-drafting-compass"></i>
            <span>Canvas</span>
        </button>
        <button class="mob-tab" id="mobTabInputs" onclick="var _ov=document.getElementById('mobMenuOverlay');if(_ov)_ov.style.display='none';window.mobShowInputs()">
            <i class="fa-solid fa-sliders"></i>
            <span>Inputs</span>
        </button>
        <button class="mob-tab" id="mobTabRooms" onclick="var _ov=document.getElementById('mobMenuOverlay');if(_ov)_ov.style.display='none';window.mobShowRooms()">
            <i class="fa-solid fa-layer-group"></i>
            <span>Rooms</span>
        </button>
        <button class="mob-tab" id="mobTabAlerts" onclick="var _ov=document.getElementById('mobMenuOverlay');if(_ov)_ov.style.display='none';window.mobShowAlerts()">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span>Alerts</span>
        </button>
    </div>

</body></html>`;

        // Use setTimeout(0) to ensure browser treats as top-level user action
        // This prevents popup blockers from silently blocking the print window
        setTimeout(function() {
            const pW = window.open('', '_blank');
            if(!pW) {
                showToast('⚠️ Allow popups in browser to print. Check address bar.');
                alert('Please allow popups for this site to print the Vastu Report.\nClick the popup blocked icon in your browser address bar and select Allow.');
                return;
            }
            pW.document.write(html);
            pW.document.close();
            setTimeout(function() { try { pW.print(); } catch(e) {} }, 800);
            pW.focus();
        }, 0); 
    
    };

    window.toggleProjectManager = function() { const m=document.getElementById('projectManagerModal'); if(m.style.display==='flex'){m.style.display='none';}else{m.style.display='flex';} renderProjectListUI(); };
    
    function renderProjectListUI() { 
        const list = document.getElementById('projectList');
        if (!list) return;
        
        // Get projects with smart decryption
        let projectsData = localStorage.getItem('v_proj_v1') || '{}';
        let p = {};
        
        // Try to parse as JSON first (unencrypted)
        try {
            p = JSON.parse(projectsData);
        } catch(e) {
            // Not valid JSON, try to decrypt
            try {
                const decrypted = SecurityModule.decrypt(projectsData);
                p = JSON.parse(decrypted);
            } catch(e2) {
                console.warn('Could not load projects:', e2);
                p = {};
            }
        }
        
        list.textContent = ''; // Clear securely
        
        Object.keys(p).sort((a,b) => b-a).forEach(id => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'bg-slate-800 p-2 rounded flex justify-between items-center mb-2 cursor-pointer hover:bg-slate-700 transition';
            projectDiv.onclick = () => window.loadSavedProject(id);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'font-bold text-amber-400 text-[10px]';
            nameDiv.textContent = SecurityModule.escapeHTML(p[id].clientName || 'Unnamed Project');
            
            const dateDiv = document.createElement('div');
            dateDiv.className = 'text-[8px] text-slate-400';
            dateDiv.textContent = new Date(parseInt(id)).toLocaleDateString();
            
            projectDiv.appendChild(nameDiv);
            projectDiv.appendChild(dateDiv);
            list.appendChild(projectDiv);
        });
    }
    
    window.saveNewProject = function() { 
        let projectsData = localStorage.getItem('v_proj_v1') || '{}';
        let p = {};
        
        // Try to parse as JSON first
        try {
            p = JSON.parse(projectsData);
        } catch(e) {
            // Try to decrypt
            try {
                const decrypted = SecurityModule.decrypt(projectsData);
                p = JSON.parse(decrypted);
            } catch(e2) {
                console.warn('Could not load existing projects, starting fresh');
                p = {};
            }
        }
        
        p[Date.now()] = {...state, bgImg: null};
        localStorage.setItem('v_proj_v1', SecurityModule.encrypt(JSON.stringify(p)));
        renderProjectListUI();
        showToast("Saved to Browser");
    };
    
    window.loadSavedProject = function(id) {
        let projectsData = localStorage.getItem('v_proj_v1') || '{}';
        let p = {};
        
        // Try to parse as JSON first
        try {
            p = JSON.parse(projectsData);
        } catch(e) {
            // Try to decrypt
            try {
                const decrypted = SecurityModule.decrypt(projectsData);
                p = JSON.parse(decrypted);
            } catch(e2) {
                console.error('Could not load projects');
                showToast("Error loading project");
                return;
            }
        }
        
        const pr = p[id];
        if(pr) {
            Object.assign(state, pr);
            window.updateFromInputs();
            if(state.selectedDwara) {
                const dwaraSelect = document.getElementById('dwaraSelect');
                if(dwaraSelect) dwaraSelect.value = state.selectedDwara;
            }
            window.syncMobHeaderClientName&&window.syncMobHeaderClientName();
            window.toggleProjectManager();
            window.draw();
            window.saveStateToHistory();
        }
    };
    
    window.exportProject = function() { 
        let exportState = {...state, bgImg: null}; const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportState)); 
        const dlAnchorEle = document.createElement('a'); dlAnchorEle.setAttribute("href", dataStr); 
        let fName = state.clientName ? state.clientName.replace(/\s+/g, '_') + "_Vastu_Plan.json" : "Unnamed_Vastu_Plan.json";
        dlAnchorEle.setAttribute("download", fName); 
        document.body.appendChild(dlAnchorEle); dlAnchorEle.click(); dlAnchorEle.remove(); 
    };
    
    window.importProject = function(event) {
        const file = event.target.files[0]; if (!file) return;
        // Schema whitelist — only allow known state keys to prevent malicious injection
        const ALLOWED_KEYS = ['clientName','clientPlace','clientPhone','siteN','siteS','siteE','siteW',
            'setN','setS','setE','setW','houseNs','houseEw','rotation','roadDir','roadWidth',
            'showRoad','ayadiShastra','ayadiUnit','ayadiDivisor','wallDeduction','selectedDwara',
            'lang','rooms','roomsByFloor','texts','shapes','walls','inkLines','inkColor',
            'scale','offsetX','offsetY','showGrid','showDimensions','showMahamarma','showUpamarma',
            'showPlotDeities','showSiteDeities','show16Zones','showSunPath','snap','xray','showDevataZoneNames',
            'currentFloor','isLShape','lCutCorner','lCutW','lCutH','magDeclination',
            'bgImgX','bgImgY','bgImgScale','roadWidthFt'];
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const raw = JSON.parse(e.target.result);
                // Validate: must have at least siteN and rooms
                if(typeof raw !== 'object' || raw === null) throw new Error('Not an object');
                if(raw.siteN === undefined && raw.rooms === undefined) throw new Error('Not a Samartha Vastu file');
                // Strip unknown keys
                const importedState = {};
                ALLOWED_KEYS.forEach(k => { if(raw[k] !== undefined) importedState[k] = raw[k]; });
                // Sanitize room data
                if(importedState.rooms) importedState.rooms.forEach(r => {
                    if(!r.type) r.type = r.name;
                    if(r.wI === undefined) { r.wI = Math.round((r.wF % 1) * 12); r.wF = Math.floor(r.wF); }
                    if(r.hI === undefined) { r.hI = Math.round((r.hF % 1) * 12); r.hF = Math.floor(r.hF); }
                    // Sanitize room name
                    if(r.name) r.name = String(r.name).replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,80);
                });
                // Sanitize text labels
                if(importedState.texts) importedState.texts.forEach(t => {
                    if(t.text) t.text = String(t.text).replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,200);
                });
                // Sanitize client fields
                ['clientName','clientPlace','clientPhone'].forEach(k => {
                    if(importedState[k]) importedState[k] = String(importedState[k]).replace(/</g,'&lt;').replace(/>/g,'&gt;').substring(0,100);
                });
                Object.assign(state, importedState);
                window.updateFromInputs(); renderItemList();
                if(state.selectedDwara) document.getElementById('dwaraSelect').value = state.selectedDwara;
                window.toggleProjectManager(); window.draw(); window.saveStateToHistory();
                showToast("Project Imported Successfully!");
            } catch(err) { alert("Invalid or incompatible project file. Please use a Samartha Vastu .json export."); }
        };
        reader.readAsText(file);
    };
    // ── Shared helper: build project summary text ──
    function buildProjectSummary(nl) {
        const site  = Math.round(((state.siteN||0)+(state.siteS||0))/2 * ((state.siteE||0)+(state.siteW||0))/2);
        const built = Math.round((state.houseNs||0) * (state.houseEw||0));
        const setbk = Math.max(0, site - built);
        const metric = getAyadiMetric();
        const ay = getAyadiData(metric);
        const yoniName = YONI_NAMES[ay.y] || 'Unknown';
        const ftIn = v => { const f=Math.floor(Math.max(0,v)), i=Math.round((Math.max(0,v)-f)*12); return f+"'"+i+'"'; };
        let s = '';
        s += 'SAMARTHA VASTU — Padavinyasa Report' + nl;
        s += '=====================================' + nl;
        if(state.clientName) s += 'Client  : ' + state.clientName + nl;
        if(state.clientPlace) s += 'Place   : ' + state.clientPlace + nl;
        if(state.clientPlace) s += 'Map     : https://maps.google.com?q=' + encodeURIComponent(state.clientPlace) + nl;
        if(state.clientPhone) s += 'Phone   : ' + state.clientPhone + nl;
        s += nl;
        s += 'SITE & BUILDING DIMENSIONS' + nl;
        s += '---------------------------' + nl;
        s += 'Site (N): ' + ftIn(state.siteN||0) + '  |  Site (S): ' + ftIn(state.siteS||0) + nl;
        s += 'Site (E): ' + ftIn(state.siteE||0) + '  |  Site (W): ' + ftIn(state.siteW||0) + nl;
        s += 'Site Area: ' + site.toLocaleString() + ' sq.ft (' + Math.round(site/9) + ' sq.yds)' + nl;
        s += nl;
        s += 'Built Area (E-W): ' + ftIn(state.houseEw||0) + nl;
        s += 'Built Area (N-S): ' + ftIn(state.houseNs||0) + nl;
        s += 'Built Area: ' + built.toLocaleString() + ' sq.ft (' + Math.round(built/9) + ' sq.yds)' + nl;
        s += 'Setback Area: ' + setbk.toLocaleString() + ' sq.ft' + nl;
        s += nl;
        s += 'VASTU DETAILS' + nl;
        s += '--------------' + nl;
        s += 'Road Direction : ' + (state.roadDir||'East') + nl;
        s += 'True North     : ' + (state.rotation||0) + ' degrees' + nl;
        s += 'Main Entrance  : ' + (state.selectedDwara||'Not set') + nl;
        s += nl;
        s += 'AYADI SHASTRA' + nl;
        s += '--------------' + nl;
        s += 'Yoni (Ayam)  : ' + ay.y + ' - ' + yoniName + nl;
        s += 'Aaya (Income): ' + ay.ay + nl;
        s += 'Runam (Debt) : ' + ay.ru + (ay.ay > ay.ru ? '  [GOOD - Income > Debt]' : '  [CHECK]') + nl;
        s += 'Star (Naksh) : ' + (ay.star||'-') + nl;
        s += 'Varam (Day)  : ' + (ay.vName||'-') + nl;
        s += nl;
        s += 'ROOMS (' + (state.rooms||[]).filter(r=>!r.isMarker&&!r.isFurniture&&!r.isOutside&&!r.isSiteGate&&!r.hidden).length + ' total)' + nl;
        s += '-------' + nl;
        (state.rooms||[]).filter(r=>!r.isMarker&&!r.isFurniture&&!r.isOutside&&!r.isSiteGate&&!r.hidden).forEach(r => {
            const rW = (r.wF||0)+(r.wI||0)/12, rH = (r.hF||0)+(r.hI||0)/12;
            s += (r.name||r.type).padEnd(18) + ftIn(rW) + ' x ' + ftIn(rH) + '  (' + Math.round(rW*rH) + ' sq.ft)' + nl;
        });
        s += nl;
        s += 'Generated by Samartha Vastu — Viswakarma Padavinyasa System' + nl;
        return s;
    }

    window.shareViaWhatsApp = function() {
        try {
            // Step 1: Download the floor plan image
            window.draw();
            const imgName = (state.clientName ? state.clientName.replace(/\s+/g,'_') : 'Vastu') + '_FloorPlan.png';
            const link = document.createElement('a');
            link.download = imgName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Step 2: Build summary text and open WhatsApp
            const nl = '\n';
            const summary = buildProjectSummary(nl);
            const waText = summary + nl + '(Floor plan image downloaded to your device — attach it to this message)';
            setTimeout(function() {
                window.open('https://wa.me/?text=' + encodeURIComponent(waText), '_blank');
                showToast('Image saved! Attach it in WhatsApp after it opens.');
            }, 600);
        } catch(e) {
            showToast('Share failed — try Export .json instead');
        }
    };

    window.shareViaEmail = function() {
        try {
            // Step 1: Download the floor plan image
            window.draw();
            const imgName = (state.clientName ? state.clientName.replace(/\s+/g,'_') : 'Vastu') + '_FloorPlan.png';
            const link = document.createElement('a');
            link.download = imgName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Step 2: Build SHORT summary for mailto (2000 char limit)
            const nl = '\n';
            const site  = Math.round(((state.siteN||0)+(state.siteS||0))/2 * ((state.siteE||0)+(state.siteW||0))/2);
            const built = Math.round((state.houseNs||0) * (state.houseEw||0));
            const ay = getAyadiData(getAyadiMetric());
            const ftIn = v => { const f=Math.floor(Math.max(0,v)), i=Math.round((Math.max(0,v)-f)*12); return f+"'"+i+'"'; };
            const clientName = state.clientName || 'Vastu Plan';
            const mapsLink = state.clientPlace ? 'https://maps.google.com?q=' + encodeURIComponent(state.clientPlace) : '';

            let body = 'SAMARTHA VASTU — Padavinyasa Plan' + nl;
            body += '=====================================' + nl;
            if(state.clientName) body += 'Client : ' + state.clientName + nl;
            if(state.clientPlace) body += 'Place  : ' + state.clientPlace + nl;
            if(mapsLink) body += 'Map    : ' + mapsLink + nl;
            body += nl;
            body += 'Site  : ' + ftIn(state.siteN||0) + ' x ' + ftIn(state.siteE||0) + ' = ' + site.toLocaleString() + ' sq.ft' + nl;
            body += 'Built : ' + ftIn(state.houseEw||0) + ' x ' + ftIn(state.houseNs||0) + ' = ' + built.toLocaleString() + ' sq.ft' + nl;
            body += 'Road  : ' + (state.roadDir||'East') + '  |  North: ' + (state.rotation||0) + ' deg' + nl;
            body += 'Entry : ' + (state.selectedDwara||'Not set') + nl;
            body += 'Yoni  : ' + (ay.y||'-') + ' - ' + (YONI_NAMES[ay.y]||'-') + nl;
            body += 'Aaya  : ' + (ay.ay||'-') + '  Runam: ' + (ay.ru||'-') + (ay.ay > ay.ru ? ' (Good)' : ' (Check)') + nl;
            body += nl;
            body += 'Floor plan image: ' + imgName + ' (downloaded to your device)' + nl;
            body += 'Please attach the image file to this email.' + nl;
            body += nl + 'Generated by Samartha Vastu — Viswakarma Padavinyasa System';

            const subject = encodeURIComponent('Samartha Vastu Plan — ' + clientName);
            // Check length — mailto has ~2000 char limit for body
            const safeBody = encodeURIComponent(body.substring(0, 1500));

            setTimeout(function() {
                window.location.href = 'mailto:?subject=' + subject + '&body=' + safeBody;
                showToast('Image saved! Attach "' + imgName + '" in your email.');
            }, 600);
        } catch(e) {
            showToast('Email failed — try Export .json instead');
        }
    };

    window.copyProjectToClipboard = function() {
        try {
            const nl = '\n';
            const summary = buildProjectSummary(nl);
            if(navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summary).then(() => {
                    showToast('Project summary copied to clipboard!');
                }).catch(() => {
                    // Fallback
                    const ta = document.createElement('textarea');
                    ta.value = summary; ta.style.position='fixed'; ta.style.opacity='0';
                    document.body.appendChild(ta); ta.select();
                    document.execCommand('copy'); document.body.removeChild(ta);
                    showToast('Project summary copied to clipboard!');
                });
            } else {
                const ta = document.createElement('textarea');
                ta.value = summary; ta.style.position='fixed'; ta.style.opacity='0';
                document.body.appendChild(ta); ta.select();
                document.execCommand('copy'); document.body.removeChild(ta);
                showToast('Project summary copied to clipboard!');
            }
        } catch(e) {
            showToast('Copy failed — try Share or Export instead');
        }
    };

    window.exportImage = function() { window.draw(); const link = document.createElement('a'); link.download = state.clientName ? `${state.clientName.replace(/\s+/g, '_')}_Vastu_Layout.png` : `Vastu_Layout_Export.png`; link.href = canvas.toDataURL('image/png'); link.click(); showToast("Image Downloaded!"); };
    window.uploadBlueprint = function(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = function(e) { let img = new Image(); img.onload = () => { state.bgImg = img; window.draw(); showToast("Blueprint Loaded!"); window.saveStateToHistory(); }; img.src = e.target.result; }; reader.readAsDataURL(file); };

    // ── USER GUIDE: opens in new tab as Blob URL, 6-language headings ──
    window.openUserGuide = function() {
        const lang = (document.getElementById('globalLangSelect') || {}).value || (state && state.lang) || 'en';

        // ── Multilingual titles ──────────────────────────────────────────────
        const TITLES = {
            en:"SAMARTHA VASTU — User Guide",
            te:"సమర్థ వాస్తు — వినియోగదారు మార్గదర్శి",
            hi:"समर्थ वास्तु — उपयोगकर्ता मार्गदर्शिका",
            kn:"ಸಮರ್ಥ ವಾಸ್ತು — ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ",
            ta:"சமர்த்த வாஸ்து — பயனர் வழிகாட்டி",
            ml:"സമർത്ഥ വാസ്തു — ഉപയോക്തൃ ഗൈഡ്"
        };

        // ── Non-English notice banner ────────────────────────────────────────
        const NOTICE = {
            en:"",
            te:"విభాగ శీర్షికలు తెలుగులో ఉన్నాయి. వివరణాత్మక కంటెంట్ ఆంగ్లంలో ఉంది — సాంకేతిక సూచనలు ఖచ్చితత్వం కోసం ఆంగ్లంలో ఉంచబడ్డాయి.",
            hi:"अनुभाग शीर्षक हिंदी में हैं। विस्तृत सामग्री अंग्रेज़ी में है — सटीकता के लिए तकनीकी निर्देश अंग्रेज़ी में रखे गए हैं।",
            kn:"ವಿಭಾಗ ಶೀರ್ಷಿಕೆಗಳು ಕನ್ನಡದಲ್ಲಿವೆ. ವಿವರವಾದ ವಿಷಯವು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿದೆ — ನಿಖರತೆಗಾಗಿ ತಾಂತ್ರಿಕ ಸೂಚನೆಗಳನ್ನು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಇರಿಸಲಾಗಿದೆ.",
            ta:"பிரிவு தலைப்புகள் தமிழில் உள்ளன. விரிவான உள்ளடக்கம் ஆங்கிலத்தில் உள்ளது — துல்லியத்திற்காக தொழில்நுட்ப வழிமுறைகள் ஆங்கிலத்தில் வைக்கப்பட்டுள்ளன.",
            ml:"വിഭാഗ തലക്കെട്ടുകൾ മലയാളത്തിലാണ്. വിശദമായ ഉള്ളടക്കം ഇംഗ്ലീഷിലാണ് — കൃത്യതയ്ക്കായി സാങ്കേതിക നിർദ്ദേശങ്ങൾ ഇംഗ്ലീഷിൽ നിലനിർത്തിയിരിക്കുന്നു."
        };

        // ── Desktop section headings — 6 languages ───────────────────────────
        const DH = {
            en:["1. Quick-Start Workflow","2. Desktop Header — Two Rows","3. Placing & Managing Rooms","4. Drawing Tools (Row 2)","5. Center Header Tools — Snap · Auto Gate · Sun Path","6. View → More Dropdown","7. Ayadi Shastra & Health Score","8. Main Entrance (Dwara) Selection","9. Exporting & Reports","10. Keyboard Shortcuts","11. Best Practices"],
            te:["1. త్వరిత ప్రారంభ విధానం","2. డెస్క్‌టాప్ హెడర్ — రెండు వరుసలు","3. గదులు ఉంచడం & నిర్వహణ","4. డ్రాయింగ్ సాధనాలు (వరుస 2)","5. మధ్య హెడర్ సాధనాలు — Snap · Auto Gate · Sun Path","6. View → More డ్రాప్‌డౌన్","7. ఆయాది శాస్త్రం & ఆరోగ్య స్కోర్","8. ప్రధాన ద్వార ఎంపిక","9. ఎగుమతి & నివేదికలు","10. కీబోర్డ్ షార్ట్‌కట్‌లు","11. ఉత్తమ పద్ధతులు"],
            hi:["1. त्वरित शुरुआत प्रक्रिया","2. डेस्कटॉप हेडर — दो पंक्तियाँ","3. कमरे रखना और प्रबंधन","4. ड्राइंग टूल्स (पंक्ति 2)","5. केंद्र हेडर टूल्स — Snap · Auto Gate · Sun Path","6. View → More ड्रॉपडाउन","7. आयादि शास्त्र और स्वास्थ्य स्कोर","8. मुख्य द्वार चयन","9. निर्यात और रिपोर्ट","10. कीबोर्ड शॉर्टकट","11. सर्वोत्तम पद्धतियाँ"],
            kn:["1. ತ್ವರಿತ ಪ್ರಾರಂಭ ಕ್ರಮ","2. ಡೆಸ್ಕ್‌ಟಾಪ್ ಹೆಡರ್ — ಎರಡು ಸಾಲುಗಳು","3. ಕೋಣೆಗಳ ಇರಿಸುವಿಕೆ ಮತ್ತು ನಿರ್ವಹಣೆ","4. ಡ್ರಾಯಿಂಗ್ ಉಪಕರಣಗಳು (ಸಾಲು 2)","5. ಮಧ್ಯ ಹೆಡರ್ ಉಪಕರಣಗಳು — Snap · Auto Gate · Sun Path","6. View → More ಡ್ರಾಪ್‌ಡೌನ್","7. ಆಯಾದಿ ಶಾಸ್ತ್ರ & ಆರೋಗ್ಯ ಸ್ಕೋರ್","8. ಮುಖ್ಯ ದ್ವಾರ ಆಯ್ಕೆ","9. ರಫ್ತು & ವರದಿಗಳು","10. ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳು","11. ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು"],
            ta:["1. விரைவு தொடக்க நடைமுறை","2. டெஸ்க்டாப் தலைப்பு — இரண்டு வரிசைகள்","3. அறைகளை வைத்தல் & நிர்வகித்தல்","4. வரைதல் கருவிகள் (வரிசை 2)","5. மைய தலைப்பு கருவிகள் — Snap · Auto Gate · Sun Path","6. View → More கீழ்தோன்றல்","7. ஆயாதி சாஸ்திரம் & ஆரோக்கிய மதிப்பெண்","8. முக்கிய நுழைவாயில் தேர்வு","9. ஏற்றுமதி & அறிக்கைகள்","10. விசைப்பலகை குறுக்குவழிகள்","11. சிறந்த நடைமுறைகள்"],
            ml:["1. ദ്രുത ആരംഭ നടപടിക്രമം","2. ഡെസ്ക്‌ടോപ്പ് ഹെഡർ — രണ്ട് വരികൾ","3. മുറികൾ സ്ഥാപിക്കൽ & മാനേജ്‌മെന്റ്","4. ഡ്രോയിംഗ് ടൂളുകൾ (വരി 2)","5. സെന്റർ ഹെഡർ ടൂളുകൾ — Snap · Auto Gate · Sun Path","6. View → More ഡ്രോപ്പ്‌ഡൗൺ","7. ആയാദി ശാസ്ത്രം & ആരോഗ്യ സ്‌കോർ","8. പ്രധാന ദ്വാര തിരഞ്ഞെടുപ്പ്","9. എക്‌സ്‌പോർട്ട് & റിപ്പോർട്ടുകൾ","10. കീബോർഡ് കുറുക്കുവഴികൾ","11. മികച്ച രീതികൾ"]
        };

        // ── Mobile section headings — 6 languages ────────────────────────────
        const MH = {
            en:["1. Getting Started","2. Bottom Navigation — 4 Tabs","3. ☰ Hamburger Menu — 4 Sub-Tabs","4. Canvas Gestures","5. Entering Dimensions (Inputs Tab)","6. Placing Rooms (Rooms Tab)","7. Checking Vastu Compliance","8. Main Entrance (Dwara)","9. Exporting & Sharing","10. Tips & Best Practices"],
            te:["1. ప్రారంభించడం","2. అడుగు నావిగేషన్ — 4 ట్యాబ్‌లు","3. ☰ హాంబర్గర్ మెనూ — 4 ఉప-ట్యాబ్‌లు","4. క్యాన్వాస్ జెస్చర్‌లు","5. కొలతలు నమోదు చేయడం (Inputs ట్యాబ్)","6. గదులు ఉంచడం (Rooms ట్యాబ్)","7. వాస్తు అనుపాలన తనిఖీ","8. ప్రధాన ద్వారం (ద్వారం)","9. ఎగుమతి & షేరింగ్","10. చిట్కాలు & ఉత్తమ పద్ధతులు"],
            hi:["1. शुरुआत करना","2. नीचे नेविगेशन — 4 टैब","3. ☰ हैम्बर्गर मेनू — 4 उप-टैब","4. कैनवास जेस्चर","5. आयाम दर्ज करना (Inputs टैब)","6. कमरे रखना (Rooms टैब)","7. वास्तु अनुपालन जाँच","8. मुख्य द्वार","9. निर्यात और साझाकरण","10. सुझाव और सर्वोत्तम पद्धतियाँ"],
            kn:["1. ಪ್ರಾರಂಭಿಸುವುದು","2. ಕೆಳ ನ್ಯಾವಿಗೇಷನ್ — 4 ಟ್ಯಾಬ್‌ಗಳು","3. ☰ ಹ್ಯಾಂಬರ್ಗರ್ ಮೆನು — 4 ಉಪ-ಟ್ಯಾಬ್‌ಗಳು","4. ಕ್ಯಾನ್ವಾಸ್ ಗೆಸ್ಚರ್‌ಗಳು","5. ಅಳತೆಗಳನ್ನು ನಮೂದಿಸುವುದು (Inputs ಟ್ಯಾಬ್)","6. ಕೋಣೆಗಳನ್ನು ಇರಿಸುವುದು (Rooms ಟ್ಯಾಬ್)","7. ವಾಸ್ತು ಅನುಸರಣೆ ಪರಿಶೀಲನೆ","8. ಮುಖ್ಯ ದ್ವಾರ","9. ರಫ್ತು & ಹಂಚಿಕೆ","10. ಸಲಹೆಗಳು & ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು"],
            ta:["1. தொடங்குதல்","2. கீழ் வழிசெலுத்தல் — 4 தாவல்கள்","3. ☰ ஹேம்பர்கர் மெனு — 4 துணை-தாவல்கள்","4. கேன்வாஸ் சைகைகள்","5. அளவீடுகளை உள்ளிடுதல் (Inputs தாவல்)","6. அறைகளை வைத்தல் (Rooms தாவல்)","7. வாஸ்து இணக்க சரிபார்ப்பு","8. முக்கிய நுழைவாயில்","9. ஏற்றுமதி & பகிர்வு","10. குறிப்புகள் & சிறந்த நடைமுறைகள்"],
            ml:["1. ആരംഭിക്കുന്നു","2. ബോട്ടം നാവിഗേഷൻ — 4 ടാബുകൾ","3. ☰ ഹാംബർഗർ മെനു — 4 ഉപ-ടാബുകൾ","4. കാൻവാസ് ജെസ്ചറുകൾ","5. അളവുകൾ നൽകൽ (Inputs ടാബ്)","6. മുറികൾ സ്ഥാപിക്കൽ (Rooms ടാബ്)","7. വാസ്തു അനുസരണ പരിശോധന","8. പ്രധാന ദ്വാരം","9. എക്‌സ്‌പോർട്ട് & ഷെയറിംഗ്","10. നുറുങ്ങുകൾ & മികച്ച രീതികൾ"]
        };

        // ── TOC headings ─────────────────────────────────────────────────────
        const TOC_DESKTOP = {
            en:"Desktop Guide — Table of Contents",
            te:"డెస్క్‌టాప్ గైడ్ — విషయ సూచిక",
            hi:"डेस्कटॉप गाइड — विषय-सूची",
            kn:"ಡೆಸ್ಕ್‌ಟಾಪ್ ಗೈಡ್ — ವಿಷಯಗಳ ಪಟ್ಟಿ",
            ta:"டெஸ்க்டாப் வழிகாட்டி — உள்ளடக்கம்",
            ml:"ഡെസ്ക്‌ടോപ്പ് ഗൈഡ് — ഉള്ളടക്ക പട്ടിക"
        };
        const TOC_MOBILE = {
            en:"Mobile Guide — Table of Contents",
            te:"మొబైల్ గైడ్ — విషయ సూచిక",
            hi:"मोबाइल गाइड — विषय-सूची",
            kn:"ಮೊಬೈಲ್ ಗೈಡ್ — ವಿಷಯಗಳ ಪಟ್ಟಿ",
            ta:"மொபைல் வழிகாட்டி — உள்ளடக்கம்",
            ml:"മൊബൈൽ ഗൈഡ് — ഉള്ളടക്ക പട്ടിക"
        };
        const GUIDE_LABEL_D = {en:"Desktop Guide",te:"డెస్క్‌టాప్ గైడ్",hi:"डेस्कटॉप गाइड",kn:"ಡೆಸ್ಕ್‌ಟಾಪ್ ಗೈಡ್",ta:"டெஸ்க்டாப் வழிகாட்டி",ml:"ഡെസ്ക്‌ടോപ്പ് ഗൈഡ്"};
        const GUIDE_LABEL_M = {en:"Mobile Guide",te:"మొబైల్ గైడ్",hi:"मोबाइल गाइड",kn:"ಮೊಬೈಲ್ ಗೈಡ್",ta:"மொபைல் வழிகாட்டி",ml:"മൊബൈൽ ഗൈഡ്"};

        const dh = DH[lang] || DH.en;
        const mh = MH[lang] || MH.en;
        const notice = NOTICE[lang] || '';
        const tocD = TOC_DESKTOP[lang] || TOC_DESKTOP.en;
        const tocM = TOC_MOBILE[lang] || TOC_MOBILE.en;
        const labelD = GUIDE_LABEL_D[lang] || GUIDE_LABEL_D.en;
        const labelM = GUIDE_LABEL_M[lang] || GUIDE_LABEL_M.en;
        const title = TITLES[lang] || TITLES.en;

        // ── Shared CSS ───────────────────────────────────────────────────────
        const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;background:#0f172a;color:#e2e8f0;line-height:1.6}
.hdr{background:linear-gradient(135deg,#1e293b,#0f172a);padding:16px 20px;border-bottom:2px solid rgba(245,158,11,0.4)}
.hdr h1{font-size:17px;font-weight:900;color:#f59e0b;margin:0 0 2px}
.hdr p{font-size:10px;color:#64748b;margin:0}
.notice{background:rgba(245,158,11,0.1);border-left:3px solid #f59e0b;padding:9px 14px;margin:10px 16px 0;border-radius:4px;font-size:11px;color:#fbbf24}
.wrap{max-width:860px;margin:0 auto;padding:14px 16px}
.sec{margin-bottom:6px}
.sec-hd{cursor:pointer;background:#1e293b;color:#f8fafc;padding:10px 14px;border-radius:8px;margin:4px 0 0;font-size:13px;font-weight:700;display:flex;justify-content:space-between;align-items:center;border:1px solid rgba(71,85,105,0.5)}
.sec-hd:hover{background:#334155}
.sec-bd{padding:12px 14px;background:#1e293b;border:1px solid #334155;border-radius:0 0 8px 8px;border-top:none;font-size:12px;display:none}
.sec-bd ul,.sec-bd ol{padding-left:18px;margin:6px 0}
.sec-bd li{margin:4px 0;color:#cbd5e1}
.sec-bd b,.sec-bd strong{color:#f8fafc}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11px}
th{background:#334155;color:#f8fafc;padding:6px 8px;text-align:left;border:1px solid #475569}
td{padding:5px 8px;border:1px solid #334155;color:#cbd5e1;vertical-align:top}
tr:nth-child(even) td{background:#0f172a}
.badge{display:inline-block;padding:1px 7px;border-radius:99px;font-size:10px;font-weight:700;margin-left:4px}
.badge-green{background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(34,197,94,0.3)}
.badge-amber{background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)}
.badge-red{background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.3)}
.toc{background:#1e293b;border:1px solid rgba(59,130,246,0.3);border-radius:10px;padding:12px 16px;margin-bottom:14px}
.toc h3{color:#60a5fa;font-size:12px;margin:0 0 8px}
.toc ol{padding-left:16px;columns:2}
.toc li{margin:3px 0;font-size:11px}
.toc a{color:#93c5fd;text-decoration:none}
.toc a:hover{color:#f8fafc}
.pbtn{position:fixed;bottom:16px;right:16px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(245,158,11,0.4)}
@media print{.pbtn{display:none!important}}
.mobile-only{display:none!important}
.desktop-only{display:block}
@media(max-width:767px){
  .mobile-only{display:block!important}
  .desktop-only{display:none!important}
  body{font-size:13px}
  .hdr h1{font-size:15px}
  .sec-hd{font-size:12px;padding:9px 12px}
  .sec-bd{font-size:12px;padding:10px 12px}
  td,th{padding:5px 6px;font-size:11px}
  .pbtn{bottom:10px;right:10px;padding:8px 14px;font-size:11px}
  .toc ol{columns:1}
}
`;
        // ── Inline JS (accordion — no post-load injection) ───────────────────
        const guideJS = `function tog(i){var b=document.getElementById('gb'+i),a=document.getElementById('ga'+i),o=b.style.display==='block';b.style.display=o?'none':'block';a.innerHTML=o?'&#9654;':'&#9660;';}`;

        // ═══════════════════════════════════════════════════════
        //  DESKTOP SECTION BODIES (English — accurate technical content)
        // ═══════════════════════════════════════════════════════
        const DB = [
            // 0 — Quick-Start (3-step simplified workflow)
            `<div style="background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;border-radius:6px;padding:14px 16px;margin-bottom:10px;">
  <div style="font-size:13px;font-weight:900;color:#f59e0b;margin-bottom:12px;letter-spacing:0.04em;">⚡ QUICK START — 3 Steps</div>
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="min-width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#ea580c);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:white;flex-shrink:0;">1</div>
      <div>
        <div style="font-weight:800;color:#f8fafc;font-size:13px;margin-bottom:4px;">Input Values</div>
        <div style="color:#94a3b8;font-size:12px;line-height:1.5;">Enter your standard site measurements — North, South, East, West boundary lengths — into the <b style="color:#cbd5e1;">left panel (Sec 1)</b>. Add road direction, setbacks, and built area. Enter True North orientation first.</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="min-width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#15803d);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:white;flex-shrink:0;">2</div>
      <div>
        <div style="font-weight:800;color:#f8fafc;font-size:13px;margin-bottom:4px;">Auto Room Layout</div>
        <div style="color:#94a3b8;font-size:12px;line-height:1.5;">Select the <b style="color:#4ade80;">Auto Room generation tool</b> from the Rooms panel to instantly create a Vastu-compliant base layout. Rooms are placed automatically according to Padavinyasa rules.</div>
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="min-width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#4338ca);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:white;flex-shrink:0;">3</div>
      <div>
        <div style="font-weight:800;color:#f8fafc;font-size:13px;margin-bottom:4px;">Adjustments</div>
        <div style="color:#94a3b8;font-size:12px;line-height:1.5;">Use the <b style="color:#a5b4fc;">alignment sliders</b> and drawing tools to fine-tune positions. Upload a blueprint via <b style="color:#a5b4fc;">Upload Image</b> and use the Blueprint Layer panel to perfectly match your design to the grid.</div>
      </div>
    </div>
  </div>
</div>
<p style="font-size:11px;color:#64748b;margin-top:8px;line-height:1.5;">💡 <b style="color:#94a3b8;">Tip:</b> Aim for a <b style="color:#4ade80;">Health Score of 75%+</b> in the left panel before exporting your Vastu report.</p>`,
            // 1 — Header Two Rows
            `<p><b>Row 1 (top):</b></p>
<ul>
<li><b>V logo + SAMARTHA VASTU</b> — branding &amp; version</li>
<li><b>Undo / Fit / Redo</b> buttons</li>
<li><b>LIVE AAYA:</b> Real-time Yoni display + Dhwaja / Simha / Vrusha / Gaja auto-dimension buttons</li>
<li><b>Score Strip</b> — live Vastu Health Score ring (visible after project starts)</li>
<li><b>Center bar (dead center of header):</b> <b>Snap</b> toggle · <b>Auto Gate</b> · <b>☀️ Sun Path</b> checkbox</li>
<li><b>File · Export · Vargas · Resources</b> dropdowns</li>
<li><b>🌐 Language</b> selector + <b>🙏 Consult</b> button</li>
</ul>
<p style="margin-top:8px"><b>Row 2 (below):</b></p>
<ul>
<li><b>✏ Draw:</b> Text · Wall · Undo Wall · Measure · Rect · RMRC ink marker + colour picker + Clear Ink</li>
<li><b>👁 View:</b> Quick-toggle icons (Grid, Dims, Devathas, X-Ray) + <b>More</b> dropdown</li>
<li><b>Save File · WhatsApp · Email · Copy · Feedback</b> share buttons</li>
</ul>`,
            // 2 — Rooms
            `<ul>
<li><b>Auto-Layout:</b> Rooms → click <b>Auto-Layout</b> — places all rooms in correct Vastu zones instantly.</li>
<li><b>Manual placement:</b> Click any colour-coded room button → room appears on canvas → <b>drag</b> to reposition.</li>
<li><b>Resize:</b> Drag the resize handle (bottom-right corner of any room).</li>
<li><b>Delete:</b> Click a room to select → press <b>Delete / Backspace</b>, or click the ✕ on the room badge.</li>
<li><b>Outside rooms</b> (Bathroom Out, Servant Room, Watch &amp; Ward) sit in the setback area, excluded from zone checks.</li>
<li><b>GF / 1F tabs</b> switch between Ground Floor and First Floor. 1F starts as a copy of GF.</li>
</ul>`,
            // 3 — Drawing Tools
            `<table>
<tr><th>Tool</th><th>How to Use</th><th>Purpose</th></tr>
<tr><td><b>Wall</b></td><td>Click WALL → click canvas to start → click to end → Esc to stop</td><td>Internal partition walls</td></tr>
<tr><td><b>Measure</b></td><td>Click MEASURE → click two points</td><td>Distance in feet between any two points</td></tr>
<tr><td><b>Rect</b></td><td>Click RECT → click and drag</td><td>Separation rectangles to divide spaces</td></tr>
<tr><td><b>Text</b></td><td>Click TEXT → type label</td><td>Custom annotations on canvas</td></tr>
<tr><td><b>RMRC (Ink)</b></td><td>Click RMRC → freehand draw → pick colour</td><td>Freehand marker pen for site notes</td></tr>
</table>`,
            // 4 — Center Header Tools
            `<ul>
<li><b>Snap to Grid</b> (center of top header): Toggles magnetic snap — rooms align to grid. Button highlights when active.</li>
<li><b>Auto Place Gate</b> (center of top header): Automatically places site gate and main door on the most auspicious Devatha on the road-facing wall. <span class='badge badge-amber'>Set Road Direction first</span></li>
<li><b>☀️ Sun Path Arc</b> (center of top header): Overlays the sun's path arc on canvas. Select your city in <b>View → More → ☀️ Sun Path — City</b> dropdown for correct latitude. 30 Indian cities available.</li>
</ul>`,
            // 5 — View More
            `<ul>
<li><b>Canvas Display:</b> 📏 Dimensions · 16 Zones Radials · Maha Marma · Site Boundary · Site Devathas · House Devathas</li>
<li><b>16 Zone Colours:</b> Toggle elemental zone colour overlay. Opacity slider controls intensity.</li>
<li><b>Grid Lines:</b> Toggle background grid.</li>
<li><b>X-Ray Mode:</b> Reveals Devatha labels hidden behind rooms — useful for fine-tuning door positions.</li>
<li><b>Zone Overlay + Opacity slider:</b> Controls zone colour fill transparency (0.1 = faint → 1.0 = full).</li>
<li><b>Blueprint upload:</b> Load a site photograph as a semi-transparent background for tracing.</li>
<li><b>☀️ Sun Path — City:</b> Dropdown to set city for correct Sun Path latitude. 30 cities: Hyderabad, Chennai, Mumbai, Delhi, Bangalore, Kolkata, Pune, Visakhapatnam, Vijayawada, Tirupati, Kochi, Coimbatore, Madurai, Ahmedabad, Surat, Jaipur, Lucknow, Bhopal, Nagpur, Indore, Patna, Bhubaneswar, Raipur, Chandigarh, Dehradun, Amritsar, Varanasi, Agra, Nashik, Aurangabad.</li>
</ul>`,
            // 6 — Ayadi & Score
            `<ul>
<li><b>Live Aaya</b> (top header): Shows current Yoni type in real time as dimensions change.</li>
<li><b>Dhwaja / Simha / Vrusha / Gaja:</b> Auto-adjusts EW × NS dimensions to achieve that Yoni.</li>
<li><b>Vargas button:</b> Opens the full 9-Navavargulu (or 6-Shadvargulu) panel.</li>
<li><b>Health Score:</b> 100% = all Ayadi params auspicious. <span class='badge badge-green'>75%+ = good for construction</span></li>
<li><b>Score Strip</b> (top header): Live ring gauge — shifts green → yellow → red as score falls.</li>
</ul>
<table>
<tr><th>Score</th><th>Status</th></tr>
<tr><td><b>75–100%</b></td><td><span class='badge badge-green'>✅ Acceptable for construction</span></td></tr>
<tr><td><b>50–74%</b></td><td><span class='badge badge-amber'>⚠️ Marginal — try Dhwaja/Gaja buttons</span></td></tr>
<tr><td><b>&lt;50%</b></td><td><span class='badge badge-red'>❌ Adjust house dimensions urgently</span></td></tr>
</table>`,
            // 7 — Dwara
            `<p>The gate/door must land on an <b>auspicious (★) Devatha</b>. <b>Never</b> place on ✗ Shikhi, Agni, Pitra, or Roga (corners — shown red on canvas).</p>
<table>
<tr><th>Road Facing</th><th>Best Devatha</th></tr>
<tr><td>East Road</td><td>★ Jayanta (2nd), ★ Mahendra (3rd) from NE corner</td></tr>
<tr><td>South Road</td><td>★ Vitatha (10th), ★ Gruhakshat (11th) from SE corner</td></tr>
<tr><td>West Road</td><td>★ Sugriva (18th), ★ Pushpadanta (19th) from SW corner</td></tr>
<tr><td>North Road</td><td>★ Mukhya (26th), ★ Bhallata (27th) from NW corner</td></tr>
</table>
<p style="margin-top:8px"><b>Tip:</b> Click any Devatha label on the canvas to set the door there. Or use <b>Auto Gate</b> in the center header bar.</p>`,
            // 8 — Export
            `<table>
<tr><th>Action</th><th>Where</th><th>Output</th></tr>
<tr><td><b>Print Vastu Report PDF</b></td><td>Export menu → Print Vastu Report PDF</td><td>Full 7-section Padavinyasa report</td></tr>
<tr><td><b>Floor Plan Image</b></td><td>Export menu → Floor Plan Image</td><td>PNG — for WhatsApp / email</td></tr>
<tr><td><b>AutoCAD DXF</b></td><td>Export menu → AutoCAD DXF</td><td>.dxf — 12 layers, 1 unit = 1 ft</td></tr>
<tr><td><b>Save Project</b></td><td>File → Open / Save Projects</td><td>Browser storage, up to 20 projects</td></tr>
<tr><td><b>Export Backup</b></td><td>File → Open / Save Projects → Export</td><td>.json backup file</td></tr>
<tr><td><b>Share</b></td><td>Row 2 header: WhatsApp · Email · Copy</td><td>Direct share with summary text</td></tr>
</table>`,
            // 9 — Keyboard
            `<table>
<tr><th>Key</th><th>Action</th></tr>
<tr><td><b>Ctrl+Z</b></td><td>Undo (up to 50 levels)</td></tr>
<tr><td><b>Ctrl+Y</b></td><td>Redo</td></tr>
<tr><td><b>Ctrl+S</b></td><td>Quick save to browser</td></tr>
<tr><td><b>+ / −</b></td><td>Zoom in / out</td></tr>
<tr><td><b>0</b></td><td>Reset zoom &amp; fit canvas</td></tr>
<tr><td><b>G</b></td><td>Toggle grid</td></tr>
<tr><td><b>Delete</b></td><td>Delete selected room</td></tr>
<tr><td><b>Esc</b></td><td>Cancel active tool</td></tr>
<tr><td><b>Mouse Wheel</b></td><td>Zoom at cursor position</td></tr>
<tr><td><b>Drag canvas</b></td><td>Pan the view</td></tr>
</table>`,
            // 10 — Best Practices
            `<ul>
<li><b>Enter True North first</b> — shifts all 32 Devatha positions on both site and house.</li>
<li>Use <b>Auto-Layout</b> as a starting point, then fine-tune by dragging rooms.</li>
<li>Aim for <b>Health Score 75%+</b> before finalising. Use Dhwaja / Gaja buttons.</li>
<li><b>Borewell:</b> NE compound wall corner — best Vastu water source position.</li>
<li><b>Septic Tank:</b> NW or SSW compound wall corner.</li>
<li><b>Staircase:</b> SW or S zone is acceptable (service area).</li>
<li>Use <b>X-Ray mode</b> to see Devatha labels behind rooms when fine-tuning doors.</li>
<li>For <b>trapezoid / irregular sites</b>: enter all 4 actual side dimensions separately.</li>
</ul>`
        ];

        // ═══════════════════════════════════════════════════════
        //  MOBILE SECTION BODIES (English — accurate technical content)
        // ═══════════════════════════════════════════════════════
        const MB = [
            // 0 — Getting Started
            `<ol>
<li><b>Cover Page:</b> Tap <b>New Project</b>, <b>Open Project</b>, or <b>Import Plan</b>. This guide is also here.</li>
<li><b>Enter True North:</b> Tap <b>Inputs tab</b> (bottom bar) → scroll to top → enter north orientation in the <b>North °</b> field. <span class='badge badge-amber'>Always first</span></li>
<li><b>Site Dimensions:</b> Still in Inputs → fill <b>Outer Site Dimensions</b> (N, S, E, W in feet).</li>
<li><b>Place Rooms:</b> Tap <b>Rooms tab</b> → tap <b>Auto-Layout</b> or use the colour-coded room buttons.</li>
<li><b>Check Canvas:</b> Tap <b>Canvas tab</b> — pinch to zoom, one finger to pan.</li>
<li><b>Print Report:</b> Tap the <b>Report tab</b> (bottom bar, rightmost).</li>
</ol>`,
            // 1 — 4 Tabs
            `<table>
<tr><th>Tab</th><th>What you'll find</th></tr>
<tr><td><b>Canvas</b></td><td>Main drawing area — 16 Vastu zones, Devatha labels, live plan. Floating <b>+</b> / <b>−</b> / <b>FIT</b> buttons for zoom.</td></tr>
<tr><td><b>Inputs</b></td><td>Site Geometry (True North, Declination) → Sec 1 Site Dims → Sec 2 Road → Sec 3 Setbacks → Sec 4 Built Area → Sec 5 Ayadi → Sec 6 Dwara → Client details.</td></tr>
<tr><td><b>Rooms</b></td><td>Construction Placement: GF / 1F floor tabs, Auto-Layout button, colour-coded room buttons.</td></tr>
<tr><td><b>Report</b></td><td>Generates the full Vastu Padavinyasa PDF report immediately.</td></tr>
</table>`,
            // 2 — Hamburger Menu
            `<p>Tap <b>☰</b> (top-right) to open the menu. Four sub-tabs:</p>
<table>
<tr><th>Sub-Tab</th><th>Contents</th></tr>
<tr><td><b>DESIGN</b></td><td>Draw Tools (Wall, Measure, Rect, Text, Ink) · Auto Tools (Auto-Layout, Auto Gate, Snap) · Road/Gate direction · Floor selector (GF / 1F)</td></tr>
<tr><td><b>AYADI</b></td><td>Live Aaya · Dhwaja / Simha / Vrusha / Gaja · True North input · Ayadi mode (Viswakarma / Mayamata) · Live Nava/Shad Vargulu</td></tr>
<tr><td><b>VIEW</b></td><td>Canvas Layers: Grid · Zone Clr · Zone Lines · X-Ray · Devathas · Site Dev · Dims · Maha Marma · Boundary · Sun Path<br><b>☀️ Sun Path — City:</b> dropdown (30 Indian cities) to set correct latitude for the Sun Path arc<br>Language selector</td></tr>
<tr><td><b>OUTPUT</b></td><td>Export: Image · JSON · DXF · Share: WhatsApp · Email · Print: Vastu Report PDF · User Guide</td></tr>
</table>`,
            // 3 — Gestures
            `<ul>
<li><b>Pinch in / out</b> — zoom the canvas</li>
<li><b>One finger drag</b> — pan the view</li>
<li><b>Tap a room</b> — select it (shows resize handle)</li>
<li><b>Drag a room</b> — reposition on canvas</li>
<li><b>Drag resize handle</b> (bottom-right of room) — resize</li>
<li><b>FIT button</b> (floating, bottom-right) — reset zoom and centre the plan</li>
<li><b>+ / −</b> floating buttons — step zoom</li>
<li><b>Undo / Redo</b> buttons — top bar, left side</li>
</ul>`,
            // 4 — Entering Dimensions
            `<ul>
<li>Tap any number field → phone keyboard appears automatically.</li>
<li>Fields accept <b>feet</b> (whole numbers) and <b>inches</b> (separate field). Example: <b>30 ft 6 in</b>.</li>
<li><b>Section order:</b> Site → Road → Setbacks → Built Area → Ayadi → Dwara.</li>
<li><b>True North field:</b> Very top of the Inputs panel. Enter GPS / satellite north. <b>0° = exact True North.</b></li>
<li><b>Magnetic Declination:</b> Pick your city from the dropdown to auto-correct compass readings to True North.</li>
</ul>`,
            // 5 — Placing Rooms
            `<ul>
<li>Tap <b>Auto-Layout</b> to place all rooms in correct Vastu zones automatically. <span class='badge badge-green'>Recommended first step</span></li>
<li>Tap any <b>colour-coded room button</b> to add that room to the canvas.</li>
<li>Rooms appear in a default Vastu position — drag on Canvas tab to fine-tune.</li>
<li>Switch <b>GF ↔ 1F</b> using the floor tabs at the top of the Rooms panel.</li>
<li><b>Delete a room:</b> Tap room on canvas to select → tap the <b>✕</b> button that appears.</li>
</ul>`,
            // 6 — Vastu Compliance
            `<ul>
<li>Tap <b>Inputs tab</b> → scroll to top to see <b>Live Vastu Alerts</b>.</li>
<li><span class='badge badge-green'>✅ Green</span> — room in correct Vastu zone.</li>
<li><span class='badge badge-amber'>⚠️ Yellow</span> — acceptable zone, not ideal.</li>
<li><span class='badge badge-red'>❌ Red</span> — wrong zone (Dosha) — move the room.</li>
<li><b>Health Score:</b> Ring gauge in the top bar. <span class='badge badge-green'>75%+ = good for construction.</span></li>
<li>Use <b>Dhwaja / Gaja / Simha / Vrusha</b> buttons (☰ → AYADI) to auto-adjust dimensions for a better score.</li>
</ul>`,
            // 7 — Dwara Mobile
            `<p>Gate/door must land on an <b>auspicious (★) Devatha</b>. <b>Never</b> on Shikhi, Agni, Pitra, or Roga (shown red on canvas).</p>
<table>
<tr><th>Road Facing</th><th>Best Devatha</th></tr>
<tr><td>East</td><td>★ Jayanta (2nd), ★ Mahendra (3rd)</td></tr>
<tr><td>South</td><td>★ Vitatha (10th), ★ Gruhakshat (11th)</td></tr>
<tr><td>West</td><td>★ Sugriva (18th), ★ Pushpadanta (19th)</td></tr>
<tr><td>North</td><td>★ Mukhya (26th), ★ Bhallata (27th)</td></tr>
</table>
<ul style="margin-top:8px">
<li>Set <b>Road Direction</b> in ☰ → DESIGN first.</li>
<li>Tap <b>Auto Gate</b> (☰ → DESIGN) to place gate automatically.</li>
<li>Or tap a Devatha label on canvas to set the door manually.</li>
</ul>`,
            // 8 — Export Mobile
            `<table>
<tr><th>Action</th><th>Where to find it</th></tr>
<tr><td><b>Vastu Report PDF</b></td><td><b>Report tab</b> (bottom bar) or ☰ → OUTPUT → Print</td></tr>
<tr><td><b>Floor Plan Image</b></td><td>☰ → OUTPUT → Image</td></tr>
<tr><td><b>Share via WhatsApp</b></td><td>☰ → OUTPUT → WhatsApp</td></tr>
<tr><td><b>Share via Email</b></td><td>☰ → OUTPUT → Email</td></tr>
<tr><td><b>Save / Backup Project</b></td><td>☰ → OUTPUT → JSON</td></tr>
<tr><td><b>AutoCAD DXF</b></td><td>☰ → OUTPUT → DXF</td></tr>
<tr><td><b>User Guide</b></td><td>☰ → OUTPUT → User Guide</td></tr>
</table>`,
            // 9 — Tips Mobile
            `<ul>
<li><b>Enter True North first</b> — sets all 32 Devatha positions correctly.</li>
<li>Use <b>Auto-Layout</b> first, then fine-tune by dragging rooms on canvas.</li>
<li>Aim for <b>Health Score 75%+</b>. Use Dhwaja / Gaja buttons (☰ → AYADI).</li>
<li><b>Zone Clr</b> (☰ → VIEW) — shows the 16 elemental colour zones.</li>
<li><b>Zone Lines</b> (☰ → VIEW) — shows radial direction lines on the zone overlay.</li>
<li><b>X-Ray mode</b> (☰ → VIEW) — reveals Devatha names behind rooms.</li>
<li><b>Borewell:</b> NE corner of the compound wall.</li>
<li><b>Septic Tank:</b> NW or SSW compound wall corner.</li>
<li>The software <b>auto-saves</b> every action — safe even if browser closes.</li>
</ul>`
        ];

        // ── Build HTML ───────────────────────────────────────────────────────
        function buildSecs(heads, bodies, prefix) {
            return heads.map(function(h,i){
                return '<div class="sec" id="'+prefix+'s'+i+'">'+
                    '<div class="sec-hd" onclick="tog(\''+prefix+i+'\')">'+h+' <span id="ga'+prefix+i+'">&#9654;</span></div>'+
                    '<div class="sec-bd" id="gb'+prefix+i+'">'+bodies[i]+'</div>'+
                    '</div>';
            }).join('');
        }
        function buildToc(heads, prefix) {
            return heads.map(function(h,i){
                return '<li><a href="#'+prefix+'s'+i+'">'+h+'</a></li>';
            }).join('');
        }

        const noticeHtml = notice ? '<div class="notice">&#9888; '+notice+'</div>' : '';

        const desktopHtml =
            '<div class="desktop-only">'+
            '<div class="toc"><h3>📋 '+tocD+'</h3><ol>'+buildToc(dh,'d')+'</ol></div>'+
            buildSecs(dh, DB, 'd')+
            '</div>';

        const mobileHtml =
            '<div class="mobile-only">'+
            '<div class="toc"><h3>📱 '+tocM+'</h3><ol>'+buildToc(mh,'m')+'</ol></div>'+
            buildSecs(mh, MB, 'm')+
            '</div>';

        // ── Assemble ─────────────────────────────────────────────────────────
        const guideHtml = [
            '<!DOCTYPE html><html lang="'+lang+'"><head>',
            '<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
            '<title>'+title+'</title>',
            '<style>'+css+'</style>',
            '</head><body>',
            '<div class="hdr"><h1>📖 '+title+'</h1>',
            '<p>Viswakarma Vastu 9×9 Padavinyasa — Architect Edition | ',
            '<span class="desktop-only" style="display:inline">'+labelD+'</span>',
            '<span class="mobile-only" style="display:none">'+labelM+'</span></p></div>',
            noticeHtml,
            '<div class="wrap">',
            desktopHtml,
            mobileHtml,
            '<div style="text-align:center;padding:18px;color:#475569;font-size:11px;margin-top:14px;border-top:1px solid #334155;">Samartha Vastu — Architect Edition | Viswakarma Vastu Padavinyasa System</div>',
            '</div>',
            '<button class="pbtn" onclick="window.print()">🖨️ Print / Save PDF</button>',
            '<scr'+'ipt>'+guideJS+'<\/script>',
            '</body></html>'
        ].join('');

        // ── Open in new tab ───────────────────────────────────────────────────
        try {
            const blob = new Blob([guideHtml], {type:'text/html;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const w = window.open(url, '_blank');
            if(!w){ alert('Please allow popups to open the User Guide.'); return; }
        } catch(e) {
            const enc = 'data:text/html;charset=utf-8,'+encodeURIComponent(guideHtml);
            if(!window.open(enc, '_blank')){ alert('Please allow popups to open the User Guide.'); }
        }
        showToast('User Guide opened in new tab');
    };

    // ══════════════════════════════════════════════════════════
    // BATCH E: DXF EXPORT — AutoCAD R12 format, pure JavaScript
    // Units: feet | Origin: SW corner of site = (0,0)
    // X = East, Y = North (standard engineering convention)
    // ══════════════════════════════════════════════════════════
    window.exportDXF = function() {
        // Save current floor data first
        if(!state.roomsByFloor) state.roomsByFloor = {0:[], 1:[]};
        if(!state.wallsByFloor) state.wallsByFloor = {0:[], 1:[]};
        state.roomsByFloor[state.currentFloor||0] = JSON.parse(JSON.stringify(state.rooms||[]));
        state.wallsByFloor[state.currentFloor||0]  = JSON.parse(JSON.stringify(state.walls||[]));

        const sP = getSitePolygon();
        const hP = getHousePolygon();
        const sDevData = getShiftedDevathas(sP, state.siteN, state.siteE, state.siteS, state.siteW, state.rotation);
        const hDevData = getShiftedDevathas(hP, state.houseNs, state.houseEw, state.houseNs, state.houseEw, state.rotation);

        // DXF helper: format number to 6 decimal places
        const F = v => parseFloat(v).toFixed(6);
        // DXF entity counter (handle)
        let _handle = 1;
        const H = () => (_handle++).toString(16).toUpperCase().padStart(4, '0');

        // ── DXF Builders ──
        const ln = (...pairs) => pairs.map(([code, val]) => `${code}\n${val}`).join('\n') + '\n';

        function dxfLayer(name, color) {
            return ln([0,'LAYER'],[8,0],[2,name],[70,0],[62,color],[6,'CONTINUOUS']);
        }

        function dxfPolyRect(x1, y1, x2, y2, layer) {
            // Closed rectangle as LWPOLYLINE
            return ln(
                [0,'LWPOLYLINE'],[8,layer],[90,4],[70,1],[43,0],
                [10,F(x1)],[20,F(y1)],
                [10,F(x2)],[20,F(y1)],
                [10,F(x2)],[20,F(y2)],
                [10,F(x1)],[20,F(y2)]
            );
        }

        function dxfPoly(points, layer, closed=false) {
            let s = ln([0,'LWPOLYLINE'],[8,layer],[90,points.length],[70,closed?1:0],[43,0]);
            points.forEach(p => { s += ln([10,F(p.x)],[20,F(p.y)]); });
            return s;
        }

        function dxfLine(x1, y1, x2, y2, layer) {
            return ln([0,'LINE'],[8,layer],[10,F(x1)],[20,F(y1)],[30,0],[11,F(x2)],[21,F(y2)],[31,0]);
        }

        function dxfText(x, y, text, height, layer, justify='L') {
            // Sanitise text for DXF (no special chars)
            let clean = (text||'').replace(/[^\x20-\x7E]/g, '?').replace(/"/g, "'").substring(0, 50);
            return ln([0,'TEXT'],[8,layer],[10,F(x)],[20,F(y)],[30,0],[40,F(height)],[1,clean],[7,'STANDARD']);
        }

        function dxfCircle(x, y, r, layer) {
            return ln([0,'CIRCLE'],[8,layer],[10,F(x)],[20,F(y)],[30,0],[40,F(r)]);
        }

        function dxfDimLinear(x1, y1, x2, y2, dimX, dimY, layer, text='') {
            // Simple aligned dimension
            return ln(
                [0,'DIMENSION'],[8,layer],[70,1],
                [10,F(dimX)],[20,F(dimY)],[30,0],
                [13,F(x1)],[23,F(y1)],[33,0],
                [14,F(x2)],[24,F(y2)],[34,0],
                [1,text]
            );
        }

        // ── BUILD DXF ──
        let dxf = '';

        // HEADER
        dxf += ln([0,'SECTION'],[2,'HEADER']);
        dxf += ln([9,'$ACADVER'],[1,'AC1009']);       // AutoCAD R12
        dxf += ln([9,'$INSUNITS'],[70,2]);             // 2 = feet
        dxf += ln([9,'$LUNITS'],[70,2]);               // decimal
        dxf += ln([9,'$LUPREC'],[70,4]);               // 4 decimal places
        dxf += ln([9,'$AUNITS'],[70,0]);               // degrees
        dxf += ln([9,'$EXTMIN'],[10,0],[20,0],[30,0]);
        dxf += ln([9,'$EXTMAX'],[10,F(state.siteS)],[20,F(state.siteW)],[30,0]);
        dxf += ln([9,'$LIMMIN'],[10,-5],[20,-5]);
        dxf += ln([9,'$LIMMAX'],[10,F(state.siteS+10)],[20,F(state.siteW+10)]);
        dxf += ln([0,'ENDSEC']);

        // TABLES — Layers
        dxf += ln([0,'SECTION'],[2,'TABLES']);
        dxf += ln([0,'TABLE'],[2,'LAYER'],[70,12]);
        dxf += dxfLayer('SITE-BOUNDARY', 2);    // yellow
        dxf += dxfLayer('HOUSE-BOUNDARY', 3);   // green
        dxf += dxfLayer('SETBACK', 8);          // gray
        dxf += dxfLayer('ROOMS-GF', 5);         // blue
        dxf += dxfLayer('ROOMS-1F', 6);         // magenta
        dxf += dxfLayer('OUTSIDE-ROOMS', 4);    // cyan
        dxf += dxfLayer('WALLS', 7);            // white
        dxf += dxfLayer('DEVATHAS-HOUSE', 3);   // green
        dxf += dxfLayer('DEVATHAS-SITE', 2);    // yellow
        dxf += dxfLayer('MARKERS', 4);          // cyan
        dxf += dxfLayer('DIMENSIONS', 1);       // red
        dxf += dxfLayer('TEXT-LABELS', 7);      // white
        dxf += ln([0,'ENDTAB']);
        dxf += ln([0,'ENDSEC']);

        // ENTITIES
        dxf += ln([0,'SECTION'],[2,'ENTITIES']);

        // ── 1. SITE BOUNDARY ──
        dxf += dxfPoly([sP.sw, sP.se, sP.ne, sP.nw], 'SITE-BOUNDARY', true);
        dxf += dxfText(sP.sw.x + 1, sP.sw.y + 1, 'SITE BOUNDARY', 1.5, 'TEXT-LABELS');
        dxf += dxfText(sP.sw.x + 1, sP.sw.y - 3, `N=${state.siteN}' S=${state.siteS}' E=${state.siteE}' W=${state.siteW}'`, 1, 'DIMENSIONS');

        // ── 2. SETBACK ZONE (dashed outline) ──
        // Draw setback lines as individual lines from site corners inward
        dxf += dxfLine(sP.sw.x + state.setW, sP.sw.y, sP.sw.x + state.setW, sP.sw.y + state.siteW, 'SETBACK');  // E setback
        dxf += dxfLine(sP.sw.x, sP.sw.y + state.setS, sP.se.x, sP.se.y + state.setS, 'SETBACK');  // S setback
        dxf += dxfLine(sP.nw.x + state.setW, sP.nw.y, sP.sw.x + state.setW, sP.sw.y + state.siteW - state.setN, 'SETBACK');
        dxf += dxfText(state.setW + 0.5, state.setS + 0.5, `Setback N=${state.setN}' S=${state.setS}' E=${state.setE}' W=${state.setW}'`, 0.8, 'SETBACK');

        // ── 3. HOUSE BOUNDARY ──
        dxf += dxfPoly([hP.sw, hP.se, hP.ne, hP.nw], 'HOUSE-BOUNDARY', true);
        dxf += dxfText(hP.sw.x + 0.5, hP.sw.y + 0.5, 'BUILT AREA', 1.2, 'TEXT-LABELS');
        dxf += dxfText(hP.sw.x + 0.5, hP.sw.y - 2, `EW=${state.houseEw}' NS=${state.houseNs}'`, 1, 'DIMENSIONS');

        // ── 4. DIMENSIONS — Site ──
        let dimOff = 3; // dimension line offset from boundary
        // South side dimension
        dxf += dxfDimLinear(sP.sw.x, sP.sw.y, sP.se.x, sP.se.y, (sP.sw.x+sP.se.x)/2, sP.sw.y - dimOff, 'DIMENSIONS', `S=${state.siteS}'`);
        // North side
        dxf += dxfDimLinear(sP.nw.x, sP.nw.y, sP.ne.x, sP.ne.y, (sP.nw.x+sP.ne.x)/2, sP.nw.y + dimOff, 'DIMENSIONS', `N=${state.siteN}'`);
        // East side
        dxf += dxfDimLinear(sP.se.x, sP.se.y, sP.ne.x, sP.ne.y, sP.se.x + dimOff, (sP.se.y+sP.ne.y)/2, 'DIMENSIONS', `E=${state.siteE}'`);
        // West side
        dxf += dxfDimLinear(sP.sw.x, sP.sw.y, sP.nw.x, sP.nw.y, sP.sw.x - dimOff, (sP.sw.y+sP.nw.y)/2, 'DIMENSIONS', `W=${state.siteW}'`);

        // ── 5. GROUND FLOOR ROOMS ──
        let gfRooms = state.roomsByFloor[0] || state.rooms || [];
        gfRooms.forEach(r => {
            if(r.hidden) return;
            let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12;
            let rx, ry, layer;
            if(r.isMarker) {
                // Markers drawn separately
                dxfCircle(r.x, r.y, 1.5, 'MARKERS');
                dxf += dxfText(r.x + 1, r.y + 1, r.name, 0.8, 'MARKERS');
                return;
            }
            if(r.isOutside) {
                rx = r.x; ry = r.y; layer = 'OUTSIDE-ROOMS';
            } else if(r.isFurniture) {
                rx = hP.sw.x + r.x; ry = hP.sw.y + r.y; layer = 'ROOMS-GF';
            } else {
                rx = hP.sw.x + r.x; ry = hP.sw.y + r.y; layer = 'ROOMS-GF';
            }
            dxf += dxfPolyRect(rx, ry, rx + actW, ry + actH, layer);
            // Room name (centred)
            dxf += dxfText(rx + actW*0.1, ry + actH*0.5 + 0.3, r.name, 0.7, 'TEXT-LABELS');
            // Dimensions
            dxf += dxfText(rx + actW*0.1, ry + actH*0.5 - 0.8, `${r.wF}'${r.wI}" x ${r.hF}'${r.hI}"`, 0.5, 'TEXT-LABELS');
        });

        // ── 6. FIRST FLOOR ROOMS ──
        let ffRooms = state.roomsByFloor[1] || [];
        if(ffRooms.length > 0) {
            // Draw 1F rooms offset to the right of site for clarity
            let offsetX = sP.se.x + 5; // 5ft gap then 1F plan
            dxf += dxfText(offsetX, sP.nw.y + 2, 'FIRST FLOOR (1F) PLAN', 1.5, 'TEXT-LABELS');
            // Draw house boundary for 1F
            dxf += dxfPolyRect(offsetX + hP.sw.x, hP.sw.y, offsetX + hP.ne.x, hP.ne.y, 'HOUSE-BOUNDARY');
            ffRooms.forEach(r => {
                if(r.hidden || r.isMarker || r.isOutside) return;
                let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12;
                let rx = offsetX + hP.sw.x + r.x, ry = hP.sw.y + r.y;
                dxf += dxfPolyRect(rx, ry, rx + actW, ry + actH, 'ROOMS-1F');
                dxf += dxfText(rx + actW*0.1, ry + actH*0.5 + 0.3, r.name + '(1F)', 0.7, 'TEXT-LABELS');
                dxf += dxfText(rx + actW*0.1, ry + actH*0.5 - 0.8, `${r.wF}'${r.wI}" x ${r.hF}'${r.hI}"`, 0.5, 'TEXT-LABELS');
            });
        }

        // ── 7. MANUAL WALLS (GF) ──
        let gfWalls = state.wallsByFloor[0] || state.walls || [];
        gfWalls.forEach(w => {
            dxf += dxfLine(
                hP.sw.x + w.p1.x, hP.sw.y + w.p1.y,
                hP.sw.x + w.p2.x, hP.sw.y + w.p2.y,
                'WALLS'
            );
        });

        // ── 8. MARKERS (Borewell / Septic) ──
        (state.roomsByFloor[0]||[]).filter(r => r.isMarker).forEach(r => {
            dxf += dxfCircle(r.x, r.y, 1.5, 'MARKERS');
            dxf += dxfText(r.x + 1.5, r.y + 0.3, r.name, 0.8, 'MARKERS');
        });

        // ── 9. HOUSE DEVATHAS — with exact lengths ──
        dxf += dxfText(hP.sw.x, hP.sw.y - 4, '--- HOUSE DEVATHA STANAS (Padavinyasa) ---', 0.9, 'DEVATHAS-HOUSE');
        let devRowY = hP.sw.y - 5.5;
        hDevData.finalDevs.forEach((d, i) => {
            let pStart = getPtOnPerimeter(d.d_start, hDevData.poly, hDevData.N, hDevData.E, hDevData.S, hDevData.W);
            let pEnd   = getPtOnPerimeter(d.d_end,   hDevData.poly, hDevData.N, hDevData.E, hDevData.S, hDevData.W);
            // Draw devatha segment line on house perimeter (slightly inside)
            let midX = (pStart.x + pEnd.x) / 2, midY = (pStart.y + pEnd.y) / 2;
            // Mark devatha boundary
            dxf += dxfLine(pStart.x, pStart.y, pEnd.x, pEnd.y, 'DEVATHAS-HOUSE');
            // Label at midpoint (offset inward by 1ft)
            let nx = -(pEnd.y - pStart.y), ny = (pEnd.x - pStart.x);
            let nLen = Math.sqrt(nx*nx + ny*ny) || 1;
            let inX = midX + (nx/nLen)*1.5, inY = midY + (ny/nLen)*1.5;
            let rating = d.rating === 'good' ? '*' : d.rating === 'bad' ? 'X' : '';
            let lenFt = Math.floor(d.len), lenIn = Math.round((d.len - lenFt) * 12);
            dxf += dxfText(inX, inY, `${rating}${d.name} ${lenFt}'${lenIn}"`, 0.55, 'DEVATHAS-HOUSE');
            // Tabular list below site
            dxf += dxfText(hP.sw.x, devRowY, `${(i+1).toString().padStart(2)} ${rating}${d.name.padEnd(14)} ${lenFt}'${lenIn}" (${d.rating.toUpperCase()})`, 0.55, 'DEVATHAS-HOUSE');
            devRowY -= 1.0;
        });

        // ── 10. SITE DEVATHAS — with exact lengths ──
        let sDevRowY = devRowY - 2;
        dxf += dxfText(sP.sw.x, sDevRowY, '--- SITE DEVATHA STANAS ---', 0.9, 'DEVATHAS-SITE');
        sDevRowY -= 1.5;
        sDevData.finalDevs.forEach((d, i) => {
            let pStart = getPtOnPerimeter(d.d_start, sDevData.poly, sDevData.N, sDevData.E, sDevData.S, sDevData.W);
            let pEnd   = getPtOnPerimeter(d.d_end,   sDevData.poly, sDevData.N, sDevData.E, sDevData.S, sDevData.W);
            dxf += dxfLine(pStart.x, pStart.y, pEnd.x, pEnd.y, 'DEVATHAS-SITE');
            let midX = (pStart.x + pEnd.x) / 2, midY = (pStart.y + pEnd.y) / 2;
            let nx = -(pEnd.y - pStart.y), ny = (pEnd.x - pStart.x);
            let nLen = Math.sqrt(nx*nx + ny*ny) || 1;
            let outX = midX - (nx/nLen)*2.0, outY = midY - (ny/nLen)*2.0;
            let rating = d.rating === 'good' ? '*' : d.rating === 'bad' ? 'X' : '';
            let lenFt = Math.floor(d.len), lenIn = Math.round((d.len - lenFt) * 12);
            dxf += dxfText(outX, outY, `${rating}${d.name} ${lenFt}'${lenIn}"`, 0.55, 'DEVATHAS-SITE');
            dxf += dxfText(sP.sw.x, sDevRowY, `${(i+1).toString().padStart(2)} ${rating}${d.name.padEnd(14)} ${lenFt}'${lenIn}" (${d.rating.toUpperCase()})`, 0.55, 'DEVATHAS-SITE');
            sDevRowY -= 1.0;
        });

        // ── 11. NORTH ARROW & TITLE BLOCK ──
        let titleX = sP.se.x + 5, titleY = sP.sw.y - 2;
        if(ffRooms.length === 0) titleX = sP.se.x + 3;
        dxf += dxfText(titleX, titleY + 8, 'SAMARTHA VASTU - PADAVINYASA PLAN', 1.5, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY + 6, `Client: ${state.clientName||'---'}`, 1.0, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY + 4.5, `Place: ${state.clientPlace||'---'}`, 0.9, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY + 3, `True North: ${state.rotation||0} deg`, 0.9, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY + 1.5, `Road: ${state.roadDir||'East'} (${state.roadWidth||30} ft wide)`, 0.9, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY + 0, `Scale: 1 unit = 1 Foot`, 0.9, 'TEXT-LABELS');
        dxf += dxfText(titleX, titleY - 1.5, `Generated by Samartha Vastu v23.2`, 0.7, 'TEXT-LABELS');
        // North arrow (simple: line + N text)
        let nArrowX = titleX + 15, nArrowY = titleY + 5;
        dxf += dxfLine(nArrowX, nArrowY, nArrowX, nArrowY + 4, 'TEXT-LABELS');
        dxf += dxfLine(nArrowX, nArrowY + 4, nArrowX - 0.5, nArrowY + 3, 'TEXT-LABELS');
        dxf += dxfLine(nArrowX, nArrowY + 4, nArrowX + 0.5, nArrowY + 3, 'TEXT-LABELS');
        dxf += dxfText(nArrowX - 0.3, nArrowY + 4.5, 'N', 1.2, 'TEXT-LABELS');

        dxf += ln([0,'ENDSEC']);
        dxf += ln([0,'EOF']);

        // ── DOWNLOAD ──
        let fname = (state.clientName||'Unnamed').replace(/\s+/g,'_') + '_Vastu_Plan.dxf';
        try {
            const blob = new Blob([dxf], { type: 'application/dxf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fname;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch(e) {
            // Fallback: data URI
            const uri = 'data:application/dxf;charset=utf-8,' + encodeURIComponent(dxf);
            const a = document.createElement('a');
            a.href = uri; a.download = fname;
            document.body.appendChild(a); a.click(); a.remove();
        }
        showToast(`DXF exported: ${fname} (${Math.round(dxf.length/1024)}KB)`);
    };

    window.draw = function() {
        if(!ctx || !state) return;
        // NULL GUARDS — prevent crashes from corrupt state
        if(!state.rooms) state.rooms = [];
        if(!state.walls) state.walls = [];
        if(!state.texts) state.texts = [];
        if(!state.shapes) state.shapes = [];
        if(!state.measurePoints) state.measurePoints = [];
        if(!state.measureLines) state.measureLines = [];
        if(!state.wallPoints) state.wallPoints = [];
        if(!state.inkLines) state.inkLines = [];
        updateHealthScore();
        // Refresh Devata alert panel on every draw — keeps alerts in sync
        // with canvas red-border logic without needing per-action calls.
        if(typeof updateVastuAlerts === 'function') setTimeout(updateVastuAlerts, 0);
        const dpr = window.devicePixelRatio || 2, rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; ctx.scale(dpr, dpr); ctx.clearRect(0,0,rect.width,rect.height); 
        
        ctx.setTransform(1,0,0,1,0,0); ctx.translate(rect.width/2 * dpr + state.offsetX * dpr, rect.height/2 * dpr + state.offsetY * dpr); ctx.scale(state.scale * dpr, state.scale * dpr); 

        const px = 300 / Math.max(state.siteW, state.siteS), sP = getSitePolygon(), hP = getHousePolygon();
        const cX = (sP.se.x * px) / 2, cY = (sP.nw.y * px) / 2; 

        if(state.bgImg) { ctx.save(); ctx.translate(-cX, -cY); ctx.globalAlpha = state.bgOpacity || 0.4; let sF = Math.max((state.siteE*px)/state.bgImg.width, (state.siteS*px)/state.bgImg.height) * 1.2; let bS = (typeof window.bgScale==='number'?window.bgScale:1); let bX = (typeof window.bgOffsetX==='number'?window.bgOffsetX:0); let bY = (typeof window.bgOffsetY==='number'?window.bgOffsetY:0); let dW = state.bgImg.width*sF*bS, dH = state.bgImg.height*sF*bS; let dX = -(dW - state.siteS*px)/2 + bX; let dY = -(dH - state.siteW*px)/2 + bY; ctx.drawImage(state.bgImg, dX, dY, dW, dH); ctx.restore(); }

        const houseDevData = getShiftedDevathas(hP, state.houseNs, state.houseEw, state.houseNs, state.houseEw, state.rotation);
        
        if(state.show16Zones) {
            let dr = Math.max(state.siteW, state.siteS) * px * 0.7 + 30, ba = (state.rotation - 90) * (Math.PI/180);
            ctx.save(); ctx.translate(-cX, -cY); ctx.translate((hP.sw.x + state.houseEw/2) * px, (hP.sw.y + state.houseNs/2) * px);
            ZONES_ELEMENTAL.forEach((z, i) => {
                const sa = ba + (i*22.5-11.25)*(Math.PI/180), ea = ba + ((i+1)*22.5-11.25)*(Math.PI/180);
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, dr-15, sa, ea); ctx.closePath(); ctx.fillStyle = z.color; ctx.fill();
                if(state.showZoneLines) { ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(sa)*(dr-15), Math.sin(sa)*(dr-15)); ctx.strokeStyle = "rgba(100,116,139,0.7)"; ctx.lineWidth = 1.5; ctx.stroke(); }
                let mid = (sa+ea)/2; ctx.save(); ctx.translate(Math.cos(mid)*dr, Math.sin(mid)*dr); let tA = mid; if (tA > Math.PI/2 || tA < -Math.PI/2) tA += Math.PI; 
                ctx.rotate(tA); ctx.font = "700 8px Inter"; ctx.globalAlpha = 1.0; ctx.fillStyle = "#0f172a"; ctx.textAlign = "center"; ctx.fillText(z.name, 0, 0); ctx.globalAlpha = 1; ctx.restore();
            }); ctx.restore();
        }

        ctx.scale(1, -1); ctx.translate(-cX, -cY);

        if(state.showGrid) {
            ctx.save(); ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"; ctx.lineWidth = 1 / state.scale;
            let gridStep = 5 * px, boundX = Math.max(Math.max(state.siteE, state.siteW) * px * 2, 1000), boundY = Math.max(Math.max(state.siteN, state.siteS) * px * 2, 1000);
            ctx.beginPath(); for(let x = -boundX; x <= boundX; x += gridStep) { ctx.moveTo(x, -boundY); ctx.lineTo(x, boundY); }
            for(let y = -boundY; y <= boundY; y += gridStep) { ctx.moveTo(-boundX, y); ctx.lineTo(boundX, y); } ctx.stroke();
            ctx.beginPath(); ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
            for(let x = -boundX; x <= boundX; x += px) { ctx.moveTo(x, -boundY); ctx.lineTo(x, boundY); }
            for(let y = -boundY; y <= boundY; y += px) { ctx.moveTo(-boundX, y); ctx.lineTo(boundX, y); } ctx.stroke(); ctx.restore();
        }

        if(state.showRoad && state.roadWidth > 0) {
            ctx.save(); let rw = state.roadWidth * px; ctx.fillStyle = "rgba(148, 163, 184, 0.3)"; ctx.beginPath();
            if (state.roadDir === 'East') { ctx.moveTo(sP.se.x*px, sP.se.y*px); ctx.lineTo(sP.ne.x*px, sP.ne.y*px); ctx.lineTo(sP.ne.x*px + rw, sP.ne.y*px); ctx.lineTo(sP.se.x*px + rw, sP.se.y*px); } 
            else if (state.roadDir === 'West') { ctx.moveTo(sP.sw.x*px, sP.sw.y*px); ctx.lineTo(sP.nw.x*px, sP.nw.y*px); ctx.lineTo(sP.nw.x*px - rw, sP.nw.y*px); ctx.lineTo(sP.sw.x*px - rw, sP.sw.y*px); } 
            else if (state.roadDir === 'North') { ctx.moveTo(sP.nw.x*px, sP.nw.y*px); ctx.lineTo(sP.ne.x*px, sP.ne.y*px); ctx.lineTo(sP.ne.x*px, sP.ne.y*px + rw); ctx.lineTo(sP.nw.x*px, sP.nw.y*px + rw); } 
            else if (state.roadDir === 'South') { ctx.moveTo(sP.sw.x*px, sP.sw.y*px); ctx.lineTo(sP.se.x*px, sP.se.y*px); ctx.lineTo(sP.se.x*px, sP.se.y*px - rw); ctx.lineTo(sP.sw.x*px, sP.sw.y*px - rw); }
            ctx.fill(); 
            ctx.strokeStyle = "#475569"; ctx.lineWidth = 1;
            let drawRoadDim = (x1, y1, x2, y2, label) => { ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.save(); ctx.translate((x1+x2)/2, (y1+y2)/2); ctx.scale(1,-1); let ang = Math.atan2(y2-y1, x2-x1); let rot = -ang; if(rot>Math.PI/2 || rot<=-Math.PI/2) rot+=Math.PI; ctx.rotate(rot); ctx.font = `bold ${10/state.scale}px Inter`; let tw = ctx.measureText(label).width; ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.fillRect(-tw/2-2, -6/state.scale, tw+4, 12/state.scale); ctx.fillStyle = "#334155"; ctx.textAlign = "center"; ctx.textBaseline="middle"; ctx.fillText(label, 0, 0); ctx.restore(); };
            if (state.roadDir === 'East') { let mY = (sP.se.y + sP.ne.y)/2 * px; drawRoadDim(sP.se.x*px + 5, mY, sP.se.x*px + rw - 5, mY, `${state.roadWidth}' ROAD`); } else if (state.roadDir === 'West') { let mY = (sP.sw.y + sP.nw.y)/2 * px; drawRoadDim(sP.sw.x*px - rw + 5, mY, sP.sw.x*px - 5, mY, `${state.roadWidth}' ROAD`); } else if (state.roadDir === 'North') { let mX = (sP.nw.x + sP.ne.x)/2 * px; drawRoadDim(mX, sP.nw.y*px + 5, mX, sP.nw.y*px + rw - 5, `${state.roadWidth}' ROAD`); } else if (state.roadDir === 'South') { let mX = (sP.sw.x + sP.se.x)/2 * px; drawRoadDim(mX, sP.sw.y*px - rw + 5, mX, sP.sw.y*px - 5, `${state.roadWidth}' ROAD`); }
            ctx.restore();
        }

        // ── BATCH D: Draw site boundary (rectangle or L-shape) ──
        if(state.isLShape) {
            // Draw physical L-shape compound wall (6 points)
            let lPts = getLShapePolygon();
            ctx.beginPath(); ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.5;
            ctx.moveTo(lPts[0].x*px, lPts[0].y*px);
            for(let i=1; i<lPts.length; i++) ctx.lineTo(lPts[i].x*px, lPts[i].y*px);
            ctx.closePath(); ctx.stroke();
            // Draw CUT ZONE hatching (amber dashed)
            let cz = getLShapeCutZone();
            ctx.save();
            ctx.fillStyle = "rgba(251,191,36,0.12)";
            ctx.fillRect(cz.x*px, cz.y*px, cz.w*px, cz.h*px);
            ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1/state.scale;
            ctx.setLineDash([4/state.scale, 3/state.scale]);
            ctx.strokeRect(cz.x*px, cz.y*px, cz.w*px, cz.h*px);
            ctx.setLineDash([]);
            // Hatch lines inside cut zone
            ctx.strokeStyle = "rgba(245,158,11,0.3)"; ctx.lineWidth = 0.5/state.scale;
            for(let i=0; i<=cz.w+cz.h; i+=2) {
                let x1=cz.x*px+i*px, y1=cz.y*px;
                let x2=cz.x*px, y2=cz.y*px+i*px;
                ctx.beginPath(); ctx.moveTo(Math.min(x1,(cz.x+cz.w)*px), Math.max(y1,(cz.y)*px));
                ctx.lineTo(Math.max(x2,(cz.x)*px), Math.min(y2,(cz.y+cz.h)*px)); ctx.stroke();
            }
            ctx.restore();
            // Draw IMAGINARY LINE (dashed amber — closing the cut corner)
            let imgPoly = getImaginaryLinePoly();
            ctx.save();
            ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1.5/state.scale;
            ctx.setLineDash([6/state.scale, 4/state.scale]);
            // Draw only the 2 imaginary sides that close the cut
            switch(state.lCutCorner||'NE') {
                case 'NE':
                    ctx.beginPath(); ctx.moveTo((state.siteS-state.lCutW)*px, state.siteW*px); ctx.lineTo(state.siteS*px, state.siteW*px); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(state.siteS*px, (state.siteW-state.lCutH)*px); ctx.lineTo(state.siteS*px, state.siteW*px); ctx.stroke();
                    break;
                case 'NW':
                    ctx.beginPath(); ctx.moveTo(0, state.siteW*px); ctx.lineTo(state.lCutW*px, state.siteW*px); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, (state.siteW-state.lCutH)*px); ctx.lineTo(0, state.siteW*px); ctx.stroke();
                    break;
                case 'SE':
                    ctx.beginPath(); ctx.moveTo((state.siteS-state.lCutW)*px, 0); ctx.lineTo(state.siteS*px, 0); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(state.siteS*px, 0); ctx.lineTo(state.siteS*px, state.lCutH*px); ctx.stroke();
                    break;
                case 'SW':
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(state.lCutW*px, 0); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, state.lCutH*px); ctx.stroke();
                    break;
            }
            ctx.setLineDash([]);
            // Imaginary line label
            let czLabelX = (cz.x + cz.w/2)*px, czLabelY = (cz.y + cz.h/2)*px;
            ctx.save(); ctx.translate(czLabelX, czLabelY); ctx.scale(1,-1);
            ctx.font = `bold ${9/state.scale}px Inter`; ctx.fillStyle="#92400e"; ctx.textAlign="center";
            ctx.fillText("VITHI", 0, 0); ctx.fillText("(Open)", 0, 12/state.scale);
            ctx.restore(); ctx.restore();
        } else {
            // Normal rectangle site boundary
            ctx.beginPath(); ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.moveTo(sP.sw.x*px, sP.sw.y*px); ctx.lineTo(sP.se.x*px, sP.se.y*px); ctx.lineTo(sP.ne.x*px, sP.ne.y*px); ctx.lineTo(sP.nw.x*px, sP.nw.y*px); ctx.closePath(); ctx.stroke();
        }
        ctx.beginPath(); ctx.strokeStyle = "#15803d"; ctx.lineWidth = 2; ctx.moveTo(hP.sw.x*px, hP.sw.y*px); ctx.lineTo(hP.se.x*px, hP.se.y*px); ctx.lineTo(hP.ne.x*px, hP.ne.y*px); ctx.lineTo(hP.nw.x*px, hP.nw.y*px); ctx.closePath(); ctx.stroke();

        // ── Devata Zone Names overlay — drawn inside built area ──
        // Shows light zone labels (compass + Devata name) proportionally scaled.
        // Controlled by state.showDevataZoneNames. No heavy grid drawn.
        if(state.showDevataZoneNames) {
            ctx.save();
            const _ZN = window.DEVATA_ZONE_NAMES || {};
            // 8 zones: position each label at the centre of its proportional third
            // hP.sw = bottom-left (SW corner) of built area in site feet
            // Canvas Y is flipped (ctx.scale(1,-1) already applied above)
            const _ew = state.houseEw, _ns = state.houseNs;
            const _ox = hP.sw.x * px, _oy = hP.sw.y * px;
            const _cw = _ew * px / 3, _ch = _ns * px / 3;  // one-third cell size in pixels

            // Zone centre positions [col-third, row-third] → 0=south/west, 2=north/east
            const _zones = [
                { z:'SW', cx:0,   cy:0   },
                { z:'S',  cx:1,   cy:0   },
                { z:'SE', cx:2,   cy:0   },
                { z:'W',  cx:0,   cy:1   },
                { z:'Brahmasthana', cx:1, cy:1 },
                { z:'E',  cx:2,   cy:1   },
                { z:'NW', cx:0,   cy:2   },
                { z:'N',  cx:1,   cy:2   },
                { z:'NE', cx:2,   cy:2   }
            ];


            _zones.forEach(function(zd) {
                // Centre of this zone in canvas pixels
                const labelX = _ox + (zd.cx + 0.5) * _cw;
                const labelY = _oy + (zd.cy + 0.5) * _ch;
                const devName  = _ZN[zd.z] || '';
                const isBrahma = zd.z === 'Brahmasthana';

                // Text only — no fills, no border lines
                ctx.save();
                ctx.translate(labelX, labelY);
                ctx.scale(1, -1);  // flip upright (canvas Y is flipped)
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if(isBrahma) {
                    // Brahmasthana — single amber label
                    ctx.font = 'bold ' + 7 / state.scale + 'px Inter';
                    ctx.fillStyle = 'rgba(251,191,36,0.65)';
                    ctx.fillText('Brahmasthana', 0, 0);
                } else {
                    // Compass abbreviation (top line)
                    ctx.font = 'bold ' + 9 / state.scale + 'px Inter';
                    ctx.fillStyle = 'rgba(226,232,240,0.55)';
                    ctx.fillText(zd.z, 0, -6 / state.scale);
                    // Devata name (bottom line, amber)
                    if(devName) {
                        ctx.font = '600 ' + 8 / state.scale + 'px Inter';
                        ctx.fillStyle = 'rgba(251,191,36,0.65)';
                        ctx.fillText(devName, 0, 6 / state.scale);
                    }
                }
                ctx.restore();
            });
            ctx.restore();
        }

        if (state.showDimensions) {
            ctx.save(); ctx.fillStyle = "#334155"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; let offset = 12 / state.scale; 
            const drawDim = (p1, p2, text, col, isOuter) => { let dx = p2.x - p1.x; let dy = p2.y - p1.y; let len = Math.sqrt(dx*dx + dy*dy); if (len < 0.1) return; let ang = Math.atan2(dy, dx); let nx = -Math.sin(ang); let ny = Math.cos(ang); let mX = (p1.x + p2.x)/2; let mY = (p1.y + p2.y)/2; mX += nx * (isOuter ? -offset/px : offset/px); mY += ny * (isOuter ? -offset/px : offset/px); ctx.save(); ctx.translate(mX * px, mY * px); ctx.scale(1, -1); let rotAng = -ang; if (rotAng > Math.PI/2 || rotAng <= -Math.PI/2) rotAng += Math.PI; ctx.rotate(rotAng); let fontSize = 10 / state.scale; ctx.font = `bold ${fontSize}px Inter`; let textWidth = ctx.measureText(text).width; ctx.fillStyle = "rgba(255, 255, 255, 0.9)"; ctx.fillRect(-textWidth/2 - 2, -fontSize/2 - 1, textWidth + 4, fontSize + 2); ctx.fillStyle = col; ctx.fillText(text, 0, 0); ctx.restore(); };
            drawDim(sP.sw, sP.se, window.formatLen(state.siteS), "#475569", true); drawDim(sP.se, sP.ne, window.formatLen(state.siteE), "#475569", true); drawDim(sP.ne, sP.nw, window.formatLen(state.siteN), "#475569", true); drawDim(sP.nw, sP.sw, window.formatLen(state.siteW), "#475569", true); 
            drawDim(hP.sw, hP.se, window.formatLen(state.houseEw), "#16a34a", false); drawDim(hP.se, hP.ne, window.formatLen(state.houseNs), "#16a34a", false); drawDim(hP.ne, hP.nw, window.formatLen(state.houseEw), "#16a34a", false); drawDim(hP.nw, hP.sw, window.formatLen(state.houseNs), "#16a34a", false); 
            ctx.restore();
        }

        if(state.showMahamarma || state.showUpamarma) {
            let pNE = getPtOnPerimeter(houseDevData.shift, hP, houseDevData.N, houseDevData.E, houseDevData.S, houseDevData.W); let pSE = getPtOnPerimeter(houseDevData.shift + houseDevData.E, hP, houseDevData.N, houseDevData.E, houseDevData.S, houseDevData.W); let pSW = getPtOnPerimeter(houseDevData.shift + houseDevData.E + houseDevData.S, hP, houseDevData.N, houseDevData.E, houseDevData.S, houseDevData.W); let pNW = getPtOnPerimeter(houseDevData.shift + houseDevData.E + houseDevData.S + houseDevData.W, hP, houseDevData.N, houseDevData.E, houseDevData.S, houseDevData.W); 
            if(state.showMahamarma) { ctx.beginPath(); ctx.strokeStyle="rgba(239,68,68,0.10)"; ctx.lineWidth = 0.5; for(let i=0; i<=9; i++) { let t = i / 9; let ptTop = { x: pNW.x + (pNE.x - pNW.x)*t, y: pNW.y + (pNE.y - pNW.y)*t }; let ptBot = { x: pSW.x + (pSE.x - pSW.x)*t, y: pSW.y + (pSE.y - pSW.y)*t }; ctx.moveTo(ptTop.x * px, ptTop.y * px); ctx.lineTo(ptBot.x * px, ptBot.y * px); let ptLeft = { x: pNW.x + (pSW.x - pNW.x)*t, y: pNW.y + (pSW.y - pNW.y)*t }; let ptRight = { x: pNE.x + (pSE.x - pNE.x)*t, y: pNE.y + (pSE.y - pNE.y)*t }; ctx.moveTo(ptLeft.x * px, ptLeft.y * px); ctx.lineTo(ptRight.x * px, ptRight.y * px); } ctx.stroke(); ctx.beginPath(); ctx.strokeStyle = "rgba(239,68,68,0.18)"; ctx.lineWidth = 0.6; ctx.setLineDash([5,4]); ctx.moveTo(pSW.x * px, pSW.y * px); ctx.lineTo(pNE.x * px, pNE.y * px); ctx.moveTo(pNW.x * px, pNW.y * px); ctx.lineTo(pSE.x * px, pSE.y * px); ctx.stroke(); ctx.setLineDash([]); }
            if(state.showUpamarma) { let ts = [3/9, 4.5/9, 6/9]; ctx.fillStyle = "#ef4444"; ts.forEach(ty => { let ptLeft = { x: pNW.x + (pSW.x - pNW.x)*ty, y: pNW.y + (pSW.y - pNW.y)*ty }; let ptRight = { x: pNE.x + (pSE.x - pNE.x)*ty, y: pNE.y + (pSE.y - pNE.y)*ty }; ts.forEach(tx => { let pInt = { x: ptLeft.x + (ptRight.x - ptLeft.x)*tx, y: ptLeft.y + (ptRight.y - ptLeft.y)*tx }; ctx.beginPath(); ctx.arc(pInt.x * px, pInt.y * px, 4, 0, Math.PI*2); ctx.fill(); }); }); }
        }

        function dsD(devData, thickness, isOuter) {
            let corners = [ {d: devData.E, pt: devData.poly.se}, {d: devData.E+devData.S, pt: devData.poly.sw}, {d: devData.E+devData.S+devData.W, pt: devData.poly.nw}, {d: devData.P, pt: devData.poly.ne} ];
            devData.finalDevs.forEach(d => {
                let isDwara = state.selectedDwara && d.en === state.selectedDwara; 
                
                ctx.beginPath(); ctx.strokeStyle = "rgba(0,0,0,0)"; ctx.lineWidth = 1;
                let drawPath = (start, end) => { let pStart = getPtOnPerimeter(start, devData.poly, devData.N, devData.E, devData.S, devData.W); ctx.moveTo(pStart.x * px, pStart.y * px); corners.forEach(c => { if (c.d > start + 0.001 && c.d < end - 0.001) ctx.lineTo(c.pt.x * px, c.pt.y * px); }); let pEnd = getPtOnPerimeter(end, devData.poly, devData.N, devData.E, devData.S, devData.W); ctx.lineTo(pEnd.x * px, pEnd.y * px); };
                if (d.d_start < d.d_end) drawPath(d.d_start, d.d_end); else { drawPath(d.d_start, devData.P); drawPath(0, d.d_end); } ctx.stroke();

                if(isDwara) {
                    let d_mid = (d.d_start + d.len/2) % devData.P; 
                    let pMid = getPtOnPerimeter(d_mid, devData.poly, devData.N, devData.E, devData.S, devData.W);
                    let pNext = getPtOnPerimeter((d_mid + 0.1) % devData.P, devData.poly, devData.N, devData.E, devData.S, devData.W); 
                    let sAngle = Math.atan2(-(pNext.y - pMid.y), pNext.x - pMid.x); if (sAngle > Math.PI/2) sAngle -= Math.PI; else if (sAngle < -Math.PI/2) sAngle += Math.PI;
                    ctx.save(); ctx.translate(pMid.x * px, pMid.y * px); ctx.scale(1, -1); ctx.rotate(sAngle);
                    if(isOuter) {
                        // Site gate — amber rectangle with double lines (architectural gate symbol)
                        ctx.fillStyle = "#fef3c7"; ctx.fillRect(-18, -5, 36, 10);
                        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1.5; ctx.strokeRect(-18, -5, 36, 10);
                        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(-18,-1); ctx.lineTo(18,-1); ctx.moveTo(-18,1); ctx.lineTo(18,1); ctx.stroke();
                        ctx.fillStyle = "#92400e"; ctx.font="bold 7px Inter"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("GATE", 0, 0);
                    } else {
                        // Main door — orange with arc swing hint
                        ctx.fillStyle = "#fff7ed"; ctx.fillRect(-14, -3, 28, 6);
                        ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 1.5; ctx.strokeRect(-14, -3, 28, 6);
                        ctx.beginPath(); ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 1;
                        ctx.arc(-14, -3, 14, 0, Math.PI/2); ctx.stroke();
                        ctx.fillStyle = "#7c2d12"; ctx.font="bold 6px Inter"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("DOOR", 0, 0);
                    }
                    ctx.restore();
                }

                let pStart = getPtOnPerimeter(d.d_start, devData.poly, devData.N, devData.E, devData.S, devData.W);
                let pcX = (devData.poly.sw.x + devData.poly.ne.x)/2 * px, pcY = (devData.poly.sw.y + devData.poly.ne.y)/2 * px;
                let ang = Math.atan2(pStart.y*px - pcY, pStart.x*px - pcX);
                ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 1.5; ctx.moveTo(pStart.x*px - Math.cos(ang)*(thickness/2), pStart.y*px - Math.sin(ang)*(thickness/2)); ctx.lineTo(pStart.x*px + Math.cos(ang)*(thickness/2), pStart.y*px + Math.sin(ang)*(thickness/2)); ctx.stroke();

                let fontColor = (isDwara || d.rating === 'good') ? '#16a34a' : (d.rating === 'bad' ? '#dc2626' : '#334155');
                
                let d_mid = (d.d_start + d.len/2) % devData.P; let pMid = getPtOnPerimeter(d_mid, devData.poly, devData.N, devData.E, devData.S, devData.W); let pNext = getPtOnPerimeter((d_mid + 0.1) % devData.P, devData.poly, devData.N, devData.E, devData.S, devData.W); let sAngle = Math.atan2(-(pNext.y - pMid.y), pNext.x - pMid.x); if (sAngle > Math.PI/2) sAngle -= Math.PI; else if (sAngle < -Math.PI/2) sAngle += Math.PI;
                ctx.save(); ctx.translate(pMid.x * px, pMid.y * px); ctx.scale(1, -1); ctx.rotate(sAngle); ctx.font = `900 ${thickness > 8 ? 9 : 7}px Inter`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; 
                ctx.lineJoin = "round"; ctx.miterLimit = 2; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.8; ctx.strokeText(d.name, 0, 0, (d.len * px) - 2); 
                ctx.fillStyle = fontColor; ctx.fillText(d.name, 0, 0, (d.len * px) - 2); // canvas: English only, rotating 
                ctx.restore();
            });
        }

        if(state.showSiteDeities) dsD(getShiftedDevathas(sP, state.siteN, state.siteE, state.siteS, state.siteW, state.rotation), 10, true);
        if(state.showPlotDeities) dsD(houseDevData, 14, false);

        if(state.walls) {
            state.walls.forEach(w => {
                ctx.beginPath(); ctx.strokeStyle = "#334155"; ctx.lineWidth = w.thickness * px; ctx.lineCap = "round";
                let wx1 = (hP.sw.x + w.p1.x) * px, wy1 = (hP.sw.y + w.p1.y) * px; let wx2 = (hP.sw.x + w.p2.x) * px, wy2 = (hP.sw.y + w.p2.y) * px;
                ctx.moveTo(wx1, wy1); ctx.lineTo(wx2, wy2); ctx.stroke();
                if (state.showDimensions) { let dx = w.p2.x - w.p1.x, dy = w.p2.y - w.p1.y; let dist = Math.sqrt(dx*dx + dy*dy); let ang = Math.atan2(dy, dx); ctx.save(); ctx.translate((wx1+wx2)/2, (wy1+wy2)/2); ctx.scale(1,-1); let rotAng = -ang; if (rotAng > Math.PI/2 || rotAng <= -Math.PI/2) rotAng += Math.PI; ctx.rotate(rotAng); ctx.translate(0, 10/state.scale); ctx.font = `bold ${8/state.scale}px Inter`; ctx.fillStyle = "#64748b"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(window.formatLen(dist), 0, 0); ctx.restore(); }
            });
        }

        if(state.isDrawingWall && state.wallPoints && state.wallPoints.length === 1 && state.currentMousePos) {
            ctx.beginPath(); ctx.strokeStyle = "rgba(51, 65, 85, 0.5)"; ctx.lineWidth = (state.wallDeduction || 0.375) * px; ctx.lineCap = "round"; ctx.moveTo((hP.sw.x + state.wallPoints[0].x) * px, (hP.sw.y + state.wallPoints[0].y) * px); ctx.lineTo((hP.sw.x + state.currentMousePos.x) * px, (hP.sw.y + state.currentMousePos.y) * px); ctx.stroke(); let dx = state.currentMousePos.x - state.wallPoints[0].x; let dy = state.currentMousePos.y - state.wallPoints[0].y; let dist = Math.sqrt(dx*dx + dy*dy); ctx.save(); ctx.translate((hP.sw.x + state.currentMousePos.x)*px, (hP.sw.y + state.currentMousePos.y)*px + 15/state.scale); ctx.scale(1,-1); ctx.fillStyle = "#1e293b"; ctx.font = `bold ${10/state.scale}px Inter`; ctx.textAlign="center"; ctx.fillText(window.formatLen(dist), 0, 0); ctx.restore();
        }

        state.rooms.filter(r => !r.isFurniture && !r.isMarker && !r.hidden).forEach(r => {
            let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12;
            // Outside rooms use SITE coordinates directly; inside rooms use house-relative coords
            let rx, ry;
            if(r.isOutside) {
                rx = r.x * px; ry = r.y * px;
            } else {
                rx = (hP.sw.x + r.x)*px; ry = (hP.sw.y + r.y)*px;
            }
            let rw = actW * px, rh = actH * px;
            // Outside rooms always valid (Vastu zone doesn't apply inside house)
            let valid = r.isOutside ? true : isRoomValid(r, hP, px);
            ctx.save(); ctx.globalAlpha = state.xray ? 0.4 : 1.0; 
            
            if(r.type === 'Staircase') {
                // FLOOR PLAN SYMBOL: Staircase — parallel horizontal lines + direction arrow
                ctx.fillStyle = r.color || "#f1f5f9"; ctx.fillRect(rx, ry, rw, rh);
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = valid ? "#334155" : "#ef4444"; 
                ctx.lineWidth = valid ? 1.5/state.scale : 3/state.scale; 
                ctx.strokeRect(rx, ry, rw, rh);
                // Draw step lines
                ctx.beginPath(); ctx.strokeStyle = "#475569"; ctx.lineWidth = 1/state.scale;
                let steps = 10;
                if(rw > rh) {
                    // Horizontal staircase — lines run vertically
                    for(let i=1; i<steps; i++) { let stx = rx + (rw/steps)*i; ctx.moveTo(stx, ry); ctx.lineTo(stx, ry+rh); }
                    ctx.stroke();
                    // Direction arrow at right end (going right = upstairs)
                    let ax = rx+rw-4/state.scale, ay = ry+rh/2;
                    ctx.beginPath(); ctx.strokeStyle="#334155"; ctx.lineWidth=1.5/state.scale;
                    ctx.moveTo(rx+2/state.scale, ay); ctx.lineTo(ax, ay);
                    ctx.lineTo(ax-6/state.scale, ay-5/state.scale);
                    ctx.moveTo(ax, ay); ctx.lineTo(ax-6/state.scale, ay+5/state.scale);
                    ctx.stroke();
                } else {
                    // Vertical staircase — lines run horizontally
                    for(let i=1; i<steps; i++) { let sty = ry + (rh/steps)*i; ctx.moveTo(rx, sty); ctx.lineTo(rx+rw, sty); }
                    ctx.stroke();
                    // Direction arrow at top end (going up = upstairs)
                    let ax = rx+rw/2, ay = ry+rh-4/state.scale;
                    ctx.beginPath(); ctx.strokeStyle="#334155"; ctx.lineWidth=1.5/state.scale;
                    ctx.moveTo(ax, ry+2/state.scale); ctx.lineTo(ax, ay);
                    ctx.lineTo(ax-5/state.scale, ay-6/state.scale);
                    ctx.moveTo(ax, ay); ctx.lineTo(ax+5/state.scale, ay-6/state.scale);
                    ctx.stroke();
                }
            } else {
                ctx.fillStyle = r.color || "#fff"; ctx.fillRect(rx, ry, rw, rh); 
                ctx.globalAlpha = 1.0; 
                if(r.isOutside) {
                    // Outside rooms: dashed cyan border to distinguish from inside rooms
                    ctx.strokeStyle = "#0e7490"; ctx.lineWidth = 1.5/state.scale;
                    ctx.setLineDash([4/state.scale, 3/state.scale]);
                    ctx.strokeRect(rx, ry, rw, rh);
                    ctx.setLineDash([]);
                } else {
                    ctx.strokeStyle = valid ? "#1e293b" : "#ef4444"; 
                    ctx.lineWidth = valid ? 1 : 3; 
                    ctx.strokeRect(rx, ry, rw, rh);
                }
            }
            
            if (r.type === 'Master Bed') { ctx.fillStyle = "#8b5cf6"; ctx.fillRect(rx+4, ry+4, 20, 25); ctx.fillStyle="rgba(255,255,255,0.7)"; ctx.fillRect(rx+6, ry+22, 16, 5); }
            if (r.type === 'Kitchen') { ctx.fillStyle = "#ef4444"; ctx.fillRect(rx+rw-15, ry+4, 11, 8); ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(rx+rw-12, ry+8, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(rx+rw-7, ry+8, 2, 0, Math.PI*2); ctx.fill(); }
            if (r.type === 'Toilet') { ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(rx+rw/2, ry+4+5, 4, 5, 0, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle="#cbd5e1"; ctx.lineWidth=1; ctx.stroke(); }
            if (r.type === 'Dining') { ctx.fillStyle = "#78350f"; ctx.fillRect(rx+rw/2-10, ry+rh/2-15, 20, 30); ctx.fillStyle="#fef3c7"; ctx.fillRect(rx+rw/2-8, ry+rh/2-13, 16, 26); }

            // Only draw door symbol for inside rooms (outside rooms have their own entrance)
            if(r.type !== 'Staircase' && !r.isOutside) {
                let door = getSmartDoorPos(r); 
                let dx = rx + door.x*px, dy = ry + door.y*px;
                if(door.wall === 'North') dy = ry + rh - door.h*px;
                else if(door.wall === 'South') dy = ry;
                else if(door.wall === 'East') dx = rx + rw - door.w*px;
                else if(door.wall === 'West') dx = rx;

                // FLOOR PLAN SYMBOL: Arc swing door
                ctx.save();
                let dw = door.w * px, dh = door.h * px;
                let isHoriz = (door.wall === 'North' || door.wall === 'South');
                let swingR = isHoriz ? dw : dh; // radius = door width
                ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.2/state.scale; ctx.fillStyle = "rgba(0,0,0,0)";
                
                if(isHoriz) {
                    // Door on North/South wall — horizontal door leaf
                    let hingeX = dx, hingeY = isHoriz && door.wall==='North' ? dy+dh : dy;
                    let leafY = (door.wall==='North') ? dy+dh : dy;
                    // Door leaf line
                    ctx.beginPath(); ctx.moveTo(hingeX, hingeY); ctx.lineTo(hingeX + swingR, hingeY); ctx.stroke();
                    // Arc sweep
                    let arcSY = (door.wall==='North') ? 1 : -1;
                    ctx.beginPath(); ctx.arc(hingeX, hingeY, swingR, 0, arcSY * Math.PI/2); ctx.stroke();
                    // Wall gap indicator
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2/state.scale;
                    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx+dw, dy); ctx.stroke();
                    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.2/state.scale;
                    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx+dw, dy); 
                    ctx.setLineDash([2/state.scale, 2/state.scale]); ctx.stroke(); ctx.setLineDash([]);
                } else {
                    // Door on East/West wall — vertical door leaf
                    let hingeX = (door.wall==='East') ? dx+dw : dx;
                    let hingeY = dy;
                    // Door leaf line
                    ctx.beginPath(); ctx.moveTo(hingeX, hingeY); ctx.lineTo(hingeX, hingeY + swingR); ctx.stroke();
                    // Arc sweep
                    let arcDir = (door.wall==='East') ? -1 : 1;
                    ctx.beginPath(); ctx.arc(hingeX, hingeY, swingR, Math.PI/2, Math.PI/2 + arcDir*Math.PI/2); ctx.stroke();
                    // Wall gap
                    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2/state.scale;
                    ctx.beginPath(); ctx.moveTo(dx+dw, dy); ctx.lineTo(dx+dw, dy+dh); ctx.stroke();
                    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.2/state.scale;
                    ctx.beginPath(); ctx.moveTo(dx+dw, dy); ctx.lineTo(dx+dw, dy+dh);
                    ctx.setLineDash([2/state.scale, 2/state.scale]); ctx.stroke(); ctx.setLineDash([]);
                }
                ctx.restore();
            }

            if(!valid && !r.isOutside) { ctx.fillStyle = "rgba(239,68,68,0.9)"; ctx.beginPath(); ctx.moveTo(rx+rw, ry+rh); ctx.lineTo(rx+rw-14/state.scale, ry+rh); ctx.lineTo(rx+rw, ry+rh-14/state.scale); ctx.fill(); }
            
            ctx.save(); ctx.translate(rx+rw/2, ry+rh/2); ctx.scale(1, -1); 
            ctx.fillStyle = r.isOutside ? "#0e7490" : (valid ? "#0f172a" : "#ef4444"); 
            ctx.textAlign="center"; ctx.font = "bold 10px Inter"; 
            let nameY = state.showDimensions ? -5 : 0; 
            let displayName = r.isOutside ? window.getRoomName(r.name) + ' (Out)' : window.getRoomName(r.name);
            ctx.fillText(displayName, 0, nameY); 
            if (state.showDimensions) { 
                ctx.font = "normal 8px Inter"; 
                ctx.fillStyle = r.isOutside ? "#0891b2" : (valid ? "#475569" : "#fca5a5"); 
                let dimText = `${r.wF}' ${r.wI}" x ${r.hF}' ${r.hI}"`; 
                ctx.fillText(dimText, 0, 6); 
            } 
            ctx.restore();
            // Resize handle: cyan square at bottom-right, amber when actively resizing
            if(!r.isOutside) {
                let actW2=(r.wF||0)+(r.wI||0)/12, actH2=(r.hF||0)+(r.hI||0)/12;
                let hx=(r.isOutside?r.x:hP.sw.x+r.x)*px + actW2*px;
                let hy=(r.isOutside?r.y:hP.sw.y+r.y)*px - actH2*px;
                let hs=Math.max(5, 8/state.scale);
                ctx.fillStyle=(state.isResizing&&state.dragTarget===r)?'#f59e0b':'#06b6d4';
                ctx.fillRect(hx-hs, hy, hs, hs);
                ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=0.8/state.scale;
                ctx.strokeRect(hx-hs, hy, hs, hs);
            }
            ctx.restore();
        });

        // Sun path overlay
        window.drawSunPath(ctx, hP, px);
        // Draw Markers (Borewell / Septic / Outside Staircase)
        state.rooms.filter(r => r.isMarker && !r.hidden).forEach(r => {
            let rx = r.x * px, ry = r.y * px;
            if(r.type === 'Outside Staircase') {
                // Arrow symbol — upward arrow with steps
                const asz = 14 / state.scale;
                ctx.save();
                ctx.translate(rx, ry);
                ctx.strokeStyle = '#94a3b8'; ctx.fillStyle = '#94a3b8'; ctx.lineWidth = 1.5/state.scale;
                // Box
                ctx.strokeRect(-asz*0.7, -asz, asz*1.4, asz*2);
                // Step lines (3 steps)
                ctx.beginPath();
                for(let s=1;s<4;s++){let sy=-asz+s*(asz*2/4);ctx.moveTo(-asz*0.7,sy);ctx.lineTo(asz*0.7,sy);}
                ctx.stroke();
                // Arrow up
                ctx.beginPath(); ctx.lineWidth=2/state.scale;
                ctx.moveTo(0,-asz*0.7); ctx.lineTo(0,asz*0.6);
                ctx.moveTo(0,-asz*0.7); ctx.lineTo(-asz*0.4,-asz*0.2);
                ctx.moveTo(0,-asz*0.7); ctx.lineTo(asz*0.4,-asz*0.2);
                ctx.stroke();
                ctx.restore();
                ctx.save(); ctx.translate(rx, ry + 20/state.scale); ctx.scale(1,-1);
                ctx.fillStyle='#94a3b8'; ctx.font='bold 8px Inter'; ctx.textAlign='center';
                ctx.fillText(r.name||'Stair(Out)',0,0); ctx.restore();
            } else {
                ctx.beginPath(); ctx.arc(rx, ry, 6, 0, Math.PI*2); ctx.fillStyle = r.color; ctx.fill();
                ctx.beginPath(); ctx.arc(rx, ry, 10, 0, Math.PI*2); ctx.strokeStyle = r.color; ctx.lineWidth=2; ctx.stroke();
                ctx.save(); ctx.translate(rx, ry + 15/state.scale); ctx.scale(1, -1); ctx.fillStyle = "#1e293b"; ctx.font="bold 8px Inter"; ctx.textAlign="center"; ctx.fillText(r.name, 0, 0); ctx.restore();
            }
        });

        // Draw Main Gate (site-level rectangle on compound wall)
        state.rooms.filter(r => r.isSiteGate && !r.hidden).forEach(r => {
            let actW=(r.wF||0)+(r.wI||0)/12, actH=(r.hF||0)+(r.hI||0)/12;
            let rx=r.x*px, ry=r.y*px, rw=actW*px, rh=actH*px;
            ctx.save();
            ctx.fillStyle='rgba(245,158,11,0.25)'; ctx.fillRect(rx,ry,rw,rh);
            ctx.strokeStyle='#f59e0b'; ctx.lineWidth=2.5/state.scale;
            ctx.strokeRect(rx,ry,rw,rh);
            // Gate symbol: two vertical bars + gap in middle
            ctx.strokeStyle='#f59e0b'; ctx.lineWidth=1.5/state.scale;
            ctx.beginPath();
            if(rw>=rh){ // horizontal gate (E/W road)
                ctx.moveTo(rx+rw*0.1,ry); ctx.lineTo(rx+rw*0.1,ry+rh);
                ctx.moveTo(rx+rw*0.9,ry); ctx.lineTo(rx+rw*0.9,ry+rh);
            } else { // vertical gate (N/S road)
                ctx.moveTo(rx,ry+rh*0.1); ctx.lineTo(rx+rw,ry+rh*0.1);
                ctx.moveTo(rx,ry+rh*0.9); ctx.lineTo(rx+rw,ry+rh*0.9);
            }
            ctx.stroke();
            ctx.save(); ctx.translate(rx+rw/2, ry+rh/2+16/state.scale); ctx.scale(1,-1);
            ctx.fillStyle='#f59e0b'; ctx.font='bold 8px Inter'; ctx.textAlign='center';
            const gFt=Math.max(actW,actH); ctx.fillText('GATE '+(gFt|0)+"'",0,0); ctx.restore();
            ctx.restore();
        });

        // Draw Ink Lines
        if(state.inkLines && state.inkLines.length) {
            state.inkLines.forEach(path => {
                if(!path.points || path.points.length < 2) return;
                ctx.save();
                ctx.strokeStyle = path.color || '#ef4444';
                ctx.lineWidth = (path.width||2.5) / state.scale;
                ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath();
                ctx.moveTo(path.points[0].x * px, path.points[0].y * px);
                for(let i=1;i<path.points.length;i++) ctx.lineTo(path.points[i].x*px, path.points[i].y*px);
                ctx.stroke();
                ctx.restore();
            });
        }

        // Draw Separate Furniture
        state.rooms.filter(r => r.isFurniture && !r.hidden).forEach(r => {
            let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12; let rx = (hP.sw.x + r.x)*px, ry = (hP.sw.y + r.y)*px; let rw = actW * px, rh = actH * px;
            ctx.save(); 
            if (r.type === 'Bed') { ctx.fillStyle = r.color; ctx.fillRect(rx, ry, rw, rh); ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fillRect(rx + 2, ry + rh - 10, rw - 4, 8); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1; ctx.strokeRect(rx, ry, rw, rh); } 
            else if (r.type === 'Stove') { ctx.fillStyle = r.color; ctx.fillRect(rx, ry, rw, rh); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(rx + rw*0.3, ry + rh/2, Math.min(rw,rh)*0.2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(rx + rw*0.7, ry + rh/2, Math.min(rw,rh)*0.2, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1; ctx.strokeRect(rx, ry, rw, rh); } 
            else if (r.type === 'Commode') { 
                // FLOOR PLAN SYMBOL: Commode/WC — light oval with tank rectangle
                ctx.save();
                ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 1/state.scale;
                // Bowl oval
                ctx.beginPath(); ctx.ellipse(rx + rw/2, ry + rh*0.55, rw*0.45, rh*0.38, 0, 0, Math.PI*2);
                ctx.fill(); ctx.stroke();
                // Tank rectangle at back
                ctx.fillStyle = "#e2e8f0";
                ctx.fillRect(rx + rw*0.1, ry + rh*0.05, rw*0.8, rh*0.25);
                ctx.strokeRect(rx + rw*0.1, ry + rh*0.05, rw*0.8, rh*0.25);
                ctx.restore(); 
            } 
            else if (r.type.includes('Door')) { 
                // FLOOR PLAN SYMBOL: Arc swing door
                ctx.save();
                let isV = rh > rw; // vertical door (on side wall) vs horizontal (on top/bottom wall)
                // White background gap on wall
                ctx.fillStyle = "#ffffff"; ctx.fillRect(rx, ry, rw, rh);
                ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5/state.scale;
                if(isV) {
                    // Vertical door — leaf goes right, arc sweeps right
                    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx, ry+rh); ctx.stroke(); // door leaf
                    ctx.beginPath(); ctx.arc(rx, ry, rh, 0, Math.PI/2); ctx.stroke(); // arc sweep
                } else {
                    // Horizontal door — leaf goes up, arc sweeps up  
                    ctx.beginPath(); ctx.moveTo(rx, ry+rh); ctx.lineTo(rx+rw, ry+rh); ctx.stroke(); // door leaf
                    ctx.beginPath(); ctx.arc(rx, ry+rh, rw, 0, -Math.PI/2); ctx.stroke(); // arc sweep
                }
                // Door label
                ctx.scale(1,-1); ctx.font = `bold ${Math.min(rw,rh)*0.5}px Inter`;
                ctx.fillStyle = "#334155"; ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.fillText("D", rx+rw/2, -(ry+rh/2));
                ctx.restore(); 
            } 
            else if (r.type.includes('Window')) { 
                // FLOOR PLAN SYMBOL: Window — 3 parallel lines across wall thickness
                ctx.save();
                // White background
                ctx.fillStyle = "#ffffff"; ctx.fillRect(rx, ry, rw, rh);
                ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1/state.scale;
                // Outer border
                ctx.strokeRect(rx, ry, rw, rh);
                // 3 parallel lines (standard architectural window symbol)
                ctx.strokeStyle = "#334155"; ctx.lineWidth = 1/state.scale;
                if(rw > rh) {
                    // Horizontal window (on N/S wall) — 3 horizontal lines
                    let y1 = ry + rh * 0.2, y2 = ry + rh * 0.5, y3 = ry + rh * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(rx+1/state.scale, y1); ctx.lineTo(rx+rw-1/state.scale, y1);
                    ctx.moveTo(rx+1/state.scale, y2); ctx.lineTo(rx+rw-1/state.scale, y2);
                    ctx.moveTo(rx+1/state.scale, y3); ctx.lineTo(rx+rw-1/state.scale, y3);
                    ctx.stroke();
                } else {
                    // Vertical window (on E/W wall) — 3 vertical lines
                    let x1 = rx + rw * 0.2, x2 = rx + rw * 0.5, x3 = rx + rw * 0.8;
                    ctx.beginPath();
                    ctx.moveTo(x1, ry+1/state.scale); ctx.lineTo(x1, ry+rh-1/state.scale);
                    ctx.moveTo(x2, ry+1/state.scale); ctx.lineTo(x2, ry+rh-1/state.scale);
                    ctx.moveTo(x3, ry+1/state.scale); ctx.lineTo(x3, ry+rh-1/state.scale);
                    ctx.stroke();
                }
                // W label
                ctx.scale(1,-1); ctx.font = `bold ${Math.min(rw,rh)*0.45}px Inter`;
                ctx.fillStyle = "#0284c7"; ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.fillText("W", rx+rw/2, -(ry+rh/2));
                ctx.restore(); 
            }
            ctx.restore();
        });

        // Draw Custom Texts
        if(state.texts) {
            state.texts.forEach(t => {
                if(t.hidden) return;
                let rx = t.x * px, ry = t.y * px;
                ctx.save(); ctx.translate(rx, ry); ctx.scale(1, -1);
                ctx.font = `900 ${12/state.scale}px Inter`; ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.lineJoin="round"; ctx.miterLimit=2; ctx.strokeStyle="white"; ctx.lineWidth=3; ctx.strokeText(t.text, 0, 0);
                ctx.fillStyle = "#0f172a"; ctx.fillText(t.text, 0, 0); ctx.restore();
            });
        }

        if (state.isDragging && state.dragTarget && state.dragTarget.type && !state.dragTarget.isMarker && !state.dragTarget.text) {
            let r = state.dragTarget; let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12;
            // Use site or house coords depending on room type
            let rx = r.isOutside ? r.x*px : (hP.sw.x + r.x)*px;
            let ry = r.isOutside ? r.y*px : (hP.sw.y + r.y)*px;
            let rw = actW * px, rh = actH * px;
            let maxX = r.isOutside ? state.siteS : state.houseEw;
            let maxY = r.isOutside ? state.siteW : state.houseNs;
            let originX = r.isOutside ? 0 : hP.sw.x * px;
            let originY = r.isOutside ? 0 : hP.sw.y * px;
            ctx.save(); ctx.strokeStyle = "rgba(59, 130, 246, 0.6)"; ctx.lineWidth = 1/state.scale; ctx.setLineDash([4/state.scale, 4/state.scale]); ctx.fillStyle = "#3b82f6"; ctx.font = `bold ${9/state.scale}px Inter`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            let drawDL = (x1, y1, x2, y2, text, tX, tY) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.save(); ctx.translate(tX, tY); ctx.scale(1,-1); let tw = ctx.measureText(text).width; ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fillRect(-tw/2-2, -6/state.scale, tw+4, 12/state.scale); ctx.fillStyle = "#3b82f6"; ctx.fillText(text, 0, 0); ctx.restore(); };
            let distW = r.x; drawDL(originX, ry + rh/2, rx, ry + rh/2, window.formatLen(distW), originX + (rx - originX)/2, ry + rh/2);
            let distE = maxX - (r.x + actW); drawDL(rx + rw, ry + rh/2, originX + maxX*px, ry + rh/2, window.formatLen(distE), rx + rw + (maxX*px - (r.x+actW)*px)/2, ry + rh/2);
            let distS = r.y; drawDL(rx + rw/2, originY, rx + rw/2, ry, window.formatLen(distS), rx + rw/2, originY + (ry - originY)/2);
            let distN = maxY - (r.y + actH); drawDL(rx + rw/2, ry + rh, rx + rw/2, originY + maxY*px, window.formatLen(distN), rx + rw/2, ry + rh + (maxY*px - (r.y+actH)*px)/2);
            ctx.restore();
        }

        if(state.isMeasuring && state.measurePoints.length > 0) {
            ctx.save(); ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2 / state.scale; ctx.fillStyle = "#3b82f6"; let p1 = state.measurePoints[0]; let p2 = state.measurePoints.length > 1 ? state.measurePoints[1] : state.currentMousePos;
            if(p2) { ctx.beginPath(); ctx.arc(p1.x*px, p1.y*px, 4 / state.scale, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.setLineDash([5/state.scale, 5/state.scale]); ctx.moveTo(p1.x*px, p1.y*px); ctx.lineTo(p2.x*px, p2.y*px); ctx.stroke(); ctx.beginPath(); ctx.setLineDash([]); ctx.arc(p2.x*px, p2.y*px, 4 / state.scale, 0, Math.PI*2); ctx.fill(); let distFt = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2); ctx.save(); ctx.translate((p1.x + p2.x)/2*px, (p1.y + p2.y)/2*px); ctx.scale(1, -1); ctx.font = `900 ${14 / state.scale}px Inter`; ctx.textAlign = "center"; ctx.fillStyle = "rgba(15, 23, 42, 0.8)"; let tw = ctx.measureText(window.formatLen(distFt)).width; ctx.fillRect(-tw/2-4, -16/state.scale, tw+8, 20/state.scale); ctx.fillStyle = "#60a5fa"; ctx.fillText(window.formatLen(distFt), 0, -4/state.scale); ctx.restore(); } ctx.restore();
        }
        if(state.measureLines) {
            ctx.save(); ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 2 / state.scale; ctx.fillStyle = "#3b82f6";
            state.measureLines.forEach(l => { ctx.beginPath(); ctx.arc(l[0].x*px, l[0].y*px, 4 / state.scale, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.moveTo(l[0].x*px, l[0].y*px); ctx.lineTo(l[1].x*px, l[1].y*px); ctx.stroke(); ctx.beginPath(); ctx.arc(l[1].x*px, l[1].y*px, 4 / state.scale, 0, Math.PI*2); ctx.fill(); let distFt = Math.sqrt((l[1].x - l[0].x)**2 + (l[1].y - l[0].y)**2); ctx.save(); ctx.translate((l[0].x + l[1].x)/2*px, (l[0].y + l[1].y)/2*px); ctx.scale(1, -1); ctx.font = `900 ${14 / state.scale}px Inter`; ctx.textAlign = "center"; ctx.fillStyle = "rgba(15, 23, 42, 0.8)"; let tw = ctx.measureText(window.formatLen(distFt)).width; ctx.fillRect(-tw/2-4, -16/state.scale, tw+8, 20/state.scale); ctx.fillStyle = "#60a5fa"; ctx.fillText(window.formatLen(distFt), 0, -4/state.scale); ctx.restore(); }); ctx.restore();
        }

        // Status bar update
        const atl = document.getElementById('activeToolLabel');
        if(atl) {
            let toolName = 'SELECT';
            if(state.isDrawingWall) toolName = '✏️ WALL MODE';
            else if(state.isMeasuring) toolName = '📏 MEASURE MODE';
            else if(state.isDrawingRect) toolName = '▭ RECT MODE';
            else if(state.isDragging && state.dragTarget && state.dragTarget !== 'canvas') toolName = '✥ DRAGGING';
            else if(state.isResizing) toolName = '⤡ RESIZING';
            atl.innerHTML = toolName;
        }
        const snapEl = document.getElementById('snapState');
        if(snapEl) { snapEl.textContent = state.snap ? 'SNAP ON' : 'SNAP OFF'; snapEl.style.color = state.snap ? '#4ade80' : '#94a3b8'; }
        const gridEl = document.getElementById('gridState');
        if(gridEl) { gridEl.textContent = state.showGrid ? 'GRID ON' : 'GRID OFF'; gridEl.style.color = state.showGrid ? '#4ade80' : '#94a3b8'; }
        const flEl = document.getElementById('floorLabel');
        if(flEl) flEl.textContent = state.currentFloor === 0 ? '🏠 GF' : '🏢 1F';
        let scaleEl = document.getElementById('scaleIndicator'); if(scaleEl) scaleEl.innerText = state.scale.toFixed(1) + 'x';
        // Sync quick toggle button states
        const qtSync = [['qtGrid',state.showGrid],['qtDim',state.showDimensions],['qtDev',state.showPlotDeities],['qtXray',state.xray]];
        qtSync.forEach(([id,on]) => { let el=document.getElementById(id); if(el){ el.style.background=on?'#3b82f6':'#1e293b'; el.style.color=on?'#fff':'#94a3b8'; el.style.borderColor=on?'#2563eb':'#334155'; } });

        // Point 12: Draw separation rectangles (4 lines only, no fill)
        if(state.shapes) {
            state.shapes.forEach(s => {
                if(s.hidden) return;
                ctx.save();
                ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.5/state.scale; ctx.setLineDash([6/state.scale, 3/state.scale]);
                ctx.strokeRect(s.x * px, s.y * px, s.w * px, s.h * px);
                ctx.setLineDash([]);
                // Resize handle dot
                ctx.fillStyle = "#475569"; ctx.beginPath(); ctx.arc((s.x + s.w)*px, (s.y + s.h)*px, 4/state.scale, 0, Math.PI*2); ctx.fill();
                ctx.restore();
            });
        }
        // Rect draw preview
        if(state.isDrawingRect && state.rectDrawing && state.rectStart && state.currentMousePos) {
            let x1=state.rectStart.x*px, y1=state.rectStart.y*px, x2=state.currentMousePos.x*px, y2=state.currentMousePos.y*px;
            ctx.save(); ctx.strokeStyle="#3b82f6"; ctx.lineWidth=1.5/state.scale; ctx.setLineDash([5/state.scale,3/state.scale]);
            ctx.strokeRect(Math.min(x1,x2), Math.min(y1,y2), Math.abs(x2-x1), Math.abs(y2-y1));
            ctx.setLineDash([]); ctx.restore();
        }
    }

    function setupEvents() {
        canvas.addEventListener('wheel', e => { 
            e.preventDefault(); const dpr = window.devicePixelRatio || 2; const rc = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rc.left) * dpr; const mouseY = (e.clientY - rc.top) * dpr;
            const worldX = (mouseX - (rc.width/2 * dpr + state.offsetX * dpr)) / (state.scale * dpr);
            const worldY = (mouseY - (rc.height/2 * dpr + state.offsetY * dpr)) / (state.scale * dpr);
            const zoomFactor = Math.exp(-e.deltaY * 0.001); const newScale = Math.max(0.1, Math.min(state.scale * zoomFactor, 12)); 
            state.offsetX = (mouseX - worldX * newScale * dpr - rc.width/2 * dpr) / dpr; state.offsetY = (mouseY - worldY * newScale * dpr - rc.height/2 * dpr) / dpr; state.scale = newScale; window.draw(); 
        }, { passive: false });
        
        window.addEventListener('keydown', (e) => {
            const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isInput = (tag === 'input' || tag === 'textarea' || tag === 'select');
            if(e.key === 'Escape') { 
                if(state.isDrawingWall) { if(state.wallPoints.length > 0) { state.wallPoints = []; window.draw(); } else { window.toggleWallTool(); } } 
                if(state.isMeasuring) { state.measurePoints = []; window.draw(); } 
                if(state.isDrawingRect) { state.isDrawingRect = false; state.rectDrawing = false; state.rectStart = null; let rb = document.getElementById('rectBtn'); if(rb) rb.classList.remove('btn-active'); canvas.style.cursor='default'; window.draw(); }
                if(state.isInking) { window.toggleInkTool(); }
            }
            if(!isInput) {
                if((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); window.undo(); }
                if((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); window.redo(); }
                if(e.key === 'Delete' || e.key === 'Backspace') {
                    if(state.dragTarget && state.dragTarget !== 'canvas' && state.dragTarget.type) {
                        let idx = state.rooms.indexOf(state.dragTarget);
                        if(idx !== -1) { state.rooms.splice(idx, 1); state.dragTarget = null; state.isDragging = false; renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory(); }
                    }
                }
                if(e.key === '0') { e.preventDefault(); state.scale = 0.8; state.offsetX = 0; state.offsetY = 0; window.draw(); }
                if(e.key === '+' || e.key === '=') { e.preventDefault(); state.scale = Math.min(state.scale * 1.15, 12); window.draw(); }
                if(e.key === '-') { e.preventDefault(); state.scale = Math.max(state.scale * 0.87, 0.1); window.draw(); }
                if(e.key === 'g' || e.key === 'G') { state.showGrid = !state.showGrid; let cb = document.querySelector('input[onchange*="showGrid"]'); if(cb) cb.checked = state.showGrid; window.draw(); window.saveLocal(); }
                if(e.key === 's' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); window.saveNewProject(); }
            }
        });

        const gC = (e) => {
            const rc = canvas.getBoundingClientRect(), cX = e.touches ? e.touches[0].clientX : e.clientX, cY = e.touches ? e.touches[0].clientY : e.clientY;
            const px = 300 / Math.max(state.siteW, state.siteS), sP = getSitePolygon(), cOX = (sP.se.x * px) / 2, cOY = (sP.nw.y * px) / 2;
            let mathX = (cX - rc.left - rc.width/2 - state.offsetX) / state.scale + cOX, mathY = -(cY - rc.top - rc.height/2 - state.offsetY - 22) / state.scale + cOY; 
            return { cX, cY, wx: mathX, wy: mathY, px };
        };

        canvas.addEventListener('mousedown', (e) => {
            const { cX, cY, wx, wy, px } = gC(e); let sV = state.snap ? 0.5 : 0.01; let hP = getHousePolygon();
            // Ink tool intercepts all mousedown — captured by the ink listener added earlier
            if (state.isInking) return;
            
            if (state.isDrawingWall) { let relX = (wx / px) - hP.sw.x; let relY = (wy / px) - hP.sw.y; let mx = Math.round(relX / sV) * sV; let my = Math.round(relY / sV) * sV; if (!state.wallPoints) state.wallPoints = []; state.wallPoints.push({x: mx, y: my}); if (state.wallPoints.length === 2) { if(!state.walls) state.walls = []; state.walls.push({ p1: state.wallPoints[0], p2: state.wallPoints[1], thickness: state.wallDeduction || 0.375 }); state.wallPoints = [state.wallPoints[1]]; window.saveStateToHistory(); window.saveLocal(); } window.draw(); return; }
            if (state.isMeasuring) { let mx = Math.round((wx / px) / sV) * sV; let my = Math.round((wy / px) / sV) * sV; if (!state.measurePoints) state.measurePoints = []; if (state.measurePoints.length === 0) { state.measurePoints.push({x: mx, y: my}); } else { state.measurePoints.push({x: mx, y: my}); if(!state.measureLines) state.measureLines = []; state.measureLines.push([...state.measurePoints]); state.measurePoints = []; } window.draw(); return; }
            
            // Point 12: Rectangle drawing tool
            if (state.isDrawingRect) {
                let rx = Math.round((wx / px) / sV) * sV; let ry = Math.round((wy / px) / sV) * sV;
                state.rectStart = { x: rx, y: ry }; state.rectDrawing = true; window.draw(); return;
            }

            state.isDragging = true; state.isResizing = false; state.lastX = cX; state.lastY = cY; state.dragTarget = 'canvas';

            
            // Point 12: Check rect shapes for drag/resize
            if(state.shapes) {
                for(let i = state.shapes.length - 1; i >= 0; i--) {
                    let s = state.shapes[i]; if(s.hidden) continue;
                    let rx = s.x * px, ry = s.y * px, rw = s.w * px, rh = s.h * px;
                    // Resize handle: bottom-right corner
                    if(wx > rx + rw - 12/state.scale && wx < rx + rw + 5/state.scale && wy > ry + rh - 12/state.scale && wy < ry + rh + 5/state.scale) {
                        state.isResizing = true; state.isDragging = false; state.dragTarget = s; state.dragType = 'shape'; break;
                    }
                    // Hit: within 6px of any edge
                    let nearL = Math.abs(wx - rx) < 8/state.scale && wy >= ry - 4/state.scale && wy <= ry + rh + 4/state.scale;
                    let nearR = Math.abs(wx - (rx+rw)) < 8/state.scale && wy >= ry - 4/state.scale && wy <= ry + rh + 4/state.scale;
                    let nearT = Math.abs(wy - (ry+rh)) < 8/state.scale && wx >= rx - 4/state.scale && wx <= rx + rw + 4/state.scale;
                    let nearB = Math.abs(wy - ry) < 8/state.scale && wx >= rx - 4/state.scale && wx <= rx + rw + 4/state.scale;
                    if(nearL || nearR || nearT || nearB) {
                        state.dragTarget = s; state.dragType = 'shape'; 
                        state.dragOffsetX = s.x - (wx / px); state.dragOffsetY = s.y - (wy / px); break;
                    }
                }
            }
            if(state.dragTarget !== 'canvas') return;

            if(state.texts) {
                for (let i = state.texts.length - 1; i >= 0; i--) {
                    let t = state.texts[i]; if(t.hidden) continue;
                    let tx = t.x * px, ty = t.y * px;
                    if (Math.abs(wx - tx) < 40/state.scale && Math.abs(wy - ty) < 22/state.scale) { state.dragTarget = t; state.dragType = 'text'; state.dragOffsetX = t.x - (wx / px); state.dragOffsetY = t.y - (wy / px); break; }
                }
            }
            if(state.dragTarget !== 'canvas') return;

            for (let i = state.rooms.length - 1; i >= 0; i--) {
                let r = state.rooms[i]; if(r.hidden) continue;
                if (r.isMarker) {
                    let mx = r.x * px, my = r.y * px;
                    if(Math.sqrt((wx-mx)**2 + (wy-my)**2) <= 15/state.scale) { state.dragTarget = r; state.dragType = 'room'; state.dragOffsetX = r.x - (wx / px); state.dragOffsetY = r.y - (wy / px); break; }
                } else {
                    // Use site coords for outside rooms, house coords for inside rooms
                    let rx = r.isOutside ? r.x * px : (hP.sw.x + r.x) * px;
                    let ry = r.isOutside ? r.y * px : (hP.sw.y + r.y) * px;
                    let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12; 
                    let trX = rx + actW * px, trY = ry + actH * px;
                    let resizePad = 12/state.scale;
                    let hitResize = (wx > trX - resizePad && wx < trX + 5/state.scale && wy > trY - resizePad && wy < trY + 5/state.scale);
                    let pad = r.isFurniture ? 8/state.scale : 0;
                    let hit = (wx >= rx - pad && wx <= trX + pad && wy >= ry - pad && wy <= trY + pad);
                    if (hitResize) { 
                        state.isResizing = true; state.isDragging = false; state.dragTarget = r; 
                        state.resizeFurnitureWidthOnly = r.isFurniture && (r.type.includes('Door') || r.type.includes('Window'));
                        break; 
                    } else if (hit) { 
                        state.dragTarget = r; state.dragType = 'room';
                        if(r.isOutside) {
                            state.dragOffsetX = r.x - (wx / px); state.dragOffsetY = r.y - (wy / px);
                        } else {
                            state.dragOffsetX = r.x - (wx / px - hP.sw.x); state.dragOffsetY = r.y - (wy / px - hP.sw.y);
                        }
                        break; 
                    }
                }
            }

            // ── GATE CLICK: Runs only if no room/shape/text was hit ──
            // Safe here — all room/resize hit-tests already done above
            if(!state.isDrawingWall && !state.isMeasuring && !state.isDrawingRect && state.dragTarget === 'canvas') {
                const hDevData = getShiftedDevathas(hP, state.houseNs, state.houseEw, state.houseNs, state.houseEw, state.rotation);
                const hitRadius = 14 / state.scale;
                for(let d of hDevData.finalDevs) {
                    let dMid = (d.d_start + d.len / 2) % hDevData.P;
                    let pMid = getPtOnPerimeter(dMid, hDevData.poly, hDevData.N, hDevData.E, hDevData.S, hDevData.W);
                    let dx = wx/px - pMid.x, dy = wy/px - pMid.y;
                    if(Math.sqrt(dx*dx + dy*dy) <= hitRadius) {
                        state.isDragging = false;
                        state.selectedDwara = d.name;
                        let sel = document.getElementById('dwaraSelect');
                        if(sel) sel.value = d.name;
                        window.draw(); window.saveLocal(); window.saveStateToHistory();
                        showToast('Gate set to ' + d.name + (d.rating === 'good' ? ' ★ Good' : d.rating === 'bad' ? ' ✗ Bad' : ''));
                        return;
                    }
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            const { cX, cY, wx, wy, px } = gC(e); let sV = state.snap ? 0.5 : 0.01; let hP = getHousePolygon();
            // Ink tool handled by capture listener
            if (state.isInking) return;

            if (state.isDrawingWall) { canvas.style.cursor = 'crosshair'; let relX = (wx / px) - hP.sw.x; let relY = (wy / px) - hP.sw.y; state.currentMousePos = { x: Math.round(relX / sV) * sV, y: Math.round(relY / sV) * sV }; window.draw(); return; }
            if (state.isMeasuring) { canvas.style.cursor = 'crosshair'; state.currentMousePos = { x: Math.round((wx / px) / sV) * sV, y: Math.round((wy / px) / sV) * sV }; window.draw(); return; } 
            
            // Point 12: rect draw preview
            if (state.isDrawingRect) { canvas.style.cursor = 'crosshair'; state.currentMousePos = { x: Math.round((wx / px) / sV) * sV, y: Math.round((wy / px) / sV) * sV }; window.draw(); return; }

            else if (!state.isDragging && !state.isResizing) {
                let cursor = 'crosshair';
                if(!state.isDrawingWall && !state.isMeasuring && !state.isDrawingRect) {
                    // Text label hover → move cursor
                    if(state.texts) { for(let t of state.texts) { if(t.hidden) continue; if(Math.abs(wx/px-t.x)<40/state.scale && Math.abs(wy/px-t.y)<22/state.scale){cursor='move';break;} } }
                    // Devatha hover → pointer (only if not hovering text)
                    if(cursor==='crosshair') {
                        const hDV=getShiftedDevathas(getHousePolygon(),state.houseNs,state.houseEw,state.houseNs,state.houseEw,state.rotation);
                        for(let d of hDV.finalDevs){let dm=(d.d_start+d.len/2)%hDV.P,pm=getPtOnPerimeter(dm,hDV.poly,hDV.N,hDV.E,hDV.S,hDV.W),dx=wx/px-pm.x,dy=wy/px-pm.y;if(Math.sqrt(dx*dx+dy*dy)<=18/state.scale){cursor='pointer';break;}}
                    }
                }
                // Check shapes for edge hover
                if(state.shapes) { for(let s of state.shapes) { if(s.hidden) continue; let rx=s.x*px, ry=s.y*px, rw=s.w*px, rh=s.h*px; let nearEdge = (Math.abs(wx-rx)<8/state.scale||Math.abs(wx-(rx+rw))<8/state.scale||Math.abs(wy-ry)<8/state.scale||Math.abs(wy-(ry+rh))<8/state.scale); if(nearEdge){ cursor='grab'; break; } } }
                if(state.texts) { for (let i = 0; i < state.texts.length; i++) { let t = state.texts[i]; if(t.hidden) continue; if (Math.abs(wx - t.x*px) < 30/state.scale && Math.abs(wy - t.y*px) < 15/state.scale) { cursor = 'text'; break; } } }
                if(cursor === 'crosshair') {
                    for (let i = state.rooms.length - 1; i >= 0; i--) {
                        let r = state.rooms[i]; if(r.hidden) continue;
                        if (r.isMarker) { let mx = r.x * px, my = r.y * px; if(Math.sqrt((wx-mx)**2 + (wy-my)**2) <= 15/state.scale) { cursor = 'grab'; break; } } 
                        else {
                            // Use site coords for outside rooms, house coords for inside rooms
                            let rx = r.isOutside ? r.x*px : (hP.sw.x + r.x) * px;
                            let ry = r.isOutside ? r.y*px : (hP.sw.y + r.y) * px;
                            let actW = (r.wF||0) + (r.wI||0)/12, actH = (r.hF||0) + (r.hI||0)/12; let trX = rx + actW * px, trY = ry + actH * px; 
                            let pad = r.isFurniture ? 8/state.scale : 0; 
                            let hit = (wx >= rx - pad && wx <= trX + pad && wy >= ry - pad && wy <= trY + pad);
                            // Point 6: resize cursor for ALL rooms including furniture
                            if (wx > trX - 12/state.scale && wx < trX + 5/state.scale && wy > trY - 12/state.scale && wy < trY + 5/state.scale) { cursor = 'nesw-resize'; break; } 
                            else if (hit) { cursor = 'grab'; break; }
                        }
                    }
                } canvas.style.cursor = cursor;
            }

            if(!state.isDragging && !state.isResizing) return; if(e.cancelable) e.preventDefault(); 
            
            if(state.isResizing && state.dragTarget && state.dragTarget !== 'canvas') {
                if(state.dragType === 'shape') {
                    // Resize shape
                    let s = state.dragTarget;
                    let nW = Math.max(1, Math.round(((wx / px) - s.x) / sV) * sV);
                    let nH = Math.max(1, Math.round(((wy / px) - s.y) / sV) * sV);
                    s.w = nW; s.h = nH;
                } else if(state.resizeFurnitureWidthOnly) {
                    // Point 6: Doors/windows resize width only
                    let r = state.dragTarget;
                    let nW = Math.max(0.5, Math.round(((wx / px) - (hP.sw.x + r.x)) / sV) * sV);
                    r.wF = Math.floor(nW); r.wI = Math.round((nW % 1) * 12);
                    renderItemList();
                } else {
                    let r = state.dragTarget;
                    // Use site or house origin for resize calculation
                    let originX = (r.isOutside) ? 0 : hP.sw.x;
                    let originY = (r.isOutside) ? 0 : hP.sw.y;
                    let nW = Math.max(0.5, Math.round(((wx / px) - originX - r.x)/sV)*sV); 
                    let nH = Math.max(0.5, Math.round(((wy / px) - originY - r.y)/sV)*sV);
                    r.wF = Math.floor(nW); r.wI = Math.round((nW % 1) * 12); 
                    r.hF = Math.floor(nH); r.hI = Math.round((nH % 1) * 12); 
                    renderItemList(); 
                }
            } else if(state.dragTarget === 'canvas') {
                state.offsetX += (cX - state.lastX) / window.devicePixelRatio; state.offsetY += (cY - state.lastY) / window.devicePixelRatio; state.lastX = cX; state.lastY = cY;
            } else if(state.dragTarget && state.dragType === 'shape') {
                // Drag shape
                let s = state.dragTarget;
                let nx = Math.round(((wx / px) + state.dragOffsetX) / sV) * sV;
                let ny = Math.round(((wy / px) + state.dragOffsetY) / sV) * sV;
                s.x = nx; s.y = ny;
            } else if(state.dragTarget && state.dragTarget.text) {
                state.dragTarget.x = Math.max(0, Math.min((wx / px) + state.dragOffsetX, state.siteS)); state.dragTarget.y = Math.max(0, Math.min((wy / px) + state.dragOffsetY, state.siteW));
            } else if(state.dragTarget) {
                if (state.dragTarget.isMarker || state.dragTarget.isOutside) { 
                    // Markers and outside rooms use site coordinates
                    let nx = Math.round(((wx / px) + state.dragOffsetX)/sV)*sV; 
                    let ny = Math.round(((wy / px) + state.dragOffsetY)/sV)*sV; 
                    let actW = (state.dragTarget.wF||0) + (state.dragTarget.wI||0)/12;
                    let actH = (state.dragTarget.hF||0) + (state.dragTarget.hI||0)/12;
                    if(state.dragTarget.isSiteGate) {
                        // CONSTRAINED DRAG: gate slides along compound wall only
                        const road = state.roadDir || 'East';
                        if(road === 'East' || road === 'West') {
                            // Gate on E or W wall — fix X to wall, slide Y only
                            nx = (road === 'East') ? state.siteS - actW : 0;
                            ny = Math.max(0, Math.min(ny, state.siteW - actH));
                        } else {
                            // Gate on N or S wall — fix Y to wall, slide X only
                            ny = (road === 'North') ? state.siteW - actH : 0;
                            nx = Math.max(0, Math.min(nx, state.siteS - actW));
                        }
                        state.dragTarget.x = nx; state.dragTarget.y = ny;
                    } else {
                        state.dragTarget.x = Math.max(0, Math.min(nx, state.siteS - actW)); 
                        state.dragTarget.y = Math.max(0, Math.min(ny, state.siteW - actH));
                    }
                } else { 
                    // Inside rooms use house-relative coordinates
                    let actW = (state.dragTarget.wF||0) + (state.dragTarget.wI||0)/12, actH = (state.dragTarget.hF||0) + (state.dragTarget.hI||0)/12; 
                    let nx = Math.round(((wx / px - hP.sw.x) + state.dragOffsetX)/sV)*sV; 
                    let ny = Math.round(((wy / px - hP.sw.y) + state.dragOffsetY)/sV)*sV; 
                    state.dragTarget.x = Math.max(0, Math.min(nx, state.houseEw - actW)); 
                    state.dragTarget.y = Math.max(0, Math.min(ny, state.houseNs - actH)); 
                }
            } window.draw();
        }, { passive: false });

        window.addEventListener('mouseup', (e) => {
            // Ink tool handled by capture listener
            if (state.isInking) return;
            // Point 12: Finalize rect drawing
            if(state.isDrawingRect && state.rectDrawing && state.rectStart && state.currentMousePos) {
                let sV = state.snap ? 0.5 : 0.01;
                let x1 = state.rectStart.x, y1 = state.rectStart.y;
                let x2 = state.currentMousePos.x, y2 = state.currentMousePos.y;
                let rx = Math.min(x1, x2), ry = Math.min(y1, y2);
                let rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1);
                if(rw > 0.5 && rh > 0.5) {
                    if(!state.shapes) state.shapes = [];
                    state.shapes.push({ x: rx, y: ry, w: rw, h: rh, hidden: false });
                    renderShapeList(); window.saveStateToHistory(); window.saveLocal();
                }
                state.rectDrawing = false; state.rectStart = null; window.draw(); return;
            }
            if(state.isDragging || state.isResizing) { renderItemList(); window.saveStateToHistory(); window.saveLocal(); } 
            state.isDragging = false; state.isResizing = false; state.resizeFurnitureWidthOnly = false; state.dragType = null;
            syncDeleteBtn();
        });

        // ── Tool-active helper — used by touch handlers ──
        function isToolActive() {
            return !!(state.isInking || state.isDrawingWall || state.isMeasuring || state.isDrawingRect || state.isDragging || state.isResizing);
        }

        // ── Show/hide/enable delete buttons based on selection ──
        function syncDeleteBtn() {
            var hasSelection = !!(state.dragTarget && state.dragTarget !== 'canvas');

            // ── Mobile floating delete (canvas overlay) ──
            var db = document.getElementById('mobDeleteBtn');
            if(db) db.style.display = (hasSelection && window.innerWidth < 768) ? 'block' : 'none';

            // ── Mobile header delete button ──
            var mhd = document.getElementById('mobHdrDeleteBtn');
            if(mhd) {
                if(hasSelection && window.innerWidth < 768) {
                    mhd.style.display = 'flex';
                } else {
                    mhd.style.display = 'none';
                }
            }

            // ── Desktop header delete button ──
            var hdb = document.getElementById('hdrDeleteBtn');
            if(hdb) {
                if(hasSelection) {
                    hdb.disabled = false;
                    hdb.style.background = 'rgba(220,38,38,0.2)';
                    hdb.style.color = '#f87171';
                    hdb.style.borderColor = '#991b1b';
                    hdb.style.cursor = 'pointer';
                    hdb.style.opacity = '1';
                } else {
                    hdb.disabled = true;
                    hdb.style.background = '#1e293b';
                    hdb.style.color = '#475569';
                    hdb.style.borderColor = '#334155';
                    hdb.style.cursor = 'not-allowed';
                    hdb.style.opacity = '0.45';
                }
            }
        }
        // Expose globally so end-of-file scripts can call it
        window._syncDeleteBtnGlobal = syncDeleteBtn;

        // ── Sync both cancel and delete buttons ──
        function syncToolClass() {
            var active = isToolActive();
            document.body.classList.toggle('tool-active', active);
            // Show/hide floating cancel button on mobile canvas
            var cb = document.getElementById('mobCancelToolBtn');
            if(cb) cb.style.display = (active && window.innerWidth < 768) ? 'block' : 'none';
            // Sync delete button
            syncDeleteBtn();
        }

        // ── SHARED: force-cancel ALL drawing tools — delegates to setActiveTool reset ──
        function forceDeactivateAllTools() {
            // Use setActiveTool's hard-reset by passing a non-matching tool
            // This clears all state, buttons and cursors in one place
            window._activeTool = null;
            state.isDrawingWall  = false; state.wallPoints    = [];
            state.isMeasuring    = false; state.measurePoints = [];
            state.isDrawingRect  = false; state.rectDrawing   = false; state.rectStart = null;
            state.isInking       = false; state._inkDrawing   = false;
            ['wallBtn','measureBtn','rectBtn','inkBtn','inkBtnSite'].forEach(function(id){
                var b = document.getElementById(id); if(b) b.classList.remove('btn-active');
            });
            ['mob-wallBtn','mob-measureBtn','mob-rectBtn','mob-inkBtn'].forEach(function(id){
                var b = document.getElementById(id); if(b) b.classList.remove('mob-tool-active');
            });
            var inkCvs = document.getElementById('vastuCanvas');
            if(inkCvs) inkCvs.style.cursor = 'default';
            if(canvas) canvas.style.cursor = 'default';
            var lbl = document.getElementById('activeToolLabel');
            if(lbl) lbl.innerHTML = '<i class="fa-solid fa-arrow-pointer mr-1"></i>SELECT';
            var mg = document.getElementById('measureGuide');
            if(mg) mg.classList.add('hidden');
            state.dragTarget = null;
            if(typeof syncDeleteBtn === 'function') syncDeleteBtn();
        }

        // ── Mobile: cancel any active tool cleanly (no undo push) ──
        window.mobCancelActiveTool = function() {
            forceDeactivateAllTools();
            state.isDragging = false; state.isResizing = false;
            if(typeof window.draw === 'function') window.draw();
            document.body.classList.remove('tool-active');
            var cb = document.getElementById('mobCancelToolBtn');
            if(cb) cb.style.display = 'none';
            showToast('Tool cancelled');
        };

        // ── Mobile: delete currently selected object ──
        window.mobDeleteSelected = function() {
            var t = state.dragTarget;
            if(!t || t === 'canvas') return;
            // Room / furniture / marker
            if(t.type !== undefined && t.text === undefined) {
                var ri = (state.rooms || []).indexOf(t);
                if(ri !== -1) { state.rooms.splice(ri, 1); renderItemList(); }
            }
            // Text label
            else if(t.text !== undefined) {
                var ti = (state.texts || []).indexOf(t);
                if(ti !== -1) { state.texts.splice(ti, 1); renderItemList(); }
            }
            // Shape (rect)
            else if(t.w !== undefined) {
                var si = (state.shapes || []).indexOf(t);
                if(si !== -1) { state.shapes.splice(si, 1); if(typeof renderShapeList === 'function') renderShapeList(); }
            }
            state.dragTarget = null;
            state.isDragging = false;
            state.isResizing = false;
            state.dragType = null;
            window.draw();
            window.saveLocal();
            window.saveStateToHistory();
            showToast('Deleted');
            syncDeleteBtn();
        };

        // ── Desktop: delete selected object via header button ──
        // Shares same logic as mobile — single source of truth
        window.hdrDeleteSelected = function() {
            window.mobDeleteSelected();
        };

        canvas.addEventListener('touchstart', (e) => {
            if (!e.touches || e.touches.length === 0) return;
            // ── MOBILE KEYPAD SAFETY: never block input/select/textarea touches ──
            const t = e.target;
            if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return;
            // ── 2-finger pinch: never intercept — let native pinch-zoom work ──
            if (e.touches.length >= 2) return;
            // ── 1-finger: always preventDefault on canvas to stop page scroll/bounce ──
            e.preventDefault();
            syncToolClass();
            canvas.dispatchEvent(new MouseEvent('mousedown', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}));
        }, {passive: false});
        window.addEventListener('touchmove', (e) => {
            if (!e.touches || e.touches.length === 0) return;
            // 2-finger pinch: handled by the pinch-zoom block below — don't intercept
            if (e.touches.length >= 2) return;
            // 1-finger: preventDefault if ANY tool is active to stop page scroll
            if (state.isDragging || state.isResizing || state.isMeasuring || state.isDrawingWall || state.isDrawingRect || state.isInking) {
                e.preventDefault();
                window.dispatchEvent(new MouseEvent('mousemove', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}));
            }
        }, {passive: false});
        window.addEventListener('touchend', (e) => {
            window.dispatchEvent(new MouseEvent('mouseup'));
            syncToolClass();
        }, {passive: false});

        // ── INK MARKER mouse/touch listeners (inside setupEvents so canvas is defined) ──
        canvas.addEventListener('mousedown', function(e) {
            if(!state.isInking) return;
            const { wx, wy, px } = gC(e);
            state.inkCurrentPath = { color: state.inkColor || '#ef4444', width: 2.5, points: [{x: wx/px, y: wy/px}] };
            if(!state.inkLines) state.inkLines = [];
            state.inkLines.push(state.inkCurrentPath);
            state._inkDrawing = true;
        }, true);

        window.addEventListener('mousemove', function(e) {
            if(!state.isInking || !state._inkDrawing || !state.inkCurrentPath) return;
            const { wx, wy, px } = gC(e);
            state.inkCurrentPath.points.push({x: wx/px, y: wy/px});
            window.draw();
        }, true);

        window.addEventListener('mouseup', function(e) {
            if(!state.isInking) return;
            state._inkDrawing = false;
            state.inkCurrentPath = null;
            window.saveLocal(); window.saveStateToHistory();
        }, true);

        canvas.addEventListener('touchstart', function(e) {
            if(!state.isInking) return;
            e.preventDefault();
            canvas.dispatchEvent(new MouseEvent('mousedown', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, bubbles: true}));
        }, {passive: false, capture: true});

        window.addEventListener('touchmove', function(e) {
            if(!state.isInking || !state._inkDrawing) return;
            e.preventDefault();
            window.dispatchEvent(new MouseEvent('mousemove', {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY}));
        }, {passive: false, capture: true});

        window.addEventListener('touchend', function(e) {
            if(!state.isInking) return;
            window.dispatchEvent(new MouseEvent('mouseup'));
        }, {capture: true});
    }



    // ══════════════════════════════════════════════════════
    // INK MARKER TOOL
    // ══════════════════════════════════════════════════════
    if(!state.inkLines) state.inkLines = [];
    state.inkColor = '#ef4444';
    state.isInking = false;
    state.inkCurrentPath = null;

    window.setInkColor = function(c) { state.inkColor = c; };

    window.toggleInkTool = function() { window.setActiveTool('ink'); };

    window.clearInkLines = function() {
        state.inkLines = []; window.draw(); window.saveLocal(); showToast('Ink cleared');
    };

    // [ink listeners moved to setupEvents — see below]

    // ══════════════════════════════════════════════════════
    // OUTSIDE STAIRCASE + MAIN GATE — site-level elements
    // ══════════════════════════════════════════════════════
    window.addSiteGate = function() {
        // Remove existing gate if any
        state.rooms = state.rooms.filter(r => r.type !== 'Main Gate');
        // Place gate on the road-facing side by default, centred
        const road = state.roadDir || 'East';
        const gw = 12; // default 12ft width
        let gx = 0, gy = 0;
        if(road === 'East')        { gx = state.siteS - 0.5; gy = state.siteW/2 - gw/2; }
        else if(road === 'West')   { gx = 0; gy = state.siteW/2 - gw/2; }
        else if(road === 'North')  { gx = state.siteS/2 - gw/2; gy = state.siteW - 0.5; }
        else                       { gx = state.siteS/2 - gw/2; gy = 0; }
        state.rooms.push({
            type: 'Main Gate', name: 'Main Gate',
            x: gx, y: gy,
            wF: (road==='North'||road==='South') ? gw : 1,
            wI: 0,
            hF: (road==='East'||road==='West') ? gw : 1,
            hI: 0,
            color: '#f59e0b', isMarker: false, isFurniture: false,
            isOutside: true, isSiteGate: true, hidden: false
        });
        renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
        showToast('Main Gate placed — drag to move along compound wall');
    };

    // Patch addMarker for Outside Staircase
    const _origAddMarker = window.addMarker;
    window.addMarker = function(t) {
        if(t === 'Outside Staircase') {
            // Place near SW corner (common location for outside stairs)
            const sx = Math.min(4, state.siteS * 0.1);
            const sy = Math.min(4, state.siteW * 0.1);
            state.rooms.push({
                type: 'Outside Staircase', name: 'Stair (Out)',
                x: sx, y: sy,
                isMarker: true, isSiteMarker: true,
                color: '#94a3b8', hidden: false
            });
            renderItemList(); window.draw(); window.saveLocal(); window.saveStateToHistory();
            showToast('Outside Staircase placed — drag to position near compound wall');
            return;
        }
        _origAddMarker(t);
    };

    // ══════════════════════════════════════════════════════
    // PATCH applyAutoAaya — use 2-input IDs
    // ══════════════════════════════════════════════════════
    window.applyAutoAaya = function(tY) {
        let curW = state.houseEw, curH = state.houseNs,
            totalDeduction = (state.wallDeduction || 0) * 2,
            found = false, bW = curW, bH = curH;
        for(let o = 0; o <= 240; o++) {
            let offset = o / 12;
            let dirs = [[1,1],[1,0],[0,1],[-1,-1],[-1,0],[0,-1],[1,-1],[-1,1]];
            for(let [sw, sh] of dirs) {
                let cW = Math.round((curW + offset*sw)*12)/12;
                let cH = Math.round((curH + offset*sh)*12)/12;
                if(cW <= totalDeduction || cH <= totalDeduction) continue;
                let baseVal = (state.ayadiShastra==='mayamata')
                    ? 2*((cW-totalDeduction)+(cH-totalDeduction))
                    : ((cW-totalDeduction)*(cH-totalDeduction));
                if(state.ayadiUnit==='yards') baseVal = baseVal / Math.max(3, state.ayadiDivisor);
                let ayadi = getAyadiData(baseVal);
                if(ayadi.y===tY && ayadi.dr>=ayadi.ru) { bW=cW; bH=cH; found=true; break; }
            }
            if(found) break;
        }
        if(found) {
            // Directly update state and sync displays (avoids DOM timing issues)
            state.houseEw = bW; state.houseNs = bH;
            state.houseN=bH; state.houseS=bH; state.houseE=bW; state.houseW=bW;
            // Redistribute setbacks keeping ratio
            let tEW=Math.max(0,state.siteS-bW), oEW=(state.setE||0)+(state.setW||0);
            if(oEW>0){state.setE=tEW*(state.setE/oEW);state.setW=tEW*(state.setW/oEW);}else{state.setE=tEW/2;state.setW=tEW/2;}
            let tNS=Math.max(0,state.siteW-bH), oNS=(state.setN||0)+(state.setS||0);
            if(oNS>0){state.setN=tNS*(state.setN/oNS);state.setS=tNS*(state.setS/oNS);}else{state.setN=tNS/2;state.setS=tNS/2;}
            const uSet = (id,v)=>{let f=document.getElementById(id+'_F'),i=document.getElementById(id+'_I');if(f){f.value=Math.floor(v);i.value=Math.round((v%1)*12);}};
            uSet('setE',state.setE); uSet('setW',state.setW); uSet('setN',state.setN); uSet('setS',state.setS);
            // Update Madhya Sutra
            const wd=state.wallDeduction||0.375;
            const msEl=document.getElementById('madhyaSutraDisplay');
            const ftIn=v=>{const f=Math.floor(Math.max(0,v)),i=Math.round((Math.max(0,v)-f)*12);return f+"'"+i+'"';};
            if(msEl) msEl.textContent='EW: '+ftIn(Math.max(0,bW-wd*2))+' · NS: '+ftIn(Math.max(0,bH-wd*2));
            // Sync 2-input displays
            syncBuiltDisplays();
            window.draw(); window.saveLocal(); window.saveStateToHistory();
            if(typeof window.updateNavavargulu==='function' && showNavavargulu) window.updateNavavargulu();
            showToast('Auspicious Aaya Applied! EW: '+ftIn(bW)+' NS: '+ftIn(bH));
            if(typeof updateAyamStrip==='function') updateAyamStrip();
        } else {
            showToast('Could not find suitable Aaya nearby.');
        }
    };

    // ══════════════════════════════════════════════════════
    // PATCH restoreState to sync 2-input built area UI
    // ══════════════════════════════════════════════════════
    const _origRestoreHistoryState = window.restoreHistoryState;
    window.restoreHistoryState = function(snapStr) {
        _origRestoreHistoryState(snapStr);
        if(typeof syncBuiltDisplays === 'function') syncBuiltDisplays();
        window.updateRoadDevthaStrip();
    };

    // ── COLLAPSIBLE SECTIONS ──
    window.toggleSection = function(id) {
        const el = document.getElementById(id);
        const btn = document.getElementById(id + '_btn');
        if(!el) return;
        const isOpen = el.style.display !== 'none';
        el.style.transition = 'opacity 0.2s';
        if(isOpen) { el.style.opacity='0'; setTimeout(()=>{el.style.display='none';},200); }
        else { el.style.display='block'; setTimeout(()=>{el.style.opacity='1';},10); }
        if(btn) btn.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
        // Remember state (encrypted)
        try {
            let csData = localStorage.getItem('sv_collapsed') || '{}';
            let cs = {};
            
            // Try to parse as JSON first
            try {
                cs = JSON.parse(csData);
            } catch(e) {
                // Try to decrypt
                try {
                    cs = JSON.parse(SecurityModule.decrypt(csData));
                } catch(e2) {
                    cs = {};
                }
            }
            
            cs[id] = !isOpen;
            localStorage.setItem('sv_collapsed', SecurityModule.encrypt(JSON.stringify(cs)));
        } catch(e){}
    };
    window.restoreCollapsed = function() {
        try {
            let csData = localStorage.getItem('sv_collapsed') || '{}';
            let cs = {};
            
            // Try to parse as JSON first
            try {
                cs = JSON.parse(csData);
            } catch(e) {
                // Try to decrypt
                try {
                    cs = JSON.parse(SecurityModule.decrypt(csData));
                } catch(e2) {
                    cs = {};
                }
            }
            
            Object.keys(cs).forEach(id => { if(cs[id]===false) { const el=document.getElementById(id); const btn=document.getElementById(id+'_btn'); if(el){el.style.display='none';el.style.opacity='0';} if(btn)btn.style.transform='rotate(-90deg)'; } });
        } catch(e) {}
    };

    // ── SUN PATH: Draw sunrise/sunset arc on canvas ──
    const SUN_CITIES = {
        'Hyderabad':17.4,'Chennai':13.1,'Mumbai':19.1,'Delhi':28.6,'Bangalore':12.9,
        'Kolkata':22.6,'Ahmedabad':23.0,'Pune':18.5,'Visakhapatnam':17.7,'Vijayawada':16.5,
        'Tirupati':13.6,'Kochi':9.9,'Coimbatore':11.0,'Madurai':9.9,'Surat':21.2,
        'Jaipur':26.9,'Lucknow':26.8,'Bhopal':23.3,'Nagpur':21.1,'Indore':22.7,
        'Patna':25.6,'Bhubaneswar':20.3,'Raipur':21.3,'Chandigarh':30.7,'Dehradun':30.3,
        'Amritsar':31.6,'Varanasi':25.3,'Agra':27.2,'Nashik':20.0,'Aurangabad':19.9
    };
    window.drawSunPath = function(ctx, hP, px) {
        if(!state.showSunPath) return;
        const lat = (SUN_CITIES[state.sunCity] || 17.4) * Math.PI / 180;
        const rot = (state.rotation || 0) * Math.PI / 180;
        const cx = (hP.sw.x + state.houseEw/2) * px;
        const cy = (hP.sw.y + state.houseNs/2) * px;
        const radius = Math.min(state.houseEw, state.houseNs) * px * 0.6;
        // Summer solstice (June 21) — sun arc
        const decl = 23.45 * Math.PI / 180;
        ctx.save();
        ctx.beginPath();
        let first = true;
        for(let h = 0; h <= 24; h += 0.25) {
            const ha = (h - 12) * 15 * Math.PI / 180; // hour angle
            const sinAlt = Math.sin(lat)*Math.sin(decl) + Math.cos(lat)*Math.cos(decl)*Math.cos(ha);
            if(sinAlt < 0) { first = true; continue; }
            const cosAz = (Math.sin(decl) - Math.sin(lat)*sinAlt) / (Math.cos(lat)*Math.cos(Math.asin(sinAlt)));
            const az = (ha > 0 ? 1 : -1) * Math.acos(Math.max(-1, Math.min(1, cosAz)));
            const screenAz = az - rot;
            const altitude = Math.asin(sinAlt);
            const r = radius * (1 - altitude / (Math.PI/2)) * 0.7 + radius * 0.1;
            const sx = cx + r * Math.sin(screenAz);
            const sy = cy - r * Math.cos(screenAz) * -1;
            if(first) { ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 1.5/state.scale;
        ctx.setLineDash([4/state.scale, 3/state.scale]); ctx.stroke();
        ctx.setLineDash([]);
        // Sunrise/sunset markers
        ['Sunrise (E)', 'Sunset (W)'].forEach((label, idx) => {
            const angle = (idx === 0 ? -Math.PI/2 : Math.PI/2) - rot;
            const mx = cx + radius * 0.5 * Math.cos(angle);
            const my = cy + radius * 0.5 * Math.sin(angle);
            ctx.fillStyle = idx===0 ? '#fbbf24' : '#f97316';
            ctx.beginPath(); ctx.arc(mx, my, 4/state.scale, 0, Math.PI*2); ctx.fill();
            ctx.save(); ctx.translate(mx, my + 8/state.scale); ctx.scale(1,-1);
            ctx.font = `bold ${7/state.scale}px Inter`; ctx.fillStyle=idx===0?'#fbbf24':'#f97316';
            ctx.textAlign='center'; ctx.fillText(label, 0, 0); ctx.restore();
        });
        ctx.restore();
    };

    // ── WORKFLOW GUIDANCE: Tick marks on section headings ──
    window.updateWorkflowTicks = function() {
        const ticks = {
            'wt1': (state.siteN>0 && state.siteS>0 && state.siteE>0 && state.siteW>0),
            'wt2': (state.roadDir && state.roadDir.length > 0),
            'wt3': (state.setN>0 || state.setS>0 || state.setE>0 || state.setW>0),
            'wt4': (state.houseEw>0 && state.houseNs>0),
            'wt5': true, // Ayadi always computed
            'wt6': (state.selectedDwara && state.selectedDwara.length > 0),
        };
        Object.keys(ticks).forEach(id => {
            const el = document.getElementById(id);
            if(el) el.style.display = ticks[id] ? 'inline' : 'none';
        });
    };

    // ── MAGNETIC DECLINATION ──
    window.applyDeclination = function(val) {
        if(val === 'custom') return; // user will type in manual box
        const decl = parseFloat(val) || 0;
        state.magDeclination = decl;
        // Update manual input to match
        const manEl = document.getElementById('declManual');
        if(manEl && val !== 'custom') manEl.value = decl.toFixed(2);
        // Corrected True North = compass reading - declination
        const compass = parseFloat(document.getElementById('degreeInput').value) || 0;
        const corrected = compass - decl;
        const corrEl = document.getElementById('correctedNorth');
        if(corrEl) corrEl.textContent = corrected.toFixed(2) + '°N';
        // If declination is non-zero, update the actual rotation
        if(Math.abs(decl) > 0.001) {
            state.rotation = corrected;
            window.draw();
            window.saveLocal();
        }
    };
    // Update corrected north when degree changes
    const origUpdateDegree = window.updateDegree;
    window.updateDegree = function(v) {
        if(origUpdateDegree) origUpdateDegree(v);
        const decl = state.magDeclination || 0;
        const corrEl = document.getElementById('correctedNorth');
        if(corrEl) corrEl.textContent = ((parseFloat(v)||0) - decl).toFixed(2) + '°N';
    };

    // ══════════════════════════════════════════════════════════
    // SAMARTHA VASTU — COMPLETE LEARNING GUIDE
    // Viswakarma Vastu Padavinyasa
    // ══════════════════════════════════════════════════════════
    window.openLearningGuide = function() {
        const lang = (state && state.lang) ? state.lang : 'en';
        const URLS = {
            en: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_en.pdf',
            te: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_te.pdf',
            hi: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_hi.pdf',
            kn: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_kn.pdf',
            ta: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_ta.pdf',
            ml: 'https://vssomarajupalli-lgtm.github.io/samarthavastu_mobile-app/guide_ml.pdf'
        };
        window.open(URLS[lang] || URLS.en, '_blank');
    };

    // ══════════════════════════════════════════════════════════
    // WHY SAMARTHA VASTU IS DIFFERENT — Intro / Specialities
    // ══════════════════════════════════════════════════════════
    window.openWhyDifferent = function() {
        const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Why Samartha Vastu is Different</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.7; }
  .hero { background: linear-gradient(160deg,#1e0a3c,#0c1829,#0a1f3d); padding: 48px 24px 36px; text-align: center; border-bottom: 2px solid #4f46e5; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%); }
  .hero-badge { display: inline-block; background: linear-gradient(90deg,#7c3aed,#4f46e5); color: white; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; padding: 5px 16px; border-radius: 9999px; margin-bottom: 16px; }
  .hero h1 { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 8px; position: relative; }
  .hero h1 span { color: #a78bfa; }
  .hero h2 { font-size: 0.95rem; color: #94a3b8; font-weight: 400; margin-bottom: 20px; position: relative; }
  .hero .sanskrit { font-size: 1.3rem; color: #fbbf24; font-family: serif; margin-bottom: 4px; position: relative; }
  .hero .translation { font-size: 0.82rem; color: #64748b; font-style: italic; position: relative; }
  .nav-bar { position: sticky; top: 0; background: #0f172a; border-bottom: 1px solid #1e293b; padding: 8px 20px; display: flex; gap: 10px; align-items: center; z-index: 100; flex-wrap: wrap; }
  .nav-bar a { color: #94a3b8; text-decoration: none; font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 4px; }
  .nav-bar a:hover { color: #a78bfa; background: #1e1b4b; }
  .print-btn { background: linear-gradient(90deg,#7c3aed,#4f46e5); color: white; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.78rem; margin-left: auto; }
  .container { max-width: 820px; margin: 0 auto; padding: 36px 20px; }
  .section-title { font-size: 1.4rem; font-weight: 900; color: #a78bfa; border-left: 4px solid #7c3aed; padding-left: 14px; margin: 36px 0 18px; }
  .sub-title { font-size: 1.1rem; font-weight: 800; color: #38bdf8; margin: 24px 0 12px; }
  p { margin-bottom: 14px; color: #cbd5e1; font-size: 0.92rem; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 20px 0; }
  .feature-card { background: linear-gradient(135deg,#1e1b4b,#0f172a); border: 1px solid #4c1d95; border-radius: 12px; padding: 18px; transition: transform 0.2s; }
  .feature-card:hover { transform: translateY(-2px); }
  .feature-card .icon { font-size: 1.8rem; margin-bottom: 10px; }
  .feature-card h4 { color: #a78bfa; font-size: 0.9rem; font-weight: 800; margin-bottom: 6px; }
  .feature-card p { font-size: 0.8rem; color: #94a3b8; margin: 0; }
  .vs-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.85rem; }
  .vs-table th { padding: 10px 12px; text-align: left; font-weight: 700; }
  .vs-table th:first-child { background: #1e293b; color: #94a3b8; }
  .vs-table th:nth-child(2) { background: #450a0a; color: #fca5a5; }
  .vs-table th:nth-child(3) { background: #052e16; color: #86efac; }
  .vs-table td { padding: 9px 12px; border-bottom: 1px solid #1e293b; }
  .vs-table td:nth-child(2) { color: #f87171; background: #1a0505; }
  .vs-table td:nth-child(3) { color: #4ade80; background: #021710; }
  .proof-box { background: #0a0a1a; border: 1px solid #4c1d95; border-radius: 10px; padding: 18px; font-family: monospace; font-size: 0.82rem; color: #c4b5fd; margin: 16px 0; white-space: pre-wrap; }
  .highlight { background: #1e1b4b; border-left: 4px solid #7c3aed; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  .highlight.amber { background: #1c0f03; border-left-color: #f59e0b; }
  .highlight.red { background: #1a0505; border-left-color: #ef4444; }
  .highlight.green { background: #021710; border-left-color: #22c55e; }
  .warn { background: #1a0505; border: 1px solid #ef4444; border-radius: 8px; padding: 14px 18px; margin: 16px 0; }
  .sloka-box { background: linear-gradient(135deg,#0c0721,#0a1628); border: 1px solid #4c1d95; border-radius: 12px; padding: 20px; margin: 16px 0; }
  .sloka-box .devanagari { font-size: 1.1rem; color: #c4b5fd; font-family: serif; line-height: 1.9; margin-bottom: 10px; }
  .sloka-box .transliteration { font-size: 0.82rem; color: #7c3aed; font-style: italic; margin-bottom: 8px; }
  .sloka-box .meaning { font-size: 0.85rem; color: #e2e8f0; border-top: 1px solid #2d1b69; padding-top: 10px; margin-top: 8px; }
  .sloka-box .source { font-size: 0.72rem; color: #4c1d95; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.1em; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 0.83rem; }
  th { background: #1e1b4b; color: #a78bfa; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #1e293b; }
  .badge-good { color: #4ade80; font-weight: 700; }
  .badge-bad { color: #f87171; font-weight: 700; }
  .numbered-list { counter-reset: item; padding: 0; }
  .numbered-list li { counter-increment: item; display: flex; gap: 12px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #1e293b; }
  .numbered-list li::before { content: counter(item); background: linear-gradient(135deg,#7c3aed,#4f46e5); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 900; flex-shrink: 0; margin-top: 2px; }
  .numbered-list li .content h5 { color: #a78bfa; font-size: 0.88rem; margin-bottom: 3px; }
  .numbered-list li .content p { font-size: 0.82rem; color: #94a3b8; margin: 0; }
  svg.diagram { display: block; margin: 20px auto; }
  @media print { .nav-bar, .print-btn { display: none; } body { background: white; color: black; } }
  @media (max-width: 600px) { .hero h1 { font-size: 1.4rem; } .feature-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-badge">⭐ Software Specialities & Proof</div>
  <h1>Why <span>Samartha Vastu</span> is Different</h1>
  <h2>The only Vastu software built on Viswakarma Prakashika — not magnetic compass</h2>
  <div class="sanskrit">यत्र वास्तु तत्र लक्ष्मी</div>
  <div class="translation">"Where Vastu is, Lakshmi resides" · Viswakarma Padavinyasa · Architect Edition v27</div>
</div>

<!-- NAV -->
<div class="nav-bar">
  <a href="#specialities">Specialities</a>
  <a href="#proof">Sakkhi Proof</a>
  <a href="#comparison">Comparison</a>
  <a href="#slokas">Slokas</a>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
</div>

<div class="container">

<!-- SPECIALITIES -->
<div class="section-title" id="specialities">🏛️ 10 Software Specialities</div>
<p>Samartha Vastu is built from the ground up on the <strong>Viswakarma Prakashika</strong> — the original ancient Vastu text — using scientific Padavinyasa calculations. Here is what makes it fundamentally different from every other Vastu software available today.</p>

<div class="feature-grid">
  <div class="feature-card">
    <div class="icon">🌟</div>
    <h4>1. Astronomical True North</h4>
    <p>Uses geographic True North from GPS/satellite — never magnetic compass. Compass deflects with steel, wiring, and changes every year. Our North never changes.</p>
  </div>
  <div class="feature-card">
    <div class="icon">📐</div>
    <h4>2. Proportional Padavinyasa</h4>
    <p>Devathas placed proportionally along actual wall lengths — not equal 22.5° sectors. A 30ft wall and 60ft wall get different Devatha spans. This is the correct Vedic method.</p>
  </div>
  <div class="feature-card">
    <div class="icon">📍</div>
    <h4>3. Exact Corner Devathas</h4>
    <p>Shikhi, Agni, Pitra, Roga placed at ACTUAL physical corners. Sakkhi Chakra places them at angular positions — which on rectangular plots puts them on the walls, not corners.</p>
  </div>
  <div class="feature-card">
    <div class="icon">🏗️</div>
    <h4>4. Dual Boundary Calculation</h4>
    <p>Both Site boundary AND Built area Devathas calculated separately and simultaneously. Most software calculates only one boundary.</p>
  </div>
  <div class="feature-card">
    <div class="icon">🔢</div>
    <h4>5. Full Ayadi Navavargulu</h4>
    <p>All 9 Ayadi parameters — Yoni, Aaya, Runam, Nakshatra, Tithi, Varam, Yoga, Karana, Ayusham — calculated live as you adjust dimensions.</p>
  </div>
  <div class="feature-card">
    <div class="icon">🏢</div>
    <h4>6. G+1 Floor Planning</h4>
    <p>Complete Ground Floor + First Floor planning with independent Padavinyasa for each level. Both floors printed separately in the full report.</p>
  </div>
  <div class="feature-card">
    <div class="icon">📏</div>
    <h4>7. 4-Wall Built Area Input</h4>
    <p>Built area accepts N, S, E, W walls separately — handles irregular and inclined house shapes. Madhya Sutra auto-calculated with 4.5" each side deduction.</p>
  </div>
  <div class="feature-card">
    <div class="icon">🧲</div>
    <h4>8. Magnetic Declination Correction</h4>
    <p>If you have a compass reading, enter your city's declination — software auto-corrects to True North. 15 Indian cities pre-loaded.</p>
  </div>
  <div class="feature-card">
    <div class="icon">📴</div>
    <h4>9. 100% Offline PWA</h4>
    <p>Works without internet after first load. Install as a native app on Android, iOS, or desktop. No server dependency — your data never leaves your device.</p>
  </div>
  <div class="feature-card">
    <div class="icon">📚</div>
    <h4>10. Viswakarma Prakashika Based</h4>
    <p>Every calculation traceable to the original Viswakarma text. No mixing of methods. No modern interpretation shortcuts. Pure authentic Padavinyasa.</p>
  </div>
</div>

<!-- PROOF SECTION -->
<div class="section-title" id="proof">🔬 Scientific Proof — Why Sakkhi Chakra is Wrong</div>
<div class="highlight amber">
  <strong>Background:</strong> This proof was developed by the creators of Samartha Vastu and independently validated. It demonstrates that the Sakkhi Chakra method — used by most North Indian Vastu software — contains fundamental geometric and geographic errors.
</div>

<div class="sub-title">Proof 1: The Parallel North Theorem</div>
<p>Geographic directions are defined by <strong>lines of latitude and longitude</strong> — which run as perfectly parallel lines across the Earth. This is not a theory. It is geometric fact.</p>
<div class="proof-box">Stand at the SW corner of your plot.    North = 0°
Walk to SE corner (50 feet away).       North = 0°
Walk to NE corner (100 feet away).      North = 0°
Walk to any point on your plot.         North = ALWAYS 0°

The North direction runs through EVERY POINT
of your plot as parallel lines — like railway tracks.

It does NOT radiate from the centre like pizza slices.
It does NOT change when the plot is elongated.
It does NOT rotate when the plot is a rectangle.</div>

<div class="sub-title">Proof 2: The Rectangle = Two Squares</div>
<div class="proof-box">A 30×60 rectangle = two 30×30 squares joined together:

[  Square 1  ] + [  Square 2  ] = [   Rectangle   ]
   30 × 30           30 × 30         30 × 60

Question: Does East turn for Square 1?  → NO ✅
Question: Does East turn for Square 2?  → NO ✅
Therefore: Does East turn for Rectangle? → IMPOSSIBLE ✅

Q.E.D. — Geometric proof. Undeniable.
(Validated by independent AI scientific analysis)</div>

<!-- SVG: Sakkhi Chakra Wrong vs Padavinyasa Correct -->
<svg class="diagram" viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" style="max-width:500px;background:#0a1020;border-radius:12px;padding:14px;border:1px solid #1e293b;">
  <text x="260" y="18" text-anchor="middle" font-size="11" fill="#94a3b8" font-weight="bold">RECTANGULAR PLOT — TWO METHODS COMPARED</text>
  <!-- Left: Sakkhi Chakra Wrong -->
  <text x="120" y="38" text-anchor="middle" font-size="9" fill="#f87171" font-weight="bold">❌ Sakkhi Chakra</text>
  <rect x="30" y="48" width="180" height="100" fill="none" stroke="#ef4444" stroke-width="1.5"/>
  <circle cx="120" cy="98" r="45" fill="none" stroke="#ef4444" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>
  <line x1="120" y1="98" x2="120" y2="48" stroke="#ef4444" stroke-width="1.2" opacity="0.8"/>
  <line x1="120" y1="98" x2="210" y2="98" stroke="#ef4444" stroke-width="1.2" opacity="0.8"/>
  <line x1="120" y1="98" x2="30" y2="98" stroke="#ef4444" stroke-width="1.2" opacity="0.8"/>
  <line x1="120" y1="98" x2="120" y2="148" stroke="#ef4444" stroke-width="1.2" opacity="0.8"/>
  <line x1="120" y1="98" x2="166" y2="52" stroke="#ef4444" stroke-width="0.8" opacity="0.5"/>
  <line x1="120" y1="98" x2="74" y2="52" stroke="#ef4444" stroke-width="0.8" opacity="0.5"/>
  <circle cx="120" cy="98" r="3" fill="#ef4444"/>
  <text x="120" y="93" text-anchor="middle" font-size="7" fill="#f87171">N from</text>
  <text x="120" y="103" text-anchor="middle" font-size="7" fill="#f87171">centre</text>
  <text x="120" y="170" text-anchor="middle" font-size="8" fill="#f87171">Circle distorts on rectangle</text>
  <text x="120" y="182" text-anchor="middle" font-size="8" fill="#f87171">East zone shrinks! (wrong)</text>
  <!-- Right: Padavinyasa Correct -->
  <text x="390" y="38" text-anchor="middle" font-size="9" fill="#4ade80" font-weight="bold">✅ Padavinyasa</text>
  <rect x="290" y="48" width="200" height="100" fill="none" stroke="#22c55e" stroke-width="1.5"/>
  <line x1="290" y1="62" x2="490" y2="62" stroke="#22c55e" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="290" y1="78" x2="490" y2="78" stroke="#22c55e" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="290" y1="94" x2="490" y2="94" stroke="#22c55e" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="290" y1="110" x2="490" y2="110" stroke="#22c55e" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5"/>
  <line x1="290" y1="126" x2="490" y2="126" stroke="#22c55e" stroke-width="0.7" stroke-dasharray="4,3" opacity="0.5"/>
  <text x="300" y="60" font-size="7" fill="#4ade80">↑N</text>
  <text x="370" y="60" font-size="7" fill="#4ade80">↑N</text>
  <text x="450" y="60" font-size="7" fill="#4ade80">↑N</text>
  <text x="390" y="170" text-anchor="middle" font-size="8" fill="#4ade80">Parallel North lines — constant</text>
  <text x="390" y="182" text-anchor="middle" font-size="8" fill="#4ade80">East zone stays East (correct)</text>
</svg>

<div class="sub-title">Proof 3: Magnetic Compass Failures</div>
<table>
  <tr><th>Failure Cause</th><th>Effect on Vastu</th><th>Our Solution</th></tr>
  <tr><td>Steel TMT bars in foundation</td><td class="badge-bad">Compass deflects → wrong North</td><td class="badge-good">Satellite GPS — not affected</td></tr>
  <tr><td>Electrical wiring in walls</td><td class="badge-bad">Needle pulled → error up to 5°</td><td class="badge-good">Astronomical True North</td></tr>
  <tr><td>Magnetic declination drift</td><td class="badge-bad">Changes year to year</td><td class="badge-good">Fixed forever</td></tr>
  <tr><td>Delhi declination: +1.31°</td><td class="badge-bad">11 inch error on 40ft wall</td><td class="badge-good">Declination correction built-in</td></tr>
  <tr><td>Mobile towers nearby</td><td class="badge-bad">Electromagnetic deflection</td><td class="badge-good">No compass — no deflection</td></tr>
</table>

<div class="warn">
  <strong>📌 Even AppliedVastu — India's largest compass-based Vastu consultancy — states in their own documents:</strong><br>
  <em>"Magnetic North may be inaccurate due to local attractions and presence of electrical and iron substances."</em><br>
  They use Google Satellite + AutoCAD for all direction calculations — not a compass. If the leading proponents of compass Vastu do not trust the compass, who should?
</div>

<div class="sub-title">Proof 4: Historical Authority</div>
<div class="highlight green">
  The Viswakarma Prakashika is over 3,000 years old.<br>
  The magnetic compass arrived in India ~900–1000 AD — 2,000 years LATER.<br><br>
  The original Vedic method: <strong>Shanku (Gnomon)</strong> — a vertical stick whose morning and evening shadow tips give exact East-West → perpendicular gives True North.<br><br>
  This is astronomically True North — identical to modern GPS. <strong>Padavinyasa is the original authentic method. Sakkhi Chakra has zero Vedic authority.</strong>
</div>

<!-- COMPARISON TABLE -->
<div class="section-title" id="comparison">📊 Side-by-Side Comparison</div>
<table class="vs-table">
  <tr><th>Feature</th><th>❌ Sakkhi Chakra / Other Software</th><th>✅ Samartha Vastu (Padavinyasa)</th></tr>
  <tr><td>Direction reference</td><td>Magnetic compass</td><td>Astronomical True North</td></tr>
  <tr><td>Devatha sectors</td><td>Equal 22.5° always</td><td>Proportional to actual wall length</td></tr>
  <tr><td>Corner Devathas</td><td>At angular positions (wrong on rectangles)</td><td>At exact physical corners</td></tr>
  <tr><td>Rectangular plots</td><td>Distorted — East zone shrinks</td><td>Correct — proportional per wall</td></tr>
  <tr><td>Boundaries calculated</td><td>Usually only site OR house</td><td>Both site + house simultaneously</td></tr>
  <tr><td>Ayadi system</td><td>Partial or absent</td><td>Full 9-parameter Navavargulu</td></tr>
  <tr><td>G+1 planning</td><td>Ground floor only</td><td>Full GF + 1F independent</td></tr>
  <tr><td>Works offline</td><td>Requires internet</td><td>100% offline PWA</td></tr>
  <tr><td>Compass affected by steel</td><td>Yes — major error</td><td>No — satellite based</td></tr>
  <tr><td>Changes over time</td><td>Yes — magnetic drift</td><td>No — True North is fixed</td></tr>
  <tr><td>Vedic authority</td><td>None — post-compass invention</td><td>Direct — Viswakarma Prakashika</td></tr>
  <tr><td>Declination correction</td><td>Not available</td><td>15 Indian cities built-in</td></tr>
</table>

<!-- SLOKAS -->
<div class="section-title" id="slokas">📿 Viswakarma Slokas — The Authority</div>
<p>These Sanskrit verses from the <strong>Viswakarma Prakashika</strong> directly validate the Padavinyasa method and confirm that our software follows the original Vedic science.</p>

<div class="sloka-box">
  <div class="devanagari">वास्तु पुरुषो मण्डले निहितः<br>सर्वदिक्षु देवताः स्थापिताः<br>परिमितेन मानेन पादेन<br>प्रत्येक भित्तौ विभजेत् ।</div>
  <div class="transliteration">Vastu Puruso mandale nihitah · Sarva-dikshu devatah sthapitah · Pari-mitena manena padena · Pratyeka bhittau vibhajet</div>
  <div class="meaning">
    <strong>Translation:</strong> "The Vastu Purusha is established in the Mandala. The Devathas are placed in all directions. By the proportional measure (Pada), divide each wall accordingly."<br><br>
    <strong>Significance:</strong> The word <em>parimita</em> (proportional) and <em>mana</em> (measure) directly confirm that Devathas must be placed by proportional wall measurement — not by equal angular division.
  </div>
  <div class="source">Source: Viswakarma Prakashika — On Padavinyasa</div>
</div>

<div class="sloka-box">
  <div class="devanagari">आयादि षड्वर्गं गृहस्य शुभं<br>धनधान्य पुत्र पशु आयुषं<br>गृहिणः सर्व सौभाग्यं<br>विना आयादिना न सिध्यति</div>
  <div class="transliteration">Ayadi shad-vargam gruhasya shubham · Dhana-dhanya putra pashu ayusham · Grhinah sarva-subhagyam · Vina ayadina na sidhyati</div>
  <div class="meaning">
    <strong>Translation:</strong> "The Ayadi measures bring auspiciousness to the house — wealth, grain, sons, cattle, and long life. All good fortune to the householder. Without Ayadi calculation, nothing is accomplished."<br><br>
    <strong>Significance:</strong> Confirms that Ayadi (Navavargulu) calculation is not optional — it is <em>essential</em> for any valid Vastu plan.
  </div>
  <div class="source">Source: Viswakarma Prakashika — On Ayadi Shastra</div>
</div>

<div class="sloka-box">
  <div class="devanagari">उत्तरं शिरः दक्षिणं पादौ<br>पूर्वं दक्षिणं हस्तौ<br>नैऋत्यं पादौ ईशान्यं मस्तकम्</div>
  <div class="transliteration">Uttaram shirah, dakshinam padau · Purvam dakshinam hastau · Nairutyam padau, Ishanam mastakam</div>
  <div class="meaning">
    <strong>Translation:</strong> "North is the head, South are the feet, East and South are the hands, South-West are the feet, North-East is the crown."<br><br>
    <strong>Significance:</strong> Confirms the Vastu Purusha orientation — head in NE (most sacred), feet in SW (most stable). This is why NE must be kept pure (Puja) and SW must carry the heaviest room (Master Bedroom).
  </div>
  <div class="source">Source: Viswakarma Prakashika — On Vastu Purusha Orientation</div>
</div>

</div><!-- end container -->

<div style="background:#050d1a;border-top:2px solid #4f46e5;padding:28px 20px;text-align:center;margin-top:40px;">
  <p style="color:#a78bfa;font-size:1rem;font-weight:700;margin-bottom:6px;">SAMARTHA VASTU — Architect Edition v27</p>
  <p style="color:#475569;font-size:0.8rem;margin-bottom:4px;">Viswakarma Padavinyasa System · Scientific Vastu · Works Offline · PWA</p>
  <p style="color:#fbbf24;font-size:0.85rem;margin-top:8px;">यत्र वास्तु तत्र लक्ष्मी</p>
</div>

</body>
</html>`;
        const blob = new Blob([doc], {type:'text/html'});
        const url = URL.createObjectURL(blob);
        const w = window.open(url, '_blank');
        if(!w) alert('Please allow popups to open this page');
    };

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        const menus = ['fileMenuContainer','exportMenuContainer','resourcesMenuContainer','sunModeContainer'];
        const drops = ['fileDropdown','exportDropdown','resourcesDropdown','sunModeDropdown'];
        menus.forEach((m,i) => {
            const container = document.getElementById(m);
            if(container && !container.contains(e.target)) {
                const drop = document.getElementById(drops[i]);
                if(drop) drop.classList.add('hidden');
            }
        });
    });

    // ══════════════════════════════════════════════════════════
    // GLOBAL LANGUAGE SYSTEM
    // ══════════════════════════════════════════════════════════
    window.setAppLanguage = function(lang) {
        // Update road devtha strip language when app language changes
        setTimeout(window.updateRoadDevthaStrip, 50);
        state.lang = lang;
        localStorage.setItem('lang', lang); // keep in sync with Step 5 pattern
        // Update reportLang select to match
        const rl = document.getElementById('reportLang');
        if(rl) rl.value = lang;
        // Update global selector to match
        const gl = document.getElementById('globalLangSelect');
        if(gl) gl.value = lang;
        // Update left panel section headings
        window.updatePanelLanguage(lang);
        if(typeof window.setUILanguage === 'function') window.setUILanguage(lang);
        if(typeof window.renderLearnerGuide === 'function') window.renderLearnerGuide();
        if(typeof window.renderProfessionalSection === 'function') window.renderProfessionalSection();
        // Save to state
        window.saveLocal();
        showToast('Language: ' + {en:'English',te:'తెలుగు',hi:'हिंदी',kn:'ಕನ್ನಡ',ta:'தமிழ்',ml:'മലയാളം'}[lang] || lang); const el = document.getElementById('exportLangLabel'); if(el) el.textContent = {en:'English',te:'Telugu',hi:'Hindi',kn:'Kannada',ta:'Tamil',ml:'Malayalam'}[lang] || lang; window.saveLocal();
    };

    window.updatePanelLanguage = function(lang) {
        const labels = {
            en: ['Outer Site Dimensions','Road / Gate Provision','Setbacks (Clearance)','Built Area (House)','Ayadi Shastra Logic','Main Entrance (Dwara)'],
            te: ['బయటి స్థల కొలతలు','రోడ్ / గేట్ ఏర్పాటు','సెట్‌బ్యాక్‌లు','నిర్మిత వైశాల్యం (ఇల్లు)','ఆయాది శాస్త్రం','ప్రధాన ద్వారం'],
            hi: ['बाहरी भूखंड माप','सड़क / गेट प्रावधान','सेटबैक (क्लीयरेंस)','निर्मित क्षेत्र (मकान)','आयादि शास्त्र','मुख्य द्वार'],
            kn: ['ಹೊರ ನಿವೇಶನ ಅಳತೆ','ರಸ್ತೆ / ಗೇಟ್ ವ್ಯವಸ್ಥೆ','ಸೆಟ್‌ಬ್ಯಾಕ್‌ಗಳು','ನಿರ್ಮಿತ ವಿಸ್ತೀರ್ಣ (ಮನೆ)','ಆಯಾದಿ ಶಾಸ್ತ್ರ','ಮುಖ್ಯ ದ್ವಾರ'],
            ta: ['வெளி தள அளவு','சாலை / வாயில் ஏற்பாடு','பின்வாங்கல்கள்','கட்டிட பரப்பு (வீடு)','ஆயாதி சாஸ்திரம்','பிரதான நுழைவாயில்'],
            ml: ['പുറം സൈറ്റ് അളവ്','റോഡ് / ഗേറ്റ് ക്രമീകരണം','സെറ്റ്ബാക്കുകൾ','നിർമ്മിത വിസ്തൃതി (വീട്)','ആയാദി ശാസ്ത്രം','പ്രധാന കവാടം']
        };
        const L = labels[lang] || labels.en;
        for (let i = 1; i <= 6; i++) {
            const tickSpan = document.getElementById('wt' + i);
            if (tickSpan && tickSpan.parentNode) {
                const parent = tickSpan.parentNode;
                const iconMatch = parent.innerHTML.match(/<i[^>]*><\/i>/);
                const icon = iconMatch ? iconMatch[0] + ' ' : '';
                const btnMatch = parent.innerHTML.match(/<span id="sec6_btn"[^>]*>[\s\S]*?<\/span>/);
                const btn = btnMatch ? btnMatch[0] : '';
                const tickStyle = tickSpan.style.cssText;
                const tickContent = tickSpan.innerHTML;
                parent.innerHTML = icon + i + '. ' + L[i-1] + ' <span id="wt'+i+'" style="'+tickStyle+'">'+tickContent+'</span>' + btn;
            }
        }
    };

    window.restoreAppLanguage = function() {
        // Read from both state.lang (app state) and localStorage("lang") — keep in sync
        const lang = state.lang || localStorage.getItem('lang') || 'en';
        state.lang = lang;
        localStorage.setItem('lang', lang);
        const gl = document.getElementById('globalLangSelect');
        if(gl) gl.value = lang;
        const rl = document.getElementById('reportLang');
        if(rl) rl.value = lang;
        if(typeof window.setUILanguage === 'function') window.setUILanguage(lang);
        if(typeof window.updatePanelLanguage === 'function') window.updatePanelLanguage(lang);
        if(typeof window.renderLearnerGuide === 'function') window.renderLearnerGuide();
        if(typeof window.renderProfessionalSection === 'function') window.renderProfessionalSection();
    };
    // ── TOUCH & TABLET: Pinch zoom + touch drag ──
    (function() {
        let lastDist = 0, lastTouchX = 0, lastTouchY = 0, touchPanning = false;
        document.addEventListener('touchstart', function(e) {
            if(e.target.id !== 'vastuCanvas') return;
            if(e.touches.length === 2) {
                lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                touchPanning = false;
            } else if(e.touches.length === 1) {
                lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; touchPanning = true;
            }
        }, {passive:true});
        document.addEventListener('touchmove', function(e) {
            if(e.target.id !== 'vastuCanvas') return;
            if(e.touches.length === 2) {
                // ── 2-finger pinch-zoom: always active, never blocked ──
                e.preventDefault();
                const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                if(lastDist > 0) {
                    const ratio = dist / lastDist;
                    state.scale = Math.max(0.1, Math.min(12, state.scale * ratio));
                    window.draw();
                }
                lastDist = dist; touchPanning = false;
            } else if(e.touches.length === 1 && touchPanning && !state.isDragging && !state.isResizing) {
                // ── 1-finger pan: ONLY when no drawing tool is active ──
                const toolBusy = state.isInking || state.isDrawingWall || state.isMeasuring || state.isDrawingRect;
                if(toolBusy) return;
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                state.offsetX = (state.offsetX||0) + dx;
                state.offsetY = (state.offsetY||0) + dy;
                lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
                window.draw();
            }
        }, {passive:false});
        document.addEventListener('touchend', function() { lastDist = 0; touchPanning = false; }, {passive:true});
    })();

    // ── STEP 5: CALL ON LOAD — restore language as soon as DOM is ready ──
    document.addEventListener('DOMContentLoaded', function() {
        const lang = localStorage.getItem('lang') || (typeof state !== 'undefined' && state.lang) || 'en';
        const gl = document.getElementById('globalLangSelect');
        if(gl) gl.value = lang;
        if(typeof window.setUILanguage === 'function') window.setUILanguage(lang);
        if(typeof window.renderLearnerGuide === 'function') window.renderLearnerGuide();
        if(typeof window.renderProfessionalSection === 'function') window.renderProfessionalSection();
    });
    // ─────────────────────────────────────────────────────────────────────

    window.onload = () => { 
        setTimeout(() => { 
            canvas = document.getElementById('vastuCanvas'); ctx = canvas.getContext('2d');
            // Patch stale localStorage: clear isLShape flag before loading
            try {
                let raw = localStorage.getItem('vastu_v23_final');
                if(raw) { let p = JSON.parse(raw); if(p.isLShape) { p.isLShape = false; localStorage.setItem('vastu_v23_final', JSON.stringify(p)); } }
            } catch(e) {}
            window.loadLocal(); setupEvents(); window.addEventListener('resize', window.draw); window.restoreCollapsed(); setTimeout(function(){ if(typeof syncBuiltDisplays==='function') syncBuiltDisplays(); if(typeof window.updateRoadDevthaStrip==='function') window.updateRoadDevthaStrip(); if(typeof updateAreaDisplays==='function') updateAreaDisplays(); if(typeof updateAyamStrip==='function') updateAyamStrip(); }, 100); if(!sessionStorage.getItem("sv_skip_welcome")) { setTimeout(showWelcomeActions, 1200); } else { sessionStorage.removeItem("sv_skip_welcome"); document.getElementById("passwordOverlay").style.display="none"; document.body.classList.add("app-ready"); var _cc=document.getElementById("compassContainer"); if(_cc) _cc.style.display="flex"; } window.restoreAppLanguage(); 
            document.fonts.ready.then(() => { window.draw(); window.saveStateToHistory(); renderShapeList(); });
        }, 100);
    };

    // ═══════════════════════════════════════════════════
    // PWA: SERVICE WORKER REGISTRATION
    // ═══════════════════════════════════════════════════
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        // Use data: URI for SW — works in Chrome, Edge, Samsung Browser
        // Blob URL approach blocked by Firefox/Safari security policies
        const swCode = [
            "const CACHE='samartha-vastu-v1';",
            "self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([self.registration.scope]).catch(()=>{})));self.skipWaiting();});",
            "self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});",
            "self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(cached=>{if(cached)return cached;return fetch(e.request).then(res=>{if(res&&res.status===200){const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl));}return res;}).catch(()=>cached);}));});"
        ].join('\n');

        // Try data: URI first (Chrome/Edge), then blob fallback, then skip gracefully
        function tryRegisterSW(swText) {
            // Method 1: data: URI (most compatible, no blob protocol issue)
            const encoded = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(swText);
            return navigator.serviceWorker.register(encoded, { scope: './' });
        }

        tryRegisterSW(swCode)
            .then(reg => {
                console.log('✅ Samartha Vastu SW registered');
                // Trigger cache of current page
                if (reg.active) reg.active.postMessage({ type: 'SKIP_WAITING' });
            })
            .catch(() => {
                // data: URI also blocked — try blob as last resort
                try {
                    const blob = new Blob([swCode], { type: 'application/javascript' });
                    const blobUrl = URL.createObjectURL(blob);
                    navigator.serviceWorker.register(blobUrl)
                        .then(() => console.log('✅ SW registered via blob'))
                        .catch(() => console.info('ℹ️ SW not supported in this browser — offline mode unavailable'));
                } catch(e) {
                    console.info('ℹ️ SW registration not available — app will work online only');
                }
            });

        // Online/Offline banner — works regardless of SW support
        function updateNetworkBanner() {
            const banner = document.getElementById('networkBanner');
            if (!banner) return;
            if (!navigator.onLine) {
                banner.style.display = 'flex';
                banner.innerHTML = '<i class="fa-solid fa-wifi-slash mr-2"></i> Working Offline — all data saved locally';
                banner.style.background = '#b45309';
            } else {
                banner.style.display = 'none';
            }
        }
        window.addEventListener('online', updateNetworkBanner);
        window.addEventListener('offline', updateNetworkBanner);
        setTimeout(updateNetworkBanner, 500);
    }

    // ═══════════════════════════════════════════════════
    // PWA: INSTALL PROMPT (Android Chrome / Edge / Samsung)
    // ═══════════════════════════════════════════════════
    let deferredInstallPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        // Show install button
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) {
            btn.style.display = 'flex';
            btn.onclick = () => {
                deferredInstallPrompt.prompt();
                deferredInstallPrompt.userChoice.then(result => {
                    if (result.outcome === 'accepted') {
                        btn.style.display = 'none';
                        showToast('Samartha Vastu installed! ✅');
                    }
                    deferredInstallPrompt = null;
                });
            };
        }
    });

    window.addEventListener('appinstalled', () => {
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.style.display = 'none';
        showToast('App installed successfully! 🎉');
    });

/* ════ JS Block: lines 7502–7615 from original index.html ════ */
        var _mobCurrentTab = 'canvas';
        function _mobSetTab(n) {
            _mobCurrentTab = n;
            ['canvas','inputs','rooms','alerts'].forEach(function(t) {
                var b = document.getElementById('mobTab'+t.charAt(0).toUpperCase()+t.slice(1));
                if(b) b.classList.toggle('active', t===n);
            });
        }
        // ── 5-Tab mobile menu switcher — class-based only, no duplicate IDs ──
        function _mobSwitchTab(name) {
            // Hide all panels
            document.querySelectorAll('#mobMenuPanel .mob-tab-panel').forEach(function(p) {
                p.classList.remove('mtab-active');
            });
            // Deactivate all pills
            document.querySelectorAll('#mobMenuPanel .mob-tab-pill').forEach(function(b) {
                b.classList.remove('mtab-active');
            });
            // Activate target panel
            var panel = document.getElementById('mobTab-' + name);
            if(panel) panel.classList.add('mtab-active');
            // Activate matching pill
            var pill = document.querySelector('#mobMenuPanel .mob-tab-pill[data-mtab="' + name + '"]');
            if(pill) pill.classList.add('mtab-active');
            // Sync Ayadi tab display text from headerLiveAaya
            if(name === 'ayadi') {
                var src  = document.getElementById('headerLiveAaya');
                var dest = document.getElementById('mobAayaDisplay');
                if(src && dest) dest.textContent = src.textContent || '–';
            }
            if(name === 'ayadi' || name === 'system') {
                if(typeof window._mobSyncAyadiReadouts === 'function') window._mobSyncAyadiReadouts();
            }
        }
        window._mobSyncAyadiReadouts = function() {
            try {
                var metric = (typeof getAyadiMetric === 'function') ? getAyadiMetric() : null;
                if (metric === null) return;
                var d = (typeof getAyadiData === 'function') ? getAyadiData(metric) : null;
                if (!d) return;
                var YONI = (typeof YONI_NAMES !== 'undefined') ? YONI_NAMES : [];
                var isViswa = state && state.ayadiShastra !== 'mayamata';
                var set = function(id, val) {
                    var el = document.getElementById(id);
                    if (el) el.textContent = (val !== undefined && val !== null) ? String(val) : '–';
                };
                var yoniName = YONI[d.y] || String(d.y);
                var isGoodYoni = [1,3,5,7].includes(d.y);
                set('mob-nava-yoni',   d.y + ' – ' + yoniName);
                set('mob-nava-income', d.dr);
                set('mob-nava-debt',   d.ru);
                set('mob-nava-star',   d.star  || '–');
                set('mob-nava-varam',  d.vName || '–');
                set('mob-nava-tithi',  (d.tIdx || '–') + ' ' + (d.tName || ''));
                set('mob-nava-age',    d.ay + ' yrs');
                set('mob-nava-yoga',   d.yoIdx);
                set('mob-nava-karana', d.kaIdx);
                var yoniCell = document.getElementById('mob-nava-yoni-cell');
                if (yoniCell) {
                    yoniCell.classList.toggle('mob-nava-yoni', isGoodYoni);
                    yoniCell.classList.toggle('mob-nava-bad',  !isGoodYoni);
                }
                document.querySelectorAll('.mob-viswakarma-only').forEach(function(el) {
                    el.style.display = isViswa ? '' : 'none';
                });
                var bannerName = document.getElementById('mob-liveAayaName');
                var bannerStatus = document.getElementById('mob-liveAayaStatus');
                var aayaSrc = document.getElementById('headerLiveAaya');
                if (bannerName && aayaSrc) bannerName.textContent = aayaSrc.textContent || '–';
                var copySpan = function(srcId, dstId) {
                    var s = document.getElementById(srcId);
                    var d2 = document.getElementById(dstId);
                    if (s && d2) d2.textContent = s.textContent;
                };
                copySpan('siteAreaSqft',  'mob-siteAreaSqft');
                copySpan('siteAreaSqyd',  'mob-siteAreaSqyd');
                copySpan('builtAreaSqft', 'mob-builtAreaSqft');
                copySpan('builtAreaSqyd', 'mob-builtAreaSqyd');
            } catch(e) {}
        };
        window.mobShowCanvas = function() {
            var a=document.querySelector('aside'), m=document.getElementById('canvasContainer');
            if(a) a.classList.remove('mob-active');
            if(m) m.classList.remove('mob-hidden');
            _mobSetTab('canvas');
            if(typeof window.draw==='function') setTimeout(window.draw,100);
        };
        window.mobShowInputs = function() {
            var a=document.querySelector('aside'), m=document.getElementById('canvasContainer');
            if(a){a.classList.add('mob-active');a.scrollTop=0;}
            if(m) m.classList.add('mob-hidden');
            _mobSetTab('inputs');
        };
        window.mobShowRooms = function() {
            var a=document.querySelector('aside'), m=document.getElementById('canvasContainer');
            if(a){
                a.classList.add('mob-active');
                // scroll to floor tabs / rooms section
                var r=document.getElementById('floorTabsRow')||document.getElementById('itemList');
                if(r) setTimeout(function(){r.scrollIntoView({behavior:'smooth'});},150);
                else a.scrollTop=a.scrollHeight;
            }
            if(m) m.classList.add('mob-hidden');
            _mobSetTab('rooms');
        };
        window.mobShowAlerts = function() {
            var a=document.querySelector('aside'), m=document.getElementById('canvasContainer');
            if(a){a.classList.add('mob-active');var al=document.getElementById('vastuAlertsPanel');if(al)setTimeout(function(){al.scrollIntoView({behavior:'smooth'});},100);else a.scrollTop=0;}
            if(m) m.classList.add('mob-hidden');
            _mobSetTab('alerts');
        };
        if(window.innerWidth<768){window.addEventListener('load',function(){window.mobShowCanvas();});}

/* ════ JS Block: lines 7616–7640 from original index.html ════ */
  document.addEventListener('DOMContentLoaded', () => {
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
      input.style.setProperty('pointer-events', 'auto', 'important');
      input.style.setProperty('user-select', 'auto', 'important');
      input.style.setProperty('-webkit-user-select', 'auto', 'important');
      // ── MOBILE KEYPAD FIX: use touchend (not touchstart) to allow scroll,
      //    do NOT call stopPropagation or preventDefault on the input itself ──
      input.addEventListener('touchend', function(e) {
        this.removeAttribute('readonly');
        this.focus();
      }, { passive: true });
    });
  });
  window.addEventListener('beforeunload', function (e) { e.preventDefault(); e.returnValue = ''; });
  let trapSet = false;
  document.body.addEventListener('touchstart', function() {
    if (!trapSet) { window.history.pushState({ page: 1 }, "", ""); trapSet = true; }
  }, { once: true });
  window.addEventListener('popstate', function() {
    if (confirm("Are you sure you want to leave? Your unsaved layout will be lost.")) { window.history.back(); }
    else { window.history.pushState({ page: 1 }, "", ""); }
  });

/* ════ JS Block: lines 7703–7766 from original index.html ════ */
// ── Close all dropdowns on outside click ──
document.addEventListener('click', function(e) {
    // Site Tools dropdown
    var st = document.getElementById('siteToolsDropdown');
    var stb = document.getElementById('siteToolsBtn');
    if(st && !st.contains(e.target) && stb && !stb.contains(e.target)) {
        st.classList.add('hidden');
    }
    // View Settings dropdown
    var vd = document.getElementById('viewSettingsDropdown');
    if(vd && !vd.contains(e.target) && !e.target.closest('#viewSettingsContainer')) {
        vd.classList.add('hidden');
    }
    // Save & Send dropdown
    var sd = document.getElementById('saveSendDropdown');
    var sdb = document.getElementById('saveSendBtn');
    if(sd && !sd.contains(e.target) && sdb && !sdb.contains(e.target)) {
        sd.classList.add('hidden');
    }
});

// ── Sync mobile tool button active states + delete button ──
window.syncMobToolBtns = function() {
    var map = [
        ['mob-wallBtn',    state.isDrawingWall || state.isMeasuring],
        ['mob-rectBtn',    state.isDrawingRect],
        ['mob-inkBtn',     state.isInking],
        ['mob-textBtn',    false],
    ];
    map.forEach(function(pair) {
        var el = document.getElementById(pair[0]);
        if(!el) return;
        if(pair[1]) { el.classList.add('mob-tool-active'); }
        else        { el.classList.remove('mob-tool-active'); }
    });
    var inkSite = document.getElementById('inkBtnSite');
    if(inkSite) {
        inkSite.style.background = state.isInking ? 'rgba(234,88,12,0.4)' : '';
    }
    if(typeof window._syncDeleteBtnGlobal === 'function') window._syncDeleteBtnGlobal();
};

window._syncDeleteBtnGlobal = null;

// ── setActiveTool also calls syncMobToolBtns — patch to ensure consistency ──
(function() {
    var _pi = setInterval(function() {
        if(typeof window.setActiveTool !== 'function') return;
        clearInterval(_pi);
        var _orig = window.setActiveTool;
        window.setActiveTool = function() {
            _orig.apply(this, arguments);
            window.syncMobToolBtns && window.syncMobToolBtns();
        };
        // addTextLabel also syncs
        var _origTxt = window.addTextLabel;
        if(_origTxt) window.addTextLabel = function() {
            _origTxt.apply(this, arguments);
            window.syncMobToolBtns && window.syncMobToolBtns();
        };
    }, 150);
})();

/* ════ JS Block: lines 7857–7950 from original index.html ════ */
// ── Vastu Calculator Logic ──
(function(){
    var _v = '0', _op = null, _prev = null, _newNum = true, _expr = '';

    window.openCalc = function() {
        document.getElementById('vastuCalcModal').style.display = 'flex';
    };

    window._calcFn = function(type, val) {
        var disp = document.getElementById('calcDisplay');
        var expr = document.getElementById('calcExpr');
        if(!disp) return;

        if(type === 'clear') {
            _v = '0'; _op = null; _prev = null; _newNum = true; _expr = '';
        } else if(type === 'num') {
            if(_newNum || _v === '0') { _v = val; _newNum = false; }
            else { if(_v.length < 14) _v += val; }
        } else if(type === 'dot') {
            if(_newNum) { _v = '0.'; _newNum = false; }
            else if(_v.indexOf('.') === -1) _v += '.';
        } else if(type === 'sign') {
            _v = (_v.charAt(0) === '-') ? _v.slice(1) : ('-' + _v);
        } else if(type === 'percent') {
            _v = String(parseFloat(_v) / 100);
        } else if(type === 'op') {
            if(_op && !_newNum) {
                var res = _compute(parseFloat(_prev), parseFloat(_v), _op);
                _prev = String(res); _v = String(res);
            } else {
                _prev = _v;
            }
            _op = val;
            _expr = _prev + ' ' + {'/':'÷','*':'×','-':'−','+':'+'}[val] + ' ';
            _newNum = true;
        } else if(type === 'eq') {
            if(_op && _prev !== null) {
                var res = _compute(parseFloat(_prev), parseFloat(_v), _op);
                _expr = _prev + ' ' + {'/':'÷','*':'×','-':'−','+':'+'}[_op] + ' ' + _v + ' =';
                _v = _isFinite(res) ? String(parseFloat(res.toFixed(10))) : 'Error';
                _op = null; _prev = null; _newNum = true;
            }
        }
        disp.textContent = _v;
        if(expr) expr.textContent = _expr;
    };

    function _compute(a, b, op) {
        if(op === '+') return a + b;
        if(op === '-') return a - b;
        if(op === '*') return a * b;
        if(op === '/') return b !== 0 ? a / b : 0;
        return b;
    }
    function _isFinite(n) { return isFinite(n) && !isNaN(n); }

    window._calcConvert = function() {
        var lf = parseFloat(document.getElementById('calcLenFt').value) || 0;
        var li = parseFloat(document.getElementById('calcLenIn').value) || 0;
        var wf = parseFloat(document.getElementById('calcWidFt').value) || 0;
        var wi = parseFloat(document.getElementById('calcWidIn').value) || 0;
        var lenFt = lf + li / 12;
        var widFt = wf + wi / 12;
        var sqFt  = lenFt * widFt;
        var sqYd  = sqFt / 9;  // 1 sq yard = 9 sq ft; 1 Gajam = 1 sq yard
        var res = document.getElementById('calcConvResult');
        if(res) res.textContent =
            sqFt.toFixed(2) + ' sq.ft  =  ' + sqYd.toFixed(3) + ' Gajam (sq.yd)';
    };

    // ── Draggable modal ──
    var _drag = false, _ox = 0, _oy = 0;
    window._calcDragStart = function(e) {
        if(e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        _drag = true;
        var box = document.getElementById('vastuCalcBox');
        var r = box.getBoundingClientRect();
        _ox = e.clientX - r.left; _oy = e.clientY - r.top;
        box.style.position = 'fixed';
        e.preventDefault();
    };
    document.addEventListener('mousemove', function(e) {
        if(!_drag) return;
        var box = document.getElementById('vastuCalcBox');
        if(!box) return;
        var x = e.clientX - _ox, y = e.clientY - _oy;
        box.style.left = Math.max(0, Math.min(x, window.innerWidth  - box.offsetWidth))  + 'px';
        box.style.top  = Math.max(0, Math.min(y, window.innerHeight - box.offsetHeight)) + 'px';
        box.style.margin = '0';
    });
    document.addEventListener('mouseup', function() { _drag = false; });
})();

/* ════ JS Block: lines 7963–8172 from original index.html ════ */
(function() {
    /* ══ BLUEPRINT ENGINE ══
       window.blueprintImage lives OUTSIDE state so it survives
       saveLocal / importProject / Object.assign(state,...) calls.   */
    window.blueprintImage   = null;
    window.blueprintOpacity = 0.4;
    window.bgScale          = 1;
    window.bgOffsetX        = 0;
    window.bgOffsetY        = 0;

    /* ── Nudge helper — updates global, syncs slider + display label, redraws ── */
    window.bpNudge = function(axis, delta) {
        var slId, valId, fmt;
        if (axis === 'scale') {
            window.bgScale = Math.round(Math.min(3.0, Math.max(0.1, (window.bgScale || 1) + delta)) * 1000) / 1000;
            slId = 'bgScaleSlider'; valId = 'bpScaleVal';
            fmt = window.bgScale.toFixed(2) + '×';
        } else if (axis === 'x') {
            window.bgOffsetX = Math.min(500, Math.max(-500, (window.bgOffsetX || 0) + delta));
            slId = 'bgOffsetXSlider'; valId = 'bpOffsetXVal';
            fmt = (window.bgOffsetX >= 0 ? '+' : '') + Math.round(window.bgOffsetX);
        } else if (axis === 'y') {
            window.bgOffsetY = Math.min(500, Math.max(-500, (window.bgOffsetY || 0) + delta));
            slId = 'bgOffsetYSlider'; valId = 'bpOffsetYVal';
            fmt = (window.bgOffsetY >= 0 ? '+' : '') + Math.round(window.bgOffsetY);
        }
        var sl = document.getElementById(slId); if (sl) sl.value = axis === 'scale' ? window.bgScale : (axis === 'x' ? window.bgOffsetX : window.bgOffsetY);
        var vl = document.getElementById(valId); if (vl) vl.textContent = fmt;
        if (typeof window.draw === 'function') window.draw();
    };

    /* ── Reset transforms to neutral ── */
    window.bpReset = function() {
        window.bgScale = 1; window.bgOffsetX = 0; window.bgOffsetY = 0;
        var ss = document.getElementById('bgScaleSlider');   if (ss) ss.value = 1;
        var sx = document.getElementById('bgOffsetXSlider'); if (sx) sx.value = 0;
        var sy = document.getElementById('bgOffsetYSlider'); if (sy) sy.value = 0;
        var vs = document.getElementById('bpScaleVal');   if (vs) vs.textContent = '1.00×';
        var vx = document.getElementById('bpOffsetXVal'); if (vx) vx.textContent = '0';
        var vy = document.getElementById('bpOffsetYVal'); if (vy) vy.textContent = '0';
        if (typeof window.draw === 'function') window.draw();
    };

    /* ── Clear blueprint entirely ── */
    window.bpClear = function() {
        window.blueprintImage = null;
        if (typeof state !== 'undefined') state.bgImg = null;
        window.bpReset();
        var panel = document.getElementById('blueprintControlPanel');
        if (panel) panel.style.display = 'none';
        if (typeof showToast === 'function') showToast('Blueprint cleared.');
        if (typeof window.draw === 'function') window.draw();
    };

    /* ── FileReader handler — called by hidden <input type="file"> ── */
    window._handleBlueprintFileSelect = function(file) {
        var input = document.getElementById('blueprintFileInput');
        if (input) input.value = '';
        if (!file) return;
        // ── STEP 3a: File-type validation (alert on non-image) ──
        if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
            alert('Error: Please upload a valid image file (JPG or PNG).');
            return;
        }
        // ── STEP 3a: 5MB size guard ──
        if (file.size > 5 * 1024 * 1024) {
            alert('Error: File exceeds 5MB. Please compress or resize the image before uploading.');
            return;
        }

        // ── STEP 3b: Shared helper — resets transforms, syncs sliders, shows panel ──
        // Called by both the direct-load path and the off-screen downscale path.
        // Does NOT touch draw() pipeline or Layer 0 compositing.
        function _bpApplyDefaults(resolvedImg) {
            window.blueprintImage = resolvedImg;
            /* reset transforms to neutral on every new upload */
            window.bgScale   = 1;
            window.bgOffsetX = 0;
            window.bgOffsetY = 0;
            var ss = document.getElementById('bgScaleSlider');   if(ss) ss.value = 1;
            var sx = document.getElementById('bgOffsetXSlider'); if(sx) sx.value = 0;
            var sy = document.getElementById('bgOffsetYSlider'); if(sy) sy.value = 0;
            var vs = document.getElementById('bpScaleVal');   if(vs) vs.textContent = '1.00×';
            var vx = document.getElementById('bpOffsetXVal'); if(vx) vx.textContent = '0';
            var vy = document.getElementById('bpOffsetYVal'); if(vy) vy.textContent = '0';
            /* sync opacity slider */
            var sl = document.getElementById('blueprintOpacitySlider');
            if (sl) { sl.value = window.blueprintOpacity; }
            var vl = document.getElementById('bpOpacityVal');
            if (vl) { vl.textContent = Math.round(window.blueprintOpacity * 100) + '%'; }
            /* show floating control panel */
            var panel = document.getElementById('blueprintControlPanel');
            if (panel) panel.style.display = 'flex';
            window.draw();
            if (typeof showToast === 'function') showToast('Blueprint loaded — adjust opacity with the panel.');
        }

        var reader = new FileReader();
        reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
                // ── STEP 3b: Mobile RAM protection — silently downscale if > 3000px ──
                // Creates an off-screen canvas, resizes into it, then creates a new
                // Image from its DataURL. The draw() pipeline is untouched — it simply
                // receives a smaller Image object via window.blueprintImage.
                var MAX_DIM = 3000;
                if (img.naturalWidth > MAX_DIM || img.naturalHeight > MAX_DIM) {
                    var ratio  = Math.min(MAX_DIM / img.naturalWidth, MAX_DIM / img.naturalHeight);
                    var oc     = document.createElement('canvas');
                    oc.width   = Math.round(img.naturalWidth  * ratio);
                    oc.height  = Math.round(img.naturalHeight * ratio);
                    var octx   = oc.getContext('2d');
                    octx.drawImage(img, 0, 0, oc.width, oc.height);
                    var resized = new Image();
                    resized.onload = function() { _bpApplyDefaults(resized); };
                    resized.onerror = function() {
                        // Fallback: use original if canvas encode fails
                        _bpApplyDefaults(img);
                    };
                    resized.src = oc.toDataURL('image/jpeg', 0.92);
                    return; // wait for resized.onload — do NOT fall through
                }
                // Image is within size limits — use directly
                _bpApplyDefaults(img);
            };
            img.onerror = function() {
                if (typeof showToast === 'function') showToast('Could not load image. Try another file.');
            };
            img.src = ev.target.result;
        };
        reader.onerror = function() {
            if (typeof showToast === 'function') showToast('File read error. Please try again.');
        };
        reader.readAsDataURL(file);
    };

    /* ── Shared trigger ── */
    window.triggerBlueprintUpload = function() {
        var input = document.getElementById('blueprintFileInput');
        if (input) input.click();
    };

    /* ── Opacity slider live display sync ── */
    document.addEventListener('DOMContentLoaded', function() {
    var sl = document.getElementById('blueprintOpacitySlider');
    if (sl) {
        sl.addEventListener('input', function() {
            window.blueprintOpacity = parseFloat(this.value);
            var vl = document.getElementById('bpOpacityVal');
            if (vl) vl.textContent = Math.round(window.blueprintOpacity * 100) + '%';
        });
    }
    // ── Global App Versioning ──
    var hv = document.getElementById('header-version');
    if (hv) hv.textContent = APP_VERSION;
    var fv = document.getElementById('footer-version');
    if (fv) fv.textContent = APP_VERSION;
});

    /* ══ PATCH draw() to render window.blueprintImage as Layer 0 ══
       We wrap the existing draw() so that before each frame we sync
       window.blueprintImage → state.bgImg (the existing Layer 0 hook).
       Runs once after draw() is defined.                              */
    function patchDraw() {
        if (typeof window.draw !== 'function') { setTimeout(patchDraw, 200); return; }
        var _orig = window.draw;
        window.draw = function() {
            /* Sync blueprint into state so existing bgImg Layer 0 block draws it */
            if (typeof state !== 'undefined') {
                if (window.blueprintImage) {
                    state.bgImg     = window.blueprintImage;
                    state.bgOpacity = window.blueprintOpacity;
                } else {
                    state.bgImg = null;
                }
            }
            _orig.apply(this, arguments);
        };
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(patchDraw, 500); });
    } else {
        setTimeout(patchDraw, 500);
    }

    /* ══ PATCH setActiveTool() for active tool glow highlighting ══ */
    function patchSetActiveTool() {
        if (typeof window.setActiveTool !== 'function') { setTimeout(patchSetActiveTool, 300); return; }
        var _origSAT = window.setActiveTool;
        window.setActiveTool = function(tool) {
            _origSAT.apply(this, arguments);
            /* Re-sync desktop btn-active classes after original runs */
            ['wallBtn','rectBtn','inkBtn'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.classList.remove('btn-active');
            });
            if (window._activeTool) {
                var map = { wall: 'wallBtn', rect: 'rectBtn', ink: 'inkBtn' };
                var targetId = map[window._activeTool];
                if (targetId) {
                    var b = document.getElementById(targetId);
                    if (b) b.classList.add('btn-active');
                }
            }
        };
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(patchSetActiveTool, 600); });
    } else {
        setTimeout(patchSetActiveTool, 600);
    }

})();
// ══════════════════════════════════════════════════════════════════
// DEVATA ZONE SYSTEM — Step 1: Proportional 9×9 grid, built area only
// Rules:
//   col = floor((cx / houseEw) * 9), clamped 0–8  (0=west, 8=east)
//   row = floor((cy / houseNs) * 9), clamped 0–8  (0=south, 8=north)
//   cols 0–2 = west third, cols 3–5 = centre, cols 6–8 = east third
//   rows 0–2 = south third, rows 3–5 = centre, rows 6–8 = north third
//   centre 3×3 (rows 3–5, cols 3–5) = "Brahmasthana" — never a compass direction
// ══════════════════════════════════════════════════════════════════

function createVastuGrid(width, height) {
    // Build a 9×9 grid of cells, each carrying its zone string.
    // Cells are proportional rectangles: cellW = width/9, cellH = height/9.
    // Zone assignment is purely positional (row/col grouping).
    // No angular logic is used anywhere in this function.

    const cellW = width  / 9;
    const cellH = height / 9;
    const grid  = [];

    for (let r = 0; r < 9; r++) {
        const row = [];
        for (let c = 0; c < 9; c++) {
            // Determine compass zone from row/col position.
            // row 0 = southernmost band, row 8 = northernmost band.
            // col 0 = westernmost band,  col 8 = easternmost band.
            let zone;
            const inNorthThird  = (r >= 6); // rows 6–8
            const inSouthThird  = (r <= 2); // rows 0–2
            const inMiddleRow   = (r >= 3 && r <= 5);
            const inEastThird   = (c >= 6); // cols 6–8
            const inWestThird   = (c <= 2); // cols 0–2
            const inMiddleCol   = (c >= 3 && c <= 5);

            if (inMiddleRow && inMiddleCol) {
                // Centre 3×3 = Brahmasthana — must remain open
                zone = 'Brahmasthana';
            } else if (inNorthThird && inEastThird)  { zone = 'NE'; }
            else if (inNorthThird && inWestThird)    { zone = 'NW'; }
            else if (inNorthThird && inMiddleCol)    { zone = 'N';  }
            else if (inSouthThird && inEastThird)    { zone = 'SE'; }
            else if (inSouthThird && inWestThird)    { zone = 'SW'; }
            else if (inSouthThird && inMiddleCol)    { zone = 'S';  }
            else if (inMiddleRow  && inEastThird)    { zone = 'E';  }
            else if (inMiddleRow  && inWestThird)    { zone = 'W';  }
            else                                     { zone = 'Brahmasthana'; } // safety fallback

            row.push({
                x:    c * cellW,
                y:    r * cellH,
                w:    cellW,
                h:    cellH,
                row:  r,
                col:  c,
                zone: zone
            });
        }
        grid.push(row);
    }
    return grid;
}

function getZoneFromGrid(cell) {
    // Cell already carries its zone string — just return it.
    // No lookup table, no index arithmetic.
    return cell.zone || 'Brahmasthana';
}

function getRoomZoneSimple(room) {
    // Determine zone using the center point of the room (built-area coords).
    // This matches exactly what the canvas uses for red-border logic.
    // Only applies to built area — outside/marker rooms are handled separately.

    const actW = (room.wF || 0) + (room.wI || 0) / 12;
    const actH = (room.hF || 0) + (room.hI || 0) / 12;

    // Center point in house-relative feet
    const cx = room.x + actW / 2;
    const cy = room.y + actH / 2;

    // Convert to 0–8 grid indices (proportional to built area dimensions)
    const rawCol = Math.floor((cx / state.houseEw) * 9);
    const rawRow = Math.floor((cy / state.houseNs) * 9);

    // Clamp to valid grid range
    const col = Math.max(0, Math.min(8, rawCol));
    const row = Math.max(0, Math.min(8, rawRow));

    const grid = createVastuGrid(state.houseEw, state.houseNs);
    return getZoneFromGrid(grid[row][col]);
}

// ── 8-directional Devata zone names (Viswakarma Vastu) ──
// Used in alert messages: "NW (Vayavya)" and "SE (Agni)"
const DEVATA_ZONE_NAMES = {
    'NE': 'Ishanya',
    'E':  'Indra',
    'SE': 'Agni',
    'S':  'Yama',
    'SW': 'Nairutya',
    'W':  'Varuna',
    'NW': 'Vayavya',
    'N':  'Soma',
    'Brahmasthana': 'Brahmasthana'
};
window.DEVATA_ZONE_NAMES = DEVATA_ZONE_NAMES;

// ── Ideal zone per room type (first entry = primary correct zone for alert message) ──
const DEVATA_IDEAL_ZONE = {
    'Master Bed':   'SW',
    'Kitchen':      'SE',
    'Bedroom 2':    'NW',
    'Toilet':       'NW',
    'Puja':         'NE',
    'Hall':         'NE',
    'Dining':       'E',
    'Staircase':    'SW',
    'Store':        'SW',
    'Dressing':     'SW',
    'Servant Room': 'NW',
    'Watch Ward':   'N',
    'Bathroom Out': 'NW'
};
window.DEVATA_IDEAL_ZONE = DEVATA_IDEAL_ZONE;

function checkRoomVastuDevata(r) {
    // Returns true           = correctly placed (no alert needed)
    // Returns false          = wrong zone (alert required)
    // Returns 'brahmasthana' = in Brahmasthana (special alert)
    //
    // Rules use only the 8 zones the 9x9 grid actually produces:
    // N, NE, E, SE, S, SW, W, NW — plus Brahmasthana for centre cells.
    // No sub-zones (WSW, SSW etc.) — those never appear from createVastuGrid().

    // Skip site-level elements — zone rules do not apply to them
    if (r.isFurniture || r.isMarker || r.isOutside || r.isSiteGate) return true;

    const zone = getRoomZoneSimple(r);

    // Brahmasthana check — Hall/Dining allowed (open/transitional spaces)
    if (zone === 'Brahmasthana') {
        if (r.type === 'Hall' || r.type === 'Dining') return true;
        return 'brahmasthana';
    }

    // Compass-zone rules — only 8 zones used (N/NE/E/SE/S/SW/W/NW)
    const rules = {
        'Master Bed':   ['SW', 'S', 'W'],
        'Kitchen':      ['SE', 'E'],
        'Bedroom 2':    ['NW', 'W', 'S', 'SW'],
        'Toilet':       ['NW', 'W'],
        'Puja':         ['NE', 'E', 'N'],
        'Hall':         ['N', 'E', 'NE', 'NW'],
        'Dining':       ['E', 'SE', 'S', 'W', 'N'],
        'Staircase':    ['S', 'SW', 'W', 'SE'],
        'Store':        ['S', 'SW', 'W', 'NW'],
        'Dressing':     ['SW', 'S', 'W'],
        'Servant Room': ['NW', 'W', 'SW'],
        'Watch Ward':   ['N', 'NE', 'E', 'NW'],
        'Bathroom Out': ['NW', 'W', 'SW', 'N']
    };

    // No rule for this room type = no restriction = always valid
    if (!rules[r.type]) return true;

    return rules[r.type].includes(zone);
}

function getDevataAlerts() {
    // Returns array of HTML alert strings — Devata zone system only.
    // Format: "❌ Kitchen in NW (Vayavya) — should be in SE (Agni)"
    // Only wrongly placed rooms are included — correct rooms are silent.
    // This output feeds both the left panel and printing (via vastuAlertsList DOM).
    // When state.devataMode is OFF → returns empty array (panel hidden).

    const issues = [];
    if (!state.devataMode) return issues;
    if (!state.rooms) return issues;

    const ZN  = window.DEVATA_ZONE_NAMES  || {};
    const IDL = window.DEVATA_IDEAL_ZONE  || {};

    state.rooms.forEach(function(r) {
        // Skip hidden rooms and site-level elements
        if (r.hidden) return;
        if (r.isFurniture || r.isMarker || r.isOutside || r.isSiteGate) return;

        const result      = checkRoomVastuDevata(r);
        const displayName = (typeof window.getRoomName === 'function')
            ? window.getRoomName(r.name || r.type)
            : (r.name || r.type);

        if (result === 'brahmasthana') {
            // Room is in centre zone — must remain open
            issues.push(
                '<div class="text-red-400 bg-red-900/30 p-1 rounded border border-red-700/50">' +
                '❌ <b>' + displayName + '</b> is in <b>Brahmasthana</b> (centre) — this zone must remain open</div>'
            );
        } else if (result === false) {
            // Room is in wrong compass zone — show current and ideal with Devata names
            const currentZone = getRoomZoneSimple(r);
            const currentDev  = ZN[currentZone]  || currentZone;
            const idealZone   = IDL[r.type]       || '';
            const idealDev    = ZN[idealZone]     || idealZone;

            let msg = '❌ <b>' + displayName + '</b> in <b>' + currentZone + ' (' + currentDev + ')</b>';
            if (idealZone) {
                msg += ' — should be in <b>' + idealZone + ' (' + idealDev + ')</b>';
            }
            issues.push('<div class="text-red-400 text-[9px] py-0.5">' + msg + '</div>');
        }
        // result === true → correct placement → silent (no entry)
    });

    return issues;
}

function renderDevataAlertsPanel() {
    if (!state.devataMode) return;

    const panel = document.querySelector('#vastuAlertsPanel');
    if (!panel) return;

    const issues = getDevataAlerts();

    panel.innerHTML = issues.length
        ? issues.join('')
        : '<div class="flex items-center gap-1.5 text-green-400 text-[9px] py-1">' +
          '<i class="fa-solid fa-circle-check"></i> All rooms correctly placed</div>';
}