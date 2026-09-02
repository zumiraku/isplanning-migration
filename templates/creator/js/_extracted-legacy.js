/* <script> blocks lifted out of the free-page bodies.
   REVIEW ONLY - this file is not loaded anywhere. Mostly Basic Mode
   footer helpers (bottom_privercy, bottom_sendmail) that open popups
   which will not exist in Creator Mode. Anything a page genuinely needs
   gets rebuilt, not pasted back. */

/* ===== company ===== */
<script src="/js/jquery/3.7.1/jquery.min.js"></script>
<script src="/js/jqueryplugin/migrate/3.0.0/jquery-migrate-3.0.0.min.js"></script>
<script type="text/javascript" src="/js/jqueryplugin/makeshop_bxslider/4.2.14/jquery.bxslider.min.js"></script>
<script type="text/javascript">
        jQuery.noConflict();
        (function($) {
            $(window).on('load', function(){
                $('#M_slider .M_sliderFirstImage').remove();
                $('#M_slider li').show();
                $('#M_slider').bxSlider({
                    auto: true,
                    pause: 5000,
                    speed: 1500,
                    controls: false,
                    captions: true,
                    mode: 'horizontal'
                });
            });
        })(jQuery);
        </script>
<script>
            function MakeShop_toggleBasketBox(type){
                document.getElementById('M_basketOpenedBox').style.display = type ? 'block' : 'none';
            }
            </script>
<script language="JavaScript">
function top_check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.top_form_log.id.value);
}

function MakeShop_TopSearch(e, id) {
    if(e.type == 'keydown' && e.keyCode != 13){
        return;
    }

    if (!document.getElementById(id)) {
        return;
    }

    document.all_view_top.search.value = document.getElementById(id).value;
    document.all_view_top.submit();
}
</script>
<script>

function check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.search.id.value);
}
function CheckKey_log() {
    key=event.keyCode;
    if (key==13) {
        check_log()
    }
}
function CheckKey_search()
{
    key=event.keyCode;
    if (key==13) {
        document.search.submit();
    }
}
function Search(){
    if (document.search.id || document.search.passwd){
        document.search.id.value = '';
        document.search.passwd.value = '';
    }
    document.search.submit();
}
</script>
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== info ===== */
<script src="/js/jquery/3.7.1/jquery.min.js"></script>
<script src="/js/jqueryplugin/migrate/3.0.0/jquery-migrate-3.0.0.min.js"></script>
<script type="text/javascript" src="/js/jqueryplugin/makeshop_bxslider/4.2.14/jquery.bxslider.min.js"></script>
<script type="text/javascript">
        jQuery.noConflict();
        (function($) {
            $(window).on('load', function(){
                $('#M_slider .M_sliderFirstImage').remove();
                $('#M_slider li').show();
                $('#M_slider').bxSlider({
                    auto: true,
                    pause: 5000,
                    speed: 1500,
                    controls: false,
                    captions: true,
                    mode: 'horizontal'
                });
            });
        })(jQuery);
        </script>
<script>
            function MakeShop_toggleBasketBox(type){
                document.getElementById('M_basketOpenedBox').style.display = type ? 'block' : 'none';
            }
            </script>
<script language="JavaScript">
function top_check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.top_form_log.id.value);
}

function MakeShop_TopSearch(e, id) {
    if(e.type == 'keydown' && e.keyCode != 13){
        return;
    }

    if (!document.getElementById(id)) {
        return;
    }

    document.all_view_top.search.value = document.getElementById(id).value;
    document.all_view_top.submit();
}
</script>
<script>

function check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.search.id.value);
}
function CheckKey_log() {
    key=event.keyCode;
    if (key==13) {
        check_log()
    }
}
function CheckKey_search()
{
    key=event.keyCode;
    if (key==13) {
        document.search.submit();
    }
}
function Search(){
    if (document.search.id || document.search.passwd){
        document.search.id.value = '';
        document.search.passwd.value = '';
    }
    document.search.submit();
}
</script>
/* ===== ordercontract ===== */
<script src="/js/jquery/3.7.1/jquery.min.js"></script>
<script src="/js/jqueryplugin/migrate/3.0.0/jquery-migrate-3.0.0.min.js"></script>
<script type="text/javascript" src="/js/jqueryplugin/makeshop_bxslider/4.2.14/jquery.bxslider.min.js"></script>
<script type="text/javascript">
        jQuery.noConflict();
        (function($) {
            $(window).on('load', function(){
                $('#M_slider .M_sliderFirstImage').remove();
                $('#M_slider li').show();
                $('#M_slider').bxSlider({
                    auto: true,
                    pause: 5000,
                    speed: 1500,
                    controls: false,
                    captions: true,
                    mode: 'horizontal'
                });
            });
        })(jQuery);
        </script>
<script>
            function MakeShop_toggleBasketBox(type){
                document.getElementById('M_basketOpenedBox').style.display = type ? 'block' : 'none';
            }
            </script>
<script language="JavaScript">
function top_check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.top_form_log.id.value);
}

function MakeShop_TopSearch(e, id) {
    if(e.type == 'keydown' && e.keyCode != 13){
        return;
    }

    if (!document.getElementById(id)) {
        return;
    }

    document.all_view_top.search.value = document.getElementById(id).value;
    document.all_view_top.submit();
}
</script>
<script>

function check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.search.id.value);
}
function CheckKey_log() {
    key=event.keyCode;
    if (key==13) {
        check_log()
    }
}
function CheckKey_search()
{
    key=event.keyCode;
    if (key==13) {
        document.search.submit();
    }
}
function Search(){
    if (document.search.id || document.search.passwd){
        document.search.id.value = '';
        document.search.passwd.value = '';
    }
    document.search.submit();
}
</script>
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page12 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page13 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page15 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page16 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page17 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page2 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page3 ===== */
<script type="text/javascript"><!--
function m_win(url,windowname,width,height) {
 var features="location=no, menubar=no, status=yes, scrollbars=yes, resizable=yes, toolbar=no";
 if (width) {
  if (window.screen.width > width)
   features+=", left="+(window.screen.width-width)/2;
  else width=window.screen.width;
  features+=", width="+width;
 }
 if (height) {
  if (window.screen.height > height)
   features+=", top="+(window.screen.height-height)/2;
  else height=window.screen.height;
  features+=", height="+height;
 }
 window.open(url,windowname,features);
}
// --></script>
/* ===== page32 ===== */
<script src="/js/jquery/3.7.1/jquery.min.js"></script>
<script src="/js/jqueryplugin/migrate/3.0.0/jquery-migrate-3.0.0.min.js"></script>
<script type="text/javascript" src="/js/jqueryplugin/makeshop_bxslider/4.2.14/jquery.bxslider.min.js"></script>
<script type="text/javascript">
        jQuery.noConflict();
        (function($) {
            $(window).on('load', function(){
                $('#M_slider .M_sliderFirstImage').remove();
                $('#M_slider li').show();
                $('#M_slider').bxSlider({
                    auto: true,
                    pause: 5000,
                    speed: 1500,
                    controls: false,
                    captions: true,
                    mode: 'horizontal'
                });
            });
        })(jQuery);
        </script>
<script>
            function MakeShop_toggleBasketBox(type){
                document.getElementById('M_basketOpenedBox').style.display = type ? 'block' : 'none';
            }
            </script>
<script language="JavaScript">
function top_check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.top_form_log.id.value);
}

function MakeShop_TopSearch(e, id) {
    if(e.type == 'keydown' && e.keyCode != 13){
        return;
    }

    if (!document.getElementById(id)) {
        return;
    }

    document.all_view_top.search.value = document.getElementById(id).value;
    document.all_view_top.submit();
}
</script>
<script>

function check_log() {
    alert('ログインはSSL対応のログイン画面から行う必要があります。\nログイン画面へ移動します。');
    ssl_login('login', undefined, document.search.id.value);
}
function CheckKey_log() {
    key=event.keyCode;
    if (key==13) {
        check_log()
    }
}
function CheckKey_search()
{
    key=event.keyCode;
    if (key==13) {
        document.search.submit();
    }
}
function Search(){
    if (document.search.id || document.search.passwd){
        document.search.id.value = '';
        document.search.passwd.value = '';
    }
    document.search.submit();
}
</script>
/* ===== page33 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page35 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page36 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page38 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page48 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page56 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page58 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page73 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page74 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page77 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page80 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>
/* ===== page81 ===== */
<script>
        function bottom_privercy() {
            window.open("/html/privacy.html","privercy","height=570,width=640,scrollbars=yes");
        }
        </script>