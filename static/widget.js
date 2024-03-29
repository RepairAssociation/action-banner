(function () {
    'use strict';
    var DOM_ID = 'REPAIR_ORG';
    var IFRAME_ID = 'REPAIR_ORG_IFRAME';
    var CLOSED_COOKIE = '_REPAIR_ORG_WIDGET_CLOSED_';
    var MS_PER_DAY = 86400000;

    // user-configurable options
    var options = window.REPAIR_ORG_OPTIONS || {};
    var iframeHost = 'https://assets.repair.org';
    //var iframeHost = 'http://0.0.0.0:8080';
    var websiteName = options.websiteName || null;
    var states = options.states || [
        'AK',
        'AZ',
        'CO',
        'HI',
        'IL',
        'IN',
        'MA',
        'ME',
        'MI',
        'MS',
        'NH',
        'NJ',
        'NY',
        'OH',
        'OK',
        'OR',
        'PA',
        'RI',
        'TN',
        'VT',
        'WA',
        'WV',
        'MN'
    ];

    var forceFullPageWidget = false; //!!options.forceFullPageWidget;
    var cookieExpirationDays = parseFloat(options.cookieExpirationDays || 1);
    var alwaysShowWidget = !!options.alwaysShowWidget;
    var disableGoogleAnalytics = !!options.disableGoogleAnalytics;
    var showCloseButtonOnFullPageWidget = !!options.showCloseButtonOnFullPageWidget;
    var language = 'en';
    var currentState = null;
    var buttonUrl = 'https://www.repair.org/stand-up';

    function getIframeSrc() {
        var src = iframeHost;
        //src += '/action-banner/dist/index.html?';
        src += '/index.html?';

        var urlParams = [
            ['hostname', window.location.host],
            ['language', language]
        ];

        forceFullPageWidget && urlParams.push(['forceFullPageWidget', 'true']);
        showCloseButtonOnFullPageWidget && urlParams.push(['showCloseButtonOnFullPageWidget', 'true']);
        disableGoogleAnalytics && urlParams.push(['googleAnalytics', 'false']);
        websiteName && urlParams.push(['websiteName', encodeURI(websiteName)]);

        var params = urlParams.map(function (el) {
            return el.join('=');
        });

        return src + params.join('&');
    }

    function createIframe() {
        var wrapper = document.createElement('div');
        var iframe = document.createElement('iframe');

        wrapper.id = DOM_ID;
        iframe.id = IFRAME_ID;
        iframe.src = getIframeSrc();
        iframe.frameBorder = 0;
        iframe.allowTransparency = true;
        wrapper.appendChild(iframe);
        document.body.appendChild(wrapper);
        iframe.contentWindow.focus();

        return iframe;
    }

    function maximize() {
        document.getElementById(DOM_ID).style.width = '100%';
        document.getElementById(DOM_ID).style.height = '100%';
    }

    function closeWindow() {
        document.getElementById(DOM_ID).remove();
        window.removeEventListener('message', receiveMessage);
        setCookie(CLOSED_COOKIE, 'true', cookieExpirationDays);
    }

    function navigateToLink(linkUrl) {
        document.location = linkUrl;
    }

    function injectCSS(id, css) {
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = id;
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        document.head.appendChild(style);
    }

    function setCookie(name, value, expirationDays) {
        var d = new Date();
        d.setTime(d.getTime() + (expirationDays * MS_PER_DAY));

        var expires = 'expires=' + d.toGMTString();
        document.cookie = name + '=' + value + '; ' + expires + '; path=/';
    }

    function getCookie(cookieName) {
        var name = cookieName + '=';
        var ca = document.cookie.split(';');
        var c;

        for (var i = 0; i < ca.length; i++) {
            c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    }

    function receiveMessage(event) {
        if (!event.data.REPAIR_ORG) {
            return;
        }
        /*
        if (event.origin.lastIndexOf(iframeHost, 0) !== 0) {
          return;
        }*/

        switch (event.data.action) {
            case 'resize':
                var iframe = document.getElementById(IFRAME_ID);
                var wrapper = document.getElementById(DOM_ID);

                // space for the shadow
                var iframeHeight = (event.data.iframeHeight + 15);
                iframe.height = iframeHeight + 'px';
                iframe.setAttribute('style', 'width: 100%; height: 100%; min-height: 200px');
                wrapper.setAttribute('style', 'height:' + iframeHeight + 'px');
                return;
            case 'maximize':
                return maximize();
            case 'closeButtonClicked':
                return closeWindow();
            case 'actionClicked':
                return navigateToLink(buttonUrl);
            case 'buttonClicked':
                return navigateToLink(buttonUrl);
        }
    }

    /**
     * There are a few circumstances when the iFrame should be shown:
     * 1. When the CLOSED_COOKIE has NOT been set on that device
     * 2. The alwaysShowWidget is true in the config.
     * 3. We have enabled the banner for that state.
     */
    function shouldShowBanner(state) {
        return alwaysShowWidget || states.indexOf(state.toUpperCase()) !== -1;
    }

    async function initializeInterface() {
      if (!!getCookie(CLOSED_COOKIE)) {
        return;
      }

      try {
        let response = await fetch('https://us-central1-callpower-repair-1548316784218.cloudfunctions.net/geoip-go');

        if (response.status >= 400) {
          throw new Error("Bad response from server");
        }

        response = await response.json();

        let state = response.State;
        let region = response.Region || 'global';

        if (!shouldShowBanner(region)) {
          return;
        }
        createIframe();

        injectCSS('REPAIR_ORG_CSS',
            '#' + DOM_ID + ' { position: fixed; right: 0; left: 0; bottom: 0px; width: 100%; z-index: 20000; -webkit-overflow-scrolling: touch; overflow: hidden; }  ' +
            '#' + IFRAME_ID + ' { width: 100%; height: 100%; }'
        );

        // listen for messages from iframe
        window.addEventListener('message', receiveMessage);

        document.removeEventListener('DOMContentLoaded', initializeInterface);

        if (!state) {
          buttonUrl = 'https://repair.org/stand-up';
        } else {
          buttonUrl = `https://${state.toLowerCase().replace(' ', '')}.repair.org/`;
        }
        buttonUrl += '?utm_campaign=action_banner';
      } catch (err) {
        console.error(err);
      }
    }

    // Wait for DOM content to load.
    switch (document.readyState) {
        case 'complete':
        case 'loaded':
        case 'interactive':
            initializeInterface();
            break;
        default:
            document.addEventListener('DOMContentLoaded', initializeInterface);
    }
})();
