"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var av_nav_table = document.getElementById('aviation-shipping').textContent;
var table3 = document.getElementById('table3').textContent;
var avNav = parseTSV(av_nav_table);
var data = parseTSV(table3);
var years = data[2].slice(2);
var rows = data.slice(3);
var intAv = avNav[6].slice(2).filter(function (y) {
  return y !== '';
}).map(function (y, i) {
  return {
    y: new Number(y),
    x: years[i]
  };
});
var intNav = avNav[10].slice(2).filter(function (y) {
  return y !== '';
}).map(function (y, i) {
  return {
    y: new Number(y),
    x: years[i]
  };
});
var seriesTree = rows.reduce(function (result, row) {
  var lastTop = result.lastTop;
  var lastSub = result.lastSub;
  var first = row[0];
  var second = row[1];
  var dataPoints = row.slice(2).filter(function (y) {
    return y !== '';
  }).map(function (y, i) {
    return {
      y: new Number(y),
      x: years[i]
    };
  });
  if (!dataPoints.length) return result;
  var isTop = !second || first === second;
  var isSub = !isTop && first;
  var isSubSub = !!second;

  if (isTop) {
    result.lastTop = first;

    if (first === 'Grand Total') {
      result.tree['data'] = dataPoints;
    } else {
      result.tree[first] = {
        data: dataPoints
      };
    }

    result.lastSub = undefined;
  } else if (isSub) {
    result.lastSub = first;
    result.tree[lastTop][first] = _defineProperty({}, second, dataPoints);
    result.uncalculatedSubs.push([lastTop, first]);
  } else if (isSubSub) {
    var sub = lastSub || '_';
    result.tree[lastTop][sub] = result.tree[lastTop][sub] || {};
    result.tree[lastTop][sub][second] = dataPoints;
  }

  return result;
}, {
  tree: {},
  lastTop: undefined,
  lastSub: undefined,
  uncalculatedSubs: []
});

function addAvNav() {
  seriesTree.tree.Transport.Aviation['International Aviation'] = intAv;
  seriesTree.tree.Transport.Shipping['International Navigation'] = intNav;
  recalculateSub('Transport', 'Aviation');
  recalculateTransport();
}

function removeAvNav() {
  delete seriesTree.tree.Transport.Aviation['International Aviation'];
  delete seriesTree.tree.Transport.Shipping['International Navigation'];
  recalculateSub('Transport', 'Aviation');
  recalculateTransport();
}

function recalculateTransport() {
  delete seriesTree.tree.Transport.data;
  seriesTree.tree.Transport.data = Object.values(seriesTree.tree.Transport).filter(function (x) {
    return x.data;
  }).map(function (x) {
    return x.data;
  }).reduce(zipLists(function (a, b) {
    return {
      y: a.y + b.y,
      x: a.x
    };
  }));
}

function recalculate() {
  seriesTree.uncalculatedSubs.forEach(function (p) {
    var _p = _slicedToArray(p, 2),
        first = _p[0],
        second = _p[1];

    recalculateSub(first, second);
  });
}

function recalculateSub(first, second) {
  var sub = seriesTree.tree[first][second];
  console.log('sub', sub);
  delete sub.data;
  sub.data = Object.values(sub).reduce(zipLists(function (a, b) {
    return {
      y: a.y + b.y,
      x: a.x
    };
  }));
}

recalculate();

history.onpopstate = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  console.log(args);
  showChart();
};

window.onload = function () {
  var avnavCheck = document.getElementById('include-avnav');
  var avnav = getKey('avnav');
  if (avnav) avnavCheck.setAttribute('checked', avnav);
  toggleAvNav(!!avnav);
  var chart = showChart();
  var chartType = document.getElementById('chart-type');

  chartType.onchange = function (e) {
    setKey('chartType', e.target.value);
    chart.destroy();
    showChart();
  };

  avnavCheck.onchange = function (e) {
    var avnav = e.target.checked;
    setKey('avnav', avnav);
    toggleAvNav(avnav);
    chart.destroy();
    showChart();
  };
};

function toggleAvNav(avnav) {
  console.info('toggleAvNav', avnav);

  if (avnav === true) {
    addAvNav();
  } else {
    removeAvNav();
  }
}

function zipLists(f) {
  return function (a, b) {
    return a.map(function (x, i) {
      return f(x, b[i]);
    });
  };
}

function showChart() {
  var _getOptions = getOptions(),
      title = _getOptions.title,
      tree = _getOptions.tree,
      chartType = _getOptions.chartType;

  var subTree = tree._ ? tree._ : tree;

  if (Object.keys(tree).length > 2) {
    subTree = Object.assign({}, subTree, tree);
  }

  var entries = Object.entries(subTree).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        k = _ref2[0],
        v = _ref2[1];

    return k != 'data' && k != '_';
  });
  console.log(title, tree, subTree, entries);
  var series = entries.length ? entries.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        k = _ref4[0],
        v = _ref4[1];

    return {
      name: k,
      data: v.data ? v.data : v
    };
  }) : [subTree]; //  series.push({name: "Total", data: tree.data})

  console.log('series', series);
  document.title = title + ' :: UK GHG 1990-2018';
  var stacked = false;
  var stackType = 'normal';

  if (chartType == 'Stacked') {
    stacked = true;
  } else if (chartType == 'Unstacked') {
    stacked = false;
  } else if (chartType == 'Relative') {
    stacked = true;
    stackType = '100%';
    var totalData = tree.data;
    series = series.map(function (x) {
      return {
        name: x.name,
        data: x.data.map(function (a, i) {
          return {
            x: a.x,
            y: 100 * a.y / totalData[i].y
          };
        })
      };
    });
  }

  var options = {
    series: series,
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#4ecdc4', '#c7f464', '#81D4FA', '#546E7A', '#fd6a6a'],
    chart: {
      type: 'area',
      stacked: stacked,
      stackType: stackType,
      height: 650,
      width: 650 / 9 * 16,
      events: {
        click: function click(event, context, config) {
          console.info(event, context, config);
          var sI = config.seriesIndex;

          if (sI > -1) {
            chart.destroy();

            if (getKey('sector') === "Public" || Array.isArray(series[sI][1])) {
              setKey('sector', undefined);
              setKey('subsector', undefined);
              showTopChart();
            } else {
              if (getKey('sector')) {
                setKey('subsector', series[sI].name, getKey('sector') + ' :: ' + series[sI].name);
                showChart();
              } else {
                setKey('sector', series[sI].name, series[sI].name);
                showChart();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '18px'
      }
    },
    xaxis: {
      type: 'year',
      axisBorder: {
        show: true
      },
      axisTicks: {
        show: true
      }
    },
    yaxis: {
      title: {
        text: chartType === "Relative" ? "% of total GHG emissions" : 'MtCO2e'
      },
      tickAmount: 20,
      floating: false,
      padding: {
        bottom: 10
      },
      labels: {
        formatter: function formatter(val) {
          return parseInt(val);
        },
        style: {
          color: '#8e8da4'
        },
        offsetY: -7,
        offsetX: 0
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: true
      }
    },
    fill: {
      opacity: 0.5
    },
    tooltip: {
      inverseOrder: true,
      followCursor: false,
      //      intersect: true,
      shared: false,
      onDatasetHover: {
        highlightDataSeries: true
      },
      x: {
        format: 'yyyy'
      },
      fixed: {
        enabled: false,
        position: 'topRight'
      }
    },
    grid: {
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    }
  };
  var chart = new ApexCharts(document.querySelector('#chart'), options);
  chart.render();
  return chart;
}

function showTopChart() {
  showChart('Estimated territorial greenhouse gas emissions by source category, UK 1990-2018', seriesTree.tree);
}

function parseTSV(tsv) {
  return tsv.trim().split('\n').map(function (l) {
    return l.split('\t').map(function (c) {
      return c.replace(/^"|"$/g, '');
    });
  });
}

function parseQuery(qs) {
  return qs.substring(1).split('&').map(function (p) {
    return p.split('=');
  }).reduce(function (result, item) {
    result[item[0]] = decodeURIComponent(item[1]);
    return result;
  }, {});
}

function stringifyQuery(q) {
  return '?' + Object.keys(q).map(function (k) {
    return k + '=' + q[k];
  }).join('&');
}

function setKey(k, v, title) {
  var state = Object.assign({}, history.state, _defineProperty({}, k, v));
  if (!v) delete state[k];
  var pageTitle = title || document.title;
  history.pushState(state, title, stringifyQuery(state));
}

function getKey(k, defVal) {
  var state = parseQuery(window.location.search);
  return state[k] || defVal;
}

function getOptions() {
  var sector = getKey('sector');
  var subsector = getKey('subsector');
  var includeAvNav = getKey('avnav');
  var chartType = getKey('chartType');
  var sectortree = seriesTree.tree[sector];

  if (sector && sectortree) {
    if (subsector) {
      var subsectortree = sectortree[subsector] || sectortree[subsector]._[subsector];

      if (subsectortree) {
        return {
          tree: subsectortree,
          title: subsector,
          avnav: includeAvNav,
          chartType: chartType
        };
      }
    }

    return {
      tree: sectortree,
      title: sector,
      avnav: includeAvNav,
      chartType: chartType
    };
  }

  return {
    tree: seriesTree.tree,
    title: 'Estimated territorial greenhouse gas emissions by source category, UK 1990-2018',
    avnav: includeAvNav,
    chartType: chartType
  };
}
/*function update(action){
    switch(action.type){
        case "":
    }
}*/