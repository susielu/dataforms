function toMapByDimension({ values, dim, getValue = d => d }) {
  const dimensions = {}
  const dimAccessor = !dim
    ? d => d
    : typeof dim === "function" ? dim : d => d[dim]
  values.forEach((d, i) => {
    if (!dimensions[dimAccessor(d)]) {
      dimensions[dimAccessor(d)] = []
    }
    dimensions[dimAccessor(d)].push(getValue(d))
  })
  return dimensions
}

//would be nice to handle deltas, significance testing, etc transformations
//7dma functionality

//would also be nice to be able to add in stats on each point
function toMappedLinesByDimension({ mapObject, stats }) {
  return Object.keys(mapObject).map(k => {
    const line = {
      name: k,
      coordinates: mapObject[k],
      stats: {}
    }

    if (stats) {
      line.stats = stats.transform(line.coordinates)
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
    : typeof dim === "function" ? dim : d => d[dim]

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
  metrics,
  timeDim = "timestamp",
  zeroFill = 0
}) {
  if (values.length === timestamps.length) {
    return values
  }
  timestamps.forEach((d, i) => {
    if (values.map(p => p[timeDim]).indexOf(d) === -1) {
      const emptyFillObject = Object.assign({}, values[0])
      Object.keys(emptyFillObject).forEach(p => {
        if (metrics.indexOf(p) !== -1) {
          emptyFillObject[p] = zeroFill
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
  toMappedLinesByDimension,
  sortByTimestamp,
  zeroFillLine,
  timestampsFromData
}
