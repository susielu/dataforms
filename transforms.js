function toMapByDimension({ values, dim, getValue = d => d }) {
  const dimensions = {}
  const dimAccessor = !dim
    ? d => d
    : typeof dim === "function"
      ? dim
      : d => d[dim]
  values.forEach((d, i) => {
    const d1 = dimAccessor(d)
    if (!dimensions[d1]) {
      dimensions[d1] = []
    }
    dimensions[d1].push(getValue(d, i))
  })
  return dimensions
}

function toMapByDimensions({ values, dim, secondDim, getValue = d => d }) {
  const dimensions = {}
  const dimAccessor = !dim
    ? d => d
    : typeof dim === "function"
      ? dim
      : d => d[dim]

  const secondDimAccessor = !secondDim
    ? d => d
    : typeof secondDim === "function"
      ? secondDim
      : d => d[secondDim]

  values.forEach((d, i) => {
    const d1 = dimAccessor(d)
    const d2 = secondDimAccessor(d)
    if (!dimensions[d1]) {
      dimensions[d1] = {}
    }
    if (!dimensions[d1][d2]) {
      dimensions[d1][d2] = []
    }

    dimensions[d1][d2].push(getValue(d, i))
  })
  return dimensions
}

//would be nice to handle deltas, significance testing, etc transformations
//7dma functionality

//would also be nice to be able to add in stats on each point
function toMappedLinesByDimension({ mapObject, stats, lineTransform }) {
  return Object.keys(mapObject).map(k => {
    const line = {
      name: k,
      coordinates: mapObject[k],
      stats: {}
    }

    if (stats) {
      line.stats = stats({ name: k, coordinates: line.coordinates })
    }

    if (lineTransform) {
      line.coordinates = lineTransform({
        name: k,
        stats: line.stats,
        coordinates: line.coordinates
      })
    }
    return line
  })
}

function sortByTimestamp(dim) {
  return (a, b) => {
    return new Date(a[dim]) - new Date(b[dim])
  }
}

//dim can be a function or a string otherwise
//assume it is an array of timestamps
function timestampsFromData({ values, dim }) {
  const times = new Map()
  const dimAccessor = !dim
    ? d => d
    : typeof dim === "function"
      ? dim
      : d => d[dim]

  values.forEach(d => {
    times.set(dimAccessor(d), true)
  })

  return [...times.keys()]
}

//Moves through the array of values assuming the values are sorted by timestamp
//metrics is an array of metric names
//If no value, then creates a filled object with the array of metrics
//and pads the metrics as zero

//this function does not deal with mismatched timestamps
//   out of order, missing values in timestamps array
function zeroFillLine({
  values,
  timestamps,
  metrics = [],
  timeDim = "timestamp",
  zeroFill = 0
}) {
  if (values.length === timestamps.length) {
    return values
  }
  timestamps.forEach((d, i) => {
    if (values.map(p => p[timeDim]).indexOf(d) === -1) {
      const emptyFillObject = {}
      if (metrics.indexOf(p) !== -1) {
        emptyFillObject[p] = zeroFill
      }

      metrics.forEach(m => {
        if (typeof m === "string") {
          emptyFillObject[m] = zeroFill
        } else if (typeof m === "function") {
          const { key, value } = m(d, i)
          emptyFillObject[key] = value
        }
      })
      emptyFillObject[timeDim] = d
      values.splice(i, 0, emptyFillObject)
    }
  })

  return values
}

module.exports = {
  toMapByDimension,
  toMapByDimensions,
  toMappedLinesByDimension,
  sortByTimestamp,
  zeroFillLine,
  timestampsFromData
}
