import {
  createElement,
  makeIcon
} from "./domelement_utils";
import { parseISO, format, isToday, isTomorrow, isSameDay } from "date-fns";
import { PriorityCard, DateCard } from "./todo_list_card";
import { showTodosByFilter, Todo, TodoEditor, CONTROLLER } from "./todo_list";
import { getCurrentProject } from "./../controller/app";

let FilterItemOpen = null;
let clearFilter = null;

const FilterItem = ( parentNode, text, validatorCallback, iconClass = null ) => {

  function listen( event, anotherValidator = null ) {
    createClearFilter();
    closeFilterItemOpen();
    CONTROLLER.removeAllObjectsDisplay();

    showTodosByFilter( ( todo ) => {
      let date = parseISO( todo[ "object" ].getDate() );
      if ( validatorCallback )
        return validatorCallback.call( this, date, todo );
      if ( anotherValidator )
        return anotherValidator.call( this, date, todo );
    }, getCurrentProject() );
  }

  const build = () => {
    let li = createElement( "li", null, null, text,
      parentNode, null );
    if ( iconClass )
      makeIcon( iconClass, li );
    if ( validatorCallback )
      li.addEventListener( "click", listen );
    return li;
  };

  return { build, listen };
};

const TodayFilterItem = ( parentNode ) => {
  const { build, listen } = FilterItem( parentNode, "Today", validator );

  function validator( date ) {
    return isToday( date );
  }

  return build();
};

const TomorrowFilterItem = ( parentNode ) => {

  const { build, listen } = FilterItem( parentNode, "Tomorrow", validator );

  function validator( date ) {
    return isTomorrow( date );
  }

  return build();
};

const DinamicFilterItem = ( parentNode, card, formListenerCallback ) => {
  let form;

  function listener( event ) {
    createClearFilter();
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
  const { build, listen } = FilterItem( parentNode, "Select priority", null,
    "fas fa-angle-double-up" );
  const { listener, expand, form } = DinamicFilterItem( parentNode,
    PriorityCard, listenExpandChange );

  function listenExpandChange( event ) {
    listen( event, ( date, todo ) => Number( event.target.value ) == todo[
      "object" ].getPriority() );
  }

  let item = build();
  item.addEventListener( "click", listener );
  return item;
};

const SelectDateFilterItem = ( parentNode ) => {
  const { build, listen } = FilterItem( parentNode, "Select date", null,
    "fas fa-calendar-day" );
  const { listener, expand, form } = DinamicFilterItem( parentNode,
    DateCard, listenExpandChange );

  function listenExpandChange( event ) {
    listen( event, ( date, todo ) => isSameDay( date, parseISO( event.target.value ) ) );
  }

  let item = build();
  item.addEventListener( "click", listener );
  return item;
};

const ClearFilterItem = () => {
  const { build, listen } = FilterItem( document.getElementById(
    "filter-tags" ), null, null, "fas fa-times danger-icon" );

  function listener( date ) {
    closeFilterItemOpen();
    CONTROLLER.removeAllObjectsDisplay();
    showTodosByFilter( () => true, getCurrentProject() );
    hide();
  }

  let item = build();
  item.addEventListener( "click", listener );
  hide();

  function show() {
    item.classList.remove( "hidden" );
  }

  function hide() {
    item.classList.add( "hidden" );
  }

  return { show, hide, item };
};

function closeFilterItemOpen() {
  if ( FilterItemOpen )
    FilterItemOpen.remove();
}

function createClearFilter() {
  if ( clearFilter == null )
    clearFilter = ClearFilterItem();

  clearFilter.show();
}

export {
  TodayFilterItem,
  TomorrowFilterItem,
  SelectDateFilterItem,
  SelectPriorityFilterItem
};
