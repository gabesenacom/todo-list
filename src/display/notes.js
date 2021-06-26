import {
  createElement,
  makeIcon,
  setAttributes,
  getValidItem,
  removeAllChildrens,
  removeChildrensByValidator,
  getValidTopParentTag,
  Button
} from "./domelement_utils";
import { v4 as uuidv4 } from 'uuid';
import { EditButton, RemoveButton, MakerButton, SaveButton } from "./action_buttons";
import { ObjectController } from "./object_controller";
import { format } from "date-fns";
import {
  getCurrentProject,
  getCurrentTodoNotes
} from "./../controller/app";
import {
  publish,
  Events,
  sendLog,
  subscribeAccept,
  unsubscribe
} from "./../controller/controllers";

let notesDOMElement = document.getElementById( "notes" );
let notesListDOMElement = document.getElementById( "notes-list" );
const CONTROLLER = ObjectController();
let curretNoteOpenDOMs = [];

const NotesClosedCard = ( () => {
  let elements = [];

  function build() {
    elements[ 0 ] = createElement( "img", null, null, null, null, [ "src",
      "image/Note taking_Flatline.svg"
    ], [ "alt", "note taking" ] );
    elements[ 1 ] = createElement( "p", "notes-closed-text", null,
      "Click in any todo to see your notes.", null );
    notesDOMElement.insertBefore( elements[ 0 ], notesListDOMElement );
    notesDOMElement.insertBefore( elements[ 1 ], notesListDOMElement );
  }

  function destroy() {
    for ( let element of elements )
      element.remove();
    elements = [];
  }

  function alreadyBuilt() {
    return elements.length > 0;
  }

  return { build, destroy, alreadyBuilt }
} )();

const AddNote = ( () => {

  function editor() {
    return NoteEditor( null );
  }

  function request() {
    return true;
  }

  function toggleHidden() {
    AddNoteButton.classList.toggle( "hidden" );
  }

  const AddNoteButton = MakerButton( notesListDOMElement, "Add new note",
    editor, request, toggleHidden );
  return { toggleHidden, AddNoteButton };
} )();

const Note = ( text, date, project, dataID = CONTROLLER.getObjectsList().length +
  1 ) => {
  let domElement = buildDOM();

  function buildDOM() {
    let dom = createElement( "li", "todo-note todo-information", null,
      null, null );
    notesListDOMElement.insertBefore( dom, AddNote.AddNoteButton );
    return dom;
  }

  function build() {
    if ( !domElement || !domElement.parentNode )
      domElement = buildDOM();
    let p = createElement( "p", "note-text", null, text, domElement );
    let parentInformation = createElement( "div", "note-information", null,
      null, domElement );
    EditButton( parentInformation, editNoteListener, null );
    RemoveButton( parentInformation, removeNoteListener, null );
    createElement( "small", "note-date", null, date,
      parentInformation );
    return domElement;
  }

  function editNoteListener( event ) {
    NoteEditor( getObject() );
  }

  function removeNoteListener( event ) {
    publish( Events.REMOVE_NOTE, {
      dataID,
      "note": text,
      date
    } );

    let id = subscribeAccept( Events.REMOVE_NOTE_ACCEPT, ( msg, data ) => {
      sendLog( `Note removed!` );
      CONTROLLER.removeObject( getObject(), true );
      unsubscribe( id );
    } );

  }

  function getObject() {
    return CONTROLLER.getObjectsList().filter( ( noteObj ) => noteObj[
      "object" ].dataID == dataID )[
      0 ].object;
  }

  function getText() {
    return text;
  }

  function getDate() {
    return date;
  }

  function getProject() {
    return project;
  }

  function setText( _text ) {
    text = _text;
  }

  function setDate( _date ) {
    date = _date;
  }

  function getDOMElement() {
    return domElement;
  }

  function destroy() {
    domElement.remove();
  }

  return {
    build,
    destroy,
    getDOMElement,
    getObject,
    getProject,
    getText,
    getDate,
    setText,
    setDate,
    dataID
  };

};

const TodoInformationCard = ( todoName, todoDate, projectName ) => {
  let infoCard = createElement( "div", "todo-information", null, null,
    null );
  notesDOMElement.insertBefore( infoCard, notesListDOMElement );
  createElement( "p", "project-name", null, projectName, infoCard );
  createElement( "p", "todo-name", null, todoName, infoCard );
  createElement( "small", "todo-date", null, todoDate, infoCard );

  function destroy() {
    infoCard.remove();
  }
  return { infoCard, destroy, infoCard };
};

const NoteEditor = ( note ) => {
  let domElement = createElement( "form", null, "note-editor", null,
    notesListDOMElement );

  function listener( event ) {
    let noteText = event.target[ 0 ].value;
    let date = format( new Date(), "MM/dd/yyyy" );
    let dataID;
    if ( note ) {
      dataID = note[ "dataID" ];

      publish( Events.EDIT_NOTE, {
        dataID,
        "note": noteText,
        date
      } );

      let id = subscribeAccept( Events.EDIT_NOTE_ACCEPT, ( msg, data ) => {
        sendLog( `Note edited!` );
        note.setText( noteText );
        note.setDate( date );
        CONTROLLER.removeObject( note, false );
        note.build();
        curretNoteOpenDOMs.push( note.getDOMElement() );
        unsubscribe( id );
      } );

    } else {
      dataID = uuidv4();
      publish( Events.CREATE_NOTE, {
        dataID,
        "note": noteText,
        date
      } );

      let id = subscribeAccept( Events.CREATE_NOTE_ACCEPT, ( msg, data ) => {
        sendLog( `Note created!` );
        note = CONTROLLER.buildObject( Note, noteText, date,
          getCurrentProject(),
          dataID );
        note.build();
        curretNoteOpenDOMs.push( note.getDOMElement() );
        unsubscribe( id );
      } );
    }
    domElement.remove();
    event.preventDefault();
  }

  function forceExit() {
    domElement.remove();
  }

  function textArea() {
    let textNote = note ? note.getText() : null;
    let textAreaDOM = createElement( "textarea", "custom-input", null,
      textNote,
      domElement, [ "autofocus", "" ], [ "placeholder", "Insert note here" ],
      [ "name", "note-text" ], [ "required", "" ] );
    curretNoteOpenDOMs.push( textAreaDOM );
  }

  function submitButton() {
    let saveDOM = SaveButton( domElement );
    curretNoteOpenDOMs.push( saveDOM.dom );
  }

  textArea();
  submitButton();
  domElement.addEventListener( "submit", listener );
  return { forceExit };
};

function changeNoteLayout( currentTodo ) {
  if ( !currentTodo ) {
    if ( NotesClosedCard.alreadyBuilt() )
      return;
    NotesClosedCard.build();
    if ( curretNoteOpenDOMs.length > 0 )
      curretNoteOpenDOMs.forEach( ( element ) => element.remove() );
  } else {
    NotesClosedCard.destroy();
    let notes = currentTodo.notes;
    let infoDOM = TodoInformationCard( currentTodo.todo, currentTodo.date,
      currentTodo.project );
    curretNoteOpenDOMs.push( infoDOM.infoCard );
    for ( let note of notes ) {
      let noteDOM = CONTROLLER.buildObject( Note, note[ "note" ], note[ "date" ],
        currentTodo.project );
      noteDOM.build();
      curretNoteOpenDOMs.push( noteDOM.getDOMElement() );
    }
  }
  AddNote.toggleHidden();
}

changeNoteLayout();

subscribeAccept( Events.OPEN_TODO_ACCEPT, ( msg, data ) => {
  changeNoteLayout( getCurrentTodoNotes() );
} );

subscribeAccept( Events.OPEN_PROJECT_ACCEPT, ( msg, data ) => {
  changeNoteLayout( null );
} );

subscribeAccept( Events.CLOSE_TODO_ACCEPT, ( msg, data ) => {
  changeNoteLayout( null );
} );
