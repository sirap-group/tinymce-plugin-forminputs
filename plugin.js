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
    // console.log(evt);

    var body = editor.getBody();
    var selection = editor.selection.getNode();
    var inputElement = editor.dom.create('input', {type:'checkbox'});
    var labelElement = editor.dom.create('label', null, prompt('Saisir un label pour la case à chocher'));

    editor.dom.add(labelElement,inputElement);
    editor.dom.add(selection,labelElement);

  }

    });


  editor.addMenuItem('forminputs', {
    separator: 'before',
    text: 'Form',
    context: 'insert',
    menu: [
      // {text: 'Text', onclick: null, onPostRender: null},
      {text: 'Checkbox', onclick: insertCheckbox, onPostRender: null},
      // {text: 'Radio buttons', onclick: null, onPostRender: null}
    ]
  });

});
