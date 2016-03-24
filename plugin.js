/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 2015 SIRAP SAS All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('forminputs', function(editor) {

  function insertCheckbox(evt){
    var body = editor.getBody();
    var selection = editor.selection.getNode();
    var inputElement = editor.dom.create('input', {type:'checkbox'});
    var labelElement = editor.dom.create('label', null, prompt('Saisir un label pour la case à chocher'));

    editor.dom.add(labelElement,inputElement);
    editor.dom.add(selection,labelElement);
    editor.fire('change');
  }

  function onCheckboxClick(){
    var toggle = !!$(this).attr('checked'); console.log('toggle',toggle,!toggle);
    $(this).attr('checked',!toggle);
    editor.fire('change');
  }

  function updateCheckboxesClickHandlers(){
    $(':checkbox',editor.getDoc()).each(function(){
      var box = this;
      var parent = $(this).parent().get(0);
      if (parent.tagName !== 'LABEL') {
        parent = $('<label>');
        $(this).wrap(parent);
        console.log(parent);
      }
      $(parent).off('click').on('click',function(){
        console.log('onCheckboxClick.call ...')
        onCheckboxClick.call(box);
      });
    });
  }

  editor.on('init change SetContent',updateCheckboxesClickHandlers);
  var CallOnceOnTimeoutFactory = (function(){
    function CallOnceOnTimeoutFactory(timeout){
      this.timeout = timeout;
      this.launched = false;
      this.callback = null;
    }
    CallOnceOnTimeoutFactory.prototype.updateCallback = function(callback){
      this.callback = function(){
        callback();
      };
    };
    CallOnceOnTimeoutFactory.prototype.callCallback = function(){
      this.launched = false;
      this.callback();
    };
    CallOnceOnTimeoutFactory.prototype.callOnce = function(syncFn){
      var that = this;
      this.updateCallback(syncFn);
      if (!this.launched) {
        this.launched = true;
        setTimeout(function(){
          that.callCallback();
        },this.timeout);
      }
    };
    return CallOnceOnTimeoutFactory;
  })();

  editor.addMenuItem('forminputs', {
    separator: 'before',
    text: 'Form',
    context: 'insert',
    menu: [{
      text: 'Checkbox',
      onclick: insertCheckbox,
      onPostRender: null
    }]
  });

});
