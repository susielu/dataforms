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
    if (!dimensions[dimAccessor(d)]) {
      dimensions[dimAccessor(d)] = [];
    }
    dimensions[dimAccessor(d)].push(getValue(d));
  });
  return dimensions;
}

//would be nice to handle deltas, significance testing, etc transformations
//7dma functionality

//would also be nice to be able to add in stats on each point
function toMappedLinesByDimension(_ref2) {
  var mapObject = _ref2.mapObject,
      stats = _ref2.stats;

  return Object.keys(mapObject).map(function (k) {
    var line = {
      name: k,
      coordinates: mapObject[k],
      stats: {}
    };

    if (stats) {
      line.stats = stats.transform(line.coordinates);
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
function timestampsFromData(_ref3) {
  var values = _ref3.values,
      dim = _ref3.dim;

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
function zeroFillLine(_ref4) {
  var values = _ref4.values,
      timestamps = _ref4.timestamps,
      metrics = _ref4.metrics,
      _ref4$timeDim = _ref4.timeDim,
      timeDim = _ref4$timeDim === undefined ? "timestamp" : _ref4$timeDim,
      _ref4$zeroFill = _ref4.zeroFill,
      zeroFill = _ref4$zeroFill === undefined ? 0 : _ref4$zeroFill;

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
  toMappedLinesByDimension: toMappedLinesByDimension,
  sortByTimestamp: sortByTimestamp,
  zeroFillLine: zeroFillLine,
  timestampsFromData: timestampsFromData
};