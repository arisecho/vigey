async function getData(){
    const res = await fetch("videos.txt");
    const text = await res.text();

    const lines = text.split("\n");

    let categories = [];
    let allVideos = [];
    let current = null;

    lines.forEach(line=>{
        line = line.trim();
        if(!line) return;

        if(line.startsWith("#")){
            if(current) categories.push(current);
            current = { name: line.replace("#",""), videos: [] };
        } else {
            const video = { url: line };
            if(current) current.videos.push(video);
            allVideos.push(video);
        }
    });

    if(current) categories.push(current);

    categories.unshift({
        name:"All",
        videos:allVideos
    });

    return categories;
}

function parsePreview(url){
    if(url.startsWith("http")) return url;

    if (/^\d+\/\d+\/\d+/.test(url)) {
        return "https://www.xxxfollow.com/media/fans/post_public/" + url + ".mp4";
    }

    if (/^[a-z0-9]\/[a-z0-9]\/[a-z0-9]/i.test(url)) {
        return "https://cdn.xfree.com/xfree-prod/" + url + ".mp4";
    }

    if (/^[a-f0-9]{8,}$/i.test(url)) {
        return "https://cdn.aceimg.com/" + url + ".mp4";
    }

    return "https://cdn2.videy.co/" + url + ".mp4";
}

function buildPlayerUrl(input){
    return "/v/?id=" + encodeURIComponent(input);
}
