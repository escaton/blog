({
    block: 'b-page',
    title: 'Title!',
    head: [
         { elem: 'css', url: '_index' + '.css', ie: false },
        { elem: 'css', url: '_index', ie: true },
        { elem: 'js', url: '//yastatic.net/jquery/1.8.3/jquery.min.js' },
        { elem: 'js', url: '_index.js' },

        // FIXME: незабываем заменить favicon на иконку своего сервиса
        { elem: 'favicon', url: '' },

        // FIXME: Меты для поисковой оптимизации
        { elem: 'meta', attrs: { name: 'description', content: '' } },
        { elem: 'meta', attrs: { name: 'keywords', content: '' } },

        // FIXME: Меты OpenGraph протокола http://developers.facebook.com/docs/opengraph/
        { elem: 'meta', attrs: { property: 'og:title', content: '' } },
        { elem: 'meta', attrs: { property: 'og:description', content: '' } },
        { elem: 'meta', attrs: { property: 'og:image', content: '' } },
        { elem: 'meta', attrs: { property: 'og:type', content: 'website' } }
    ],
    content: [
        'Post'
    ]
})
