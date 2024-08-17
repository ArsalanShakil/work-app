export function getSortedBy(array, sortValueRetriever = v => v, options = {descending: false}) {
  const sortable = array.map((value, index) => {
    return {index, sortValue: sortValueRetriever(value, index)};
  });

  sortable.sort(function (a, b) {
    if (a.sortValue === b.sortValue) {
      return 0;
    }
    if (a.sortValue === undefined || b.sortValue === undefined) {
      // Sort should be stable if either value is undefined.
      return 0;
    }

    const result = a.sortValue < b.sortValue ? -1 : 1;

    return options.descending ? -result : result;
  });

  return sortable.map(sorted => {
    return array[sorted.index];
  });
}
