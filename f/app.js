// =====================================================================
// Gallery App - FIXED
// FIX: Hapus hardcoded https://twiimg.biz.id, gunakan origin dinamis
// =====================================================================

function encodeUrl(url) {
    try { return btoa(unescape(encodeURIComponent(url))); }
    catch (e) { return btoa(url); }
}

var DATA = [];
var CURRENT_VIDEOS = [];
var CURRENT_PAGE = 1;
var PER_PAGE = 12;

// FIX: gunakan origin dinamis, bukan hardcoded twiimg.biz.id
var SITE_BASE = window.location.origin + '/';

async function init() {
    try {
        DATA = await getData();
        if (!DATA || DATA.length === 0) {
            document.getElementById('gallery').innerHTML =
                '<p style="color:#94a3b8;text-align:center;padding:40px;">No videos available.</p>';
            return;
        }
        renderFolders();
        renderVideos(DATA[0].videos);
    } catch (e) {
        console.error('init error:', e);
        document.getElementById('gallery').innerHTML =
            '<p style="color:#fca5a5;text-align:center;padding:40px;">Failed to load videos.<br>' +
            'Check that videos.txt is accessible.</p>';
    }
}

function renderFolders() {
    var el = document.getElementById('folders');
    el.innerHTML = '';
    DATA.forEach(function (cat) {
        var btn = document.createElement('div');
        btn.className = 'folder';
        btn.innerText = cat.name;
        btn.onclick = function () { renderVideos(cat.videos); };
        el.appendChild(btn);
    });
}

function renderVideos(videos) {
    CURRENT_VIDEOS = videos;
    CURRENT_PAGE = 1;
    renderPage();
}

function renderPage() {
    var grid = document.getElementById('gallery');
    grid.innerHTML = '';

    var activeVideo = null;
    var start = (CURRENT_PAGE - 1) * PER_PAGE;
    var pageVideos = CURRENT_VIDEOS.slice(start, start + PER_PAGE);

    pageVideos.forEach(function (v, index) {
        var preview = parsePreview(v.url);

        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML =
            '<div class="thumb">' +
                '<video data-src="' + preview + '" muted loop playsinline preload="none" poster=""></video>' +
                '<div class="play"></div>' +
                '<div class="actions">' +
                    '<button class="watch">Watch</button>' +
                    '<button class="download">Download</button>' +
                '</div>' +
            '</div>';

        var vid = card.querySelector('video');

        // Lazy + stagger
        setTimeout(function () {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        if (activeVideo && activeVideo !== vid) {
                            try { activeVideo.pause(); } catch (e) {}
                        }
                        if (!vid.src) vid.src = vid.dataset.src;
                        vid.play().catch(function () {});
                        activeVideo = vid;
                    } else {
                        try { vid.pause(); } catch (e) {}
                    }
                });
            }, { threshold: 0.5 });
            observer.observe(vid);
        }, index * 50);

        vid.onerror = function () { vid.style.display = 'none'; };

        // FIX: gunakan SITE_BASE dinamis
        var goWatch = function () {
            window.location.href = SITE_BASE + 'v/?id=' + encodeURIComponent(v.url);
        };

        card.querySelector('.watch').onclick = function (e) { e.stopPropagation(); goWatch(); };
        card.querySelector('.play').onclick  = function (e) { e.stopPropagation(); goWatch(); };

        card.querySelector('.download').onclick = function (e) {
            e.stopPropagation();
            var encoded = encodeUrl(preview);
            window.open(SITE_BASE + 'd/?url=' + encoded, '_blank');
        };

        grid.appendChild(card);
    });

    renderPagination();
}

function renderPagination() {
    var nav = document.getElementById('pagination');
    if (!nav) {
        nav = document.createElement('div');
        nav.id = 'pagination';
        document.body.appendChild(nav);
    }
    nav.innerHTML = '';

    var totalPages = Math.ceil(CURRENT_VIDEOS.length / PER_PAGE);
    if (totalPages <= 1) return;

    if (CURRENT_PAGE > 1) {
        var prev = document.createElement('button');
        prev.innerText = 'Prev';
        prev.onclick = function () { CURRENT_PAGE--; renderPage(); window.scrollTo(0, 0); };
        nav.appendChild(prev);
    }

    var start = Math.max(1, CURRENT_PAGE - 2);
    var end = Math.min(totalPages, CURRENT_PAGE + 2);

    for (var i = start; i <= end; i++) {
        var btn = document.createElement('button');
        btn.innerText = i;
        if (i === CURRENT_PAGE) btn.style.background = '#ff4d6d';
        btn.onclick = (function (page) {
            return function () { CURRENT_PAGE = page; renderPage(); window.scrollTo(0, 0); };
        })(i);
        nav.appendChild(btn);
    }

    if (CURRENT_PAGE < totalPages) {
        var next = document.createElement('button');
        next.innerText = 'Next';
        next.onclick = function () { CURRENT_PAGE++; renderPage(); window.scrollTo(0, 0); };
        nav.appendChild(next);
    }
}

function goHome() {
    if (DATA && DATA.length > 0) renderVideos(DATA[0].videos);
}

init();
