
$(function() {
    // グローバルナビゲーション
    $('a[href="#nav-item-dropdown"]').on('click', function() {
        var dropdown = $(this).next('.drop-nv-wrap');
        if ($(dropdown).css('display') == 'none') {
            $(dropdown).fadeIn('fast');
        } else {
            $(dropdown).fadeOut('fast');
        }
        $('.article-title-pc').toggleClass('open');
        return false;
    });

    // ハンバーガーメニュー
    $('.menu-trigger').on('click', function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('nav').removeClass('open');
        } else {
            $(this).addClass('active');
            $('nav').addClass('open');
        }
    });
    $('.article-title').on('click', function() {
        $(this).next().slideToggle(200);
        $(this).toggleClass('open');
    });

    // 検索ボックス
    $('.search-keyword').on('keypress', function(e) {
        if (e.keyCode == 13) {
            var index = $('.search-keyword').index(this);
            $('.search-url').get(index).click();
        }
    });
    $('.search-icon').on('click', function() {
        $('.search-box').animate({ width: 'toggle' }, 'slow');
    });
    $('.close').on('click', function() {
        $('.search-box').fadeOut('slow');  
    });

    // カレンダー特定日の設定
    $('.dayList').each(function() {
        var month = $(this).attr('data-month');
        var day = $(this).attr('data-day');
        var color = $(this).attr('data-color');
        $('.makeshop-calendar' + month +' .day' + day).css({
            'background-color': color,
            'color': '#fff',
            'font-weight': 'bold'
        });
    });

    // WebFont
    WebFontConfig = {
        google: {
            families: ['Noto+Sans+JP', 'Roboto']
        }
    };
    (function (d) {
        var wf = d.createElement('script'), s = d.scripts[0];
        wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
        wf.async = true;
        s.parentNode.insertBefore(wf, s);
    })(document);
});
