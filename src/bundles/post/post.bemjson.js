({
    block: 'b-page',
    title: 'Title!',
    head: [
         { elem: 'css', url: '_post' + '.css', ie: false },
        { elem: 'css', url: '_post', ie: true },
        { elem: 'js', url: '//yastatic.net/jquery/1.8.3/jquery.min.js' },
        { elem: 'js', url: '_post.js' },

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
        {
            elem: 'center',
            content: [
                {
                    block: 'header'
                },
                {
                    elem: 'main',
                    content: [
                        {
                            block: 'post',
                            content: [
                                {
                                    elem: 'head',
                                    content: ''
                                },
                                {
                                    elem: 'body',
                                    content: ''
                                }
                            ]
                        }
                    ]
                },
                {
                    block: 'footer'
                }
            ]
        }
    ]
})
