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
  var $ = window.$
  var tinymce = window.tinymce

  tinymce.PluginManager.add('forminputs', function (editor) {
    function insertCheckbox (evt) {
      // var body = editor.getBody()
      var selection = editor.selection.getNode()
      var inputElement = editor.dom.create('input', {type: 'checkbox'})
      var labelElement = editor.dom.create('label', null, prompt('Saisir un label pour la case à chocher'))
      editor.dom.setAttrib(labelElement, 'contenteditable', false)
      editor.dom.add(labelElement, inputElement)
      editor.dom.add(selection, labelElement)
      // editor.fire('change')
      editor.nodeChanged()
    }

    function onCheckboxClick (evt) {
      evt.preventDefault()

      console.log(this, evt)

      var thisBox = $(this)
      var toggle = !!thisBox.attr('checked')
      var clone = thisBox.clone()
      console.log('toggle', toggle, !toggle)

      clone.attr('checked', !toggle)
      clone.insertAfter(thisBox)
      thisBox.remove()
      editor.nodeChanged()
      editor.fire('change')
      editor.fire('SetContent')
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

    var CallOnceOnTimeoutFactory = (function () {
      function CallOnceOnTimeoutFactory (timeout, updateFunction) {
        this.timeout = timeout
        this.launched = false
        this.callback = null

        // set or update the callback but don't update it if `updateFunction` is set to false.
        if (updateFunction === undefined) this.updateFunction = true
        else this.updateFunction = updateFunction

        console.log('this.updateFunction', this.updateFunction)
      }
      CallOnceOnTimeoutFactory.prototype.updateCallback = function (callback) {
        this.callback = callback
      }
      CallOnceOnTimeoutFactory.prototype.callCallback = function () {
        this.launched = false
        this.callback()
      }
      CallOnceOnTimeoutFactory.prototype.callOnce = function (syncFn) {
        var that = this
        if (this.updateFunction || this.callback === null) this.updateCallback(syncFn)
        if (!this.launched) {
          this.launched = true
          setTimeout(function () {
            that.callCallback()
          }, this.timeout)
        }
      }
      return CallOnceOnTimeoutFactory
    })()

    var callOnceUpdateCheckboxesClickHandler = new CallOnceOnTimeoutFactory(150)

    editor.on('init NodeChange change SetContent', function () {
      callOnceUpdateCheckboxesClickHandler.callOnce(updateCheckboxesClickHandlers)
    })

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
  })
})(window)
