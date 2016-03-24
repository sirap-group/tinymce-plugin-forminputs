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
    var labelElement = editor.dom.create('label', null, 'ma case à cocher');

    console.log(labelElement);
    console.log(inputElement);

    editor.dom.add(labelElement,inputElement);
    editor.dom.add(selection,labelElement);

    tinymce.DOM.bind(inputElement,'click',function(){
      alert('click');
    });

  }

  console.log('tinymce',tinymce);

  jQuery("#frameName").contents().find(":checkbox").bind('click', function(){
          val = this.checked; //<---
          alert("changed");
  });

setTimeout(function(){
  // console.log(editor.getDoc());
  // tinymce.DOM.bind(document,'click',function(){
  //   alert('click editor');
  // });
  var checkboxes = $(':checkbox',editor.getDoc());
  console.log('checkboxes',checkboxes);
  checkboxes.on('mouseover',function(){
    var isOver = true;
    var box = this;
    $(box).on('mouseout',function(){
      isOver = false;
    });
    $(editor.getDoc()).on('click',function(){
      if (isOver) {
        console.log('checkbox clicked !');
      }
    });
  });
  checkboxes.on('focus',function(){

  });
},500);

  editor.on('NodeChange',function(evt,a,b){
    console.log('NodeChange');
    console.log(evt,a,b);
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
