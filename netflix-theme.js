/**
 * Netflix Theme Plugin for Lampa
 * Full main page remake in Netflix style
 * Without Hero section
 */

(function () {
    'use strict';

    function startPlugin() {
        window.plugin_netflix_theme_ready = true;

        var cssUrl = 'https://superkeka.github.io/lampix/netflix.css';
        var linkId = 'netflix-theme-style';

        var defaultSettings = {
            enabled: false,
            header_style: true,
            hero_enabled: true,
            hide_anime_in_hero: true,
            video_enabled: false
        };

        function getSettings() {
            var saved = localStorage.getItem('netflix_theme_settings');
            if (saved) {
                try {
                    var parsed = JSON.parse(saved);
                    if (parsed.header_style === undefined) {
                        parsed.header_style = true;
                    }
                    if (parsed.hero_enabled === undefined) {
                        parsed.hero_enabled = true;
                    }
                    if (parsed.hide_anime_in_hero === undefined) {
                        parsed.hide_anime_in_hero = true;
                    }
                    if (parsed.video_enabled === undefined) {
                        parsed.video_enabled = false;
                    }
                    return parsed;
                } catch (e) { }
            }
            return defaultSettings;
        }

        function saveSettings(settings) {
            localStorage.setItem('netflix_theme_settings', JSON.stringify(settings));
        }

        // === NEW FUNCTIONS FOR TEXT TABS ===

        // Create container with text tabs
        function createHeaderTabs() {
            // Check that tabs are not created yet
            if (document.querySelector('.netflix-header-tabs')) return;

            // Get language for localization
            var lang = (typeof Lampa !== 'undefined' && Lampa.Storage) ?
                Lampa.Storage.get('language', 'en') : 'en';

            var labels = {
                'ru': { settings: 'Настройки', notifications: 'Уведомления' },
                'en': { settings: 'Settings', notifications: 'Notifications' },
                'uk': { settings: 'Налаштування', notifications: 'Сповіщення' }
            };
            var texts = labels[lang] || labels['en'];

            // Create container
            var container = document.createElement('div');
            container.className = 'netflix-header-tabs';
            container.innerHTML =
                '<svg class="netflix-search-icon selector" data-action="search" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="11" cy="11" r="8"/>' +
                '<path d="M21 21l-4.35-4.35"/>' +
                '</svg>' +
                '<div class="netflix-header-tab selector" data-action="notifications">' + texts.notifications + '</div>' +
                '<div class="netflix-header-tab selector" data-action="settings">' + texts.settings + '</div>';

            // Insert into header (after title, before actions)
            var headBody = document.querySelector('.head__body');
            var actions = document.querySelector('.head__actions');
            if (headBody && actions) {
                headBody.insertBefore(container, actions);
            }

            // Attach handlers
            attachHeaderTabHandlers();
        }

        // Attach actions to tabs (with namespace for cleanup)
        function attachHeaderTabHandlers() {
            var tabs = document.querySelectorAll('.netflix-header-tab');
            var searchIcon = document.querySelector('.netflix-search-icon');

            // Handle tabs
            tabs.forEach(function (tab) {
                var action = tab.getAttribute('data-action');

                // Handle via hover:enter (for TV navigation) with namespace
                if (typeof $ !== 'undefined') {
                    $(tab).on('hover:enter.netflix-theme', function () {
                        triggerAction(action);
                    });
                }

                // Handle mouse clicks with namespace
                tab.addEventListener('click', function tabClickHandler(e) {
                    triggerAction(action);
                });
            });

            // Handle search icon
            if (searchIcon) {
                var action = searchIcon.getAttribute('data-action');

                if (typeof $ !== 'undefined') {
                    $(searchIcon).on('hover:enter.netflix-theme', function () {
                        triggerAction(action);
                    });
                }

                searchIcon.addEventListener('click', function searchClickHandler(e) {
                    triggerAction(action);
                });
            }
        }

        // Cleanup tab handlers
        function cleanupHeaderTabHandlers() {
            if (typeof $ !== 'undefined') {
                $('.netflix-header-tab').off('.netflix-theme');
                $('.netflix-search-icon').off('.netflix-theme');
            }
        }

        // Trigger action (search/settings/notifications)
        function triggerAction(action) {
            var icon = null;

            if (action === 'search') {
                icon = document.querySelector('.head__action.open--search');
            } else if (action === 'settings') {
                icon = document.querySelector('.head__action.open--settings');
            } else if (action === 'notifications') {
                icon = document.querySelector('.head__action.notice--icon');
            }

            // Trigger event via jQuery (for Lampa compatibility)
            if (icon && typeof $ !== 'undefined') {
                $(icon).trigger('hover:enter');
            } else if (icon) {
                icon.click();
            }
        }

        // Hide original icons
        function hideHeaderIcons() {
            var selectors = [
                '.head__action.open--search',
                '.head__action.open--settings',
                '.head__action.notice--icon'
            ];

            selectors.forEach(function (selector) {
                var elem = document.querySelector(selector);
                if (elem) {
                    elem.style.display = 'none';
                }
            });
        }

        // Show original icons (when theme is disabled)
        function showHeaderIcons() {
            var selectors = [
                '.head__action.open--search',
                '.head__action.open--settings',
                '.head__action.notice--icon'
            ];

            selectors.forEach(function (selector) {
                var elem = document.querySelector(selector);
                if (elem) {
                    elem.style.display = '';
                }
            });
        }

        // Remove tabs
        function removeHeaderTabs() {
            cleanupHeaderTabHandlers();
            var container = document.querySelector('.netflix-header-tabs');
            if (container) {
                container.remove();
            }
        }

        // === END OF NEW FUNCTIONS ===

        // Apply/remove header style
        function toggleHeaderStyle(enabled) {
            var headStyle = document.getElementById('netflix-header-style');
            if (enabled) {
                if (!headStyle) {
                    headStyle = document.createElement('style');
                    headStyle.id = 'netflix-header-style';
                    headStyle.textContent = getHeaderStyles();
                    document.head.appendChild(headStyle);
                }
                // Show logo
                showLLogo();

                // NEW: Add text tabs - wait for app ready on TV
                function initHeaderTabs() {
                    requestAnimationFrame(function () {
                        createHeaderTabs();
                        hideHeaderIcons();
                    });
                }

                if (window.appready) {
                    initHeaderTabs();
                } else if (typeof Lampa !== 'undefined' && Lampa.Listener) {
                    Lampa.Listener.follow('app', function (e) {
                        if (e.type == 'ready') {
                            initHeaderTabs();
                        }
                    });
                } else {
                    // Fallback for edge cases
                    setTimeout(initHeaderTabs, 1000);
                }

            } else {
                if (headStyle) {
                    headStyle.remove();
                }
                hideLLogo();

                // NEW: Remove tabs and restore icons
                removeHeaderTabs();
                showHeaderIcons();
            }
        }

        // Show/hide Netflix N logo
        var logoObserver = null;
        var logoFallbackInterval = null;

        function updateLogo() {
            var logo = document.querySelector('.head__logo-icon');
            if (logo && logo.getAttribute('data-netflix-logo') !== 'true') {
                logo.setAttribute('data-netflix-logo', 'true');
                logo.style.display = 'flex';
                // Netflix-style L logo
                logo.innerHTML = '<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                    '<defs>' +
                    '<linearGradient id="netflixGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
                    '<stop offset="0%" style="stop-color:#E50914;stop-opacity:1" />' +
                    '<stop offset="100%" style="stop-color:#B20710;stop-opacity:1" />' +
                    '</linearGradient>' +
                    '</defs>' +
                    '<rect x="2" y="3" width="5" height="22" fill="url(#netflixGrad)" rx="0.5"/>' +
                    '<rect x="2" y="20" width="16" height="5" fill="url(#netflixGrad)" rx="0.5"/>' +
                    '</svg>';
            }
        }

        function showLLogo() {
            // Update logo immediately
            updateLogo();

            // Hybrid approach: MutationObserver + rare fallback interval
            if (logoObserver) logoObserver.disconnect();
            if (logoFallbackInterval) clearInterval(logoFallbackInterval);

            var headBody = document.querySelector('.head__body');
            if (headBody && typeof MutationObserver !== 'undefined') {
                // MutationObserver for fast reaction to changes
                logoObserver = new MutationObserver(function (mutations) {
                    // Check that changes are not from us
                    var needsUpdate = false;
                    mutations.forEach(function (mutation) {
                        if (mutation.type === 'childList' ||
                            (mutation.type === 'attributes' && mutation.target.classList.contains('head__logo-icon'))) {
                            needsUpdate = true;
                        }
                    });
                    if (needsUpdate) updateLogo();
                });

                logoObserver.observe(headBody, {
                    childList: true,
                    subtree: true
                });
            }

            // Fallback: check every 10 seconds (redundant now with CSS but keeps it robust)
            logoFallbackInterval = setInterval(updateLogo, 10000);
        }

        function hideLLogo() {
            // Stop observer and interval
            if (logoObserver) {
                logoObserver.disconnect();
                logoObserver = null;
            }
            if (logoFallbackInterval) {
                clearInterval(logoFallbackInterval);
                logoFallbackInterval = null;
            }

            var logo = document.querySelector('.head__logo-icon');
            if (logo) {
                logo.removeAttribute('data-netflix-logo');
                logo.style.display = 'none';
            }
        }

        // Remove logo completely
        function removeLLogo() {
            // Nothing to remove, we just hide the original
        }

        function getHeaderStyles() {
            return `
                /* Netflix Header Style */
                .head {
                    background-color: transparent !important;
                }
                .head__body {
                    background-color: transparent !important;
                }
                .head__time,
                .head__action.full--screen {
                    display: none !important;
                }
                .head__markers,
                .head__backward,
                .head__menu-icon,
                .head__title,
                .head__settings,
                .head__time,
                .new-year__button {
                    display: none !important;
                }
                /* Show Netflix N logo in theme mode */
                .head__logo-icon {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    width: 30px !important;
                    min-width: 30px !important;
                    height: 40px !important;
                    padding: 0 !important;
                    position: relative !important;
                    margin-right: 20px !important;
                }
                /* Hide original logo content */
                .head__logo-icon > span,
                .head__logo-icon > img {
                    display: none !important;
                }
                /* Show our Netflix SVG via pseudo-element for instant load */
                .head__logo-icon::before {
                    content: '';
                    display: block;
                    width: 26px;
                    height: 34px;
                    background-image: url("data:image/svg+xml,%3Csvg width='20' height='28' viewBox='0 0 20 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='netflixGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23E50914;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23B20710;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='2' y='3' width='5' height='22' fill='url(%23netflixGrad)' rx='0.5'/%3E%3Crect x='2' y='20' width='16' height='5' fill='url(%23netflixGrad)' rx='0.5'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: contain;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
                }
                /* Hide JS-injected SVG to avoid duplication */
                .head__logo-icon > svg {
                    display: none !important;
                }
                .head__actions {
                    margin-left: auto !important;
                }
                /* Hide original header icons - CSS fallback for TV */
                .head__action.open--search,
                .head__action.open--settings,
                .head__action.notice--icon {
                    display: none !important;
                }
                /* Hide garland (snow) in Netflix mode */
                .garland {
                    display: none !important;
                }
            `;
        }

        function enableTheme() {
            var settings = getSettings();
            settings.enabled = true;
            saveSettings(settings);

            var old = document.getElementById(linkId);
            if (old) old.remove();

            var link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = cssUrl;
            document.head.appendChild(link);

            injectNetflixStyles();

            if (settings.header_style) {
                toggleHeaderStyle(true);
            }

            // Initialize Hero after UI is ready
            if (settings.hero_enabled) {
                setTimeout(function () {
                    initHeroRow();
                }, 500);
            }

            console.log('Netflix Theme: ON');
        }

        function disableTheme() {
            var settings = getSettings();
            settings.enabled = false;
            saveSettings(settings);

            var old = document.getElementById(linkId);
            if (old) old.remove();

            removeNetflixStyles();

            toggleHeaderStyle(false);
            removeLLogo();

            // Cleanup all event handlers
            cleanupHeaderTabHandlers();
            cleanupHeroHandlers();

            // Remove Hero when theme is disabled
            // ContentRows uses localStorage for enabling/disabling
            if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                Lampa.Storage.set('content_rows_netflix_hero', 'false');
            }

            console.log('Netflix Theme: OFF');
        }

        function toggleTheme() {
            var settings = getSettings();
            if (settings.enabled) {
                disableTheme();
            } else {
                enableTheme();
            }
            return settings.enabled;
        }

        // Additional styles for Netflix UI
        function injectNetflixStyles() {
            var style = document.createElement('style');
            style.id = 'netflix-theme-extra';
            style.textContent = getNetflixExtraStyles();
            document.head.appendChild(style);
        }

        function removeNetflixStyles() {
            var extra = document.getElementById('netflix-theme-extra');
            if (extra) extra.remove();
        }

        // Additional CSS styles (WITHOUT Hero)
        function getNetflixExtraStyles() {
            return `
                /* Hide scrollbar but keep functionality */
                .scroll--vertical::-webkit-scrollbar {
                    width: 6px;
                }

                .scroll--vertical::-webkit-scrollbar-track {
                    background: transparent;
                }

                .scroll--vertical::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 3px;
                }

                /* ========== HERO CAROUSEL ========== */
                .items-line[data-row-name="netflix_hero"] .items-cards {
                    scroll-behavior: auto !important;
                    scrollbar-width: none !important;
                }
                .items-line[data-row-name="netflix_hero"] .items-cards::-webkit-scrollbar {
                    display: none !important;
                }
                .items-line[data-row-name="netflix_hero"] .items-cards-arrow {
                    display: none !important;
                }

                /* Hero focus: ONLY red bottom border */
                .items-line[data-row-name="netflix_hero"] .card--wide.focus {
                    outline: none !important;
                    box-shadow: none !important;
                    border: none !important;
                    border-bottom: 4px solid #E50914 !important;
                }
                .items-line[data-row-name="netflix_hero"] .card--wide.focus .card__view {
                    outline: none !important;
                    box-shadow: none !important;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .items-line__title {
                        font-size: 1.1em !important;
                    }

                    .items-line {
                        margin-bottom: 30px !important;
                        padding: 0 3%;
                    }
                }
            `;
        }

        // ==================== HERO SECTION ====================

        // Global variable to store Hero items IDs
        var heroItemsData = [];
        // Track used IDs to avoid duplicates in infinite scroll
        var heroUsedIds = new Set();
        // Loading state
        var heroIsLoading = false;
        // Current page for loading more
        var heroCurrentPage = 1;

        // Performance: Debounce utility
        function debounce(func, wait) {
            var timeout;
            return function () {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    func.apply(context, args);
                }, wait);
            };
        }

        // Performance: Singleton Trailer Manager using YT.Player API (like Lampa)
        var TrailerManager = {
            player: null,           // YT.Player instance
            playerContainer: null,  // Container div for player
            currentCard: null,
            timer: null,
            isPlaying: false,
            currentKey: null,
            cache: {},
            blockedVideos: {},
            playerId: 'netflix-hero-yt-player',

            // Check if YouTube API is available (loaded in index.html for Tizen/WebOS)
            isYTAvailable: function () {
                return typeof YT !== 'undefined' && typeof YT.Player !== 'undefined';
            },

            init: function () {
                // Nothing to pre-init, player created on demand
            },

            createPlayerContainer: function (cardView) {
                // Remove existing container if any
                var existing = document.getElementById(this.playerId);
                if (existing) existing.remove();

                // Create container div for YT.Player (styles applied via CSS)
                // visibility: hidden prevents any flash/artifacts during init
                var container = document.createElement('div');
                container.id = this.playerId;
                container.className = 'hero-trailer-video';
                container.style.cssText = 'opacity: 0; visibility: hidden; transition: opacity 0.5s ease, visibility 0s 0.5s; overflow: hidden;';

                cardView.appendChild(container);
                this.playerContainer = container;

                // Add styles ONLY for YouTube player container - no global .card--wide styles
                if (!document.getElementById('netflix-hero-yt-styles')) {
                    var style = document.createElement('style');
                    style.id = 'netflix-hero-yt-styles';
                    style.textContent = [
                        // YouTube container only
                        '#' + this.playerId + ' { position: absolute !important; top: 50% !important; left: 50% !important; width: 200% !important; height: 200% !important; transform: translate(-50%, -50%) !important; pointer-events: none !important; z-index: 1 !important; background: transparent !important; }',
                        '#' + this.playerId + ' iframe { width: 100% !important; height: 100% !important; border: none !important; pointer-events: none !important; outline: none !important; background: transparent !important; }',
                        '#' + this.playerId + ' * { border: none !important; outline: none !important; background: transparent !important; }'
                    ].join('\n');
                    document.head.appendChild(style);
                }

                return container;
            },

            markAsBlocked: function () {
                if (this.currentKey) {
                    this.blockedVideos[this.currentKey] = true;
                    console.log('Netflix Hero Trailer: Marked as blocked:', this.currentKey);
                }
                if (this.currentCard) {
                    this.hide(this.currentCard);
                }
            },

            // Check if video is available via YouTube oEmbed API
            checkVideoAvailable: function (key, onSuccess, onError) {
                var url = 'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=' + key + '&format=json';

                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.timeout = 3000;

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        console.log('Netflix Hero Trailer: Video available:', key);
                        onSuccess();
                    } else {
                        console.warn('Netflix Hero Trailer: Video unavailable (status ' + xhr.status + '):', key);
                        onError();
                    }
                };

                xhr.onerror = function () {
                    console.warn('Netflix Hero Trailer: oEmbed request failed:', key);
                    onError();
                };

                xhr.ontimeout = function () {
                    console.warn('Netflix Hero Trailer: oEmbed request timeout:', key);
                    onSuccess(); // On timeout, assume available
                };

                xhr.send();
            },

            load: function (card, itemId, mediaType) {
                var _this = this;

                if (this.timer) clearTimeout(this.timer);

                console.log('Netflix Hero Trailer: Loading for', itemId, mediaType);

                if (this.cache[itemId]) {
                    console.log('Netflix Hero Trailer: Using cached key', this.cache[itemId]);
                    this.show(card, this.cache[itemId]);
                    return;
                }

                if (typeof Lampa === 'undefined' || typeof Lampa.Api === 'undefined') {
                    console.warn('Netflix Hero Trailer: Lampa.Api not available');
                    return;
                }

                Lampa.Api.sources.tmdb.videos({
                    id: itemId,
                    method: mediaType
                }, function (data) {
                    console.log('Netflix Hero Trailer: API response', data);

                    if (data && data.results && data.results.length > 0) {
                        var trailer = data.results.find(function (v) {
                            return v.type === 'Trailer' && v.site === 'YouTube' && v.official;
                        }) || data.results.find(function (v) {
                            return v.type === 'Trailer' && v.site === 'YouTube';
                        }) || data.results.find(function (v) {
                            return v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip');
                        });

                        if (trailer && trailer.key) {
                            console.log('Netflix Hero Trailer: Found', trailer.type, trailer.name, trailer.key);
                            _this.cache[itemId] = trailer.key;
                            if (_this.currentCard === card) {
                                _this.show(card, trailer.key);
                            }
                        } else {
                            console.log('Netflix Hero Trailer: No suitable video found in', data.results.length, 'results');
                        }
                    } else {
                        console.log('Netflix Hero Trailer: No videos returned for', itemId);
                    }
                }, function (error) {
                    console.error('Netflix Hero Trailer: API error for', itemId, error);
                });
            },

            show: function (card, key) {
                var _this = this;

                console.log('Netflix Hero Trailer: show() called with key', key, 'card focused:', card.classList.contains('focus'));

                if (this.blockedVideos[key]) {
                    console.log('Netflix Hero Trailer: Video known to be blocked, skipping:', key);
                    return;
                }

                if (!card.classList.contains('focus')) {
                    console.log('Netflix Hero Trailer: Card not focused, aborting');
                    return;
                }

                this.currentKey = key;
                if (this.timer) clearTimeout(this.timer);

                this.checkVideoAvailable(key, function () {
                    _this.showVideo(card, key);
                }, function () {
                    _this.blockedVideos[key] = true;
                    console.log('Netflix Hero Trailer: Video blocked, staying on poster');
                });
            },

            showVideo: function (card, key) {
                var _this = this;

                if (!card.classList.contains('focus') || this.currentKey !== key) {
                    console.log('Netflix Hero Trailer: Conditions changed, aborting show');
                    return;
                }

                // Check if YouTube API is available
                if (!this.isYTAvailable()) {
                    console.warn('Netflix Hero Trailer: YouTube API not available (YT.Player undefined)');
                    return;
                }

                var cardView = card.querySelector('.card__view');
                if (!cardView) {
                    console.warn('Netflix Hero Trailer: No .card__view found');
                    return;
                }

                // Destroy previous player if exists
                if (this.player) {
                    try {
                        this.player.destroy();
                    } catch (e) {
                        console.warn('Netflix Hero Trailer: Error destroying player', e);
                    }
                    this.player = null;
                }

                // Create new container in this card
                this.createPlayerContainer(cardView);

                this.isPlaying = false;

                console.log('Netflix Hero Trailer: Creating YT.Player for', key);

                // Get container dimensions
                var containerWidth = cardView.offsetWidth || 800;
                var containerHeight = cardView.offsetHeight || 450;

                // Create YT.Player like Lampa does
                this.player = new YT.Player(this.playerId, {
                    width: containerWidth * 1.78,  // 177.77% for zoom effect
                    height: containerHeight * 1.78,
                    videoId: key,
                    playerVars: {
                        'autoplay': 1,
                        'mute': 1,
                        'controls': 0,          // Hide controls
                        'showinfo': 0,          // Hide title (deprecated but still helps)
                        'modestbranding': 1,    // Minimal YouTube branding
                        'disablekb': 1,         // Disable keyboard
                        'fs': 0,                // Disable fullscreen button
                        'enablejsapi': 1,       // Enable JS API
                        'playsinline': 1,       // Play inline on mobile
                        'rel': 0,               // No related videos at end
                        'loop': 1,              // Loop video
                        'playlist': key,        // Required for loop
                        'start': 5,             // Skip intro
                        'iv_load_policy': 3,    // Hide annotations
                        'cc_load_policy': 0,    // Hide captions
                        'autohide': 1           // Auto-hide controls
                    },
                    events: {
                        onReady: function (event) {
                            console.log('Netflix Hero Trailer: YT.Player ready');

                            // Update container reference - YT.Player replaces div with iframe
                            try {
                                var iframe = event.target.getIframe();
                                if (iframe) {
                                    _this.playerContainer = iframe;
                                    // Minimal styles - main styling via CSS #netflix-hero-yt-styles
                                    iframe.style.opacity = '0';
                                    iframe.style.transition = 'opacity 0.5s ease';
                                    iframe.style.border = 'none';
                                }
                            } catch (e) {
                                console.warn('Netflix Hero Trailer: Could not get iframe', e);
                            }

                            event.target.setVolume(0);
                            event.target.playVideo();
                        },
                        onStateChange: function (event) {
                            console.log('Netflix Hero Trailer: State changed to', event.data);

                            // YT.PlayerState.PLAYING = 1
                            if (event.data === 1) {
                                console.log('Netflix Hero Trailer: Video playing!');
                                _this.isPlaying = true;

                                // Show the iframe - visibility first, then opacity
                                try {
                                    var iframe = event.target.getIframe();
                                    if (iframe) {
                                        iframe.style.visibility = 'visible';
                                        iframe.style.transition = 'opacity 0.5s ease';
                                        iframe.style.opacity = '1';
                                    }
                                } catch (e) {}

                                // Also show container
                                if (_this.playerContainer) {
                                    _this.playerContainer.style.visibility = 'visible';
                                    _this.playerContainer.style.transition = 'opacity 0.5s ease';
                                    _this.playerContainer.style.opacity = '1';
                                }

                                // Fade out backdrop image to show video behind
                                var backdrop = card.querySelector('.card__img');
                                if (backdrop) backdrop.style.opacity = '0';
                            }

                            // YT.PlayerState.ENDED = 0
                            if (event.data === 0) {
                                console.log('Netflix Hero Trailer: Video ended');
                                // Loop should handle this, but just in case
                                try {
                                    event.target.seekTo(5);
                                    event.target.playVideo();
                                } catch (e) {}
                            }
                        },
                        onError: function (event) {
                            console.error('Netflix Hero Trailer: YT.Player error', event.data);
                            // Error codes: 2 = invalid ID, 5 = HTML5 error, 100 = not found, 101/150 = embedding disabled
                            _this.markAsBlocked();
                        }
                    }
                });
            },

            hide: function (card) {
                // Completely destroy player to stop video and remove all artifacts
                if (this.player) {
                    try {
                        this.player.destroy();
                    } catch (e) {}
                    this.player = null;
                }

                // Remove container completely
                if (this.playerContainer) {
                    this.playerContainer.remove();
                    this.playerContainer = null;
                }

                // Also remove by ID (in case reference was lost)
                var existing = document.getElementById(this.playerId);
                if (existing) existing.remove();

                // Restore backdrop
                if (card) {
                    var backdrop = card.querySelector('.card__img');
                    if (backdrop) backdrop.style.opacity = '1';
                }

                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }
                this.isPlaying = false;
                this.currentKey = null;
                this.currentCard = null;
            },

            destroy: function () {
                // Use hide() to clean up everything
                this.hide(this.currentCard);

                // Also remove styles
                var styles = document.getElementById('netflix-hero-yt-styles');
                if (styles) styles.remove();
            },

            schedule: function (card, index) {
                var _this = this;

                console.log('Netflix Hero Trailer: schedule() called, index:', index, 'video_enabled:', getSettings().video_enabled);

                if (this.currentCard === card) {
                    console.log('Netflix Hero Trailer: Same card, skipping');
                    return;
                }

                if (this.currentCard) {
                    this.hide(this.currentCard);
                }

                this.currentCard = card;

                if (this.timer) clearTimeout(this.timer);

                if (!getSettings().video_enabled) {
                    console.log('Netflix Hero Trailer: Video disabled in settings');
                    return;
                }

                // Check if YT API is available before scheduling
                if (!this.isYTAvailable()) {
                    console.warn('Netflix Hero Trailer: YouTube API not loaded, video disabled');
                    return;
                }

                console.log('Netflix Hero Trailer: Will load in 2 seconds...');

                this.timer = setTimeout(function () {
                    if (heroItemsData[index]) {
                        _this.load(card, heroItemsData[index].id, heroItemsData[index].type);
                    } else {
                        console.warn('Netflix Hero Trailer: No heroItemsData for index', index);
                    }
                }, 2000);
            }
        };

        // Hero via standard ContentRows API (one wide element)
        function initHeroRow() {
            if (typeof Lampa === 'undefined' || typeof Lampa.ContentRows === 'undefined') return;

            Lampa.ContentRows.add({
                name: 'netflix_hero',
                title: 'NETFLIX HERO',
                index: 0,
                screen: ['main'],
                call: function (params, screen) {
                    return function (call) {
                        if (typeof Lampa.Api === 'undefined') {
                            call({ results: [] });
                            return;
                        }

                        var mediaType = Math.random() > 0.5 ? 'movie' : 'tv';
                        var endpoint = 'trending/' + mediaType + '/day';

                        Lampa.Api.sources.tmdb.get(endpoint, {}, function (json) {
                            if (!json || !json.results || json.results.length === 0) {
                                call({ results: [] });
                                return;
                            }

                            // Get anime hiding setting
                            var settings = getSettings();
                            var hideAnime = settings.hide_anime_in_hero;

                            // Filter items
                            var validItems = json.results.filter(function (item) {
                                var hasAnimationGenre = item.genre_ids && item.genre_ids.indexOf(16) !== -1;

                                // If has Animation genre - it's anime, filter it out
                                var isAnime = hideAnime && hasAnimationGenre;

                                return !isAnime && item.backdrop_path && item.overview && item.overview.length > 0 && item.vote_average >= 6.5;
                            });

                            if (validItems.length === 0) {
                                call({ results: [] });
                                return;
                            }

                            // Sort by rating (descending)
                            validItems.sort(function (a, b) {
                                return (b.vote_average || 0) - (a.vote_average || 0);
                            });

                            // Optimization: Pick 3 items directly
                            var count = Math.min(3, validItems.length);
                            var topItems = validItems.slice(0, 10);
                            var heroItems = [];

                            // Pick unique random
                            var indices = new Set();
                            while (indices.size < count) {
                                indices.add(Math.floor(Math.random() * Math.min(topItems.length, 10)));
                            }

                            indices.forEach(function (idx) {
                                var item = topItems[idx];
                                item.media_type = mediaType;
                                heroItems.push(item);
                            });

                            console.log('Netflix Hero: Selected ' + heroItems.length + ' items');

                            // Parallel loading
                            var promises = heroItems.map(function (heroItem) {
                                return new Promise(function (resolve) {
                                    Lampa.Api.full({
                                        id: heroItem.id,
                                        method: mediaType,
                                        source: 'tmdb'
                                    }, function (response) {
                                        // Lampa.Api.full returns { movie: {...} } or { tv: {...} }
                                        var fullData = response.movie || response.tv || response;

                                        // Merge data
                                        fullData.media_type = mediaType;
                                        fullData.params = { style: { name: 'wide' } };

                                        if (!fullData.title && !fullData.name) fullData.title = heroItem.title || heroItem.name || 'Unknown';
                                        if (!fullData.overview) fullData.overview = heroItem.overview || '';
                                        if (!fullData.backdrop_path) fullData.backdrop_path = heroItem.backdrop_path || fullData.poster_path;

                                        // Ensure we have ID (fallback to heroItem.id)
                                        var itemId = fullData.id || heroItem.id;

                                        if (fullData.backdrop_path) {
                                            fullData.img = Lampa.Api.img(fullData.backdrop_path, 'original');
                                        }

                                        console.log('Netflix Hero: Full data loaded for', itemId, fullData.title || fullData.name);

                                        resolve({
                                            clickData: { id: itemId, type: mediaType, data: fullData },
                                            renderData: fullData
                                        });
                                    }, function () {
                                        // Fallback to basic data
                                        heroItem.params = { style: { name: 'wide' } };
                                        if (heroItem.backdrop_path) heroItem.img = Lampa.Api.img(heroItem.backdrop_path, 'original');

                                        console.log('Netflix Hero: Using fallback data for', heroItem.id);

                                        resolve({
                                            clickData: { id: heroItem.id, type: mediaType, data: heroItem },
                                            renderData: heroItem
                                        });
                                    });
                                });
                            });

                            Promise.all(promises).then(function (results) {
                                heroItemsData = results.map(function (r) { return r.clickData; });
                                var processedItems = results.map(function (r) { return r.renderData; });

                                // Track used IDs for infinite scroll
                                heroUsedIds.clear();
                                heroItemsData.forEach(function (item) {
                                    heroUsedIds.add(item.id);
                                });

                                console.log('Netflix Hero: heroItemsData populated:', heroItemsData.map(function(item) {
                                    return { id: item.id, type: item.type };
                                }));

                                call({
                                    title: 'NETFLIX HERO',
                                    results: processedItems
                                });

                                // Use requestAnimationFrame for UI update markup
                                requestAnimationFrame(markHeroRow);
                            });

                        }, function () {
                            call({ results: [] });
                        });
                    };
                }
            });
        }

        // Add data-row-name to Hero row
        function markHeroRow() {
            // Optimization: select only what we need or check if already marked
            var title = null;
            // Most likely it's one of the first few lines
            var lines = document.querySelectorAll('.items-line:not([data-row-name])');

            for (var i = 0; i < lines.length && i < 5; i++) {
                title = lines[i].querySelector('.items-line__title');
                if (title && title.textContent.indexOf('NETFLIX HERO') !== -1) {
                    lines[i].setAttribute('data-row-name', 'netflix_hero');
                    lines[i].classList.add('netflix-hero');
                    console.log('Netflix Hero: marked row with data-row-name and class');

                    // Load logos, network logos, dots and attach focus handlers
                    setTimeout(function () {
                        loadHeroLogos();
                        loadNetworkLogos();
                        createHeroDots();
                        attachHeroFocusHandlers();
                    }, 500);
                    break;
                }
            }
        }

        // Load more hero items and REPLACE existing cards
        function loadMoreHeroItems(callback) {
            if (heroIsLoading) return;
            heroIsLoading = true;

            console.log('Netflix Hero: Loading new items to replace...');

            var mediaType = Math.random() > 0.5 ? 'movie' : 'tv';
            heroCurrentPage++;

            Lampa.Api.sources.tmdb.get('trending/' + mediaType + '/day', { page: heroCurrentPage }, function (json) {
                if (!json || !json.results || json.results.length === 0) {
                    heroIsLoading = false;
                    return;
                }

                var settings = getSettings();
                var hideAnime = settings.hide_anime_in_hero;

                // Filter and exclude already used IDs
                var validItems = json.results.filter(function (item) {
                    if (heroUsedIds.has(item.id)) return false;
                    var hasAnimationGenre = item.genre_ids && item.genre_ids.indexOf(16) !== -1;
                    var isAnime = hideAnime && hasAnimationGenre;
                    return !isAnime && item.backdrop_path && item.overview && item.overview.length > 0 && item.vote_average >= 6.5;
                });

                if (validItems.length < 3) {
                    // Not enough items, try next page
                    heroIsLoading = false;
                    heroCurrentPage++;
                    loadMoreHeroItems(callback);
                    return;
                }

                // Pick 3 random items
                var newItems = [];
                var shuffled = validItems.sort(function () { return 0.5 - Math.random(); });

                for (var i = 0; i < 3; i++) {
                    var item = shuffled[i];
                    item.media_type = mediaType;
                    heroUsedIds.add(item.id);
                    newItems.push(item);
                }

                // Load full data for each item
                var promises = newItems.map(function (heroItem) {
                    return new Promise(function (resolve) {
                        Lampa.Api.full({
                            id: heroItem.id,
                            method: mediaType,
                            source: 'tmdb'
                        }, function (response) {
                            var fullData = response.movie || response.tv || response;
                            fullData.media_type = mediaType;
                            fullData.params = { style: { name: 'wide' } };
                            if (!fullData.title && !fullData.name) fullData.title = heroItem.title || heroItem.name || 'Unknown';
                            if (!fullData.overview) fullData.overview = heroItem.overview || '';
                            if (!fullData.backdrop_path) fullData.backdrop_path = heroItem.backdrop_path;
                            if (fullData.backdrop_path) {
                                fullData.img = Lampa.Api.img(fullData.backdrop_path, 'original');
                            }
                            resolve({
                                clickData: { id: fullData.id || heroItem.id, type: mediaType, data: fullData },
                                renderData: fullData
                            });
                        }, function () {
                            heroItem.params = { style: { name: 'wide' } };
                            if (heroItem.backdrop_path) heroItem.img = Lampa.Api.img(heroItem.backdrop_path, 'original');
                            resolve({
                                clickData: { id: heroItem.id, type: mediaType, data: heroItem },
                                renderData: heroItem
                            });
                        });
                    });
                });

                Promise.all(promises).then(function (results) {
                    // REPLACE heroItemsData (not append)
                    heroItemsData = results.map(function (r) { return r.clickData; });

                    // Get existing cards
                    var cardsContainer = document.querySelector('.items-line[data-row-name="netflix_hero"] .items-cards');
                    if (!cardsContainer) {
                        heroIsLoading = false;
                        return;
                    }

                    var existingCards = cardsContainer.querySelectorAll('.card--wide');

                    // Update each card's content (replace innerHTML)
                    results.forEach(function (r, idx) {
                        if (existingCards[idx]) {
                            updateHeroCard(existingCards[idx], r.renderData, idx);
                        }
                    });

                    console.log('Netflix Hero: Replaced with ' + results.length + ' new items');

                    // Reload handlers and logos
                    setTimeout(function () {
                        reattachHeroFocusHandlers();
                        loadHeroLogos();
                        loadNetworkLogos();
                        heroIsLoading = false;

                        // Focus first card after replacement
                        var firstCard = cardsContainer.querySelector('.card--wide');
                        if (firstCard && typeof Lampa !== 'undefined') {
                            Lampa.Controller.focus(firstCard);
                        }

                        if (callback) callback();
                    }, 100);
                });

            }, function () {
                heroIsLoading = false;
            });
        }

        // Update existing card with new data
        function updateHeroCard(card, data, index) {
            var title = data.title || data.name || '';
            var overview = data.overview || '';
            if (overview.length > 150) overview = overview.substring(0, 150) + '...';
            var imgUrl = data.img || (data.backdrop_path ? Lampa.Api.img(data.backdrop_path, 'original') : '');

            // Update image
            var img = card.querySelector('.card__img');
            if (img) img.src = imgUrl;

            // Update promo content
            var promoTitle = card.querySelector('.card__promo-title');
            if (promoTitle) promoTitle.textContent = title;

            var promoText = card.querySelector('.card__promo-text');
            if (promoText) promoText.textContent = overview;

            // Remove old logo if exists
            var oldLogo = card.querySelector('.card__logo');
            if (oldLogo) oldLogo.remove();

            // Update data attribute
            card.setAttribute('data-index', index);
        }

        // Reattach handlers after updating cards
        function reattachHeroFocusHandlers() {
            // Remove old handlers
            $('.items-line[data-row-name="netflix_hero"] .card--wide').off('.netflix-hero');
            // Reattach
            attachHeroFocusHandlers();
        }

        // Focus handlers for Hero cards
        function attachHeroFocusHandlers() {
            var heroCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');
            if (heroCards.length === 0) return;

            heroCards.forEach(function (card, index) {
                // On click/Enter - open details page
                $(card).on('hover:enter.netflix-hero', function () {
                    if (!heroItemsData[index]) return;

                    var itemData = heroItemsData[index];
                    var movieData = itemData.data;

                    if (typeof Lampa !== 'undefined' && typeof Lampa.Activity !== 'undefined') {
                        Lampa.Activity.push({
                            url: '',
                            component: 'full',
                            id: itemData.id,
                            method: itemData.type,
                            card: movieData,
                            source: 'tmdb'
                        });
                    }
                });

                // On focus - instant scroll + update dots (CSS handles fade via .focus class)
                $(card).on('hover:focus.netflix-hero', function () {
                    // Instant scroll - no animation, just snap
                    card.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' });

                    // Get current index
                    var allCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');
                    var currentIndex = Array.from(allCards).indexOf(card);

                    // Update dots
                    updateHeroDots(currentIndex);
                    // Schedule trailer
                    TrailerManager.schedule(card, currentIndex);

                    // Load more when reaching last card
                    console.log('Netflix Hero: Focus on card', currentIndex + 1, 'of', allCards.length, 'isLoading:', heroIsLoading);
                    if (currentIndex >= allCards.length - 1 && !heroIsLoading) {
                        console.log('Netflix Hero: Reached last card, loading more...');
                        loadMoreHeroItems();
                    }
                });

                // On blur - hide trailer
                $(card).on('hover:blur.netflix-hero', function () {
                    TrailerManager.hide(card);
                });
            });

            // Initial check
            var focusedCard = document.querySelector('.items-line[data-row-name="netflix_hero"] .card--wide.focus');
            if (focusedCard) {
                var focusedIndex = Array.from(heroCards).indexOf(focusedCard);
                if (focusedIndex !== -1) {
                    TrailerManager.schedule(focusedCard, focusedIndex);
                }
            }
        }



        // Cleanup Hero card handlers
        function cleanupHeroHandlers() {
            if (typeof $ !== 'undefined') {
                $('.items-line[data-row-name="netflix_hero"] .card--wide').off('.netflix-hero');
            }
            // Cleanup manager
            if (TrailerManager.timer) clearTimeout(TrailerManager.timer);
            TrailerManager.destroy();
            // Remove dots
            var dots = document.querySelector('.netflix-hero-dots');
            if (dots) dots.remove();
        }

        // Create dots indicator for hero carousel
        function createHeroDots() {
            var heroRow = document.querySelector('.items-line[data-row-name="netflix_hero"]');
            if (!heroRow || heroRow.querySelector('.netflix-hero-dots')) return;

            var dotsContainer = document.createElement('div');
            dotsContainer.className = 'netflix-hero-dots';

            heroItemsData.forEach(function (_, index) {
                var dot = document.createElement('div');
                dot.className = 'netflix-hero-dot' + (index === 0 ? ' active' : '');
                dotsContainer.appendChild(dot);
            });

            heroRow.appendChild(dotsContainer);
            console.log('Netflix Hero: Created dots indicator');
        }

        // Update active dot
        function updateHeroDots(activeIndex) {
            var dots = document.querySelectorAll('.netflix-hero-dot');
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === activeIndex);
            });
        }

        // Load network/production company logos
        function loadNetworkLogos() {
            var heroCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');

            heroCards.forEach(function (card, index) {
                if (!heroItemsData[index]) return;

                var fullData = heroItemsData[index].data;
                if (!fullData) return;

                var networkLogo = null;

                // Priority streaming providers (from TMDB watch/providers API)
                var priorityProviderNames = [
                    'Netflix',
                    'Amazon Prime Video',
                    'Apple TV',
                    'Disney+',
                    'Hulu',
                    'HBO Max',
                    'Max',
                    'Paramount+',
                    'Crave',
                    'Hayu'
                ];

                // TV shows: use networks with priority
                var priorityNetworks = ['Netflix', 'HBO', 'Disney+', 'Amazon Prime Video', 'Apple TV+', 'Hulu'];
                // Priority production companies for movies
                var priorityCompanies = ['Sony Pictures', 'Warner Bros.', 'Universal Pictures', 'Disney', 'Netflix',
                                         'Paramount', '20th Century Fox', 'Marvel Studios', 'Pixar', 'Columbia Pictures'];

                // 1. Try watch providers first (flatrate = streaming)
                if (fullData['watch/providers'] && fullData['watch/providers'].flatrate) {
                    for (var p = 0; p < priorityProviderNames.length; p++) {
                        var provider = fullData['watch/providers'].flatrate.find(function (pr) {
                            return pr.provider_name === priorityProviderNames[p];
                        });
                        if (provider && provider.logo_path) {
                            networkLogo = provider.logo_path;
                            break;
                        }
                    }
                }
                // 2. TV shows: use networks with priority
                else if (fullData.networks && fullData.networks.length > 0) {
                    var selectedNetwork = null;
                    for (var i = 0; i < priorityNetworks.length; i++) {
                        selectedNetwork = fullData.networks.find(function (n) {
                            return n.name === priorityNetworks[i] && n.logo_path;
                        });
                        if (selectedNetwork) break;
                    }
                    // Fallback to first available
                    if (!selectedNetwork) {
                        selectedNetwork = fullData.networks.find(function (n) { return n.logo_path; });
                    }
                    if (selectedNetwork) networkLogo = selectedNetwork.logo_path;
                }
                // 3. Movies: use production_companies with priority
                else if (fullData.production_companies && fullData.production_companies.length > 0) {
                    var selectedCompany = null;
                    for (var j = 0; j < priorityCompanies.length; j++) {
                        selectedCompany = fullData.production_companies.find(function (c) {
                            return c.name === priorityCompanies[j] && c.logo_path;
                        });
                        if (selectedCompany) break;
                    }
                    // Fallback to first available
                    if (!selectedCompany) {
                        selectedCompany = fullData.production_companies.find(function (c) { return c.logo_path; });
                    }
                    if (selectedCompany) networkLogo = selectedCompany.logo_path;
                }

                if (networkLogo) {
                    var logoImg = document.createElement('img');
                    logoImg.src = Lampa.Api.img(networkLogo, 'w200');
                    logoImg.className = 'netflix-hero-network-logo';
                    logoImg.alt = 'Network';
                    logoImg.onerror = function () { this.style.display = 'none'; };

                    var promo = card.querySelector('.card__promo');
                    if (promo) promo.appendChild(logoImg);

                    console.log('Netflix Hero: Added network logo for', fullData.title || fullData.name);
                }
            });
        }

        // Load logos for Hero cards
        function loadHeroLogos() {
            var heroCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');

            heroCards.forEach(function (card, index) {
                var titleElement = card.querySelector('.card__promo-title');
                if (!titleElement) return;

                // Hide text until logo is loaded
                titleElement.style.opacity = '0';
                titleElement.style.transition = 'opacity 0.3s ease';

                // Get ID from stored array
                if (!heroItemsData[index]) {
                    titleElement.style.opacity = '1';
                    return;
                }

                var itemId = heroItemsData[index].id;
                var mediaType = heroItemsData[index].type;

                if (!itemId || typeof Lampa === 'undefined' || typeof Lampa.TMDB === 'undefined') {
                    titleElement.style.opacity = '1';
                    return;
                }

                var lang = Lampa.Storage ? Lampa.Storage.get('language', 'ru') : 'ru';
                // include_image_language важен для получения логотипов на разных языках
                // null означает "без языка" - универсальные логотипы
                var imageLangs = [lang, 'en', 'null'].join(',');
                var url = Lampa.TMDB.api(mediaType + '/' + itemId + '/images?include_image_language=' + imageLangs + '&language=' + lang + '&api_key=' + Lampa.TMDB.key());

                if (typeof Lampa.Network === 'undefined') {
                    titleElement.style.opacity = '1';
                    return;
                }

                Lampa.Network.silent(url, function (data) {
                    if (data && data.logos && data.logos.length > 0) {
                        // Приоритет: 1) текущий язык, 2) английский, 3) null (универсальный), 4) первый доступный
                        var preferredLogo = data.logos.find(function(l) { return l.iso_639_1 === lang; }) ||
                                           data.logos.find(function(l) { return l.iso_639_1 === 'en'; }) ||
                                           data.logos.find(function(l) { return l.iso_639_1 === null; }) ||
                                           data.logos[0];

                        var logo = preferredLogo.file_path;
                        if (logo && logo !== '') {
                            var logoUrl = Lampa.TMDB.image('/t/p/w300' + logo.replace('.svg', '.png'));
                            titleElement.innerHTML = '<img style="max-height: 8vw; max-width: 90%; object-fit: contain;" src="' + logoUrl + '" alt="" />';
                            titleElement.style.opacity = '1';
                            console.log('Netflix Hero: Logo loaded for ' + itemId + ', lang: ' + preferredLogo.iso_639_1);
                        } else {
                            titleElement.style.opacity = '1';
                            console.log('Netflix Hero: Empty logo path for ' + itemId);
                        }
                    } else {
                        titleElement.style.opacity = '1';
                        console.log('Netflix Hero: No logos found for ' + itemId);
                    }
                }, function (error) {
                    // Error callback - show text title
                    titleElement.style.opacity = '1';
                    console.error('Netflix Hero: Failed to load logo for ' + itemId, error);
                });
            });
        }

        // Enable Hero
        function enableHero() {
            var settings = getSettings();
            if (settings.enabled && settings.hero_enabled) {
                initHeroRow();
                console.log('Netflix Hero: ContentRows row added');
            }
        }

        // Disable Hero
        function disableHero() {
            // ContentRows is managed via Storage
            console.log('Netflix Hero: disabled');
        }


        // Restore state
        var savedSettings = getSettings();
        if (savedSettings.enabled) {
            enableTheme();
        }

        // Settings localization
        var settingsLabels = {
            ru: {
                componentName: 'LamPix Theme',
                enableTheme: 'Включить тему',
                enableThemeDesc: 'Применить стиль Netflix',
                headerStyle: 'Стиль заголовка',
                headerStyleDesc: 'Убрать часы и лишние элементы',
                heroBanner: 'Показать баннер Hero',
                heroBannerDesc: 'Большой баннер с трендами на главной',
                hideAnime: 'Скрыть аниме в Hero',
                hideAnimeDesc: 'Не показывать японские тайтлы в Hero',
                videoHero: 'Видео в Hero',
                videoHeroDesc: 'Воспроизводить трейлеры в баннере',
                reloadNotice: 'Настройки применятся после перезагрузки'
            },
            uk: {
                componentName: 'LamPix Theme',
                enableTheme: 'Увімкнути тему',
                enableThemeDesc: 'Застосувати стиль Netflix',
                headerStyle: 'Стиль заголовка',
                headerStyleDesc: 'Прибрати годинник та зайві елементи',
                heroBanner: 'Показати банер Hero',
                heroBannerDesc: 'Великий банер з трендами на головній',
                hideAnime: 'Сховати аніме в Hero',
                hideAnimeDesc: 'Не показувати японські тайтли в Hero',
                videoHero: 'Відео в Hero',
                videoHeroDesc: 'Відтворювати трейлери в банері',
                reloadNotice: 'Налаштування застосуються після перезавантаження'
            },
            en: {
                componentName: 'LamPix Theme',
                enableTheme: 'Enable Theme',
                enableThemeDesc: 'Apply Netflix style',
                headerStyle: 'Header Style',
                headerStyleDesc: 'Remove clock and extra elements',
                heroBanner: 'Show Hero Banner',
                heroBannerDesc: 'Large trending banner on home page',
                hideAnime: 'Hide Anime in Hero',
                hideAnimeDesc: 'Do not show Japanese titles in Hero',
                videoHero: 'Video in Hero',
                videoHeroDesc: 'Play trailers in Hero banner',
                reloadNotice: 'Settings will be applied after reload or transition'
            }
        };

        function getSettingsLabel(key) {
            var lang = (typeof Lampa !== 'undefined' && Lampa.Storage) ?
                Lampa.Storage.get('language', 'en') : 'en';
            var labels = settingsLabels[lang] || settingsLabels['en'];
            return labels[key] || settingsLabels['en'][key] || key;
        }

        // Initialize settings
        function initSettings() {
            if (typeof Lampa === 'undefined' || typeof Lampa.SettingsApi === 'undefined') return;

            Lampa.SettingsApi.addComponent({
                component: 'netflix_theme',
                icon: '<svg height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><rect x="7" y="8" width="4" height="8" fill="currentColor"/></svg>',
                name: getSettingsLabel('componentName')
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_enabled',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: getSettingsLabel('enableTheme'),
                    description: getSettingsLabel('enableThemeDesc')
                },
                onChange: function (value) {
                    var settings = getSettings();
                    if (value === true || value === 'true') {
                        if (!settings.enabled) toggleTheme();
                    } else {
                        if (settings.enabled) toggleTheme();
                    }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_header_style',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: getSettingsLabel('headerStyle'),
                    description: getSettingsLabel('headerStyleDesc')
                },
                onChange: function (value) {
                    var settings = getSettings();
                    settings.header_style = (value === true || value === 'true');
                    saveSettings(settings);

                    toggleHeaderStyle(settings.header_style);
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_hero_enabled',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: getSettingsLabel('heroBanner'),
                    description: getSettingsLabel('heroBannerDesc')
                },
                onChange: function (value) {
                    var settings = getSettings();
                    settings.hero_enabled = (value === true || value === 'true');
                    saveSettings(settings);

                    if (settings.hero_enabled) {
                        initHeroRow();
                        // Enable in ContentRows
                        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                            Lampa.Storage.set('content_rows_netflix_hero', 'true');
                        }
                    } else {
                        // Disable in ContentRows
                        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                            Lampa.Storage.set('content_rows_netflix_hero', 'false');
                        }
                        // Force hide the row if it exists
                        var row = document.querySelector('[data-row-name="netflix_hero"]');
                        if (row) row.style.display = 'none';
                        Lampa.Noty.show(getSettingsLabel('reloadNotice'));
                    }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_hide_anime',
                    type: 'trigger',
                    default: true
                },
                field: {
                    name: getSettingsLabel('hideAnime'),
                    description: getSettingsLabel('hideAnimeDesc')
                },
                onChange: function (value) {
                    var settings = getSettings();
                    settings.hide_anime_in_hero = (value === true || value === 'true');
                    saveSettings(settings);

                    // Reload Hero with new settings
                    if (settings.enabled && settings.hero_enabled) {
                        if (typeof Lampa !== 'undefined' && Lampa.Storage) {
                            Lampa.Storage.set('content_rows_netflix_hero', 'false');
                            setTimeout(function () {
                                Lampa.Storage.set('content_rows_netflix_hero', 'true');
                                initHeroRow();
                            }, 100);
                        }
                    }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_video_enabled',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: getSettingsLabel('videoHero'),
                    description: getSettingsLabel('videoHeroDesc')
                },
                onChange: function (value) {
                    var settings = getSettings();
                    settings.video_enabled = (value === true || value === 'true');
                    saveSettings(settings);
                }
            });
        }

        function waitForLampa(callback) {
            if (typeof Lampa !== 'undefined' && typeof Lampa.SettingsApi !== 'undefined') {
                callback();
            } else {
                var checkInterval = setInterval(function () {
                    if (typeof Lampa !== 'undefined' && typeof Lampa.SettingsApi !== 'undefined') {
                        clearInterval(checkInterval);
                        callback();
                    }
                }, 100);

                setTimeout(function () {
                    clearInterval(checkInterval);
                    callback();
                }, 3000);
            }
        }

        waitForLampa(function () {
            initSettings();

            // Check if theme is already enabled (page reload scenario)
            var settings = getSettings();
            console.log('Netflix Hero: Plugin initialized', {
                enabled: settings.enabled,
                hero_enabled: settings.hero_enabled
            });

            if (settings.enabled && settings.hero_enabled) {
                console.log('Netflix Hero: Theme already enabled, starting Hero...');
                // Hero will be started by enableTheme() after delay
            }
        });

        console.log('Netflix Theme: initialized');
    }

    startPlugin();
})();


