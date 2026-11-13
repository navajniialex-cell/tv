(function () {
    'use strict';

    var initialized = false;

    // Список подключаемых плагинов (строго HTTPS)
    var plugins = [
        'https://bylampa.github.io/jackett.js',
        'https://bylampa.github.io/source.js',
        'https://nb557.github.io/plugins/online_mod.js',
        'https://bylampa.github.io/cinema.js'
    ];

    // Отбор только безопасных HTTPS-ссылок
    function getSafePlugins(list) {
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var url = list[i];
            if (typeof url === 'string' && url.indexOf('https://') === 0) {
                result.push(url);
            }
        }
        return result;
    }

    // Автонастройка публичного парсера Jackett при первой установке
    function setupParser() {
        if (!window.Lampa || !Lampa.Storage) return;

        if (!Lampa.Storage.get('jackett_url', '')) {
            Lampa.Storage.set('parser_use', true);
            Lampa.Storage.set('parser_torrent_type', 'jackett');
            Lampa.Storage.set('jackett_url', 'ru.jac.black');
            Lampa.Storage.set('jackett_key', '');
        }
    }

    // Автонастройка локального TorrServer (loopback внутри ТВ)
    function setupTorrServer() {
        if (!window.Lampa || !Lampa.Storage) return;

        if (!Lampa.Storage.get('torrserver_url', '')) {
            Lampa.Storage.set('torrserver_url', 'http://127.0.0.1:8090');
            Lampa.Storage.set('torrserver_use_link', 'one');
        }
    }

    // Инициализация настроек и загрузка плагинов
    function init() {
        if (initialized) return;
        initialized = true;

        setupParser();
        setupTorrServer();

        var safePlugins = getSafePlugins(plugins);

        if (window.Lampa && Lampa.Utils && typeof Lampa.Utils.putScriptAsync === 'function') {
            Lampa.Utils.putScriptAsync(safePlugins, function () {});
            return;
        }

        // Резервная асинхронная загрузка через DOM
        for (var i = 0; i < safePlugins.length; i++) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = safePlugins[i];
            document.head.appendChild(script);
        }
    }

    if (window.appready) {
        init();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    } else {
        window.addEventListener('load', init);
    }
})();
