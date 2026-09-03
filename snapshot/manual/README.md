# Pages saved by hand from a browser

Four free pages are linked from the live site, absent from the sitemap, and were
never picked up by the crawl. `privacy.html` has no ordinary link at all - the
footer opens it with JavaScript - which is why nothing found it.

They cannot be fetched from here: this machine's automated requests to
isp-sp.com return 403 (S0-18, our own doing), and working around that is not
something we do on a client's production shop. A person opening the page in a
browser is a different thing entirely, and is how these arrive.

## What to save here

Open each URL in a browser, Ctrl+S, save into this folder:

    https://www.isp-sp.com/html/page4.html      -> page4.html
    https://www.isp-sp.com/html/privacy.html    -> privacy.html
    https://www.isp-sp.com/html/page19.html     -> page19.html
    https://www.isp-sp.com/html/email.html      -> email.html

"HTMLのみ" is enough - the images are not needed, only the markup.

Encoding does not matter. The page is EUC-JP; whatever the browser writes,
tools/convert-freepages.ps1 detects and converts it.

These go through exactly the same pipeline as the crawled pages: the converter
strips the chrome, maps the legacy classes and emits a fragment, so they end up
identical in form to the other 83.
