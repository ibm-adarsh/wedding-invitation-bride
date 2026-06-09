(function () {
    'use strict';

    const D = window.WEDDING_DATA;
    const CFG = window.SITE_CONFIG || {};
    const MUSIC_ID = CFG.musicVideoId || '-2w18bd-ZQ4';

    const loader = document.getElementById('loader');
    const main = document.getElementById('main');
    const loaderText = document.getElementById('loaderText');
    const loaderOpening = document.getElementById('loaderOpening');
    const musicBtn = document.getElementById('musicBtn');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const fabGroup = document.getElementById('fabGroup');
    const dotNav = document.getElementById('dotNav');
    const sparkleCanvas = document.getElementById('sparkleCanvas');
    const fireflyCanvas = document.getElementById('fireflyCanvas');
    const curtainStage = document.getElementById('curtainStage');
    const curtainHint = document.getElementById('curtainHint');
    const namaskarBeat = document.getElementById('namaskarBeat');

    let musicPlaying = false;
    let ytPlayer = null;
    let ytReady = false;
    let musicStartRequested = false;
    let musicUnmuteListenersAttached = false;
    let userGestureForMusic = false;
    let pendingMusicFromGesture = false;
    let musicRetryInterval = null;
    let invitationOpened = false;
    let autoOpenTimer = null;
    let lastSec = -1;
    let curtainsDone = false;
    let curtainTimer = null;

    function getBrideEvents() {
        const ev = (D && D.events) ? D.events : {};
        return [
            { key: 'haldiMehndi', data: ev.haldiMehndi, featured: false },
            { key: 'wedding', data: ev.wedding, featured: true, showMap: true }
        ].filter(function (item) { return item.data; });
    }

    function animateEventCards() {
        document.querySelectorAll('#eventList .event-card').forEach(function (card, i) {
            if (reducedMotion()) {
                card.classList.add('event-ready');
                card.style.opacity = '1';
                card.style.transform = 'none';
                return;
            }
            card.classList.remove('event-ready');
            card.style.animationDelay = (i * 0.12) + 's';
            void card.offsetWidth;
            card.classList.add('event-ready');
        });
    }

    function $(id) {
        return document.getElementById(id);
    }

    function reducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /* ── Ganesha images ── */
    function initGaneshaImages() {
        const primary = CFG.ganeshaImage || 'assets/ganesha-neon.jpg';
        const fallback = CFG.ganeshaFallback || 'assets/ganesha.png';
        const version = CFG.ganeshaImageVersion || 'dreamstime';

        function withVersion(path) {
            return path + (path.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(version);
        }

        function bind(img) {
            if (!img) return;
            img.src = withVersion(primary);
            img.onerror = function () {
                img.onerror = null;
                img.src = withVersion(fallback);
            };
        }

        bind($('loaderGanesha'));
        bind($('mainGanesha'));
    }

    /* ── Rotating footer blessings ── */
    const BLESSINGS = [
        { hi: 'सात जन्मों का साथ', en: 'A bond beyond lifetimes' },
        { hi: '॥ शुभ विवाह ॥', en: 'Blessings on this sacred union' },
        { hi: 'प्रेम, स्नेह और सुख से भरा जीवन', en: 'A life filled with love & joy' },
        { hi: 'दो दिल, एक धड़कन', en: 'Two hearts, one heartbeat' }
    ];

    function initFooterBlessings() {
        const el = $('blessingText');
        if (!el) return;

        let idx = 0;
        function show() {
            const b = BLESSINGS[idx];
            el.classList.remove('blessing-in');
            void el.offsetWidth;
            el.innerHTML = '<span class="blessing-hi devanagari">' + escapeHtml(b.hi) + '</span>' +
                '<span class="blessing-en">' + escapeHtml(b.en) + '</span>';
            el.classList.add('blessing-in');
            idx = (idx + 1) % BLESSINGS.length;
        }

        show();
        if (!reducedMotion()) {
            setInterval(show, 2200);
        }
    }

    /* ── Sparkle canvas ── */
    function initSparkles() {
        if (reducedMotion() || !sparkleCanvas) return;

        const ctx = sparkleCanvas.getContext('2d');
        const particles = [];
        const colors = ['#ff6ec7', '#ff8fab', '#ffd700', '#e879a8', '#ff9f43', '#fff'];

        function resize() {
            sparkleCanvas.width = window.innerWidth;
            sparkleCanvas.height = window.innerHeight;
        }

        function spawn() {
            if (particles.length > 100) return;
            particles.push({
                x: Math.random() * sparkleCanvas.width,
                y: sparkleCanvas.height + 5,
                r: Math.random() * 2.5 + 0.5,
                alpha: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 1.2 + 0.4,
                drift: (Math.random() - 0.5) * 0.6,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function draw() {
            ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.y -= p.speed;
                p.x += p.drift;
                p.alpha -= 0.003;
                if (p.alpha <= 0 || p.y < -10) {
                    particles.splice(i, 1);
                    continue;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.color;
            }
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            if (Math.random() > 0.5) spawn();
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        draw();
    }

    /* ── Firefly canvas ── */
    function initFireflies() {
        if (reducedMotion() || !fireflyCanvas) return;

        const ctx = fireflyCanvas.getContext('2d');
        const flies = [];
        const count = 25;

        function resize() {
            fireflyCanvas.width = window.innerWidth;
            fireflyCanvas.height = window.innerHeight;
        }

        for (let i = 0; i < count; i++) {
            flies.push({
                x: Math.random() * innerWidth,
                y: Math.random() * innerHeight,
                r: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.2,
                angle: Math.random() * Math.PI * 2
            });
        }

        function draw() {
            ctx.clearRect(0, 0, fireflyCanvas.width, fireflyCanvas.height);
            flies.forEach(function (f) {
                f.phase += 0.04;
                f.x += Math.cos(f.angle) * f.speed;
                f.y += Math.sin(f.angle) * f.speed;
                if (f.x < 0 || f.x > fireflyCanvas.width) f.angle = Math.PI - f.angle;
                if (f.y < 0 || f.y > fireflyCanvas.height) f.angle = -f.angle;
                const glow = (Math.sin(f.phase) + 1) / 2;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 215, 0, ' + (0.2 + glow * 0.6) + ')';
                ctx.shadowBlur = 12 + glow * 10;
                ctx.shadowColor = '#ffd700';
                ctx.fill();
            });
            ctx.shadowBlur = 0;
            requestAnimationFrame(draw);
        }

        resize();
        window.addEventListener('resize', resize);
        draw();
    }

    /* ── Parallax on scroll ── */
    function initParallax() {
        if (reducedMotion()) return;

        const mandala = document.querySelector('.mandala-bg');
        let ticking = false;

        window.addEventListener('scroll', function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                const y = window.scrollY;
                if (mandala) mandala.style.transform = 'translateY(' + (y * 0.15) + 'px) rotate(' + (y * 0.02) + 'deg)';
                ticking = false;
            });
        }, { passive: true });
    }

    /* ── Auto-highlight events ── */
    function initEventAutoHighlight() {
        if (reducedMotion()) return;

        const cards = document.querySelectorAll('.event-card');
        if (!cards.length) return;

        let idx = 0;
        setInterval(function () {
            cards.forEach(function (c) { c.classList.remove('spotlight'); });
            cards[idx].classList.add('spotlight');
            idx = (idx + 1) % cards.length;
        }, 3500);
    }

    /* ── Flower shower (curtain, invitation open, cards) ── */
    function burstFlowerShower(intensity) {
        if (reducedMotion()) return;

        const root = $('confettiRoot');
        if (!root) return;

        const flowers = ['🌸', '🌺', '🌷', '🌼', '🪷', '💮', '🏵️', '✿'];
        const count = intensity === 'light' ? 28 : 60;

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('span');
            piece.className = 'flower-shower-piece';
            piece.textContent = flowers[Math.floor(Math.random() * flowers.length)];
            piece.style.left = (Math.random() * 100) + '%';
            piece.style.fontSize = (0.75 + Math.random() * 1.15) + 'rem';
            piece.style.animationDuration = (2.2 + Math.random() * 2.8) + 's';
            piece.style.animationDelay = (Math.random() * 0.65) + 's';
            piece.style.setProperty('--flower-drift', ((Math.random() - 0.5) * 100).toFixed(0) + 'px');
            piece.style.setProperty('--flower-spin', (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360) + 'deg');
            root.appendChild(piece);
            setTimeout(function () { piece.remove(); }, 5500);
        }
    }

    function burstConfetti() {
        burstFlowerShower('full');
    }

    function createHeartExplosion(x, y, count) {
        if (reducedMotion()) return;

        const n = count || 16;
        const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️'];

        for (let i = 0; i < n; i++) {
            setTimeout(function () {
                const heart = document.createElement('div');
                heart.className = 'tap-heart';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = x + 'px';
                heart.style.top = y + 'px';
                document.body.appendChild(heart);

                const angle = (Math.PI * 2 * i) / n;
                const distance = 100 + Math.random() * 50;

                requestAnimationFrame(function () {
                    heart.style.left = (x + Math.cos(angle) * distance) + 'px';
                    heart.style.top = (y + Math.sin(angle) * distance) + 'px';
                    heart.style.opacity = '0';
                    heart.style.transform = 'scale(1.6) rotate(360deg)';
                });

                setTimeout(function () { heart.remove(); }, 1500);
            }, i * 25);
        }
    }

    function initGlobalHeartClicks() {
        let lastBurst = 0;

        document.addEventListener('click', function (e) {
            if (e.target.closest('button, a, input, textarea, select, [role="button"], .fab, .dot, .portal-stage')) {
                return;
            }
            const now = Date.now();
            if (now - lastBurst < 100) return;
            lastBurst = now;
            createHeartExplosion(e.clientX, e.clientY);
        }, { passive: true });
    }

    function showToast(message) {
        const root = $('toastRoot');
        if (!root) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        root.appendChild(toast);

        setTimeout(function () {
            toast.classList.add('toast-out');
            setTimeout(function () { toast.remove(); }, 320);
        }, 2800);
    }

    function initScrollProgress() {
        const bar = $('scrollProgress');
        if (!bar) return;

        function update() {
            const doc = document.documentElement;
            const scrollTop = doc.scrollTop || document.body.scrollTop;
            const height = doc.scrollHeight - doc.clientHeight;
            const pct = height > 0 ? (scrollTop / height) * 100 : 0;
            bar.style.width = pct + '%';
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initScrollHint() {
        const hint = $('scrollHint');
        if (!hint) return;

        hint.addEventListener('click', function () {
            const opening = document.getElementById('opening');
            if (opening) {
                opening.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        let hidden = false;
        function hideHint() {
            if (hidden || !hint) return;
            hidden = true;
            hint.classList.add('hidden-hint');
        }

        window.addEventListener('scroll', function () {
            if (window.scrollY > 80) hideHint();
        }, { passive: true });
    }

    function initShare() {
        const btn = $('shareBtn');
        if (!btn) return;

        const shareUrl = (CFG.siteUrl || window.SITE_URL || window.location.href).replace(/\/?$/, '/');
        const shareData = {
            title: 'Anjali & Adarsh — Wedding Invitation',
            text: 'You\'re warmly invited to celebrate our wedding on 28th June 2026 in Jaunpur. 🌸',
            url: shareUrl
        };

        btn.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share(shareData).catch(function () {});
                return;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareData.url).then(function () {
                    showToast('Invitation link copied!');
                }).catch(function () {
                    showToast('Share: ' + shareData.url);
                });
            } else {
                showToast('Share: ' + shareData.url);
            }
        });
    }

    function initCoupleHeart() {
        const el = $('coupleHeart');
        if (!el) return;

        function burst() {
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            createHeartExplosion(x, y, 24);
            burstConfetti();
            el.classList.add('couple-heart-pop');
            setTimeout(function () { el.classList.remove('couple-heart-pop'); }, 400);
        }

        el.addEventListener('click', burst);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                burst();
            }
        });
    }

    function initCurtainProgress() {
        const progress = $('curtainProgress');
        if (!progress || reducedMotion()) return;
        progress.style.width = '0%';
        requestAnimationFrame(function () {
            progress.style.width = '100%';
        });
    }

    function initReveal() {
        const els = document.querySelectorAll('.reveal');
        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const card = entry.target.querySelector('.vakratunda-card');
                    if (card) card.classList.add('visible');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

        els.forEach(function (el) { obs.observe(el); });
    }

    /* ── Portal opening + namaskar ── */
    function showNamaskar() {
        if (!namaskarBeat) return;
        namaskarBeat.classList.remove('hidden', 'fade-out');
        void namaskarBeat.offsetWidth;
        namaskarBeat.classList.add('visible');
    }

    function hideNamaskar(done) {
        if (!namaskarBeat) {
            if (done) done();
            return;
        }
        namaskarBeat.classList.remove('visible');
        namaskarBeat.classList.add('fade-out');
        setTimeout(function () {
            namaskarBeat.classList.remove('fade-out');
            namaskarBeat.classList.add('hidden');
            if (done) done();
        }, reducedMotion() ? 100 : 900);
    }

    function revealLoader() {
        loader.classList.remove('loader-waiting');
        loader.classList.add('loader-revealed');
        scheduleAutoOpen();
    }

    function initCurtains() {
        if (!curtainStage || !loader) return;

        const AUTO_MS = 1400;
        const PORTAL_NAMASKAR_MS = reducedMotion() ? 160 : 1100;
        const NAMASKAR_HOLD_MS = reducedMotion() ? 700 : 2400;
        const PORTAL_HIDE_MS = reducedMotion() ? 240 : 1900;

        function openCurtains(fromGesture) {
            if (curtainsDone) return;
            if (fromGesture) unlockMusicFromGesture();
            curtainsDone = true;
            if (curtainTimer) clearTimeout(curtainTimer);

            curtainStage.classList.add('opening', 'opened');
            if (curtainHint) curtainHint.textContent = 'Welcome…';

            burstConfetti();

            setTimeout(function () {
                curtainStage.classList.add('done');
                showNamaskar();
            }, PORTAL_NAMASKAR_MS);

            setTimeout(function () {
                curtainStage.style.display = 'none';
            }, PORTAL_HIDE_MS);

            setTimeout(function () {
                hideNamaskar(revealLoader);
            }, PORTAL_NAMASKAR_MS + NAMASKAR_HOLD_MS);
        }

        curtainStage.addEventListener('touchstart', function () {
            unlockMusicFromGesture();
            openCurtains(true);
        }, { passive: true });

        curtainStage.addEventListener('click', function () {
            unlockMusicFromGesture();
            openCurtains(true);
        });
        curtainStage.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                unlockMusicFromGesture();
                openCurtains(true);
            }
        });

        if (reducedMotion()) {
            openCurtains(false);
        } else {
            initCurtainProgress();
            curtainTimer = setTimeout(function () { openCurtains(false); }, AUTO_MS);
        }

        attachMusicUnmuteOnInteraction();
        attachOpeningTapForMusic(curtainStage);
        attachOpeningTapForMusic(loader);
        attachOpeningTapForMusic(namaskarBeat);
    }

    function scheduleAutoOpen() {
        if (invitationOpened || autoOpenTimer) return;

        if (loaderText) loaderText.textContent = 'A celebration awaits you';
        if (loaderOpening) loaderOpening.hidden = false;

        beginInvitationMusic();

        const delay = reducedMotion() ? 450 : 1200;
        autoOpenTimer = setTimeout(function () {
            autoOpenTimer = null;
            openInvitation();
        }, delay);
    }

    function initDotNav() {
        const dots = dotNav.querySelectorAll('.dot');
        const sections = document.querySelectorAll('[data-section]');

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const id = dot.getAttribute('data-section');
                const target = document.getElementById(id);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        const obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('data-section');
                    dots.forEach(function (d) {
                        d.classList.toggle('active', d.getAttribute('data-section') === id);
                    });
                }
            });
        }, { threshold: 0.35 });

        sections.forEach(function (s) { obs.observe(s); });
    }

    function animateNames() {
        function wrapChars(el, text) {
            el.innerHTML = text.split('').map(function (ch, i) {
                return '<span class="char" style="animation-delay:' + (i * 0.07) + 's">' +
                    (ch === ' ' ? '\u00a0' : escapeHtml(ch)) + '</span>';
            }).join('');
        }
        wrapChars($('nameBride'), D.couple.bride.shortName);
        wrapChars($('nameGroom'), D.couple.groom.shortName);
    }

    function renderCouple() {
        $('brideName').textContent = D.couple.bride.fullName;
        $('brideParents').textContent = D.couple.bride.parents;
        $('groomName').textContent = D.couple.groom.fullName;
        $('groomParents').textContent = D.couple.groom.parents;
    }

    function renderEvents() {
        const list = $('eventList');
        const brideEvents = getBrideEvents();

        list.innerHTML = brideEvents.map(function (ev, idx) {
            const e = ev.data;
            const cls = 'event-card' + (ev.featured ? ' featured' : '');
            let actions = '<button type="button" class="btn-cal" data-cal="' + ev.key + '">📅 Calendar</button>';
            if (ev.showMap) {
                actions += '<button type="button" class="btn-cal" data-map="wedding">📍 Map</button>';
            }

            return (
                '<article class="' + cls + '" data-event="' + ev.key + '" data-idx="' + idx + '">' +
                '<div class="event-inner">' +
                '<div class="event-header">' +
                '<div class="event-emoji pop-emoji">' + (e.emoji || '✨') + '</div>' +
                '<div class="event-header-text">' +
                '<h3>' + escapeHtml(e.titleEn || e.title) + '</h3>' +
                '<p class="event-date">' + escapeHtml(e.date) + '</p>' +
                '</div>' +
                '<span class="event-chevron">▾</span>' +
                '</div>' +
                '<div class="event-body">' +
                '<div class="event-details">' +
                '<p class="event-time">' + escapeHtml(e.time) + '</p>' +
                '<div class="event-actions">' + actions + '</div>' +
                '</div></div></div></article>'
            );
        }).join('');

        list.querySelectorAll('.event-card').forEach(function (card) {
            card.querySelector('.event-header').addEventListener('click', function () {
                const wasExpanded = card.classList.contains('expanded');
                list.querySelectorAll('.event-card').forEach(function (c) {
                    c.classList.remove('expanded', 'spotlight');
                });
                if (!wasExpanded) {
                    card.classList.add('expanded');
                    card.classList.add('spotlight');
                    burstFlowerShower('light');
                }
            });
        });

        list.querySelectorAll('[data-cal]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                addToCalendar(btn.getAttribute('data-cal'));
            });
        });
        list.querySelectorAll('[data-map]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openMap();
            });
        });

        setTimeout(function () {
            list.querySelectorAll('.event-card').forEach(function (c) {
                c.classList.add('expanded');
            });
            const wedding = list.querySelector('.event-card.featured');
            if (wedding) wedding.classList.add('spotlight');
        }, 1200);

        initEventAutoHighlight();
    }

    function renderVenue() {
        $('venueName').textContent = D.wedding.venueName;
        $('venueAddress').textContent = D.wedding.venueAddress;
        $('venueCity').textContent = D.wedding.city + ', ' + D.wedding.state + ' ' + D.wedding.pincode;
        $('venueDate').textContent = D.wedding.dayLabel;
        $('venueTime').textContent = D.wedding.time;
        $('heroDate').textContent = D.wedding.dayLabel + ' · ' + (D.wedding.heroLocation || D.wedding.city);
        $('footerDate').textContent = D.wedding.dayLabel;
    }

    function renderRsvp() {
        $('rsvpDeadline').textContent = D.rsvp.deadline;

        $('rsvpContactMain').innerHTML =
            '<strong>' + escapeHtml(CFG.brideName || 'Anjali Yadav') + '</strong> ' +
            '<span class="rsvp-phone">' + escapeHtml(CFG.familyPhoneDisplay || '') + '</span>';
        $('rsvpPhone').hidden = true;

        const phone = CFG.familyPhone;
        if (phone) {
            $('whatsappBtn').addEventListener('click', sendWhatsApp);
            $('callBtn').addEventListener('click', makeCall);
        } else {
            $('rsvpActions').classList.add('hidden');
        }

        if (CFG.friendsNote && CFG.friendsNote.length) {
            const box = $('friendsNote');
            box.classList.remove('hidden');
            box.innerHTML =
                '<h4>For Friends & Colleagues</h4>' +
                CFG.friendsNote.map(function (f) {
                    return '<p><strong>' + escapeHtml(f.name) + '</strong> — ' + escapeHtml(f.phone) + '</p>';
                }).join('');
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function openMap() {
        const q = encodeURIComponent(D.wedding.mapsQuery);
        window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank');
    }

    function addToCalendar(key) {
        let title, date, time, location;
        if (key === 'wedding') {
            title = 'Wedding — ' + D.couple.bride.shortName + ' & ' + D.couple.groom.shortName;
            date = D.events.wedding.calendarDate;
            time = D.events.wedding.calendarTime;
            location = D.wedding.fullVenue;
        } else if (key === 'haldiMehndi') {
            title = 'Haldi & Mehndi — ' + D.couple.bride.shortName + ' & ' + D.couple.groom.shortName;
            date = D.events.haldiMehndi.calendarDate;
            time = D.events.haldiMehndi.calendarTime;
            location = '';
        } else {
            return;
        }

        const endTime = addHoursToTime(time, 3);
        const ics =
            'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n' +
            'DTSTART:' + date + 'T' + time + '\r\n' +
            'DTEND:' + date + 'T' + endTime + '\r\n' +
            'SUMMARY:' + title + '\r\n' +
            (location ? 'LOCATION:' + location + '\r\n' : '') +
            'END:VEVENT\r\nEND:VCALENDAR';

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = key + '-anjali-adarsh.ics';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Saved to your calendar');
    }

    function addHoursToTime(hhmmss, hours) {
        const h = Math.min(parseInt(hhmmss.slice(0, 2), 10) + hours, 23);
        return String(h).padStart(2, '0') + hhmmss.slice(2);
    }

    function sendWhatsApp() {
        const phone = CFG.familyPhone;
        if (!phone) return;
        const msg = encodeURIComponent(
            'Namaste! I would like to confirm my attendance for Anjali & Adarsh\'s wedding on 28th June 2026. 🌸'
        );
        window.open('https://wa.me/' + phone + '?text=' + msg, '_blank');
    }

    function makeCall() {
        const phone = CFG.familyPhone;
        if (!phone) return;
        window.location.href = 'tel:+' + phone;
    }

    function updateCountdown() {
        const target = new Date(D.wedding.isoDate).getTime();
        const now = Date.now();
        let diff = target - now;
        const countdownEl = $('countdown');

        if (diff <= 0) {
            if (countdownEl && !countdownEl.classList.contains('is-today')) {
                countdownEl.classList.add('is-today');
                countdownEl.innerHTML =
                    '<p class="countdown-today-msg devanagari">॥ आज का दिन ॥</p>' +
                    '<p class="countdown-today-msg">Today we celebrate!</p>';
            }
            return;
        }

        diff = Math.max(0, diff);

        const days = Math.floor(diff / 86400000);
        diff %= 86400000;
        const hours = Math.floor(diff / 3600000);
        diff %= 3600000;
        const mins = Math.floor(diff / 60000);
        diff %= 60000;
        const secs = Math.floor(diff / 1000);

        setCountWithFlip('cdDays', String(days));
        setCountWithFlip('cdHours', String(hours).padStart(2, '0'));
        setCountWithFlip('cdMins', String(mins).padStart(2, '0'));
        setCountWithFlip('cdSecs', String(secs).padStart(2, '0'));

        if (secs !== lastSec) {
            lastSec = secs;
            document.querySelectorAll('.countdown-item').forEach(function (el) {
                el.classList.remove('tick');
                void el.offsetWidth;
                el.classList.add('tick');
            });
        }
    }

    function setCountWithFlip(id, val) {
        const el = $(id);
        if (el.textContent !== val) {
            el.textContent = val;
            el.classList.add('flip');
            setTimeout(function () { el.classList.remove('flip'); }, 400);
        }
    }

    function initRipples() {
        document.querySelectorAll('.ripple').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple-effect';
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                btn.appendChild(ripple);
                setTimeout(function () { ripple.remove(); }, 600);
            });
        });
    }

    function initTilt() {
        if (reducedMotion()) return;

        document.querySelectorAll('.tilt-card').forEach(function (card) {
            function onMove(e) {
                const rect = card.getBoundingClientRect();
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                const rotX = ((y - rect.height / 2) / rect.height) * -8;
                const rotY = ((x - rect.width / 2) / rect.width) * 8;
                card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.02)';
            }
            function reset() {
                card.style.transform = '';
            }
            card.addEventListener('mousemove', onMove);
            card.addEventListener('touchmove', onMove, { passive: true });
            card.addEventListener('mouseleave', reset);
            card.addEventListener('touchend', reset);
        });
    }

    function loadYouTubeAPI(callback) {
        if (window.YT && window.YT.Player) {
            callback();
            return;
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (prev) prev();
            callback();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
    }

    function initMusic() {
        loadYouTubeAPI(function () {
            ytPlayer = new YT.Player('musicFrame', {
                height: '1',
                width: '1',
                videoId: MUSIC_ID,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    playlist: MUSIC_ID,
                    controls: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    enablejsapi: 1,
                    rel: 0
                },
                events: {
                    onReady: function () {
                        ytReady = true;
                        musicStartRequested = true;
                        if (pendingMusicFromGesture || userGestureForMusic) {
                            playMusic({ muted: false });
                        } else {
                            playMusic({ muted: true });
                            attachMusicUnmuteOnInteraction();
                        }
                        startMusicRetryLoop();
                    },
                    onStateChange: function (event) {
                        if (event.data === YT.PlayerState.PLAYING) {
                            if (!musicPlaying) setMusicPlayingState(true);
                            if (pendingMusicFromGesture || userGestureForMusic) {
                                tryUnmuteMusic();
                            } else if (invitationOpened || (loader && loader.classList.contains('loader-revealed'))) {
                                attachMusicUnmuteOnInteraction();
                            }
                        }
                        if (event.data === YT.PlayerState.ENDED && ytPlayer && ytPlayer.seekTo) {
                            ytPlayer.seekTo(0, true);
                            ytPlayer.playVideo();
                        }
                    }
                }
            });
        });
    }

    function setMusicPlayingState(playing) {
        musicPlaying = playing;
        if (musicBtn) musicBtn.classList.toggle('active', playing);
    }

    function isYouTubePlaying() {
        if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function' || !window.YT) return false;
        const state = ytPlayer.getPlayerState();
        return state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING;
    }

    function playMusic(opts) {
        opts = opts || {};
        if (!ytReady || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return false;

        if (opts.muted) {
            if (ytPlayer.mute) ytPlayer.mute();
        } else {
            if (ytPlayer.unMute) ytPlayer.unMute();
            if (ytPlayer.setVolume) ytPlayer.setVolume(100);
        }

        ytPlayer.playVideo();
        return true;
    }

    function isMusicAudible() {
        if (!ytPlayer || !isYouTubePlaying()) return false;
        if (typeof ytPlayer.isMuted === 'function' && ytPlayer.isMuted()) return false;
        return true;
    }

    function unlockMusicFromGesture() {
        userGestureForMusic = true;
        pendingMusicFromGesture = true;
        musicStartRequested = true;

        if (ytReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
            playMusic({ muted: false });
            if (isYouTubePlaying()) setMusicPlayingState(true);
        }

        startMusicRetryLoop();
    }

    function attachOpeningTapForMusic(el) {
        if (!el) return;

        function onTap() {
            unlockMusicFromGesture();
        }

        el.addEventListener('pointerdown', onTap, { passive: true });
        el.addEventListener('touchstart', onTap, { passive: true });
    }

    function tryUnmuteMusic() {
        if (!ytReady || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return false;

        if (ytPlayer.unMute) ytPlayer.unMute();
        if (ytPlayer.setVolume) ytPlayer.setVolume(100);
        ytPlayer.playVideo();

        return isMusicAudible();
    }

    function beginInvitationMusic() {
        musicStartRequested = true;
        if (userGestureForMusic || pendingMusicFromGesture) {
            tryUnmuteMusic();
        }
        startMusicRetryLoop();
        if (!isMusicAudible()) attachMusicUnmuteOnInteraction();
    }

    function stopMusicRetryLoop() {
        if (musicRetryInterval) {
            clearInterval(musicRetryInterval);
            musicRetryInterval = null;
        }
    }

    function startMusicRetryLoop() {
        if (musicRetryInterval) return;
        musicRetryInterval = setInterval(function () {
            if (isMusicAudible()) {
                userGestureForMusic = true;
                setMusicPlayingState(true);
                stopMusicRetryLoop();
                return;
            }
            attemptBackgroundMusic();
            if (userGestureForMusic || pendingMusicFromGesture) tryUnmuteMusic();
        }, 600);
        setTimeout(stopMusicRetryLoop, 45000);
    }

    function attemptBackgroundMusic() {
        if (!musicStartRequested || isMusicAudible()) return;

        if (!ytReady || !ytPlayer || typeof ytPlayer.playVideo !== 'function') return;

        if (userGestureForMusic || pendingMusicFromGesture) {
            playMusic({ muted: false });
            if (isYouTubePlaying()) {
                setMusicPlayingState(true);
                stopMusicRetryLoop();
            }
            return;
        }

        playMusic({ muted: true });

        setTimeout(function () {
            if (isYouTubePlaying()) {
                setMusicPlayingState(true);
                if (!isMusicAudible()) attachMusicUnmuteOnInteraction();
            }
        }, 350);
    }

    function startBackgroundMusic(fromUserGesture) {
        if (fromUserGesture) unlockMusicFromGesture();
        else attemptBackgroundMusic();
    }

    function attachMusicUnmuteOnInteraction() {
        if (musicUnmuteListenersAttached || isMusicAudible()) return;
        musicUnmuteListenersAttached = true;

        function unmute() {
            unlockMusicFromGesture();
            if (isMusicAudible()) {
                setMusicPlayingState(true);
                stopMusicRetryLoop();
                document.removeEventListener('pointerdown', unmute, true);
                document.removeEventListener('touchstart', unmute, true);
                document.removeEventListener('click', unmute, true);
                document.removeEventListener('scroll', unmute, true);
                document.removeEventListener('keydown', unmute, true);
            }
        }

        document.addEventListener('pointerdown', unmute, { capture: true, passive: true });
        document.addEventListener('touchstart', unmute, { capture: true, passive: true });
        document.addEventListener('click', unmute, { passive: true });
        document.addEventListener('scroll', unmute, { passive: true });
        document.addEventListener('keydown', unmute, { passive: true });
    }

    function startMusic() {
        beginInvitationMusic();
    }

    function toggleMusic() {
        if (!ytPlayer || typeof ytPlayer.playVideo !== 'function') return;
        if (musicPlaying) {
            ytPlayer.pauseVideo();
            setMusicPlayingState(false);
        } else {
            unlockMusicFromGesture();
            if (isYouTubePlaying()) setMusicPlayingState(true);
        }
    }

    function openInvitation() {
        if (invitationOpened) return;
        invitationOpened = true;
        if (autoOpenTimer) {
            clearTimeout(autoOpenTimer);
            autoOpenTimer = null;
        }

        loader.classList.add('fade-out');
        main.classList.remove('hidden');
        dotNav.classList.remove('hidden');
        fabGroup.classList.remove('hidden');
        burstConfetti();
        burstConfetti();
        beginInvitationMusic();

        setTimeout(function () {
            beginInvitationMusic();
        }, 200);

        setTimeout(function () {
            loader.style.display = 'none';
            document.querySelectorAll('.reveal').forEach(function (el, i) {
                setTimeout(function () { el.classList.add('visible'); }, i * 120);
            });
            const prayerCard = document.querySelector('.vakratunda-card');
            if (prayerCard) prayerCard.classList.add('visible');
            animateEventCards();
            initRipples();
        }, 700);
    }

    function init() {
        initMusic();
        initGaneshaImages();
        animateNames();
        renderCouple();
        renderEvents();
        renderVenue();
        renderRsvp();
        updateCountdown();
        setInterval(updateCountdown, 1000);

        initSparkles();
        initFireflies();
        initParallax();
        initCurtains();
        initReveal();
        initDotNav();
        initRipples();
        setTimeout(initTilt, 800);

        $('mapBtn').addEventListener('click', openMap);
        $('venueCalBtn').addEventListener('click', function () { addToCalendar('wedding'); });
        musicBtn.addEventListener('click', toggleMusic);
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function () {
            if (!scrollTopBtn) return;
            scrollTopBtn.classList.toggle('fab-hidden', window.scrollY < 320);
        }, { passive: true });

        initFooterBlessings();
        initGlobalHeartClicks();
        initScrollProgress();
        initScrollHint();
        initShare();
        initCoupleHeart();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
