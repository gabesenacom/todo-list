import {
  createElement,
  makeIcon,
  setAttributes,
  getValidItem,
  removeAllChildrens,
  removeChildrensByValidator,
  getValidTopParentTag
} from "./domelement_utils"
//import { format } from 'date-fns'
import { parseISO, format, isToday, isTomorrow, isSameDay } from 'date-fns'

let todoListDOMElement = document.getElementById( "todo-list" );
let todoList = [];
let currentProject = "Inbox";

const priorityDisplay = {
  p1: "Minimum",
  p2: "Normal",
  p3: "High",
  p4: "Important"
};

const Button = ( todo, parentNode ) => {

  const buttonElement = ( parent, text, iconClass, listener ) => {
    let button = createElement( "button", "btn action-btn", null, text,
      parent, [ "data-btn-type", text.toLowerCase() ] );
    makeIcon( iconClass, button );
    if ( listener )
      button.addEventListener( "click", listener );
    return button;
  }

  return { buttonElement };
};

const CreateTodoButton = ( () => {
  let blocked = false;
  let editor;
  const listener = () => {
    if ( blocked ) {
      if ( editor )
        editor.forceExit();
      blocked = false;
    }
    //send a submit with request
    // if accept, run code bellow.
    // EX: CAN I create new todo? Yes? Send me project open. I will open the todo editor.
    editor = TodoEditor( null );
    blocked = true;
  };

  let li = createElement( "li", "create-item", "todo-maker", null,
    todoListDOMElement,
    null );
  let div = createElement( "div", null, null, null, li, null );
  let small = createElement( "small", null, null, "click here to", div,
    null );
  let p = createElement( "p", null, null, "Create new todo", div, null );
  makeIcon( "fas fa-plus success-icon", li );
  li.addEventListener( "click", listener );
  return li;
} )();

const RemoveButton = ( todo, parentNode ) => {
  const { buttonElement } = Button( todo, parentNode );

  const listener = () => {
    //send a submit with request
    // if accept, run code bellow.
    // EX: CAN REMOVE THE TODO X ON PROJECT Y? YES? OK, I'LL REMOVE TODO DISPLAY AND TODOLIST
    console.log( "todo remove! 333", todo.getObject() );
    removeTodo( todo, true );
  };

  let button = buttonElement( parentNode, "Remove",
    "fas fa-trash-alt danger-icon", listener );
  button.classList.add( "danger-btn" );
  return { button };
};

const EditButton = ( todo, parentNode ) => {
  const { buttonElement } = Button( todo, parentNode );

  const listener = () => {
    todo.getTodoDOMElement().classList.add( "hidden" );
    todo.getTodoDOMElement().removeAttribute( "expanded" );
    TodoEditor( getTodoByDataID( todo.dataID ) );
  };

  let button = buttonElement( parentNode, "Edit", "fas fa-edit neutral-icon",
    listener );

  return button;
};

const CompleteTodoButton = ( todo, parentNode ) => {
  const { buttonElement } = Button( todo, parentNode );

  const listener = () => {
    //send a request
    // if accept, run code bellow.
    // EX: YOU CAN COMPLETE THIS TODO? YES? OK, I W'LL DELETE THIS TODO AND REQUEST A MESSAGE: YOU COMPLETED THE TODO {TODO NAME}!!
    console.log( "todo completed!" );
    removeTodo( todo, true );
  };

  let button = createElement( "i", "fas fa-square todo-checkbox", null, null,
    parentNode, null );
  button.addEventListener( "click", listener );
  return button;
};

function closeTodoListItem( parentNode, todo ) {
  let parent = parentNode;
  if ( parent.tagName != "LI" )
    parent = getValidTopParentTag( "LI", parent );

  parent.remove();
  if ( todo != null ) {
    todo.show( true );
    todo.getTodoDOMElement().classList.remove( "hidden" );
  }
}

const TodoEditorButton = ( todo, parentNode ) => {
  const { buttonElement } = Button( todo, parentNode );

  return { buttonElement };
};

const ExitTodoEditorButton = ( todo, parentNode ) => {

  function listener() {
    closeTodoListItem( parentNode, todo );
  }

  let exitButtonElement = createElement( "i",
    "fas fa-times danger-icon exitButton", null, null,
    parentNode );
  exitButtonElement.addEventListener( "click", listener );

  return exitButtonElement;
};

const SaveTodoEditorButton = ( todo, parentNode ) => {
  const { buttonElement } = TodoEditorButton( todo, parentNode );

  buttonElement( parentNode, "Save", "fas fa-plus", null );
  return { buttonElement };
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
      //send a submit with data
      // if accept, run code bellow.
      // YOU CAN CHANGE THIS DATA OF THIS TODO? YES? OK, I'LL CHANGE HERE AND DISPLAY NEW TODO VALUES.
      removeTodoByDataID( todo.dataID );

      todo.setName( name );
      todo.setDescription( description );
      todo.setPriority( priority );
      todo.setDate( date );
      todo.setProject( projectName );

      if ( todo.getProject() != currentProject )
        removeTodo( todo );

      addTodo( todo );
    } else {
      //send a submit with data
      // if accept, run code bellow.
      // YOU CAN CREATE THIS TODO ON PROJECT X? I W'LL PASS THE DATA. YES? OK, I W'LL BUILD.
      buildTodo( name, priority, date, description, currentProject ).show();
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
  createElement( "label", "summary small-text", null, "todo name", card, [
    "for", "todo-name"
  ] );

  let todoName = createElement( "input", "custom-input", null, null, card, [
      "type", "text"
    ], [ "name", "todo-name" ], [ "placeholder", "insert todo name here" ],
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
    priorityIcon.className = "fas fa-angle-double-up todo-priority-icon p" +
      priorityValue;
  }

  function _createOptionsPriority( select, forceIntro = false ) {
    let priorityNumbers = [ 1, 2, 3, 4 ];

    if(forceIntro) {
      createElement( "option", null, null, "Select Priority", select, [ "value", `0` ] );
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

const TodoEditor = ( todo ) => {
  let domElement = createElement( "li", null, "todo-editor", null,
    todoListDOMElement );

  if ( todo )
    todoListDOMElement.insertBefore( domElement, todo.getTodoDOMElement() );
  let formElement, exitButtonElement, priorityIcon, saveButton;

  function exitButton() {
    exitButtonElement = ExitTodoEditorButton( todo, domElement );
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
    SaveTodoEditorButton( todo, formElement );
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

let FilterItemOpen = null;

function closeFilterItemOpen() {
  if ( FilterItemOpen )
    FilterItemOpen.remove();
}

const FilterItem = ( parentNode, text, validatorCallback, iconClass = null ) => {

  function listen(event, anotherValidator = null) {
    ClearFilterItem.show();
    closeFilterItemOpen();
    removeAllTodosDisplay();
    showTodosByFilter( ( todo ) => {
      let date = parseISO( todo[ "todo" ].getDate() );
      if(validatorCallback)
      return validatorCallback.call( this, date, todo );
      if(anotherValidator)
        return anotherValidator.call(this, date, todo);
    }, currentProject );
  }

  const build = () => {
    let li = createElement( "li", null, null, text,
      parentNode, null );
    if ( iconClass )
      makeIcon( iconClass, li );
    if(validatorCallback)
    li.addEventListener( "click", listen );
    return li;
  };

  return { build, listen };
};

const TodayFilterItem = ( parentNode ) => {
  const {build, listen} = FilterItem( parentNode, "Today", validator );

  function validator( date ) {
    return isToday( date );
  }

  return build();
};

const TomorrowFilterItem = ( parentNode ) => {

  const {build, listen} = FilterItem( parentNode, "Tomorrow", validator );

  function validator( date ) {
    return isTomorrow( date );
  }

  return build();
};

const DinamicFilterItem = ( parentNode, card, formListenerCallback ) => {
  let form;

  function listener( event ) {
    ClearFilterItem.show();
    closeFilterItemOpen();
    expand();
  }

  function expand() {
    form = createElement( "form", "filter-form", null, null,
      parentNode, null );
    FilterItemOpen = form;
    card.call( this, form, null, true );
    form.addEventListener( "change", formListenerCallback );
  }

  return { listener, expand, form };
};

const SelectPriorityFilterItem = ( parentNode ) => {
  const {build, listen} = FilterItem( parentNode, "Select priority", null, "fas fa-angle-double-up" );
  const { listener, expand, form } = DinamicFilterItem( parentNode,
    PriorityCard, listenExpandChange );

  function listenExpandChange(event) {
    listen(event, (date, todo) => Number(event.target.value) == todo["todo"].getPriority());
  }

  let item = build();
  item.addEventListener("click", listener);
  return item;
};

const SelectDateFilterItem = ( parentNode ) => {
  const {build, listen} = FilterItem( parentNode, "Select date", null, "fas fa-calendar-day" );
  const { listener, expand, form } = DinamicFilterItem( parentNode,
    DateCard, listenExpandChange );

  function listenExpandChange(event) {
    listen(event, (date, todo) => isSameDay(date, parseISO(event.target.value)));
  }

  let item = build();
  item.addEventListener("click", listener);
  return item;
};

const CreateFilter = ( () => {
  let domElement = document.getElementById( "filter-tags" );
  TodayFilterItem( domElement );
  TomorrowFilterItem( domElement );
  SelectDateFilterItem( domElement );
  SelectPriorityFilterItem( domElement );
} )();

const ClearFilterItem = (( ) => {
  const {build, listen} = FilterItem( document.getElementById( "filter-tags" ), null, null, "fas fa-times danger-icon" );

  function listener( date ) {
    closeFilterItemOpen();
    removeAllTodosDisplay();
    showTodosByFilter(()=>true, currentProject);
    hide();
  }

  let item = build();
  item.addEventListener("click", listener);
  hide();

  function show() {
    item.classList.remove("hidden");
  }

  function hide() {
    item.classList.add("hidden");
  }

  return {show, hide, item};
})();

const Todo = ( name, priority, date, description, project ) => {

  let domElement = null;
  let infoDOMElement = null;
  let dataID = todoList.length + 1;

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

  function setSlim() {
    removeFullDOMChildren();
    domElement.removeAttribute( "expanded" );
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
    CompleteTodoButton( getObject(), domElement );
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
    EditButton( getObject(), div );
    RemoveButton( getObject(), div );
  }

  function show( rebuild = false ) {
    if ( isExpanded() ) {
      setSlim();
      return;
    }

    if ( !rebuild ) {
      buildDOMElement();
      domElement.addEventListener( "click", listen );
    } else {
      removeAllChildrens( domElement );
    }

    buildContent();
  }

  function expand() {

    if ( domElement == null )
      show();

    domElement.setAttribute( "expanded", "" );

    buildExpandContent();

    // Send request to open notes dashboard
    // YOU CAN OPEN THE NOTES? YES? OK!
  }

  function listen( event ) {

    if ( event.target.className.includes( "todo-checkbox" ) ) return;

    if ( getValidItem( event.target, "button", [ "i" ] ) )
      return;
    if ( domElement.hasAttribute( "expanded" ) )
      show();
    else
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
    return todoList.filter( ( todoObj ) => todoObj[ "todo" ].dataID == dataID )[
      0 ].todo;
  }

  function getProject() {
    return project;
  }

  function getTodoDOMElement() {
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
    dataID,
    getName,
    getDescription,
    getPriority,
    getDate,
    getDescription,
    getTodoDOMElement,
    getObject,
    getProject,
    setDescription,
    setDate,
    setPriority,
    setName,
    setProject
  };
};

function getProjects() {
  //send a request
  // if accept, run code bellow.
  // EX: YOU CAN GET ALL PROJECTS?
  let projects = [ "Pla", "Inbox", "Home" ]; //TO-DO
  return projects;
}

function sortSelectedFirst( array, selected ) {
  return array.sort( ( a, b ) => b == selected ? 1 : a == selected ? -1 : 0 );
}

function getTodoByDataID( dataID ) {
  return todoList.filter( ( other_todo ) => other_todo[ "todo" ].dataID ==
    dataID )[ 0 ].todo;
}

function buildTodo( name, priority, date, description, project ) {
  let todo = Todo( name, priority, date, description, project );
  addTodo( todo );
  return todo;
}

function removeTodoByDataID( dataID ) {
  todoList = todoList.filter( ( todo ) => todo[ "todo" ].dataID != dataID );
}

function removeTodo( todo, full = false ) {
  todo.getTodoDOMElement().remove();
  if ( full ) {
    removeTodoByDataID( todo.dataID );
  }
}

//this will remove all todos by display effect only
function removeAllTodosDisplay() {
  for ( let todo of todoList ) {
    removeTodo( todo[ "todo" ] );
  }
}

function addTodo( todo ) {
  todoList.push( { todo, project: todo.getProject() } );
}

function showTodosByFilter( filter, project ) {
  let todos = todoList.filter( ( todo ) => todo[ "todo" ].getProject() ==
    project );
  todos = todos.filter( filter );

  for ( let todo of todos ) {
    todo[ "todo" ].show();
  }
}

buildTodo( "Ligar PC", 3, "2020-03-13", "ligar pc pela man2hã", "Inbox" ).show();
buildTodo( "Ligar PC3", 3, "2020-03-13", "ligar pc pela man2hã", "Inbox" ).show();
