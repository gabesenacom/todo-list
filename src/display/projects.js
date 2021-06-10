import { createElement, makeIcon, setAttributes, getValidItem } from "./domelement_utils"

let shortcutNav = document.getElementById( "projects-shortcut" );
let projectsNav = document.getElementById( "projects-list" );
let projectOpenDisplayName = document.querySelector('[data-type="project-open"]');

const DEFAULT_INBOX_NAME = "Inbox";
let projectOpen = DEFAULT_INBOX_NAME;

const trashIcon = {
  className: "fas fa-trash-alt danger-icon hidden",
  attrs: [ "trash" ]
};

const projectOpenIcon = {
  className: "fas fa-map-marker neutral-icon",
  attrs: [ "selected" ]
};


function displayProjectName() {
  projectOpenDisplayName.textContent = projectOpen;
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

    let target = getValidItem( event.target, "li", ["i"] );
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
    //now send request to add this project
    // YOU CAN CREATE THIS PROJECT? YES? OK, I'LL CREATE HERE.

    if ( !isValidProjectName( projectName ) ) {
      console.log( "Oops, invalid name" );
      return;
    }

    createItem( projectName, projectsNav, true, trashIcon );
    inputItem.remove();

    let button = createElement( "li", null, "project-create-btn",
      "Create new project", nav );
    makeIcon( "fas fa-plus success-icon", button );

  }

  function openProject( item ) {
    console.log( "open request send.", item );
    //send request
    // YOU CAN OPEN THIS PROJECT {SEND PROJECT NAME}? YES? OK, I'LL OPEN HERE.
    let beforeOpen = getShortcutItem( projectOpen );
    if ( beforeOpen && beforeOpen.textContent != DEFAULT_INBOX_NAME )
      beforeOpen.remove();
    projectOpen = item;
    displayProjectName();
    if ( item == DEFAULT_INBOX_NAME )
      return;
    

    let open = createItem( item, shortcutNav, false,
      projectOpenIcon );
    setAttributes( open, [
      [ "selected" ]
    ] );
  }

  function remove( item ) {
    //now send request to remove this project
    // YOU CAN REMOVE THIS PROJECT{send project name}? YES? OK, I WILL REMOVE HERE.
    item.parentNode.remove();
    if ( shortcutNav.children[ 1 ] != null && item.parentNode.textContent == shortcutNav.children[ 1 ].textContent )
      shortcutNav.children[ 1 ].remove();
    openProject( DEFAULT_INBOX_NAME );
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

createItem( projectOpen, shortcutNav, true );

actionItem( shortcutNav );
actionItem( projectsNav );
displayProjectName();