/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 2015 SIRAP SAS All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function (window) {
  'use strict'

  var prompt = window.prompt
  var confirm = window.confirm
  var $ = window.$
  var tinymce = window.tinymce

  tinymce.PluginManager.add('forminputs', forminputsPlugin)

  var CallOnceOnTimeoutFactory = createCallOnceOnTimeoutFactory()

  function createCallOnceOnTimeoutFactory () {
    function CallOnceOnTimeoutFactory (timeout, updateFunction) {
      this.timeout = timeout
      this.launched = false
      this.callback = null

      // set or update the callback but don't update it if `updateFunction` is set to false.
      if (updateFunction === undefined) this.updateFunction = true
      else this.updateFunction = updateFunction

      console.log('this.updateFunction', this.updateFunction)
    }

    CallOnceOnTimeoutFactory.prototype.updateCallback = updateCallback
    CallOnceOnTimeoutFactory.prototype.callCallback = callCallback
    CallOnceOnTimeoutFactory.prototype.callOnce = callOnce

    return CallOnceOnTimeoutFactory

    function updateCallback (callback) {
      this.callback = callback
    }
    function callCallback () {
      this.launched = false
      this.callback()
    }
    function callOnce (syncFn) {
      var that = this
      if (this.updateFunction || this.callback === null) this.updateCallback(syncFn)
      if (!this.launched) {
        this.launched = true
        setTimeout(function () {
          that.callCallback()
        }, this.timeout)
      }
    }
  }

  function forminputsPlugin (editor) {
    var isMergeFieldBindingEnabled = false

    // exports enableMergeFieldBinding method to the plugin API
    // example of usage:
    // editor.plugins.forminputs.enableMergeFieldBinding() // to enable mergeField/checkbox bindings
    this.enableMergeFieldBinding = enableMergeFieldBinding.bind(this, true)
    // editor.plugins.forminputs.disableMergeFieldBinding() // to disable mergeField/checkbox bindings
    this.disableMergeFieldBinding = enableMergeFieldBinding.bind(this, false)

    var callOnceUpdateCheckboxesClickHandler = new CallOnceOnTimeoutFactory(150)

    editor.on('init NodeChange change SetContent', function () {
      callOnceUpdateCheckboxesClickHandler.callOnce(updateCheckboxesClickHandlers)
    })

    editor.on('init', disableContentEditableToAllLabels)

    editor.addMenuItem('forminputs', {
      separator: 'before',
      text: 'Form',
      context: 'insert',
      menu: [{
        text: 'Checkbox',
        onclick: insertCheckbox,
        onPostRender: null
      }]
    })

    function enableMergeFieldBinding (enabling) {
      console.info('Binding of merge fields and checkbox values enabled')
      isMergeFieldBindingEnabled = !!enabling
    }

    function insertCheckbox (evt) {
      // var body = editor.getBody()
      var selection = editor.selection.getNode()

      // create the input element
      var inputElement = editor.dom.create('input', {type: 'checkbox'})
      var $inputElement = $(inputElement)
      inputElement.indeterminate = true

      // ask the user for what he wants to do
      var isLockedForMergeFields, mergeFieldCode
      var labelText = prompt('Saisir un label pour la case à chocher')
      var isLabelBeforeBox = confirm('Voulez-vous placer la case devant le label ?')
      if (isMergeFieldBindingEnabled) {
        isLockedForMergeFields = confirm('Voulez-vous que cette case à cocher soit vérouillée par un champ de fusion ?')
        if (isLockedForMergeFields) {
          mergeFieldCode = prompt('Quel est le code du champ de fusion a associer ?')
        }
      }

      // locks the checkbox for merge field binding if wanted
      if (isLockedForMergeFields) {
        $inputElement.attr('disabled', 'disabled')
        $inputElement.attr('data-merge-field-code', mergeFieldCode)
      }

      // create the label element
      var labelElement = editor.dom.create('label', null)
      var $labelElement = $(labelElement)

      // define the input ID to associate the label with
      var inputId = 'input-checkbox-' + Date.now()
      $labelElement.attr('for', inputId)
      $inputElement.attr('id', inputId)

      // search the closest font family and size
      var selectedNode = editor.selection.getNode()
      var closestFontConfig = getClosestNodeWithFontConfig(selectedNode, 'Calibri', '12pt', editor)
      // create the span element to wrap the label text into the label element
      var labelSpanElement = $('<span>')
      .html(labelText)
      .attr('contenteditable', false)
      .css(closestFontConfig)
      // and append it to the label element
      labelSpanElement.appendTo(labelElement)

      editor.dom.setAttrib(labelElement, 'contenteditable', false)
      if (isLabelBeforeBox) {
        $inputElement.appendTo(labelElement)
      } else {
        $inputElement.prependTo(labelElement)
      }

      // append elements to the document
      editor.dom.add(selection, labelElement)

      // render the changes
      // editor.fire('change')
      editor.nodeChanged()
    }

    function onCheckboxClick (evt) {
      evt.preventDefault()
      evt.stopPropagation()

      var $thisBox = $(this)
      if (!$thisBox.attr('checked')) {
        $thisBox.attr('checked', 'checked')
      } else {
        $thisBox.removeAttr('checked')
      }

      // hotfix !
      // without that, the checkbox rendering never switch to "checked" even if
      // it is in the DOM
      editor.setContent(editor.getContent())
    }

    function updateCheckboxesClickHandlers () {
      $(':checkbox', editor.getDoc()).each(function () {
        var box = this
        var parent = $(this).parent().get(0)
        if (parent.tagName !== 'LABEL') {
          parent = $('<label>')
          $(box).wrap(parent)
        }
        $(parent).off('click').on('click', function (evt) {
          onCheckboxClick.call(box, evt)
        })
      })
    }

    function disableContentEditableToAllLabels (evt) {
      setTimeout(searchAndDisable, 200)

      function searchAndDisable () {
        // all checkboxes
        var $checkboxes = $('input[type=checkbox]', editor.getDoc())

        // disabled label wrapped ones
        $checkboxes.filter(function () {
          return $(this).parent()[0].nodeName === 'LABEL'
        }).parent().attr('contenteditable', false)

        // wrap and disable the unwrapped ones
        $checkboxes.filter(function () {
          return $(this).parent()[0].nodeName !== 'LABEL'
        }).wrap($('label').attr('contenteditable', false))
      }
    }
  }

  /**
   * @typedef FontConfig
   * @type object
   * @property {string} fontFamily The font-family name
   * @property {string} fontSize The font-size with unit (ex: "12pt")
   */

  /**
   * Search the closest span element for wich font size and family is defined. Begins with previous, then next, and finally search through the ancestors and their children
   * @function
   * @param {DOMNode} the node from wich the search starts
   * @returns {null|FontConfig}
   */
  function getClosestNodeWithFontConfig (node, defaultFamily, defaultSize, editor) {
    var $node = $(node)
    var $currentNode
    var found, $found

    // is node ok itself ?
    $currentNode = $node.filter(fontConfigFilter)
    if ($currentNode.length) {
      $found = $currentNode
    } else {
      var $allNodes = $('*', editor.getDoc())
      var nodePosition = $allNodes.index(node)

      var $allSpans = $('span', editor.getDoc()).filter(fontConfigFilter)
      var allSpanPositions = $allSpans.map(function (i, el) {
        return $allNodes.index(el)
      })

      var lowerPositions = []
      var greaterPositions = []
      $.each(allSpanPositions, function (i, documentPosition) {
        if (documentPosition < nodePosition) {
          lowerPositions.push(documentPosition)
        } else if (documentPosition > nodePosition) {
          greaterPositions.push(documentPosition)
        }
      })

      var prevIndex = Math.max.apply(null, lowerPositions)
      var nextIndex = Math.min.apply(null, greaterPositions)

      if (!isNaN(prevIndex) && isFinite(prevIndex)) {
        found = $allNodes[prevIndex]
      } else if (!isNaN(nextIndex) && isFinite(nextIndex)) {
        found = $allNodes[nextIndex]
      }
      if (found) {
        $found = $(found)
      }
    }

    if ($found) {
      return getConfigFromElement($found)
    } else {
      return {
        fontFamily: defaultFamily,
        fontSize: defaultSize
      }
    }
  }

  /**
   * A jquery filter to filter span elements having fontFamily and fontSize defined
   * @function
   * @returns {boolean} true|false
   */
  function fontConfigFilter () {
    return (this.style.fontFamily && this.style.fontSize)
  }

  /**
   * A handy function to return a FontConfig type object from the element styles values
   * @function
   * @param {jQuery} $element A jQuery object from the element to lookup the font style rules
   * @returns {FontConfig} the resulting fontConfig object
   */
  function getConfigFromElement ($element) {
    return {
      fontFamily: $element[0].style.fontFamily,
      fontSize: $element[0].style.fontSize
    }
  }
})(window)
