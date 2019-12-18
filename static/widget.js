(function () {
  'use strict';
  var DOM_ID = 'REPAIR_ORG';
  var CLOSED_COOKIE = '_REPAIR_ORG_WIDGET_CLOSED_';
  var MS_PER_DAY = 86400000;
  var states = [];

  // user-configurable options
  var options = window.REPAIR_ORG_OPTIONS || {};
  var iframeHost = 'http://localhost:63342'; // 'https://assets.repair.org';
  var websiteName = options.websiteName || null;
  var disableGeoIP = !!options.disableGeoIP;
  var forceFullPageWidget = false; //!!options.forceFullPageWidget;
  var cookieExpirationDays = parseFloat(options.cookieExpirationDays || 1);
  var alwaysShowWidget = !!options.alwaysShowWidget;
  var disableGoogleAnalytics = !!options.disableGoogleAnalytics;
  var showCloseButtonOnFullPageWidget = !!options.showCloseButtonOnFullPageWidget;
  var language = 'en';
  var currentState = null;
  var buttonUrl = 'https://repair.org/join';

  function makeStateRequest (callback, error) {
    if (disableGeoIP) {
      callback({});
      return;
    }
    let httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          callback(JSON.parse(httpRequest.responseText));
        } else {
          error(httpRequest);
        }
      }
    };
    httpRequest.open('GET', 'https://us-central1-callpower-repair-1548316784218.cloudfunctions.net/geoip-go');
    httpRequest.send();
  }

  function getIframeSrc () {
    var src = iframeHost;
    src += '/action-banner/dist/index.html?'; // 'index.html?';

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

  function createIframe () {
    var wrapper = document.createElement('div');
    var iframe = document.createElement('iframe');

    wrapper.id = DOM_ID;
    iframe.src = getIframeSrc();
    iframe.frameBorder = 0;
    iframe.allowTransparency = true;
    iframe.onload = function () {
      iframe.height = iframe.contentWindow.document.body.scrollHeight + 'px';
      iframe.setAttribute('style', 'width: 100%;');
      wrapper.setAttribute('style', 'height:' + iframe.contentWindow.document.body.scrollHeight + 'px');
    };
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
    iframe.contentWindow.focus();

    return iframe;
  }

  function maximize () {
    document.getElementById(DOM_ID).style.width = '100%';
    document.getElementById(DOM_ID).style.height = '100%';
  }

  function closeWindow () {
    document.getElementById(DOM_ID).remove();
    window.removeEventListener('message', receiveMessage);
    setCookie(CLOSED_COOKIE, 'true', cookieExpirationDays);
  }

  function navigateToLink (linkUrl) {
    document.location = linkUrl;
  }

  function injectCSS (id, css) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = id;
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    }
    else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
  }

  function setCookie (name, value, expirationDays) {
    var d = new Date();
    d.setTime(d.getTime() + (expirationDays * MS_PER_DAY));

    var expires = 'expires=' + d.toGMTString();
    document.cookie = name + '=' + value + '; ' + expires + '; path=/';
  }

  function getCookie (cookieName) {
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

  function receiveMessage (event) {
    console.log(event);
    if (!event.data.REPAIR_ORG) {
      return;
    }
    if (event.origin.lastIndexOf(iframeHost, 0) !== 0) {
      return;
    }

    switch (event.data.action) {
      case 'maximize':
        return maximize();
      case 'closeButtonClicked':
        return closeWindow();
      case 'actionClicked':
        console.log(buttonUrl);
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
  function shouldShowBanner () {
    return alwaysShowWidget || states.indexOf(currentState) !== -1;
  }

  function initializeInterface () {
    if (!!getCookie(CLOSED_COOKIE)) {
      return;
    }

    makeStateRequest((response) => {
      let state = response.State;
      currentState = response.region;

      if (!shouldShowBanner()) {
        return;
      }

      createIframe();

      injectCSS('REPAIR_ORG_CSS',
        '#' + DOM_ID + ' { position: fixed; right: 0; left: 0; bottom: 0px; width: 100%; z-index: 20000; -webkit-overflow-scrolling: touch; overflow: hidden; } ' //+
        //'#' + DOM_ID + ' iframe { width: 100%; height: 100%; }'
      );

      // listen for messages from iframe
      window.addEventListener('message', receiveMessage);

      document.removeEventListener('DOMContentLoaded', initializeInterface);

      if (!state) {
        buttonUrl = 'https://repair.org/join';
      } else {
        buttonUrl = `https://${state.toLowerCase().replace(' ', '')}.repair.org/`;
      }
      buttonUrl += '?utm_campaign=action_banner';
    }, (err) => {
      console.error(err);
    });
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
