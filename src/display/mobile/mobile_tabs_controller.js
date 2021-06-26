import { sendLog } from "./../../controller/controllers";

let projectsSection = document.getElementById( "projects" );
let todosSection = document.getElementById( "todos" );
let notesSection = document.getElementById( "notes" );
let sections = [ projectsSection, todosSection, notesSection ];

function showSection( section ) {
  sections.filter( ( secDOM ) => secDOM != section ).forEach( ( secDOM ) => {
    secDOM.classList.add( "hidden" );
    getSectionTitleByAttribute( "href", secDOM.id ).classList.add( "hidden" );
  } );
  section.classList.remove( "hidden" );
  getSectionTitleByAttribute( "href", section.id ).classList.remove( "hidden" );
  return section;
}

function getSectionTitleByAttribute( attr, sectionID ) {
  sectionID = "#" + sectionID;
  let header = document.querySelector( "header" );
  return [ ...header.children ].filter( ( title ) => {
    let titleLink = title.querySelector( "a" );
    if ( titleLink.getAttribute( attr ) == sectionID )
      return title;
  } )[ 0 ];
}

window.addEventListener( "resize", resizeLayout );

function resizeLayout() {
  if ( window.matchMedia( "(max-width: 47.9375rem)" ).matches ) {
    showSection( todosSection );
    sendLog( "Slide to left or right to view Projects list or Notes list" );
  } else {
    sections.forEach( ( section ) => {
      section.classList.remove( "hidden" );
      getSectionTitleByAttribute( "href", section.id ).classList.remove(
        "hidden" );
    } );
  }
}

let sectionOpenTouch;

function listenTouchSlide() {

  let startX = 0;
  window.addEventListener( "touchstart", ( event ) => {
    startX = event.changedTouches[ 0 ].screenX;
  } );

  window.addEventListener( "touchend", ( event ) => {
    let endX = event.changedTouches[ 0 ].screenX;
    let position = ( endX - startX );
    if ( position > 0 || position < 0 ) {
      if ( sectionOpenTouch ) {
        sectionOpenTouch = null;
        showSection( todosSection );
        return;
      }
    }
    if ( position > 0 )
      sectionOpenTouch = showSection( projectsSection );
    else if ( position < 0 )
      sectionOpenTouch = showSection( notesSection );

  } );
}

listenTouchSlide();
resizeLayout();
