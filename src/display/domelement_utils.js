export function createElement( elementType, className, id, textContent, parent,
  ...attributes ) {

  let element = document.createElement( elementType );

  for ( let x = 1; x <= 5; x++ ) {
    let value = arguments[ x ];

    if ( value == null )
      continue;

    if ( x >= 1 && x <= 3 ) {
      let name = x == 1 ? "className" : x == 2 ? "id" : "textContent";
      element[ name ] = value;
      continue;
    }

    if ( x == 5 )
      setAttributes( element, attributes );
    else if ( parent != null )
      parent.appendChild( element );

  }

  return element;
}

export function setAttributes( element, attributes ) {
  for ( let x = 0; x < attributes.length; x++ ) {
    let name = attributes[ x ][ 0 ];
    let value = attributes[ x ][ 1 ];
    value = value ? value : "";
    if ( name != null )
      element.setAttribute( name, value );
  }
}

export function makeIcon( className, parent, ...attributes ) {
  let icon = createElement( "i", className, null, null, null, attributes );
  parent.insertBefore( icon, parent.lastChild );
}

export function getValidItem( target, validTag, invalidTags, depth = 0 ) {
  let tagName = target.tagName.toLowerCase();
  if ( depth === 5 )
    return target;

  if ( tagName === validTag )
    return target;
  else if ( invalidTags.some( ( tag ) => tag.toLowerCase() == tagName ) )
    return getValidItem( target.parentNode, validTag, invalidTags, ++depth );

}

export function removeChildrensByValidator( parent, validator ) {
  if ( typeof validator != "function" )
    return;
  let items = [ ...parent.children ];

  for ( let i = 0; i < items.length; i++ ) {
    let item = items[ i ];
    if ( validator( item ) )
      item.remove();

    if ( item.hasChildNodes() )
      removeChildrensByValidator( item, validator );

  }
}

export function removeAllChildrens( parent ) {
  while ( parent.hasChildNodes() ) {
    parent.firstChild.remove();
  }
}

export function getValidTopParentTag( tagName, startNode ) {
  let parent = startNode.parentNode;
  if ( parent && parent[ "tagName" ] == tagName.toUpperCase() )
    return parent;
  return getValidTopParentTag( tagName, parent.parentNode );
}


export const Button = ( parentNode ) => {

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