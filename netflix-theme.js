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
            hide_anime_in_hero: true
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
                Lampa.Storage.get('language', 'ru') : 'ru';

            var labels = {
                'ru': { settings: 'Настройки', notifications: 'Уведомления' },
                'en': { settings: 'Settings', notifications: 'Notifications' }
            };
            var texts = labels[lang] || labels['ru'];

            // Create container
            var container = document.createElement('div');
            container.className = 'netflix-header-tabs';
            container.innerHTML =
                '<svg class="netflix-search-icon selector" data-action="search" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
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
                setTimeout(function () {
                    createHeaderTabs();
                    hideHeaderIcons();
                }, 500); // Wait for icons initialization

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

            // Fallback: check every 3 seconds (6 times less frequent than before)
            logoFallbackInterval = setInterval(updateLogo, 3000);
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
                    width: auto !important;
                    min-width: 2em !important;
                    height: auto !important;
                    padding: 0.2em !important;
                }
                /* Hide original logo content */
                .head__logo-icon > span,
                .head__logo-icon > img {
                    display: none !important;
                }
                /* Show our Netflix SVG */
                .head__logo-icon > svg {
                    display: block !important;
                    width: 26px !important;
                    height: 34px !important;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)) !important;
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
                /* Row Animation */
                .items-line {
                    animation: fadeInRow 0.5s ease forwards;
                    opacity: 0;
                }

                @keyframes fadeInRow {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

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

                            // Filter with backdrop_path, description and good rating (>= 7.0)
                            var validItems = [];
                            for (var i = 0; i < json.results.length; i++) {
                                var item = json.results[i];
                                // Check language if anime hiding is enabled (ja = Japanese)
                                var isAnime = hideAnime && item.original_language === 'ja';
                                if (!isAnime && item.backdrop_path && item.overview && item.overview.length > 0 && item.vote_average >= 7.0) {
                                    validItems.push(item);
                                }
                            }

                            // If few items with rating >= 7.0, take with >= 6.5
                            if (validItems.length < 3) {
                                validItems = [];
                                for (var i = 0; i < json.results.length; i++) {
                                    var item = json.results[i];
                                    var isAnime = hideAnime && item.original_language === 'ja';
                                    if (!isAnime && item.backdrop_path && item.overview && item.overview.length > 0 && item.vote_average >= 6.5) {
                                        validItems.push(item);
                                    }
                                }
                            }

                            if (validItems.length === 0) {
                                call({ results: [] });
                                return;
                            }

                            // Sort by rating (descending)
                            validItems.sort(function (a, b) {
                                return (b.vote_average || 0) - (a.vote_average || 0);
                            });

                            // Take top 10 items with best ratings
                            var topItems = validItems.slice(0, Math.min(10, validItems.length));

                            // Choose 3 random from top 10 (recommendations)
                            var heroItems = [];
                            var selectedIndices = [];
                            var count = Math.min(3, topItems.length);

                            for (var i = 0; i < count; i++) {
                                var randomIndex;
                                do {
                                    randomIndex = Math.floor(Math.random() * topItems.length);
                                } while (selectedIndices.indexOf(randomIndex) !== -1);

                                selectedIndices.push(randomIndex);
                                var item = topItems[randomIndex];
                                item.media_type = mediaType;
                                heroItems.push(item);
                            }

                            console.log('Netflix Hero: Selected ' + heroItems.length + ' items');

                            // Process each item
                            var processedItems = [];
                            var processedCount = 0;

                            // Clear old data
                            heroItemsData = [];

                            function checkComplete() {
                                processedCount++;
                                if (processedCount === heroItems.length) {
                                    call({
                                        title: 'NETFLIX HERO',
                                        results: processedItems
                                    });
                                    setTimeout(markHeroRow, 100);
                                }
                            }

                            heroItems.forEach(function (heroItem) {
                                Lampa.Api.full({
                                    id: heroItem.id,
                                    method: mediaType,
                                    source: 'tmdb'
                                }, function (fullData) {
                                    fullData.media_type = mediaType;
                                    fullData.params = {
                                        style: {
                                            name: 'wide'
                                        }
                                    };

                                    if (!fullData.title && !fullData.name) {
                                        fullData.title = heroItem.title || heroItem.name || 'Unknown';
                                    }
                                    if (!fullData.overview) {
                                        fullData.overview = heroItem.overview || '';
                                    }
                                    if (!fullData.backdrop_path && heroItem.backdrop_path) {
                                        fullData.backdrop_path = heroItem.backdrop_path;
                                    }
                                    if (!fullData.backdrop_path && fullData.poster_path) {
                                        fullData.backdrop_path = fullData.poster_path;
                                    }

                                    if (fullData.backdrop_path && typeof Lampa.Api !== 'undefined') {
                                        fullData.img = Lampa.Api.img(fullData.backdrop_path, 'original');
                                    } else if (fullData.poster_path && typeof Lampa.Api !== 'undefined') {
                                        fullData.img = Lampa.Api.img(fullData.poster_path, 'w500');
                                    }

                                    // Save full data for click handling
                                    heroItemsData.push({
                                        id: heroItem.id,
                                        type: mediaType,
                                        data: fullData
                                    });

                                    processedItems.push(fullData);
                                    checkComplete();
                                }, function () {
                                    heroItem.params = {
                                        style: {
                                            name: 'wide'
                                        }
                                    };

                                    if (heroItem.backdrop_path && typeof Lampa.Api !== 'undefined') {
                                        heroItem.img = Lampa.Api.img(heroItem.backdrop_path, 'original');
                                    } else if (heroItem.poster_path && typeof Lampa.Api !== 'undefined') {
                                        heroItem.img = Lampa.Api.img(heroItem.poster_path, 'w500');
                                    }

                                    // Save full data for click handling
                                    heroItemsData.push({
                                        id: heroItem.id,
                                        type: mediaType,
                                        data: heroItem
                                    });

                                    processedItems.push(heroItem);
                                    checkComplete();
                                });
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
            var lines = document.querySelectorAll('.items-line');
            for (var i = 0; i < lines.length; i++) {
                var title = lines[i].querySelector('.items-line__title');
                if (title && title.textContent.indexOf('NETFLIX HERO') !== -1) {
                    lines[i].setAttribute('data-row-name', 'netflix_hero');
                    console.log('Netflix Hero: marked row with data-row-name');

                    // Load logos and attach focus handlers
                    setTimeout(function () {
                        loadHeroLogos();
                        attachHeroFocusHandlers();
                    }, 500);
                    break;
                }
            }
        }

        // Timers and state for trailer autoplay
        var heroTrailerTimers = {};
        var heroTrailerCache = {};

        // Load and show trailer for Hero card
        function loadHeroTrailer(card, index) {
            if (!heroItemsData[index]) return;

            var itemId = heroItemsData[index].id;
            var mediaType = heroItemsData[index].type;

            // Check cache
            if (heroTrailerCache[itemId]) {
                showHeroTrailer(card, heroTrailerCache[itemId]);
                return;
            }

            // Load trailer via Lampa API
            if (typeof Lampa === 'undefined' || typeof Lampa.Api === 'undefined') return;

            Lampa.Api.sources.tmdb.videos({
                id: itemId,
                method: mediaType
            }, function (data) {
                if (data && data.results && data.results.length > 0) {
                    // Look for trailer (preferably official)
                    var trailer = data.results.find(function (v) {
                        return v.type === 'Trailer' && v.site === 'YouTube' && v.official;
                    }) || data.results.find(function (v) {
                        return v.type === 'Trailer' && v.site === 'YouTube';
                    });

                    if (trailer && trailer.key) {
                        heroTrailerCache[itemId] = trailer.key;
                        showHeroTrailer(card, trailer.key);
                    }
                }
            }, function (error) {
                // Error callback - do nothing, just don't show trailer
                console.log('Netflix Hero: Failed to load trailer for ' + itemId);
            });
        }

        // Hide all trailers (fast synchronous animation)
        function hideAllHeroTrailers() {
            var allCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');
            allCards.forEach(function (card) {
                var iframe = card.querySelector('.hero-trailer-video');
                if (iframe) {
                    iframe.style.transition = 'opacity 0.3s ease';
                    iframe.style.opacity = '0';
                    setTimeout(function () {
                        if (iframe.parentNode) {
                            iframe.parentNode.removeChild(iframe);
                        }
                    }, 300);
                }

                // Restore backdrop visibility (synchronously with iframe)
                var backdropImg = card.querySelector('.card__img');
                if (backdropImg) {
                    backdropImg.style.transition = 'opacity 0.3s ease';
                    backdropImg.style.opacity = '1';
                }
            });
        }

        // Show trailer in Hero card (fast synchronous animation)
        function showHeroTrailer(card, videoKey) {
            // Check that card is still focused
            if (!card.classList.contains('focus')) return;

            // Hide all other trailers
            hideAllHeroTrailers();

            // Find existing iframe
            var existingIframe = card.querySelector('.hero-trailer-video');
            if (existingIframe) {
                existingIframe.style.opacity = '1';
                return;
            }

            // Create iframe for YouTube with synchronous animation
            var iframe = document.createElement('iframe');
            iframe.className = 'hero-trailer-video';
            iframe.src = 'https://www.youtube.com/embed/' + videoKey + '?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=' + videoKey + '&start=10';
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allow', 'autoplay; encrypted-media');
            iframe.style.cssText = 'position: absolute; top: 50%; left: 50%; width: 177.77%; height: 177.77%; transform: translate(-50%, -50%); opacity: 0; transition: opacity 0.3s ease; z-index: 1; pointer-events: none; border-radius: 14px;';

            var cardView = card.querySelector('.card__view');
            if (cardView) {
                var backdropImg = card.querySelector('.card__img');
                cardView.appendChild(iframe);

                // Wait for iframe load and show quickly
                iframe.addEventListener('load', function () {
                    // Reduced delay for smoothness
                    setTimeout(function () {
                        if (!card.classList.contains('focus')) return;

                        // Show video quickly (synchronously with backdrop)
                        iframe.style.opacity = '1';

                        // Dim backdrop (synchronously with iframe)
                        if (backdropImg) {
                            backdropImg.style.transition = 'opacity 0.3s ease';
                            backdropImg.style.opacity = '0.3';
                        }
                    }, 800); // Reduced delay from 1500ms to 800ms
                });
            }
        }

        // Hide trailer in Hero card (fast synchronous animation)
        function hideHeroTrailer(card) {
            var iframe = card.querySelector('.hero-trailer-video');
            if (iframe) {
                iframe.style.transition = 'opacity 0.3s ease';
                iframe.style.opacity = '0';
                setTimeout(function () {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 300);
            }

            // Restore backdrop visibility (synchronously)
            var backdropImg = card.querySelector('.card__img');
            if (backdropImg) {
                backdropImg.style.transition = 'opacity 0.3s ease';
                backdropImg.style.opacity = '1';
            }
        }

        // Focus handlers for Hero cards (with namespace for cleanup)
        function attachHeroFocusHandlers() {
            var heroCards = document.querySelectorAll('.items-line[data-row-name="netflix_hero"] .card--wide');

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

                // On focus
                $(card).on('hover:focus.netflix-hero', function () {
                    // Hide all trailers on focus change
                    hideAllHeroTrailers();

                    // Clear all timers
                    Object.keys(heroTrailerTimers).forEach(function (key) {
                        if (heroTrailerTimers[key]) {
                            clearTimeout(heroTrailerTimers[key]);
                        }
                    });

                    // Start timer for 2 seconds for current card
                    heroTrailerTimers[index] = setTimeout(function () {
                        loadHeroTrailer(card, index);
                    }, 2000);
                });

                // On blur
                $(card).on('hover:blur.netflix-hero', function () {
                    // Clear timer
                    if (heroTrailerTimers[index]) {
                        clearTimeout(heroTrailerTimers[index]);
                        heroTrailerTimers[index] = null;
                    }

                    // Hide trailer
                    hideHeroTrailer(card);
                });
            });

            // Check if there is already a focused card (initial load)
            setTimeout(function () {
                var focusedCard = document.querySelector('.items-line[data-row-name="netflix_hero"] .card--wide.focus');
                if (focusedCard) {
                    var focusedIndex = Array.from(heroCards).indexOf(focusedCard);
                    if (focusedIndex !== -1) {
                        // Start timer for already focused card
                        heroTrailerTimers[focusedIndex] = setTimeout(function () {
                            loadHeroTrailer(focusedCard, focusedIndex);
                        }, 2000);
                    }
                }
            }, 500);
        }

        // Cleanup Hero card handlers
        function cleanupHeroHandlers() {
            if (typeof $ !== 'undefined') {
                $('.items-line[data-row-name="netflix_hero"] .card--wide').off('.netflix-hero');
            }

            // Clear all trailer timers
            Object.keys(heroTrailerTimers).forEach(function (key) {
                if (heroTrailerTimers[key]) {
                    clearTimeout(heroTrailerTimers[key]);
                }
            });
            heroTrailerTimers = {};

            // Hide all trailers
            hideAllHeroTrailers();
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
                var url = Lampa.TMDB.api(mediaType + '/' + itemId + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + lang);

                if (typeof Lampa.Network === 'undefined') {
                    titleElement.style.opacity = '1';
                    return;
                }

                Lampa.Network.silent(url, function (data) {
                    if (data && data.logos && data.logos.length > 0) {
                        var logo = data.logos[0].file_path;
                        if (logo !== '') {
                            var logoUrl = Lampa.TMDB.image('/t/p/w300' + logo.replace('.svg', '.png'));
                            titleElement.innerHTML = '<img style="max-height: 8vw; max-width: 90%; object-fit: contain;" src="' + logoUrl + '" />';
                            titleElement.style.opacity = '1';
                        } else {
                            titleElement.style.opacity = '1';
                        }
                    } else {
                        titleElement.style.opacity = '1';
                    }
                }, function (error) {
                    // Error callback - show text title
                    titleElement.style.opacity = '1';
                    console.log('Netflix Hero: Failed to load logo for ' + itemId);
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

        // Initialize settings
        function initSettings() {
            if (typeof Lampa === 'undefined' || typeof Lampa.SettingsApi === 'undefined') return;

            Lampa.SettingsApi.addComponent({
                component: 'netflix_theme',
                icon: '<svg height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/><rect x="7" y="8" width="4" height="8" fill="currentColor"/></svg>',
                name: 'LamPix Theme'
            });

            Lampa.SettingsApi.addParam({
                component: 'netflix_theme',
                param: {
                    name: 'netflix_enabled',
                    type: 'trigger',
                    default: false
                },
                field: {
                    name: 'Включить тему',
                    description: 'Применить стиль Netflix'
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
                    name: 'Стиль хедера',
                    description: 'Убрать часы и лишние элементы'
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
                    name: 'Показать Hero баннер',
                    description: 'Большой баннер с трендом на главной странице'
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
                    name: 'Скрыть аниме в Hero',
                    description: 'Не показывать японские фильмы/сериалы в Hero баннере'
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
        }

        function waitForLampa(callback) {
            if (typeof Lampa !== 'undefined' && typeof Lampa.SettingsApi !== 'undefined') {
                setTimeout(callback, 500);
            } else {
                var checkInterval = setInterval(function () {
                    if (typeof Lampa !== 'undefined' && typeof Lampa.SettingsApi !== 'undefined') {
                        clearInterval(checkInterval);
                        setTimeout(callback, 500);
                    }
                }, 100);

                setTimeout(function () {
                    clearInterval(checkInterval);
                    callback();
                }, 5000);
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
