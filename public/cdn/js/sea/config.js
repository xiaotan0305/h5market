seajs.config({
    base: jsbase,
    alias: {
        jquery: 'jquery/2.1.1/jquery',
        jqueryTransit: 'jquery/jquery.transit.min',
        preloader: 'src/preview/preloader',
        card: 'src/preview/card',
        page: 'src/preview/page',
        eleAnimation: 'src/preview/eleAnimation',
        tools: 'src/preview/tools',
        pageeffect: 'src/preview/pageeffect',
        // shape: 'src/preview/shape',
        weixinshare: 'plugin/weixinshare',
        jweixin: 'plugin/jweixin-1.0.0',
        qqapi: 'plugin/qqapi',
        qzapi: 'plugin/qzapi',
        swiper: 'plugin/swiper',
        highcharts: 'plugin/highcharts',
        hammer: 'plugin/hammer.min',
        snabbt: 'plugin/snabbt.js',
        photoswipe: 'plugin/photoswipe.min',
        photoswipeUI: 'plugin/photoswipe-ui-default.min',
        smsLogin: 'plugin/smsLogin',
        swiperAni: 'plugin/swiper.animate',
        // ebook
        ebook_preloader: 'src/ebook/preloader',
        ebook_card: 'src/ebook/card',
        ebook_page: 'src/ebook/page',
        ebook_eleAnimation: 'src/ebook/eleAnimation',
        ebook_tools: 'src/ebook/tools',
        ebook_pageeffect: 'src/ebook/pageeffect',
        turn: 'plugin/turn'
        // ebook_shape: 'src/ebook/shape'

    },
    map: [function(uri) {
        return uri.match(/photoswipe|swiper|smsLogin/) ? uri + '?_' + imgVer : uri;
    }],
    debug: true
});