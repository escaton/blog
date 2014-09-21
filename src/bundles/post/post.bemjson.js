({
    block: 'b-page',
    title: 'Title!',
    head: [
        { elem: 'css', url: '_post' + '.css', ie: false },
        { elem: 'css', url: '_post', ie: true },
        { elem: 'css', url: 'https://yastatic.net/highlightjs/8.2/styles/monokai.min.css' },
        { elem: 'js', url: 'https://yastatic.net/highlightjs/8.2/highlight.min.js' },
        { elem: 'js', url: 'https://yastatic.net/jquery/1.8.3/jquery.min.js' },
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
                                    content: 'Заголовок'
                                },
                                {
                                    elem: 'body',
                                    content: [
                                        'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <img class="post__img" src="http://catethysis.ru/wp-content/uploads/2014/09/mq135.png" /> Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. <img class="post__img" src="http://catethysis.ru/wp-content/uploads/2014/09/mq135.png" />',
                                        {
                                            elem: 'code',
                                            content: [
                                                'uint16_t getCO2Level()\n',
                                                '    {\n',
                                                '    ADC_SoftwareStartConvCmd(ADC1, ENABLE);\n',
                                                '    while(ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET);\n',
                                                '    return ADC_GetConversionValue(ADC1);\n',
                                                '}'
                                            ]
                                        }
                                    ]
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
