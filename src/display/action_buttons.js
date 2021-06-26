import {
  createElement,
  makeIcon,
  setAttributes
} from "./domelement_utils";

const Button = ( parentNode ) => {

  const buttonElement = ( parent, text, iconClass, listener ) => {
    let button = createElement( "button", "btn action-btn", null, text,
      parent );
    if ( text )
      setAttributes( button, [
        [ "data-btn-type", text.toLowerCase() ]
      ] )
    makeIcon( iconClass, button );
    if ( listener )
      button.addEventListener( "click", listener );
    return button;
  }

  const buttonIconElement = ( parent, iconClass, listener ) => {
    let button = createElement( "i", iconClass, null, null,
      parent );
    if ( listener )
      button.addEventListener( "click", listener );
    return button;
  }

  return { buttonElement, buttonIconElement };
};

const RemoveButton = ( parentNode, listener, refObject ) => {
  const { buttonElement } = Button( parentNode );

  let button = buttonElement( parentNode, "Remove",
    "fas fa-trash-alt danger-icon", listener.bind( null, event, refObject )
  );
  button.classList.add( "danger-btn" );
  return button;
}

const EditButton = ( parentNode, listener, refObject ) => {
  const { buttonElement } = Button( parentNode );

  let button = buttonElement( parentNode, "Edit", "fas fa-edit neutral-icon",
    listener.bind( null, event, refObject ) );

  return button;
};

const CompleteTodoButton = ( parentNode, listener, refObject ) => {
  const { buttonIconElement } = Button( parentNode );

  let button = buttonIconElement( parentNode, "fas fa-square todo-checkbox",
    listener.bind( null, event, refObject ) );

  return button;
};

const ExitButton = ( parentNode, listener, refObject ) => {
  const { buttonIconElement } = Button( parentNode );

  let button = buttonIconElement( parentNode,
    "fas fa-times danger-icon exitButton",
    listener.bind( null, event, parentNode, refObject ) );

  return button;
};

const SaveButton = ( parentNode ) => {
  const { buttonElement } = Button( parentNode );

  let dom = buttonElement( parentNode, "Save", "fas fa-plus", null );
  return { buttonElement, dom };
};

const MakerButton = ( parentNode, text, editorCallback, requestCallback ) => {
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
    if ( requestCallback.call( this ) ) {
      editor = editorCallback.call( this );
      blocked = true;
    }

  };

  let li = createElement( "li", "create-item", "todo-maker", null,
    parentNode,
    null );
  let div = createElement( "div", null, null, null, li, null );
  let small = createElement( "small", null, null, "click here to", div,
    null );
  let p = createElement( "p", null, null, text, div, null );
  makeIcon( "fas fa-plus success-icon", li );
  li.addEventListener( "click", listener );
  return li;
};

export { Button, RemoveButton, EditButton, CompleteTodoButton, ExitButton,
  SaveButton, MakerButton };
