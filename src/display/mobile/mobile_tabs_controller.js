import { sendLog } from "./../../controller/controllers";

let projectsSection = document.getElementById( "projects" );
let todosSection = document.getElementById( "todos" );
let notesSection = document.getElementById( "notes" );
let sections = [ projectsSection, todosSection, notesSection ];
let mobile = false;
let sectionOpenTouch;

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

  if(mobile && sectionOpenTouch != todosSection && !window.matchMedia( "(max-width: 47.9375rem)" ).matches) {
    sendLog("the section is different, so... this is a keyboard fires >> mobile", window.matchMedia( "(max-width: 47.9375rem)" ).matches);
    return;
  }

  if ( window.matchMedia( "(max-width: 47.9375rem)" ).matches && !mobile ) {
    showSection( todosSection );
    sendLog( "Slide to left or right to view Projects list or Notes list" );
    mobile = true;
  } else {
    mobile = false;
    sections.forEach( ( section ) => {
      section.classList.remove( "hidden" );
      getSectionTitleByAttribute( "href", section.id ).classList.remove(
        "hidden" );
    } );
  }
}

function listenTouchSlide() {

  let startX = 0,
    startY;
  window.addEventListener( "touchstart", ( event ) => {
    startX = event.changedTouches[ 0 ].screenX;
    startY = event.changedTouches[ 0 ].screenY;
  } );

  window.addEventListener( "touchend", ( event ) => {
    let endX = event.changedTouches[ 0 ].screenX;
    let endY = event.changedTouches[ 0 ].screenY;
    let positionX = ( endX - startX );
    let positionY = ( endY - startY );

    if ( positionY <= -12 || positionY > 10 || ( positionX > -12 &&
        positionX < 10 ) )
      return;

    if ( positionX > 0 || positionX < 0 ) {
      if ( sectionOpenTouch ) {
        sectionOpenTouch = null;
        showSection( todosSection );
        return;
      }
    }

    if ( positionX > 0 )
      sectionOpenTouch = showSection( projectsSection );
    else if ( positionX < 0 )
      sectionOpenTouch = showSection( notesSection );

  } );
}

listenTouchSlide();
resizeLayout();
