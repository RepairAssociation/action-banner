# Right to Repair Action Banner

(Forked and modified from [Fight for the Future's Digital Climate Strike Banner](https://github.com/fightforthefuture/digital-climate-strike))
which was inspired by the [Fight for the Future Red Alert widget](https://github.com/fightforthefuture/redalert-widget).

This is the source code for the activismbanner that will allow anyone with a website to show support for the RIght to Repair bill. [Click here to learn more.](https://repair.org)

## How to install the widget on your site

### Option 1:
   Add this one line of JavaScript to any page, and you're good to go:

```html
<script src="https://assets.repair.org/widget.js" async></script>
```

### Option 2 (Self-Hosted):
    1. Clone the repo with command `git clone https://github.com/RepairAssociation/action-banner.git`.
    2. Inside the project's folder, run 'npm install && npm run build'. A folder named 'dist' will be generated.
    3. Copy the files index.html and widget.js from dist into your site's folder.
    4. Configure the 'iframeHost' option, as described in the section about `REPAIR_ORG_OPTIONS`.
    5. Include the widget anywhere on your site with <script src="widget.js" async></script>

You can change the user experience and do some customization via the `REPAIR_ORG_OPTIONS` [described below](#customization-options). Before adding the widget make sure you have also read the [section below](#important-note-regarding-google-analytics-tracking) about Google Analytics tracking.  

If you have any problems or questions regarding the widget, please [submit an issue](https://github.com/RepairAssociation/action-banner/issues).

## How it works & Demo

When you add [**widget.js**](https://github.com/RepairAssociation/action-banner/blob/master/static/widget.js) to your site it will show a footer banner ([demo](https://assets.repair.org/demo.html)) informing visitors that your site is supporting the Right to Repair and directs them to take action in their state:

![A screenshot of the Action Banner footer widget](https://cdn-std.droplr.net/files/acc_465612/0R4tFj)

You can demo the widget in different languages by adding a 'language' parameter to the URL. ([Example](https://assets.repair.org/demo.html?fullPage&language=de)) 

The widget is designed to appear once per user, per device, per day, but can be configured to display at a different interval. If you'd like to force it to show up on your page for testing, reload the page with `#ALWAYS_SHOW_REPAIR_ORG` at the end of the URL.

Please take a look at [**widget.js**](https://github.com/RepairAssociation/action-banner/blob/master/static/widget.js) if you want to see exactly what you're embedding on your page.

The widget is compatible with Firefox, Chrome (desktop and mobile), Safari (desktop and mobile), Microsoft Edge, and Internet Explorer 11.

## Customization options

If you define an object called `REPAIR_ORG_OPTIONS` before including the widget code, you can pass some properties in to customize the default behavior.

```html
<script type="text/javascript">
  var REPAIR_ORG_OPTIONS = {
    /**
     * Specify view cookie expiration. After initial view, widget will not be
     * displayed to a user again until after this cookie expires. Defaults to 
     * one day.
     */
    cookieExpirationDays: 1, // @type {number}
     
    /**
     * Allow you to override the iFrame hostname. Defaults to https://assets.repair.org  
     */
    iframeHost: 'https://assets.repair.org', // @type {string}

    /**
     * Prevents the widget iframe from loading Google Analytics. Defaults to
     * false. (Google Analytics will also be disabled if doNotTrack is set on
     * the user's browser.)
     */
    disableGoogleAnalytics: false, // @type {boolean}

    /**
     * Always show the widget, except when someone has closed the widget and set the cookie on their device. 
     * Useful for testing. Defaults to false.
     */
    alwaysShowWidget: false, // @type {boolean}
    
    /** 
     * Disable GeoIP state lookup.  We make a call to a Repair Association server to do a GeoIP lookup on the IP address
     * of the visitor so we can direct them to their state specific bill.  If you don't feel comfortable with this, you can disable.
     */
    disableGeoIP: false
  };
</script>
<script src="https://assets.repair.org/widget.js" async></script>
```
## Important note regarding Google Analytics tracking

As you can see in the `REPAIR_ORG_OPTIONS` above, Google Analytics is configured by default to post events when the widget is shown and when any of the buttons are clicked. See [**index.js**](https://github.com/RepairAssociation/action-banner/blob/master/src/index.js) for more details. The reasons for this are outlined in Issue [#76](https://github.com/RepairAssociation/action-banner/issues/76). If you would like to disable this please add the widget to your site with the following configuration: 

```html
<script type="text/javascript">
  var REPAIR_ORG_OPTIONS = {
    disableGoogleAnalytics: true
  };
</script>

<script src="https://assets.digitalclimatestrike.net/widget.js" async></script>
```  

