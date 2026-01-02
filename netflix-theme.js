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

                // NEW: Add text tabs
                requestAnimationFrame(function () {
                    createHeaderTabs();
                    hideHeaderIcons();
                });

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

        // Performance: Singleton Trailer Manager
        var TrailerManager = {
            iframe: null,
            currentCard: null,
            timer: null,
            isPlaying: false,     // Track if video actually started playing
            currentKey: null,     // Current video key for blocking
            cache: {},
            blockedVideos: {},    // Cache of blocked video IDs
            // Tizen (Samsung TV) and some webOS versions fail to handle iframe re-parenting (recycling).
            // contentDocument becomes null or black screen appears.
            // We disable recycling for these platforms.
            isSmartTV: /Tizen|Web0S|SmartTV|SMART-TV/i.test(navigator.userAgent),

            init: function () {
                // Create shared iframe once for all platforms
                if (!this.iframe) {
                    this.createIframe();
                }
            },

            createIframe: function () {
                var iframe = document.createElement('iframe');
                iframe.className = 'hero-trailer-video';
                iframe.setAttribute('title', 'YouTube video player'); // Official
                iframe.setAttribute('frameborder', '0');
                // Official recommend: accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin'); // Official
                iframe.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 177.77%; height: 177.77%; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.3s ease; z-index: 1; pointer-events: none; border-radius: 14px;';

                this.iframe = iframe;
                this.attachErrorListener();

                return iframe;
            },

            attachErrorListener: function () {
                var _this = this;
                window.addEventListener('message', function (event) {
                    try {
                        var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                        if (!data) return;

                        // Handle video playing - show iframe only when video actually starts
                        // onStateChange: 1 = playing, or infoDelivery with playerState: 1
                        var isPlaying = (data.event === 'onStateChange' && data.info === 1) ||
                            (data.event === 'infoDelivery' && data.info && data.info.playerState === 1);

                        if (isPlaying && _this.currentCard && _this.iframe) {
                            console.log('Netflix Hero Trailer: Video started playing!');
                            _this.isPlaying = true;
                            if (_this.timer) clearTimeout(_this.timer);
                            _this.iframe.style.opacity = '1';
                            var backdrop = _this.currentCard.querySelector('.card__img');
                            if (backdrop) backdrop.style.opacity = '0.3';
                        }

                        // Handle errors (including age restricted)
                        var isError = (data.event === 'infoDelivery' && data.info && data.info.error) ||
                            (data.event === 'onError');

                        if (isError) {
                            console.error('Netflix Hero Trailer: Player Error', data);
                            _this.markAsBlocked();
                        }

                        // Handle video end (to hide "More Videos" screen)
                        var isEnded = (data.event === 'onStateChange' && data.info === 0) ||
                            (data.event === 'infoDelivery' && data.info && data.info.playerState === 0);

                        if (isEnded && _this.currentCard) {
                            console.log('Netflix Hero Trailer: Video ended, hiding player');
                            _this.hide(_this.currentCard);
                        }
                    } catch (e) { }
                });
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
                xhr.timeout = 3000; // 3 second timeout

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
                    // On timeout, assume available (don't block good videos due to slow network)
                    onSuccess();
                };

                xhr.send();
            },

            load: function (card, itemId, mediaType) {
                var _this = this;

                // Clear any pending load
                if (this.timer) clearTimeout(this.timer);

                console.log('Netflix Hero Trailer: Loading for', itemId, mediaType);

                // If we already have the key cached
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
                        // Расширенный поиск: Official Trailer → Trailer → Teaser/Clip
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
                            // Only show if the card that requested it is still the current target
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

                // Check if video is known to be blocked
                if (this.blockedVideos[key]) {
                    console.log('Netflix Hero Trailer: Video known to be blocked, skipping:', key);
                    return;
                }

                if (!card.classList.contains('focus')) {
                    console.log('Netflix Hero Trailer: Card not focused, aborting');
                    return;
                }

                // Reset state
                this.currentKey = key;
                if (this.timer) clearTimeout(this.timer);

                // First check if video is available via oEmbed API
                this.checkVideoAvailable(key, function () {
                    // Video is available - proceed to show
                    _this.showVideo(card, key);
                }, function () {
                    // Video is blocked/unavailable
                    _this.blockedVideos[key] = true;
                    console.log('Netflix Hero Trailer: Video blocked, staying on poster');
                });
            },

            showVideo: function (card, key) {
                var _this = this;

                // Re-check conditions after async oEmbed call
                if (!card.classList.contains('focus') || this.currentKey !== key) {
                    console.log('Netflix Hero Trailer: Conditions changed, aborting show');
                    return;
                }

                // Ensure init (creates iframe for desktop, does nothing for SmartTV)
                this.init();

                var iframeToUse = this.iframe;
                if (!iframeToUse) {
                    console.warn('Netflix Hero Trailer: No iframe available');
                    return;
                }

                // Move iframe to new card (or append new one)
                var cardView = card.querySelector('.card__view');
                if (!cardView) {
                    console.warn('Netflix Hero Trailer: No .card__view found');
                    return;
                }

                // Reset state
                this.isPlaying = false;
                iframeToUse.style.opacity = '0';

                // If moving to a new parent, append it
                if (iframeToUse.parentNode !== cardView) {
                    cardView.appendChild(iframeToUse);
                }

                // Update src
                var src;
                var origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
                if (this.isSmartTV) {
                    // Use Proxy Player for Tizen/WebOS to fix Error 153 (Origin issue)
                    src = 'https://superkeka.github.io/lampix/player.html?video_id=' + key + '&start=7';
                } else {
                    // Standard YouTube embed
                    src = 'https://www.youtube.com/embed/' + key + '?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=' + key + '&start=7&enablejsapi=1&disablekb=1&origin=' + encodeURIComponent(origin);
                }

                console.log('Netflix Hero Trailer: Setting iframe src to', src.substring(0, 80) + '...');

                // Only update src if changed to avoid reloading
                if (iframeToUse.src !== src) {
                    iframeToUse.src = src;
                }

                // Show video after iframe loads
                iframeToUse.onload = function () {
                    console.log('Netflix Hero Trailer: iframe loaded');
                    setTimeout(function () {
                        if (_this.currentCard === card && card.classList.contains('focus') && _this.currentKey === key) {
                            console.log('Netflix Hero Trailer: Showing video');
                            _this.isPlaying = true;
                            iframeToUse.style.opacity = '1';
                            var backdrop = card.querySelector('.card__img');
                            if (backdrop) backdrop.style.opacity = '0.3';
                        }
                    }, 1000);
                };
            },

            hide: function (card) {
                if (this.iframe) {
                    this.iframe.style.opacity = '0';
                }

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

            schedule: function (card, index) {
                var _this = this;

                console.log('Netflix Hero Trailer: schedule() called, index:', index, 'video_enabled:', getSettings().video_enabled);

                // If same card, do nothing
                if (this.currentCard === card) {
                    console.log('Netflix Hero Trailer: Same card, skipping');
                    return;
                }

                // Hide previous
                if (this.currentCard) {
                    this.hide(this.currentCard);
                }

                this.currentCard = card;

                // Use debounce timer
                if (this.timer) clearTimeout(this.timer);

                // Check settings before scheduling
                if (!getSettings().video_enabled) {
                    console.log('Netflix Hero Trailer: Video disabled in settings');
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

                // On focus - schedule trailer + scroll + update dots
                $(card).on('hover:focus.netflix-hero', function () {
                    // Scroll to this card (carousel effect)
                    card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                    // Update dots indicator
                    updateHeroDots(index);
                    // Schedule trailer
                    TrailerManager.schedule(card, index);
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
            if (TrailerManager.iframe) {
                TrailerManager.iframe.remove();
                TrailerManager.iframe = null;
            }
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

                // TV shows: use networks
                if (fullData.networks && fullData.networks.length > 0) {
                    var network = fullData.networks.find(function (n) { return n.logo_path; });
                    if (network) networkLogo = network.logo_path;
                }
                // Movies: use production_companies
                else if (fullData.production_companies && fullData.production_companies.length > 0) {
                    var company = fullData.production_companies.find(function (c) { return c.logo_path; });
                    if (company) networkLogo = company.logo_path;
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

