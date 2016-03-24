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
  }

  function onCheckboxClick(){
    $(this).attr('checked',!!!$(this).attr('checked'));
    editor.fire('NodeChange');
  }

  function updateCheckboxesClickHandlers(){
    $(':checkbox',editor.getDoc())
    .off('click').on('click',onCheckboxClick);
  }

  editor.on('init change SetContent',updateCheckboxesClickHandlers);

  editor.addMenuItem('forminputs', {
    separator: 'before',
    text: 'Form',
    context: 'insert',
    menu: [{
      text: 'Checkbox',
      onclick: insertCheckbox,
      onPostRender: null
    },{
      text: 'Radio buttons',
      onclick: null,
      onPostRender: null
    }]
  });

});
