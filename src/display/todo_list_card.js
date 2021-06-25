import { createElement, setAttributes } from "./domelement_utils";
import { sortSelectedFirst } from "./../utils/utils.js";
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoEditor, closeTodoListItem, CONTROLLER } from "./todo_list";
import {
  publish,
  Events,
  sendLog,
  subscribeAccept,
  unsubscribe
} from "./../controller/controllers";
import {
  getCurrentProject,
  getProjects
} from "./../controller/app";

const priorityDisplay = {
  p1: "Minimum",
  p2: "Normal",
  p3: "High",
  p4: "Important"
};

const Card = ( parentNode, todo = null ) => {
  function listener() {

  }
};

const FormCardEditor = ( parentNode, todo = null ) => {
  function listener( event ) {
    let name = event.target[ 0 ].value;
    let description = event.target[ 1 ].value;
    let priority = event.target[ 2 ].value;
    let date = event.target[ 3 ].value;
    let projectName = event.target[ 4 ].value;

    if ( todo ) {
      publish( Events.EDIT_TODO, {
        name,
        description,
        priority,
        date,
        projectName,
        dataID: todo.dataID
      } );

      let id = subscribeAccept( Events.EDIT_TODO_ACCEPT, ( msg, data ) => {
        sendLog( `Todo ${name} edited.` );
        CONTROLLER.removeObjectByDataID( todo.dataID );

        todo.setName( name );
        todo.setDescription( description );
        todo.setPriority( priority );
        todo.setDate( date );
        todo.setProject( projectName );

        if ( todo.getProject() != getCurrentProject() )
          CONTROLLER.removeObject( todo );

        CONTROLLER.addObject( todo );
        todo.show( true );
        unsubscribe( id );
      } );

    } else {
      let dataID = uuidv4();
      projectName = getCurrentProject();
      publish( Events.CREATE_TODO, {
        name,
        description,
        priority,
        date,
        projectName,
        dataID
      } );

      let id = subscribeAccept( Events.CREATE_TODO_ACCEPT, ( msg, data ) => {
        sendLog( `Todo ${name} on project ${projectName} created!` );
        CONTROLLER.buildObject( Todo, name, priority, date, description,
          getCurrentProject(), dataID ).show();
        unsubscribe( id );
      } );
    }
    closeTodoListItem( parentNode, todo );
    event.preventDefault();
  }

  let card = createElement( "form", null, null, null,
    parentNode );
  card.addEventListener( "submit", listener );
  return card;
};

const TextCardEditor = ( parentNode, todo = null ) => {
  function listener() {

  }

  let card = createElement( "div", "todo-editor-card text", null, null,
    parentNode );
  createElement( "label", "summary small-text", null, "todo name", card,
    [
      "for", "todo-name"
    ] );

  let todoName = createElement( "input", "custom-input", null, null, card,
    [
      "type", "text"
    ], [ "name", "todo-name" ], [ "placeholder",
      "insert todo name here"
    ],
    [ "required", "" ] );

  createElement( "label", "summary small-text",
    null, "description", card, [ "for", "todo-description" ] );

  let todoDescription = createElement( "textarea",
    "todo-create-description custom-input",
    null, null, card, [ "name", "todo-description" ], [ "placeholder",
      "Insert todo description here"
    ] );

  if ( todo ) {
    setAttributes( todoName, [
      [ "value", todo.getName() ]
    ] );
    todoDescription.textContent = todo.getDescription()
  }
  return card;
};

const PriorityCard = ( parentNode, todo = null, forceIntro = false ) => {
  let priorityIcon;

  function listener() {
    let priorityValue = parentNode[ 2 ] == null ? parentNode[ 0 ] :
      parentNode[ 2 ];
    priorityValue = priorityValue.value;
    priorityIcon.className =
      "fas fa-angle-double-up todo-priority-icon p" +
      priorityValue;
  }

  function _createOptionsPriority( select, forceIntro = false ) {
    let priorityNumbers = [ 1, 2, 3, 4 ];

    if ( forceIntro ) {
      createElement( "option", null, null, "Select Priority", select, [
        "value", `0`
      ] );
    }

    if ( todo )
      priorityNumbers = sortSelectedFirst( priorityNumbers, todo.getPriority() );

    for ( let number of priorityNumbers )
      _createOptionPriority( number, select );
    listener();
  }

  function _createOptionPriority( number, parent ) {
    let priority = priorityDisplay[ `p${number}` ];
    let option = createElement( "option", null, null,
      priority, parent, [ "value", `${number}` ] );
  }

  let card = createElement( "div",
    "todo-priority-editor todo-editor-card priority", null, null,
    parentNode );
  let todoPriority = todo ? "p" + todo.getPriority() : "p2";
  priorityIcon = createElement( "i",
    "fas fa-angle-double-up todo-priority-icon " +
    todoPriority, null, null, card );
  let div = createElement( "div", null, null, null,
    card );
  createElement( "label", "summary small-text",
    null, "select priority", div, [ "for", "todo-priority" ] );
  let select = createElement( "select", "custom-input", null, null,
    div, [ "name", "todo-priority" ] );

  _createOptionsPriority( select, forceIntro );

  select.addEventListener( "change", listener );
  return card;
};

const DateCard = ( parentNode, todo = null ) => {

  let card = createElement( "div",
    "todo-date-editor todo-editor-card date", null, null,
    parentNode );
  createElement( "i", "fas fa-calendar-day", null, null,
    card );
  let div = createElement( "div", null, null, null, card );
  createElement( "label", "summary small-text",
    null, "select date", div, [ "for", "todo-date" ] );
  let todoDate = todo ? todo.getDate() : "";
  createElement( "input", "custom-input",
    null, null, div, [ "type", "date" ], [ "name", "todo-date" ], [
      "value", todoDate
    ] );
  return card;
};

const MoveCard = ( parentNode, todo = null ) => {

  let card = createElement( "div",
    "todo-date-editor todo-editor-card move", null, null,
    parentNode );
  createElement( "i", "fas fa-folder neutral-icon", null, null,
    card );
  let div = createElement( "div", null, null, null, card );
  createElement( "label", "summary small-text",
    null, "move to other project", div, [ "for", "todo-move" ] );

  let select = createElement( "select", "custom-input",
    null, null, div, [ "name", "todo-move" ] );
  let projects = sortSelectedFirst( getProjects(), todo.getProject() );

  for ( let project of projects ) {
    createElement( "option", null, null, project, select, [ "value",
      `${project}`
    ] );
  }

  return card;
};

export { FormCardEditor, TextCardEditor, PriorityCard, DateCard, MoveCard }
