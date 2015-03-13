
// ----------------------------------------------------------------------------
// EXTENSION FRAMEWORK
// copyright by Stefan Walther, 2013
// ----------------------------------------------------------------------------
// This extension framework is a progress in work and I expect to publish it
// in Q4/2013, so stay tuned.
// ----------------------------------------------------------------------------
// Version Log:
// 
// 0.1.2:
//      - Reformatting
//
// 0.1.1:
//      - Added console.table support
//
// 0.1.0:
//      - Complete Rewrite using prototype pattern
//      - Added Utils
//
// 0.0.7:
//      - Added Settings.getValue()
//
// 0.0.6:
//      - Changed "config.Version" to "config.extensionVersion"
//
// 0.0.5:
//      - Changed Sample Scripts.js to work properly with .initialize()
//
//  0.0.4:
//      - Adding support loading pane feature
// 
//  0.0.3: 
//      - Adding support for validation rules
//
//  0.0.2:
//      - Initial try
//      - basic support for persisting settings
// ----------------------------------------------------------------------------

// Todos:
// Overload getBool with default value
// Overload getDefPropBool with default value

// ----------------------------------------------------------------------------
// Main Code
// ----------------------------------------------------------------------------
function QvExtensionFramework2() {

    this.config = {
        UniqueId: null,
        qvExtension: null,
        extensionName: 'No defined',
        doClearConsoleOnInit: false,
        doPersistSettings: true,
        extensionVersion: undefined,
        extensionFWVersion: '0.1.0',
        doConsoleOutput: true,
        doTraceOutput: true,
        enableLoadingPanel: true
    };

    // --------------------------------------------------------------------//
    // ----------------------------- HELPER -------------------------------//
    // --------------------------------------------------------------------//
    //#region Helper
    // ~~
    // Extend object a with the properties of object b.
    // If there's a conflict, object b takes precedence.
    // ~~
    this.extend = function (a, b) {
        for (var i in b) {
            a[i] = b[i];
        }
    };
    //#endregion
    
}

QvExtensionFramework2.prototype.config = function () {
    return this.config;
};

QvExtensionFramework2.prototype.log = function (msg) {
    /// <summary>
    /// Shortcut to Console.log
    /// </summary>
    /// <param name="msg">Log message.</param>
    this.Console.log(msg);
};

QvExtensionFramework2.prototype.trace = function (msg) {
    this.Console.trace(msg);
};

QvExtensionFramework2.prototype.initialize = function (config) {
    // merge default props and passed props
    this.extend(this.config, config);

    // Object Initialization
    this.Console = new Console(this);
    this.Settings = new Settings(this);
    this.Utils = new Utils(this);
    this.ValidationErrors = new ValidationErrors(this);
    this.LoadingPanel = new LoadingPanel(this);

    this.NotificationPanel = new NotificationPanel(this);
};


// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------
//#region Settings

function Settings(that) {

    this.DefPropValues = {};
    this.root = that;
    this.DefinitionProperties = [];

    if ((!this.root.config.doPersistSettings === true)) {
        if (typeof this.root.config.qvExtension !== 'undefined') {
            this.root.trace('Set PersistentSettings object');
            this.root.config.qvExtension.PersistentSettings = {};
        }
    }

    if (typeof this.root.config.qvExtension.PersistentSettings === 'undefined') {
        this.root.config.qvExtension.PersistentSettings = {};
    }

}

Settings.prototype.getUniqueId = function () {
    var u = this.root.config.qvExtension.Layout.ObjectId.replace("\\", "_");
    return u;
};

Settings.prototype.add = function (key, o) {
    this.root.config.qvExtension.PersistentSettings[key] = o;
};

Settings.prototype.get = function (key) {
    //this.root.trace('Settings.get(\'' + key + '\'): ' + this.root.config.qvExtension.PersistentSettings[key]);
    return this.root.config.qvExtension.PersistentSettings[key];
};

Settings.prototype.getBool = function (key) {
    var raw = this.get(key);
    return this.root.Utils.isBool(raw);
};

Settings.prototype.getDefPropValue = function (key) {
    var raw = this.DefinitionProperties[key];

    if (raw === void 0) {
        throw new Error('Could find a definition property with key \"' + key + '\"');
        return null;
    } else {
        var r = this.root.config.qvExtension.Layout['Text' + raw.index].text;
        if (this.root.Utils.nullOrEmpty(r)) {
            r = raw.defaultValue;
        }
        this.root.Console.trace('Settings.getDefPropValue(\'' + key + '\'): ' + r);
        return r;
    }
    

    //return;
    //if (raw !== 'undefined' && raw !== null) {
    //    this.root.Console.trace('Settings.getDefPropValue(\'' + key + '\').rawValue: ' + this.o(raw.rawValue));
    //    this.root.Console.trace('Settings.getDefPropValue(\'' + key + '\').defaultValue: ' + this.o(raw.defaultValue));

    //    if (raw.rawValue !== 'undefined') {
    //        return raw.rawValue;
    //    }
    //    else {
    //        return raw.defaultValue;
    //    }
    //}
    //return null;
};

Settings.prototype.getDefPropValueBool = function (key) {
    return this.root.Utils.isBool(this.getDefPropValue(key));
};

Settings.prototype.o = function (o) {
    if (o !== 'undefined' && o !== null) {
        return o;
    }
    else {
        return 'undefined/null';
    }
};

Settings.prototype.remove = function (key) {
    this.root.config.qvExtension.PersistentSettings[key] = undefined;
};

Settings.prototype.addDefProp = function (key, idx, defaultValue) {
    var o = {};
    o.index = idx;
    o.defaultValue = defaultValue;
    this.DefinitionProperties[key] = o;
};

Settings.prototype.initDefProps = function () {
    for (var i in this.DefinitionProperties) {
        var o = {};
        o = this.DefinitionProperties[i];

        var objKey = 'Text' + this.DefinitionProperties[i].index;
        if (this.root.config.qvExtension.Layout[objKey]) {
            var obj = this.root.config.qvExtension.Layout[objKey];
            o.rawValue = obj.text;          // Original value
            o.found = true;                 // Object found
            o.validated = false;            // just initialized
            o.valid = true;                 // true, until falsified
        }
        else {
            o.rawValue = null;              // not original value
            o.found = false;                // Indicating, that the object could not be found
            o.validated = false;            // cannot be validated, if not found
            o.valid = false;                // cannot be valid, if not found

        }
        this.DefPropValues[i] = o;
    }
    //validateDefProps();
};
//#endregion (Settings)

// ----------------------------------------------------------------------------
// Notification Panel
// ----------------------------------------------------------------------------
//#region Notification Panel
function NotificationPanel(that) {
    this.root = that;
    this._PanelId = 'QvExtFW_NotificationPanel_Container_' + this.root.Settings.getUniqueId();

    this._init();
    this.hide();
}
NotificationPanel.prototype._init = function () {

    // Add the notification panel to DOM
    this.root.trace('Init Notification Panel for ' + this._PanelId);
    if ($('#' + this._PanelId).length === 0) {
        var $divNotificationPanel = $(document.createElement("div"));
        $divNotificationPanel.attr('id', this._PanelId);
        $divNotificationPanel.addClass("QvExtFW_NotificationPanel_Container");
        $divNotificationPanel.hide();
        $divNotificationPanel.css("zIndex", 100);
        $divNotificationPanel.text('bla bla');
        $(this.root.config.qvExtension.Element).append($divNotificationPanel);
    }

};

NotificationPanel.prototype._getStatusClass = function (status) {

    if (typeof status == 'undefined') {
        status = 'OK';
    }

    var cssClass = 'QvExtFW_Status_' + status.toLowerCase();
    return cssClass;
};

NotificationPanel.prototype.hide = function () {
    var $target = $('#' + this._PanelId);
    $target.hide();
};

NotificationPanel.prototype.show = function (msg, status) {

    var cssClass = this._getStatusClass(status);

    this.root.log('NotificationPanel.show()');
    this.root.log($('#' + this._PanelId));

    var $target = $('#' + this._PanelId);
    $target.removeClassRegex(/^QvExtFW_Status_/);
    $target.addClass(cssClass);
    $target.text(msg);
    $target.show();
};

NotificationPanel.prototype.popup = function (msg, status, delayMs, fadeoutMs) {
    if (typeof delayMs === 'undefined') {
        delayMs = 500;
    }
    if (typeof fadeoutMs === 'undefined') {
        fadeoutMs = 5000;
    }
    if (typeof delay) 
        var $target = $('#' + this._PanelId);
    var cssClass = this._getStatusClass(status);
    $target.removeClassRegex(/^QvExtFW_Status_/);
    $target.addClass(cssClass);
    $target.text(msg);
    $target.fadeIn(300).delay(delayMs).fadeOut(fadeoutMs);
};

//#endregion (Notification Panel)

// ----------------------------------------------------------------------------
// Loading Panel
// ----------------------------------------------------------------------------
//#region Loading Panel
function LoadingPanel(that) {
    this.root = that;
    this._enabled = that.config.enableLoadingPanel;
    this._intialized = false;
    this._PanelId = 'LoadingPanel_' + this.root.Settings.getUniqueId();
    if (!this._intialized) {
        this.init();
    }

}

LoadingPanel.prototype.enable = function () {
    this._enabled = true;
};

LoadingPanel.prototype.disable = function () {
    this._enabled = false;
};

LoadingPanel.prototype.init = function () {
    this._ensurePanel();
    this._addEvents();
    this._intialized = true;

};

LoadingPanel.prototype._ensurePanel = function () {

    if (this._enabled) {

        if (!($('#' + this._PanelId).length > 0)) {

            var $loadingPanel = $(document.createElement('div'));
            $loadingPanel.attr('id', this._PanelId);
            $loadingPanel.addClass('QvExtFW_LoadingPanel');
            $loadingPanel.css('background-url', 'http://sampsonresume.com/labs/pIkfp.gif');
            $loadingPanel.hide();

            $(this.root.config.qvExtension.Element).append($loadingPanel);
        }
    }
};

LoadingPanel.prototype.show = function (msg) {
    this.showHide(true, msg);
};

LoadingPanel.prototype.hide = function () {

    // Always hide, even if disabled
    this.showHide(false);

};

LoadingPanel.prototype.showHide = function (visible, msg) {

    var $loadingPanel = $('#' + this._PanelId);
    this.root.log('visible: ' + visible);
    if (visible) {
        this.root.log('LoadingPanel.show()');
        this.root.log('enabled: ' + this._enabled);
        this.root.log($loadingPanel);
        this.root.log($(this.root.config.qvExtension.Element).position());
        $loadingPanel.text(msg);
        $loadingPanel.css('top', '100px');
        $loadingPanel.css('left', '100px');
        $loadingPanel.addClass("QvExtFW_Loading");
        $loadingPanel.show(msg);
    }
    else {
        $loadingPanel.removeClass("QvExtFW_Loading");
        $loadingPanel.hide();
    }
};

LoadingPanel.prototype._addEvents = function () {

    //if (this.root.config.enableLoadingPanel) {
    //    $(this.root.config.qvExtension.Element).on({
    //        // When ajaxStart is fired, add 'loading' to body class
    //        ajaxStart: function () {
    //            $(this).addClass("QvExtFW_Loading");
    //        },
    //        // When ajaxStop is fired, rmeove 'loading' from body class
    //        ajaxStop: function () {
    //            $(this).removeClass("QvExtFW_Loading");
    //        }
    //    });
    //}
};
//#endregion (Loading Panel)


// ----------------------------------------------------------------------------
// Validation Errors
// ~~
// Todos:
//      - Count
// ----------------------------------------------------------------------------
//#region Validation Errors
function ValidationErrors(that) {
    this.root = that;
    this.err = [];
    this.init();
}

ValidationErrors.prototype.init = function () {
    this._reset();
};

ValidationErrors.prototype._reset = function () {
    this.root.Console.traceGroupStart('Init Validation Errors');
    this.err = [];
    this.clearOutput();
    this.root.Console.traceGroupEnd();
};

ValidationErrors.prototype.add = function (msg) {
    this.err.push(msg);
};

ValidationErrors.prototype.count = function () {

    return this.err.length();
};

ValidationErrors.prototype.display = function () {

    this.ensureContainer();
    if (this.err.length > 0) {
        this.root.Console.info('Display validation errors');
        for (var item in this.err) {
            this._addItem(this.err[item]);
            this.root.Console.log(this.err[item]);
        }
        $('#' + 'extFW_ValidationMsg_' + this.root.Settings.getUniqueId()).show();
    }
    else {
        $('#' + 'extFW_ValidationMsg_' + this.root.Settings.getUniqueId()).hide();
    }
    return this.err.length;
};

ValidationErrors.prototype.clearOutput = function () {
    $('#' + 'ValidationMsg_Items_' + this.root.Settings.getUniqueId()).empty();
};

ValidationErrors.prototype._addItem = function (msg) {
    var $item = $(document.createElement('li'));
    $item.text(msg);
    $('#' + 'ValidationMsg_Items_' + this.root.Settings.getUniqueId()).append($item);
};


ValidationErrors.prototype.ensureContainer = function () {
    /// <summary>
    /// Container for displaying ValidationError Messages
    /// </summary>
    var s = 'extFW_ValidationMsg_' + this.root.Settings.getUniqueId();
    if ($(this.root.config.qvExtension.Element).find('#' + s).length <= 0) {
        var $validationMsg = $(document.createElement('div'));
        $validationMsg.attr('id', 'extFW_ValidationMsg_' + this.root.Settings.getUniqueId());
        $validationMsg.addClass('extFW_ValidationMsg');
        $validationMsg.hide();

        // Close "Button"
        var $validationMsgClose = $(document.createElement('div'));
        $validationMsgClose.addClass('extFW_ValidationMsg_Close');
        $validationMsgClose.text('x');
        $validationMsgClose.attr('clicktarget', 'extFW_ValidationMsg_' + this.root.Settings.getUniqueId());
        $validationMsgClose.click(function () {
            $('#' + $(this).attr('clicktarget')).fadeOut(1000);
        });
        $validationMsg.append($validationMsgClose);

        //Title
        var $validationMsgTitle = $(document.createElement('div'));
        $validationMsgTitle.addClass('extFW_ValidationMsg_Title');
        $validationMsgTitle.text("Actions to be made to get the extension running properly:");
        $validationMsg.append($validationMsgTitle);

        // Item Container
        var $validationMsgItems = $(document.createElement('ul'));
        $validationMsgItems.attr('id', 'ValidationMsg_Items_' + this.root.Settings.getUniqueId());
        $validationMsgItems.addClass('extFW_ValidationMsg_Items');
        $validationMsg.append($validationMsgItems);

        $(this.root.config.qvExtension.Element).append($validationMsg);
    }
};
//#endregion (Validation Errors)


// ----------------------------------------------------------------------------
// Console
// ----------------------------------------------------------------------------
//#region Console
function Console(that) {
    this.root = that;
}
Console.prototype.log = function (msg) {
    if (this.root.config.doConsoleOutput === true && typeof console !== 'undefined' && typeof console.log !== 'undefined') {
        console.log(msg);
    }
};

Console.prototype.trace = function (msg) {
    if (this.root.config.doTraceOutput === true) {
        log(msg);
    }
};

Console.prototype.error = function (msg) {
    if (this.root.config.doConsoleOutput === true && typeof console !== 'undefined' && typeof console.error != 'undefined') {
        console.error(msg);
    }
};

Console.prototype.info = function (msg) {
    if (this.root.config.doConsoleOutput === true && typeof console !== 'undefined' && typeof console.info != 'undefined') {
        console.info(msg);
    }
};

Console.prototype.table = function (obj) {
    if (this.root.config.doConsoleOutput === true && typeof console !== 'undefined') {
        if (typeof console.table != 'undefined') {
            console.table(obj);
        } else {
            console.log(obj);
        }
    }
};

Console.prototype.warn = function (msg) {
    if (this.root.config.doConsoleOutput === true && typeof console != 'undefined' && typeof console.warn != 'undefined') {
        console.warn(msg);
    }
};

Console.prototype.clear = function () {
    if (typeof console != 'undefined' && typeof console.clear != 'undefined') {
        console.clear();
    }
};

Console.prototype.dir = function (o) {
    groupStart(this.root.config.extensionName + '.QvExtensionFramework.config (' + this.root.Settings.getUniqueId() + '): ', true);
    if (this.root.config.doConsoleOutput === true && typeof console != 'undefined') {
        if (typeof console.dir != 'undefined') {
            console.dir(o);
        } else {
            for (var i in o) {
                log("\t" + i + ": " + o[i]);
            }
        }
    }
    groupEnd();
};

Console.prototype.groupCollapsed = function (groupName) {
    if (typeof console != 'undefined' && console.groupCollapsed != 'undefined') {
        console.groupCollapsed(groupName);
    }
    else {
        info(groupName);
    }
};

Console.prototype.traceGroupStart = function (groupName) {
    if (this.root.config.doTraceOutput) {
        this.groupStart(groupName, true);
    }
};

Console.prototype.traceGroupEnd = function (grouName) {
    if (this.root.config.doTraceOutput) {
        this.groupEnd();
    }
};

Console.prototype.groupStart = function (groupName, collapsed) {
    if (this.root.config.doConsoleOutput === true) {

        //if (
        //	(navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        //	||
        //	(navigator.userAgent.toLowerCase().indexOf('msie') > -1)
        //) {
        //	collapsed = false;
        //}

        if (typeof collapsed == 'undefined') {
            collapsed = false;
        }
        // Override
        collapsed = false;

        if (typeof console != 'undefined') {
            if (collapsed === true) {
                if (typeof console.groupCollapsed != 'undefined') {
                    console.groupCollapsed(groupName);
                }
                else {
                    log("(+) Group: " + groupName);
                }
            }
            else {
                if (typeof console.group != "undefined") {
                    console.group(groupName);
                }
                else {
                    log("(+) Group: " + groupName);
                }
            }
        }
    }
};

Console.prototype.groupEnd = function () {
    if (this.root.config.doConsoleOutput === true && typeof console != 'undefined') {
        if (typeof console.groupEnd != 'undefined') {
            console.groupEnd();
        }
        else {
            log("(-) Group end");
        }
    }
};
//#endregion (Console)

// ----------------------------------------------------------------------------
// Utils
// ----------------------------------------------------------------------------
//#region Utils
function Utils(that) {
    this.root = that;
}

Utils.prototype.hashCode = function (s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
};

Utils.prototype.nullOrEmpty = function (o) {
    if (typeof o === 'undefined' || o === null || o.length === 0) {
        return true;
    }
    return false;
};

Utils.prototype.nullToEmptyString = function (o) {
    if (this.nullOrEmpty(o)) {
        return String('');
    }
    return o;
};

Utils.prototype.isBool = function (o) {
    if (!this.nullOrEmpty(o)) {
        switch (String(o).toLowerCase()) {
            case "false": case "no": case "0": case "": return false;
            default: return true;
        }
    }
    return false;
};

Utils.prototype.alertProps = function (o) {
    var sMsg = "";
    for (var key in o) {
        if (o.hasOwnProperty(key)) {
            //alert(key + " -> " + o[key]);
            sMsg += key + " -> " + o[key] + "\n";
        }
    }
    alert(sMsg);
};

//#endregion (Utils)

// ----------------------------------------------------------------------------
// jQuery Extensions
// ----------------------------------------------------------------------------
//#region jQuery Extensions
$.fn.extend({
    hideShow: function (show) {
        if (show) {
            this.show();
        }
        else {
            this.hide();
        }
    }
});

$.fn.toggleCheckbox = function () {
    this.attr('checked', !this.attr('checked'));
};

//http://stackoverflow.com/questions/2644299/jquery-removeclass-wildcard
// Example: color-* = 
// $('#hello').removeClassRegex(/^color-/)
$.fn.removeClassRegex = function (regex) {
    return $(this).removeClass(function (index, classes) {
        return classes.split(/\s+/).filter(function (c) {
            return regex.test(c);
        }).join(' ');
    });
};

jQuery.fn.disableTextSelect = function () {
    return this.each(function () {
        $(this).css({
            'MozUserSelect': 'none',
            'webkitUserSelect': 'none'
        }).attr('unselectable', 'on').bind('selectstart', function () {
            return false;
        });
    });
};

jQuery.fn.enableTextSelect = function () {
    return this.each(function () {
        $(this).css({
            'MozUserSelect': '',
            'webkitUserSelect': ''
        }).attr('unselectable', 'off').unbind('selectstart');
    });
};

jQuery.fn.forceNumericOnly =
function () {
    return this.each(function () {
        $(this).keydown(function (e) {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            return (
                key == 8 ||
                key == 9 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};

//#endregion

//#region jsRender Extensions

if (typeof $.views != 'undefined') {
    $.views.converters("nl", function (val) {
        return val.replace(/(\n)+/g, '<br />');
    });
}

//#endregion

