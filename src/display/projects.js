import { createElement, makeIcon, setAttributes, getValidItem } from "./domelement_utils";
import {
  publish,
  Events,
  sendLog,
  subscribeAccept,
  unsubscribe
} from "./../controller/controllers";
import { DEFAULT_INBOX_NAME, getCurrentProject, getProjects } from "./../controller/app";

let shortcutNav = document.getElementById( "projects-shortcut" );
let projectsNav = document.getElementById( "projects-list" );
let projectOpenDisplayName = document.querySelector(
  '[data-type="project-open"]' );

const trashIcon = {
  className: "fas fa-trash-alt danger-icon hidden",
  attrs: [ "trash" ]
};

const projectOpenIcon = {
  className: "fas fa-map-marker neutral-icon",
  attrs: [ "selected" ]
};

function displayProjectName() {
  projectOpenDisplayName.textContent = getCurrentProject();
}

const createItem = ( text, nav, insetBefore, icon = null ) => {
  let item = createElement( "li", null, null, text, null );
  if ( insetBefore )
    nav.insertBefore( item, nav.children[ 0 ] );
  else
    nav.appendChild( item );
  if ( icon != null )
    makeIcon( icon.className, item, icon.attrs );
  return item;
};

const actionItem = ( nav ) => {
  function listen( event ) {

    if ( event.target.hasAttribute( "trash" ) )
      return remove( event.target );

    let target = getValidItem( event.target, "li", [ "i" ] );
    if ( target == null ) return;

    if ( target.id == "create-editor" || target.id == "project-add-btn" )
      return;

    if ( target.id == "project-create-btn" ) {
      create();
      target.remove();
      return;
    }

    openProject( target.textContent );
  }

  function create() {
    let item = createElement( "li", null, "create-editor", null, nav );
    let input = createElement( "input", "custom-input", null, null, item, [
      "type", "text"
    ], [ "name", "project-name" ], [ "placeholder",
      "Insert project name here"
    ] );
    let button = createElement( "button", "btn action-btn", "project-add-btn",
      "Add", item );
    makeIcon( "fas fa-plus success-icon", button );

    button.addEventListener( "click", () => createProject( input.value, item ) );
  }

  function createProject( projectName, inputItem ) {
    publish( Events.CREATE_PROJECT, projectName );

    let id = subscribeAccept( Events.CREATE_PROJECT_ACCEPT, ( msg, data ) => {
      createItem( projectName, projectsNav, true, trashIcon );
      sendLog( `The project ${projectName} was created!` );
      unsubscribe( id );
    } );

    inputItem.remove();
    let button = createElement( "li", null, "project-create-btn",
      "Create new project", nav );
    makeIcon( "fas fa-plus success-icon", button );

  }

  function openProject( item, force = false ) {
    if ( !force )
      sendLog( `Opening ${item} project...` );
    let lastOpen = getCurrentProject();
    publish( Events.OPEN_PROJECT, item );

    let id = subscribeAccept( Events.OPEN_PROJECT_ACCEPT, ( msg, data ) => {
      let beforeOpen = getShortcutItem( lastOpen );
      if ( beforeOpen && beforeOpen.textContent != DEFAULT_INBOX_NAME )
        beforeOpen.remove();
      displayProjectName();
      if ( item == DEFAULT_INBOX_NAME )
        return;

      let open = createItem( item, shortcutNav, false,
        projectOpenIcon );
      setAttributes( open, [
        [ "selected" ]
      ] );
      unsubscribe( id );
    } );

  }

  function remove( item ) {
    publish( Events.REMOVE_PROJECT, item.parentNode.textContent );
    let id = subscribeAccept( Events.REMOVE_PROJECT_ACCEPT, ( msg, data ) => {
      sendLog( "You removed this project" );
      item.parentNode.remove();
      if ( shortcutNav.children[ 1 ] != null && item.parentNode.textContent ==
        shortcutNav.children[ 1 ].textContent )
        shortcutNav.children[ 1 ].remove();
      openProject( DEFAULT_INBOX_NAME, true );
      unsubscribe( id );
    } );
  }

  function getShortcutItem( itemName ) {
    let items = [ ...shortcutNav.children ];
    return items.filter( ( item ) => item != null && itemName == item.textContent )[
      0 ];
  }

  function isValidProjectName( projectName ) {
    if ( !projectName )
      return false;

    let items = [ ...projectsNav.children ];
    if ( items.some( li => !li.id && li.textContent == projectName ) )
      return false;
    return true;
  }

  nav.addEventListener( "click", listen );
};

function loadAllProjects() {
  getProjects().filter( ( project ) => project != DEFAULT_INBOX_NAME ).forEach(
    ( project ) => createItem( project, projectsNav, true, trashIcon ) );
}

createItem( getCurrentProject(), shortcutNav, true );
loadAllProjects();
actionItem( shortcutNav );
actionItem( projectsNav );
displayProjectName();
