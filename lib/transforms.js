"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function toMapByDimension(_ref) {
  var values = _ref.values,
      dim = _ref.dim,
      _ref$getValue = _ref.getValue,
      getValue = _ref$getValue === undefined ? function (d) {
    return d;
  } : _ref$getValue;

  var dimensions = {};
  var dimAccessor = !dim ? function (d) {
    return d;
  } : typeof dim === "function" ? dim : function (d) {
    return d[dim];
  };
  values.forEach(function (d, i) {
    var d1 = dimAccessor(d);
    if (!dimensions[d1]) {
      dimensions[d1] = [];
    }
    dimensions[d1].push(getValue(d, i));
  });
  return dimensions;
}

function toMapByDimensions(_ref2) {
  var values = _ref2.values,
      dim = _ref2.dim,
      secondDim = _ref2.secondDim,
      _ref2$getValue = _ref2.getValue,
      getValue = _ref2$getValue === undefined ? function (d) {
    return d;
  } : _ref2$getValue;

  var dimensions = {};
  var dimAccessor = !dim ? function (d) {
    return d;
  } : typeof dim === "function" ? dim : function (d) {
    return d[dim];
  };

  var secondDimAccessor = !secondDim ? function (d) {
    return d;
  } : typeof secondDim === "function" ? secondDim : function (d) {
    return d[secondDim];
  };

  values.forEach(function (d, i) {
    var d1 = dimAccessor(d);
    var d2 = secondDimAccessor(d);
    if (!dimensions[d1]) {
      dimensions[d1] = {};
    }
    if (!dimensions[d1][d2]) {
      dimensions[d1][d2] = [];
    }

    dimensions[d1][d2].push(getValue(d, i));
  });
  return dimensions;
}

//would be nice to handle deltas, significance testing, etc transformations
//7dma functionality

//would also be nice to be able to add in stats on each point
function toMappedLinesByDimension(_ref3) {
  var mapObject = _ref3.mapObject,
      stats = _ref3.stats,
      lineTransform = _ref3.lineTransform;

  return Object.keys(mapObject).map(function (k) {
    var line = {
      name: k,
      coordinates: mapObject[k],
      stats: {}
    };

    if (stats) {
      line.stats = stats({ name: k, coordinates: line.coordinates });
    }

    if (lineTransform) {
      line.coordinates = lineTransform({
        name: k,
        stats: line.stats,
        coordinates: line.coordinates
      });
    }
    return line;
  });
}

function sortByTimestamp(dim) {
  return function (a, b) {
    return new Date(a[dim]) - new Date(b[dim]);
  };
}

//dim can be a function or a string otherwise
//assume it is an array of timestamps
function timestampsFromData(_ref4) {
  var values = _ref4.values,
      dim = _ref4.dim;

  var times = new Map();
  var dimAccessor = !dim ? function (d) {
    return d;
  } : typeof dim === "function" ? dim : function (d) {
    return d[dim];
  };

  values.forEach(function (d) {
    times.set(dimAccessor(d), true);
  });

  return [].concat(_toConsumableArray(times.keys()));
}

//Moves through the array of values assuming the values are sorted by timestamp
//metrics is an array of metric names
//If no value, then creates a filled object with the array of metrics
//and pads the metrics as zero

//this function does not deal with mismatched timestamps
//   out of order, missing values in timestamps array
function zeroFillLine(_ref5) {
  var values = _ref5.values,
      timestamps = _ref5.timestamps,
      metrics = _ref5.metrics,
      _ref5$timeDim = _ref5.timeDim,
      timeDim = _ref5$timeDim === undefined ? "timestamp" : _ref5$timeDim,
      _ref5$zeroFill = _ref5.zeroFill,
      zeroFill = _ref5$zeroFill === undefined ? 0 : _ref5$zeroFill;

  if (values.length === timestamps.length) {
    return values;
  }
  timestamps.forEach(function (d, i) {
    if (values.map(function (p) {
      return p[timeDim];
    }).indexOf(d) === -1) {
      var emptyFillObject = Object.assign({}, values[0]);
      Object.keys(emptyFillObject).forEach(function (p) {
        if (metrics.indexOf(p) !== -1) {
          emptyFillObject[p] = zeroFill;
        }
      });
      emptyFillObject[timeDim] = d;
      values.splice(i, 0, emptyFillObject);
    }
  });

  return values;
}

module.exports = {
  toMapByDimension: toMapByDimension,
  toMapByDimensions: toMapByDimensions,
  toMappedLinesByDimension: toMappedLinesByDimension,
  sortByTimestamp: sortByTimestamp,
  zeroFillLine: zeroFillLine,
  timestampsFromData: timestampsFromData
};