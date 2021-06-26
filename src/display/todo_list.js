import { sortSelectedFirst } from "./../utils/utils.js"
import {
  createElement,
  makeIcon,
  getValidItem,
  removeAllChildrens,
  removeChildrensByValidator,
  getValidTopParentTag
} from "./domelement_utils"
import { parseISO, format } from "date-fns";
import {
  RemoveButton,
  EditButton,
  CompleteTodoButton,
  ExitButton,
  SaveButton,
  MakerButton
} from "./action_buttons";
import {
  TodayFilterItem,
  TomorrowFilterItem,
  SelectDateFilterItem,
  SelectPriorityFilterItem
} from "./todo_list_filter";
import { FormCardEditor, TextCardEditor, PriorityCard, DateCard, MoveCard } from "./todo_list_card";
import { ObjectController } from "./object_controller";
import {
  publish,
  Events,
  sendLog,
  subscribeAccept,
  subscribeAction,
  actionValidator,
  unsubscribe
} from "./../controller/controllers";
import {
  getFullCurrentProject
} from "./../controller/app";

let todoListDOMElement = document.getElementById( "todo-list" );
const CONTROLLER = ObjectController();

function requestCreateNewTodo() {
  return true;
}

const CreateTodoButton = MakerButton( todoListDOMElement, "Create new todo", () =>
  TodoEditor( null ), requestCreateNewTodo );

function removeButtonListener( event, todo ) {

  publish( Events.REMOVE_TODO, {
    dataID: todo.dataID
  } );

  let id = subscribeAccept( Events.REMOVE_TODO_ACCEPT, ( msg, data ) => {
    sendLog( `Todo ${todo.getName()} removed.` );
    CONTROLLER.removeObject( todo, true );
    unsubscribe( id );
  } );

}

function editButtonListener( event, todo ) {
  todo.getDOMElement().classList.add( "hidden" );
  todo.getDOMElement().removeAttribute( "expanded" );
  TodoEditor( CONTROLLER.getObjectByDataID( todo.dataID ) );
}

function completeTodoButtonListener( event, todo ) {
  publish( Events.CHECK_TODO, {
    dataID: todo.dataID
  } );

  let id = subscribeAccept( Events.CHECK_TODO_ACCEPT, ( msg, data ) => {
    sendLog( `You completed the todo ${todo.getName()}!` );
    CONTROLLER.removeObject( todo, true );
    unsubscribe( id );
  } );

}

function closeTodoListItem( parentNode, todo ) {
  let parent = parentNode;
  if ( parent.tagName != "LI" )
    parent = getValidTopParentTag( "LI", parent );

  parent.remove();
  if ( todo != null ) {
    todo.show( true );
    todo.getDOMElement().classList.remove( "hidden" );
  }
}

function exitTodoEditorButtonListener( event, parentNode, todo ) {
  closeTodoListItem( parentNode, todo );
}

const TodoEditor = ( todo ) => {
  let domElement = createElement( "li", null, "todo-editor", null,
    todoListDOMElement );

  if ( todo )
    todoListDOMElement.insertBefore( domElement, todo.getDOMElement() );
  let formElement, exitButtonElement, priorityIcon, saveButton;

  function exitButton() {
    exitButtonElement = ExitButton( domElement, exitTodoEditorButtonListener,
      todo );
  }

  function forceExit() {
    exitButtonElement.click();
  }

  function form() {
    formElement = FormCardEditor( domElement, todo );
  }

  function cardText() {
    TextCardEditor( formElement, todo );
  }

  function cardPriority() {
    PriorityCard( formElement, todo );
  }

  function cardDate() {
    DateCard( formElement, todo );
  }

  function submitButton() {
    SaveButton( formElement );
  }

  exitButton();
  form();
  cardText();
  cardPriority();
  cardDate();
  if ( todo )
    MoveCard( formElement, todo );
  submitButton();

  return { forceExit };
};

const CreateFilter = ( () => {
  let domElement = document.getElementById( "filter-tags" );
  TodayFilterItem( domElement );
  TomorrowFilterItem( domElement );
  SelectDateFilterItem( domElement );
  SelectPriorityFilterItem( domElement );
} )();

let currentTodoDataID;

const Todo = ( name, priority, date, description, project, dataID = CONTROLLER.getObjectsList()
  .length + 1 ) => {
  let domElement = null;
  let infoDOMElement = null;

  function buildDOMElement() {
    domElement = createElement( "li", null, null, null, null, null );
    todoListDOMElement.insertBefore( domElement, CreateTodoButton );
  }

  function removeFullDOMChildren( classNames = [ "todo-description",
    "summary", "todo-buttons"
  ] ) {
    removeChildrensByValidator( domElement, ( child ) =>
      classNames.some( ( className ) => child.className.includes(
        className ) ) );
  }

  function isExpanded() {
    return domElement && domElement.hasAttribute( "expanded" );
  }

  function setSlim( force = false ) {
    removeFullDOMChildren();
    domElement.removeAttribute( "expanded" );
    if ( !force )
      sendCloseTodo();

  }

  function sendCloseTodo() {
    publish( Events.CLOSE_TODO, {
      dataID
    } );
  }

  function buildContent() {
    createElement( "i", "fas fa-angle-double-up todo-priority-icon p" +
      priority, null, null, domElement, null );
    infoDOMElement = createElement( "div",
      "todo-information", null, null,
      domElement,
      null );
    createElement( "p", "todo-name", null, name, infoDOMElement,
      null );
    let dateFormat = date ? format( parseISO( date ),
      'EEEE, dd, MMMM, y' ) : null;
    createElement( "small", "todo-date", null, dateFormat,
      infoDOMElement, null );
    CompleteTodoButton( domElement, completeTodoButtonListener, getObject() );
  }

  function buildExpandContent() {
    if ( description != null ) {
      createElement( "small", "summary", null, "description",
        infoDOMElement, null )
      createElement( "p", "todo-description", null, getDescription(),
        infoDOMElement, null )
    }

    createButtonsElements();
  }

  function createButtonsElements() {
    if ( domElement == null )
      return;

    let div = createElement( "div", "todo-buttons", null, null,
      infoDOMElement, null );
    EditButton( div, editButtonListener, getObject() );
    RemoveButton( div, removeButtonListener, getObject() );
  }

  function reduceTodo() {
    if ( isExpanded() )
      setSlim();

  }

  function show( rebuild = false ) {

    if ( !rebuild ) {
      buildDOMElement();
      domElement.addEventListener( "click", listen );
    } else {
      removeAllChildrens( domElement );
    }

    buildContent();
  }

  function setOtherSlim() {
    if ( currentTodoDataID ) {
      let otherTodo = CONTROLLER.getObjectByDataID( currentTodoDataID );
      if ( otherTodo )
        otherTodo.setSlim();
    }
  }

  function expand() {
    setOtherSlim();

    if ( domElement == null )
      show();

    domElement.setAttribute( "expanded", "" );

    buildExpandContent();
    currentTodoDataID = dataID;

    publish( Events.OPEN_TODO, {
      dataID
    } );
  }

  function listen( event ) {

    if ( event.target.className.includes( "todo-checkbox" ) ) return;

    if ( getValidItem( event.target, "button", [ "i" ] ) )
      return;
    if ( domElement.hasAttribute( "expanded" ) ) {
      reduceTodo();
    } else
      expand();
    return;

  }

  function getName() {
    return name;
  }

  function getDescription() {
    return description;
  }

  function getPriority() {
    return priority;
  }

  function getDate() {
    return date;
  }

  function getObject() {
    return CONTROLLER.getObjectsList().filter( ( todoObj ) => todoObj[
      "object" ].dataID == dataID )[
      0 ].object;
  }

  function getProject() {
    return project;
  }

  function getDOMElement() {
    return domElement;
  }

  function setName( _name ) {
    name = _name;
  }

  function setPriority( _priority ) {
    priority = _priority;
  }

  function setDate( _date ) {
    date = _date;
  }

  function setDescription( _description ) {
    description = _description;
  }

  function setProject( _project ) {
    project = _project;
  }

  function toString() {
    return `${name} ${description} ${priority} ${date}`;
  }

  return {
    show,
    toString,
    expand,
    setSlim,
    dataID,
    getName,
    getDescription,
    getPriority,
    getDate,
    getDescription,
    getDOMElement,
    getObject,
    getProject,
    setDescription,
    setDate,
    setPriority,
    setName,
    setProject
  };
};

function showTodosByFilter( filter, project ) {
  let todos = CONTROLLER.getObjectsList().filter( ( todo ) => todo[ "object" ].getProject() ==
    project );
  todos.forEach( ( todo ) => todo[ "object" ].setSlim() );
  todos = todos.filter( filter );
  for ( let todo of todos ) {
    todo[ "object" ].show();
  }
}

function listenProjectChanges() {
  subscribeAccept( Events.OPEN_PROJECT_ACCEPT, ( msg, data ) => {
    removeAllTodos();
    buildAllTodos( getFullCurrentProject().todos );
  } );
}

function listenForceLoadTodos() {
  subscribeAction( Events.FORCE_LOAD_TODOS,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todos values, retry again." ), ( data ) => {
      removeAllTodos();
      buildAllTodos( getFullCurrentProject().todos );
    }
  );
}

function removeAllTodos() {
  CONTROLLER.getObjectsList().forEach( ( obj ) => CONTROLLER.removeObject( obj.object,
    true ) );
}

function buildAllTodos( todos ) {
  for ( let todo of todos ) {
    CONTROLLER.buildObject( Todo, todo.name, todo.priority, todo.date,
      todo.description, todo.projectName, todo.dataID ).show();
  }
}

listenProjectChanges();
listenForceLoadTodos();
export {
  showTodosByFilter,
  Todo,
  TodoEditor,
  closeTodoListItem,
  CONTROLLER
};
