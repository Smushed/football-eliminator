export const differencesInObj = (original, compare) => {
  const diff = {};
  for (const key in original) {
    if (original[key] !== compare[key]) {
      diff[key] = compare[key];
    }
  }
  return diff;
};
