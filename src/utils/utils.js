export function sortSelectedFirst( array, selected ) {
  return array.sort( ( a, b ) => b == selected ? 1 : a == selected ? -1 : 0 );
}