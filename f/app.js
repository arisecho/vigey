function encodeUrl(url){
    return btoa(unescape(encodeURIComponent(url)));
}

let DATA = [];
let CURRENT_VIDEOS = [];
let CURRENT_PAGE = 1;
const PER_PAGE = 12;

async function init(){
    DATA = await getData();
    renderFolders();
    renderVideos(DATA[0].videos);
}

function renderFolders(){
    const el = document.getElementById("folders");
    el.innerHTML = "";

    DATA.forEach(cat=>{
        const btn = document.createElement("div");
        btn.className = "folder";
        btn.innerText = cat.name;

        btn.onclick = ()=> renderVideos(cat.videos);

        el.appendChild(btn);
    });
}

function renderVideos(videos){
    CURRENT_VIDEOS = videos;
    CURRENT_PAGE = 1;
    renderPage();
}

function renderPage(){
    const grid = document.getElementById("gallery");
    grid.innerHTML = "";

    let activeVideo = null;

    const start = (CURRENT_PAGE - 1) * PER_PAGE;
    const pageVideos = CURRENT_VIDEOS.slice(start, start + PER_PAGE);

    pageVideos.forEach((v, index)=>{
        const preview = parsePreview(v.url);

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <div class="thumb">
                <video 
                    data-src="${preview}"
                    muted 
                    loop 
                    playsinline 
                    preload="none"
                    poster=""
                ></video>

                <div class="play"></div>

                <div class="actions">
                    <button class="watch">Watch</button>
                    <button class="download">Download</button>
                </div>
            </div>
        `;

        const vid = card.querySelector("video");

        // 🔥 LAZY + STAGGER (tetap dari kamu)
        setTimeout(()=>{
            const observer = new IntersectionObserver(entries=>{
                entries.forEach(entry=>{
                    if(entry.isIntersecting){

                        if(activeVideo && activeVideo !== vid){
                            activeVideo.pause();
                        }

                        if(!vid.src){
                            vid.src = vid.dataset.src;
                        }

                        vid.play().catch(()=>{});
                        activeVideo = vid;

                    } else {
                        vid.pause();
                    }
                });
            },{
                threshold: 0.5
            });

            observer.observe(vid);
        }, index * 50);

        // error fallback
        vid.onerror = ()=>{
            vid.style.display = "none";
        };

        // WATCH
        const goWatch = ()=>{
    window.location.href = "https://vigey.biz.id/v/?id=" + encodeURIComponent(v.url);
};

        card.querySelector(".watch").onclick = (e)=>{
            e.stopPropagation();
            goWatch();
        };

        card.querySelector(".play").onclick = (e)=>{
            e.stopPropagation();
            goWatch();
        };

        // DOWNLOAD → SAFELINK
        card.querySelector(".download").onclick = (e)=>{
            e.stopPropagation();

            const encoded = encodeUrl(preview);
            window.open("https://vigey.biz.id/d/?url=" + encoded, "_blank");
        };

        grid.appendChild(card);
    });

    renderPagination();
}

function renderPagination(){
    let nav = document.getElementById("pagination");

    if(!nav){
        nav = document.createElement("div");
        nav.id = "pagination";
        document.body.appendChild(nav);
    }

    nav.innerHTML = "";

    const totalPages = Math.ceil(CURRENT_VIDEOS.length / PER_PAGE);

    if(totalPages <= 1) return;

    // PREV
    if(CURRENT_PAGE > 1){
        const prev = document.createElement("button");
        prev.innerText = "Prev";
        prev.onclick = ()=>{
            CURRENT_PAGE--;
            renderPage();
            window.scrollTo(0,0);
        };
        nav.appendChild(prev);
    }

    // NUMBER (dibatasi biar tidak panjang)
    let start = Math.max(1, CURRENT_PAGE - 2);
    let end = Math.min(totalPages, CURRENT_PAGE + 2);

    for(let i = start; i <= end; i++){
        const btn = document.createElement("button");
        btn.innerText = i;

        if(i === CURRENT_PAGE){
            btn.style.background = "#ff4d6d";
        }

        btn.onclick = ()=>{
            CURRENT_PAGE = i;
            renderPage();
            window.scrollTo(0,0);
        };

        nav.appendChild(btn);
    }

    // NEXT
    if(CURRENT_PAGE < totalPages){
        const next = document.createElement("button");
        next.innerText = "Next";
        next.onclick = ()=>{
            CURRENT_PAGE++;
            renderPage();
            window.scrollTo(0,0);
        };
        nav.appendChild(next);
    }
}

function goHome(){
    renderVideos(DATA[0].videos);
}

init();
