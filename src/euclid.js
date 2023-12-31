// from https://github.com/mkontogiannis/euclidean-rhythms/blob/master/src/index.ts

export const getPattern = (steps, pulses, rotation) => {
  if (pulses < 0 || steps < 0 || steps < pulses) {
    return [];
  }

  // Create the two arrays
  let first = new Array(pulses).fill([1]);
  let second = new Array(steps - pulses).fill([0]);

  let firstLength = first.length;
  let minLength = Math.min(firstLength, second.length);

  let loopThreshold = 0;
  // Loop until at least one array has length gt 2 (1 for first loop)
  while (minLength > loopThreshold) {
    // Allow only loopThreshold to be zero on the first loop
    if (loopThreshold === 0) {
      loopThreshold = 1;
    }

    // For the minimum array loop and concat
    for (let x = 0; x < minLength; x++) {
      first[x] = [...first[x], ...second[x]];
    }

    // if the second was the bigger array, slice the remaining elements/arrays and update
    if (minLength === firstLength) {
      second = second.slice(minLength);
    }
    // Otherwise update the second (smallest array) with the remainders of the first
    // and update the first array to include only the extended sub-arrays
    else {
      second = first.slice(minLength);
      first = first.slice(0, minLength);
    }
    firstLength = first.length;
    minLength = Math.min(firstLength, second.length);
  }

  const pattern = [...first.flat(), ...second.flat()];

  if (rotation !== 0) {
    return rotate(pattern, rotation)
  }

  return pattern;
}

export const rotate = (arr, n) => arr.slice(-n).concat(arr.slice(0, -n));

export const euclidToPattern = (euclid) => {
  let pattern = []
  for (let i = 0; i < euclid.length; i++) {
    if (euclid[i] === 1) {
      pattern.push(i / euclid.length)
    }
  }
  return pattern
}

