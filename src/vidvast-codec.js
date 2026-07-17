// =====================================================================
// VidvastCodec - Shared Encoder/Decoder
// ---------------------------------------------------------------------
// BUG YANG DIPERBAIKI:
// 1. Versi lama di /v/index.html memakai decodeURIComponent(escape(utf8))
//    yang merusak byte kontrol dan bisa blank di browser modern.
// 2. Versi lama di /d/index.html memakai atob() langsung tanpa
//    UTF-8 decode, inkonsisten dengan encoder.
// 3. Sekarang semua file pakai VERSI YANG SAMA lewat file ini.
// =====================================================================
(function (global) {
    var SECRET_KEY = 'vidvast-2026-secure-key-v1';
    var PREFIX = 'vg';

    function xorTransform(str, key) {
        var out = '';
        for (var i = 0; i < str.length; i++) {
            out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return out;
    }

    // UTF-8 safe base64 (url-safe variant)
    function toUrlSafeBase64(str) {
        var utf8 = unescape(encodeURIComponent(str));
        return btoa(utf8)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    function fromUrlSafeBase64(str) {
        var s = String(str).replace(/-/g, '+').replace(/_/g, '/');
        while (s.length % 4) s += '=';
        var utf8 = atob(s);
        // Handle UTF-8 safely. escape/unescape deprecated, gunakan try/catch.
        try {
            return decodeURIComponent(escape(utf8));
        } catch (e) {
            return utf8; // fallback ke raw bytes (untuk ASCII pure)
        }
    }

    function encodeId(originalId) {
        if (!originalId) return '';
        var xored   = xorTransform(originalId, SECRET_KEY);
        var reversed = xored.split('').reverse().join('');
        return PREFIX + toUrlSafeBase64(reversed);
    }

    function decodeId(encoded) {
        if (!encoded || typeof encoded !== 'string') return null;
        if (encoded.indexOf(PREFIX) !== 0) return null;
        try {
            var withoutPrefix = encoded.slice(PREFIX.length);
            var reversed = fromUrlSafeBase64(withoutPrefix);
            var xored    = reversed.split('').reverse().join('');
            return xorTransform(xored, SECRET_KEY);
        } catch (e) {
            return null;
        }
    }

    function isEncodedCode(id) {
        return typeof id === 'string'
            && id.indexOf(PREFIX) === 0
            && id.length > PREFIX.length + 2;
    }

    // Ekstrak ID kanonik dari berbagai format input.
    function extractIdFromInput(input) {
        if (!input) return '';
        input = String(input).trim();
        if (!input) return '';

        // ?id=xxx
        var idMatch = input.match(/[?&]id=([^&#]+)/);
        if (idMatch) {
            try { return decodeURIComponent(idMatch[1]); }
            catch (e) { return idMatch[1]; }
        }

        // /v/xxx atau /g/xxx (path)
        var pathMatch = input.match(/\/[vg]\/([^?]+)/);
        if (pathMatch) {
            try { return decodeURIComponent(pathMatch[1]); }
            catch (e) { return pathMatch[1]; }
        }

        var m;

        // cdn.videy.co / cdn2.videy.co
        m = input.match(/^https?:\/\/cdn\d?\.videy\.co\/(.+?)$/i);
        if (m) {
            var path = m[1].replace(/[?#].*$/, '').replace(/\.(mp4|mov)$/i, '');
            return path;
        }

        // cdn.aceimg.com
        m = input.match(/^https?:\/\/cdn\.aceimg\.com\/(.+?)$/i);
        if (m) {
            return m[1].replace(/[?#].*$/, '').replace(/\.mp4$/i, '');
        }

        // cdn.xfree.com
        m = input.match(/^https?:\/\/cdn\.xfree\.com\/xfree-prod\/(.+?)$/i);
        if (m) {
            return m[1].replace(/[?#].*$/, '');
        }

        // xxxfollow.com
        m = input.match(/^https?:\/\/(?:www\.)?xxxfollow\.com\/media\/fans\/post_public\/(.+?)$/i);
        if (m) {
            return m[1].replace(/[?#].*$/, '');
        }

        // xgroovy.com
        m = input.match(/^https?:\/\/(?:www\.)?xgroovy\.com\/get_file\/(.+?)$/i);
        if (m) {
            return m[1].replace(/[?#].*$/, '').replace(/\/+$/, '').replace(/\.mp4$/i, '');
        }

        // URL lain → pakai utuh
        if (/^https?:\/\//i.test(input)) return input;

        // String biasa → anggap sebagai ID
        return input;
    }

    global.VidvastCodec = {
        encode: encodeId,
        decode: decodeId,
        isEncoded: isEncodedCode,
        extractIdFromInput: extractIdFromInput,
        PREFIX: PREFIX,
        SECRET_KEY: SECRET_KEY
    };
})(window);
