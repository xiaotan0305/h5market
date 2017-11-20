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
        swiperAni: 'plugin/swiper.animate'

    },
    map: [function (uri) {
        return uri.match(/photoswipe|swiper|smsLogin/) ? uri + '?_' + imgVer : uri;
    }],
    debug: true
});