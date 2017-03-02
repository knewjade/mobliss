export namespace utillity {
  export function multidim_array(dimensions:number[], initial_value:any): any {
    let array = [() => initial_value];
    for (let index = dimensions.length - 1; 0 <= index; index--) {
      let dim = dimensions[index];
      let last_generator = array[array.length - 1];
      array.push(() => create_array(dim, last_generator));
    }
    return array[array.length - 1]();
  }

  function create_array(dimension:number, initial_value_generator:() => any): any[] {
    return Array.apply(null, Array(dimension)).map(initial_value_generator);
  }
}
