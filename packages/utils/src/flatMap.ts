// Flattens at depth 1
export const flatten = (array: any[]) => {
  return array.reduce((acc, cur) => {
    if (Array.isArray(cur)) {
      return [...acc, ...cur];
    }
    return [...acc, cur];
  }, []);
};

// TODO: Remove once we bump to >ES2019
export const flatMap = <Type>(
  array: Type[],
  callback: (value: Type) => any,
) => {
  return flatten(array.map(callback));
};
