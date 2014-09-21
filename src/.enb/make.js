module.exports = function(config) {

    config.nodes('bundles/*');

    config.mode('development', function() {
        config.nodeMask(/bundles\/.*/, function(nodeConfig) {
            nodeConfig.addTechs([
                // use('priv', { mode: 'development' }),
                use('copy', { sourceTarget: '?.js', destTarget: '_?.js' }),
                use('copy', { sourceTarget: '?.css', destTarget: '_?.css' }),
                use('copy', { sourceTarget: '?.ie6.css', destTarget: '_?.ie6.css' }),
                use('copy', { sourceTarget: '?.ie7.css', destTarget: '_?.ie7.css' }),
                use('copy', { sourceTarget: '?.ie8.css', destTarget: '_?.ie8.css' }),
                use('copy', { sourceTarget: '?.ie9.css', destTarget: '_?.ie9.css' })
            ]);
        });
    });

    config.mode('production', function() {
        config.nodeMask(/bundles\/.*/, function(nodeConfig) {
            nodeConfig.addTechs([
                // use('priv', { mode: 'production' }),
                use('borschik', { sourceTarget: '?.js', destTarget: '_?.js', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.css', destTarget: '_?.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie6.css', destTarget: '_?.ie6.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie7.css', destTarget: '_?.ie7.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie8.css', destTarget: '_?.ie8.css', minify: true, freeze: true }),
                use('borschik', { sourceTarget: '?.ie9.css', destTarget: '_?.ie9.css', minify: true, freeze: true })
            ]);
        });
    });

    config.nodeMask(/bundles\/.*/, function(nodeConfig) {

        nodeConfig.addTechs([
            use('levels', { levels: getDesktopLevels() }),
            use('provider', { target: '?.bemjson.js' }),
            use('bemdeclFromBemjson'),
            use('deps'),
            use('files'),
            use('bemhtml', { devMode: false }),
            use('html'),
            use('js'),
            use('css'),
            use('css', { sourceSuffixes: ['css', 'ie.css', 'ie6.css'], target: '?.ie6.css' }),
            use('css', { sourceSuffixes: ['css', 'ie.css', 'ie7.css'], target: '?.ie7.css' }),
            use('css', { sourceSuffixes: ['css', 'ie.css', 'ie8.css'], target: '?.ie8.css' }),
            use('css', { sourceSuffixes: ['css', 'ie9.css'], target: '?.ie9.css' })
        ]);
        nodeConfig.addTargets(['_?.js', '_?.css', '_?.ie6.css', '_?.ie7.css', '_?.ie8.css', '_?.ie9.css', '?.bemhtml.js', '?.html']);
    });

    function getDesktopLevels() {
        return [
            { 'path': 'vendors/bem-bl/blocks-common','check':true },
            { 'path': 'vendors/bem-bl/blocks-desktop','check':true },
            { 'path': 'blocks','check':true }
        ].map(function(l) { return config.resolvePath(l); });
    }

    // Хэш технологий
    var techs = {
        levels : require('enb/techs/levels'),
        files : require('enb/techs/files'),
        provider : require('enb/techs/file-provider'),
        bemdeclFromBemjson: require('enb/techs/bemdecl-from-bemjson'),
        copy : require('enb/techs/file-copy'),
        deps : require('enb/techs/deps-old'),
        js : require('enb/techs/js'),
        css : require('enb/techs/css'),
        bemhtml: require('enb-xjst/techs/bemhtml'),
        html: require('enb/techs/html-from-bemjson')
        // borschik : require('enb-borschik/techs/borschik')
    };

/**
* Возвращает объект-технологию для `nodeConfig`
*
* @param {String} tech название технологии
* @param {Object} params параметры для технологии
* @returns {*[]}
*/
    function use(tech, params) {
        return [
            techs[tech],
            params || {}
        ];
    }
};