"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
     * The keyboard accessibility manager class
     */
    var KeyboardAccessibilityManager = /** @class */ (function () {
        function KeyboardAccessibilityManager(isGridLayout) {
            this.OnRenderEvent = new ControlsCommon.JSEvent();
            this.OnItemRenderEvent = new ControlsCommon.JSEvent();
            this.isGridLayout = ControlsCommon.Utils.Object.isNullOrUndefined(isGridLayout) ? true : isGridLayout;
        }
        /**
         * Make the element focusable, by setting tabindex attribute to element.
         * @param element The JQuery element
         * @param index The value of the tabindex. Default 0.
        */
        KeyboardAccessibilityManager.SetTabIndex = function (element, tabIndexValue) {
            element.attr(KeyboardAccessibilityManager.tabIndexAttribute, tabIndexValue === undefined ? 0 : tabIndexValue);
        };
        /**
        * Initializes the accessible list control
        */
        KeyboardAccessibilityManager.prototype.initialize = function (accessibleList) {
            var _this = this;
            this.accessibleList = accessibleList;
            this.OnRenderEvent.Add(function (container) {
                _this.onListRenderedHandler(container);
            });
            this.OnItemRenderEvent.Add(function (item) {
                _this.onItemRenderedHandler(item);
            });
        };
        /**
         * Disposes the object.
         */
        KeyboardAccessibilityManager.prototype.dispose = function () {
            this.accessibleList.onRenderedEvent.RemoveAllListeners();
            this.accessibleList.onItemRenderedEvent.RemoveAllListeners();
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(this.itemsList)) {
                this.itemsList.forEach(function (item) { item.getJQueryElement().off("keydown.baseAccessibleList"); });
            }
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(this.listContainer)) {
                this.listContainer.off("keydown.baseAccessibleList");
            }
            this.accessibleList = null;
            this.itemsList = null;
            this.listContainer = null;
        };
        KeyboardAccessibilityManager.prototype.onListRenderedHandler = function (innerContainer) {
            var _this = this;
            this.listContainer = innerContainer;
            this.itemsList = this.accessibleList.getAllAccessibleItems();
            KeyboardAccessibilityManager.SetTabIndex(innerContainer);
            innerContainer.off("keydown.baseAccessibleList");
            innerContainer.on("keydown.baseAccessibleList", (function (e) { return _this.handlerInnerContainerKeyDown(e); }));
        };
        KeyboardAccessibilityManager.prototype.onItemRenderedHandler = function (itemControl) {
            var _this = this;
            var itemInnerContainer = itemControl.getJQueryElement();
            // make item focusable, but not tabbable
            KeyboardAccessibilityManager.SetTabIndex(itemInnerContainer, -1);
            itemInnerContainer.off("keydown.baseAccessibleList");
            itemInnerContainer.on("keydown.baseAccessibleList", (function (e) { return _this.handlerItemControlKeyDown(e, itemControl); }));
        };
        /**
         * Handles keyDown when inner container is focused.
         * @param e Event Object
         */
        KeyboardAccessibilityManager.prototype.handlerInnerContainerKeyDown = function (e) {
            if (e.keyCode !== ControlsCommon.KeyCodes.Left &&
                e.keyCode !== ControlsCommon.KeyCodes.Up &&
                e.keyCode !== ControlsCommon.KeyCodes.Right &&
                e.keyCode !== ControlsCommon.KeyCodes.Down) {
                return;
            }
            if (e.altKey || e.shiftKey || e.ctrlKey || this.itemsList.length === 0) {
                return;
            }
            var selectedItem = this.accessibleList.getSelectedAccesibleItem();
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(selectedItem)) {
                this.handlerItemControlKeyDown(e, selectedItem);
                return;
            }
            var nextItemIndex = 0;
            switch (e.keyCode) {
                case ControlsCommon.KeyCodes.Right:
                case ControlsCommon.KeyCodes.Down:
                    nextItemIndex = 0;
                    break;
                case ControlsCommon.KeyCodes.Left:
                case ControlsCommon.KeyCodes.Up:
                    nextItemIndex = this.itemsList.length - 1;
                    break;
            }
            var item = this.itemsList[nextItemIndex];
            item.focus();
        };
        /**
         * Handles keyDown when one of the items is focused.
         * @param e Event object
         * @param listItem The item
         */
        KeyboardAccessibilityManager.prototype.handlerItemControlKeyDown = function (e, item) {
            if (e.keyCode !== ControlsCommon.KeyCodes.Enter &&
                e.keyCode !== ControlsCommon.KeyCodes.Space &&
                e.keyCode !== ControlsCommon.KeyCodes.Left &&
                e.keyCode !== ControlsCommon.KeyCodes.Up &&
                e.keyCode !== ControlsCommon.KeyCodes.Right &&
                e.keyCode !== ControlsCommon.KeyCodes.Down) {
                return;
            }
            if (e.altKey || e.shiftKey || e.ctrlKey || !this.itemsList.length) {
                return;
            }
            var itemIndex = -1;
            // is not certain the objects implementing IAccessibleItem are equally reference-wise, so the comparision is made against the JQuery elements.
            this.itemsList.some(function (itemList, index) {
                if (item.getJQueryElement() === itemList.getJQueryElement()) {
                    itemIndex = index;
                    return true;
                }
            });
            var nextIndex = 0;
            switch (e.keyCode) {
                case ControlsCommon.KeyCodes.Space:
                case ControlsCommon.KeyCodes.Enter:
                    this.itemsList[itemIndex].click();
                    break;
                case ControlsCommon.KeyCodes.Right:
                    nextIndex = itemIndex + 1;
                    if (nextIndex >= this.itemsList.length) {
                        nextIndex = 0;
                    }
                    this.itemsList[nextIndex].focus();
                    break;
                case ControlsCommon.KeyCodes.Left:
                    nextIndex = itemIndex - 1;
                    if (nextIndex < 0) {
                        nextIndex = this.itemsList.length - 1;
                    }
                    this.itemsList[nextIndex].focus();
                    break;
                case ControlsCommon.KeyCodes.Up:
                case ControlsCommon.KeyCodes.Down:
                    if (this.isGridLayout) {
                        var firstItem = this.itemsList[0];
                        var itemsOnTheFirstRow = 0;
                        this.itemsList.forEach(function (item, index, array) {
                            if (item.getJQueryElement().position().top === firstItem.getJQueryElement().position().top) {
                                itemsOnTheFirstRow++;
                            }
                        });
                        if (this.itemsList.length === itemsOnTheFirstRow) {
                            break;
                        }
                        nextIndex = e.keyCode === ControlsCommon.KeyCodes.Up ?
                            itemIndex - itemsOnTheFirstRow :
                            itemIndex + itemsOnTheFirstRow;
                    }
                    else {
                        nextIndex = e.keyCode === ControlsCommon.KeyCodes.Up ? 0 : -1;
                    }
                    if (nextIndex < 0) {
                        nextIndex = this.itemsList.length - 1;
                    }
                    else if (nextIndex >= this.itemsList.length) {
                        if (item.getJQueryElement().position().top === this.itemsList[this.itemsList.length - 1].getJQueryElement().position().top) {
                            nextIndex = 0;
                        }
                        else {
                            nextIndex = this.itemsList.length - 1;
                        }
                    }
                    this.itemsList[nextIndex].focus();
                    break;
            }
            e.stopPropagation();
        };
        KeyboardAccessibilityManager.tabIndexAttribute = "tabindex";
        return KeyboardAccessibilityManager;
    }());
    ControlsCommon.KeyboardAccessibilityManager = KeyboardAccessibilityManager;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
     * The implementation of accessible item interface
     */
    var AccessibleItem = /** @class */ (function () {
        function AccessibleItem(itemInnerContainer) {
            this.itemInnerContainer = itemInnerContainer;
        }
        /**
         * Focus item
         */
        AccessibleItem.prototype.focus = function () {
            this.itemInnerContainer.focus();
        };
        /**
         * Gets the JQuery element.
         */
        AccessibleItem.prototype.getJQueryElement = function () {
            return this.itemInnerContainer;
        };
        /**
         * Click item
         */
        AccessibleItem.prototype.click = function () {
            this.itemInnerContainer.click();
        };
        return AccessibleItem;
    }());
    ControlsCommon.AccessibleItem = AccessibleItem;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var WebApiConstants = /** @class */ (function () {
        function WebApiConstants() {
        }
        WebApiConstants.ApiPathV90 = "/api/data/v9.0";
        WebApiConstants.OdataUrlMask = "{0}{1}/{2}";
        WebApiConstants.OdataUrlMaskWithFilterExpression = "{0}{1}/{2}?$filter={3}";
        WebApiConstants.OdataUrlMaskWithSelectExpression = "{0}{1}/{2}?$select={3}";
        WebApiConstants.OdataUrlMaskWithId = "{0}{1}/{2}({3})";
        WebApiConstants.OdataUrlMaskForRelationshipEntity = "{0}{1}/{2}({3})/{4}/$ref";
        WebApiConstants.OdataEntityIdHeader = "OData-EntityId";
        WebApiConstants.ODataCommunityDisplayV1FormattedValue = "OData.Community.Display.V1.FormattedValue";
        WebApiConstants.RelationshipNamePropertyField = "@odata.id";
        WebApiConstants.FileEntityLogicalName = "{0}_files";
        WebApiConstants.FileEntityNamePropertyField = "{0}_name";
        WebApiConstants.FileEntityWidthPropertyField = "{0}_width";
        WebApiConstants.FileEntityHeightPropertyField = "{0}_height";
        WebApiConstants.FileEntityRethumbnailPropertyField = "{0}_rethumbnail";
        WebApiConstants.KeywordEntityLogicalName = "{0}_keywords";
        WebApiConstants.KeywordEntityLookupLogicalName = "{0}_keyword";
        WebApiConstants.KeywordFileNavigationLogicalName = "{0}_{0}_keyword_{0}_file";
        WebApiConstants.KeywordEntityNamePropertyField = "{0}_name";
        return WebApiConstants;
    }());
    ControlsCommon.WebApiConstants = WebApiConstants;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var ArrayQuery = /** @class */ (function () {
            function ArrayQuery(data) {
                this.data = data;
            }
            ArrayQuery.prototype.set = function (element, index) {
                this.data[index] = element;
            };
            ArrayQuery.prototype.get = function (index) {
                return this.data[index];
            };
            ArrayQuery.prototype.add = function (element) {
                this.data.push(element);
            };
            ArrayQuery.prototype.addRange = function (elements) {
                return new ArrayQuery(this.data.concat(elements));
            };
            ArrayQuery.prototype.removeAt = function (index) {
                this.data.splice(index, 1);
            };
            ArrayQuery.prototype.remove = function (element) {
                var hasMoreElements = true;
                while (hasMoreElements) {
                    var index = this.data.indexOf(element);
                    if (index > -1) {
                        this.removeAt(index);
                    }
                    else {
                        hasMoreElements = false;
                    }
                }
            };
            ArrayQuery.prototype.select = function (selector) {
                var temp = [];
                for (var i = 0; i < this.data.length; i++) {
                    var value = selector(this.data[i], i);
                    temp.push(value);
                }
                return new ArrayQuery(temp);
            };
            ArrayQuery.prototype.reverseEach = function (delegate) {
                for (var i = this.data.length - 1; i >= 0; i--) {
                    delegate(this.data[i], i);
                }
                return this;
            };
            ArrayQuery.prototype.each = function (delegate) {
                for (var i = 0; i < this.data.length; i++) {
                    delegate(this.data[i], i);
                }
                return this;
            };
            ArrayQuery.prototype.where = function (selector) {
                var temp = [];
                for (var i = 0; i < this.data.length; i++) {
                    if (selector(this.data[i])) {
                        temp.push(this.data[i]);
                    }
                }
                return new ArrayQuery(temp);
            };
            ArrayQuery.prototype.firstOrDefault = function (selector) {
                if (Utils.Object.isNullOrUndefined(selector)) {
                    if (this.items().length > 0) {
                        return this.items()[0];
                    }
                    else {
                        return null;
                    }
                }
                var list = this.where(selector).items();
                if (list.length > 0) {
                    return list[0];
                }
                return null;
            };
            ArrayQuery.prototype.contains = function (selector) {
                return this.firstOrDefault(selector) != null;
            };
            ArrayQuery.prototype.items = function () {
                return this.data;
            };
            ArrayQuery.prototype.count = function () {
                return this.data.length;
            };
            ArrayQuery.prototype.distinct = function (comparer) {
                var temp = [];
                for (var i = 0; i < this.data.length; i++) {
                    var isDuplicate = false;
                    for (var j = 0; j < temp.length; j++) {
                        if (comparer(this.data[i], temp[j])) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    if (!isDuplicate) {
                        temp.push(this.data[i]);
                    }
                }
                return new ArrayQuery(temp);
            };
            ArrayQuery.prototype.clear = function () {
                this.data = [];
            };
            return ArrayQuery;
        }());
        Utils.ArrayQuery = ArrayQuery;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var DomUtilsInstance = /** @class */ (function () {
            function DomUtilsInstance() {
            }
            /**
             * Creates a script element with the specified URL.
             * @param id The id.
             * @param url The url.
             * @param doc The document.
            */
            DomUtilsInstance.prototype.createScriptElementFromUrl = function (id, url, doc) {
                return Utils.DomUtils.createScriptElementFromUrl(id, url, doc);
            };
            /**
             * Creates a style sheet link element with the specified URL.
             * @param url The url.
             * @param doc The document.
            */
            DomUtilsInstance.prototype.createStyleSheetLinkElementFromUrl = function (url, doc) {
                return Utils.DomUtils.createStyleSheetLinkElementFromUrl(url, doc);
            };
            /**
             * Gets all of the script tags from the input document or the global document if input document is null.
             * @param doc The document.
             */
            DomUtilsInstance.prototype.getScriptElements = function (doc) {
                return Utils.DomUtils.getScriptElements(doc);
            };
            return DomUtilsInstance;
        }());
        Utils.DomUtilsInstance = DomUtilsInstance;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="DomUtils.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var iFrameHtmlTemplate = '<div><iframe src="about:blank" style="width:1024px;height:10000px;" frameBorder="0" sandbox="allow-same-origin" tabindex="-1"></iframe></div>';
        /**
         * Defines DOM utils class.
         */
        var DomUtils = /** @class */ (function () {
            function DomUtils() {
            }
            DomUtils.getInstance = function () {
                return DomUtils.domUtilsInstance;
            };
            /**
             * Render html into iframe and scale to fit the container width.
             */
            DomUtils.renderHtmlInChildIframe = function (container, html, clientUrl) {
                // Create HTML template.
                var element = $(iFrameHtmlTemplate);
                var iframe = (element.find("iframe").get(0));
                // Append the iframe to the container
                container.append(element);
                iframe.onload = function () {
                    iframe.onload = null;
                    // Write HTML.
                    var contentWindow = iframe.contentWindow;
                    contentWindow.document.open('text/html', 'replace');
                    contentWindow.document.write(html);
                    contentWindow.document.close();
                };
                iframe.src = "about:blank";
                // Must be set before getting widths to get the good value.
                element.css("position", "absolute");
                // Get actual and required width.
                var displayWidth = container.width();
                var dataWidth = $(iframe).width();
                // Calculate scale.
                var scaleX = displayWidth / dataWidth;
                // Append scaling.
                element.css("overflow", "visible");
                element.css("transform", "scale(" + scaleX + ")");
                element.css("transform-origin", "0 0");
            };
            /**
             * Creates a script element with the specified URL.
             * @param id The id.
             * @param url The url.
             * @param doc The document.
            */
            DomUtils.createScriptElementFromUrl = function (id, url, doc) {
                var currentDocument = DomUtils.getDocOrCurrent(doc);
                var scriptElement = currentDocument.createElement("script");
                scriptElement.setAttribute('type', 'text/javascript');
                scriptElement.setAttribute('src', url);
                scriptElement.setAttribute('id', id);
                return scriptElement;
            };
            /**
             * Creates a style sheet link element with the specified URL.
             * @param url The url.
             * @param doc The document.
            */
            DomUtils.createStyleSheetLinkElementFromUrl = function (url, doc) {
                var currentDocument = DomUtils.getDocOrCurrent(doc);
                var linkElement = currentDocument.createElement("link");
                linkElement.setAttribute('href', url);
                linkElement.setAttribute('rel', 'stylesheet');
                return linkElement;
            };
            /**
             * Gets all of the script tags from the input document or the global document if input document is null.
             * @param doc The document.
             */
            DomUtils.getScriptElements = function (doc) {
                var currentDocument = DomUtils.getDocOrCurrent(doc);
                var scriptElements = currentDocument.getElementsByTagName("script");
                var result = new Array(scriptElements.length);
                for (var i = 0; i < scriptElements.length; ++i) {
                    result[i] = scriptElements[i];
                }
                return result;
            };
            /**
             * Checks if a stylesheet link element exists within document.
            */
            DomUtils.stylesheetLinkElementExists = function (cssFileName, doc) {
                return this.elementExists("link[href$='/" + cssFileName + "']", doc);
            };
            /**
             * Checks if a script element exists within document.
            */
            DomUtils.scriptElementExists = function (scriptFileName, id, doc) {
                var queryString = "script[src$='/" + scriptFileName + "'][id$='" + id + "']";
                return this.elementExists(queryString, doc);
            };
            DomUtils.elementExists = function (querySelectorString, doc) {
                var currentDocument = DomUtils.getDocOrCurrent(doc);
                return !Utils.Object.isNullOrUndefined(currentDocument.querySelector(querySelectorString));
            };
            DomUtils.getDocOrCurrent = function (doc) {
                return Utils.Object.isNullOrUndefined(doc) ? document : doc;
            };
            DomUtils.domUtilsInstance = new Utils.DomUtilsInstance();
            return DomUtils;
        }());
        Utils.DomUtils = DomUtils;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
        * Object helper methods.
        */
        var Object = /** @class */ (function () {
            function Object() {
            }
            Object.isNullOrUndefined = function (object) {
                return typeof (object) === "undefined" || object == null;
            };
            return Object;
        }());
        Utils.Object = Object;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
        * String helper methods.
        */
        var String = /** @class */ (function () {
            function String() {
            }
            String.isNullOrEmpty = function (s) {
                return s == null || s.length === 0;
            };
            String.isNullOrWhitespace = function (s) {
                return s == null || s.trim().length === 0;
            };
            String.isNullUndefinedOrWhitespace = function (s) {
                return s == null || s === undefined || s.trim().length === 0;
            };
            /**
            * @remarks Limited functionality implemented
            * @returns a formatted string, similar to string.Format in C#.
            */
            String.Format = function (format) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var returnValue = format;
                for (var i = 1; i < arguments.length; i++) {
                    var actualValue = typeof (arguments[i]) === "undefined" || arguments[i] == null ? "" : arguments[i].toString();
                    returnValue = returnValue.replace(new RegExp("\\{" + (i - 1) + "\\}", 'g'), actualValue);
                }
                return returnValue;
            };
            /**
             * Compares one string to another string. The result is true if and only if one of the following conditions is true:
             *   <ul>
             *     <li>Both arguments are null</li>
             *     <li>Both arguments are undefined</li>
             *     <li>
             *       Both arguments share the same sequence of characters when ignoring case. Two characters are considered the same if both
             *       are strictly equal after applying the String.prototype.toUpperCase() function.
             *     </li>
             *   </ul>
             * @param string1 The first string to compare
             * @param string2 The second string to compare
             * @returns true if the Strings are equal, ignoring case; false otherwise
             */
            String.EqualsIgnoreCase = function (string1, string2) {
                var isString1Null = string1 == null;
                var isString2Null = string2 == null;
                var isString1Undefined = string1 === undefined;
                var isString2Undefined = string2 === undefined;
                if (isString1Null && isString2Null || isString1Undefined && isString2Undefined) {
                    return true;
                }
                if (isString1Null !== isString2Null || isString1Undefined !== isString2Undefined) {
                    return false;
                }
                return string1.toUpperCase() === string2.toUpperCase();
            };
            /**
             * Replaces [\r\n, \r, \n] or their respective HTML encoded versions [&#13;&#10;, &#13;, &#10;] with <br /> tags.
             *
             * @param text - The text to have the characters replaced.
             * @returns The text provided after performing the substitutions mentioned.
             */
            String.ReplaceLineBreaksWithBrTags = function (text) {
                return text.replace(/(?:\r\n|&#13;&#10;|\r|&#13;|\n|&#10;)/g, "<br />");
            };
            String.Empty = "";
            return String;
        }());
        Utils.String = String;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
        * Dictionary <key: string, value: T>
        * @typeparam T
        */
        var Dictionary = /** @class */ (function () {
            function Dictionary(elements) {
                this.dictionary = {};
                if (!Utils.Object.isNullOrUndefined(elements)) {
                    this.dictionary = elements;
                }
            }
            Dictionary.prototype.addOrUpdate = function (key, value) {
                this.dictionary[key] = value;
            };
            Dictionary.prototype.get = function (key) {
                return this.dictionary[key];
            };
            Dictionary.prototype.getValues = function () {
                var values = new Utils.ArrayQuery([]);
                for (var key in this.dictionary) {
                    values.add(this.dictionary[key]);
                }
                return values;
            };
            Dictionary.prototype.hasKey = function (key) {
                return this.dictionary.hasOwnProperty(key);
            };
            Dictionary.prototype.isEmpty = function () {
                for (var key in this.dictionary) {
                    if (this.dictionary.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            };
            /**
             * Serializes dictionary to JSON string
             */
            Dictionary.prototype.toJsonString = function () {
                return JSON.stringify(this.dictionary);
            };
            return Dictionary;
        }());
        Utils.Dictionary = Dictionary;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var WebApiUtility;
    (function (WebApiUtility) {
        function getLatestWebApiEndPoint() {
            return ControlsCommon.WebApiConstants.ApiPathV90;
        }
        WebApiUtility.getLatestWebApiEndPoint = getLatestWebApiEndPoint;
    })(WebApiUtility = ControlsCommon.WebApiUtility || (ControlsCommon.WebApiUtility = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var String = ControlsCommon.Utils.String;
    /**
    * Creates a new instance of OdataUrlHelper
    */
    var OdataUrlHelper = /** @class */ (function () {
        function OdataUrlHelper(baseUrlPart, apiVersionPart) {
            this.nullParameterErrorMessage = "Argument must not be null";
            this.baseUrlPart = baseUrlPart;
            this.apiVersionPart = apiVersionPart;
        }
        /**
        * A method that will return a valid Odata url
        * @param entityName - an entity name
        * @returns the Odata url
        */
        OdataUrlHelper.prototype.GetODataUrl = function (entityName) {
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityName)) {
                console.log(this.nullParameterErrorMessage + "entityName");
            }
            var requestUrl = String.Format(ControlsCommon.WebApiConstants.OdataUrlMask, this.baseUrlPart, this.apiVersionPart, entityName);
            return requestUrl;
        };
        /**
        * A method that will return a valid Odata url
        * @param entityName - an entity name
        * @param filterExpression - the Odata filter expression
        * @returns the Odata url
        */
        OdataUrlHelper.prototype.GetODataUrlWithFilter = function (entityName, filterExpression) {
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityName)) {
                console.log(this.nullParameterErrorMessage + "entityName");
            }
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(filterExpression)) {
                console.log(this.nullParameterErrorMessage + "filterExpression");
            }
            var requestUrl = String.Format(ControlsCommon.WebApiConstants.OdataUrlMaskWithFilterExpression, this.baseUrlPart, this.apiVersionPart, entityName, filterExpression);
            return requestUrl;
        };
        /**
        * A method that will return a valid Odata url
        * @param entityName - an entity name
        * @param filterExpression - the Odata select expression
        * @returns the Odata url
        */
        OdataUrlHelper.prototype.GetODataUrlWithSelect = function (entityName, selectExpression) {
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityName)) {
                console.log(this.nullParameterErrorMessage + "entityName");
            }
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(selectExpression)) {
                console.log(this.nullParameterErrorMessage + "selectExpression");
            }
            var requestUrl = String.Format(ControlsCommon.WebApiConstants.OdataUrlMaskWithSelectExpression, this.baseUrlPart, this.apiVersionPart, entityName, selectExpression);
            return requestUrl;
        };
        /**
        * A method that will return a valid Odata url
        * @param entityName - an entity name
        * @param entityId - the entity id
        * @returns the Odata url
        */
        OdataUrlHelper.prototype.GetODataUrlWithId = function (entityName, entityId) {
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityName)) {
                console.log(this.nullParameterErrorMessage + "entityName");
            }
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityId)) {
                console.log(this.nullParameterErrorMessage + "entityId");
            }
            var requestUrl = String.Format(ControlsCommon.WebApiConstants.OdataUrlMaskWithId, this.baseUrlPart, this.apiVersionPart, entityName, entityId);
            return requestUrl;
        };
        /**
      * A method that will return a valid Odata url
      * @param entityName - an entity name
      * @param entityId - the entity id
      * @param relationshipEntityName - the name of the relationship entitiy
      * @returns the Odata url
      */
        OdataUrlHelper.prototype.GetOdataUrlForRelationshipEntity = function (entityName, entityId, relationshipEntityName) {
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityName)) {
                console.log(this.nullParameterErrorMessage + "entityName");
            }
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(entityId)) {
                console.log(this.nullParameterErrorMessage + "entityId");
            }
            if (ControlsCommon.Utils.String.isNullUndefinedOrWhitespace(relationshipEntityName)) {
                console.log(this.nullParameterErrorMessage + "relationshipEntityName");
            }
            var requestUrl = String.Format(ControlsCommon.WebApiConstants.OdataUrlMaskForRelationshipEntity, this.baseUrlPart, this.apiVersionPart, entityName, entityId, relationshipEntityName);
            return requestUrl;
        };
        return OdataUrlHelper;
    }());
    ControlsCommon.OdataUrlHelper = OdataUrlHelper;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
    * Creates a new instance of WebApiAjaxHelper
    */
    var WebApiAjaxHelper = /** @class */ (function () {
        function WebApiAjaxHelper() {
        }
        /**
        * A method that will make a POST request
        * @param url - the url where it will action on
        * @param data - the json data that will get posted to the server
        * @param onSuccessCallback - callback method that will be called when the Ajax request finishes successfully
        * @param onErrorCallback - a callback method that will be called when the Ajax request fails
        * @param includeAnnotations - true, if helper should support retrieving formatted values; otherwise - false
        * See more https://msdn.microsoft.com/en-us/library/gg334767.aspx#Anchor_11
        */
        WebApiAjaxHelper.prototype.PostRequest = function (url, data, onSuccessCallback, onErrorCallback, options) {
            var self = this;
            var request = new XMLHttpRequest();
            request.open("POST", url, true);
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            this.processOptions(request, options);
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    request.onreadystatechange = null;
                    if (this.status === 204 || this.status === 200) {
                        // The CRM WebApi documentation for the entity creation can be found here :
                        // https://msdn.microsoft.com/en-us/library/gg328090.aspx#Anchor_2
                        // After the entity is created, we will not get a response
                        // just a header value with the newly created id
                        var data_1 = this.getResponseHeader(ControlsCommon.WebApiConstants.OdataEntityIdHeader);
                        onSuccessCallback(data_1);
                    }
                    else {
                        if (ControlsCommon.Utils.Object.isNullOrUndefined(onErrorCallback)) {
                            self.DefaultErrorCallback(this.responseText);
                        }
                        else {
                            onErrorCallback(this.responseText);
                        }
                    }
                }
            };
            request.send(data);
        };
        /**
        * A method that will make a GET request
        * @param url - the url where it will action on
        * @param onSuccessCallback - callback method that will be called when the Ajax request finishes successfully
        * @param onErrorCallback - a callback method that will be called when the Ajax request fails
        * @param includeAnnotations - true, if helper should support retrieving formatted values; otherwise - false
        * See more https://msdn.microsoft.com/en-us/library/gg334767.aspx#Anchor_11
        */
        WebApiAjaxHelper.prototype.GetRequest = function (url, onSuccessCallback, onErrorCallback, options) {
            var self = this;
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            this.processOptions(request, options);
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    request.onreadystatechange = null;
                    if (this.status === 200) {
                        onSuccessCallback(this.response);
                    }
                    else {
                        if (ControlsCommon.Utils.Object.isNullOrUndefined(onErrorCallback)) {
                            self.DefaultErrorCallback(this.responseText);
                        }
                        else {
                            onErrorCallback(this.responseText, this.status);
                        }
                    }
                }
            };
            request.send();
        };
        /**
        * A method that will make a DELETE request
        * @param url - the url where it will action on
        * @param onSuccessCallback - callback method that will be called when the Ajax request finishes successfully
        * @param onErrorCallback - a callback method that will be called when the Ajax request fails
        */
        WebApiAjaxHelper.prototype.DeleteRequest = function (url, onSuccessCallback, onErrorCallback) {
            var self = this;
            var request = new XMLHttpRequest();
            request.open("DELETE", url, true);
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    request.onreadystatechange = null;
                    if (this.status === 204 || this.status === 200) {
                        onSuccessCallback(this.response);
                    }
                    else {
                        if (ControlsCommon.Utils.Object.isNullOrUndefined(onErrorCallback)) {
                            self.DefaultErrorCallback(this.responseText);
                        }
                        else {
                            onErrorCallback(this.responseText);
                        }
                    }
                }
            };
            request.send();
        };
        /**
        * A method that will make a PATCH request
        * @see https://msdn.microsoft.com/en-en/library/mt607664.aspx#bkmk_update
        * @param url - the url where it will action on
        * @param data - the json data that will get posted to the server
        * @param onSuccessCallback - callback method that will be called when the Ajax request finishes successfully
        * @param onErrorCallback - a callback method that will be called when the Ajax request fails
        */
        WebApiAjaxHelper.prototype.PatchRequest = function (url, data, onSuccessCallback, onErrorCallback) {
            var self = this;
            var request = new XMLHttpRequest();
            request.open("PATCH", url, true);
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    request.onreadystatechange = null;
                    if (this.status === 204 || this.status === 200) {
                        onSuccessCallback();
                    }
                    else {
                        if (ControlsCommon.Utils.Object.isNullOrUndefined(onErrorCallback)) {
                            self.DefaultErrorCallback(this.responseText);
                        }
                        else {
                            onErrorCallback(this.responseText);
                        }
                    }
                }
            };
            request.send(data);
        };
        WebApiAjaxHelper.prototype.DefaultErrorCallback = function (errorMessage) {
            console.log(errorMessage);
        };
        WebApiAjaxHelper.prototype.processOptions = function (request, options) {
            if (options) {
                if (options.includeAnnotations) {
                    request.setRequestHeader("Prefer", "odata.include-annotations=" + ControlsCommon.WebApiConstants.ODataCommunityDisplayV1FormattedValue);
                }
                if (options.pageSize) {
                    request.setRequestHeader("Prefer", "odata.maxpagesize=" + options.pageSize);
                }
            }
        };
        return WebApiAjaxHelper;
    }());
    ControlsCommon.WebApiAjaxHelper = WebApiAjaxHelper;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="DataProvider.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var UtilObject = ControlsCommon.Utils.Object;
    var String = ControlsCommon.Utils.String;
    var oDataEndpointPath = "/api/data/v9.0/";
    /**
     * Defines data provider class.
     */
    var DataProvider = /** @class */ (function () {
        function DataProvider() {
        }
        /**
         * Gets option set.
         * @params optionSetName - Option set name.
         * @params callback - Callback for successefull request.
         */
        DataProvider.GetOptionSetValues = function (optionSetName, callback, failure) {
            if (DataProvider.optionSetsCache[optionSetName]) {
                callback(DataProvider.optionSetsCache[optionSetName]);
                return;
            }
            var requestUrl = "" + DataProvider.getClientUrl() + oDataEndpointPath + "GlobalOptionSetDefinitions(Name='" + optionSetName + "')";
            var successHandler = function (data) {
                DataProvider.optionSetsCache[optionSetName] = data;
                callback(data);
            };
            var errorHandler = function (errorData) {
                // TODO: use approved UX for error handling.
                console.log(errorData);
                if (failure) {
                    failure(errorData);
                }
            };
            DataProvider.callWebApi(requestUrl, successHandler, errorHandler);
        };
        DataProvider.GetData = function (entityName, fields, successHandler, errorHandler) {
            var oDataQuery = entityName;
            if (fields && fields.length > 0) {
                oDataQuery += "?$select=" + fields.join(",");
            }
            var oDataUrl = DataProvider.getClientUrl() + oDataEndpointPath;
            var requestUrl = oDataUrl + oDataQuery;
            DataProvider.callWebApi(requestUrl, successHandler, errorHandler);
        };
        DataProvider.callWebApi = function (url, successHandler, errorHandler) {
            var xmlHttpRequest = new XMLHttpRequest();
            xmlHttpRequest.open("get", url, true);
            xmlHttpRequest.onreadystatechange = function () {
                if (xmlHttpRequest.readyState === DataProvider.xmlHttpCompletedState) {
                    if (xmlHttpRequest.status === DataProvider.httpStatusOk) {
                        var data = JSON.parse(xmlHttpRequest.responseText);
                        if (!UtilObject.isNullOrUndefined(successHandler)) {
                            successHandler(data);
                        }
                    }
                    else {
                        if (!UtilObject.isNullOrUndefined(errorHandler)) {
                            errorHandler(xmlHttpRequest.status);
                        }
                    }
                }
            };
            xmlHttpRequest.send();
        };
        DataProvider.getClientUrl = function () {
            var context = ControlsCommon.Utils.ContextProvider.get();
            try {
                return context.getClientUrl();
            }
            catch (e) {
                return String.Empty;
            }
        };
        DataProvider.httpStatusOk = 200;
        DataProvider.xmlHttpCompletedState = 4;
        DataProvider.optionSetsCache = {};
        return DataProvider;
    }());
    ControlsCommon.DataProvider = DataProvider;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="IViewItem.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="PreviewAttribute.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------e
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
    /**
     * Defines preview attribute class
     */
    var PreviewAttribute = /** @class */ (function () {
        /**
         * Initializes a new instance of preview attribute.
         * @param name - Attribute name.
         * @param value - Attribute display value.
         */
        function PreviewAttribute(name, value) {
            this.Name = name;
            this.Value = value;
        }
        return PreviewAttribute;
    }());
    ControlsCommon.PreviewAttribute = PreviewAttribute;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var BaseEntityRepository = /** @class */ (function () {
        /**
        * Initializes a new instance of BaseEntityRepository.
        * @param odataUrlHelper - an instance of IOdataUrlHelper
        * @param ajaxHelper - an instance of IAjaxHelper
        */
        function BaseEntityRepository(odataUrlHelper, ajaxHelper) {
            this.odataUrlHelper = odataUrlHelper;
            this.ajaxHelper = ajaxHelper;
        }
        /**
        * Method used to create a new entity in CRM
        * @param entityToCreate - a entity of type TEntity that will be created
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.CreateAsync = function (entityToCreate, successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetODataUrl(name);
            var json = this.GetCreateEntityJson(entityToCreate);
            this.ajaxHelper.PostRequest(url, json, successCallback, errorCallback);
        };
        /**
        * Method used to create a new relationship in CRM
        * @param entityId - the id of the entity
        * @param relatedEntityId - the id of the entity to associate with
        * @param relatedEntityName - the name of the entitiy to be associated with
        * @param relationshipEntityName - the name of the relationship entitiy to be created
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.CreateRelationshipAsync = function (entityId, relatedEntityId, relatedEntityName, relationshipEntityName, successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetOdataUrlForRelationshipEntity(name, entityId, relationshipEntityName);
            var relationshipUrlToCreate = this.odataUrlHelper.GetODataUrlWithId(relatedEntityName, relatedEntityId);
            var json = this.GetCreateRelationshipEntityJson(relationshipUrlToCreate);
            this.ajaxHelper.PostRequest(url, json, successCallback, errorCallback);
        };
        /**
        * Method used to create get an entity by id
        * @param entityId - the id of the entity to be retrieved
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.GetByIdAsync = function (entityId, successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetODataUrlWithId(name, entityId);
            this.ajaxHelper.GetRequest(url, successCallback, errorCallback);
        };
        /**
        * Method used to get a list of an entity
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.GetListAsync = function (successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetODataUrl(name);
            this.ajaxHelper.GetRequest(url, successCallback, errorCallback);
        };
        /**
        * Method used to delete an entity by id
        * @param entityId - the id of the entity to be deleted
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.DeleteByIdAsync = function (entityId, successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetODataUrlWithId(name, entityId);
            this.ajaxHelper.DeleteRequest(url, successCallback, errorCallback);
        };
        /**
        * Method used to update an entity
        * @param entityId - the id of the entity to be updated
        * @param successCallback - a callback method that will be called when the Ajax request finishes
        * @param errorCallback - a callback method that will be called when the Ajax request fails
        */
        BaseEntityRepository.prototype.UpdateAsync = function (entityId, propertiesToUpdate, successCallback, errorCallback) {
            var name = this.GetEntityLogicalName();
            var url = this.odataUrlHelper.GetODataUrlWithId(name, entityId);
            var json = this.GetUpdateEntityJson(propertiesToUpdate);
            this.ajaxHelper.PatchRequest(url, json, successCallback, errorCallback);
        };
        /**
        * Method used to create the json body for the POST request.
        * This should be overridden based on the fields necessary to create that entity.
        * @param entityToCreate - the entity to be created
        */
        BaseEntityRepository.prototype.GetCreateEntityJson = function (entityToCreate) {
            var json = JSON.stringify(entityToCreate);
            return json;
        };
        /**
        * Method used to create the json body for the POST request.
        * This should be overridden based on the fields necessary to create that entity.
        * @param relationshipUrlToCreate - the url of the entity to be associated
        */
        BaseEntityRepository.prototype.GetCreateRelationshipEntityJson = function (relationshipUrlToCreate) {
            var json = JSON.stringify(relationshipUrlToCreate);
            return json;
        };
        /**
        * Method used to create the json body for the PATCH request.
        * @param propertiesToUpdate - an object containing properties to update
        */
        BaseEntityRepository.prototype.GetUpdateEntityJson = function (propertiesToUpdate) {
            var json = JSON.stringify(propertiesToUpdate);
            return json;
        };
        return BaseEntityRepository;
    }());
    ControlsCommon.BaseEntityRepository = BaseEntityRepository;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var String = ControlsCommon.Utils.String;
    var FileRepository = /** @class */ (function (_super) {
        __extends(FileRepository, _super);
        function FileRepository(odataUrlHelper, ajaxHelper, crmEntityPrefix) {
            var _this = _super.call(this, odataUrlHelper, ajaxHelper) || this;
            _this.crmEntityPrefix = crmEntityPrefix;
            return _this;
        }
        FileRepository.prototype.GetEntityLogicalName = function () {
            return String.Format(ControlsCommon.WebApiConstants.FileEntityLogicalName, this.crmEntityPrefix);
        };
        FileRepository.prototype.GetCreateEntityJson = function (entityToCreate) {
            var body = {};
            body[String.Format(ControlsCommon.WebApiConstants.FileEntityNamePropertyField, this.crmEntityPrefix)] = entityToCreate.msdyncrm_name;
            body[String.Format(ControlsCommon.WebApiConstants.FileEntityWidthPropertyField, this.crmEntityPrefix)] = entityToCreate.msdyncrm_width;
            body[String.Format(ControlsCommon.WebApiConstants.FileEntityHeightPropertyField, this.crmEntityPrefix)] = entityToCreate.msdyncrm_height;
            var json = JSON.stringify(body);
            return json;
        };
        FileRepository.prototype.GetCreateRelationshipEntityJson = function (relationshipUrlToCreate) {
            var body = {};
            body[ControlsCommon.WebApiConstants.RelationshipNamePropertyField] = relationshipUrlToCreate;
            var json = JSON.stringify(body);
            return json;
        };
        return FileRepository;
    }(ControlsCommon.BaseEntityRepository));
    ControlsCommon.FileRepository = FileRepository;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
    /**
     * Defines the base entity
     */
    var BaseEntity = /** @class */ (function () {
        function BaseEntity() {
        }
        return BaseEntity;
    }());
    ControlsCommon.BaseEntity = BaseEntity;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="FilterInfo.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
     * Defines filter info
     */
    var FilterInfo = /** @class */ (function () {
        function FilterInfo() {
        }
        return FilterInfo;
    }());
    ControlsCommon.FilterInfo = FilterInfo;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
    /**
     * Defines file entity
     */
    var FileEntity = /** @class */ (function (_super) {
        __extends(FileEntity, _super);
        function FileEntity() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FileEntity;
    }(ControlsCommon.BaseEntity));
    ControlsCommon.FileEntity = FileEntity;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
    /**
     * Defines keyword entity
     */
    var KeywordEntity = /** @class */ (function (_super) {
        __extends(KeywordEntity, _super);
        function KeywordEntity() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return KeywordEntity;
    }(ControlsCommon.BaseEntity));
    ControlsCommon.KeywordEntity = KeywordEntity;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="JSEvent.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    /** Describes the event listener for internal event collection */
    var JSEventListener = /** @class */ (function () {
        function JSEventListener() {
        }
        return JSEventListener;
    }());
    ControlsCommon.JSEventListener = JSEventListener;
    /** Logical event */
    var JSEvent = /** @class */ (function () {
        function JSEvent() {
            /** Collection of event listeners */
            this.listeners = [];
        }
        /** Adds an event listener */
        JSEvent.prototype.Add = function (listener, context) {
            if (!(typeof listener === 'function')) {
                return;
            }
            var jsEventListener = new JSEventListener();
            jsEventListener.listener = listener;
            jsEventListener.context = context;
            this.listeners.push(jsEventListener);
        };
        /** Removes provided event listener
        * @param listener - event listener to remove.
        */
        JSEvent.prototype.Remove = function (listener) {
            for (var i = 0; i < this.listeners.length; i++) {
                if (this.listeners[i].listener === listener) {
                    this.listeners.splice(i, 1);
                }
            }
        };
        /** Removes all listeners
        */
        JSEvent.prototype.RemoveAllListeners = function () {
            this.listeners = [];
        };
        /** Triggers the event with provided event arguments
        * @param eventArgs - event arguments to be passed to all of the event listeners.
        */
        JSEvent.prototype.Trigger = function (eventArgs) {
            var listenersCopy = this.listeners.slice(0);
            for (var i = 0; i < listenersCopy.length; i++) {
                var currentListener = listenersCopy[i];
                currentListener.listener.apply(currentListener.context, [eventArgs]);
            }
        };
        return JSEvent;
    }());
    ControlsCommon.JSEvent = JSEvent;
    /** Defines the empty event args type */
    var EmptyEventArgs = /** @class */ (function () {
        function EmptyEventArgs() {
        }
        return EmptyEventArgs;
    }());
    ControlsCommon.EmptyEventArgs = EmptyEventArgs;
    /** Defines an event that has no event arguments */
    var EmptyEventArgsEvent = /** @class */ (function (_super) {
        __extends(EmptyEventArgsEvent, _super);
        function EmptyEventArgsEvent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /** Triggers the event without any arguments */
        EmptyEventArgsEvent.prototype.Trigger = function () {
            _super.prototype.Trigger.call(this, new EmptyEventArgs());
        };
        return EmptyEventArgsEvent;
    }(JSEvent));
    ControlsCommon.EmptyEventArgsEvent = EmptyEventArgsEvent;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var LocaleOrientation;
    (function (LocaleOrientation) {
        LocaleOrientation[LocaleOrientation["LTR"] = 0] = "LTR";
        LocaleOrientation[LocaleOrientation["RTL"] = 1] = "RTL";
    })(LocaleOrientation = ControlsCommon.LocaleOrientation || (ControlsCommon.LocaleOrientation = {}));
    var LocaleMetadataItem = /** @class */ (function () {
        function LocaleMetadataItem(language, shortCode, orientation) {
            if (orientation === void 0) { orientation = LocaleOrientation.LTR; }
            this.Language = '';
            this.ShortCode = '';
            this.Language = language;
            this.ShortCode = shortCode;
            this.Orientation = orientation;
        }
        return LocaleMetadataItem;
    }());
    ControlsCommon.LocaleMetadataItem = LocaleMetadataItem;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var LocaleMetadata = /** @class */ (function () {
        function LocaleMetadata() {
        }
        LocaleMetadata.prototype.GetLocaleMetadataItemByLcid = function (lcid) {
            var defaultLocaleMetadataItem = new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR);
            if (LocaleMetadata.cache.isEmpty()) {
                this.loadCache();
            }
            var lcidString = lcid.toString();
            if (LocaleMetadata.cache.hasKey(lcidString)) {
                var localeMetadataItem = LocaleMetadata.cache.get(lcidString);
                if (!ControlsCommon.Utils.Object.isNullOrUndefined(localeMetadataItem)) {
                    return localeMetadataItem;
                }
            }
            return defaultLocaleMetadataItem;
        };
        LocaleMetadata.prototype.loadCache = function () {
            LocaleMetadata.cache.addOrUpdate('1078', new ControlsCommon.LocaleMetadataItem('Afrikaans', 'af', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1052', new ControlsCommon.LocaleMetadataItem('Albanian', 'sq', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5121', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('15361', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('3073', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('2049', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('11265', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('13313', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('12289', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('4097', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('6145', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('8193', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('16385', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('1025', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('10241', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('7169', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('14337', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('9217', new ControlsCommon.LocaleMetadataItem('Arabic', 'ar', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('1067', new ControlsCommon.LocaleMetadataItem('Armenian', 'hy', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2092', new ControlsCommon.LocaleMetadataItem('Azeri (Cyrillic)', 'az', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1068', new ControlsCommon.LocaleMetadataItem('Azeri (Latin)', 'az', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1069', new ControlsCommon.LocaleMetadataItem('Basque', 'eu', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1059', new ControlsCommon.LocaleMetadataItem('Belarusian', 'be', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1026', new ControlsCommon.LocaleMetadataItem('Bulgarian', 'bg', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1027', new ControlsCommon.LocaleMetadataItem('Catalan', 'ca', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3076', new ControlsCommon.LocaleMetadataItem('Chinese', 'zh', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5124', new ControlsCommon.LocaleMetadataItem('Chinese', 'zh', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2052', new ControlsCommon.LocaleMetadataItem('Chinese', 'zh', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('4100', new ControlsCommon.LocaleMetadataItem('Chinese', 'zh', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1028', new ControlsCommon.LocaleMetadataItem('Chinese', 'zh', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1050', new ControlsCommon.LocaleMetadataItem('Croatian', 'hr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1029', new ControlsCommon.LocaleMetadataItem('Czech', 'cs', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1030', new ControlsCommon.LocaleMetadataItem('Danish', 'da', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1125', new ControlsCommon.LocaleMetadataItem('Divehi', 'dv', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('2067', new ControlsCommon.LocaleMetadataItem('Dutch', 'nl', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1043', new ControlsCommon.LocaleMetadataItem('Dutch', 'nl', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3081', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('10249', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('4105', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('9225', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('6153', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('8201', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5129', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('13321', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('7177', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('11273', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2057', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1033', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('12297', new ControlsCommon.LocaleMetadataItem('English', 'en', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1061', new ControlsCommon.LocaleMetadataItem('Estonian', 'et', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1080', new ControlsCommon.LocaleMetadataItem('Faroese', 'fo', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1065', new ControlsCommon.LocaleMetadataItem('Farsi', 'fa', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1035', new ControlsCommon.LocaleMetadataItem('Finnish', 'fi', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2060', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3084', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1036', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5132', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('6156', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('4108', new ControlsCommon.LocaleMetadataItem('French', 'fr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1071', new ControlsCommon.LocaleMetadataItem('FYRO Macedonian', 'mk', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1110', new ControlsCommon.LocaleMetadataItem('Galician', 'gl', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1079', new ControlsCommon.LocaleMetadataItem('Georgian', 'ka', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3079', new ControlsCommon.LocaleMetadataItem('German', 'de', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1031', new ControlsCommon.LocaleMetadataItem('German', 'de', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5127', new ControlsCommon.LocaleMetadataItem('German', 'de', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('4103', new ControlsCommon.LocaleMetadataItem('German', 'de', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2055', new ControlsCommon.LocaleMetadataItem('German', 'de', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1032', new ControlsCommon.LocaleMetadataItem('Greek', 'el', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1095', new ControlsCommon.LocaleMetadataItem('Gujarati', 'gu', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1037', new ControlsCommon.LocaleMetadataItem('Hebrew', 'he', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('1081', new ControlsCommon.LocaleMetadataItem('Hindi', 'hi', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1038', new ControlsCommon.LocaleMetadataItem('Hungarian', 'hu', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1039', new ControlsCommon.LocaleMetadataItem('Icelandic', 'is', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1057', new ControlsCommon.LocaleMetadataItem('Indonesian', 'id', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1040', new ControlsCommon.LocaleMetadataItem('Italian', 'it', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2064', new ControlsCommon.LocaleMetadataItem('Italian', 'it', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1041', new ControlsCommon.LocaleMetadataItem('Japanese', 'ja', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1099', new ControlsCommon.LocaleMetadataItem('Kannada', 'kn', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1087', new ControlsCommon.LocaleMetadataItem('Kazakh', 'kk', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1111', new ControlsCommon.LocaleMetadataItem('Konkani', '', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1042', new ControlsCommon.LocaleMetadataItem('Korean', 'ko', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1088', new ControlsCommon.LocaleMetadataItem('Kyrgyz', 'ky', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1062', new ControlsCommon.LocaleMetadataItem('Latvian', 'lv', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1063', new ControlsCommon.LocaleMetadataItem('Lithuanian', 'lt', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2110', new ControlsCommon.LocaleMetadataItem('Malay', 'ms', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1086', new ControlsCommon.LocaleMetadataItem('Malay', 'ms', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1102', new ControlsCommon.LocaleMetadataItem('Marathi', 'mr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1104', new ControlsCommon.LocaleMetadataItem('Mongolian', 'mn', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1044', new ControlsCommon.LocaleMetadataItem('Norwegian (Bokmål)', 'nb', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2068', new ControlsCommon.LocaleMetadataItem('Norwegian (Nynorsk)', 'nn', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1045', new ControlsCommon.LocaleMetadataItem('Polish', 'pl', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1046', new ControlsCommon.LocaleMetadataItem('Portuguese', 'pt', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2070', new ControlsCommon.LocaleMetadataItem('Portuguese', 'pt', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1094', new ControlsCommon.LocaleMetadataItem('Punjabi', 'pa', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1048', new ControlsCommon.LocaleMetadataItem('Romanian', 'ro', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1049', new ControlsCommon.LocaleMetadataItem('Russian', 'ru', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1103', new ControlsCommon.LocaleMetadataItem('Sanskrit', 'sa', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3098', new ControlsCommon.LocaleMetadataItem('Serbian (Cyrillic)', 'sr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2074', new ControlsCommon.LocaleMetadataItem('Serbian (Latin)', 'sr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1051', new ControlsCommon.LocaleMetadataItem('Slovak', 'sk', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1060', new ControlsCommon.LocaleMetadataItem('Slovenian', 'sl', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('11274', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('16394', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('13322', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('9226', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('5130', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('7178', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('12298', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('17418', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('4106', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('18442', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2058', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('19466', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('6154', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('15370', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('10250', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('20490', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1034', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('14346', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('8202', new ControlsCommon.LocaleMetadataItem('Spanish', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('3082', new ControlsCommon.LocaleMetadataItem('Spanish - Modern Sort', 'es', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1089', new ControlsCommon.LocaleMetadataItem('Swahili', 'sw', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('2077', new ControlsCommon.LocaleMetadataItem('Swedish', 'sv', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1053', new ControlsCommon.LocaleMetadataItem('Swedish', 'sv', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1114', new ControlsCommon.LocaleMetadataItem('Syriac', '', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1097', new ControlsCommon.LocaleMetadataItem('Tamil', 'ta', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1092', new ControlsCommon.LocaleMetadataItem('Tatar', 'tt', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1098', new ControlsCommon.LocaleMetadataItem('Telugu', 'te', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1054', new ControlsCommon.LocaleMetadataItem('Thai', 'th', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1055', new ControlsCommon.LocaleMetadataItem('Turkish', 'tr', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1058', new ControlsCommon.LocaleMetadataItem('Ukrainian', 'uk', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1056', new ControlsCommon.LocaleMetadataItem('Urdu', 'ur', ControlsCommon.LocaleOrientation.RTL));
            LocaleMetadata.cache.addOrUpdate('2115', new ControlsCommon.LocaleMetadataItem('Uzbek (Cyrillic)', 'uz', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1091', new ControlsCommon.LocaleMetadataItem('Uzbek (Latin)', 'uz', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1066', new ControlsCommon.LocaleMetadataItem('Vietnamese', 'vi', ControlsCommon.LocaleOrientation.LTR));
            LocaleMetadata.cache.addOrUpdate('1106', new ControlsCommon.LocaleMetadataItem('Welsh', 'cy', ControlsCommon.LocaleOrientation.LTR));
        };
        LocaleMetadata.cache = new ControlsCommon.Utils.Dictionary();
        return LocaleMetadata;
    }());
    ControlsCommon.LocaleMetadata = LocaleMetadata;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var RtlManager = /** @class */ (function () {
        function RtlManager() {
            this.rltMarkupMask = '<bdo dir="rtl">{0}</bdo>';
        }
        RtlManager.prototype.GetRtlMarkup = function (metadataItem, localization) {
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(metadataItem) && metadataItem.Orientation === ControlsCommon.LocaleOrientation.RTL) {
                return ControlsCommon.Utils.String.Format(this.rltMarkupMask, localization);
            }
            return localization;
        };
        return RtlManager;
    }());
    ControlsCommon.RtlManager = RtlManager;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
         * Class for obtaining Xrm namespace
         */
        var XrmProvider = /** @class */ (function () {
            function XrmProvider() {
            }
            /**
             * Gets the Xrm namespace
             */
            XrmProvider.getXrmNamespace = function () {
                if (typeof Xrm === 'undefined' || Xrm == null || typeof Xrm.Page === 'undefined') {
                    var iframe = document.getElementById(XrmProvider.XrmFrameId);
                    if (iframe != null) {
                        return iframe.contentWindow.Xrm;
                    }
                }
                return Xrm;
            };
            XrmProvider.XrmFrameId = "ClientApiFrame_0";
            return XrmProvider;
        }());
        Utils.XrmProvider = XrmProvider;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var ScriptDependencyModel = /** @class */ (function () {
            function ScriptDependencyModel(name, loadPath, scriptLoadBehavior) {
                if (scriptLoadBehavior === void 0) { scriptLoadBehavior = null; }
                this.name = name;
                this.loadPath = loadPath;
                this.scriptLoadBehavior = scriptLoadBehavior;
            }
            return ScriptDependencyModel;
        }());
        Utils.ScriptDependencyModel = ScriptDependencyModel;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var StyleSheetDependencyModel = /** @class */ (function () {
            function StyleSheetDependencyModel(name, loadPath) {
                this.name = name;
                this.loadPath = loadPath;
            }
            return StyleSheetDependencyModel;
        }());
        Utils.StyleSheetDependencyModel = StyleSheetDependencyModel;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="CommonReferences.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="Constants\WebApiConstants.ts" />
/// <reference path="Utils\ArrayQuery.ts" />
/// <reference path="Utils\DomUtilsInstance.ts" />
/// <reference path="Utils\DomUtils.ts" />
/// <reference path="Utils\Object.ts" />
/// <reference path="Utils\String.ts" />
/// <reference path="Utils\Dictionary.ts" />
/// <reference path="Utils\IDictionary.ts" />
/// <reference path="Utils\WebApiUtility.ts"/>
/// <reference path="Utils\IOdataUrlHelper.ts" />
/// <reference path="Utils\OdataUrlHelper.ts" />
/// <reference path="Utils\WebApiAjaxHelper.ts" />
/// <reference path="Data\DataProvider.ts" />
/// <reference path="DataContracts\IViewItem.ts" />
/// <reference path="DataContracts\PreviewAttribute.ts" />
/// <reference path="Repositories\BaseEntityRepository.ts" />
/// <reference path="Repositories\FileRepository.ts" />
/// <reference path="Entities\BaseEntity.ts" />
/// <reference path="Filtering\FilterInfo.ts" />
/// <reference path="Entities\FileEntity.ts" />
/// <reference path="Entities\KeywordEntity.ts" />
/// <reference path="Filtering\FilterInfo.ts" />
/// <reference path="JSEvent.ts" />
/// <reference path="StandaloneControls\IDisposable.ts" />
/// <reference path="StandaloneControls\IControl.ts" />
/// <reference path="Utils\ArrayQuery.ts" />
/// <reference path="Localization\LocaleMetadataItem.ts" />
/// <reference path="Localization\LocaleMetadata.ts" />
/// <reference path="Localization\IRtlManager.ts" />
/// <reference path="Localization\RtlManager.ts" />
/// <reference path="Utils/XrmProvider.ts" />
/// <reference path="Dependency/ScriptDependencyModel.ts" />
/// <reference path="Dependency/StyleSheetDependencyModel.ts" />
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var ClassNameConstants = /** @class */ (function () {
        function ClassNameConstants() {
        }
        ClassNameConstants.screenReaderTextCssClass = "ms-mktsvc-ScreenReaderText";
        ClassNameConstants.roleAlertElementCssClass = "ms-mktsvc-RoleAlertElement";
        ClassNameConstants.emailTemplateGalleryControlClassName = "msdyncrm_emailTemplateGalleryControl";
        return ClassNameConstants;
    }());
    ControlsCommon.ClassNameConstants = ClassNameConstants;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var KeyCodes;
    (function (KeyCodes) {
        KeyCodes[KeyCodes["Enter"] = 13] = "Enter";
        KeyCodes[KeyCodes["Space"] = 32] = "Space";
        KeyCodes[KeyCodes["Left"] = 37] = "Left";
        KeyCodes[KeyCodes["Up"] = 38] = "Up";
        KeyCodes[KeyCodes["Right"] = 39] = "Right";
        KeyCodes[KeyCodes["Down"] = 40] = "Down";
    })(KeyCodes = ControlsCommon.KeyCodes || (ControlsCommon.KeyCodes = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var WebResourcesConstants = /** @class */ (function () {
        function WebResourcesConstants() {
        }
        WebResourcesConstants.LocalizationFileUrlWithLCIDMask = "{0}/WebResources/msdyncrm_/Localizations/{1}";
        return WebResourcesConstants;
    }());
    ControlsCommon.WebResourcesConstants = WebResourcesConstants;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
        * Class that knows how to sanitize the content using jSanity
        */
        var jSanityContentSanitizer = /** @class */ (function () {
            /**
             * The constructor.
             * @param libsPath Path to the libs folder to load jSanity
             * @param supportedAttributes Supported data attributes that will not be removed when sanitizing
             */
            function jSanityContentSanitizer(libsPath, supportedAttributes) {
                this.libsPath = libsPath;
                this.attributePrefix = "jSanity";
                this.jSanity = null;
                this.initDeferred = $.Deferred();
                this.jsanityDependencyId = "designer-dependency-jsanity";
                this.supported = supportedAttributes ? supportedAttributes : new Utils.ArrayQuery([]);
            }
            jSanityContentSanitizer.prototype.init = function (done) {
                var _this = this;
                if (window.jSanity) {
                    // Already initialized
                    done();
                    return;
                }
                if (Utils.Object.isNullOrUndefined(this.jSanity)) {
                    this.jSanity = Utils.SanitizationUtils
                        .createScriptElementFromUrl(this.jsanityDependencyId, Utils.String.Format("{0}/{1}/{2}", this.libsPath, "jSanity", "jsanity.min.js"), document);
                    this.jSanity.onload = function () { _this.initDeferred.resolve(); };
                    document.head.appendChild(this.jSanity);
                }
                // Register for the done callback
                this.initDeferred.done(done);
            };
            /**
            * Returns the sanitized content.
            */
            jSanityContentSanitizer.prototype.getSanitizedContent = function (content, done) {
                done(this.sanitize(content));
            };
            /**
             * Sanitize the content... this method could actually be async.
             * @param content the content to sanitize.
             */
            jSanityContentSanitizer.prototype.sanitize = function (content) {
                var _this = this;
                if (Utils.String.isNullUndefinedOrWhitespace(content)) {
                    return $();
                }
                var sanitized = window.jSanity.sanitize({
                    inputString: Utils.SanitizationUtils.getWithDoctype(content), overflow: 'scroll', allowLinks: true, attributePrefix: this.attributePrefix, debugLevel: 0,
                    dataAttributeCallback: function (name, value) {
                        if (_this.supported.contains(function (attr) { return attr.toLowerCase() === name.toLowerCase(); })) {
                            return value;
                        }
                        // Not known data attribute
                        return null;
                    },
                    // Enabling dynamic content and anchors as custom protocols
                    customProtocols: { '{{': 1, '#': 1 },
                    linkClickCallback: function () { return false; }
                });
                // The document content has been sanitized by jSanity and all of the name and id attributes have been prefixed, we need to put it back
                Utils.SanitizationUtils.walkTree($(sanitized), function (node) {
                    var nodeName = node.attr('name');
                    var nodeId = node.attr('id');
                    if (!Utils.String.isNullUndefinedOrWhitespace(nodeName)) {
                        node.attr('name', nodeName.replace(_this.attributePrefix + "_", Utils.String.Empty));
                    }
                    if (!Utils.String.isNullUndefinedOrWhitespace(nodeId)) {
                        node.attr('id', nodeId.replace(_this.attributePrefix + "_", Utils.String.Empty));
                    }
                });
                return $(sanitized);
            };
            jSanityContentSanitizer.prototype.dispose = function () {
                this.jSanity = null;
                $("#" + this.jsanityDependencyId).remove();
            };
            return jSanityContentSanitizer;
        }());
        Utils.jSanityContentSanitizer = jSanityContentSanitizer;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
         * Utility methods taken from MktSvc - src\Client\Controls\Editor\Utils\CommonUtils.ts
         */
        var SanitizationUtils = /** @class */ (function () {
            function SanitizationUtils() {
            }
            /**
             * Walks the root node and its children and performs a post-order action
             * @param node Root node
             * @param visit Visitor action to perform on each visited node
             */
            SanitizationUtils.walkTree = function (node, visit) {
                node.children().each(function (i, c) { SanitizationUtils.walkTree($(c), visit); });
                visit(node);
            };
            /**
             * Returns true when the given html content contains doctype tag
             * @param content Html content
             */
            SanitizationUtils.isContentContainingDoctype = function (content) {
                return content.toLowerCase().indexOf("<!doctype") !== -1;
            };
            /**
             * Create a style element with the specified url and id.
             * @param url The url.
             * @param id The id.
             */
            SanitizationUtils.createScriptElementFromUrl = function (id, url, doc) {
                if (doc === void 0) { doc = document; }
                var scriptElement = doc.createElement("script");
                scriptElement.setAttribute('type', 'text/javascript');
                scriptElement.setAttribute('src', url);
                scriptElement.setAttribute('id', id);
                return scriptElement;
            };
            /**
             * Returns the html of the document and ensures there is DOCTYPE tag to it.
             * @param document The document
             */
            SanitizationUtils.getWithDoctype = function (html) {
                if (Utils.String.isNullOrWhitespace(html)) {
                    return html;
                }
                if (SanitizationUtils.isContentContainingDoctype(html)) {
                    // Already has a doctype declaration
                    return html;
                }
                return "<!DOCTYPE html>" + html;
            };
            return SanitizationUtils;
        }());
        Utils.SanitizationUtils = SanitizationUtils;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
    /**
    * Defines dependency class
    */
    var Dependency = /** @class */ (function () {
        function Dependency() {
        }
        return Dependency;
    }());
    ControlsCommon.Dependency = Dependency;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="IOptionSet.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="IGridViewItemControl.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
    * Defines a list of keys used for translations
    */
    var LocalizationKeys = /** @class */ (function () {
        function LocalizationKeys() {
        }
        LocalizationKeys.BingMapControlMessageBingMapApiKeyIsRequired = "BingMapControl_Message_BingMapApiKeyIsRequired";
        LocalizationKeys.BingMapControlMessageCustomerInsightsPermissionIsRequired = "BingMapControl_Message_CustomerInsightsPermissionIsRequired";
        LocalizationKeys.BingMapControlAriaLabelKpiSwitcher = "BingMapControl_AriaLabel_KpiSwitcher";
        LocalizationKeys.BingMapControlAriaLabelGoBackButton = "BingMapControl_AriaLabel_GoBackButton";
        LocalizationKeys.BingMapControlAriaLabelMap = "BingMapControl_AriaLabel_Map";
        LocalizationKeys.WebResourcesFileContentInvalidFileTypeErrorMessageMask = 'WebResources_FileContent_InvalidFileTypeErrorMessageMask';
        LocalizationKeys.WebResourcesShowFileThumbnailThisContentIsNotAvailableForPreview = 'WebResources_ShowFileThumbnail_ThisContentIsNotAvailableForPreview';
        LocalizationKeys.ClickMapTooltipTotalClicks = "ClickMap_ToolTip_TotalClicks";
        LocalizationKeys.ClickMapTooltipUniqueClicks = "ClickMap_ToolTip_UniqueClicks";
        LocalizationKeys.ClickMapTooltipClickThroughRate = "ClickMap_ToolTip_ClickThroughRate";
        LocalizationKeys.ClickMapTooltipMaximizeMap = "ClickMap_Tooltip_MaximizeMap";
        LocalizationKeys.ClickMapTooltipRestoreMap = "ClickMap_Tooltip_RestoreMap";
        LocalizationKeys.ClickMapControlMessageCustomerInsightsPermissionIsRequired = "ClickMap_Message_CustomerInsightsPermissionIsRequired";
        LocalizationKeys.ClickMapDropdownNoCustomerJourneys = "ClickMap_Dropdown_NoCustomerJourneys";
        LocalizationKeys.ClickMapMessageNoEmailBodyAvailable = "ClickMap_Message_NoEmailBodyAvailable";
        LocalizationKeys.ClickMapAriaLabelKpiSwitcher = "ClickMap_AriaLabel_KpiSwitcher";
        LocalizationKeys.LookupCustomControlInvalidRecord = "LookupControl_InvalidRecord_TitleText";
        LocalizationKeys.ResizeMessageOverlayTitle = "ControlsCommon.ResizeMessageOverlay.Title.Text";
        LocalizationKeys.ResizeMessageOverlayBody = "ControlsCommon.ResizeMessageOverlay.Overlay.Text";
        return LocalizationKeys;
    }());
    ControlsCommon.LocalizationKeys = LocalizationKeys;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
    * Defines an intance of a localization manager
    */
    var LocalizationManager = /** @class */ (function () {
        function LocalizationManager(ajaxHelper, localizationMedatadataProvider) {
            this.ajaxHelper = ajaxHelper;
            this.localizationMedatadataProvider = localizationMedatadataProvider;
        }
        LocalizationManager.prototype.dispose = function () {
            this.InvalidateCache();
        };
        LocalizationManager.prototype.InvalidateCache = function () {
            LocalizationManager.localizationListCache = null;
        };
        LocalizationManager.prototype.GetLocalizedStringWithCallback = function (key, callback) {
            this.loadLocalizationList()
                .done(function () {
                var result = '';
                var localizationEntry = LocalizationManager.localizationListCache[key];
                if (ControlsCommon.Utils.Object.isNullOrUndefined(localizationEntry) || ControlsCommon.Utils.Object.isNullOrUndefined(localizationEntry.Value)) {
                    result = key;
                }
                else {
                    result = localizationEntry.Value;
                }
                callback(result);
            })
                .fail(function () {
                callback(key);
            });
        };
        LocalizationManager.prototype.GetLocalizedStringsWithCallback = function (keys, callback) {
            this.loadLocalizationList()
                .done(function () {
                var result = [];
                for (var i = 0; i < keys.length; i++) {
                    var localizationEntry = LocalizationManager.localizationListCache[keys[i]];
                    if (ControlsCommon.Utils.Object.isNullOrUndefined(localizationEntry) || ControlsCommon.Utils.Object.isNullOrUndefined(localizationEntry.Value)) {
                        result.push(keys[i]);
                    }
                    else {
                        result.push(localizationEntry.Value);
                    }
                }
                callback(result);
            })
                .fail(function () {
                callback(keys);
            });
        };
        LocalizationManager.prototype.loadLocalizationList = function () {
            var _this = this;
            if (typeof ($) === "undefined") {
                var $ = window["jQuery"] || window.parent["jQuery"];
            }
            var deferred = $.Deferred();
            if (ControlsCommon.Utils.Object.isNullOrUndefined(LocalizationManager.localizationListCache) || this.localizationMedatadataProvider.LanguageHasChanged()) {
                var errorCallback_1 = function (data) {
                    deferred.rejectWith(_this, [data]);
                };
                var successCallback_1 = function (data) {
                    LocalizationManager.localizationListCache = JSON.parse(data);
                    deferred.resolveWith(_this, [data]);
                };
                var defaultLanguageCallback = function (data) {
                    _this.ajaxHelper.GetRequest(_this.localizationMedatadataProvider.GetDefaultLanguageFileUrl(), successCallback_1, errorCallback_1);
                };
                this.ajaxHelper.GetRequest(this.localizationMedatadataProvider.GetLanguageFileUrl(), successCallback_1, defaultLanguageCallback);
            }
            else {
                deferred.resolveWith(this, []);
            }
            return deferred.promise();
        };
        LocalizationManager.localizationListCache = null;
        return LocalizationManager;
    }());
    ControlsCommon.LocalizationManager = LocalizationManager;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
    * Defines a localization metadata provider
    */
    var LocalizationMetadataProvider = /** @class */ (function () {
        function LocalizationMetadataProvider(lcid) {
            LocalizationMetadataProvider.currentLanguageCode = lcid ? lcid : LocalizationMetadataProvider.DEFAULT_LCID;
            this.context = ControlsCommon.Utils.ContextProvider.get();
        }
        LocalizationMetadataProvider.prototype.GetLanguageFileUrl = function () {
            this.checkForLanguageCodeChange();
            return ControlsCommon.Utils.String.Format(ControlsCommon.WebResourcesConstants.LocalizationFileUrlWithLCIDMask, this.getClientUrl(), this.GetCurrentLanguageCode());
        };
        LocalizationMetadataProvider.prototype.GetDefaultLanguageFileUrl = function () {
            this.checkForLanguageCodeChange();
            return ControlsCommon.Utils.String.Format(ControlsCommon.WebResourcesConstants.LocalizationFileUrlWithLCIDMask, this.getClientUrl(), this.GetDefaultLanguageCode());
        };
        LocalizationMetadataProvider.prototype.LanguageHasChanged = function () {
            return !(this.GetCurrentLanguageCode() === this.getCurrentLcid());
        };
        LocalizationMetadataProvider.prototype.GetCurrentLanguageCode = function () {
            return LocalizationMetadataProvider.currentLanguageCode;
        };
        LocalizationMetadataProvider.prototype.GetDefaultLanguageCode = function () {
            return LocalizationMetadataProvider.DEFAULT_LCID;
        };
        LocalizationMetadataProvider.prototype.checkForLanguageCodeChange = function () {
            if (this.LanguageHasChanged) {
                var currentLcid = this.getCurrentLcid();
                if (currentLcid > 0) {
                    LocalizationMetadataProvider.currentLanguageCode = currentLcid;
                }
            }
        };
        LocalizationMetadataProvider.prototype.getCurrentLcid = function () {
            var result = LocalizationMetadataProvider.DEFAULT_LCID;
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(this.context)
                && !ControlsCommon.Utils.Object.isNullOrUndefined(this.context.getUserLcid))
                result = this.context.getUserLcid();
            return result;
        };
        LocalizationMetadataProvider.prototype.getClientUrl = function () {
            var result = "";
            if (!ControlsCommon.Utils.Object.isNullOrUndefined(this.context)
                && !ControlsCommon.Utils.Object.isNullOrUndefined(this.context.getClientUrl))
                result = this.context.getClientUrl();
            return result;
        };
        LocalizationMetadataProvider.DEFAULT_LCID = 1033;
        LocalizationMetadataProvider.currentLanguageCode = 0;
        return LocalizationMetadataProvider;
    }());
    ControlsCommon.LocalizationMetadataProvider = LocalizationMetadataProvider;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    var String = ControlsCommon.Utils.String;
    var KeywordRepository = /** @class */ (function (_super) {
        __extends(KeywordRepository, _super);
        function KeywordRepository(odataUrlHelper, ajaxHelper, crmEntityPrefix) {
            var _this = _super.call(this, odataUrlHelper, ajaxHelper) || this;
            _this.crmEntityPrefix = crmEntityPrefix;
            return _this;
        }
        KeywordRepository.prototype.GetEntityLogicalName = function () {
            return String.Format(ControlsCommon.WebApiConstants.KeywordEntityLogicalName, this.crmEntityPrefix);
        };
        return KeywordRepository;
    }(ControlsCommon.BaseEntityRepository));
    ControlsCommon.KeywordRepository = KeywordRepository;
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
    /**
     * Defines ResizeMessageOverlay checker class.
     */
    var ResizeMessageOverlay = /** @class */ (function () {
        function ResizeMessageOverlay(getLocalizedString, elementToToggle) {
            this.getLocalizedString = getLocalizedString;
            this.elementToToggle = elementToToggle;
            this.messageOverlayContainerCssClass = 'ms-mktsvc-Gallery-MessageOverlayContainer';
            this.messageOverlayTitleCssClass = 'ms-mktsvc-Gallery-MessageOverlayTitle';
            this.messageOverlayTextCssClass = 'ms-mktsvc-Gallery-MessageOverlayText';
            this.isHidden = true;
            this.createMessageOverlay();
        }
        ResizeMessageOverlay.prototype.evaluateScreenSize = function (elementToObserve, minWidthBeforeOverlay) {
            if (elementToObserve.outerWidth() < minWidthBeforeOverlay) {
                this.showMessageOverlay();
            }
            else {
                this.hideMessageOverlay();
            }
        };
        ResizeMessageOverlay.prototype.createMessageOverlay = function () {
            this.messageOverlay = $("<div>", {
                "class": this.messageOverlayContainerCssClass,
                "style": "display: none;"
            });
            var messageOverlayTitle = $("<span>", {
                "class": this.messageOverlayTitleCssClass,
                "text": this.getLocalizedString(ControlsCommon.LocalizationKeys.ResizeMessageOverlayTitle)
            });
            this.messageOverlay.append(messageOverlayTitle);
            var messageOverlayText = $("<p>", {
                "class": this.messageOverlayTextCssClass,
                "text": this.getLocalizedString(ControlsCommon.LocalizationKeys.ResizeMessageOverlayBody)
            });
            this.messageOverlay.append(messageOverlayText);
            this.messageOverlay.insertAfter(this.elementToToggle);
        };
        ResizeMessageOverlay.prototype.hideMessageOverlay = function () {
            if (!this.isHidden) {
                this.isHidden = true;
                this.elementToToggle[0].style.display = this.displayType;
                this.messageOverlay.hide();
            }
        };
        ResizeMessageOverlay.prototype.showMessageOverlay = function () {
            if (this.isHidden) {
                this.isHidden = false;
                this.displayType = this.elementToToggle[0].style.display;
                this.elementToToggle.hide();
                this.messageOverlay.show();
            }
        };
        return ResizeMessageOverlay;
    }());
    ControlsCommon.ResizeMessageOverlay = ResizeMessageOverlay;
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="ILoadingService.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="IPagingService.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    "use strict";
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var UtilObject = Utils.Object;
        /**
         * Defines dependency checker class.
         */
        var DependencyChecker = /** @class */ (function () {
            function DependencyChecker(doc) {
                this.doc = doc;
            }
            DependencyChecker.prototype.exists = function (name, id) {
                if (DependencyChecker.cache.isEmpty()) {
                    this.loadCheckers();
                }
                var nameString = name.toString();
                if (DependencyChecker.cache.hasKey(nameString)) {
                    var checker = DependencyChecker.cache.get(nameString);
                    if (!Utils.Object.isNullOrUndefined(checker)) {
                        return checker(id);
                    }
                }
                return false;
            };
            DependencyChecker.prototype.loadCheckers = function () {
                var _this = this;
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FileUploadCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("FileUploadControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FileUploadScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("FileUpload.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.KeywordsControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("KeywordsControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.KeywordsFilterCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("KeywordsFilter.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BaseGalleryControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("BaseGalleryControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FilterControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("FilterControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FilterControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("FilterControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.PreviewControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("PreviewControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.PreviewControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("PreviewControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.GridViewControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("GridViewControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.GridViewControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("GridViewControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.GalleryControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("GalleryControl.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.GalleryControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("GalleryControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpCanvasToBlobScript.toString(), function (id) {
                    return !UtilObject.isNullOrUndefined(window.dataURLtoBlob);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageScript.toString(), function (id) {
                    return !UtilObject.isNullOrUndefined(window.loadImage) && !UtilObject.isNullOrUndefined(window.loadImage.scale);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageOrientationScript.toString(), function (id) {
                    return DependencyChecker.cache.get(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageScript.toString())(id) &&
                        !UtilObject.isNullOrUndefined(window.loadImage.getTransformedOptions);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageMetaScript.toString(), function (id) {
                    return DependencyChecker.cache.get(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageScript.toString())(id) &&
                        !UtilObject.isNullOrUndefined(window.loadImage.parseMetaData);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageExifScript.toString(), function (id) {
                    return DependencyChecker.cache.get(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageScript.toString())(id) &&
                        !UtilObject.isNullOrUndefined(window.loadImage.parseExifData);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageExifMapScript.toString(), function (id) {
                    return DependencyChecker.cache.get(ControlsCommon.DependencyNamesEnum.BlueimpLoadImageScript.toString())(id) &&
                        !UtilObject.isNullOrUndefined(window.loadImage.ExifMap) &&
                        !UtilObject.isNullOrUndefined(window.loadImage.ExifMap.prototype.getAll);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadScript.toString(), function (id) {
                    return !UtilObject.isNullOrUndefined(jQuery) && !UtilObject.isNullOrUndefined(jQuery.fn.fileupload);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadProcessScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("jquery.fileupload-process.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadImageScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("jquery.fileupload-image.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadUiScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("jquery.fileupload-ui.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadValidateScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("jquery.fileupload-validate.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("jquery.fileupload.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.BlueimpFileUploadUiCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("jquery.fileupload-ui.css", _this.doc);
                });
                // CustomerJourneyDesignerControl scripts checkers
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.MarketingWorkflowDesignerBundleScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("MarketingWorkflowDesignerBundle.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.CustomerJourneyDesignerControlBundleScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("CustomerJourneyDesignerControlBundle.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.Underscore.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("underscore.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.Backbone.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("backbone.js", id, _this.doc);
                });
                // CustomerJourneyDesignerControl styles checkers
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.GenericWorkflowDesignerCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("GenericWorkflowDesigner.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.PropertyPageCommonCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("PropertyPageCommon.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.MarketingWorkflowDesignerCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("MarketingWorkflowDesigner.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.CustomerJourneyDesignerPropertyPagesCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("CustomerJourneyDesigner.PropertyPages.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.CustomerJourneyDesignerCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("CustomerJourneyDesigner.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.ListBoxControlScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("ListBoxControl.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.InputAssistEditControlCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("Input.Assist.Edit.Control.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.AttributeSelectControlCoreScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("AttributeSelectControlCore.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.AttributeMultiSelectControlCoreScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("AttributeMultiSelectControlCore.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.PageEditorControlBundleScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("PageEditorControlBundle.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.PageEditorControlBundleCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("PageEditorControlBundle.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FormEditorControlBundleScript.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("FormEditorControlBundle.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.FormEditorControlBundleCss.toString(), function (id) {
                    return Utils.DomUtils.stylesheetLinkElementExists("FormEditorControlBundle.css", _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.HtmlMinifier.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("htmlminifier.min.js", id, _this.doc);
                });
                DependencyChecker.cache.addOrUpdate(ControlsCommon.DependencyNamesEnum.Juice.toString(), function (id) {
                    return Utils.DomUtils.scriptElementExists("juice.js", id, _this.doc);
                });
            };
            DependencyChecker.cache = new Utils.Dictionary();
            return DependencyChecker;
        }());
        Utils.DependencyChecker = DependencyChecker;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
         * Defines dependency manager class.
         */
        var DependencyManager = /** @class */ (function () {
            function DependencyManager(doc, dependencyChecker, domUtils) {
                this.doc = doc;
                this.dependencyChecker = dependencyChecker ? dependencyChecker : new Utils.DependencyChecker(doc);
                this.domUtils = domUtils ? domUtils : Utils.DomUtils.getInstance();
            }
            DependencyManager.prototype.loadScriptsIntoDom = function (deps, callback) {
                this.loadScriptsIntoDomSequentially(this, deps, 0, callback);
            };
            DependencyManager.prototype.loadStylesheetsIntoDom = function (deps, callback) {
                var _this = this;
                var promises = [];
                deps.forEach(function (value) {
                    promises.push(_this.getLoadStylesheetIntoDomPromise(value.name, value.loadPath));
                });
                $.when.apply($, promises).done(function () {
                    if (!Utils.Object.isNullOrUndefined(callback))
                        callback();
                });
            };
            DependencyManager.getDependency = function (name) {
                return DependencyManager.dependencies.get(name.toString());
            };
            DependencyManager.prototype.createDependency = function (name, state, promise) {
                if (state === void 0) { state = ControlsCommon.LoadStatesEnum.Absent; }
                var dependency = new ControlsCommon.Dependency();
                dependency.name = name;
                dependency.state = state;
                dependency.promise = promise;
                return dependency;
            };
            DependencyManager.addDependency = function (dependency) {
                DependencyManager.dependencies.addOrUpdate(dependency.name.toString(), dependency);
            };
            DependencyManager.prototype.getLoadStylesheetIntoDomPromise = function (name, loadPath) {
                var deferred = $.Deferred();
                var dependency = DependencyManager.getDependency(name);
                if (Utils.Object.isNullOrUndefined(dependency)) {
                    dependency = this.createDependency(name, ControlsCommon.LoadStatesEnum.Loading, deferred.promise());
                    DependencyManager.addDependency(dependency);
                    if (this.dependencyChecker.exists(name)) {
                        dependency.state = ControlsCommon.LoadStatesEnum.Loaded;
                        deferred.resolve();
                    }
                    else {
                        var cssElement = this.domUtils.createStyleSheetLinkElementFromUrl(loadPath, this.doc);
                        cssElement.onload = function () {
                            dependency.state = ControlsCommon.LoadStatesEnum.Loaded;
                            deferred.resolve();
                        };
                        this.doc.body.appendChild(cssElement);
                    }
                }
                return dependency.promise;
            };
            DependencyManager.prototype.loadScriptsIntoDomSequentially = function (dependencyManager, scripts, startIndex, completeCallback) {
                if (startIndex >= scripts.length) {
                    completeCallback();
                }
                else {
                    var scriptToLoad = scripts[startIndex];
                    this.loadScriptIntoDom(scriptToLoad).done(function () {
                        dependencyManager.loadScriptsIntoDomSequentially(dependencyManager, scripts, startIndex + 1, completeCallback);
                    });
                }
            };
            DependencyManager.prototype.loadScriptIntoDom = function (dep) {
                var deferred = $.Deferred();
                var name = dep.name, loadPath = dep.loadPath, scriptLoadBehavior = dep.scriptLoadBehavior;
                var id = ControlsCommon.DependencyNamesEnum[name] + "-script";
                var dependency = DependencyManager.getDependency(name);
                if (Utils.Object.isNullOrUndefined(dependency)) {
                    dependency = this.createDependency(name, ControlsCommon.LoadStatesEnum.Loading, deferred.promise());
                    DependencyManager.addDependency(dependency);
                    if (this.dependencyChecker.exists(name, id)) {
                        dependency.state = ControlsCommon.LoadStatesEnum.Loaded;
                        deferred.resolve();
                    }
                    else {
                        var scriptElement = this.domUtils.createScriptElementFromUrl(id, loadPath, this.doc);
                        scriptElement.onload = function () {
                            if (scriptLoadBehavior) {
                                scriptLoadBehavior.onLoad();
                            }
                            dependency.state = ControlsCommon.LoadStatesEnum.Loaded;
                            deferred.resolve();
                        };
                        this.doc.body.appendChild(scriptElement);
                    }
                }
                return dependency.promise;
            };
            DependencyManager.dependencies = new Utils.Dictionary();
            return DependencyManager;
        }());
        Utils.DependencyManager = DependencyManager;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    /**
     * The load states
     */
    var DependencyNamesEnum;
    (function (DependencyNamesEnum) {
        DependencyNamesEnum[DependencyNamesEnum["FileUploadCss"] = 0] = "FileUploadCss";
        DependencyNamesEnum[DependencyNamesEnum["FileUploadScript"] = 1] = "FileUploadScript";
        DependencyNamesEnum[DependencyNamesEnum["KeywordsControlCss"] = 2] = "KeywordsControlCss";
        DependencyNamesEnum[DependencyNamesEnum["KeywordsFilterCss"] = 3] = "KeywordsFilterCss";
        DependencyNamesEnum[DependencyNamesEnum["FilterControlCss"] = 4] = "FilterControlCss";
        DependencyNamesEnum[DependencyNamesEnum["PreviewControlCss"] = 5] = "PreviewControlCss";
        DependencyNamesEnum[DependencyNamesEnum["GridViewControlCss"] = 6] = "GridViewControlCss";
        DependencyNamesEnum[DependencyNamesEnum["GalleryControlCss"] = 7] = "GalleryControlCss";
        DependencyNamesEnum[DependencyNamesEnum["BaseGalleryControlScript"] = 8] = "BaseGalleryControlScript";
        DependencyNamesEnum[DependencyNamesEnum["FilterControlScript"] = 9] = "FilterControlScript";
        DependencyNamesEnum[DependencyNamesEnum["PreviewControlScript"] = 10] = "PreviewControlScript";
        DependencyNamesEnum[DependencyNamesEnum["GridViewControlScript"] = 11] = "GridViewControlScript";
        DependencyNamesEnum[DependencyNamesEnum["GalleryControlScript"] = 12] = "GalleryControlScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpCanvasToBlobScript"] = 13] = "BlueimpCanvasToBlobScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpLoadImageScript"] = 14] = "BlueimpLoadImageScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpLoadImageMetaScript"] = 15] = "BlueimpLoadImageMetaScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpLoadImageExifScript"] = 16] = "BlueimpLoadImageExifScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpLoadImageExifMapScript"] = 17] = "BlueimpLoadImageExifMapScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpLoadImageOrientationScript"] = 18] = "BlueimpLoadImageOrientationScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadScript"] = 19] = "BlueimpFileUploadScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadProcessScript"] = 20] = "BlueimpFileUploadProcessScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadImageScript"] = 21] = "BlueimpFileUploadImageScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadUiScript"] = 22] = "BlueimpFileUploadUiScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadValidateScript"] = 23] = "BlueimpFileUploadValidateScript";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadCss"] = 24] = "BlueimpFileUploadCss";
        DependencyNamesEnum[DependencyNamesEnum["BlueimpFileUploadUiCss"] = 25] = "BlueimpFileUploadUiCss";
        DependencyNamesEnum[DependencyNamesEnum["BootstrapCss"] = 26] = "BootstrapCss";
        DependencyNamesEnum[DependencyNamesEnum["AutomationCoreCss"] = 27] = "AutomationCoreCss";
        DependencyNamesEnum[DependencyNamesEnum["GenericWorkflowDesignerScript"] = 28] = "GenericWorkflowDesignerScript";
        DependencyNamesEnum[DependencyNamesEnum["GenericWorkflowDesignerCss"] = 29] = "GenericWorkflowDesignerCss";
        DependencyNamesEnum[DependencyNamesEnum["PropertyPageCommonScript"] = 30] = "PropertyPageCommonScript";
        DependencyNamesEnum[DependencyNamesEnum["PropertyPageCommonCss"] = 31] = "PropertyPageCommonCss";
        DependencyNamesEnum[DependencyNamesEnum["MarketingWorkflowDesignerScript"] = 32] = "MarketingWorkflowDesignerScript";
        DependencyNamesEnum[DependencyNamesEnum["MarketingWorkflowDesignerCss"] = 33] = "MarketingWorkflowDesignerCss";
        DependencyNamesEnum[DependencyNamesEnum["MarketingWorkflowDesignerBundleScript"] = 34] = "MarketingWorkflowDesignerBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["ExtendedMarketingWorkflowDesignerBundleScript"] = 35] = "ExtendedMarketingWorkflowDesignerBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["CustomerJourneyDesignerPropertyPagesCss"] = 36] = "CustomerJourneyDesignerPropertyPagesCss";
        DependencyNamesEnum[DependencyNamesEnum["CustomerJourneyDesignerCss"] = 37] = "CustomerJourneyDesignerCss";
        DependencyNamesEnum[DependencyNamesEnum["CustomerJourneyDesignerControlBundleScript"] = 38] = "CustomerJourneyDesignerControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["EditorCss"] = 39] = "EditorCss";
        DependencyNamesEnum[DependencyNamesEnum["EmailEditorCss"] = 40] = "EmailEditorCss";
        DependencyNamesEnum[DependencyNamesEnum["MarketingEmailEditorControlCss"] = 41] = "MarketingEmailEditorControlCss";
        DependencyNamesEnum[DependencyNamesEnum["EditorScript"] = 42] = "EditorScript";
        DependencyNamesEnum[DependencyNamesEnum["LeadScoringDesignerPropertyPagesCss"] = 43] = "LeadScoringDesignerPropertyPagesCss";
        DependencyNamesEnum[DependencyNamesEnum["LeadScoringDesignerCss"] = 44] = "LeadScoringDesignerCss";
        DependencyNamesEnum[DependencyNamesEnum["LeadScoringDesignerControlBundleScript"] = 45] = "LeadScoringDesignerControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["MarketingEmailEditorControlBundleScript"] = 46] = "MarketingEmailEditorControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["ListBoxControlScript"] = 47] = "ListBoxControlScript";
        DependencyNamesEnum[DependencyNamesEnum["AssistEditControlBundleScript"] = 48] = "AssistEditControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["InputAssistEditControlScript"] = 49] = "InputAssistEditControlScript";
        DependencyNamesEnum[DependencyNamesEnum["InputAssistEditControlCss"] = 50] = "InputAssistEditControlCss";
        DependencyNamesEnum[DependencyNamesEnum["PageEditorControlBundleCss"] = 51] = "PageEditorControlBundleCss";
        DependencyNamesEnum[DependencyNamesEnum["PageEditorControlBundleScript"] = 52] = "PageEditorControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["FormEditorControlBundleCss"] = 53] = "FormEditorControlBundleCss";
        DependencyNamesEnum[DependencyNamesEnum["FormEditorControlBundleScript"] = 54] = "FormEditorControlBundleScript";
        DependencyNamesEnum[DependencyNamesEnum["AttributeSelectControlCoreScript"] = 55] = "AttributeSelectControlCoreScript";
        DependencyNamesEnum[DependencyNamesEnum["AttributeMultiSelectControlCoreScript"] = 56] = "AttributeMultiSelectControlCoreScript";
        DependencyNamesEnum[DependencyNamesEnum["Underscore"] = 57] = "Underscore";
        DependencyNamesEnum[DependencyNamesEnum["Backbone"] = 58] = "Backbone";
        DependencyNamesEnum[DependencyNamesEnum["HtmlMinifier"] = 59] = "HtmlMinifier";
        DependencyNamesEnum[DependencyNamesEnum["Juice"] = 60] = "Juice";
    })(DependencyNamesEnum = ControlsCommon.DependencyNamesEnum || (ControlsCommon.DependencyNamesEnum = {}));
})(ControlsCommon || (ControlsCommon = {}));
/// <reference path="../commonreferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
// -----------------------------------------------------------------------
// <copyright file="CachePathFragmentExtractor.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="../commonreferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
        * Defines the cache path fragment extractor.
        */
        var CachePathFragmentExtractor = /** @class */ (function () {
            function CachePathFragmentExtractor(domUtils, doc) {
                this.domUtils = domUtils;
                this.doc = doc;
            }
            CachePathFragmentExtractor.prototype.tryExtractCachePathFragment = function () {
                var scriptElements = this.domUtils.getScriptElements(this.doc);
                for (var i = scriptElements.length - 1; i >= 0; --i) {
                    var url = scriptElements[i].src.toLowerCase();
                    if (url.indexOf(CachePathFragmentExtractor.SrcStringRequirement) > 0) {
                        var p1 = url.indexOf(CachePathFragmentExtractor.CachePathFragmentStart);
                        if (p1 > 0) {
                            var p2 = url.indexOf(CachePathFragmentExtractor.CachePathFragmentEnd) + CachePathFragmentExtractor.CachePathFragmentEnd.length;
                            var result = url.substr(p1 + 1, p2 - p1 - 2);
                            result = decodeURI(result);
                            var removedBrackets = result.substr(1, result.length - 2);
                            if (removedBrackets.length > 0 && removedBrackets.match(CachePathFragmentExtractor.DigitsOnlyRegex) !== null) {
                                return result;
                            }
                        }
                    }
                }
                return null;
            };
            CachePathFragmentExtractor.CachePathFragmentStart = "/%7b";
            CachePathFragmentExtractor.CachePathFragmentEnd = "%7d/";
            CachePathFragmentExtractor.SrcStringRequirement = "webresources/cc_mscrmcontrols";
            CachePathFragmentExtractor.DigitsOnlyRegex = /^[0-9]+$/;
            return CachePathFragmentExtractor;
        }());
        Utils.CachePathFragmentExtractor = CachePathFragmentExtractor;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        var HtmlToImageConverter = /** @class */ (function () {
            function HtmlToImageConverter(hostElement, contentSanitizer) {
                this.hostElement = hostElement;
                this.contentSanitizer = contentSanitizer;
                this.hostElement = $("<div>").appendTo(hostElement);
                this.hostElement.css({ width: "1px", height: "1px", overflow: "hidden" });
            }
            HtmlToImageConverter.prototype.render = function (html, callback) {
                var _this = this;
                this.iframe = null;
                this.hostElement.empty();
                this.iframe = document.createElement('iframe');
                $(this.iframe).css({
                    width: HtmlToImageConverter.canvasSize + "px",
                    height: HtmlToImageConverter.canvasSize + "px"
                });
                $(this.iframe).attr({
                    "tabindex": "-1",
                    "sandbox": "allow-same-origin allow-scripts",
                });
                $(this.iframe).appendTo(this.hostElement);
                this.contentSanitizer.init(function () {
                    _this.contentSanitizer.getSanitizedContent(html, function (sanitized) {
                        _this.iframe.onload = function () {
                            html2canvas(_this.iframe.contentWindow.document.body, {
                                width: HtmlToImageConverter.canvasSize,
                                height: HtmlToImageConverter.canvasSize,
                                useCORS: true,
                                allowTaint: false,
                                background: "#fff"
                            }).then(function (canvas) { return _this.resizePreview(canvas, callback); });
                        };
                        _this.iframe.contentWindow.document.open();
                        _this.iframe.contentWindow.document.write(sanitized.html());
                        _this.iframe.contentWindow.document.close();
                    });
                });
            };
            HtmlToImageConverter.prototype.resizePreview = function (canvas, callback) {
                var result = null;
                try {
                    var canvasSize = HtmlToImageConverter.canvasSize;
                    var previewSize = HtmlToImageConverter.previewSize;
                    var context = canvas.getContext("2d");
                    var startPos = Math.round((canvas.height - canvasSize) / 2);
                    if (startPos < 0) {
                        startPos = 0;
                    }
                    var maxPos = canvas.height >= startPos + canvasSize ? startPos + canvasSize : canvas.height;
                    var image = context.getImageData(0, startPos, canvasSize, maxPos);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.height = canvasSize;
                    context.putImageData(image, 0, 0);
                    context.drawImage(canvas, 0, 0, previewSize, previewSize);
                    image = context.getImageData(0, 0, previewSize, previewSize);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    canvas.width = previewSize;
                    canvas.height = previewSize;
                    context.putImageData(image, 0, 0);
                    result = canvas.toDataURL("image/png").replace('data:image/png;base64,', '');
                }
                catch (e) {
                    if (e.message) {
                        console.error(e.message);
                    }
                    else {
                        console.error(e);
                    }
                }
                finally {
                    callback(result);
                }
            };
            HtmlToImageConverter.prototype.dispose = function () {
                this.hostElement.empty();
                this.contentSanitizer.dispose();
            };
            HtmlToImageConverter.canvasSize = 1024;
            HtmlToImageConverter.previewSize = 144;
            return HtmlToImageConverter;
        }());
        Utils.HtmlToImageConverter = HtmlToImageConverter;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
        /**
         * Class for obtaining Xrm namespace
         */
        var ContextProvider = /** @class */ (function () {
            function ContextProvider() {
            }
            /**
             * Gets the Xrm namespace
             */
            ContextProvider.get = function () {
                var getContext = window.GetGlobalContext ||
                    window.getGlobalContextObject ||
                    window.parent.getGlobalContextObject;
                if (getContext)
                    return getContext();
                return null;
            };
            return ContextProvider;
        }());
        Utils.ContextProvider = ContextProvider;
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    var Utils;
    (function (Utils) {
        'use strict';
    })(Utils = ControlsCommon.Utils || (ControlsCommon.Utils = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var ControlsCommon;
(function (ControlsCommon) {
    /**
     * The load states
     */
    var LoadStatesEnum;
    (function (LoadStatesEnum) {
        LoadStatesEnum[LoadStatesEnum["Absent"] = 0] = "Absent";
        LoadStatesEnum[LoadStatesEnum["Loading"] = 1] = "Loading";
        LoadStatesEnum[LoadStatesEnum["Loaded"] = 2] = "Loaded";
    })(LoadStatesEnum = ControlsCommon.LoadStatesEnum || (ControlsCommon.LoadStatesEnum = {}));
})(ControlsCommon || (ControlsCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="..\CommonReferences.ts" />
var ControlsCommon;
(function (ControlsCommon) {
    'use strict';
})(ControlsCommon || (ControlsCommon = {}));
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ConsoleLogger = /** @class */ (function () {
                function ConsoleLogger() {
                }
                ConsoleLogger.prototype.log = function (traceLevel, eventName, parameters) {
                    var serialized = JSON.stringify(parameters);
                    switch (traceLevel) {
                        case Common.TraceLevel.Info:
                        case Common.TraceLevel.Verbose:
                            console.log(eventName, serialized);
                            break;
                        case Common.TraceLevel.Warning:
                            console.warn(eventName, serialized);
                            break;
                        case Common.TraceLevel.Error:
                            console.error(eventName, serialized);
                            break;
                        default:
                            console.log(eventName, serialized);
                    }
                };
                ConsoleLogger.prototype.getPerfToken = function () {
                    return { timestampInMillisUtc: new Date().getTime() };
                };
                ConsoleLogger.prototype.logPerf = function (traceLevel, eventName, perfToken, parameters) {
                    var dateNow = new Date();
                    var elapsedMilliseconds = dateNow.getTime() - perfToken.timestampInMillisUtc;
                    if (Common.Object.isNullOrUndefined(parameters)) {
                        parameters = new Common.Dictionary();
                    }
                    parameters.addOrUpdate("ElapsedMilliseconds", elapsedMilliseconds);
                    this.log(elapsedMilliseconds < ConsoleLogger.warningTreshold ? traceLevel : Common.TraceLevel.Warning, eventName, parameters);
                };
                ConsoleLogger.prototype.logException = function (traceLevel, eventName, error, parameters) {
                    if (Common.Object.isNullOrUndefined(parameters)) {
                        parameters = new Common.Dictionary();
                    }
                    var traceDump = Common.Object.isNullOrUndefined(error.stack) ? error.message : error.stack;
                    parameters.addOrUpdate(Common.ParameterKeys.LoggerError, traceDump);
                    this.log(traceLevel, eventName, parameters);
                };
                ConsoleLogger.prototype.logMarker = function (name, collectionName, correlationId) {
                };
                ConsoleLogger.prototype.completeCollection = function (collection, correlationId) {
                };
                /**
                * Threshold time to log a warning.
                */
                ConsoleLogger.warningTreshold = 25;
                return ConsoleLogger;
            }());
            Common.ConsoleLogger = ConsoleLogger;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var TraceLevel;
            (function (TraceLevel) {
                TraceLevel[TraceLevel["Error"] = 0] = "Error";
                TraceLevel[TraceLevel["Warning"] = 1] = "Warning";
                TraceLevel[TraceLevel["Info"] = 2] = "Info";
                TraceLevel[TraceLevel["Verbose"] = 3] = "Verbose";
            })(TraceLevel = Common.TraceLevel || (Common.TraceLevel = {}));
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * A wrapper class for ajax calls
            */
            var AjaxCall = /** @class */ (function () {
                function AjaxCall() {
                }
                AjaxCall.prototype.getJson = function (path) {
                    return $.getJSON(path);
                };
                return AjaxCall;
            }());
            Common.AjaxCall = AjaxCall;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * The localization provider
            */
            var LabelsProvider = /** @class */ (function () {
                /**
                 * Creates a provider that will query external source for labels
                 * @param languageCode Requested language of the labels
                 * @param ajaxCall Ajax call
                 * @param logger logger to print errors.
                 * @param controlCdnPaths Paths to the labels files. Ordered, first being the most general, i.e. least significant.
                 */
                function LabelsProvider(languageCode, ajaxCall, logger) {
                    var controlCdnPaths = [];
                    for (var _i = 3; _i < arguments.length; _i++) {
                        controlCdnPaths[_i - 3] = arguments[_i];
                    }
                    this.languageCode = languageCode;
                    this.ajaxCall = ajaxCall;
                    this.logger = logger;
                    this.localizationFileExtension = ".txt";
                    this.controlCdnPaths = controlCdnPaths;
                }
                LabelsProvider.prototype.setLocalizationFileExtension = function (extension) {
                    this.localizationFileExtension = extension;
                };
                /**
                * Get the list of dictionaries with labels for a specific language from a cdn
                */
                LabelsProvider.prototype.getLabels = function (controlNames) {
                    var _this = this;
                    var labelsPromises = this.getLocalizationFilesPaths().map(function (path) {
                        var perfToken = _this.logger.getPerfToken();
                        var logData = new Common.Dictionary({ "Url": path, "Method": "GET" });
                        var logEventName = "MktSvc.Controls.Common.LabelsProvider.getLabels";
                        return _this.ajaxCall.getJson(path)
                            .then(function (data) {
                            logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, "success");
                            logData.addOrUpdate(Common.ParameterKeys.ReponseLengthKey, data.length);
                            _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName, perfToken, logData);
                            var labels = {};
                            if (controlNames) {
                                controlNames.forEach(function (controlName) {
                                    var controlData = data[controlName];
                                    if (controlData) {
                                        $.each(controlData, function (key, val) {
                                            labels[key] = val.Value;
                                        });
                                    }
                                });
                            }
                            else {
                                $.each(data, function (key, val) {
                                    labels[key] = val.Value;
                                });
                            }
                            return labels;
                        })
                            .fail(function () {
                            logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, "failed");
                            _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName, perfToken, logData);
                            return {};
                        });
                    });
                    var labels = {};
                    var result = $.Deferred();
                    $.when.apply($, labelsPromises).always(function () {
                        for (var i = 0; i < arguments.length; i++) {
                            $.extend(labels, arguments[i]);
                        }
                        result.resolve(labels);
                    });
                    return result.promise();
                };
                LabelsProvider.prototype.getLocalizationFilesPaths = function () {
                    var _this = this;
                    return this.controlCdnPaths.map(function (path) { return path + "/Localization/" + _this.languageCode + _this.localizationFileExtension; });
                };
                return LabelsProvider;
            }());
            Common.LabelsProvider = LabelsProvider;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
             * Localization provider implementation.
             */
            var LocalizationProvider = /** @class */ (function () {
                function LocalizationProvider(labels, localeId, rtl, logger) {
                    if (rtl === void 0) { rtl = false; }
                    this.labels = labels;
                    this.localeId = localeId;
                    this.rtl = rtl;
                    this.logger = logger;
                    /**
                     * Default language code.
                     */
                    this.defaultCode = "1033";
                    /**
                     * Mapping of supported language codes and their ISO 639-1 language codes.
                     */
                    this.mapping = {
                        "1025": "ar",
                        "1026": "bg",
                        "1027": "ca",
                        "1028": "zh",
                        "1029": "cs",
                        "1030": "da",
                        "1031": "de",
                        "1032": "el",
                        "1033": "en",
                        "1035": "fi",
                        "1036": "fr",
                        "1037": "he",
                        "1038": "hu",
                        "1040": "it",
                        "1041": "ja",
                        "1042": "ko",
                        "1043": "nl",
                        "1044": "nb",
                        "1045": "pl",
                        "1046": "pt-br",
                        "1048": "ro",
                        "1049": "ru",
                        "1050": "hr",
                        "1051": "sk",
                        "1053": "sv",
                        "1054": "th",
                        "1055": "tr",
                        "1057": "id",
                        "1058": "uk",
                        "1060": "sl",
                        "1061": "et",
                        "1062": "lv",
                        "1063": "lt",
                        "1066": "vi",
                        "1069": "eu",
                        "1081": "hi",
                        "1086": "ms",
                        "1087": "kk",
                        "1110": "gl",
                        "2052": "zh-cn",
                        "2070": "pt",
                        "2074": "sr-latn",
                        "3076": "zh-hk",
                        "3082": "es",
                        "3098": "sr"
                    };
                }
                /**
                 * Returns a promise which, when resolved, indicates all labels have been loaded.
                 */
                LocalizationProvider.prototype.fullyInitialized = function () {
                    return $.Deferred()
                        .resolve()
                        .promise();
                };
                /**
                 * Register labels for localization.
                 * @param localizations Localization labels.
                 */
                LocalizationProvider.prototype.registerLabels = function (localizations) {
                    $.extend(this.labels, localizations);
                };
                /**
                 * Gets the localized string
                 */
                LocalizationProvider.prototype.getLocalizedString = function (key, formatItems) {
                    var localizedString = key;
                    if (key in this.labels) {
                        localizedString = this.labels[key];
                    }
                    else if (this.logger) {
                        var logEventName = "MktSvc.Controls.Common.LocalizationProvider.getLocalizedString";
                        var logData = new Common.Dictionary({ Key: key, LocaleId: this.localeId });
                        this.logger.log(Common.TraceLevel.Warning, logEventName, logData);
                    }
                    if (formatItems) {
                        localizedString = this.stringFormatItems(localizedString, formatItems);
                    }
                    return localizedString;
                };
                /**
                 * Get string like string.format
                 * @param template format template ("Item {0} is missing")
                 * @param replaces values to replace with ([1])
                 */
                LocalizationProvider.prototype.stringFormatItems = function (template, replaces) {
                    var index = replaces.length;
                    while (index--) {
                        template = template.replace(new RegExp('\\{' + index + '\\}', 'gm'), replaces[index]);
                    }
                    return template;
                };
                /**
                 * Gets the locale id for the language assigned by Microsoft.
                 * For example, for English - United States it should returns 1033.
                 */
                LocalizationProvider.prototype.getLocaleId = function () {
                    return this.localeId;
                };
                /**
                 * Gets the information whether the language is right to left.
                 */
                LocalizationProvider.prototype.isRtl = function () {
                    return this.rtl;
                };
                /**
                 * Get the ISO 639-1 language code.
                 */
                LocalizationProvider.prototype.getLanguageName = function () {
                    if (this.localeId in this.mapping) {
                        return this.mapping[this.localeId];
                    }
                    var logEventName = "MktSvc.Controls.Common.LocalizationProvider.getLanguageName not found.";
                    var logData = new Common.Dictionary({ LocaleId: this.localeId });
                    this.logger.log(Common.TraceLevel.Warning, logEventName, logData);
                    return this.mapping[this.defaultCode];
                };
                return LocalizationProvider;
            }());
            Common.LocalizationProvider = LocalizationProvider;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ServiceSourceLabelsProvider = /** @class */ (function () {
                function ServiceSourceLabelsProvider(serviceCallUrl, serviceClient, componentName, languageCode, logger) {
                    this.serviceCallUrl = serviceCallUrl;
                    this.serviceClient = serviceClient;
                    this.componentName = componentName;
                    this.languageCode = languageCode;
                    this.logger = logger;
                }
                /**
                * Get the list of dictionaries with labels for a specific language from a LocalizationProvider service
                */
                ServiceSourceLabelsProvider.prototype.getLabels = function () {
                    var _this = this;
                    var labelsDeferred = $.Deferred();
                    var requestObject = {
                        ServiceOperationId: "LocalizationProviderComponentLabels",
                        HttpMethod: "GET",
                        RoutingParameters: JSON.stringify([this.componentName, this.languageCode]),
                        RequestBody: null
                    };
                    var perfToken = this.logger.getPerfToken();
                    var logData = new Common.Dictionary({ "ComponentName": this.componentName, "LanguageCode": this.languageCode });
                    var logEventName = "MktSvc.Controls.Common.ServiceSourceLabelsProvider.getLabels";
                    this.serviceClient.postData(this.serviceCallUrl.build(), requestObject)
                        .done(function (result) {
                        try {
                            var responseBodyRaw = JSON.parse(result).ResponseBody;
                            var responseBody = JSON.parse(responseBodyRaw);
                            var labels = {};
                            $.each(responseBody, function (key, val) {
                                labels[key] = val.Value;
                            });
                            labelsDeferred.resolve(labels);
                            logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, "success");
                            _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName, perfToken, logData);
                        }
                        catch (error) {
                            logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, "failed");
                            _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName + ".InvalidResponse", perfToken, logData);
                            labelsDeferred.reject();
                        }
                    })
                        .fail(function (error) {
                        logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, "failed");
                        _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName, perfToken, logData);
                        labelsDeferred.reject();
                    });
                    return labelsDeferred.promise();
                };
                return ServiceSourceLabelsProvider;
            }());
            Common.ServiceSourceLabelsProvider = ServiceSourceLabelsProvider;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ArrayQuery = /** @class */ (function () {
                function ArrayQuery(data) {
                    this.data = data;
                }
                ArrayQuery.prototype.add = function (element) {
                    this.data.push(element);
                    return this;
                };
                ArrayQuery.prototype.addAt = function (element, index) {
                    this.data.splice(index, 0, element);
                    return this;
                };
                ArrayQuery.prototype.remove = function (element) {
                    var hasMoreElements = true;
                    while (hasMoreElements) {
                        var index = this.data.indexOf(element);
                        if (index > -1) {
                            this.data.splice(index, 1);
                        }
                        else {
                            hasMoreElements = false;
                        }
                    }
                    return this;
                };
                ArrayQuery.prototype.select = function (selector) {
                    var temp = [];
                    for (var i = 0; i < this.data.length; i++) {
                        var value = selector(this.data[i], i);
                        temp.push(value);
                    }
                    return new ArrayQuery(temp);
                };
                ArrayQuery.prototype.reverseEach = function (delegate) {
                    for (var i = this.data.length - 1; i >= 0; i--) {
                        delegate(this.data[i], i);
                    }
                    return this;
                };
                ArrayQuery.prototype.each = function (delegate) {
                    for (var i = 0; i < this.data.length; i++) {
                        delegate(this.data[i], i);
                    }
                    return this;
                };
                ArrayQuery.prototype.where = function (selector) {
                    var temp = [];
                    for (var i = 0; i < this.data.length; i++) {
                        if (selector(this.data[i])) {
                            temp.push(this.data[i]);
                        }
                    }
                    return new ArrayQuery(temp);
                };
                ArrayQuery.prototype.firstOrDefault = function (selector) {
                    if (Common.Object.isNullOrUndefined(selector)) {
                        if (this.items().length > 0) {
                            return this.items()[0];
                        }
                        else {
                            return null;
                        }
                    }
                    var list = this.where(selector).items();
                    if (list.length > 0) {
                        return list[0];
                    }
                    return null;
                };
                ArrayQuery.prototype.contains = function (selector) {
                    return this.firstOrDefault(selector) != null;
                };
                ArrayQuery.prototype.items = function () {
                    return this.data;
                };
                ArrayQuery.prototype.count = function () {
                    return this.data.length;
                };
                ArrayQuery.prototype.distinct = function (comparer) {
                    var temp = [];
                    for (var i = 0; i < this.data.length; i++) {
                        var isDuplicate = false;
                        for (var j = 0; j < temp.length; j++) {
                            if (comparer(this.data[i], temp[j])) {
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            temp.push(this.data[i]);
                        }
                    }
                    return new ArrayQuery(temp);
                };
                ArrayQuery.prototype.clone = function () {
                    return new ArrayQuery(this.data.slice(0));
                };
                return ArrayQuery;
            }());
            Common.ArrayQuery = ArrayQuery;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * Dictionary <key: string, value: T>
            * @typeparam T
            */
            var Dictionary = /** @class */ (function () {
                /**
                 * Creates an instance of Dictionary.
                 * @param elements A map of key value pairs.
                 */
                function Dictionary(elements) {
                    this.dictionary = {};
                    if (!Common.Object.isNullOrUndefined(elements)) {
                        this.dictionary = elements;
                    }
                }
                /**
                 * Adds or updates a dictionary entry.
                 * @param key Dictionary key.
                 * @param value Dictionary value.
                 */
                Dictionary.prototype.addOrUpdate = function (key, value) {
                    this.dictionary[key] = value;
                };
                /**
                 * Gets a value from dictionary corresponding to one key.
                 * @param key Dictionary key.
                 */
                Dictionary.prototype.get = function (key) {
                    return this.dictionary[key];
                };
                /**
                 * Gets all keys within dictionary.
                 */
                Dictionary.prototype.getKeys = function () {
                    var keys = new Common.ArrayQuery([]);
                    for (var key in this.dictionary) {
                        keys.add(key);
                    }
                    return keys;
                };
                /**
                 * Get all values within dictionary.
                 */
                Dictionary.prototype.getValues = function () {
                    var values = new Common.ArrayQuery([]);
                    for (var key in this.dictionary) {
                        values.add(this.dictionary[key]);
                    }
                    return values;
                };
                /**
                 * Gets a value that determines whether a key exist.
                 * @param key Dictionary key.
                 */
                Dictionary.prototype.hasKey = function (key) {
                    return this.dictionary.hasOwnProperty(key);
                };
                /**
                 * Removes the key from the dictionary.
                 * @param key Dictionary key.
                 */
                Dictionary.prototype.remove = function (key) {
                    delete this.dictionary[key];
                };
                /**
                 * Combine current dictionary with another dictionary creating a new dictionary instance.
                 * @param otherDictionary Other dictionary to combine with.
                 */
                Dictionary.prototype.concat = function (otherDictionary) {
                    var clonedDictionary = this.clone();
                    if (otherDictionary) {
                        otherDictionary.getKeys().items().forEach(function (key) {
                            clonedDictionary.addOrUpdate(key, otherDictionary.get(key));
                        });
                    }
                    return clonedDictionary;
                };
                /**
                 * Clone dictionary.
                 */
                Dictionary.prototype.clone = function () {
                    var _this = this;
                    var clonedDictionary = new Dictionary();
                    this.getKeys().items().forEach(function (key) {
                        clonedDictionary.addOrUpdate(key, _this.get(key));
                    });
                    return clonedDictionary;
                };
                /**
                 * Serializes dictionary to JSON string
                 */
                Dictionary.prototype.toJsonString = function () {
                    return JSON.stringify(this.dictionary);
                };
                return Dictionary;
            }());
            Common.Dictionary = Dictionary;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * Object helper methods.
            */
            var Object = /** @class */ (function () {
                function Object() {
                }
                Object.isNullOrUndefined = function (object) {
                    return typeof (object) === "undefined" || object == null;
                };
                return Object;
            }());
            Common.Object = Object;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * String helper methods.
            */
            var String = /** @class */ (function () {
                function String() {
                }
                String.isNullOrEmpty = function (s) {
                    return s == null || s.length === 0;
                };
                String.isNullOrWhitespace = function (s) {
                    return s == null || s.trim().length === 0;
                };
                String.isNullUndefinedOrWhitespace = function (s) {
                    return s == null || s === undefined || s.trim().length === 0;
                };
                /**
                * @remarks Limited functionality implemented
                * @returns a formatted string, similar to string.Format in C#.
                */
                String.Format = function (format) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var returnValue = format;
                    for (var i = 1; i < arguments.length; i++) {
                        var actualValue = typeof (arguments[i]) === "undefined" || arguments[i] == null ? "" : arguments[i].toString();
                        returnValue = returnValue.replace(new RegExp("\\{" + (i - 1) + "\\}", 'g'), actualValue);
                    }
                    return returnValue;
                };
                /**
                 * Replaces all accurences of the specified string
                 * @param string The string
                 * @param search The search string
                 * @param replace The replace by string
                 */
                String.Replace = function (string, search, replace) {
                    return string.replace(new RegExp(search, 'g'), replace);
                };
                String.Empty = "";
                return String;
            }());
            Common.String = String;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * UniqueId helper class.
            */
            var UniqueId = /** @class */ (function () {
                function UniqueId() {
                }
                /**
                 * Generates a unique id.
                 * @param prefix The prefix for the generated id if needed.
                 * @returns Unique string id.
                 */
                UniqueId.generate = function (prefix) {
                    if (Common.Object.isNullOrUndefined(prefix)) {
                        prefix = Common.String.Empty;
                    }
                    return Common.String.Format("{0}{1}{2}", prefix, Math.random().toString(16).substring(2), (new Date()).getTime());
                };
                return UniqueId;
            }());
            Common.UniqueId = UniqueId;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * Resources helper methods.
            */
            var Resources = /** @class */ (function () {
                function Resources() {
                }
                /**
                 * Loads the css from the url and resolve the promise on load
                 * @param id the styles id
                 * @param url the url for the css
                 * @param doc the document, which contain the container with a control
                 * @param promise the onload promise
                 */
                Resources.loadCssFromUrl = function (id, url, doc, promise) {
                    $("<link/>", {
                        rel: "stylesheet",
                        type: "text/css",
                        id: id,
                        href: url
                    }).load(function () {
                        promise.resolve();
                    }).appendTo(doc.body);
                };
                /**
                 * Loads the scripts from the url and resolve the promise on load
                 * @param id the script id
                 * @param url the url for the script
                 * @param doc the document, which contain the container with a control
                 * @param promise the onload promise
                 */
                Resources.loadLibsFromUrl = function (id, url, doc, promise) {
                    var script = document.createElement("script");
                    script.id = id;
                    script.type = "text/javascript";
                    script.src = url;
                    script.onload = function () {
                        promise.resolve();
                    };
                    doc.body.appendChild(script);
                };
                return Resources;
            }());
            Common.Resources = Resources;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * A type to represent event data.
            */
            var EventData = /** @class */ (function () {
                /**
                * Constructor.
                */
                function EventData(eventName, eventData) {
                    this.eventName = eventName;
                    this.eventData = eventData;
                }
                return EventData;
            }());
            var EventBroker = /** @class */ (function () {
                function EventBroker(logger) {
                    this.logger = logger;
                    this.listeners = new Common.Dictionary();
                    this.queue = new Common.Queue([]);
                }
                EventBroker.prototype.subscribe = function (eventName, delegate) {
                    if (Common.Object.isNullOrUndefined(delegate)) {
                        throw new Error("Error subscribing to event '" + eventName + "'. Delegate is null or undefined");
                    }
                    if (Common.Object.isNullOrUndefined(this.listeners.get(eventName))) {
                        this.listeners.addOrUpdate(eventName, new Common.ArrayQuery([delegate]));
                    }
                    else {
                        this.listeners.get(eventName).add(delegate);
                    }
                    return delegate;
                };
                EventBroker.prototype.unsubscribe = function (eventName, delegate) {
                    if (!Common.Object.isNullOrUndefined(this.listeners.get(eventName))) {
                        this.listeners.get(eventName).remove(delegate);
                    }
                };
                EventBroker.prototype.notify = function (eventName, eventArgs) {
                    this.queue.push(new EventData(eventName, eventArgs));
                    this.process();
                };
                EventBroker.prototype.process = function () {
                    var event = null;
                    while (event = this.queue.pop()) {
                        var data = new Common.Dictionary({ "EventName": event.eventName });
                        this.logger.log(Common.TraceLevel.Verbose, "MktSvc.Controls.Common.EventBroker.process", data);
                        var logToken = this.logger.getPerfToken();
                        this.processEvent(event.eventName, event.eventData);
                        this.logger.logPerf(Common.TraceLevel.Verbose, "MktSvc.Controls.Common.EventBroker.process", logToken, data);
                    }
                };
                EventBroker.prototype.processEvent = function (eventName, eventArgs) {
                    if (Common.Object.isNullOrUndefined(this.listeners)) {
                        // Noone is listening
                        return;
                    }
                    var listenerDelegates = this.listeners.get(eventName);
                    if (Common.Object.isNullOrUndefined(listenerDelegates) || listenerDelegates.count() === 0) {
                        return;
                    }
                    // listenerDelegates collection can be changed, iterating on a copy
                    var copyOfListenerDelegates = new Common.ArrayQuery([]);
                    listenerDelegates.each(function (delegate) {
                        copyOfListenerDelegates.add(delegate);
                    });
                    copyOfListenerDelegates.each(function (delegate) {
                        if (Common.Object.isNullOrUndefined(eventArgs)) {
                            delegate();
                        }
                        else {
                            delegate(eventArgs);
                        }
                    });
                };
                EventBroker.prototype.dispose = function () {
                    this.listeners = null;
                };
                return EventBroker;
            }());
            Common.EventBroker = EventBroker;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
             * Postponable timer used for change tracking
             */
            var DelayScheduler = /** @class */ (function () {
                /** Initializes a new instance of type ChangeTimer
                * @param eventBroker - the event broker
                */
                function DelayScheduler(eventBroker, propagationStopEventName, propagationStartEventName) {
                    var _this = this;
                    this.timerStopped = true;
                    this.nonEventPropagationMode = false;
                    this.delay = DelayScheduler.defaultSchedulerDelay;
                    this.eventBroker = eventBroker;
                    this.propagationStopEventName = propagationStopEventName;
                    this.propagationStartEventName = propagationStartEventName;
                    if (!Common.Object.isNullOrUndefined(this.propagationStopEventName)) {
                        this.eventBroker.subscribe(this.propagationStopEventName, this.onNonEventPropagationStart = function () { _this.nonEventPropagationMode = true; });
                    }
                    if (!Common.Object.isNullOrUndefined(this.propagationStartEventName)) {
                        this.eventBroker.subscribe(this.propagationStartEventName, this.onNonEventPropagationEnd = function () { _this.nonEventPropagationMode = false; });
                    }
                }
                /** Initializes the Timer
                * @param action - the action to delay for the specified interval
                * @param interval - delay interval
                */
                DelayScheduler.prototype.init = function (action, delay) {
                    if (delay) {
                        this.delay = delay;
                    }
                    this.action = action;
                };
                /** Triggers the timer - start or postpone */
                DelayScheduler.prototype.schedule = function () {
                    var _this = this;
                    if (this.savePropagationModeState)
                        return;
                    if (this.timerId) {
                        clearTimeout(this.timerId);
                    }
                    this.savePropagationModeState = this.nonEventPropagationMode;
                    this.timerStopped = false;
                    this.timerId = setTimeout(function () {
                        _this.stop(_this.savePropagationModeState);
                    }, this.delay);
                };
                /** Stops the timer */
                DelayScheduler.prototype.stop = function (cancel) {
                    if (this.timerStopped) {
                        this.savePropagationModeState = false;
                        return;
                    }
                    clearTimeout(this.timerId);
                    this.timerId = null;
                    // By default we execute the operation, if the flag is provided, we just cancel
                    var executeOperation = Common.Object.isNullOrUndefined(cancel) || cancel === false;
                    if (executeOperation && !this.nonEventPropagationMode) {
                        this.action();
                    }
                    this.timerStopped = true;
                    this.savePropagationModeState = false;
                    this.eventBroker.notify(DelayScheduler.delaySchedulerTimerStopped);
                };
                /** Get the delay */
                DelayScheduler.prototype.getDelay = function () {
                    return this.delay;
                };
                /**
                 * Disposes the scheduler.
                 */
                DelayScheduler.prototype.dispose = function () {
                    if (!Common.Object.isNullOrUndefined(this.propagationStopEventName)) {
                        this.eventBroker.unsubscribe(this.propagationStopEventName, this.onNonEventPropagationStart);
                    }
                    if (!Common.Object.isNullOrUndefined(this.propagationStartEventName)) {
                        this.eventBroker.unsubscribe(this.propagationStartEventName, this.onNonEventPropagationEnd);
                    }
                };
                /* The number of milliseconds to wait before scheduling the operation*/
                DelayScheduler.defaultSchedulerDelay = 1000;
                DelayScheduler.delaySchedulerTimerStopped = "delaySchedulerTimerStopped";
                return DelayScheduler;
            }());
            Common.DelayScheduler = DelayScheduler;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var UrlBuilder = /** @class */ (function () {
                function UrlBuilder(baseUrl) {
                    this.paths = [];
                    this.baseUrl = this.trimCharacter(baseUrl, "/");
                    this.valueParameters = new Common.Dictionary();
                }
                UrlBuilder.getBaseWindowUrl = function () {
                    var protocol = location.protocol;
                    var hostName = location.hostname;
                    var port = location.port ? ':' + location.port : '';
                    return protocol + '//' + hostName + port;
                };
                UrlBuilder.prototype.trimCharacter = function (url, character) {
                    var start = 0;
                    var end = url.length - 1;
                    while (start < url.length && url.charAt(start) === character) {
                        start++;
                    }
                    while (end >= 0 && url.charAt(end) === character) {
                        end--;
                    }
                    if (start <= end) {
                        return url.substring(start, end + 1);
                    }
                    else {
                        return "";
                    }
                };
                UrlBuilder.prototype.setFormatParameter = function (key, value) {
                    this.valueParameters.addOrUpdate(key, value);
                    return this;
                };
                UrlBuilder.prototype.setQueryString = function (queryString) {
                    this.queryString = queryString;
                    return this;
                };
                UrlBuilder.prototype.appendSubPath = function (path) {
                    if (!Common.String.isNullUndefinedOrWhitespace(path)) {
                        path = this.trimCharacter(path, "/");
                        this.paths.push(path);
                    }
                    return this;
                };
                UrlBuilder.prototype.build = function () {
                    var url = this.baseUrl + "/";
                    for (var i = 0; i < this.paths.length; i++) {
                        url += this.paths[i] + "/";
                    }
                    for (var _i = 0, _a = this.valueParameters.getKeys().items(); _i < _a.length; _i++) {
                        var key = _a[_i];
                        url = url.replace(key, this.valueParameters.get(key));
                    }
                    url = this.trimCharacter(url, "/");
                    if (!Common.String.isNullUndefinedOrWhitespace(this.queryString)) {
                        url = url + "?" + this.queryString;
                    }
                    if (!UrlBuilder.isUriEncoded(url)) {
                        url = encodeURI(url);
                    }
                    return url;
                };
                UrlBuilder.isUriEncoded = function (uri) {
                    uri = uri || '';
                    try {
                        return uri !== decodeURI(uri);
                    }
                    catch (e) {
                        return false;
                    }
                };
                return UrlBuilder;
            }());
            Common.UrlBuilder = UrlBuilder;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ServiceClient = /** @class */ (function () {
                function ServiceClient(logger) {
                    this.logger = logger;
                }
                ServiceClient.prototype.createXmlHttpRequest = function () {
                    return new XMLHttpRequest();
                };
                ServiceClient.prototype.createRequest = function (method, url, successCallback, failedCallBack) {
                    var _this = this;
                    var self = this;
                    var logEventName = "MktSvc.Controls.Common.ServiceClient.createRequest";
                    var logData = new Common.Dictionary({ "Url": url, "Method": method });
                    var request = this.createXmlHttpRequest();
                    request.open(method, url, true);
                    this.setDefaultHeader(request);
                    var logToken = this.logger.getPerfToken();
                    request.onreadystatechange = function (event) {
                        var currentRequest = event.target;
                        if (currentRequest.readyState === 4 /* complete */) {
                            logData.addOrUpdate(Common.ParameterKeys.ResponseStatusKey, currentRequest.status);
                            logData.addOrUpdate(Common.ParameterKeys.ReponseLengthKey, currentRequest.responseText.length);
                            _this.logger.logPerf(Common.TraceLevel.Verbose, logEventName, logToken, logData);
                            if (self.isSuccess(currentRequest.status)) {
                                successCallback(currentRequest.responseText);
                            }
                            else {
                                failedCallBack(currentRequest.responseText, currentRequest.status);
                            }
                        }
                    };
                    return request;
                };
                ServiceClient.prototype.setDefaultHeader = function (request) {
                    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    request.setRequestHeader("Accept", "application/json");
                };
                ServiceClient.prototype.postData = function (url, requestData) {
                    var deferred = $.Deferred();
                    var req = this.createRequest("POST", url, function (response) {
                        deferred.resolve(response);
                    }, function (response, status) {
                        deferred.reject(response, status);
                    });
                    req.send(JSON.stringify(requestData));
                    return deferred.promise();
                };
                ServiceClient.prototype.getData = function (url) {
                    var deferred = $.Deferred();
                    var req = this.createRequest("GET", url, function (response) {
                        deferred.resolve(response);
                    }, function (response, status) {
                        deferred.reject(response, status);
                    });
                    req.send();
                    return deferred.promise();
                };
                ServiceClient.prototype.isSuccess = function (status) {
                    return status > 199 && status < 300;
                };
                return ServiceClient;
            }());
            Common.ServiceClient = ServiceClient;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ODataServiceClient = /** @class */ (function (_super) {
                __extends(ODataServiceClient, _super);
                function ODataServiceClient(logger, includeAnnotations) {
                    if (includeAnnotations === void 0) { includeAnnotations = false; }
                    var _this = _super.call(this, logger) || this;
                    _this.includeAnnotations = includeAnnotations;
                    return _this;
                }
                ODataServiceClient.prototype.setDefaultHeader = function (request) {
                    _super.prototype.setDefaultHeader.call(this, request);
                    request.setRequestHeader("OData-MaxVersion", "4.0");
                    request.setRequestHeader("OData-Version", "4.0");
                    if (this.includeAnnotations) {
                        request.setRequestHeader("Prefer", 'odata.include-annotations="*"');
                    }
                };
                return ODataServiceClient;
            }(Common.ServiceClient));
            Common.ODataServiceClient = ODataServiceClient;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
// -----------------------------------------------------------------------
// <copyright file="CommonReferences.ts" company="Microsoft">
//      Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// -----------------------------------------------------------------------
/// <reference path="Logger/ConsoleLogger.ts" />
/// <reference path="Logger/ILogger.ts" />
/// <reference path="Logger/TraceLevel.ts" />
/// <reference path="Localization/AjaxCall.ts" />
/// <reference path="Localization/ILocalizationProvider.ts" />
/// <reference path="Localization/ILabelsProvider.ts" />
/// <reference path="Localization/LabelsProvider.ts" />
/// <reference path="Localization/LocalizationProvider.ts" />
/// <reference path="Localization/ServiceSourceLabelsProvider.ts" />
/// <reference path="Utils/Arrayquery.ts" />
/// <reference path="Utils/Dictionary.ts" />
/// <reference path="Utils/IDictionary.ts" />
/// <reference path="Utils/Object.ts" />
/// <reference path="Utils/String.ts" />
/// <reference path="Utils/UniqueId.ts" />
/// <reference path="Utils/Resources.ts" />
/// <reference path="EventBroker/EventBroker.ts"/>
/// <reference path="DelayScheduler/DelayScheduler.ts"/>
/// <reference path="Service/UrlBuilder.ts" />
/// <reference path="Service/IUrlBuilder.ts" />
/// <reference path="Service/IServiceClient.ts" />
/// <reference path="Service/ServiceClient.ts" />
/// <reference path="Service/ODataServiceClient.ts" />
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var KeyboardCommand = /** @class */ (function () {
                function KeyboardCommand(inputKeyCode, modifiers, onPressCallback) {
                    this.inputKeyCode = inputKeyCode;
                    this.modifiers = modifiers;
                    this.onPressCallback = onPressCallback;
                }
                KeyboardCommand.prototype.dispose = function () {
                    this.onPressCallback = null;
                };
                return KeyboardCommand;
            }());
            Common.KeyboardCommand = KeyboardCommand;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var KeyboardCommandManager = /** @class */ (function () {
                function KeyboardCommandManager() {
                    this.registeredCommands = [];
                }
                KeyboardCommandManager.prototype.init = function (container) {
                    var _this = this;
                    this.controlContainer = container;
                    this.controlContainer.keydown(function (keyboardEvent) {
                        _this.handleKeyDownEvent(keyboardEvent);
                    });
                };
                KeyboardCommandManager.prototype.registerCommand = function (command) {
                    if (Common.Object.isNullOrUndefined(this.controlContainer)) {
                        return;
                    }
                    if (this.registeredCommands.indexOf(command) === -1) {
                        this.registeredCommands.push(command);
                    }
                };
                KeyboardCommandManager.prototype.unregisterCommand = function (command) {
                    var index = this.registeredCommands.indexOf(command);
                    if (index !== -1) {
                        this.registeredCommands.splice(index, 1);
                    }
                };
                KeyboardCommandManager.prototype.registerCommandsInIframe = function (iframe) {
                    var _this = this;
                    $(iframe.contentWindow.document).keydown(function (event) {
                        _this.handleKeyDownEvent(event);
                    });
                };
                KeyboardCommandManager.prototype.unregisterCommandsInIframe = function (iframe) {
                    if (Common.Object.isNullOrUndefined(iframe) || Common.Object.isNullOrUndefined(iframe.contentDocument)) {
                        return;
                    }
                    // Unregister the keydown handler
                    $(iframe.contentDocument).off("keydown");
                    iframe.contentDocument.onkeydown = null;
                };
                KeyboardCommandManager.prototype.dispose = function () {
                    this.controlContainer.off("keydown");
                    this.controlContainer = null;
                    this.registeredCommands.forEach(function (command, index) { command.dispose(); });
                    this.registeredCommands = null;
                };
                KeyboardCommandManager.prototype.handleKeyDownEvent = function (event) {
                    var _this = this;
                    if (Common.Object.isNullOrUndefined(event)) {
                        return null;
                    }
                    this.registeredCommands.forEach(function (command) {
                        if (_this.isCommandTriggered(event, command)) {
                            event.preventDefault();
                            command.onPressCallback();
                        }
                    });
                };
                KeyboardCommandManager.prototype.isCommandTriggered = function (event, command) {
                    var keyCode = event.which || event.keyCode;
                    // Handle numpad keycodes
                    if (keyCode >= Common.KeyboardKeyCodes.numpadZeroKey && keyCode <= Common.KeyboardKeyCodes.numpadNineKey) {
                        keyCode = keyCode - (Common.KeyboardKeyCodes.numpadZeroKey - Common.KeyboardKeyCodes.zeroKey);
                    }
                    var altKeyPressed = event.altKey;
                    var controlKeyPressed = event.ctrlKey;
                    var shiftKeyPressed = event.shiftKey;
                    var altKeyRequired = (command.modifiers.indexOf(Common.KeyboardModifierType.Alt) !== -1);
                    var shiftKeyRequired = (command.modifiers.indexOf(Common.KeyboardModifierType.Shift) !== -1);
                    var controlKeyRequired = (command.modifiers.indexOf(Common.KeyboardModifierType.Control) !== -1);
                    if (keyCode !== command.inputKeyCode || (altKeyRequired && !altKeyPressed) || (shiftKeyRequired && !shiftKeyPressed) || (controlKeyRequired && !controlKeyPressed)
                        || (!altKeyRequired && altKeyPressed) || (!shiftKeyRequired && shiftKeyPressed) || (!controlKeyRequired && controlKeyPressed)) {
                        return false;
                    }
                    return true;
                };
                return KeyboardCommandManager;
            }());
            Common.KeyboardCommandManager = KeyboardCommandManager;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var KeyboardKeyCodes = /** @class */ (function () {
                function KeyboardKeyCodes() {
                }
                KeyboardKeyCodes.escapeKeyCode = 27;
                KeyboardKeyCodes.aKey = 65;
                KeyboardKeyCodes.bKey = 66;
                KeyboardKeyCodes.cKey = 67;
                KeyboardKeyCodes.dKey = 68;
                KeyboardKeyCodes.fKey = 70;
                KeyboardKeyCodes.gKey = 71;
                KeyboardKeyCodes.hKey = 72;
                KeyboardKeyCodes.iKey = 73;
                KeyboardKeyCodes.mKey = 77;
                KeyboardKeyCodes.nKey = 78;
                KeyboardKeyCodes.pKey = 80;
                KeyboardKeyCodes.sKey = 83;
                KeyboardKeyCodes.vKey = 86;
                KeyboardKeyCodes.xKey = 88;
                KeyboardKeyCodes.zKey = 90;
                KeyboardKeyCodes.backspaceKey = 8;
                KeyboardKeyCodes.homeKey = 36;
                KeyboardKeyCodes.deleteKey = 46;
                KeyboardKeyCodes.plusKey = 107;
                KeyboardKeyCodes.minusKey = 189;
                KeyboardKeyCodes.equalKey = 187;
                KeyboardKeyCodes.backslashKey = 220;
                KeyboardKeyCodes.zeroKey = 48;
                KeyboardKeyCodes.oneKey = 49;
                KeyboardKeyCodes.twoKey = 50;
                KeyboardKeyCodes.threeKey = 51;
                KeyboardKeyCodes.fourKey = 52;
                KeyboardKeyCodes.fiveKey = 53;
                KeyboardKeyCodes.sixKey = 54;
                KeyboardKeyCodes.numpadZeroKey = 96;
                KeyboardKeyCodes.numpadNineKey = 105;
                KeyboardKeyCodes.f11Key = 122;
                return KeyboardKeyCodes;
            }());
            Common.KeyboardKeyCodes = KeyboardKeyCodes;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var KeyboardModifierType;
            (function (KeyboardModifierType) {
                KeyboardModifierType[KeyboardModifierType["Shift"] = 0] = "Shift";
                KeyboardModifierType[KeyboardModifierType["Control"] = 1] = "Control";
                KeyboardModifierType[KeyboardModifierType["Alt"] = 2] = "Alt";
            })(KeyboardModifierType = Common.KeyboardModifierType || (Common.KeyboardModifierType = {}));
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var KeyCodes;
            (function (KeyCodes) {
                KeyCodes[KeyCodes["Tab"] = 9] = "Tab";
                KeyCodes[KeyCodes["Enter"] = 13] = "Enter";
                KeyCodes[KeyCodes["Esc"] = 27] = "Esc";
                KeyCodes[KeyCodes["Space"] = 32] = "Space";
                KeyCodes[KeyCodes["Left"] = 37] = "Left";
                KeyCodes[KeyCodes["Up"] = 38] = "Up";
                KeyCodes[KeyCodes["Right"] = 39] = "Right";
                KeyCodes[KeyCodes["Down"] = 40] = "Down";
                KeyCodes[KeyCodes["q"] = 81] = "q";
                KeyCodes[KeyCodes["t"] = 84] = "t";
                KeyCodes[KeyCodes["y"] = 89] = "y";
                KeyCodes[KeyCodes["z"] = 90] = "z";
                KeyCodes[KeyCodes["F10"] = 121] = "F10";
            })(KeyCodes = Common.KeyCodes || (Common.KeyCodes = {}));
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var CommonConstants = /** @class */ (function () {
                function CommonConstants() {
                }
                //loading modal
                CommonConstants.modalCssClass = "loadingModal";
                CommonConstants.containerLoadingCssClass = "containerLoading";
                return CommonConstants;
            }());
            Common.CommonConstants = CommonConstants;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
             * Creates a Loading Indicator in a container
             */
            var LoadingIndicator = /** @class */ (function () {
                function LoadingIndicator() {
                    this.mainContainerCssClass = "LoadingIndicator-container";
                    this.loadingIndicatorCssClass = "LoadingIndicator";
                }
                /**
                * Appends the Loading Indicator to the container
                 * @param parentContainer The container where the modal is appended
                 * @param bindElement Bind element to DOM method
                 * @param createElement Create UCI Primitive element method
                 * @param indicatorContainerClassName Indicator container CSS class name
                 * @param containerHeight The height of the container
                 * @param indicatorHeight The height of the loading indicator
                 */
                LoadingIndicator.prototype.init = function (parentContainer, bindElement, createElement, indicatorContainerClassName, containerHeight, indicatorHeight) {
                    if (containerHeight === void 0) { containerHeight = "8em"; }
                    if (indicatorHeight === void 0) { indicatorHeight = "4em"; }
                    this.parentContainer = parentContainer;
                    this.bindElement = bindElement;
                    this.createElement = createElement;
                    this.createLoadingContainer(indicatorContainerClassName, containerHeight, indicatorHeight);
                    this.isVisible = false;
                };
                /**
                 * Renders the modal on the current container
                 */
                LoadingIndicator.prototype.show = function () {
                    if (!this.isVisible && !Common.Object.isNullOrUndefined(this.parentContainer)) {
                        this.parentContainer.append(this.loadingContainer);
                        this.isVisible = true;
                    }
                };
                /**
                 * Stops rendering the modal on the current container
                 */
                LoadingIndicator.prototype.hide = function () {
                    if (this.isVisible && !Common.Object.isNullOrUndefined(this.loadingContainer)) {
                        this.loadingContainer.detach();
                        this.isVisible = false;
                    }
                };
                /**
                 * Disposes the modal
                 */
                LoadingIndicator.prototype.dispose = function () {
                    if (!Common.Object.isNullOrUndefined(this.loadingContainer)) {
                        this.loadingContainer.remove();
                    }
                };
                LoadingIndicator.prototype.createLoadingContainer = function (containerClassName, containerHeight, indicatorHeight) {
                    this.loadingContainer = $("<div />").addClass(containerClassName);
                    var progressIndicatorElement = this.createElement("CONTAINER", {
                        key: this.mainContainerCssClass,
                        id: Common.UniqueId.generate(this.mainContainerCssClass),
                        style: {
                            "width": "100%",
                            "display": "block",
                            "overflow": "hidden",
                            "height": containerHeight,
                            "position": "relative",
                            "background-color": "transparent"
                        }
                    }, this.createElement("PROGRESSINDICATOR", {
                        key: this.loadingIndicatorCssClass,
                        id: Common.UniqueId.generate(this.loadingIndicatorCssClass),
                        style: {
                            "width": indicatorHeight,
                            "height": indicatorHeight,
                            "display": "table",
                            "margin": "0 auto"
                        },
                        progressType: "ring",
                        active: true
                    }, []));
                    this.bindElement(progressIndicatorElement, this.loadingContainer[0]);
                };
                return LoadingIndicator;
            }());
            Common.LoadingIndicator = LoadingIndicator;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
             * Allows a container to have a Loading Screen
             */
            var LoadingModal = /** @class */ (function () {
                function LoadingModal(backgroundColorHex) {
                    this.colorHex = Common.String.isNullOrEmpty(backgroundColorHex) ? "#EFEFEF" : backgroundColorHex;
                    this.id = Common.UniqueId.generate(Common.CommonConstants.modalCssClass);
                    this.setBackgroundColor(this.colorHex, 0.8);
                }
                /**
                 * Gets the Loading icon used in the modal
                 */
                LoadingModal.prototype.getLoadingIcon = function () {
                    return "data:image/gif;base64,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";
                };
                /**
                 * Renders the modal on the current container
                 */
                LoadingModal.prototype.show = function () {
                    if (!Common.Object.isNullOrUndefined(this.container)) {
                        this.element.show();
                        this.container.addClass(Common.CommonConstants.containerLoadingCssClass);
                    }
                };
                /**
                 * Stops rendering the modal on the current container
                 */
                LoadingModal.prototype.hide = function () {
                    if (!Common.Object.isNullOrUndefined(this.container)) {
                        this.element.hide();
                        this.container.removeClass(Common.CommonConstants.containerLoadingCssClass);
                        this.eventBroker.notify(Common.EventConstants.loadingCompleted);
                    }
                };
                /*
                 * Returns true if container has class the containerLoadingCssClass
                 */
                LoadingModal.prototype.isVisible = function () {
                    return this.container.hasClass(Common.CommonConstants.containerLoadingCssClass);
                };
                /**
                 * Sets the RGBA for the modal background
                 * @param colorHex The color of the modal background
                 * @param alphaLevel The alpha level - value from 0-1
                 */
                LoadingModal.prototype.setBackgroundColor = function (colorHex, alphaLevel) {
                    this.colorHex = colorHex;
                    this.alphaLevel = this.getValidAlphaLevel(alphaLevel);
                };
                /**
                * Appends the modal to the container
                 * @param container The container where the modal is appended
                 * @param eventBroker The eventBroker.
                 */
                LoadingModal.prototype.init = function (container, eventBroker) {
                    this.container = container;
                    this.addLoadingModal();
                    this.eventBroker = eventBroker;
                };
                LoadingModal.prototype.addLoadingModal = function () {
                    if (!Common.Object.isNullOrUndefined(this.container)) {
                        this.container.css("position", "relative");
                        this.element = this.getHtmlElement();
                        this.element.hide();
                        this.container.append(this.element);
                    }
                };
                /**
                 * Disposes the modal
                 */
                LoadingModal.prototype.dispose = function () {
                    if (!Common.Object.isNullOrUndefined(this.container)) {
                        this.container.find("#" + this.id).remove();
                    }
                };
                LoadingModal.prototype.getHtmlElement = function () {
                    var loadingModal = $("<div>");
                    loadingModal.attr("id", this.id);
                    loadingModal.addClass(Common.CommonConstants.modalCssClass);
                    loadingModal.css("background", this.getCssBackgroundValue());
                    loadingModal.css("opacity", this.alphaLevel);
                    return loadingModal;
                };
                LoadingModal.prototype.getCssBackgroundValue = function () {
                    return Common.String.Format(LoadingModal.cssBackgroundValueFormat, this.colorHex, this.getLoadingIcon());
                };
                LoadingModal.prototype.getValidAlphaLevel = function (colorLevel) {
                    var validColorLevel = colorLevel;
                    if (colorLevel < 0) {
                        validColorLevel = 0;
                    }
                    else if (colorLevel > 1) {
                        validColorLevel = 1;
                    }
                    return validColorLevel;
                };
                LoadingModal.cssBackgroundValueFormat = "{0} url('{1}') 50% 50% no-repeat";
                return LoadingModal;
            }());
            Common.LoadingModal = LoadingModal;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ControlNameConstants;
            (function (ControlNameConstants) {
                ControlNameConstants.emailEditor = "EmailEditor";
                ControlNameConstants.pageEditor = "PageEditor";
                ControlNameConstants.formEditor = "FormEditor";
                ControlNameConstants.customerJourneyDesigner = "CustomerJourneyDesigner";
                ControlNameConstants.customerJourneyDesignerPropertyPages = "CustomerJourneyDesigner.PropertyPages";
                ControlNameConstants.marketingWorkflowDesigner = "MarketingWorkflowDesigner";
                ControlNameConstants.propertyPageCommon = "PropertyPageCommon";
            })(ControlNameConstants = Common.ControlNameConstants || (Common.ControlNameConstants = {}));
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var EventConstants = /** @class */ (function () {
                function EventConstants() {
                }
                EventConstants.loadingCompleted = "LoadingCompleted";
                return EventConstants;
            }());
            Common.EventConstants = EventConstants;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var LabelsProviderFactory = /** @class */ (function () {
                function LabelsProviderFactory() {
                    this.labelsProviderTable = {};
                }
                LabelsProviderFactory.getInstance = function () {
                    if (!LabelsProviderFactory.instance) {
                        LabelsProviderFactory.instance = new LabelsProviderFactory();
                    }
                    return LabelsProviderFactory.instance;
                };
                LabelsProviderFactory.prototype.getLabelsProvider = function (languageCode, ajaxCall, logger, controlCdnPath) {
                    var labelProvider = this.labelsProviderTable[languageCode];
                    if (!labelProvider) {
                        this.labelsProviderTable[languageCode] = new Common.LabelsProvider(languageCode, ajaxCall, logger, controlCdnPath);
                    }
                    return this.labelsProviderTable[languageCode];
                };
                return LabelsProviderFactory;
            }());
            Common.LabelsProviderFactory = LabelsProviderFactory;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /*
            Gets the localized string
            */
            var ChainedLocalizationProvider = /** @class */ (function (_super) {
                __extends(ChainedLocalizationProvider, _super);
                function ChainedLocalizationProvider(labelPromisesArray, localeId, isRtl, logger) {
                    if (isRtl === void 0) { isRtl = false; }
                    var _this = _super.call(this, {}, localeId, isRtl, logger) || this;
                    _this.labelPromisesArray = labelPromisesArray;
                    _this.labelsArray = [];
                    var _loop_1 = function (i) {
                        this_1.labelsArray.push({});
                        var labelPromise = this_1.labelPromisesArray[i];
                        labelPromise
                            .done(function (dictionary) {
                            _this.labelsArray[i] = dictionary;
                        });
                    };
                    var this_1 = this;
                    for (var i = 0; i < _this.labelPromisesArray.length; ++i) {
                        _loop_1(i);
                    }
                    return _this;
                }
                ChainedLocalizationProvider.prototype.registerLabels = function (localizations) {
                    this.labelsArray.push(localizations);
                };
                /*
                 * Returns a promise which, when resolved, indicates all labels have been loaded.
                 */
                ChainedLocalizationProvider.prototype.fullyInitialized = function () {
                    var deferred = $.Deferred();
                    // Always resolve not to block functionality.
                    $.when.apply($, this.labelPromisesArray)
                        .always(function () { return deferred.resolve(); });
                    return deferred;
                };
                /*
                * Gets the localized string.
                */
                ChainedLocalizationProvider.prototype.getLocalizedString = function (key, formatItems) {
                    var localizedString = key;
                    for (var i = this.labelsArray.length - 1; i >= 0; i--) {
                        var labels = this.labelsArray[i];
                        if (key in labels) {
                            localizedString = labels[key];
                            if (formatItems) {
                                localizedString = this.stringFormatItems(localizedString, formatItems);
                            }
                            return localizedString;
                        }
                    }
                    if (this.logger) {
                        var logEventName = "MktSvc.Controls.Common.ChainedLocalizationProvider.getLocalizedString";
                        var logData = new Common.Dictionary({ Key: key, LocaleId: this.localeId });
                        this.logger.log(Common.TraceLevel.Warning, logEventName, logData);
                    }
                    return localizedString;
                };
                return ChainedLocalizationProvider;
            }(Common.LocalizationProvider));
            Common.ChainedLocalizationProvider = ChainedLocalizationProvider;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ServiceSourceLabelsProviderFactory = /** @class */ (function () {
                function ServiceSourceLabelsProviderFactory(logger, clientBaseUrl) {
                    this.logger = logger;
                    this.clientBaseUrl = clientBaseUrl;
                }
                ServiceSourceLabelsProviderFactory.prototype.createServiceSourceLabelsProvider = function (componentName, languageCode) {
                    var urlBuilder = new MktSvc.Controls.Common.UrlBuilder(this.clientBaseUrl);
                    urlBuilder.appendSubPath(Common.UrlConstants.marketingServiceCall);
                    var serviceClient = new MktSvc.Controls.Common.ODataServiceClient(this.logger);
                    return new Common.ServiceSourceLabelsProvider(urlBuilder, serviceClient, componentName, languageCode, this.logger);
                };
                return ServiceSourceLabelsProviderFactory;
            }());
            Common.ServiceSourceLabelsProviderFactory = ServiceSourceLabelsProviderFactory;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var LoggerAsserter = /** @class */ (function () {
                function LoggerAsserter(logger, assertEventName, logFixedParameters) {
                    this.logger = logger;
                    this.assertEventName = assertEventName;
                    this.logFixedParameters = logFixedParameters;
                }
                LoggerAsserter.prototype.assert = function (assertKey, expected, actual, logParameters) {
                    if (expected !== actual) {
                        var logParametersCopy = this.logFixedParameters.clone();
                        logParametersCopy.addOrUpdate(LoggerAsserter.AssertMethod, "assert");
                        logParametersCopy.addOrUpdate(LoggerAsserter.AssertKey, assertKey);
                        logParametersCopy.addOrUpdate(LoggerAsserter.Expected, expected);
                        logParametersCopy.addOrUpdate(LoggerAsserter.Actual, actual);
                        if (logParameters) {
                            logParametersCopy = logParametersCopy.concat(logParameters);
                        }
                        this.logger.log(MktSvc.Controls.Common.TraceLevel.Error, this.assertEventName, logParametersCopy);
                        return false;
                    }
                    return true;
                };
                LoggerAsserter.prototype.assertValueDefined = function (assertKey, actual, logParameters) {
                    if (actual === null ||
                        actual === undefined) {
                        var logParametersCopy = this.logFixedParameters.clone();
                        logParametersCopy.addOrUpdate(LoggerAsserter.AssertMethod, "assertDefined");
                        logParametersCopy.addOrUpdate(LoggerAsserter.AssertKey, assertKey);
                        logParametersCopy.addOrUpdate(LoggerAsserter.Actual, actual);
                        if (logParameters) {
                            logParametersCopy = logParametersCopy.concat(logParameters);
                        }
                        this.logger.log(MktSvc.Controls.Common.TraceLevel.Error, this.assertEventName, logParametersCopy);
                        return false;
                    }
                    return true;
                };
                LoggerAsserter.AssertMethod = "AssertMethod";
                LoggerAsserter.AssertKey = "AssertKey";
                LoggerAsserter.Expected = "Expected";
                LoggerAsserter.Actual = "Actual";
                return LoggerAsserter;
            }());
            Common.LoggerAsserter = LoggerAsserter;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var ParameterKeys = /** @class */ (function () {
                function ParameterKeys() {
                }
                ParameterKeys.ReponseLengthKey = "ResponseLength";
                ParameterKeys.ResponseStatusKey = "ResponseStatus";
                ParameterKeys.LoggerError = "LoggerError";
                ParameterKeys.Message = "Message";
                ParameterKeys.ErrorCode = "ErrorCode";
                ParameterKeys.ErrorMessage = "ErrorMessage";
                ParameterKeys.ErrorDetails = "ErrorDetails";
                return ParameterKeys;
            }());
            Common.ParameterKeys = ParameterKeys;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var EntityDefinitionsUrlBuilder = /** @class */ (function (_super) {
                __extends(EntityDefinitionsUrlBuilder, _super);
                function EntityDefinitionsUrlBuilder(baseUrl) {
                    var _this = _super.call(this, baseUrl) || this;
                    _this.logicalNameKey = "{logicalName}";
                    _this.appendSubPath("api/data/v9.0/EntityDefinitions" + _this.logicalNameKey);
                    _this.setEntityLogicalName(Common.String.Empty);
                    return _this;
                }
                EntityDefinitionsUrlBuilder.prototype.setEntityLogicalName = function (entityLogicalName) {
                    var value = Common.String.isNullUndefinedOrWhitespace(entityLogicalName) ? Common.String.Empty : "(LogicalName='" + entityLogicalName + "')";
                    this.setFormatParameter(this.logicalNameKey, value);
                };
                return EntityDefinitionsUrlBuilder;
            }(Common.UrlBuilder));
            Common.EntityDefinitionsUrlBuilder = EntityDefinitionsUrlBuilder;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var EntityRecordUrlBuilder = /** @class */ (function (_super) {
                __extends(EntityRecordUrlBuilder, _super);
                function EntityRecordUrlBuilder(baseUrl, entitySetName) {
                    var _this = _super.call(this, baseUrl) || this;
                    _this.recordIdKey = "{recordIdKey}";
                    _this.appendSubPath("api/data/v9.0/" + entitySetName + _this.recordIdKey);
                    _this.setRecordId(Common.String.Empty);
                    return _this;
                }
                EntityRecordUrlBuilder.prototype.setRecordId = function (recordId) {
                    var value = Common.String.isNullUndefinedOrWhitespace(recordId) ? Common.String.Empty : "(" + recordId + ")";
                    this.setFormatParameter(this.recordIdKey, value);
                };
                EntityRecordUrlBuilder.prototype.setSelectedFields = function (fields) {
                    if (!fields || fields.length === 0) {
                        this.setQueryString(Common.String.Empty);
                    }
                    else {
                        var queryString = "$select=" + fields[0];
                        for (var i = 1; i < fields.length; i++) {
                            queryString += "," + fields[i];
                        }
                        this.setQueryString(queryString);
                    }
                };
                return EntityRecordUrlBuilder;
            }(Common.UrlBuilder));
            Common.EntityRecordUrlBuilder = EntityRecordUrlBuilder;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var UrlBuilderFactory = /** @class */ (function () {
                function UrlBuilderFactory(baseUrl) {
                    this.baseUrl = baseUrl;
                }
                UrlBuilderFactory.prototype.createEntityRecordUrlBuilder = function (entitySetName) {
                    return new Common.EntityRecordUrlBuilder(this.baseUrl, entitySetName);
                };
                return UrlBuilderFactory;
            }());
            Common.UrlBuilderFactory = UrlBuilderFactory;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var IMarketingServiceRequest = /** @class */ (function () {
                function IMarketingServiceRequest() {
                }
                return IMarketingServiceRequest;
            }());
            Common.IMarketingServiceRequest = IMarketingServiceRequest;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            var UrlConstants = /** @class */ (function () {
                function UrlConstants() {
                }
                UrlConstants.marketingServiceCall = "api/data/v8.0/msdyncrm_MarketingServiceCall";
                return UrlConstants;
            }());
            Common.UrlConstants = UrlConstants;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * Guid helper methods. Return in XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXX
            */
            var Guid = /** @class */ (function () {
                function Guid(guid) {
                    if (typeof guid === "string") {
                        this.guid = guid.replace(/[{()}]/g, "");
                        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(this.guid)) {
                            this.guid = Guid.GetNullGuid();
                        }
                    }
                    else {
                        this.guid = Guid.GetNullGuid();
                    }
                }
                Guid.prototype.ToStringParentheses = function () {
                    return "(" + this.guid + ")";
                };
                Guid.prototype.ToStringBraces = function () {
                    return "{" + this.guid + "}";
                };
                Guid.prototype.ToString = function () {
                    return this.guid;
                };
                Guid.GetNullGuid = function () {
                    return "00000000-0000-0000-0000-000000000000";
                };
                return Guid;
            }());
            Common.Guid = Guid;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
            * FIFO Queue implementation.
            */
            var Queue = /** @class */ (function (_super) {
                __extends(Queue, _super);
                function Queue() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                /**
                * Push a new element.
                */
                Queue.prototype.push = function (element) {
                    this.addAt(element, 0);
                };
                /**
                * Get the next one.
                */
                Queue.prototype.pop = function () {
                    return this.data.pop();
                };
                return Queue;
            }(Common.ArrayQuery));
            Common.Queue = Queue;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvc;
(function (MktSvc) {
    var Controls;
    (function (Controls) {
        var Common;
        (function (Common) {
            'use strict';
            /**
             * Control guid generator helper methods.
             */
            var ControlGuidGenerator = /** @class */ (function () {
                function ControlGuidGenerator() {
                }
                ControlGuidGenerator.newGuid = function (controlName) {
                    return controlName + 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };
                return ControlGuidGenerator;
            }());
            Common.ControlGuidGenerator = ControlGuidGenerator;
        })(Common = Controls.Common || (Controls.Common = {}));
    })(Controls = MktSvc.Controls || (MktSvc.Controls = {}));
})(MktSvc || (MktSvc = {}));
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    MktSvcCommon.VERSION = "1.25.86";
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ErrorHandling;
    (function (ErrorHandling) {
        "use strict";
        /**
         * List of error codes used in custom controls.
         */
        var ErrorCode = /** @class */ (function () {
            function ErrorCode() {
            }
            // Value out of range id from the MobileClientResources.xml file
            ErrorCode.ValueOutOfRangeId = "CustomControl_OutOfRange_Error";
            // Value invalid input mask id from the MobileClientResources.xml file
            ErrorCode.InvalidInputMaskId = "CustomControl_InvalidInput_Error";
            // Maximum length exceeded id from the MobileClientResources.xml file
            ErrorCode.MaxLengthExceededId = "CustomControl_MaxLengthExceeded_Error";
            return ErrorCode;
        }());
        ErrorHandling.ErrorCode = ErrorCode;
    })(ErrorHandling = MktSvcCommon.ErrorHandling || (MktSvcCommon.ErrorHandling = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ErrorHandling;
    (function (ErrorHandling) {
        "use strict";
        /**
         * Handles the notification of custom control errors to the user
         * @remark the notifications come from XRM and are documented here:
         * https://msdn.microsoft.com/en-us/library/gg334266(v=crm.6).aspx#BKMK_notification
         */
        var NotificationHandler = /** @class */ (function () {
            /**
             * Builds the notification handler
             * @param setNotification: delegate for setting the notification
             * @param clearNotification: delegate for clearing the notification
             */
            function NotificationHandler(setNotification, clearNotification) {
                this.setNotification = setNotification;
                this.clearNotification = clearNotification;
                this.setNotification = setNotification;
                this.clearNotification = clearNotification;
            }
            /**
             * Displays the notification
             * @param notification message
             * @param notification id
            */
            NotificationHandler.prototype.notify = function (message, id) {
                this.setNotification(message, id);
            };
            /**
             * Clears the notification
             * @param notification id
             */
            NotificationHandler.prototype.clear = function (id) {
                this.clearNotification(id);
            };
            return NotificationHandler;
        }());
        ErrorHandling.NotificationHandler = NotificationHandler;
    })(ErrorHandling = MktSvcCommon.ErrorHandling || (MktSvcCommon.ErrorHandling = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ErrorHandling;
    (function (ErrorHandling) {
        "use strict";
        /**
         * Handles code exceptions
         */
        var ExceptionHandler = /** @class */ (function () {
            function ExceptionHandler() {
            }
            /**
             * Displays the exception message
             * @param error message
             */
            ExceptionHandler.throwException = function (message) {
                throw (message);
            };
            return ExceptionHandler;
        }());
        ErrorHandling.ExceptionHandler = ExceptionHandler;
    })(ErrorHandling = MktSvcCommon.ErrorHandling || (MktSvcCommon.ErrorHandling = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var Mscrm;
(function (Mscrm) {
    "use strict";
    var UpdateEventType;
    (function (UpdateEventType) {
        UpdateEventType[UpdateEventType["DataSet"] = 0] = "DataSet";
        UpdateEventType[UpdateEventType["Layout"] = 1] = "Layout";
        UpdateEventType[UpdateEventType["Activation"] = 2] = "Activation";
    })(UpdateEventType = Mscrm.UpdateEventType || (Mscrm.UpdateEventType = {}));
    /**
     * Allows a control to guard itself against (multiple) different update events coming from the infra.
     * The default configuration is:
     *   - DataSet: Not ignored
     *   - Layout: Not ignored
     *   - Activation: Ignored
     */
    var UpdateEvents = /** @class */ (function () {
        function UpdateEvents() {
            this.ignoredEvents = {};
            this.ignoredEvents[Mscrm.UpdateEventType.DataSet] = false;
            this.ignoredEvents[Mscrm.UpdateEventType.Layout] = false;
            this.ignoredEvents[Mscrm.UpdateEventType.Activation] = true;
        }
        /**
         * Returns the Mscrm.UpdateEventType enum that is mapped to a given event type code
         * generated by the infra. Returns null if not the code is not found.
         */
        UpdateEvents.getEventType = function (event) {
            switch (event) {
                case "dataset":
                    return Mscrm.UpdateEventType.DataSet;
                case "layout":
                    return Mscrm.UpdateEventType.Layout;
                case "activation":
                    return Mscrm.UpdateEventType.Activation;
                default:
                    return null;
            }
        };
        /**
         * Returns the Mscrm.UpdateEventType enum that is mapped to a given event type code
         * generated by the infra. Returns null if not the code is not found.
         */
        UpdateEvents.getEventCode = function (event) {
            switch (event) {
                case Mscrm.UpdateEventType.DataSet:
                    return "dataset";
                case Mscrm.UpdateEventType.Layout:
                    return "layout";
                case Mscrm.UpdateEventType.Activation:
                    return "activation";
                default:
                    return null;
            }
        };
        /**
         * The event provided in the parameters will be marked as ignorable if and only if
         * shouldIgnore is set to true.
         *
         * @param event {Mscrm.UpdateEventType}: The event to be configured
         * @param shouldIgnore {boolean}: true if the event can be ignored; false otherwise.
         */
        UpdateEvents.prototype.shouldIgnoreEvent = function (event, shouldIgnore) {
            if (!MktSvc.Controls.Common.Object.isNullOrUndefined(event)) {
                this.ignoredEvents[event] = shouldIgnore;
            }
        };
        /**
         * Returns true if and only if the event provided may be ignored.
         *
         * @param event {Mscrm.UpdateEventType}: The event to be checked.
         */
        UpdateEvents.prototype.isIgnoredEvent = function (event) {
            if (!MktSvc.Controls.Common.Object.isNullOrUndefined(event)) {
                return this.ignoredEvents[event];
            }
            return false;
        };
        /**
         * Returns true if and only if the updatedProperties array contains the event provided.
         *
         * @param updatedProperties {string[]}: The updated properties array provided by the infra.
         * @param event {Mscrm.UpdateEventType}: The event to be located in the updatedProperties array.
         */
        UpdateEvents.hasEvent = function (updatedProperties, event) {
            var eventCode = UpdateEvents.getEventCode(event);
            return new MktSvc.Controls.Common.ArrayQuery(updatedProperties).contains(function (item) {
                return item == eventCode;
            });
        };
        return UpdateEvents;
    }());
    Mscrm.UpdateEvents = UpdateEvents;
})(Mscrm || (Mscrm = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var AttributeConstants = /** @class */ (function () {
        function AttributeConstants() {
        }
        /** input node checked attribute */
        AttributeConstants.Checked = "checked";
        /** input node readonly attribute**/
        AttributeConstants.ReadOnly = "readonly";
        /** control disabled attribute */
        AttributeConstants.Disabled = "disabled";
        /** control style attribute */
        AttributeConstants.Style = "style";
        /** control framework layout update attribute */
        AttributeConstants.Layout = "layout";
        return AttributeConstants;
    }());
    MktSvcCommon.AttributeConstants = AttributeConstants;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        var AssistEditEventConstants = /** @class */ (function () {
            function AssistEditEventConstants() {
            }
            AssistEditEventConstants.assistEditFinalItemSelected = "assistEditFinalItemSelected";
            AssistEditEventConstants.assistEditItemSelected = "assistEditItemSelected";
            AssistEditEventConstants.assistEditClosed = "assistEditClosed";
            AssistEditEventConstants.assistEditCommandExecuted = "assistEditCommandExecuted";
            AssistEditEventConstants.assistEditEnterKeyDown = "assistEditEnterKeyDown";
            AssistEditEventConstants.assistEditListboxFocusout = "assistEditListboxFocusout";
            AssistEditEventConstants.assistEditOptionFocused = "assistEditOptionFocused";
            AssistEditEventConstants.assistEditDataSourceUpdated = "assistEditDataSourceUpdated";
            return AssistEditEventConstants;
        }());
        AssistEdit.AssistEditEventConstants = AssistEditEventConstants;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        /**
         * Class responsible for rendering and managing the assist edit input span
         */
        var AssistEditInputSpanRenderer = /** @class */ (function () {
            function AssistEditInputSpanRenderer(selectionManager) {
                this.styleElementId = "span-renderer-assist-edit-style";
                this.assistEditStyle = "/*Assist edit input style*/ assistEditSelectedTextContainer, .assistEditInputWrapper, .assistEditInput { height: 1.1em; display: inline-block; position: static; text-indent: 0; } .assistEditInput { background-color: #bec9dd; } .assistEditActivePlaceholder { min-width:10px; background-color: #bec9dd; } .assistEditSelectedTextContainer { background-color: #edf0f7; } .assistEditInput { min-width: 1px; } .assistEditInput:focus { outline: 0; } .assistEditContainer #closeButtonContainer { display: none; }";
                this.selectionManager = selectionManager;
            }
            AssistEditInputSpanRenderer.prototype.setup = function (eventBroker, focusOutHandler) {
                this.eventBroker = eventBroker;
                this.focusOutHandler = focusOutHandler;
            };
            /**
            * Renders the input span on the selected block
            * @param selectedBlock The focused block
            */
            AssistEditInputSpanRenderer.prototype.render = function (selectedBlock) {
                // Get the current document from the selected block and the selection
                this.currentDocument = selectedBlock[0].ownerDocument;
                this.selectionManager.setup(this.currentDocument);
                if (!this.selectionManager.isCaretInsideBlock(selectedBlock[0])) {
                    var element = this.findEditableElement(selectedBlock);
                    this.selectionManager.setCaretAtEndOfElement(element);
                }
                var selection = this.currentDocument.getSelection();
                this.selectionRange = selection.getRangeAt(0);
                var selectedText = this.selectionRange.toString();
                var assitEditInput = this.attachAssistEditInputSpan(selectedText);
                // Add assist edit style
                this.styleElement = $("<style>")
                    .attr("id", this.styleElementId)
                    .attr("rel", "stylesheet")
                    .attr("type", "text/css")
                    .text(this.assistEditStyle);
                this.currentDocument.head.appendChild(this.styleElement[0]);
                assitEditInput.on('focusout', this.focusOutHandler);
                return assitEditInput;
            };
            /**
            * Appends the final selected item of the assist edit to the text block
            * @param eventArgs Arguments containing the final item selected from the assist edit
            */
            AssistEditInputSpanRenderer.prototype.insertFinalSelectedItem = function (eventArgs) {
                this.replaceInputSpanWithText(eventArgs.value);
            };
            /**
            * Appends the selected item of the assist edit to the text block
            * @param eventArgs Arguments containing the item selected from the assist edit
            */
            AssistEditInputSpanRenderer.prototype.updateSelectedValue = function (value) {
                var assistEditSpanInput = this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditInputSpanClassName);
                assistEditSpanInput.off('focusout', this.focusOutHandler);
                if (assistEditSpanInput.length > 0) {
                    assistEditSpanInput.removeAttr('aria-activedescendant');
                    value = MktSvcCommon.HtmlEncode.encode(value);
                    value = this.setActivePlaceholder(value);
                    var selectedTextContainer = this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditSelectedTextContainer);
                    assistEditSpanInput.appendTo(selectedTextContainer.parent());
                    selectedTextContainer.empty();
                    selectedTextContainer.append($('<span></span>').html(value));
                    assistEditSpanInput.appendTo(selectedTextContainer.find("." + AssistEdit.AssistEditConstants.assistEditActivePlaceholder));
                    assistEditSpanInput.text(MktSvc.Controls.Common.String.Empty);
                    var inputSpanWrapper = assistEditSpanInput.parent();
                    this.scrollToViewElement(inputSpanWrapper);
                    this.addBrForFirefoxBug(assistEditSpanInput);
                    assistEditSpanInput.focus();
                }
                assistEditSpanInput.on('focusout', this.focusOutHandler);
            };
            /**
            * Appends the raw item of the assist edit to the text block
            */
            AssistEditInputSpanRenderer.prototype.insertRawItem = function () {
                this.replaceInputSpanWithText(this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditSelectedTextContainer).text());
            };
            AssistEditInputSpanRenderer.prototype.cleanup = function (blockElements) {
                blockElements.find("." + AssistEdit.AssistEditConstants.assistEditEmptyPlaceholderClassName).remove();
                blockElements.find("." + AssistEdit.AssistEditConstants.assistEditInputWrapperClassName).remove();
            };
            AssistEditInputSpanRenderer.prototype.dispose = function () {
                if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.onBlurEventHandler)) {
                    this.currentDocument.removeEventListener('blur', this.onBlurEventHandler, true);
                }
                this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditInputWrapperClassName).remove();
                this.eventBroker.unsubscribe(AssistEdit.AssistEditEventConstants.assistEditOptionFocused, this.assistEditFocusedOptionDelegate);
                if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.styleElement)) {
                    this.styleElement.remove();
                }
            };
            AssistEditInputSpanRenderer.prototype.findEditableElement = function (block) {
                //Selected block could be a wrapping div
                var element = block;
                if (!element.is("[contenteditable='true']")) {
                    element = element.find("[contenteditable='true']");
                }
                if (element.children().length > 0) {
                    element = element.children(":last");
                }
                return element[0];
            };
            AssistEditInputSpanRenderer.prototype.setActivePlaceholder = function (value) {
                var activePlaceholderRegex = /\[([^\]]+)\]/;
                var entityLogicalNameMatches = activePlaceholderRegex.exec(value);
                if (entityLogicalNameMatches != null && entityLogicalNameMatches.length) {
                    return value.replace(entityLogicalNameMatches[0], "<span class=\"" + AssistEdit.AssistEditConstants.assistEditActivePlaceholder + "\"></span>");
                }
                return value;
            };
            AssistEditInputSpanRenderer.prototype.replaceInputSpanWithText = function (value) {
                this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditInputSpanClassName).off('focusout');
                var assistEditInputWrapper = this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditInputWrapperClassName);
                this.scrollToViewTheInsertedText(value);
                var textElement = this.currentDocument.createTextNode(value);
                assistEditInputWrapper.replaceWith(textElement);
                if (this.selectionManager.isSelectionInDocument()) {
                    this.selectionManager.setCaretAtEndOfElement(textElement);
                }
            };
            AssistEditInputSpanRenderer.prototype.attachAssistEditInputSpan = function (selectedText) {
                var _this = this;
                // Set the wrapper to contenteditable to false in order to make the spanInput focusable
                var noneditableContainer = $(this.currentDocument.createElement("span"))
                    .addClass(AssistEdit.AssistEditConstants.assistEditInputWrapperClassName)
                    .attr('contenteditable', 'false');
                $('<span></span>')
                    .addClass(AssistEdit.AssistEditConstants.assistEditSelectedTextContainer)
                    .attr('contenteditable', 'false')
                    .appendTo(noneditableContainer);
                var spanInput = $('<span></span>')
                    .addClass(AssistEdit.AssistEditConstants.assistEditInputSpanClassName)
                    .attr('contenteditable', 'true')
                    .appendTo(noneditableContainer)
                    .text(selectedText);
                this.ariaSetup(spanInput);
                this.selectionManager.insertElementInSelection(noneditableContainer[0], this.selectionRange);
                this.focusAssistEditSpan(spanInput);
                this.addBrForFirefoxBug(spanInput);
                var setAriaPropertiesHandler = function (eventArgs) {
                    _this.setAriaProperties(eventArgs.value, spanInput);
                };
                this.assistEditFocusedOptionDelegate = this.eventBroker.subscribe(AssistEdit.AssistEditEventConstants.assistEditOptionFocused, setAriaPropertiesHandler);
                return spanInput;
            };
            AssistEditInputSpanRenderer.prototype.addBrForFirefoxBug = function (spanInput) {
                // Firefox issue. If the span is empty the cursor will be displayed one line above the text
                // TODO: find a more suitable solution
                if (this.isFirefox()) {
                    $('<br/>')
                        .addClass(AssistEdit.AssistEditConstants.assistEditEmptyPlaceholderClassName)
                        .appendTo(spanInput);
                }
            };
            AssistEditInputSpanRenderer.prototype.scrollToViewTheInsertedText = function (value) {
                if (MktSvc.Controls.Common.Object.isNullOrUndefined(this.currentDocument)) {
                    return;
                }
                // Append the text value wrapped in a span to the DOM to get the actual width based on the font style/size inherited from the parent.
                var assistEditInputWrapper = this.getByClassInCurrentDocument(AssistEdit.AssistEditConstants.assistEditInputWrapperClassName);
                var textElement = $(this.currentDocument.createElement("span")).text(value);
                assistEditInputWrapper.replaceWith(textElement);
                this.scrollToViewElement(textElement);
                // Remove the temporary span element
                textElement.replaceWith(assistEditInputWrapper);
            };
            AssistEditInputSpanRenderer.prototype.scrollToViewElement = function (element) {
                var parent = element.parent();
                if (parent.length === 0) {
                    return;
                }
                var width = element.width();
                var left = element.position().left - parent.position().left;
                var outerLeft = width + left;
                var parentWidht = parent.width();
                if (outerLeft > parentWidht) {
                    parent.scrollLeft(parent.scrollLeft() + (outerLeft - parentWidht));
                }
            };
            AssistEditInputSpanRenderer.prototype.focusAssistEditSpan = function (spanInput) {
                var _this = this;
                // Prevent event propagation so that the ckEditor toolbar doesn't get hidden
                this.onBlurEventHandler = function (event) {
                    _this.currentDocument.removeEventListener('blur', _this.onBlurEventHandler, true);
                    event.stopPropagation();
                    event.preventDefault();
                };
                this.currentDocument.addEventListener('blur', this.onBlurEventHandler, true);
                this.selectionManager.setCaretAtEnd(spanInput);
            };
            AssistEditInputSpanRenderer.prototype.setAriaProperties = function (focusedOptionId, assistEditSpan) {
                assistEditSpan.attr('aria-activedescendant', focusedOptionId);
            };
            AssistEditInputSpanRenderer.prototype.ariaSetup = function (spanInput) {
                var childListBoxId = MktSvc.Controls.Common.UniqueId.generate('listBox');
                spanInput.attr('role', 'combobox');
                spanInput.attr('aria-autocomplete', 'both');
                spanInput.attr('aria-haspopup', 'true');
                spanInput.attr('aria-expanded', 'true');
                spanInput.attr('aria-controls', childListBoxId);
                spanInput.attr('aria-owns', childListBoxId);
                spanInput.attr('aria-activedescendant', childListBoxId + '_0');
            };
            AssistEditInputSpanRenderer.prototype.getByClassInCurrentDocument = function (className) {
                return $(this.currentDocument).find("." + className);
            };
            /**
             * Checks if the browser used is firefox.
             **/
            AssistEditInputSpanRenderer.prototype.isFirefox = function () {
                return (navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Trident/') === -1);
            };
            return AssistEditInputSpanRenderer;
        }());
        AssistEdit.AssistEditInputSpanRenderer = AssistEditInputSpanRenderer;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var Object = MktSvc.Controls.Common.Object;
    /**
     * The selection manager.
     */
    var SelectionManager = /** @class */ (function () {
        function SelectionManager() {
        }
        /*
        * Sets the selection manger
        */
        SelectionManager.prototype.setup = function (currentDocument) {
            this.currentDocument = currentDocument;
        };
        /*
        * Inserts the element in the seleciton range
        */
        SelectionManager.prototype.insertElementInSelection = function (element, selectionRange) {
            selectionRange.deleteContents();
            selectionRange.insertNode(element);
        };
        /*
        * Checks wheter the selection is on the block
        */
        SelectionManager.prototype.isCaretInsideBlock = function (block) {
            if (Object.isNullOrUndefined(this.currentDocument)) {
                return false;
            }
            var isCaretInside = false;
            if (this.isSelectionInDocument()) {
                var selectionStartContainer = this.currentDocument.getSelection().getRangeAt(0).startContainer;
                isCaretInside = ($.contains(block, selectionStartContainer) || selectionStartContainer === block);
            }
            return isCaretInside;
        };
        SelectionManager.prototype.isSelectionInDocument = function () {
            return this.currentDocument.getSelection().rangeCount > 0;
        };
        /*
        * Sets the caret at the end of the element
        */
        SelectionManager.prototype.setCaretAtEnd = function (element) {
            element.focus();
            if (this.isSelectionInDocument()) {
                this.setCaretAtEndOfElement(element[0]);
            }
        };
        /*
        * Sets the caret at the end of the element
        */
        SelectionManager.prototype.setCaretAtEndOfElement = function (element) {
            if (Object.isNullOrUndefined(this.currentDocument)) {
                return;
            }
            var selection = this.currentDocument.getSelection();
            var range = this.currentDocument.createRange();
            range.selectNodeContents(element);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        };
        SelectionManager.prototype.selectElement = function (element) {
            var selectedText = element[0];
            this.selectTextNode(selectedText);
        };
        SelectionManager.prototype.selectTextNode = function (node) {
            if (Object.isNullOrUndefined(this.currentDocument)) {
                return;
            }
            var selection = this.currentDocument.getSelection();
            selection.removeAllRanges();
            var selectionRange = this.currentDocument.createRange();
            selectionRange.selectNode(node);
            selection.addRange(selectionRange);
        };
        SelectionManager.prototype.getCaretPosition = function (element) {
            var range = this.currentDocument.getSelection().getRangeAt(0);
            var previousRange = range.cloneRange();
            previousRange.selectNodeContents(element);
            previousRange.setEnd(range.endContainer, range.endOffset);
            return previousRange.toString().length;
        };
        SelectionManager.prototype.setCaretSelection = function (node, startPosition, endPosition) {
            if (Object.isNullOrUndefined(this.currentDocument) || Object.isNullOrUndefined(node)) {
                return;
            }
            var range = this.currentDocument.createRange();
            range.setStart(node, startPosition);
            range.setEnd(node, endPosition);
            this.currentDocument.getSelection().removeAllRanges();
            this.currentDocument.getSelection().addRange(range);
        };
        SelectionManager.prototype.setCaretPosition = function (node, position) {
            this.setCaretSelection(node, position, position);
        };
        return SelectionManager;
    }());
    MktSvcCommon.SelectionManager = SelectionManager;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MscrmControls;
(function (MscrmControls) {
    var Common;
    (function (Common) {
        "use strict";
        var ControlState;
        (function (ControlState) {
            ControlState[ControlState["Disabled"] = 0] = "Disabled";
            ControlState[ControlState["Enabled"] = 1] = "Enabled";
        })(ControlState = Common.ControlState || (Common.ControlState = {}));
    })(Common = MscrmControls.Common || (MscrmControls.Common = {}));
})(MscrmControls || (MscrmControls = {}));
// This file was forked from CRM main repository, v9.0 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var CommonControl = /** @class */ (function () {
        /**
         * Empty constructor.
         */
        function CommonControl() {
            // A variable to distinguish when focusing with tab key or mouse
            this.lastKeyPress = true;
            this.isInitialized = false;
            this.isEnabled = false;
            this.shouldPreventMultipleEventTypes = true;
            this.isInReadMode = true;
            this.updateEvents = new Mscrm.UpdateEvents();
        }
        Object.defineProperty(CommonControl.prototype, "isControlInitialized", {
            /**
             * Gets a value indicating if the control was initialized.
             */
            get: function () {
                return this.isInitialized;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Initializes the control. This function will receive the HTML Div element that will contain your custom control
         * as well as a function to notify the infrastructure that your outputs have changed and that it should call getOutputs()
         * @param context The "Input Bag" containing the parameters and other control metadata.
         * @param notifyOutputChanged A Callback to notify the infrastructure to read the outputs
         * @param state The control state.
         * @param container The HTML Element that will contain the control
         */
        CommonControl.prototype.init = function (context, notifyOutputChanged, state, container) {
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(container)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(CommonControl.NullOrUndefinedInitContainer);
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(notifyOutputChanged)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(CommonControl.NullOrUndefinedInitNotifyOutputChangedDelegate);
            }
            if (this.isControlInitialized) {
                return;
            }
            this.container = container;
            this.notifyOutputChanged = notifyOutputChanged;
            this.disablePanoramaScroll = context.utils.disablePanoramaScroll;
            this.initializeControl(context, state);
        };
        /**
         * Updates the control with data from the a bag of values currently assigned to the control's manifest parameters
         * @param context The bag of values described above
         */
        CommonControl.prototype.updateView = function (context) {
            if (this.shouldIgnoreUpdate(context)) {
                return;
            }
            this.throwIfPropertyBagNotValid(context);
            if (!this.isInitialized) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(CommonControl.UninitializedErrorMessage);
            }
            this.handleEditToReadModeTransition(context);
            this.isEnabled = this.isControlEnabled(context);
            this.updateCore(context);
            if (context.mode.isRead || context.mode.isPreview || context.mode.isControlDisabled) {
                this.renderReadMode(context);
            }
            else {
                this.renderEditMode(context);
            }
        };
        /**
         * @returns The a bag of output values to pass to the infrastructure
         */
        CommonControl.prototype.getOutputs = function () {
            if (!this.isControlInitialized) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(CommonControl.UninitializedControl);
            }
            return this.getOutputsCore();
        };
        /**
         * Event handler called when the user triggers a navigation event.
         */
        CommonControl.prototype.onPreNavigation = function () {
            return;
        };
        /**
         * This function destroys the control and cleans up
         */
        CommonControl.prototype.destroy = function () {
            if (this.isControlInitialized) {
                this.eventGuard.destroy();
                this.destroyCore();
            }
            this.cleanup();
        };
        /**
         * Create a wrapper container for the control.
         * @remark this contains the common controls class name
         * @param additional, more specific class name
         */
        CommonControl.prototype.createWrapperContainer = function (className, isRtl) {
            if (className === void 0) { className = ""; }
            if (isRtl === void 0) { isRtl = false; }
            var wrapperContainer = document.createElement("div");
            wrapperContainer.className = MktSvcCommon.CommonControl.ClassName;
            wrapperContainer.className += className === "" ? "" : " " + className;
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(this.container)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvcCommon.CommonControl.NullOrUndefinedInitContainer);
            }
            if (isRtl) {
                wrapperContainer.className += " " + MktSvcCommon.CommonControl.ClassRtl;
            }
            this.container.appendChild(wrapperContainer);
            return wrapperContainer;
        };
        /**
         * Handles control specific initialization.
         * Method should be overridden in the controls specialized classes.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         */
        CommonControl.prototype.initCore = function (context, state) {
            MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(CommonControl.MethodNotOverridenFormat, "initCore"));
        };
        /**
         * Handles control specific update.
         * Method should be overridden in the controls specialized classes.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         */
        CommonControl.prototype.updateCore = function (context) {
            MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(CommonControl.MethodNotOverridenFormat, "updateCore"));
        };
        /**
         * Handles control specific destruction.
         */
        CommonControl.prototype.destroyCore = function () {
            MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(CommonControl.MethodNotOverridenFormat, "destroyCore"));
        };
        /**
         * Handles read mode rendering.
         * Method should be overridden in the controls specialized classes.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         */
        CommonControl.prototype.renderReadMode = function (context) {
            this.shouldNotifyOutputChanged = false;
        };
        /**
         * Handles edit mode rendering.
         * Method should be overridden in the controls specialized classes.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         */
        CommonControl.prototype.renderEditMode = function (context) {
            this.shouldNotifyOutputChanged = false;
            // When transitioning from read mode, add the panorama events handlers and disable the transition click
            if (this.isInReadMode) {
                if (this.preventEditModePanoramaEvents) {
                    this.removePanoramaEventsHandlers();
                    this.addPanoramaEventsHandlers();
                }
                this.eventGuard.preventClicksUntilUserInteracted();
            }
            this.isInReadMode = false;
        };
        /**
         * Method should be overridden in the controls specialized classes.
         */
        CommonControl.prototype.getOutputsCore = function () {
            MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(CommonControl.MethodNotOverridenFormat, "getOutputsCore"));
            return null;
        };
        /**
         * Notifies output changed only if the control is enabled or in read/preview mode.
         */
        CommonControl.prototype.notifyEnabledControlOutputChanged = function () {
            if (this.isEnabled && this.shouldNotifyOutputChanged) {
                this.notifyOutputChanged();
            }
        };
        /**
         * Checks whether the control is enabled for changed output notifications.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         */
        CommonControl.prototype.isControlEnabled = function (context) {
            return !context.mode.isRead && !context.mode.isPreview && !context.mode.isControlDisabled;
        };
        /**
         * Checks if the control's bound property is null.
         * Method should be overridden in the controls specialized classes.
         * @params context The "Input Bag" containing the parameters and other control metadata.
         * @returns true if the bound property is null, false otherwise.
         */
        CommonControl.prototype.showDefaultLabelCore = function (context) {
            return false;
        };
        /**
        * Toggles the container visibility depending on the param
        * @param value - truth value for showing/hiding the container
        * @remark if the control wrapper container exists, it will show/hide that one, else it will show/hide the parent container
        */
        CommonControl.prototype.toggleContainerVisibility = function (value) {
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(this.controlWrapperContainer)) {
                value ? $(this.container).show() : $(this.container).hide();
            }
            else {
                value ? $(this.controlWrapperContainer).show() : $(this.controlWrapperContainer).hide();
            }
        };
        /**
        * Handles the internal implementation of the control initialization.
        * @params context The "Input Bag" containing the parameters and other control metadata.
        * @param state The control state.
        */
        CommonControl.prototype.initializeControl = function (context, state) {
            try {
                this.throwIfPropertyBagNotValid(context);
                this.notificationHandler = new MktSvcCommon.ErrorHandling.NotificationHandler(context.utils.setNotification, context.utils.clearNotification);
                this.htmlEncode = context.utils.crmHtmlEncode;
                this.eventGuard = new MktSvcCommon.EventGuard(this.container, context.client.userAgent);
                this.initCore(context, state);
                if (this.shouldPreventMultipleEventTypes) {
                    this.eventGuard.preventMultipleEventTypes();
                }
                this.isEnabled = this.isControlEnabled(context);
                this.isInitialized = true;
            }
            catch (e) {
                // Ensure that the container is cleaned up if an error occured on control initialization
                if (this.container.hasChildNodes()) {
                    var childCount = this.container.childNodes.length;
                    for (var i = childCount - 1; i >= 0; i--) {
                        this.container.removeChild(this.container.childNodes[i]);
                    }
                }
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(e);
            }
        };
        /**
        * Guards against infra updates due to layout changes.
        * @param context The bag of values described above
        * @returns truth value based on infra properties and the control's decision to ignore the update
        */
        CommonControl.prototype.shouldIgnoreUpdate = function (context) {
            var shouldIgnore = true;
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context) ||
                MktSvc.Controls.Common.Object.isNullOrUndefined(context.updatedProperties) ||
                MktSvc.Controls.Common.Object.isNullOrUndefined(this.updateEvents) ||
                context.updatedProperties.length == 0) {
                return false;
            }
            for (var i = 0; i < context.updatedProperties.length; i++) {
                var eventType = Mscrm.UpdateEvents.getEventType(context.updatedProperties[i]);
                shouldIgnore = shouldIgnore && this.updateEvents.isIgnoredEvent(eventType);
            }
            return shouldIgnore;
        };
        /**
         * Checks the validity of the property bag and throws if it is invalid.
         * @param context The data bag.
         */
        CommonControl.prototype.throwIfPropertyBagNotValid = function (context) {
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(CommonControl.UninitializedDataBagMessage);
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.parameters)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.parameters"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils.setNotification)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils.setNotification"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils.clearNotification)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils.clearNotification"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils.openInBrowser)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils.openInBrowser"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils.getServiceUri)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils.getServiceUri"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.mode)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.mode"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.mode.isControlDisabled)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.mode.isControlDisabled"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.mode.isRead)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.mode.isRead"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.mode.isPreview)) {
                MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.mode.isPreview"));
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils)) {
                throw MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils");
            }
            if (MktSvc.Controls.Common.Object.isNullOrUndefined(context.utils.crmHtmlEncode)) {
                throw MktSvc.Controls.Common.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "dataBag.utils.crmHtmlEncode");
            }
        };
        /**
         * Helper method to clean up container
         */
        CommonControl.prototype.cleanup = function () {
            if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.container)) {
                if (this.preventEditModePanoramaEvents) {
                    this.removePanoramaEventsHandlers();
                }
            }
            this.isInitialized = false;
            this.notifyOutputChanged = null;
            $(this.container).empty();
            this.container = null;
        };
        /**
         * Handles the transition from edit to read mode.
         * @param context The context.
         */
        CommonControl.prototype.handleEditToReadModeTransition = function (context) {
            // Remove the event handlers before the label can be shown when transitioning to read mode from edit mode
            if (!this.isInReadMode && context.mode.isRead) {
                // When transitioning from edit mode, remove the panorama events handlers
                if (this.preventEditModePanoramaEvents) {
                    this.removePanoramaEventsHandlers();
                }
                this.eventGuard.stopPreventingClicks();
                this.isInReadMode = true;
            }
        };
        /**
         * Removes the panorama events handlers, which disable panorama scroll.
         */
        CommonControl.prototype.removePanoramaEventsHandlers = function () {
            $(this.container).off(CommonControl.PointerDownEventName);
            $(this.container).off(CommonControl.PointerMoveEventName);
            $(this.container).off(CommonControl.PointerUpEventName);
            $(this.container).off(CommonControl.TouchEndEventName);
        };
        /**
         * Adds the panorama events handlers, which disable panorama scroll.
         */
        CommonControl.prototype.addPanoramaEventsHandlers = function () {
            var _this = this;
            $(this.container).on(CommonControl.PointerDownEventName, function (event) {
                if (_this.isEnabled) {
                    _this.disablePanoramaScroll(true);
                    event.stopPropagation();
                }
            });
            $(this.container).on(CommonControl.PointerMoveEventName, function (event) {
                if (_this.isEnabled) {
                    event.stopPropagation();
                }
            });
            $(this.container).on(CommonControl.PointerUpEventName, function (event) {
                if (_this.isEnabled) {
                    _this.disablePanoramaScroll(false);
                }
            });
            $(this.container).on(CommonControl.TouchEndEventName, function (event) {
                // This is needed if the event occurs outside of the container (if the touch ends outside the container, no pointerup is fired, however a touchend is)
                if (_this.isEnabled) {
                    _this.disablePanoramaScroll(false);
                }
            });
        };
        /**
         * This method binds focus outlining when tabbing in a control.
         * @param focusElement The jQuery element initiating focus events.
         * @param container The jQuery element that the outline class will be added.
         */
        CommonControl.prototype.bindFocusVisibility = function (focusElement, container) {
            var _this = this;
            focusElement.on("focus", function () {
                if (_this.lastKeyPress)
                    container.addClass(CommonControl.accessibilityOutlineClassName);
            });
            focusElement.on("focusout", function () {
                container.removeClass(CommonControl.accessibilityOutlineClassName);
                _this.lastKeyPress = true;
            });
            container.on("mousedown touchstart", function () {
                _this.lastKeyPress = false;
                container.removeClass(CommonControl.accessibilityOutlineClassName);
            });
            container.on("keydown", function () {
                _this.lastKeyPress = true;
            });
        };
        /**
         * This method unbinds focus outlining when tabbing in a control.
         * @param container The jQuery element that the focuing events are binded.
         */
        CommonControl.prototype.unbindFocusVisibility = function (focusElement, container) {
            focusElement.off("focus");
            focusElement.off("focusout");
            container.off("mousedown");
            container.off("touchstart");
            container.off("keydown");
        };
        // The class name common to the field controls.
        CommonControl.ClassName = "mocaControls";
        // The class added to indicate control is in RightToLeft text mode.
        CommonControl.ClassRtl = "rtl";
        // The custom control pointerdown event.
        CommonControl.PointerDownEventName = "pointerdown.CustomControl";
        // The custom control pointermove event.
        CommonControl.PointerMoveEventName = "pointermove.CustomControl";
        // The custom control pointerup event.
        CommonControl.PointerUpEventName = "pointerup.CustomControl";
        // The custom control touchend event.
        CommonControl.TouchEndEventName = "touchend.CustomControl";
        // The label string for the control's default (null) value.
        CommonControl.DefaultValueLabel = "---";
        // This exception message is thrown when initializing a control with a null or undefined container.
        CommonControl.NullOrUndefinedInitContainer = "Null or undefined control container.";
        // This exception message is thrown when initializing a control with a null or undefined value (aux) container.
        CommonControl.NullOrUndefinedInitValueContainer = "Null or undefined control value container.";
        // This exception message is thrown when initializing a control with a null or undefined NotifyOutputChanged delegate.
        CommonControl.NullOrUndefinedInitNotifyOutputChangedDelegate = "Null or undefined NotifyOutputChanged delegate.";
        // This exception message is thrown when updating a control before initialize.
        CommonControl.UninitializedErrorMessage = "init should be called before calling update.";
        // This exception message is thrown when the control is updated with a null or undefined context property.
        CommonControl.UninitializedDataBagMessage = "Null or undefined dataBag property.";
        // This exception message is thrown when the property bag does not contain an expected parameter 
        CommonControl.InvalidDataBagKeyFormat = "Expected key {0} in the input data bag.";
        // This exception message is thrown when the control is used uninitialized
        CommonControl.UninitializedControl = "Control is used uninitialized.";
        // This exception message is thrown when Min or Max values do not bound a valid interval.
        CommonControl.InvalidInputParamMinMax = "Min and max values do not bound a valid interval.";
        // This exception message is thrown when step parameter is less than 0 or not in the min-max interval.
        CommonControl.InvalidInputParamStep = "Step parameter should be greater than 0 and less than the interval bound by min and max.";
        // This exception message is thrown when the value for the control is not within the desired interval.
        CommonControl.InvalidInputParamValue = "Value for the control is not within the desired interval.";
        // This exception message is thrown when an input parameter should have been greater than zero
        CommonControl.NotGreaterThanZeroInputParamValue = "Parameter {0} should be greater than zero.";
        // This is the default error message for invalid parameters.
        CommonControl.InvalidInputParam = "One or more of the input parameters are invalid: {0}";
        // This exception message is thrown when a given method is not overriden.
        CommonControl.MethodNotOverridenFormat = "Method {0} is not overridden in the specialized class.";
        // This exception message is thrown when a given method is not overriden.
        CommonControl.MethodNotImplementedInControl = "Method {0} is not implemented in the control.";
        // The outline class name when focusing in a control
        CommonControl.accessibilityOutlineClassName = "outline-for-accessibility";
        return CommonControl;
    }());
    MktSvcCommon.CommonControl = CommonControl;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    /**
    * Base class for field controls
    */
    var FieldControlBase = /** @class */ (function (_super) {
        __extends(FieldControlBase, _super);
        function FieldControlBase() {
            var _this = _super.call(this) || this;
            _this.updateEvents.shouldIgnoreEvent(Mscrm.UpdateEventType.Layout, true);
            _this.updateEvents.shouldIgnoreEvent(Mscrm.UpdateEventType.Activation, true);
            return _this;
        }
        return FieldControlBase;
    }(MktSvcCommon.CommonControl));
    MktSvcCommon.FieldControlBase = FieldControlBase;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var EventConstants = /** @class */ (function () {
        function EventConstants() {
        }
        /** JQuery change event */
        EventConstants.Change = "change";
        /** JQuery click event */
        EventConstants.Click = "click";
        /** JQuery knob configure event */
        EventConstants.JQueryKnobConfigure = "configure";
        /** JQuery swipe left event */
        EventConstants.JQuerySwipeLeft = "swipeleft";
        /** JQuery right left event */
        EventConstants.JQuerySwipeRight = "swiperight";
        /** Key raise event */
        EventConstants.KeyUp = "keyup";
        /** JQuery mouseup event */
        EventConstants.MouseUp = "mouseup";
        /** JQuery mousedown event */
        EventConstants.MouseDown = "mousedown";
        /** Mouse Over event */
        EventConstants.MouseOver = "mouseover";
        /** Mouse Move event */
        EventConstants.MouseMove = "mousemove";
        /** Pointer Down event */
        EventConstants.PointerDown = "pointerdown";
        /** Pointer Move event */
        EventConstants.PointerMove = "pointermove";
        /** Pointer Up event */
        EventConstants.PointerUp = "pointerup";
        /** Pointer Out event */
        EventConstants.PointerOut = "pointerout";
        /** MS Pointer Over event */
        EventConstants.MSPointerOver = "MSPointerOver";
        /** MS Pointer Down event */
        EventConstants.MSPointerDown = "MSPointerDown";
        /** MS Pointer Out event */
        EventConstants.MSPointerOut = "MSPointerOut";
        /** MS Pointer Up event */
        EventConstants.MSPointerUp = "MSPointerUp";
        /** MS Pointer Move event */
        EventConstants.MSPointerMove = "MSPointerMove";
        /** Touch Start event */
        EventConstants.TouchStart = "touchstart";
        /** Touch Move event */
        EventConstants.TouchMove = "touchmove";
        /** Touch End event */
        EventConstants.TouchEnd = "touchend";
        /** JQuery Mobile Virtual Mouse Move event */
        EventConstants.VMouseMove = "vmousemove";
        /** Focus event */
        EventConstants.Focus = "focus";
        /** Focus in event */
        EventConstants.FocusIn = "focusin";
        /** Focus out event */
        EventConstants.FocusOut = "focusout";
        /** Focus events */
        EventConstants.FocusEvents = "focusin focusout";
        /** Undo event */
        EventConstants.UndoExecuted = "undoExecuted";
        /** Redo event */
        EventConstants.RedoExecuted = "redoExecuted";
        /** State has been saved event */
        EventConstants.StateSaved = "stateSaved";
        EventConstants.GalleryImageSelected = "galleryImageSelected";
        EventConstants.GalleryPopupClosed = "galleryPopupClosed";
        return EventConstants;
    }());
    MktSvcCommon.EventConstants = EventConstants;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var EventGuard = /** @class */ (function () {
        /* Creates a new event guard.
         * @param container The container on which to prevent the focus event.
         * @param userAgent The user agent.
         */
        function EventGuard(container, userAgent) {
            this.container = container;
            this.userAgent = userAgent;
        }
        /**
         * Destroys the event guard.
         */
        EventGuard.prototype.destroy = function () {
            this.stopPreventingClicks();
            this.stopPreventingFocus();
            this.stopPreventingMultipleEventTypes();
            this.container = null;
            this.userAgent = null;
        };
        /*
         * Prevent the next edit mode click event if occuring within the edit mode transition phase, as this is not due to user interaction.
         * Should only be used when first going into read mode from edit mode.
         * @remarks We need to prevent the first click when transitioning from read mode since the infra calls updateCore on pointerup, and the click event might follow.
         *			The extraneous click event can cause unwanted behavior upon our control, however is still needed by the infra to prevent double edit mode, therefore it
         *			will be faked by synthesizing a click event on the container, which will have no side-effects, however will make the infra acknowledge that we're in edit mode.
         *			The user interaction flag can also be set by a pointerdown event, just in case the final click event is not triggered by the browser.
         *			This behavior should be removed when entering read mode by calling the stopPreventingClicks function.
         * @param container The container.
         */
        EventGuard.prototype.preventClicksUntilUserInteracted = function () {
            var _this = this;
            if (this.container == null || this.userAgent == null) {
                return;
            }
            // Stop preventing clicks in case already preventing and the user has never interacted.
            this.stopPreventingClicks();
            // Mark the container as having been interacted with when a pointerdown event is triggered
            $(this.container).on(EventGuard.hasUserInteractedEventName, function (e) {
                _this.userInteractedInEditMode = true;
            });
            // Prevent the non-user generated click events
            this.removeClickEventHandler = EventGuard.handleEditModeClickEvents(this.container, this);
        };
        /*
         * Stop preventing clicks until user interacted.
         */
        EventGuard.prototype.stopPreventingClicks = function () {
            this.userInteractedInEditMode = false;
            // Remove the click prevention on the next container pointerdown
            $(this.container).off(EventGuard.hasUserInteractedEventName);
            if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.removeClickEventHandler)) {
                this.removeClickEventHandler();
            }
            this.removeClickEventHandler = null;
        };
        /**
         * Prevent the next edit mode focus event, since it will occur during the transition.
         * @remarks We need to prevent input element actions when transitioning from read mode since the infra calls updateCore on pointerUp, and the focus event might follow.
         *			The extraneous focus event can cause unwanted behavior upon our control, so we set the input elements to read-only until we are sure that the user is interacting,
         *			which will happen on the next pointerdown.
         *			This behavior should be removed when entering read mode by calling the stopPreventingFocus function.
         */
        EventGuard.prototype.preventEditModeTransitionFocus = function () {
            var _this = this;
            if (this.container == null || this.userAgent == null) {
                return;
            }
            // Stop preventing focuses in case already preventing and the user has never interacted.
            this.stopPreventingFocus();
            this.userInteractedInEditModeWithAnInputElement = false;
            var inputElements = $(this.container).find('input');
            inputElements.each(function (index, element) {
                // Set the input elements to readonly until the next pointerdown to prevent focus events
                element.setAttribute(MktSvcCommon.AttributeConstants.ReadOnly, MktSvcCommon.AttributeConstants.ReadOnly);
                // On Android, also blur on focus to prevent the caret from showing
                if (_this.userAgent.isAndroid) {
                    $(element).on(EventGuard.focusRemoveEvent, function (e) {
                        $(element).blur();
                        $(element).off(EventGuard.focusRemoveEvent);
                    });
                }
                // Remove the readonly on the next element pointerdown
                $(element).on(EventGuard.hasUserInteractedWithElementEventName, function (e) {
                    _this.stopPreventingFocusEvents(element);
                });
            });
        };
        /**
         * Stops preventing the transition edit mode focus event, as the control might not have been interacted with.
         * @param container The container on which to prevent the focus event.
         */
        EventGuard.prototype.stopPreventingFocus = function () {
            var _this = this;
            // Only stop preventing transition focus if the user hasn't interacted with the element in edit mode. Else the event handler cleanup should already have been executed.
            if (!this.userInteractedInEditModeWithAnInputElement) {
                var inputElements = $(this.container).find('input');
                inputElements.each(function (index, element) {
                    _this.stopPreventingFocusEvents(element);
                });
            }
        };
        /*
         * Prevents all mouse events upon an element if a touch event is detected and vice-versa, returning a callback to remove the event handlers.
         * Also prevents the first click and focus events if they occur within a certain timeframe.
         * @return Callback to remove the event handlers.
         */
        EventGuard.prototype.preventMultipleEventTypes = function () {
            var _this = this;
            if (this.container == null || this.userAgent == null) {
                return;
            }
            var resetMultipleEventTypeFlags = function (e) {
                // The click is issued only after all mouse*, touch* and pointer* events are issued, so we can safely set the prevention flags to false
                _this.shouldPreventMouseEvents = false;
                _this.shouldPreventTouchEvents = false;
            };
            var removeTouchEventHandlers = EventGuard.preventTouchEventsAfterMouseDown(this.container, this);
            var removeMouseEventHandlers = EventGuard.preventMouseEventsAfterTouchStart(this.container, this);
            this.container.addEventListener(MktSvcCommon.EventConstants.Click, resetMultipleEventTypeFlags, true);
            var removalCallback = function () {
                removeTouchEventHandlers();
                removeMouseEventHandlers();
                _this.container.removeEventListener(MktSvcCommon.EventConstants.Click, resetMultipleEventTypeFlags, true);
            };
            this.removeMultipleEventHandlers = removalCallback;
        };
        /**
         * Stops preventing multiple event types.
         * Should be used when destroying the control.
         */
        EventGuard.prototype.stopPreventingMultipleEventTypes = function () {
            if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.removeMultipleEventHandlers)) {
                this.removeMultipleEventHandlers();
            }
            this.removeMultipleEventHandlers = null;
        };
        /**
         * Stops preventing focus events on a certain element.
         * @param element The element to stop focus events upon.
         */
        EventGuard.prototype.stopPreventingFocusEvents = function (element) {
            element.removeAttribute(MktSvcCommon.AttributeConstants.ReadOnly);
            if (this.userAgent.isAndroid) {
                $(element).off(EventGuard.focusRemoveEvent);
            }
            $(element).off(EventGuard.hasUserInteractedWithElementEventName);
            this.userInteractedInEditModeWithAnInputElement = true;
        };
        EventGuard.handleEditModeClickEvents = function (element, eventGuard) {
            var preventFirstClick = function (e) {
                // The controls should not react upon the first edit mode click event since this is fired almost instantly after entering edit mode.
                if (!eventGuard.userInteractedInEditMode) {
                    e.stopPropagation();
                    // Pre-set this flag since we're handling the transition mode click
                    eventGuard.userInteractedInEditMode = true;
                    // Trigger a synthetic click event so that standard MoCA behavior is not altered.
                    $(element).trigger(MktSvcCommon.EventConstants.Click);
                }
                eventGuard.userInteractedInEditMode = true;
            };
            element.addEventListener(MktSvcCommon.EventConstants.Click, preventFirstClick, true);
            return function () {
                element.removeEventListener(MktSvcCommon.EventConstants.Click, preventFirstClick, true);
            };
        };
        EventGuard.preventTouchEventsAfterMouseDown = function (element, eventGuard) {
            var onTouchStart = function (e) {
                // If touch events are not prevented, it means the touch start was the first event to be called and we must start preventing mouse events.
                if (!eventGuard.shouldPreventTouchEvents) {
                    eventGuard.shouldPreventMouseEvents = true;
                }
                else {
                    e.stopImmediatePropagation();
                }
            };
            var preventTouchEventsIfRequired = function (e) {
                if (eventGuard.shouldPreventTouchEvents) {
                    e.stopImmediatePropagation();
                }
            };
            element.addEventListener(MktSvcCommon.EventConstants.TouchStart, onTouchStart, true);
            element.addEventListener(MktSvcCommon.EventConstants.TouchMove, preventTouchEventsIfRequired, true);
            element.addEventListener(MktSvcCommon.EventConstants.TouchEnd, preventTouchEventsIfRequired, true);
            return function () {
                element.removeEventListener(MktSvcCommon.EventConstants.TouchStart, onTouchStart, true);
                element.removeEventListener(MktSvcCommon.EventConstants.TouchMove, preventTouchEventsIfRequired, true);
                element.removeEventListener(MktSvcCommon.EventConstants.TouchEnd, preventTouchEventsIfRequired, true);
            };
        };
        EventGuard.preventMouseEventsAfterTouchStart = function (element, eventGuard) {
            var preventMouseEventsIfRequired = function (e) {
                if (eventGuard.shouldPreventMouseEvents && !e.touchConverted) {
                    e.stopImmediatePropagation();
                }
            };
            var onMouseDown = function (e) {
                // If mouse events are not prevented, it means the mouse down was the first event to be called and we must start preventing touch events.
                if (!eventGuard.shouldPreventMouseEvents) {
                    eventGuard.shouldPreventTouchEvents = true;
                }
                else {
                    preventMouseEventsIfRequired(e);
                }
            };
            element.addEventListener(MktSvcCommon.EventConstants.MouseDown, onMouseDown, true);
            element.addEventListener(MktSvcCommon.EventConstants.MouseMove, preventMouseEventsIfRequired, true);
            element.addEventListener(MktSvcCommon.EventConstants.MouseUp, preventMouseEventsIfRequired, true);
            return function () {
                element.removeEventListener(MktSvcCommon.EventConstants.MouseDown, onMouseDown, true);
                element.removeEventListener(MktSvcCommon.EventConstants.MouseMove, preventMouseEventsIfRequired, true);
                element.removeEventListener(MktSvcCommon.EventConstants.MouseUp, preventMouseEventsIfRequired, true);
            };
        };
        /* Remove focus event, to prevent Android from showing the caret on a readonly input when switching into edit mode */
        EventGuard.focusRemoveEvent = "focus.RemoveFocus";
        /* Pointerdown event, which signals that the user interacted with the control in edit mode */
        EventGuard.hasUserInteractedEventName = "pointerdown.UserInteracted";
        /* Pointerdown event, which signals that the user interacted with an element in edit mode */
        EventGuard.hasUserInteractedWithElementEventName = "pointerdown.UserInteractedElement";
        return EventGuard;
    }());
    MktSvcCommon.EventGuard = EventGuard;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var AssistEditItemSelectedEventArgs = /** @class */ (function () {
            function AssistEditItemSelectedEventArgs() {
            }
            return AssistEditItemSelectedEventArgs;
        }());
        EventArgs.AssistEditItemSelectedEventArgs = AssistEditItemSelectedEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        /**
        * Event parameter for the ImageSelectedEvent
        */
        var ImageSelectedEventParameter = /** @class */ (function () {
            function ImageSelectedEventParameter() {
            }
            return ImageSelectedEventParameter;
        }());
        EventArgs.ImageSelectedEventParameter = ImageSelectedEventParameter;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var NotificationHelper;
    (function (NotificationHelper_1) {
        "use strict";
        /**
         * The NotificationHelper.
         */
        var NotificationHelper = /** @class */ (function () {
            /**
             * Initializes NotificationHelper.
             * @params context The control context, containing the utils.
             */
            function NotificationHelper(context) {
                this.context = context;
                this.notificationIds = [];
            }
            /**
             * Sets a notification.
             * @param message The message.
             * @param notificationLevel The notification level.
             * @param notificationId A unique identifier for the message.
             * @param removingDelay The removing delay. The notification will not be removed automatically, if null or undefined.
             * @return true if it succeeds, false if it fails.
             */
            NotificationHelper.prototype.setNotification = function (message, notificationLevel, notificationId, removingDelay) {
                var _this = this;
                // TODO: use this.context.utils.setNotification when this API will be ready
                if (!window.Xrm || !window.Xrm.Page) {
                    return false;
                }
                var status = window.Xrm.Page.ui.setFormNotification(message, notificationLevel, notificationId);
                if (status && this.notificationIds.indexOf(notificationId) === -1) {
                    this.notificationIds.push(notificationId);
                }
                if (removingDelay && removingDelay > 0 && status) {
                    setTimeout(function () {
                        _this.clearNotification(notificationId);
                    }, removingDelay);
                }
                return status;
            };
            /**
             * Clears the notification identified by uniqueId.
             * @param notificationId A unique identifier for the message.
             * @return true if it succeeds, false if it fails.
             */
            NotificationHelper.prototype.clearNotification = function (notificationId) {
                // TODO: use this.context.utils.clearNotification when this API will be ready
                if (!window.Xrm || !window.Xrm.Page) {
                    return false;
                }
                var status = window.Xrm.Page.ui.clearFormNotification(notificationId);
                if (status && this.notificationIds.indexOf(notificationId) !== -1) {
                    this.notificationIds.slice(this.notificationIds.indexOf(notificationId), 1);
                }
                return status;
            };
            /**
             * Clears all notifications with a specific prefix if specified or all notifications, which was shown by this helper.
             * @param prefix The notification id prefix.
             * @return true if it succeeds, false if it fails.
             */
            NotificationHelper.prototype.clearAllNotifications = function (prefix) {
                var _this = this;
                var status = true;
                var unprocessedNotificationIds = [];
                this.notificationIds.forEach(function (notificationId) {
                    if (!prefix || (prefix && notificationId.indexOf(prefix) === 0)) {
                        var currentStatus = _this.clearNotification(notificationId);
                        if (!currentStatus) {
                            status = false;
                            unprocessedNotificationIds.push(notificationId);
                        }
                    }
                    else {
                        unprocessedNotificationIds.push(notificationId);
                    }
                });
                this.notificationIds = unprocessedNotificationIds;
                return status;
            };
            return NotificationHelper;
        }());
        NotificationHelper_1.NotificationHelper = NotificationHelper;
    })(NotificationHelper = MktSvcCommon.NotificationHelper || (MktSvcCommon.NotificationHelper = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var NotificationHelper;
    (function (NotificationHelper) {
        "use strict";
    })(NotificationHelper = MktSvcCommon.NotificationHelper || (MktSvcCommon.NotificationHelper = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var MethodConstants = /** @class */ (function () {
        function MethodConstants() {
        }
        /** JQuery Mobile destroy method */
        MethodConstants.Destroy = "destroy";
        /** JQuery Mobile refresh method */
        MethodConstants.Refresh = "refresh";
        /** JQuery value method */
        MethodConstants.Value = "value";
        /** JQuery option method */
        MethodConstants.Option = "option";
        /** JQuery disable method */
        MethodConstants.Disable = "disable";
        /** JQuery enable method */
        MethodConstants.Enable = "enable";
        return MethodConstants;
    }());
    MktSvcCommon.MethodConstants = MethodConstants;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Event names for the CustomControls
        */
        var CustomControlEvent = /** @class */ (function () {
            function CustomControlEvent() {
            }
            CustomControlEvent.itemSelected = 'ITEM_SELECTED';
            CustomControlEvent.valueChanged = 'VALUE_CHANGED';
            CustomControlEvent.finalItemSelected = 'FINAL_ITEM_SELECTED';
            CustomControlEvent.initComplete = 'INIT_COMPLETE';
            CustomControlEvent.controlCanceled = 'CONTROL_CANCEL';
            CustomControlEvent.listBoxUpdated = 'LIST_BOX_UPDATED';
            CustomControlEvent.enterKeyDown = 'ENTER_KEY_DOWN';
            CustomControlEvent.focusout = 'FOCUSOUT';
            CustomControlEvent.optionFocused = 'OPTION_FOCUSED';
            return CustomControlEvent;
        }());
        ControlUtils.CustomControlEvent = CustomControlEvent;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Enum helper methods.
        */
        var Enum = /** @class */ (function () {
            function Enum() {
            }
            Enum.getFromString = function (enumArray, stringValue) {
                for (var i in enumArray) {
                    if (enumArray[i] == stringValue) {
                        return parseInt(i);
                    }
                }
                return -1;
            };
            return Enum;
        }());
        ControlUtils.Enum = Enum;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Event helper methods.
        */
        var Event = /** @class */ (function () {
            function Event() {
            }
            /**
             * Creates a namespaced event, in order to uniquely identify it.
             * @param eventName The name of an event, e.g. click.
             * @param eventNamespace The namespace of the event, used to uniquely identify the event.
             * @returns The event with the namespace.
             */
            Event.createName = function (eventName, eventNamespace) {
                return MktSvc.Controls.Common.String.Format("{0}.{1}", eventName, eventNamespace);
            };
            return Event;
        }());
        ControlUtils.Event = Event;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Hit target helper methods.
        */
        var HitTarget = /** @class */ (function () {
            function HitTarget() {
            }
            /**
             * Checks if the hit target is already created
             * @param container - the container received from the control framework
             * @param hitTargetClassSelector - CSS selector for the hit target class
             * @returns truth value
             */
            HitTarget.exists = function (container, hitTargetClassSelector) {
                return container.find(hitTargetClassSelector).length > 0;
            };
            /**
             * Creates a hit target around the control
             * @param container - the container received from the control framework
             * @param controlDomElement - the control's host element
             * @param hitTargetClass - the class containing control specific styles
             * @param trackElementClassSelector - the CSS selector that identifies the track element, e.g., actual slider bar
             * @param min - the mimimum value supported by the control
             * @param max - the maximum value supported by the control
             * @param paddingLeftPx - the offset from the container's left border
             * @param setControlValue - delegate that sets the control's value
             */
            HitTarget.create = function (container, controlDomElement, hitTargetClass, trackElementClassSelector, paddingLeftPx, min, max, setControlValue) {
                if (max < min) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException("Expected max to be bigger then min");
                }
                controlDomElement.wrap('<div class="' + hitTargetClass + '"/>');
                var controlNumericRange = max - min;
                var hitTargetElement = container.find("." + hitTargetClass);
                var setValue = function (event) {
                    // get the control's coordinates (offset from 0,0) on page
                    var offset = container.find(trackElementClassSelector).offset();
                    var width = controlDomElement.width();
                    var height = controlDomElement.height();
                    var isClickOutsideControlHeight = event.pageY < offset.top || event.pageY > (offset.top + height);
                    if (!isClickOutsideControlHeight) {
                        return;
                    }
                    var isClickInsideContainer = $(event.target).hasClass(controlDomElement[0].className) || $(event.target).hasClass(hitTargetClass);
                    if (!isClickInsideContainer) {
                        return;
                    }
                    // calculate the click's displacement on the x-axis, relative to the control's width
                    var xAxisDisplacementPercent = Math.abs(((event.pageX + paddingLeftPx) - offset.left)) / width;
                    // guard against clicks outside the control's width
                    if (xAxisDisplacementPercent <= 1) {
                        // calculate new value to set on the control and round it up
                        var newValue = ControlUtils.NumericInterval.trunc(min + (controlNumericRange * xAxisDisplacementPercent));
                        setControlValue(newValue);
                    }
                    if (event.type === MktSvcCommon.EventConstants.PointerDown) {
                        // Prevent mouse users from editing the control all the time if they lift the mouse button while not over the hit target.)
                        $(document).on(HitTarget.mouseUpHitTargetEventName, function (e) {
                            // This should only be triggered for users using the mouse in the app (Windows app or Android using mouse)
                            HitTarget.removeHitTargetSubsequentEvents(hitTargetElement);
                        });
                        // Enable further events (pointermove, pointerup)
                        hitTargetElement.on(HitTarget.subsequentEvents, setValue);
                    }
                    else if (event.type === MktSvcCommon.EventConstants.PointerUp) {
                        // If the pointer up event has fired (within the container), it means the mouseup event is not needed and that the user finished a set of interactions.
                        HitTarget.removeHitTargetSubsequentEvents(hitTargetElement);
                    }
                };
                hitTargetElement.on(HitTarget.initialEvents, setValue);
                hitTargetElement.on(MktSvcCommon.EventConstants.TouchEnd, function (event) {
                    // If the touch end event has fired (within or outside of the container), it means the mouseup event is not needed, as the user isn't using a mouse.
                    HitTarget.removeHitTargetSubsequentEvents(hitTargetElement);
                });
            };
            HitTarget.removeHitTargetSubsequentEvents = function (hitTargetElement) {
                $(document).off(HitTarget.mouseUpHitTargetEventName);
                hitTargetElement.off(HitTarget.subsequentEvents);
            };
            HitTarget.initialEvents = "click pointerdown";
            HitTarget.subsequentEvents = "pointermove pointerup";
            HitTarget.mouseUpHitTargetEventName = "mouseup.HitTarget";
            return HitTarget;
        }());
        ControlUtils.HitTarget = HitTarget;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils_1) {
        "use strict";
        var ControlUtils = MktSvc.Controls.Common;
        /**
        * Helper methods for numeric interval controls.
        */
        var NumericInterval = /** @class */ (function () {
            function NumericInterval() {
            }
            /**
             * Checks the parameters in the property bag for null values.
             * @param context object passed by the infra
             * @param hasStep boolean flag
             */
            NumericInterval.throwIfNullDataBagParameters = function (context, hasStep) {
                if (hasStep === void 0) { hasStep = true; }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters.value)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "value"));
                }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters.value.attributes.MinValue)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "value.attributes.MinValue"));
                }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters.value.attributes.MaxValue)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "value.attributes.MaxValue"));
                }
                if (hasStep && ControlUtils.Object.isNullOrUndefined(context.parameters.step)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "step"));
                }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters.min)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "min"));
                }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters.max)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException(ControlUtils.String.Format(MktSvcCommon.CommonControl.InvalidDataBagKeyFormat, "max"));
                }
            };
            /**
             * Process the property bag values (set default values, gracefully handle customization error scenarios).
             * @param context object passed by the infra
             * @param notificationHandler object
             * @param hasStep boolean flag
             * @param roundValues boolean flag
             */
            NumericInterval.processPropertyBagValues = function (context, notificationHandler, roundValues) {
                if (roundValues === void 0) { roundValues = true; }
                if (ControlUtils.Object.isNullOrUndefined(context.parameters)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException("Expected context.parameters object");
                }
                var min = context.parameters.min;
                var max = context.parameters.max;
                var value = context.parameters.value;
                var step = context.parameters.step;
                var hasStep = !ControlUtils.Object.isNullOrUndefined(step);
                if (ControlUtils.Object.isNullOrUndefined(notificationHandler)) {
                    MktSvcCommon.ErrorHandling.ExceptionHandler.throwException("Expected notificationHandler object");
                }
                notificationHandler.clear(MktSvcCommon.ErrorHandling.ErrorCode.ValueOutOfRangeId);
                if (ControlUtils.Object.isNullOrUndefined(min.raw)) {
                    min.raw = context.parameters.value.attributes.MinValue;
                }
                if (ControlUtils.Object.isNullOrUndefined(max.raw)) {
                    max.raw = context.parameters.value.attributes.MaxValue;
                }
                // swap min / max if wrongly set by the customizer
                if (max.raw < min.raw) {
                    var swap = max.raw;
                    max.raw = min.raw;
                    min.raw = swap;
                }
                // the error flag is set whenever the bound property is outside the range [attributes.minValue, attributes.maxValue]
                if (ControlUtils.Object.isNullOrUndefined(value.raw) || value.error == true) {
                    value.raw = min.raw;
                }
                if (hasStep && ControlUtils.Object.isNullOrUndefined(step.raw)) {
                    step.raw = NumericInterval.StepDefaultValue;
                }
                if (roundValues) {
                    min.raw = Math.round(min.raw);
                    max.raw = Math.round(max.raw);
                    value.raw = Math.round(value.raw);
                    if (hasStep) {
                        step.raw = Math.round(step.raw);
                    }
                }
                if (hasStep && (step.raw > (max.raw - min.raw) || (step.raw <= 0) || (value.raw % step.raw !== 0))) {
                    step.raw = NumericInterval.StepDefaultValue;
                }
                if (value.raw < min.raw || value.raw > max.raw) {
                    var messageFormat = context.resources.getString(MktSvcCommon.ErrorHandling.ErrorCode.ValueOutOfRangeId);
                    var message = ControlUtils.String.Format(messageFormat, min.raw, max.raw);
                    notificationHandler.notify(message, MktSvcCommon.ErrorHandling.ErrorCode.ValueOutOfRangeId);
                }
            };
            /**
             * Return a optional number propery
             * @param value the raw value
             * @returns a number property.
             */
            NumericInterval.createOptionalNumberPropery = function (value) {
                return {
                    raw: value,
                    type: "Optional",
                    error: null,
                    attributes: null,
                    errorMessage: null
                };
            };
            /**
             * Move the value to its correct step.
             * @param value the raw value
             * @param context the databag
             * @returns the new value
             */
            NumericInterval.moveValueToMultipleOfStep = function (value, context) {
                if (Math.abs(value - context.parameters.min.raw) % context.parameters.step.raw !== 0 && value !== context.parameters.max.raw) {
                    var stepsAfterMinimum = Math.floor(Math.abs(value - context.parameters.min.raw) / context.parameters.step.raw);
                    if (isNaN(stepsAfterMinimum)) {
                        stepsAfterMinimum = 0;
                    }
                    value = context.parameters.min.raw + stepsAfterMinimum * context.parameters.step.raw;
                    if (value > context.parameters.max.raw) {
                        value = context.parameters.max.raw;
                    }
                }
                return value;
            };
            /**
             * Gets the formatted value of the numeric control
             * @param value the NumberProperty object from the context
             * @returns the formatted value as a string
             */
            NumericInterval.getFormattedValue = function (value) {
                var formattedValue = value.formatted;
                if (ControlUtils.Object.isNullOrUndefined(formattedValue)
                    || ControlUtils.String.isNullOrWhitespace(formattedValue)) {
                    var rawValue = value.raw;
                    formattedValue = !ControlUtils.Object.isNullOrUndefined(rawValue) ? rawValue.toString() : ControlUtils.String.Empty;
                }
                return formattedValue;
            };
            /**
            * Checks whether the formatted value is a percentage
            * @param formattedValue string
            * @remarks Wijmo does not accept a custom percentage symbol so we need to adhere to the default % symbol.
            */
            NumericInterval.isPercent = function (formattedValue) {
                return !ControlUtils.Object.isNullOrUndefined(formattedValue) && formattedValue.indexOf('%') > -1;
            };
            /**
            * Handles the behavior of the value container for numeric controls.
            * @param container for holding the value
            * @param control value as string
            */
            NumericInterval.setValueContainer = function (container, value) {
                var jqueryContainer = $(container);
                jqueryContainer.show();
                jqueryContainer.text(value);
            };
            /**
            * Gets the precision property
            * @remarks The precision is only present for decimals and currencies. Thus, we weakly type the attributes to reach this value.
            * @param property of type Mscrm.NumberProperty (weakly typed)
            * @returns precision attribute as a number
            */
            NumericInterval.getPrecision = function (property) {
                return property.attributes.Precision;
            };
            /**
            * Checks if the supplied parameter si a number
            * @param value the value that needs to checked
            * @returns true if the parameter is a number, false otherwise
            */
            NumericInterval.isNumber = function (value) {
                return !ControlUtils.Object.isNullOrUndefined(value) && typeof (value) == 'number';
            };
            /**
            * Returns the integral part of a number by removing any fractional digits
            * @param x a number
            */
            NumericInterval.trunc = function (x) {
                return x < 0 ? Math.ceil(x) : Math.floor(x);
            };
            /**
            * Checks to see if the value is a finite number.
            * @returns true if the parameter is a valid number, false otherwise
            */
            NumericInterval.isNumeric = function (value) {
                return !isNaN(value) && isFinite(value);
            };
            NumericInterval.StepDefaultValue = 1;
            return NumericInterval;
        }());
        ControlUtils_1.NumericInterval = NumericInterval;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Object helper methods.
        */
        var Property = /** @class */ (function () {
            function Property() {
            }
            /**
             * Checks if the bound property is null.
             * @param property The control specific bound property
             * @returns true if the bound property is null, false otherwise.
             */
            Property.isNullOrEmpty = function (property) {
                return MktSvc.Controls.Common.Object.isNullOrUndefined(property)
                    || MktSvc.Controls.Common.Object.isNullOrUndefined(property.raw)
                    || MktSvc.Controls.Common.String.isNullOrEmpty(property.raw);
            };
            return Property;
        }());
        ControlUtils.Property = Property;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var HtmlEncode = /** @class */ (function () {
        function HtmlEncode() {
        }
        HtmlEncode.encode = function (sourceString) {
            return $('<div>').text(sourceString).html();
        };
        return HtmlEncode;
    }());
    MktSvcCommon.HtmlEncode = HtmlEncode;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    /**
     * The full screen helper uses the HTML5 Fullscreen API to enable full screen rendering of HTML elements
     */
    var FullscreenHelper = /** @class */ (function () {
        function FullscreenHelper() {
        }
        Object.defineProperty(FullscreenHelper, "supportsFullscreenApi", {
            /**
             * Checks if a browser supports the HTML5 Fullscreen API.
             */
            get: function () {
                var apiTarget = document;
                return apiTarget.fullscreenEnabled ||
                    apiTarget.webkitFullscreenEnabled ||
                    apiTarget.mozFullScreenEnabled ||
                    apiTarget.msFullscreenEnabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FullscreenHelper, "fullscreenElement", {
            /**
             * Gets the current full screen element using the HTML5 Fullscreen API.
             */
            get: function () {
                var apiTarget = document;
                return apiTarget.fullscreenElement ||
                    apiTarget.webkitFullscreenElement ||
                    apiTarget.mozFullScreenElement ||
                    apiTarget.msFullscreenElement;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Requests an element to go full screen using the HTML5 Fullscreen API.
         * @param fullscreenTarget The element which to display full screen.
         */
        FullscreenHelper.requestFullscreen = function (fullscreenTarget) {
            if (fullscreenTarget.requestFullscreen) {
                fullscreenTarget.requestFullscreen();
            }
            else if (fullscreenTarget.webkitRequestFullscreen) {
                fullscreenTarget.webkitRequestFullscreen();
            }
            else if (fullscreenTarget.mozRequestFullScreen) {
                fullscreenTarget.mozRequestFullScreen();
            }
            else if (fullscreenTarget.msRequestFullscreen) {
                fullscreenTarget.msRequestFullscreen();
            }
        };
        /**
         * Requests an element to go full screen using styling.
         * @param fullscreenTarget The element which to display full screen.
         */
        FullscreenHelper.requestFullscreenUsingStyling = function (fullscreenTarget) {
            $(fullscreenTarget).css("width", "100vw");
            $(fullscreenTarget).css("height", "100vh");
            $(fullscreenTarget).css("overflow", "visible !important");
            $(fullscreenTarget).css("position", "fixed !important");
            $(fullscreenTarget).css("top", "0px");
            $(fullscreenTarget).css("left", "0px");
            $(fullscreenTarget).css("background-color", "#000000");
        };
        /**
         * Removes the element currently occupying the full screen from the full screen using the HTML5 Fullscreen API.
         */
        FullscreenHelper.exitFullscreen = function () {
            var apiTarget = document;
            if (apiTarget.exitFullscreen) {
                apiTarget.exitFullscreen();
            }
            else if (apiTarget.webkitExitFullscreen) {
                apiTarget.webkitExitFullscreen();
            }
            else if (apiTarget.mozCancelFullScreen) {
                apiTarget.mozCancelFullScreen();
            }
            else if (apiTarget.msExitFullscreen) {
                apiTarget.msExitFullscreen();
            }
        };
        /**
         * Removes an element from occupying the full screen using styling.
         * @param fullscreenTarget The element which to remove from the full screen.
         */
        FullscreenHelper.exitFullscreenUsingStyling = function (fullscreenTarget) {
            $(fullscreenTarget).css("width", "");
            $(fullscreenTarget).css("height", "");
            $(fullscreenTarget).css("overflow", "");
            $(fullscreenTarget).css("position", "");
            $(fullscreenTarget).css("top", "");
            $(fullscreenTarget).css("left", "");
            $(fullscreenTarget).css("background-color", "");
        };
        return FullscreenHelper;
    }());
    MktSvcCommon.FullscreenHelper = FullscreenHelper;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    /**
     * Current sort status of a data set column
     */
    var DataSetColumnSortStatus = /** @class */ (function () {
        function DataSetColumnSortStatus() {
        }
        return DataSetColumnSortStatus;
    }());
    MktSvcCommon.DataSetColumnSortStatus = DataSetColumnSortStatus;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    /**
    * An expression used to represent a filter condition.
    */
    var ConditionExpression = /** @class */ (function () {
        function ConditionExpression() {
        }
        return ConditionExpression;
    }());
    MktSvcCommon.ConditionExpression = ConditionExpression;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    /**
    * An expression used to represent a filter.
    */
    var FilterExpression = /** @class */ (function () {
        function FilterExpression() {
        }
        return FilterExpression;
    }());
    MktSvcCommon.FilterExpression = FilterExpression;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var PrimitiveValue = /** @class */ (function () {
        function PrimitiveValue(value, dataType) {
            this.value = value;
            this.dataType = dataType;
        }
        return PrimitiveValue;
    }());
    MktSvcCommon.PrimitiveValue = PrimitiveValue;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Globalization;
    (function (Globalization) {
        "use strict";
        /**
        * Exposes type names used by the CRM infrastructure.
        */
        var CrmNumberType = /** @class */ (function () {
            function CrmNumberType() {
            }
            CrmNumberType.CrmDecimalTypeName = "decimal";
            CrmNumberType.CrmDoubleTypeName = "double";
            CrmNumberType.CrmIntegerTypeName = "integer";
            CrmNumberType.CrmMoneyTypeName = "money";
            return CrmNumberType;
        }());
        Globalization.CrmNumberType = CrmNumberType;
    })(Globalization = MktSvcCommon.Globalization || (MktSvcCommon.Globalization = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Globalization;
    (function (Globalization) {
        "use strict";
        var ExceptionHandler = MktSvcCommon.ErrorHandling.ExceptionHandler;
        /**
        * Number format pattern factory class. This class performs the mappings from .NET-compatible values to string number patterns.
        */
        var NumberPatternFactory = /** @class */ (function () {
            function NumberPatternFactory() {
                this.currencyPositivePatternArray = ["$n", "n$", "$ n", "n $"];
                this.currencyNegativePatternArray = ["($n)", "-$n", "$-n", "$n-", "(n$)", "-n$", "n-$", "n$-", "-n $", "-$ n", "n $-", "$ n-", "$ -n", "n- $", "($ n)", "(n $)"];
                this.percentPositivePatternArray = ["n %", "n%", "%n", "% n"];
                this.percentNegativePatternArray = ["-n %", "-n%", "-%n", "%-n", "%n-", "n-%", "n%-", "-% n", "n %-", "% n-", "% -n", "n- %"];
            }
            /**
             * Returns the number format pattern having the specified value for currency positive numbers.
             * More info here: https://msdn.microsoft.com/en-us/library/system.globalization.numberformatinfo.currencypositivepattern(v=vs.110).aspx
             * @param patternValue The value of the number formatting pattern. See the documentation above for more info.
             */
            NumberPatternFactory.prototype.getCurrencyPositivePattern = function (patternValue) {
                return this.getPattern(this.currencyPositivePatternArray, patternValue);
            };
            /**
             * Returns the number format pattern having the specified value for currency negative numbers.
             * More info here: https://msdn.microsoft.com/en-us/library/system.globalization.numberformatinfo.currencynegativepattern(v=vs.110).aspx
             * @param patternValue The value of the number formatting pattern. See the documentation above for more info.
             */
            NumberPatternFactory.prototype.getCurrencyNegativePattern = function (patternValue) {
                return this.getPattern(this.currencyNegativePatternArray, patternValue);
            };
            /**
             * Returns the number format pattern having the specified value for currency positive numbers.
             * More info here: https://msdn.microsoft.com/en-us/library/system.globalization.numberformatinfo.percentpositivepattern(v=vs.110).aspx
             * @param patternValue The value of the number formatting pattern. See the documentation above for more info.
             */
            NumberPatternFactory.prototype.getPercentPositivePattern = function (patternValue) {
                return this.getPattern(this.percentPositivePatternArray, patternValue);
            };
            /**
             * Returns the number format pattern having the specified value for currency positive numbers.
             * More info here: https://msdn.microsoft.com/en-us/library/system.globalization.numberformatinfo.percentnegativepattern(v=vs.110).aspx
             * @param patternValue The value of the number formatting pattern. See the documentation above for more info.
             */
            NumberPatternFactory.prototype.getPercentNegativePattern = function (patternValue) {
                return this.getPattern(this.percentNegativePatternArray, patternValue);
            };
            NumberPatternFactory.prototype.getPattern = function (patternArray, patternValue) {
                if (patternValue < 0 || patternValue >= patternArray.length) {
                    ExceptionHandler.throwException(MktSvc.Controls.Common.String.Format(NumberPatternFactory.NoSuchPatternError, patternValue));
                }
                return patternArray[patternValue];
            };
            NumberPatternFactory.NoSuchPatternError = "The number formatting pattern value that you specified does not exist: {0}.";
            return NumberPatternFactory;
        }());
        Globalization.NumberPatternFactory = NumberPatternFactory;
    })(Globalization = MktSvcCommon.Globalization || (MktSvcCommon.Globalization = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/**
 * Please read carefully and thoroughly when adding a new file in the CommonControl's CommonReferences.
 *
 * DO NOT reference control/library-specific .ts files in this file.
 * Each control project should be self-contained as far as references go.
 * ONLY add libraries and control files that you want in ALL controls.
 * Make sure to add internal project references to each project's PrivateReferences.ts file.
 */
/// <reference path="errorhandling/errorcode.ts" />
/// <reference path="errorhandling/notificationhandler.ts" />
/// <reference path="errorhandling/exceptionhandler.ts" />
/// <reference path="Mscrm/UpdateEvents.ts" />
/// <reference path="attributeconstants.ts" />
/// <reference path="assistEdit/iassisteditchildcontrol.ts" />
/// <reference path="assistEdit/iassisteditcontainerrenderer.ts" />
/// <reference path="assistEdit/IAssistEdit.ts" />
/// <reference path="assistEdit/IInputAssistEdit.ts" />
/// <reference path="assistEdit/IInputAssistEditFactory.ts" />
/// <reference path="assistEdit/IAssistEditBlockCleaner.ts" />
/// <reference path="assistEdit/AssistEditEventConstants.ts" />
/// <reference path="assistEdit/AssistEditConstants.ts" />
/// <reference path="assistEdit/IAssistEditCommandFactory.ts" />
/// <reference path="assistEdit/AssistEditInputSpanRenderer.ts" />
/// <reference path="SelectionManager.ts"/>
/// <reference path="controlstate.ts" />
/// <reference path="control.ts" />
/// <reference path="fieldcontrolbase.ts" />
/// <reference path="eventconstants.ts" />
/// <reference path="eventguard.ts" />
/// <reference path="eventargs/AssistEditItemSelectedEventArgs.ts" />
/// <reference path="eventargs/imageselectedeventparameter.ts" />
/// <reference path="NotificationHelper/NotificationHelper.ts"/>
/// <reference path="NotificationHelper/INotificationHelper.ts"/>
/// <reference path="methodconstants.ts" />
/// <reference path="utils/customcontrolevent.ts" />
/// <reference path="utils/enum.ts" />
/// <reference path="utils/event.ts" />
/// <reference path="utils/hittarget.ts" />
/// <reference path="utils/numericinterval.ts" />
/// <reference path="utils/property.ts" />
/// <reference path="utils/HtmlEncode.ts" />
/// <reference path="fullscreenhelper.ts" />
/// <reference path="DataSetColumnSortStatus.ts"/>
/// <reference path="ConditionExpression.ts"/>
/// <reference path="FilterExpression.ts"/>
/// <reference path="PrimitiveValue.ts"/>
/// <reference path="globalization/crmnumbertype.ts" />
/// <reference path="globalization/numberpatternfactory.ts" />
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        var AssistEditConstants = /** @class */ (function () {
            function AssistEditConstants() {
            }
            AssistEditConstants.assistEditInputSpanClassName = 'assistEditInput';
            AssistEditConstants.assistEditActivePlaceholder = "assistEditActivePlaceholder";
            AssistEditConstants.assistEditInputWrapperClassName = 'assistEditInputWrapper';
            AssistEditConstants.assistEditSelectedTextContainer = 'assistEditSelectedTextContainer';
            AssistEditConstants.assistEditContainerClassName = 'assistEditContainer';
            AssistEditConstants.assistEditEmptyPlaceholderClassName = 'assistEditEmptyPlaceholder';
            AssistEditConstants.assistEditListBoxClassName = 'assistEditListBox';
            return AssistEditConstants;
        }());
        AssistEdit.AssistEditConstants = AssistEditConstants;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        var AssistEditControlCallback = /** @class */ (function () {
            function AssistEditControlCallback() {
            }
            return AssistEditControlCallback;
        }());
        AssistEdit.AssistEditControlCallback = AssistEditControlCallback;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        var String = MktSvc.Controls.Common.String;
        var exclusionEntityTypeFilterConst = "exclusionEntityTypeFilter";
        var entityTypeFilterConst = "entityTypeFilter";
        var entityRecordFilterConst = "entityRecordFilter";
        var AssistEditChildControl = /** @class */ (function () {
            /**
             * Initializes a new instance of AssistEditChildControl
             */
            function AssistEditChildControl(context, assistEditSource, assistEditContainerRenderer, parameterProvider) {
                this.context = context;
                this.parameterProvider = parameterProvider;
                this.assistEditSource = assistEditSource;
                this.assistEditContainerRenderer = assistEditContainerRenderer;
            }
            /**
             * Configure the AssistEditChildControl with the event broker.
             * @param emailEventBroker The email Event Broker
             */
            AssistEditChildControl.prototype.setup = function (assistEditChildControlCallbacks) {
                this.onFinalItemSelected = assistEditChildControlCallbacks.finalItemSelectedCallback;
                this.onItemSelected = assistEditChildControlCallbacks.itemSelectedCallback;
                this.onOptionFocused = assistEditChildControlCallbacks.optionFocusedCallback;
                this.onlistBoxFocusOut = assistEditChildControlCallbacks.listBoxFocusOutCallback;
            };
            /**
             * Creates the Assist Edit custom control
             */
            AssistEditChildControl.prototype.open = function (container, initialValue, listBoxId) {
                this.currentDocument = container[0].ownerDocument;
                this.assistEditControlId = MktSvc.Controls.Common.ControlGuidGenerator.newGuid("assist_edit");
                // Append the assist edit container to the input
                var assistEditContainer = this.assistEditContainerRenderer.render(container);
                assistEditContainer.attr('id', this.assistEditControlId);
                this.context.utils.bindDOMElement(this.generateChildAssistEditControl(initialValue, listBoxId), assistEditContainer[0]);
            };
            /**
             * Update the Assist Edit custom control
             */
            AssistEditChildControl.prototype.update = function (value) {
                if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.updateAssistEditCallback)) {
                    this.updateAssistEditCallback(value);
                }
            };
            /**
             * Trigger assist edit list box keydown event
             */
            AssistEditChildControl.prototype.keydown = function (event) {
                if (!MktSvc.Controls.Common.Object.isNullOrUndefined(this.assistEditKeydownCallback)) {
                    this.assistEditKeydownCallback(event);
                }
            };
            /**
             * Generate an assist edit control
             * @returns an assist edit control
             */
            AssistEditChildControl.prototype.generateChildAssistEditControl = function (initialValue, listBoxId) {
                var dynamicSource = this.parameterProvider.getDataSetParameter(this.assistEditSource, MktSvcCommon.EntityConstants.dynamicContentMetadataTableName);
                var exclusionEntityTypeFilter = this.context.parameters.hasOwnProperty(exclusionEntityTypeFilterConst)
                    ? this.parameterProvider.getFalseBoundParameter(this.context.parameters[exclusionEntityTypeFilterConst].raw)
                    : this.parameterProvider.getFalseBoundParameter(String.Empty);
                var entityTypeFilter = this.context.parameters.hasOwnProperty(entityTypeFilterConst)
                    ? this.parameterProvider.getFalseBoundParameter(this.context.parameters[entityTypeFilterConst].raw)
                    : this.parameterProvider.getFalseBoundParameter(String.Empty);
                var entityRecordFilter = this.context.parameters.hasOwnProperty(entityRecordFilterConst)
                    ? this.parameterProvider.getFalseBoundParameter(this.context.parameters[entityRecordFilterConst].raw)
                    : this.parameterProvider.getFalseBoundParameter(String.Empty);
                var listBoxIdParameter = this.parameterProvider.getInputParameter(listBoxId);
                var properties = {
                    id: this.assistEditControlId,
                    key: this.assistEditControlId,
                    parameters: {
                        dynamicSource: dynamicSource,
                        exclusionEntityTypeFilter: exclusionEntityTypeFilter,
                        entityTypeFilter: entityTypeFilter,
                        entityRecordFilter: entityRecordFilter,
                        listBoxId: listBoxIdParameter
                    },
                    childeventlisteners: this.generateChildListeners(initialValue)
                };
                return this.context.factory.createComponent("MscrmControls.AssistEditControl.AssistEditControl", this.assistEditControlId, properties);
            };
            /**
            * Generate a child listeners' list
            * @returns the child listeners
            */
            AssistEditChildControl.prototype.generateChildListeners = function (initialValue) {
                var _this = this;
                var finalItemSelectedHandler = function (args) { _this.onAssistEditItemSelected(args); };
                var itemSelectedHandler = function (args) { _this.onItemSelected(args); };
                var optionFocusedHandler = function (args) { _this.onOptionFocused(args); };
                var onlistBoxFocusOutHandler = function () { _this.onlistBoxFocusOut(); };
                var initCompleteHandler = function (args) {
                    _this.updateAssistEditCallback = args.updateCallback;
                    _this.assistEditKeydownCallback = args.keydownCallback;
                    _this.updateAssistEditCallback(initialValue);
                };
                var onFinalItemSelected = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.finalItemSelected,
                    eventhandler: finalItemSelectedHandler
                };
                var onItemSelected = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.itemSelected,
                    eventhandler: itemSelectedHandler
                };
                var onInitComplete = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.initComplete,
                    eventhandler: initCompleteHandler
                };
                var onOptionFocused = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.optionFocused,
                    eventhandler: optionFocusedHandler
                };
                var onlistBoxFocusOut = {
                    eventname: AssistEdit.AssistEditEventConstants.assistEditListboxFocusout,
                    eventhandler: onlistBoxFocusOutHandler
                };
                return [onFinalItemSelected, onItemSelected, onInitComplete, onOptionFocused, onlistBoxFocusOut];
            };
            AssistEditChildControl.prototype.onAssistEditItemSelected = function (parameters) {
                this.assistEditControlCallback(parameters.value);
                this.dispose();
            };
            AssistEditChildControl.prototype.dispose = function () {
                this.context.utils.unbindDOMComponent(this.assistEditControlId);
                this.assistEditContainerRenderer.dispose();
            };
            /**
             * The callback that notifies Email Editor the assist edit item was selected
             * @param selectedValue The selected value returned by the assist edit
             */
            AssistEditChildControl.prototype.assistEditControlCallback = function (selectedValue) {
                var eventArgs = new MktSvcCommon.EventArgs.AssistEditItemSelectedEventArgs();
                eventArgs.value = selectedValue;
                this.onFinalItemSelected(eventArgs);
            };
            return AssistEditChildControl;
        }());
        AssistEdit.AssistEditChildControl = AssistEditChildControl;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
        var AssistEditChildControlFactory = /** @class */ (function () {
            function AssistEditChildControlFactory() {
            }
            AssistEditChildControlFactory.prototype.create = function (context, assistEditSource, assistEditContainerRenderer, parameterProvider) {
                return new AssistEdit.AssistEditChildControl(context, assistEditSource, assistEditContainerRenderer, parameterProvider);
            };
            return AssistEditChildControlFactory;
        }());
        AssistEdit.AssistEditChildControlFactory = AssistEditChildControlFactory;
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var AssistEdit;
    (function (AssistEdit) {
        "use strict";
    })(AssistEdit = MktSvcCommon.AssistEdit || (MktSvcCommon.AssistEdit = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var LocalCrmWebResourcesPathProvider = /** @class */ (function () {
        function LocalCrmWebResourcesPathProvider(clientBaseUrl, webResourceRootNamespace, controlFolder, cachePathFragmentExtractor) {
            this.clientBaseUrl = clientBaseUrl;
            this.webResourceRootNamespace = webResourceRootNamespace;
            this.controlFolder = controlFolder;
            this.cachePathFragmentExtractor = cachePathFragmentExtractor;
        }
        LocalCrmWebResourcesPathProvider.prototype.getLocalCrmWebResourcesPath = function () {
            var optionalCachePath = this.cachePathFragmentExtractor.tryExtractCachePathFragment();
            var urlBuilder = new MktSvc.Controls.Common.UrlBuilder(this.clientBaseUrl);
            if (optionalCachePath != null && optionalCachePath.length > 0) {
                urlBuilder = urlBuilder.appendSubPath(optionalCachePath);
            }
            urlBuilder = urlBuilder
                .appendSubPath("WebResources")
                .appendSubPath(this.webResourceRootNamespace)
                .appendSubPath(this.controlFolder);
            return urlBuilder.build();
        };
        return LocalCrmWebResourcesPathProvider;
    }());
    MktSvcCommon.LocalCrmWebResourcesPathProvider = LocalCrmWebResourcesPathProvider;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var LocalConfigurationProvider = /** @class */ (function () {
        function LocalConfigurationProvider(localCrmWebResourcesPathProvider) {
            this.localCrmWebResourcesPathProvider = localCrmWebResourcesPathProvider;
        }
        LocalConfigurationProvider.prototype.getControlConfiguration = function (callback) {
            var controlRoot = this.localCrmWebResourcesPathProvider.getLocalCrmWebResourcesPath();
            callback(controlRoot, "");
        };
        return LocalConfigurationProvider;
    }());
    MktSvcCommon.LocalConfigurationProvider = LocalConfigurationProvider;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var CdnEnabledControlConfigProvider = /** @class */ (function () {
        function CdnEnabledControlConfigProvider(controlFolder, cdnConfigurationService, localCrmWebResourcesPathProvider) {
            this.controlFolder = controlFolder;
            this.cdnConfigurationService = cdnConfigurationService;
            this.localCrmWebResourcesPathProvider = localCrmWebResourcesPathProvider;
        }
        CdnEnabledControlConfigProvider.prototype.getControlConfiguration = function (callback) {
            var _this = this;
            this.cdnConfigurationService.loadCdnConfiguration(function (result) {
                var cdnEnabled = result.CdnEnabled;
                var controlRoot;
                if (cdnEnabled === "true") {
                    var urlBuilder = new MktSvc.Controls.Common.UrlBuilder(result.PublicAssetsCdn);
                    controlRoot = urlBuilder
                        .appendSubPath(_this.controlFolder)
                        .build();
                }
                else {
                    controlRoot = _this.localCrmWebResourcesPathProvider.getLocalCrmWebResourcesPath();
                }
                callback(controlRoot, result.PublicAssetsCdn);
            });
        };
        return CdnEnabledControlConfigProvider;
    }());
    MktSvcCommon.CdnEnabledControlConfigProvider = CdnEnabledControlConfigProvider;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var CdnConfigurationService = /** @class */ (function () {
        function CdnConfigurationService(crmUrlBase, ajaxHelper, logger) {
            this.crmUrlBase = crmUrlBase;
            this.ajaxHelper = ajaxHelper;
            this.logger = logger;
        }
        CdnConfigurationService.prototype.loadCdnConfiguration = function (successCallback, failureCallback) {
            var _this = this;
            if (CdnConfigurationService.CdnConfiguration != null) {
                successCallback(CdnConfigurationService.CdnConfiguration);
                return;
            }
            var configurationUrl = this.resolveUrl(CdnConfigurationService.CdnConfigurationEntityPluralName);
            this.ajaxHelper.GetRequest(configurationUrl, function (response) {
                try {
                    var parsedData = JSON.parse(response);
                    if (parsedData.value.length === 0) {
                        throw Error("Cdn configuration settings info is missing.");
                    }
                    var recordData = parsedData.value[0];
                    var result = {
                        CdnEnabled: recordData.msdyncrm_cdnenabled,
                        PublicAssetsCdn: recordData.msdyncrm_publicassetscdn
                    };
                    CdnConfigurationService.CdnConfiguration = result;
                    successCallback(result);
                }
                catch (ex) {
                    if (typeof failureCallback !== "undefined") {
                        failureCallback(ex);
                        return;
                    }
                    successCallback(CdnConfigurationService.DefaultCdnConfiguration);
                    _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.CdnConfigurationService", ex, new MktSvc.Controls.Common.Dictionary((_a = {},
                        _a[MktSvc.Controls.Common.ParameterKeys.ErrorMessage] = "Error parsing cdn configuration.",
                        _a)));
                }
                var _a;
            }, function (response) {
                if (typeof failureCallback !== "undefined") {
                    failureCallback(response);
                    return;
                }
                successCallback(CdnConfigurationService.DefaultCdnConfiguration);
                _this.logger.log(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.CdnConfigurationService", new MktSvc.Controls.Common.Dictionary((_a = {},
                    _a[MktSvc.Controls.Common.ParameterKeys.ErrorMessage] = "Error loading cdn configuration",
                    _a[MktSvc.Controls.Common.ParameterKeys.ErrorDetails] = response,
                    _a)));
                var _a;
            });
        };
        CdnConfigurationService.prototype.resolveUrl = function (entity) {
            var entityRecordUrlBuilder = new MktSvc.Controls.Common.EntityRecordUrlBuilder(this.crmUrlBase, CdnConfigurationService.CdnConfigurationEntityPluralName);
            var attributes = ["msdyncrm_cdnenabled", "msdyncrm_publicassetscdn"];
            entityRecordUrlBuilder.setSelectedFields(attributes);
            return entityRecordUrlBuilder.build();
        };
        CdnConfigurationService.CdnConfigurationEntityPluralName = "msdyncrm_cdnconfigurations";
        CdnConfigurationService.CdnConfiguration = null;
        // used for workaround in case Configuration settings is empty
        // cdnEnabled = false means the CdnEnabledControlConfigProvider will load the static resoruces
        CdnConfigurationService.DefaultCdnConfiguration = {
            CdnEnabled: "false",
            PublicAssetsCdn: ""
        };
        return CdnConfigurationService;
    }());
    MktSvcCommon.CdnConfigurationService = CdnConfigurationService;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ConfigElementModel = /** @class */ (function () {
        function ConfigElementModel() {
        }
        return ConfigElementModel;
    }());
    MktSvcCommon.ConfigElementModel = ConfigElementModel;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var OrgConfigKeys = /** @class */ (function () {
        function OrgConfigKeys() {
        }
        OrgConfigKeys.CDNEnabled = "CDNEnabled";
        OrgConfigKeys.CDNRoot = "PublicAssetsCdn";
        return OrgConfigKeys;
    }());
    MktSvcCommon.OrgConfigKeys = OrgConfigKeys;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var OrgConfigNamespaces = /** @class */ (function () {
        function OrgConfigNamespaces() {
        }
        OrgConfigNamespaces.Ui = "Ui";
        OrgConfigNamespaces.Endpoints = "Endpoints";
        return OrgConfigNamespaces;
    }());
    MktSvcCommon.OrgConfigNamespaces = OrgConfigNamespaces;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v9.0 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ControlLoadDecorator = /** @class */ (function () {
        function ControlLoadDecorator(controlName) {
            this.controlName = controlName;
            this.decoratedControl = null;
            this.decoratedControlDeferred = null;
            this.logger = null;
        }
        ControlLoadDecorator.prototype.assertControl = function (asserter) {
        };
        /**
         * Initializes the control. This function will receive the HTML Div element that will contain your custom control
         * as well as a function to notify the infrastructure that your outputs have changed and that it should call getOutputs()
         * @param context The "Input Bag" containing the parameters and other control metadata.
         * @param notifyOutputChanged A Callback to notify the infrastructure to read the outputs
         * @param state The control state.
         * @param container The HTML Element that will contain the control
         */
        ControlLoadDecorator.prototype.init = function (context, notifyOutputChanged, state, container) {
            var _this = this;
            if (!this.logger) {
                this.logger = new MktSvcCommon.Logger.TelemetryLogger("MktSvcCommon.ControlLoadDecorator", context);
            }
            this.controlAsserter = new MktSvc.Controls.Common.LoggerAsserter(this.logger, "MktSvcCommon.ControlLoadDecorator.assertControl", new MktSvc.Controls.Common.Dictionary({ "ControlName": this.controlName }));
            // register logger for ControlLoadDecorator
            var correlationId = MktSvc.Controls.Common.UniqueId.generate();
            var loadControlDependenciesPerfToken = this.logger.getPerfToken();
            this.startDecorateAsync(context, correlationId);
            this.decoratedControlDeferred.done(function (decoratedControl) {
                _this.logPerf("init.loadDependencies", loadControlDependenciesPerfToken, correlationId);
                try {
                    _this.assertControlInternal(correlationId);
                    var initControlPerfToken = _this.logger.getPerfToken();
                    decoratedControl.init(context, notifyOutputChanged, state, container);
                    _this.logPerf("init.initControl", initControlPerfToken, correlationId);
                }
                catch (e) {
                    _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.ControlLoadDecorator.init", e, new MktSvc.Controls.Common.Dictionary({ "ControlName": _this.controlName, "CorrelationId": correlationId }));
                }
            });
        };
        /**
        * Updates the control with data from the a bag of values currently assigned to the control's manifest parameters
        * @param context The bag of values described above
        */
        ControlLoadDecorator.prototype.updateView = function (context) {
            var _this = this;
            this.decoratedControlDeferred.done(function (decoratedControl) {
                try {
                    _this.assertControlInternal();
                    var perfToken = _this.logger.getPerfToken();
                    decoratedControl.updateView(context);
                    _this.logPerf("updateView", perfToken);
                }
                catch (e) {
                    _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.ControlLoadDecorator.updateView", e, new MktSvc.Controls.Common.Dictionary({ "ControlName": _this.controlName }));
                }
            });
        };
        /**
        * @returns The a bag of output values to pass to the infrastructure
        */
        ControlLoadDecorator.prototype.getOutputs = function () {
            if (!this.decoratedControl) {
                this.logger.log(MktSvc.Controls.Common.TraceLevel.Info, "MktSvcCommon.ControlLoadDecorator.getOutputs", new MktSvc.Controls.Common.Dictionary({ "ControlName": this.controlName, Message: "Decorated control is not ready" }));
                throw Error("Decorated control is not ready");
            }
            this.assertControlInternal();
            return this.decoratedControl.getOutputs();
        };
        /**
        * This function destroys the control and cleans up
        */
        ControlLoadDecorator.prototype.destroy = function () {
            var _this = this;
            if (this.decoratedControlDeferred) {
                this.decoratedControlDeferred.done(function (decoratedControl) {
                    try {
                        _this.assertControlInternal();
                        var perfToken = _this.logger.getPerfToken();
                        decoratedControl.destroy();
                        _this.logPerf("destroy", perfToken);
                    }
                    catch (e) {
                        _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.ControlLoadDecorator.destroy", e, new MktSvc.Controls.Common.Dictionary({ "ControlName": _this.controlName }));
                    }
                });
            }
        };
        ControlLoadDecorator.prototype.assertControlInternal = function (correlationId) {
            var perfToken = this.logger.getPerfToken();
            this.assertControl(this.controlAsserter);
            this.logPerf("assertControl", perfToken, correlationId);
        };
        ControlLoadDecorator.prototype.startDecorateAsync = function (context, actionCorrelationId) {
            var _this = this;
            this.decoratedControlDeferred = $.Deferred();
            var controlLoader = this.getControlLoader(context);
            if (!controlLoader) {
                throw Error("ControlLoader not initialized");
            }
            controlLoader.loadControl(this.getScriptDependencies(), this.getStyleSheetDependencies(), this.controlName, actionCorrelationId)
                .done(function (controlLoadResult) {
                _this.decoratedControl = _this.getDecoratedControlInstance(controlLoadResult);
                _this.decoratedControlDeferred.resolve(_this.decoratedControl);
            });
        };
        ControlLoadDecorator.prototype.logPerf = function (method, perfToken, correlationId) {
            var params = { "ControlName": this.controlName };
            if (correlationId != null) {
                params["CorrelationId"] = correlationId;
            }
            this.logger.logPerf(MktSvc.Controls.Common.TraceLevel.Info, "MktSvcCommon.ControlLoadDecorator." + method, perfToken, new MktSvc.Controls.Common.Dictionary(params));
        };
        return ControlLoadDecorator;
    }());
    MktSvcCommon.ControlLoadDecorator = ControlLoadDecorator;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ControlResourcesFolderName;
    (function (ControlResourcesFolderName) {
        ControlResourcesFolderName.staticFiles = "static";
        ControlResourcesFolderName.webResourcesRoot = "msdyncrm_";
        ControlResourcesFolderName.assistEdit = "AssistEditControl";
        ControlResourcesFolderName.customerJourneyDesigner = "CustomerJourneyDesignerControl";
        ControlResourcesFolderName.emailEditor = "EmailEditor";
        ControlResourcesFolderName.formEditor = "FormEditor";
        ControlResourcesFolderName.inputAssistEdit = "InputAssistEditControl";
        ControlResourcesFolderName.leadScoringDesigner = "LeadScoringDesignerControl";
        ControlResourcesFolderName.pageEditor = "PageEditor";
        ControlResourcesFolderName.captcha = "Captcha";
        ControlResourcesFolderName.attributeSelectControl = "AttributeSelectControl";
        ControlResourcesFolderName.attributeMultiSelectControl = "AttributeMultiSelectControl";
        ControlResourcesFolderName.commonResources = "CommonResources";
    })(ControlResourcesFolderName = MktSvcCommon.ControlResourcesFolderName || (MktSvcCommon.ControlResourcesFolderName = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var GalleryImageSelectedEventArgs = /** @class */ (function () {
            function GalleryImageSelectedEventArgs(sourceId) {
                this.sourceId = sourceId;
            }
            return GalleryImageSelectedEventArgs;
        }());
        EventArgs.GalleryImageSelectedEventArgs = GalleryImageSelectedEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ImagePicker;
    (function (ImagePicker) {
        "use strict";
    })(ImagePicker = MktSvcCommon.ImagePicker || (MktSvcCommon.ImagePicker = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ImagePicker;
    (function (ImagePicker) {
        "use strict";
    })(ImagePicker = MktSvcCommon.ImagePicker || (MktSvcCommon.ImagePicker = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
var MktSvcCommon;
(function (MktSvcCommon) {
    var ImagePicker;
    (function (ImagePicker) {
        "use strict";
        var Object = MktSvc.Controls.Common.Object;
        var UniqueId = MktSvc.Controls.Common.UniqueId;
        var ImagePickerCustomControl = /** @class */ (function () {
            /**
             * Initializes a new instance of ImagePickerCustomControl
             * @param context The bag of values currently assigned to the control's manifest parameters
             */
            function ImagePickerCustomControl(context, imagePickerId) {
                this.imagePickerContainerId = "imagePickerContainer";
                this.imagePickerControlId = "imagePickerControl";
                this.imagePickerModalPopupName = "ms-mktsvc-ImagePicker-ModalPopup";
                this.context = context;
                if (!Object.isNullOrUndefined(imagePickerId)) {
                    this.imagePickerId = imagePickerId;
                }
                else {
                    this.imagePickerId = UniqueId.generate();
                }
            }
            /**
             * Configure the ImagePickerCustomControl with the event broker.
             * @param eventBroker The Event Broker
             */
            ImagePickerCustomControl.prototype.setup = function (eventBroker) {
                this.eventBroker = eventBroker;
            };
            /**
             * Creates the Image gallery custom control
             */
            ImagePickerCustomControl.prototype.open = function (containerId) {
                var imagePickerContainer = $("<div>").attr("id", this.imagePickerContainerId);
                this.context.utils.bindDOMElement(this.generateChildImagePickerControlControl(), imagePickerContainer[0]);
                this.showPopup(this.imagePickerModalPopupName, imagePickerContainer);
            };
            /**
             * Returns the image picker identifier
             */
            ImagePickerCustomControl.prototype.getId = function () {
                return this.imagePickerId;
            };
            /**
             * Generate an image picker control
             * @returns an image picker control
             */
            ImagePickerCustomControl.prototype.generateChildImagePickerControlControl = function () {
                var properties = {
                    id: this.imagePickerControlId,
                    key: this.imagePickerControlId,
                    childeventlisteners: this.generateChildListeners(this.context)
                };
                return this.context.factory.createComponent("MscrmControls.ImagePickerControl.ImagePickerControl", this.imagePickerControlId, properties);
            };
            /**
             * Generate a child listeners' list
             * @returns the child listeners
             */
            ImagePickerCustomControl.prototype.generateChildListeners = function (context) {
                var _this = this;
                var handler = function (args) { _this.onImagePickerItemSelected(args); };
                var readToEditFocus = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.itemSelected,
                    eventhandler: handler
                };
                var cancelHandler = function () { _this.eventBroker.notify(MktSvcCommon.EventConstants.GalleryPopupClosed); _this.dispose(); };
                var controlCanceled = {
                    eventname: MktSvcCommon.ControlUtils.CustomControlEvent.controlCanceled,
                    eventhandler: cancelHandler
                };
                return [readToEditFocus, controlCanceled];
            };
            ImagePickerCustomControl.prototype.onImagePickerItemSelected = function (parameters) {
                this.galleryControlCallback(parameters.cdnUrl, parameters.fileId, parameters.fileName);
            };
            /**
             * The callback that notifies the event broker that the image from the gallery was selected
             * @param imageUrl The image URL returned by the image picker
             */
            ImagePickerCustomControl.prototype.galleryControlCallback = function (imageUrl, fileId, fileName) {
                var eventArgs = new MktSvcCommon.EventArgs.GalleryImageSelectedEventArgs(this.imagePickerId);
                eventArgs.imageUrl = imageUrl;
                eventArgs.fileId = fileId;
                eventArgs.fileName = fileName;
                this.eventBroker.notify(MktSvcCommon.EventConstants.GalleryImageSelected, eventArgs);
            };
            /**
             * Creates image gallery popup dialog
             */
            ImagePickerCustomControl.prototype.showPopup = function (popupId, container) {
                this.context.utils.getPopupService().createPopup({
                    name: popupId,
                    popupToOpen: popupId,
                    popupStyle: {
                        "width": "100%",
                        "max-width": "770px",
                        "height": "600px",
                        "display": "block",
                        "margin": "auto",
                        "box-shadow": "0px 0px 9px -1px #CFCDCC",
                        "background-color": "rgba(255, 255, 255, 1)"
                    },
                    shadowStyle: {
                        "position": "fixed",
                        "background-color": "rgba(0, 0, 0, 0.3)",
                        "width": "100%",
                        "height": "100%"
                    },
                    type: 1,
                    content: container[0]
                });
            };
            /**
             * Closes image gallery popup dialog
             */
            ImagePickerCustomControl.prototype.closePopup = function (popupId) {
                this.context.utils.getPopupService().closePopup(popupId);
                this.context.utils.getPopupService().deletePopup(popupId);
            };
            ImagePickerCustomControl.prototype.dispose = function () {
                this.context.utils.unbindDOMComponent(this.imagePickerControlId);
                this.closePopup(this.imagePickerModalPopupName);
            };
            return ImagePickerCustomControl;
        }());
        ImagePicker.ImagePickerCustomControl = ImagePickerCustomControl;
    })(ImagePicker = MktSvcCommon.ImagePicker || (MktSvcCommon.ImagePicker = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
 * @license Copyright (c) Microsoft Corporation.  All rights reserved.
 */
var MktSvcCommon;
(function (MktSvcCommon) {
    var ImagePicker;
    (function (ImagePicker) {
        "use strict";
        var ImagePickerCustomControlFactory = /** @class */ (function () {
            /**
             * Initializes a new instance of ImagePickerCustomControl
             * @param context The bag of values currently assigned to the control's manifest parameters
             */
            function ImagePickerCustomControlFactory(context) {
                this.context = context;
            }
            ImagePickerCustomControlFactory.prototype.create = function (imagePickerId) {
                return new MktSvcCommon.ImagePicker.ImagePickerCustomControl(this.context, imagePickerId);
            };
            return ImagePickerCustomControlFactory;
        }());
        ImagePicker.ImagePickerCustomControlFactory = ImagePickerCustomControlFactory;
    })(ImagePicker = MktSvcCommon.ImagePicker || (MktSvcCommon.ImagePicker = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ControlLoader = /** @class */ (function () {
        function ControlLoader(configProvider, dependencyManager, logger) {
            this.configProvider = configProvider;
            this.dependencyManager = dependencyManager;
            this.logger = logger;
        }
        ControlLoader.prototype.loadControl = function (scriptDependencies, styleSheetsDependencies, controlName, actionCorrelationId) {
            var _this = this;
            var deferred = $.Deferred();
            var configPerfToken = this.logger.getPerfToken();
            this.configProvider.getControlConfiguration(function (controlPath, cdnRoot) {
                _this.logPerf("loadControl.controlConfigurationRetrieved", configPerfToken, controlName, actionCorrelationId);
                var stylesPerfToken = _this.logger.getPerfToken();
                var stylesheetDependencies = _this.getStyleSheetDependenciesCdn(controlPath, styleSheetsDependencies);
                var stylesLoadedDeferred = $.Deferred();
                _this.dependencyManager.loadStylesheetsIntoDom(stylesheetDependencies, function () {
                    _this.logPerf("loadControl.stylesLoaded", stylesPerfToken, controlName, actionCorrelationId, { "ResourcesCount": stylesheetDependencies.length });
                    stylesLoadedDeferred.resolve();
                });
                var scriptsPerfToken = _this.logger.getPerfToken();
                var scriptsToLoad = _this.getScriptDependenciesCdn(controlPath, scriptDependencies);
                var scriptsLoadedDeferred = $.Deferred();
                _this.dependencyManager.loadScriptsIntoDom(scriptsToLoad, function () {
                    _this.logPerf("loadControl.scriptsLoaded", scriptsPerfToken, controlName, actionCorrelationId, { "ResourcesCount": scriptsToLoad.length });
                    scriptsLoadedDeferred.resolve();
                });
                $.when(stylesLoadedDeferred, scriptsLoadedDeferred).done(function () {
                    _this.logPerf("loadControl.total", configPerfToken, controlName, actionCorrelationId);
                    var controlLoadResult = new MktSvcCommon.ControlLoadResult(controlPath, cdnRoot);
                    deferred.resolve(controlLoadResult);
                });
            });
            return deferred.promise();
        };
        ControlLoader.prototype.getScriptDependenciesCdn = function (controlsRoot, scriptDependencies) {
            var result = [];
            for (var _i = 0, scriptDependencies_1 = scriptDependencies; _i < scriptDependencies_1.length; _i++) {
                var dependencyModel = scriptDependencies_1[_i];
                var urlBuilder = new MktSvc.Controls.Common.UrlBuilder(controlsRoot);
                urlBuilder = urlBuilder.appendSubPath(dependencyModel.loadPath);
                result.push(new ControlsCommon.Utils.ScriptDependencyModel(dependencyModel.name, urlBuilder.build(), dependencyModel.scriptLoadBehavior));
            }
            return result;
        };
        ControlLoader.prototype.getStyleSheetDependenciesCdn = function (controlsRoot, styleSheetsDependencies) {
            var result = [];
            for (var _i = 0, styleSheetsDependencies_1 = styleSheetsDependencies; _i < styleSheetsDependencies_1.length; _i++) {
                var dependencyModel = styleSheetsDependencies_1[_i];
                var urlBuilder = new MktSvc.Controls.Common.UrlBuilder(controlsRoot);
                urlBuilder = urlBuilder.appendSubPath(dependencyModel.loadPath);
                result.push(new ControlsCommon.Utils.StyleSheetDependencyModel(dependencyModel.name, urlBuilder.build()));
            }
            return result;
        };
        ControlLoader.prototype.logPerf = function (method, perfToken, controlName, correlationId, additionalParams) {
            var params = additionalParams || {};
            params["ControlName"] = controlName;
            if (correlationId != null) {
                params["CorrelationId"] = correlationId;
            }
            this.logger.logPerf(MktSvc.Controls.Common.TraceLevel.Info, "MktSvcCommon.ControlLoader." + method, perfToken, new MktSvc.Controls.Common.Dictionary(params));
        };
        return ControlLoader;
    }());
    MktSvcCommon.ControlLoader = ControlLoader;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ControlLoaderFactory = /** @class */ (function () {
        function ControlLoaderFactory(configProvider, logger) {
            this.configProvider = configProvider;
            this.logger = logger;
        }
        ControlLoaderFactory.prototype.create = function () {
            return new MktSvcCommon.ControlLoader(this.configProvider, new ControlsCommon.Utils.DependencyManager(document), this.logger);
        };
        return ControlLoaderFactory;
    }());
    MktSvcCommon.ControlLoaderFactory = ControlLoaderFactory;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var ControlLoadResult = /** @class */ (function () {
        function ControlLoadResult(controlRootPath, cdnRootPath) {
            this.controlRootPath = controlRootPath;
            this.cdnRootPath = cdnRootPath;
        }
        return ControlLoadResult;
    }());
    MktSvcCommon.ControlLoadResult = ControlLoadResult;
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Libraries;
    (function (Libraries) {
        'use strict';
        var BackboneLoadBehavior = /** @class */ (function () {
            function BackboneLoadBehavior(logger) {
                this.logger = logger;
            }
            BackboneLoadBehavior.prototype.onLoad = function () {
                var backboneAsserter = new MktSvc.Controls.Common.LoggerAsserter(this.logger, "MktSvcCommon.Libraries.BackboneLoadBehavior.onLoad", new MktSvc.Controls.Common.Dictionary());
                // Backbone does not support Underscore injection after it's initalization is complete (though it does so with jQuery),
                // so if another _ component is loaded between DependencyManager's loads of Underscore.js and Backbone.js, the Backbone may be wrongly initialized.
                var underscore = window["_"];
                if (backboneAsserter.assertValueDefined("Underscore not available upon Backbone initialization", underscore)) {
                    backboneAsserter.assert("Underscore library version upon Backbone initialization", "1.8.3", underscore.VERSION);
                }
                // Underscore.js is loaded and Backbone.js is loaded.
                // Backbone.js uses it's own refernce to Underscore, therefore returning control to original.
                window["_"].noConflict();
                window["MktBackbone"] = window["Backbone"].noConflict();
            };
            return BackboneLoadBehavior;
        }());
        Libraries.BackboneLoadBehavior = BackboneLoadBehavior;
    })(Libraries = MktSvcCommon.Libraries || (MktSvcCommon.Libraries = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Libraries;
    (function (Libraries) {
        'use strict';
        var UnderscoreLoadBehavior = /** @class */ (function () {
            function UnderscoreLoadBehavior() {
            }
            UnderscoreLoadBehavior.prototype.onLoad = function () {
                window["Mkt_"] = window["_"];
            };
            return UnderscoreLoadBehavior;
        }());
        Libraries.UnderscoreLoadBehavior = UnderscoreLoadBehavior;
    })(Libraries = MktSvcCommon.Libraries || (MktSvcCommon.Libraries = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Logger;
    (function (Logger) {
        "use strict";
        var Object = MktSvc.Controls.Common.Object;
        var String = MktSvc.Controls.Common.String;
        var Dictionary = MktSvc.Controls.Common.Dictionary;
        var TraceLevel = MktSvc.Controls.Common.TraceLevel;
        var ParameterKeys = MktSvc.Controls.Common.ParameterKeys;
        /**
        * Implementation of Mscrm.Application event interface.
        */
        var TelemetryEvent = /** @class */ (function () {
            function TelemetryEvent(eventName, eventParameters) {
                this.eventName = eventName;
                this.eventParameters = eventParameters;
            }
            return TelemetryEvent;
        }());
        Logger.TelemetryEvent = TelemetryEvent;
        /**
        * Implementation of Mscrm.EventParameter interface.
        */
        var TelemetryEventParam = /** @class */ (function () {
            function TelemetryEventParam(name, value) {
                this.name = name;
                this.value = value;
            }
            return TelemetryEventParam;
        }());
        Logger.TelemetryEventParam = TelemetryEventParam;
        /**
         * Performance marker wrapper.
         */
        var PerformanceMarker = /** @class */ (function () {
            function PerformanceMarker(name, timestamp) {
                this.name = name;
                this.timestamp = timestamp;
            }
            return PerformanceMarker;
        }());
        Logger.PerformanceMarker = PerformanceMarker;
        /**
        * Wraps logic about logging to the telemetry system.
        */
        var TelemetryLogger = /** @class */ (function () {
            /**
            * Initializes a new instance of Telemetry Logger
            * @param context The bag of values currently assigned to the control's manifest parameters
            */
            function TelemetryLogger(componentName, context) {
                this.componentName = componentName;
                this.context = context;
                this.performanceMarkers = new Dictionary();
                this.getCurrentTimestamp = (performance ? function () { return performance.now(); } : function () { return new Date().getUTCMilliseconds(); });
                $(window).on("unload", { logger: this }, this.windowNavigateHandler);
            }
            TelemetryLogger.prototype.log = function (traceLevel, eventName, parameters) {
                var _this = this;
                var eventParams = [];
                this.addStandardParameters(eventParams, eventName);
                this.addParameters(eventParams, parameters);
                var logToTelemetry = null;
                switch (traceLevel) {
                    case (TraceLevel.Error):
                        logToTelemetry = function () {
                            _this.context.reporting.reportFailure("marketing", new Error(eventName), String.Empty, eventParams);
                        };
                        break;
                    case (TraceLevel.Info):
                    //falls through
                    case (TraceLevel.Verbose):
                    case (TraceLevel.Warning):
                        logToTelemetry = function () {
                            _this.context.reporting.reportSuccess("marketing", eventParams);
                        };
                        break;
                    default:
                        logToTelemetry = function () { };
                        break;
                }
                try {
                    // Log to CRM telemetry subsystems
                    logToTelemetry();
                }
                catch (e) {
                    console.log(eventName, [this.componentName, eventName, parameters]);
                }
            };
            TelemetryLogger.prototype.getPerfToken = function () {
                return { timestampInMillisUtc: this.getCurrentTimestamp() };
            };
            TelemetryLogger.prototype.logPerf = function (traceLevel, eventName, perfToken, parameters) {
                var elapsedMilliseconds = this.getCurrentTimestamp() - perfToken.timestampInMillisUtc;
                var eventParams = [];
                this.addStandardParameters(eventParams, eventName);
                eventParams.push(new TelemetryEventParam("ElapsedMilliseconds", elapsedMilliseconds));
                this.addParameters(eventParams, parameters);
                try {
                    this.context.reporting.reportSuccess("marketingPerf", eventParams);
                }
                catch (e) {
                    console.log(eventName, event);
                }
            };
            TelemetryLogger.prototype.logException = function (traceLevel, eventName, error, parameters) {
                if (!parameters) {
                    parameters = new Dictionary();
                }
                var traceDump = Object.isNullOrUndefined(error.stack) ? error.message : error.stack;
                parameters.addOrUpdate(ParameterKeys.LoggerError, traceDump);
                this.log(traceLevel, eventName, parameters);
            };
            TelemetryLogger.prototype.completeCollection = function (collection, correlationId) {
                var _this = this;
                var promise = $.Deferred();
                promise.done(function () {
                    _this.pushCollection(collection, "CompleteCollection", correlationId);
                });
                promise.resolve();
            };
            TelemetryLogger.prototype.windowNavigateHandler = function (event) {
                var dataLogger = event.data.logger;
                if (dataLogger.performanceMarkers.getValues().count() == 0) {
                    // don't push if we don't have any markers pending.
                    return;
                }
                for (var key in dataLogger.performanceMarkers.getKeys()) {
                    dataLogger.pushCollection(key, "WindowNavigate");
                }
            };
            TelemetryLogger.prototype.logMarker = function (name, collectionName, correlationId) {
                var _this = this;
                var dateTime = this.getCurrentTimestamp();
                var promise = $.Deferred();
                promise.done(function () { _this.logMarkerInternal(name, dateTime, collectionName, correlationId); });
                promise.resolve();
                return promise;
            };
            TelemetryLogger.prototype.logMarkerInternal = function (name, timestamp, collectionName, correlationId) {
                var collection = this.getPerformanceCollection(collectionName, correlationId);
                if (collection == null) {
                    collection = [];
                    this.performanceMarkers.addOrUpdate(this.getCollectionName(collectionName, correlationId), collection);
                }
                collection.push(new PerformanceMarker(name, timestamp));
            };
            TelemetryLogger.prototype.getPerformanceCollection = function (collectionName, correlationId) {
                return this.performanceMarkers.get(this.getCollectionName(collectionName, correlationId));
            };
            TelemetryLogger.prototype.getCollectionName = function (collectionName, correlationId) {
                return (correlationId == undefined ? collectionName : collectionName + correlationId);
            };
            TelemetryLogger.prototype.pushCollection = function (collectionName, eventName, correlationId) {
                var timestamp = this.getCurrentTimestamp();
                var collection = this.getPerformanceCollection(collectionName, correlationId);
                if (collection == null || collection.length == 0) {
                    this.logException(TraceLevel.Error, eventName, new Error("PerfMarkers expected, but no perf markers added for collection"), new Dictionary({ "CollectionName": collectionName, "CorrelationId": correlationId }));
                    return;
                }
                this.logMarkerInternal(eventName, timestamp, collectionName, correlationId);
                var elapsedMilliseconds = timestamp - collection[0].timestamp;
                var json = JSON.stringify(collection);
                var parameters = new Dictionary((_a = {},
                    _a["Markers"] = json,
                    _a["Total"] = elapsedMilliseconds,
                    _a["Collection"] = collectionName,
                    _a["CorrelationId"] = correlationId,
                    _a));
                this.log(TraceLevel.Info, "marketingPerfMarkers", parameters);
                this.performanceMarkers.remove(this.getCollectionName(collectionName, correlationId));
                var _a;
            };
            TelemetryLogger.prototype.addStandardParameters = function (eventParameters, eventName) {
                eventParameters.push(new TelemetryEventParam("EventName", eventName));
                eventParameters.push(new TelemetryEventParam("ComponentName", this.componentName));
                eventParameters.push(new TelemetryEventParam("LibraryVersion", MktSvcCommon.VERSION));
            };
            TelemetryLogger.prototype.addParameters = function (eventParameters, parameters) {
                if (parameters) {
                    parameters.getKeys().items()
                        .forEach(function (key) {
                        switch (typeof parameters.get(key)) {
                            case "number":
                            case "string":
                                eventParameters.push(new TelemetryEventParam(key, parameters.get(key)));
                                break;
                            case "object":
                                try {
                                    eventParameters.push(new TelemetryEventParam(key, JSON.stringify(parameters.get(key))));
                                }
                                catch (e) {
                                    eventParameters.push(new TelemetryEventParam(key, "Exception caught trying to serialize JSON:" + e.message));
                                }
                                break;
                            default:
                        }
                    });
                }
            };
            return TelemetryLogger;
        }());
        Logger.TelemetryLogger = TelemetryLogger;
    })(Logger = MktSvcCommon.Logger || (MktSvcCommon.Logger = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var Mscrm;
(function (Mscrm) {
    "use strict";
    var MicrosoftIconSymbol;
    (function (MicrosoftIconSymbol) {
        MicrosoftIconSymbol[MicrosoftIconSymbol["Expanded"] = 0] = "Expanded";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UpArrowHead"] = 1] = "UpArrowHead";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LeftArrowHead"] = 2] = "LeftArrowHead";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Collapsed"] = 3] = "Collapsed";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Edit"] = 4] = "Edit";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Save"] = 5] = "Save";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Delete"] = 6] = "Delete";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Remove"] = 7] = "Remove";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Add"] = 8] = "Add";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Cancel"] = 9] = "Cancel";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HandClick"] = 10] = "HandClick";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Accept"] = 11] = "Accept";
        MicrosoftIconSymbol[MicrosoftIconSymbol["More"] = 12] = "More";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Forward"] = 13] = "Forward";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Favorite"] = 14] = "Favorite";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Placeholder"] = 15] = "Placeholder";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RatingFull"] = 16] = "RatingFull";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RatingEmpty"] = 17] = "RatingEmpty";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Options"] = 18] = "Options";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Manage"] = 19] = "Manage";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Settings"] = 20] = "Settings";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Find"] = 21] = "Find";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Help"] = 22] = "Help";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ViewNotifications"] = 23] = "ViewNotifications";
        MicrosoftIconSymbol[MicrosoftIconSymbol["StageAdvance"] = 24] = "StageAdvance";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CheckMark"] = 25] = "CheckMark";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Locked"] = 26] = "Locked";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Lock"] = 27] = "Lock";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MoreOptions"] = 28] = "MoreOptions";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ContactInfo"] = 29] = "ContactInfo";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Pin"] = 30] = "Pin";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Unpin"] = 31] = "Unpin";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Refresh"] = 32] = "Refresh";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Details"] = 33] = "Details";
        MicrosoftIconSymbol[MicrosoftIconSymbol["VisualFilter"] = 34] = "VisualFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilter"] = 35] = "GlobalFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Diamond"] = 36] = "Diamond";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ApplyFilter"] = 37] = "ApplyFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CancelFilter"] = 38] = "CancelFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["StreamView"] = 39] = "StreamView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["TileView"] = 40] = "TileView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Import"] = 41] = "Import";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Tools"] = 42] = "Tools";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Attach"] = 43] = "Attach";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Filter"] = 44] = "Filter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Copy"] = 45] = "Copy";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HighPriority"] = 46] = "HighPriority";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReduceTile"] = 47] = "ReduceTile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ExpandTile"] = 48] = "ExpandTile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterExpand"] = 49] = "GlobalFilterExpand";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterCollapse"] = 50] = "GlobalFilterCollapse";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Clear"] = 51] = "Clear";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Post"] = 52] = "Post";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OneNote"] = 53] = "OneNote";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Home"] = 54] = "Home";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SetAsHome"] = 55] = "SetAsHome";
        MicrosoftIconSymbol[MicrosoftIconSymbol["BackButton"] = 56] = "BackButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["BackButtonWithoutBorder"] = 57] = "BackButtonWithoutBorder";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UpArrow"] = 58] = "UpArrow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DownArrow"] = 59] = "DownArrow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SetActiveButton"] = 60] = "SetActiveButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SearchButton"] = 61] = "SearchButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ForwardButton"] = 62] = "ForwardButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Mail"] = 63] = "Mail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CheckedMail"] = 64] = "CheckedMail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FailedMail"] = 65] = "FailedMail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Phone"] = 66] = "Phone";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Chat"] = 67] = "Chat";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenPane"] = 68] = "OpenPane";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ClosePane"] = 69] = "ClosePane";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AddFriend"] = 70] = "AddFriend";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Arrow"] = 71] = "Arrow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DropdownArrow"] = 72] = "DropdownArrow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FlsLocked"] = 73] = "FlsLocked";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LinkArticle"] = 74] = "LinkArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UnlinkArticle"] = 75] = "UnlinkArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CopyLink"] = 76] = "CopyLink";
        MicrosoftIconSymbol[MicrosoftIconSymbol["EmailLink"] = 77] = "EmailLink";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Share"] = 78] = "Share";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Assign"] = 79] = "Assign";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Connect"] = 80] = "Connect";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Opportunity"] = 81] = "Opportunity";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Appointment"] = 82] = "Appointment";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Task"] = 83] = "Task";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Case"] = 84] = "Case";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PhoneCallIncoming"] = 85] = "PhoneCallIncoming";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PhoneCallOutgoing"] = 86] = "PhoneCallOutgoing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["EmailIncoming"] = 87] = "EmailIncoming";
        MicrosoftIconSymbol[MicrosoftIconSymbol["EmailOutgoing"] = 88] = "EmailOutgoing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SendEmail"] = 89] = "SendEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ApplyTemplate"] = 90] = "ApplyTemplate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["InsertKbArticle"] = 91] = "InsertKbArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SendSelected"] = 92] = "SendSelected";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SaveAndClose"] = 93] = "SaveAndClose";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReplyEmail"] = 94] = "ReplyEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReplyAllEmail"] = 95] = "ReplyAllEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ForwardEmail"] = 96] = "ForwardEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Close"] = 97] = "Close";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Activate"] = 98] = "Activate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DeActivate"] = 99] = "DeActivate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DeleteBulk"] = 100] = "DeleteBulk";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SocialActivityIncoming"] = 101] = "SocialActivityIncoming";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SocialActivityOutgoing"] = 102] = "SocialActivityOutgoing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CustomActivity"] = 103] = "CustomActivity";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SystemPost"] = 104] = "SystemPost";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Convert"] = 105] = "Convert";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MarkAsWon"] = 106] = "MarkAsWon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MarkAsLost"] = 107] = "MarkAsLost";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SetRegarding"] = 108] = "SetRegarding";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SaveAsComplete"] = 109] = "SaveAsComplete";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SwitchProcess"] = 110] = "SwitchProcess";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Recalculate"] = 111] = "Recalculate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SendDirectEmail"] = 112] = "SendDirectEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenMailbox"] = 113] = "OpenMailbox";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReOpenOpportunity"] = 114] = "ReOpenOpportunity";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReactivateLead"] = 115] = "ReactivateLead";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Disqualify"] = 116] = "Disqualify";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Qualify"] = 117] = "Qualify";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SelectView"] = 118] = "SelectView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SelectChart"] = 119] = "SelectChart";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenInBrowser"] = 120] = "OpenInBrowser";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NewAppointment"] = 121] = "NewAppointment";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NewRecurringAppointment"] = 122] = "NewRecurringAppointment";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NewPhoneCall"] = 123] = "NewPhoneCall";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NewTask"] = 124] = "NewTask";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NewEmail"] = 125] = "NewEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AddExisting"] = 126] = "AddExisting";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SaveAndEdit"] = 127] = "SaveAndEdit";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Default"] = 128] = "Default";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ScrollRight"] = 129] = "ScrollRight";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ScrollLeft"] = 130] = "ScrollLeft";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SaveAndRunRoutingRule"] = 131] = "SaveAndRunRoutingRule";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RunRoutingRule"] = 132] = "RunRoutingRule";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ResolveCase"] = 133] = "ResolveCase";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CancelCase"] = 134] = "CancelCase";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReactivateCase"] = 135] = "ReactivateCase";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AddToQueue"] = 136] = "AddToQueue";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CreateChildCase"] = 137] = "CreateChildCase";
        MicrosoftIconSymbol[MicrosoftIconSymbol["QueueItemRoute"] = 138] = "QueueItemRoute";
        MicrosoftIconSymbol[MicrosoftIconSymbol["QueueItemRelease"] = 139] = "QueueItemRelease";
        MicrosoftIconSymbol[MicrosoftIconSymbol["QueueItemRemove"] = 140] = "QueueItemRemove";
        MicrosoftIconSymbol[MicrosoftIconSymbol["QueueItemPick"] = 141] = "QueueItemPick";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Drilldown"] = 142] = "Drilldown";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PopOverButton"] = 143] = "PopOverButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ExitButton"] = 144] = "ExitButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ExportToExcel"] = 145] = "ExportToExcel";
        MicrosoftIconSymbol[MicrosoftIconSymbol["WordTemplates"] = 146] = "WordTemplates";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DocumentTemplates"] = 147] = "DocumentTemplates";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenInPowerBI"] = 148] = "OpenInPowerBI";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenPowerBIReport"] = 149] = "OpenPowerBIReport";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenDelve"] = 150] = "OpenDelve";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ArticleLink"] = 151] = "ArticleLink";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ArchiveArticle"] = 152] = "ArchiveArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ApproveArticle"] = 153] = "ApproveArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DiscardArticle"] = 154] = "DiscardArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Minor"] = 155] = "Minor";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Major"] = 156] = "Major";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PublishKnowledgeArticle"] = 157] = "PublishKnowledgeArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RelateArticle"] = 158] = "RelateArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RelateProduct"] = 159] = "RelateProduct";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RestoreArticle"] = 160] = "RestoreArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RevertToDraftArticle"] = 161] = "RevertToDraftArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Translate"] = 162] = "Translate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UpdateArticle"] = 163] = "UpdateArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RemoveFilter"] = 164] = "RemoveFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Article"] = 165] = "Article";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Graph"] = 166] = "Graph";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CSR"] = 167] = "CSR";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MembersIcon"] = 168] = "MembersIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["QueueIcon"] = 169] = "QueueIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SiteMap"] = 170] = "SiteMap";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NormalPriority"] = 171] = "NormalPriority";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LowPriority"] = 172] = "LowPriority";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ViewIcon"] = 173] = "ViewIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RecentCases"] = 174] = "RecentCases";
        MicrosoftIconSymbol[MicrosoftIconSymbol["KBRecords"] = 175] = "KBRecords";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NumberOfViews"] = 176] = "NumberOfViews";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ResizeHandle"] = 177] = "ResizeHandle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["TaskBasedFlow"] = 178] = "TaskBasedFlow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["InformationIcon"] = 179] = "InformationIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PencilIcon"] = 180] = "PencilIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ErrorIcon"] = 181] = "ErrorIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SuccessIcon"] = 182] = "SuccessIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OptionsetIcon"] = 183] = "OptionsetIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["NotificationIcon"] = 184] = "NotificationIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PanelHeaderImportDataIcon"] = 185] = "PanelHeaderImportDataIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SidePanelUpload"] = 186] = "SidePanelUpload";
        MicrosoftIconSymbol[MicrosoftIconSymbol["New"] = 187] = "New";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DetailsPageClose"] = 188] = "DetailsPageClose";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SettingsListIcon"] = 189] = "SettingsListIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ListIcon"] = 190] = "ListIcon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ForwardDisable"] = 191] = "ForwardDisable";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PdfIconFile"] = 192] = "PdfIconFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PresentationFile"] = 193] = "PresentationFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OneNoteFile"] = 194] = "OneNoteFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AccessFile"] = 195] = "AccessFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["VisioFile"] = 196] = "VisioFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ProjectFile"] = 197] = "ProjectFile";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Plus"] = 198] = "Plus";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ChevronUp"] = 199] = "ChevronUp";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ChevronDown"] = 200] = "ChevronDown";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HappySmiley"] = 201] = "HappySmiley";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SadSmiley"] = 202] = "SadSmiley";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CaseResolution"] = 203] = "CaseResolution";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CampaignResolution"] = 204] = "CampaignResolution";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ServiceActivity"] = 205] = "ServiceActivity";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Notes"] = 206] = "Notes";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Audio"] = 207] = "Audio";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Camera"] = 208] = "Camera";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Video"] = 209] = "Video";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Image"] = 210] = "Image";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Html"] = 211] = "Html";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointEditDocument"] = 212] = "SharePointEditDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointDeleteDocument"] = 213] = "SharePointDeleteDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointCheckoutDocument"] = 214] = "SharePointCheckoutDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointCheckinDocument"] = 215] = "SharePointCheckinDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointEditDocumentProperties"] = 216] = "SharePointEditDocumentProperties";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointDiscardCheckoutDocument"] = 217] = "SharePointDiscardCheckoutDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointNewDocument"] = 218] = "SharePointNewDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointNewWordDocument"] = 219] = "SharePointNewWordDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointNewExcelDocument"] = 220] = "SharePointNewExcelDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointNewPowerPointDocument"] = 221] = "SharePointNewPowerPointDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointNewOneNoteDocument"] = 222] = "SharePointNewOneNoteDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointUploadDocument"] = 223] = "SharePointUploadDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointChangeLocation"] = 224] = "SharePointChangeLocation";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointAddDocumentLocation"] = 225] = "SharePointAddDocumentLocation";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointEditLocation"] = 226] = "SharePointEditLocation";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointOpenLocation"] = 227] = "SharePointOpenLocation";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SharePointOpenDocument"] = 228] = "SharePointOpenDocument";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SendByEmail"] = 229] = "SendByEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CreateQuote"] = 230] = "CreateQuote";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Reply"] = 231] = "Reply";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Warning"] = 232] = "Warning";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Play"] = 233] = "Play";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ExpandButton"] = 234] = "ExpandButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AssociatedArticle"] = 235] = "AssociatedArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DisassociatedArticle"] = 236] = "DisassociatedArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FormDesign"] = 237] = "FormDesign";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterClearAll"] = 238] = "GlobalFilterClearAll";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterExpandedRow"] = 239] = "GlobalFilterExpandedRow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterCollapsedRow"] = 240] = "GlobalFilterCollapsedRow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RelationshipAssistant"] = 241] = "RelationshipAssistant";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AutomaticSuggestions"] = 242] = "AutomaticSuggestions";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SemanticZoom"] = 243] = "SemanticZoom";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SemanticZoomMirrored"] = 244] = "SemanticZoomMirrored";
        MicrosoftIconSymbol[MicrosoftIconSymbol["BackwardButton"] = 245] = "BackwardButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MultiSelect"] = 246] = "MultiSelect";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MultiSelectMirrored"] = 247] = "MultiSelectMirrored";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Spinning"] = 248] = "Spinning";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RetireProduct"] = 249] = "RetireProduct";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AddProduct"] = 250] = "AddProduct";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OfflineStatus"] = 251] = "OfflineStatus";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Abandon"] = 252] = "Abandon";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Reactivate"] = 253] = "Reactivate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FinishStage"] = 254] = "FinishStage";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SortButton"] = 255] = "SortButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Flows"] = 256] = "Flows";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenEntityRecord"] = 257] = "OpenEntityRecord";
        MicrosoftIconSymbol[MicrosoftIconSymbol["View"] = 258] = "View";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CreateView"] = 259] = "CreateView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["EditView"] = 260] = "EditView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GuestUser"] = 261] = "GuestUser";
        MicrosoftIconSymbol[MicrosoftIconSymbol["History"] = 262] = "History";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ReassignRecords"] = 263] = "ReassignRecords";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ManageRoles"] = 264] = "ManageRoles";
        MicrosoftIconSymbol[MicrosoftIconSymbol["JoinTeams"] = 265] = "JoinTeams";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ChangeManager"] = 266] = "ChangeManager";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AddMembers"] = 267] = "AddMembers";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RemoveMembers"] = 268] = "RemoveMembers";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Download"] = 269] = "Download";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SetAsDefaultView"] = 270] = "SetAsDefaultView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Pinned"] = 271] = "Pinned";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DistributionList"] = 272] = "DistributionList";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MergeRecords"] = 273] = "MergeRecords";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AssociateChildCase"] = 274] = "AssociateChildCase";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SetAsDefault"] = 275] = "SetAsDefault";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ConvertKnowledgeArticle"] = 276] = "ConvertKnowledgeArticle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Messenger"] = 277] = "Messenger";
        MicrosoftIconSymbol[MicrosoftIconSymbol["AssociateCategory"] = 278] = "AssociateCategory";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OfficeWaffle"] = 279] = "OfficeWaffle";
        MicrosoftIconSymbol[MicrosoftIconSymbol["TripleColumn"] = 280] = "TripleColumn";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Tiles"] = 281] = "Tiles";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HideVisualFilter"] = 282] = "HideVisualFilter";
        MicrosoftIconSymbol[MicrosoftIconSymbol["InteractiveDashboard"] = 283] = "InteractiveDashboard";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Dynamics365"] = 284] = "Dynamics365";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SalesLiterature"] = 285] = "SalesLiterature";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SelectButton"] = 286] = "SelectButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SelectButtonRTL"] = 287] = "SelectButtonRTL";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LockPricing"] = 288] = "LockPricing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CreateInvoice"] = 289] = "CreateInvoice";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FulfillOrder"] = 290] = "FulfillOrder";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CancelInvoice"] = 291] = "CancelInvoice";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ActivateQuote"] = 292] = "ActivateQuote";
        MicrosoftIconSymbol[MicrosoftIconSymbol["InvoicePaid"] = 293] = "InvoicePaid";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GetProducts"] = 294] = "GetProducts";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UnlockPricing"] = 295] = "UnlockPricing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Checkbox"] = 296] = "Checkbox";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CheckboxComposite"] = 297] = "CheckboxComposite";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RightChevron"] = 298] = "RightChevron";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LeftChevron"] = 299] = "LeftChevron";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UntrackedEmail"] = 300] = "UntrackedEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OpenEmail"] = 301] = "OpenEmail";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GlobalFilterCollapsedRowRTL"] = 302] = "GlobalFilterCollapsedRowRTL";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CancelOrder"] = 303] = "CancelOrder";
        MicrosoftIconSymbol[MicrosoftIconSymbol["URL"] = 304] = "URL";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Ticker"] = 305] = "Ticker";
        MicrosoftIconSymbol[MicrosoftIconSymbol["UseCurrentPricing"] = 306] = "UseCurrentPricing";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Process"] = 307] = "Process";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FirstPageButton"] = 308] = "FirstPageButton";
        MicrosoftIconSymbol[MicrosoftIconSymbol["LinkedInLogo"] = 309] = "LinkedInLogo";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Health"] = 310] = "Health";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Family"] = 311] = "Family";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Sports"] = 312] = "Sports";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Entertainment"] = 313] = "Entertainment";
        MicrosoftIconSymbol[MicrosoftIconSymbol["OOF"] = 314] = "OOF";
        MicrosoftIconSymbol[MicrosoftIconSymbol["CarouselView"] = 315] = "CarouselView";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HeartEmpty"] = 316] = "HeartEmpty";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HeartFilled"] = 317] = "HeartFilled";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Follow"] = 318] = "Follow";
        MicrosoftIconSymbol[MicrosoftIconSymbol["RunQuery"] = 319] = "RunQuery";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GroupAnd"] = 320] = "GroupAnd";
        MicrosoftIconSymbol[MicrosoftIconSymbol["GroupOr"] = 321] = "GroupOr";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Ungroup"] = 322] = "Ungroup";
        MicrosoftIconSymbol[MicrosoftIconSymbol["HideInSimpleMode"] = 323] = "HideInSimpleMode";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ShowInSimpleMode"] = 324] = "ShowInSimpleMode";
        MicrosoftIconSymbol[MicrosoftIconSymbol["PinnedSolid"] = 325] = "PinnedSolid";
        MicrosoftIconSymbol[MicrosoftIconSymbol["FilterSolid"] = 326] = "FilterSolid";
        MicrosoftIconSymbol[MicrosoftIconSymbol["Bot"] = 327] = "Bot";
        MicrosoftIconSymbol[MicrosoftIconSymbol["SystemDocumentTemplates"] = 328] = "SystemDocumentTemplates";
        MicrosoftIconSymbol[MicrosoftIconSymbol["MyDocumentTemplates"] = 329] = "MyDocumentTemplates";
        MicrosoftIconSymbol[MicrosoftIconSymbol["ViewAllMyDocumentTemplates"] = 330] = "ViewAllMyDocumentTemplates";
        MicrosoftIconSymbol[MicrosoftIconSymbol["EnableSecurityRoles"] = 331] = "EnableSecurityRoles";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DocumentTemplateUpload"] = 332] = "DocumentTemplateUpload";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DocumentTemplateEdit"] = 333] = "DocumentTemplateEdit";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DocumentTemplateActivate"] = 334] = "DocumentTemplateActivate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["DocumentTemplateDeactivate"] = 335] = "DocumentTemplateDeactivate";
        MicrosoftIconSymbol[MicrosoftIconSymbol["YammerIcon"] = 336] = "YammerIcon";
    })(MicrosoftIconSymbol = Mscrm.MicrosoftIconSymbol || (Mscrm.MicrosoftIconSymbol = {}));
})(Mscrm || (Mscrm = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var ControlInitEventArgs = /** @class */ (function () {
            function ControlInitEventArgs() {
            }
            return ControlInitEventArgs;
        }());
        EventArgs.ControlInitEventArgs = ControlInitEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var AssistEditInitControlEventArgs = /** @class */ (function (_super) {
            __extends(AssistEditInitControlEventArgs, _super);
            function AssistEditInitControlEventArgs() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return AssistEditInitControlEventArgs;
        }(EventArgs.ControlInitEventArgs));
        EventArgs.AssistEditInitControlEventArgs = AssistEditInitControlEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var AssistEditOptionFocusedEventArgs = /** @class */ (function () {
            function AssistEditOptionFocusedEventArgs() {
            }
            return AssistEditOptionFocusedEventArgs;
        }());
        EventArgs.AssistEditOptionFocusedEventArgs = AssistEditOptionFocusedEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var EventArgs;
    (function (EventArgs) {
        "use strict";
        var InputAssistEditValueChangedEventArgs = /** @class */ (function () {
            function InputAssistEditValueChangedEventArgs() {
            }
            return InputAssistEditValueChangedEventArgs;
        }());
        EventArgs.InputAssistEditValueChangedEventArgs = InputAssistEditValueChangedEventArgs;
    })(EventArgs = MktSvcCommon.EventArgs || (MktSvcCommon.EventArgs = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v8.1 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var EntityConstants = /** @class */ (function () {
        function EntityConstants() {
        }
        /** Dynamic content metadata table name */
        EntityConstants.dynamicContentMetadataTableName = "msdyncrm_marketingemaildynamiccontentmetadata";
        EntityConstants.msdyncrm_organization_config = "msdyncrm_organization_config";
        /** Item type field name */
        EntityConstants.itemTypeFieldName = "msdyncrm_itemType";
        /** Syntax field name*/
        EntityConstants.syntaxFieldName = "msdyncrm_syntax";
        /** Fields field name*/
        EntityConstants.fieldsFieldName = "msdyncrm_fields";
        return EntityConstants;
    }());
    MktSvcCommon.EntityConstants = EntityConstants;
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var UndoRedo;
    (function (UndoRedo) {
        "use strict";
    })(UndoRedo = MktSvcCommon.UndoRedo || (MktSvcCommon.UndoRedo = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var UndoRedo;
    (function (UndoRedo) {
        "use strict";
    })(UndoRedo = MktSvcCommon.UndoRedo || (MktSvcCommon.UndoRedo = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var UndoRedo;
    (function (UndoRedo) {
        "use strict";
        var UniqueId = MktSvc.Controls.Common.UniqueId;
        /**
        * Base caretaker for the control mementos - a linear list of the control content of type T.
        */
        var UndoRedoManagerBase = /** @class */ (function () {
            function UndoRedoManagerBase() {
                /**
                * The id - used in event routing.
                */
                this.Id = UniqueId.generate();
            }
            /**
            * Init.
            */
            UndoRedoManagerBase.prototype.init = function (control) {
                var _this = this;
                this.control = control;
                this.control.getEventBroker().subscribe(MktSvcCommon.EventConstants.UndoExecuted, this.onUndo = function () { return _this.undo(); });
                this.control.getEventBroker().subscribe(MktSvcCommon.EventConstants.RedoExecuted, this.onRedo = function () { return _this.redo(); });
            };
            /**
            * Dispose.
            */
            UndoRedoManagerBase.prototype.dispose = function () {
                this.control.getEventBroker().unsubscribe(MktSvcCommon.EventConstants.UndoExecuted, this.onUndo);
                this.control.getEventBroker().unsubscribe(MktSvcCommon.EventConstants.RedoExecuted, this.onRedo);
            };
            /**
            * Saves a state.
            */
            UndoRedoManagerBase.prototype.saveState = function (state) {
                if (!this.isStateValidForSave(state))
                    return;
                this.currentStateIndex++;
                this.savedStates.splice(this.currentStateIndex, this.savedStates.length - this.currentStateIndex, state);
                this.control.getEventBroker().notify(MktSvcCommon.EventConstants.StateSaved);
            };
            /**
            * Restores to previous state.
            */
            UndoRedoManagerBase.prototype.undo = function () {
                if (this.savedStates.length === 0 || this.currentStateIndex === 0) {
                    return;
                }
                this.currentStateIndex--;
                var state = this.savedStates[this.currentStateIndex];
                this.restoreState(state);
            };
            /**
            * Restores to next state.
            */
            UndoRedoManagerBase.prototype.redo = function () {
                if (this.savedStates.length === 0 || this.currentStateIndex === this.savedStates.length - 1) {
                    return;
                }
                this.currentStateIndex++;
                var state = this.savedStates[this.currentStateIndex];
                this.restoreState(state);
            };
            return UndoRedoManagerBase;
        }());
        UndoRedo.UndoRedoManagerBase = UndoRedoManagerBase;
    })(UndoRedo = MktSvcCommon.UndoRedo || (MktSvcCommon.UndoRedo = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Lookup;
    (function (Lookup) {
        "use strict";
    })(Lookup = MktSvcCommon.Lookup || (MktSvcCommon.Lookup = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Lookup;
    (function (Lookup) {
        "use strict";
    })(Lookup = MktSvcCommon.Lookup || (MktSvcCommon.Lookup = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var Lookup;
    (function (Lookup) {
        "use strict";
        var Object = MktSvc.Controls.Common.Object;
        var LookupCustomControl = /** @class */ (function () {
            /**
             * Initializes a new instance of LookupCustomControl
             * @param context The bag of values currently assigned to the control's manifest parameters
             * @param logger The logger used for telemetry
             * @param invalidRecordItemName The name used in a case when the entity can't be found
             * @param disableMru The optional parameter to disable MRU in LookupCustomControl
             * @param isControlEnabled Determines whether the control is in the enabled state
             */
            function LookupCustomControl(context, logger, invalidRecordItemName, disableMru, isControlEnabled) {
                if (disableMru === void 0) { disableMru = false; }
                if (isControlEnabled === void 0) { isControlEnabled = true; }
                this.context = context;
                this.logger = logger;
                this.invalidRecordItemName = invalidRecordItemName;
                this.disableMru = disableMru;
                this.isControlEnabled = isControlEnabled;
                this.lookupControlId = 'LookupControl';
                this.lookupContainerId = 'LookupControl';
                this.lookupContainerCssClass = 'lookupInput';
                this.lookupControlIdPrefix = 'lookup';
                this.reload = function () { };
            }
            /**
             * @see MktSvcCommon.Lookup.ILookupField.loadLookup
             */
            LookupCustomControl.prototype.loadLookup = function (container, entityName, displayName, viewId, callback, initialValue, entitySetName, titleFieldName, bindDivElement, filter) {
                var _this = this;
                var initialEntity = null;
                var bindDiv = bindDivElement;
                this.controlId = MktSvc.Controls.Common.UniqueId.generate(this.lookupControlIdPrefix + entityName);
                if (!bindDiv) {
                    var lookupContainer = $("<div></div>").appendTo(container);
                    lookupContainer.attr('id', entityName + this.lookupContainerId);
                    lookupContainer.addClass(this.lookupContainerCssClass);
                    bindDiv = lookupContainer.get(0);
                }
                var lookupCallback = function (updatedValue) {
                    _this.loadLookup(container, entityName, displayName, viewId, callback, updatedValue ? { Id: updatedValue.Id || updatedValue.id, Name: updatedValue.Name || updatedValue.name } : null, entitySetName, titleFieldName, bindDiv);
                    callback(updatedValue);
                };
                if (!Object.isNullOrUndefined(initialValue)) {
                    if (MktSvc.Controls.Common.String.isNullUndefinedOrWhitespace(initialValue.Name)) {
                        var oDataUrl = new MktSvc.Controls.Common.EntityRecordUrlBuilder(this.context.page.getClientUrl(), entitySetName);
                        oDataUrl.setRecordId(initialValue.Id);
                        var oDataClient = new MktSvc.Controls.Common.ODataServiceClient(this.logger);
                        oDataClient.getData(oDataUrl.build()).done(function (result) {
                            var entityValue = JSON.parse(result);
                            initialEntity = {
                                Id: initialValue.Id,
                                Name: entityValue[titleFieldName],
                                LogicalName: entityName,
                                get_identifier: function () { return initialValue.Id; }
                            };
                            _this.renderControl(bindDiv, _this.controlId, entityName, displayName, viewId, lookupCallback, initialEntity);
                        }).fail(function (response, status) {
                            // status in a case of the fail should be 404 - the entity doesn't exist.
                            var traceLevel = status !== 404 ? MktSvc.Controls.Common.TraceLevel.Error : MktSvc.Controls.Common.TraceLevel.Info;
                            _this.logger.log(traceLevel, "MktSvcCommon.Lookup.LookupCustomControl.loadLookup", new MktSvc.Controls.Common.Dictionary((_a = {
                                    Url: oDataUrl.build(),
                                    Status: status
                                },
                                _a[MktSvc.Controls.Common.ParameterKeys.ErrorDetails] = response,
                                _a)));
                            if (status === 404) {
                                var nullGuid = MktSvc.Controls.Common.Guid.GetNullGuid();
                                initialEntity = {
                                    Id: nullGuid,
                                    Name: _this.invalidRecordItemName,
                                    LogicalName: entityName,
                                    get_identifier: function () { return nullGuid; }
                                };
                                _this.renderControl(bindDiv, _this.controlId, entityName, displayName, viewId, lookupCallback, initialEntity, filter);
                            }
                            var _a;
                        });
                    }
                    else {
                        initialEntity = {
                            Id: initialValue.Id,
                            Name: initialValue.Name,
                            LogicalName: entityName,
                            get_identifier: function () { return initialValue.Id; }
                        };
                        this.renderControl(bindDiv, this.controlId, entityName, displayName, viewId, lookupCallback, initialEntity, filter);
                    }
                }
                else {
                    this.renderControl(bindDiv, this.controlId, entityName, displayName, viewId, lookupCallback, initialEntity, filter);
                }
            };
            /**
             * @see MktSvcCommon.Lookup.ILookupField.setEnabled
             */
            LookupCustomControl.prototype.setEnabled = function (enabled) {
                if (enabled != this.isControlEnabled) {
                    this.isControlEnabled = enabled;
                    this.reload();
                }
            };
            /**
             * @see MktSvcCommon.Lookup.ILookupField.dispose
             */
            LookupCustomControl.prototype.dispose = function () {
                this.unbindComponent();
            };
            LookupCustomControl.prototype.getControlId = function () {
                return this.controlId;
            };
            LookupCustomControl.prototype.renderControl = function (bindDiv, controlId, entityName, displayName, viewId, callback, initialEntity, filter) {
                var _this = this;
                this.context.utils.bindDOMElement(this.generateChildLookupControlControl(this.controlId, entityName, displayName, viewId, callback, initialEntity, filter), bindDiv);
                this.reload = function () {
                    _this.unbindComponent();
                    while (bindDiv.firstChild) {
                        bindDiv.removeChild(bindDiv.firstChild);
                    }
                    _this.renderControl(bindDiv, controlId, entityName, displayName, viewId, callback, initialEntity, filter);
                };
            };
            LookupCustomControl.prototype.unbindComponent = function () {
                try {
                    this.context.utils.unbindDOMComponent(this.getControlId());
                }
                catch (e) {
                    this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.Lookup.LookupCustomControl.unbindComponent", e);
                }
            };
            /**
             * Generate a lookup control
             * @returns a lookup control
             */
            LookupCustomControl.prototype.generateChildLookupControlControl = function (controlId, entityName, displayName, viewId, callback, initialEntity, filter) {
                var onValueChanged = function (value) {
                    var callbackValue = null;
                    // Backward compatibility
                    if (!Object.isNullOrUndefined(value)) {
                        // On the UClient from the CRM build <= 22 the callback is an array of customControlEntityReference
                        if (Array.isArray(value)) {
                            callbackValue = value.length ? value[0] : null;
                        }
                        else {
                            // On the UClient from the CRM build >= 36 the callback is a customControlEntityReference
                            callbackValue = value;
                        }
                    }
                    callback(callbackValue);
                };
                var attributes = {
                    DisplayName: displayName,
                    IsSecured: false,
                    Format: "none",
                    LogicalName: entityName + this.lookupControlId,
                    ImeMode: -1,
                    RequiredLevel: 0,
                    Type: "lookup",
                    Targets: [entityName]
                };
                var simpleLookupProps = {
                    id: controlId,
                    key: controlId,
                    parameters: {
                        value: {
                            Attributes: attributes,
                            Callback: onValueChanged,
                            Usage: 3,
                            Static: false,
                            Type: "Lookup.Simple",
                            Value: initialEntity,
                            Primary: true,
                            EntityName: entityName,
                            Name: "value",
                            ViewId: viewId,
                            AllowFilterOff: false,
                            DisableQuickFind: false,
                            EnableViewPicker: true,
                            TargetEntityType: entityName,
                            DisableMru: this.disableMru
                        },
                        valueDataSet: {
                            EntityName: entityName,
                            ViewId: viewId,
                            EnableViewPicker: true,
                            TargetEntityType: entityName,
                            Name: "valueDataSet"
                        }
                    },
                    controlstates: {
                        isControlDisabled: !this.isControlEnabled
                    }
                };
                if (filter != null) {
                    simpleLookupProps.parameters.value.ExtraFilters = [filter];
                    simpleLookupProps.parameters.value.AllowFilterOff = true;
                }
                var childLookup = this.context.factory.createComponent("MscrmControls.FieldControls.SimpleLookupControl", controlId, simpleLookupProps);
                return childLookup;
            };
            return LookupCustomControl;
        }());
        Lookup.LookupCustomControl = LookupCustomControl;
    })(Lookup = MktSvcCommon.Lookup || (MktSvcCommon.Lookup = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var Mscrm;
(function (Mscrm) {
    "use strict";
})(Mscrm || (Mscrm = {}));
/**
* @license Copyright (c) Microsoft Corporation.  All rights reserved.
*/
/// <reference path="../commonreferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var QuickView;
    (function (QuickView) {
        "use strict";
        var QuickViewControl = /** @class */ (function () {
            /**
             * Initializes a new instance of QuickViewControl
             * @param context The bag of values currently assigned to the control's manifest parameters
             * @param containerCssClass the CSS class of the quick view container
             */
            function QuickViewControl(context, logger, containerCssClass) {
                this.context = context;
                this.logger = logger;
                this.quickViewContainerId = 'QuickViewControl';
                this.quickViewContainerCssClass = containerCssClass ? containerCssClass : 'quickViewControl';
            }
            /**
             * Renders the quick view
             * @param controlId The control identifier
             * @param container The control container
             * @param entityLogicalName The entity logical name
             * @param quickFormId The quick form identifier
             * @param recordId The record identifier
             */
            QuickViewControl.prototype.loadQuickView = function (controlId, container, entityLogicalName, quickFormId, recordId) {
                var quickViewContainer = $("<div/>").appendTo(container);
                quickViewContainer.attr('id', controlId + this.quickViewContainerId);
                quickViewContainer.addClass(this.quickViewContainerCssClass);
                this.context.utils.bindDOMElement(this.generateChildQuickViewControl(controlId, container, entityLogicalName, quickFormId, recordId), quickViewContainer.get(0));
            };
            QuickViewControl.prototype.generateChildQuickViewControl = function (controlId, container, entityLogicalName, quickFormId, recordId) {
                if (MktSvc.Controls.Common.String.isNullUndefinedOrWhitespace(recordId)) {
                    recordId = "00000000-0000-0000-0000-000000000000";
                }
                var valueParam = {
                    Usage: 0,
                    Type: "Form.QuickForm",
                    Value: quickFormId + ":Quick|" + entityLogicalName + "|" + recordId,
                    Static: false,
                    Primary: true
                };
                var properties = {
                    controlstates: {
                        hasFocus: this.context.mode.hasFocus,
                        isControlDisabled: this.context.mode.isControlDisabled,
                    },
                    parameters: {
                        "value": valueParam,
                    },
                };
                var quickForm = this.context.factory.createComponent("MscrmControls.Containers.QuickForm", controlId, properties);
                return quickForm;
            };
            QuickViewControl.prototype.dispose = function (controlId) {
                try {
                    this.context.utils.unbindDOMComponent(controlId);
                }
                catch (e) {
                    this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.QuickView.QuickViewControl.dispose", e);
                }
            };
            return QuickViewControl;
        }());
        QuickView.QuickViewControl = QuickViewControl;
    })(QuickView = MktSvcCommon.QuickView || (MktSvcCommon.QuickView = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        var UniqueId = /** @class */ (function () {
            function UniqueId() {
            }
            UniqueId.getUniqueId = function () {
                var uidPrefix = 'xxxxxxxxxxxx'.replace(/[x]/g, function () {
                    var r = Math.floor(Math.random() * 16);
                    return r.toString(16);
                });
                var dateSuffix = (new Date()).getTime();
                var randomDelimiter = Math.random().toString(16).slice(2);
                return "" + uidPrefix + randomDelimiter + dateSuffix;
            };
            return UniqueId;
        }());
        ControlUtils.UniqueId = UniqueId;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="../CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    var ControlUtils;
    (function (ControlUtils) {
        "use strict";
        /**
        * Provides parameters for the child controls in the context of CostumControl composition
        */
        var ControlCompositionParameterProvider = /** @class */ (function () {
            function ControlCompositionParameterProvider() {
            }
            /**
            * Creates a data set parameter, from an existing one, ussualy prvided by the parent
            */
            ControlCompositionParameterProvider.prototype.getDataSetParameter = function (dataSet, targetEntityType) {
                var columns = [];
                dataSet.columns.forEach(function (column) {
                    columns.push({
                        Alias: column.alias,
                        Name: column.name,
                        DataType: column.dataType // data-type of attribute to be bound to
                    });
                });
                return {
                    Columns: columns,
                    ViewId: dataSet.getViewId() || dataSet.viewId,
                    TargetEntityType: targetEntityType,
                    Type: 'Grid'
                };
            };
            /**
           * Creates an input type property parameter
           */
            ControlCompositionParameterProvider.prototype.getInputParameter = function (value) {
                return {
                    Usage: 1,
                    Type: 'SingleLine.Text',
                    Value: value,
                    Static: true,
                    Primary: false
                };
            };
            /**
            * Creates a bound type property parameter
            */
            ControlCompositionParameterProvider.prototype.getBoundParameter = function (value) {
                return {
                    Usage: 0,
                    Type: 'SingleLine.Text',
                    Value: value,
                    Static: false,
                    Primary: true
                };
            };
            /**
            * Creates a false bound type property parameter
            */
            ControlCompositionParameterProvider.prototype.getFalseBoundParameter = function (value) {
                return {
                    Usage: 3,
                    Type: 'SingleLine.Text',
                    Value: value
                };
            };
            return ControlCompositionParameterProvider;
        }());
        ControlUtils.ControlCompositionParameterProvider = ControlCompositionParameterProvider;
    })(ControlUtils = MktSvcCommon.ControlUtils || (MktSvcCommon.ControlUtils = {}));
})(MktSvcCommon || (MktSvcCommon = {}));
// This file was forked from CRM main repository, v9.0 branch
//---------------------------------------------------------------------------------------------------------------
/**
* @license Copyright (c) Microsoft Corporation. All rights reserved.
*/
/// <reference path="CommonReferences.ts" />
var MktSvcCommon;
(function (MktSvcCommon) {
    "use strict";
    var VirtualControlLoadDecorator = /** @class */ (function () {
        function VirtualControlLoadDecorator(controlName) {
            this.controlName = controlName;
            this.decoratedControl = null;
            this.decoratedControlDeferred = null;
            this.logger = null;
        }
        /**
         * Initializes the control. This function will not receive the HTML Div element(as this loader is for Virtual Controls only) that will contain your custom control
         * as well as a function to notify the infrastructure that your outputs have changed and that it should call getOutputs()
         * @param context The "Input Bag" containing the parameters and other control metadata.
         * @param notifyOutputChanged A Callback to notify the infrastructure to read the outputs
         * @param state The control state.
         */
        VirtualControlLoadDecorator.prototype.init = function (context, notifyOutputChanged, state) {
            var _this = this;
            this.logger = new MktSvcCommon.Logger.TelemetryLogger("MktSvcCommon.VirtualControlLoadDecorator", context);
            // register logger for VirtualControlLoadDecorator
            this.startDecorateAsync(context);
            this.decoratedControlDeferred.done(function (decoratedControl) {
                try {
                    decoratedControl.init(context, notifyOutputChanged, state);
                }
                catch (e) {
                    _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.VirtualControlLoadDecorator.init", e, new MktSvc.Controls.Common.Dictionary({ "ControlName": _this.controlName }));
                }
            });
        };
        /**
        * Updates the control with data from the a bag of values currently assigned to the control's manifest parameters
        * @param context The bag of values described above
        */
        VirtualControlLoadDecorator.prototype.updateView = function (context) {
            if (!this.decoratedControl) {
                this.logger.log(MktSvc.Controls.Common.TraceLevel.Info, "MktSvcCommon.VirtualControlLoadDecorator.updateView", new MktSvc.Controls.Common.Dictionary({ "ControlName": this.controlName, Message: "Decorated control is not ready" }));
                return null;
            }
            return this.decoratedControl.updateView(context);
        };
        /**
        * @returns The a bag of output values to pass to the infrastructure
        */
        VirtualControlLoadDecorator.prototype.getOutputs = function () {
            if (!this.decoratedControl) {
                this.logger.log(MktSvc.Controls.Common.TraceLevel.Info, "MktSvcCommon.VirtualControlLoadDecorator.getOutputs", new MktSvc.Controls.Common.Dictionary({ "ControlName": this.controlName, Message: "Decorated control is not ready" }));
                throw Error("Decorated control is not ready");
            }
            return this.decoratedControl.getOutputs();
        };
        /**
        * This function destroys the control and cleans up
        */
        VirtualControlLoadDecorator.prototype.destroy = function () {
            var _this = this;
            if (this.decoratedControlDeferred) {
                this.decoratedControlDeferred.done(function (decoratedControl) {
                    try {
                        decoratedControl.destroy();
                    }
                    catch (e) {
                        _this.logger.logException(MktSvc.Controls.Common.TraceLevel.Error, "MktSvcCommon.VirtualControlLoadDecorator.destroy", e, new MktSvc.Controls.Common.Dictionary({ "ControlName": _this.controlName }));
                    }
                });
            }
        };
        VirtualControlLoadDecorator.prototype.startDecorateAsync = function (context) {
            var _this = this;
            this.decoratedControlDeferred = $.Deferred();
            var controlLoader = this.getControlLoader(context);
            if (!controlLoader) {
                throw Error("ControlLoader not initialized");
            }
            controlLoader.loadControl(this.getScriptDependencies(), this.getStyleSheetDependencies(), this.controlName)
                .done(function (controlLoadResult) {
                _this.decoratedControl = _this.getDecoratedControlInstance(controlLoadResult);
                _this.decoratedControlDeferred.resolve(_this.decoratedControl);
            });
        };
        return VirtualControlLoadDecorator;
    }());
    MktSvcCommon.VirtualControlLoadDecorator = VirtualControlLoadDecorator;
})(MktSvcCommon || (MktSvcCommon = {}));
