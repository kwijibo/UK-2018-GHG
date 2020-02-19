var tsv = document.getElementById('table3').textContent
var data = tsv
  .trim()
  .split('\n')
  .map(l => l.split('\t').map(c => c.replace(/^"|"$/g, '')))
var years = data[2].slice(2)
var rows = data.slice(3)

var seriesTree = rows.reduce(
  function(result, row) {
    var lastTop = result.lastTop
    var lastSub = result.lastSub
    var first = row[0]
    var second = row[1]
    var dataPoints = row
      .slice(2)
      .filter(y => y !== '')
      .map((y, i) => ({y: new Number(y), x: years[i]}))
    if (!dataPoints.length) return result

    var isTop = !second || first === second
    var isSub = !isTop && first
    var isSubSub = !!second
    if (isTop) {
      result.lastTop = first
      if (first === 'Grand Total') {
        result.tree['data'] = dataPoints
      } else {
        result.tree[first] = {data: dataPoints}
      }
      result.lastSub = undefined
    } else if (isSub) {
      result.lastSub = first
      result.tree[lastTop][first] = {[second]: dataPoints}
      result.uncalculatedSubs.push([lastTop, first])
    } else if (isSubSub) {
      var sub = lastSub || '_'
      result.tree[lastTop][sub] = result.tree[lastTop][sub] || {}
      result.tree[lastTop][sub][second] = dataPoints
    }
    return result
  },
  {tree: {}, lastTop: undefined, lastSub: undefined, uncalculatedSubs: []},
)

seriesTree.uncalculatedSubs.forEach(function(p) {
  const [first, second] = p
  var sub = seriesTree.tree[first][second]
  sub.data = Object.values(sub).reduce(
    zipLists((a, b) => ({y: a.y + b.y, x: a.x})),
  )
})

function zipLists(f) {
  return (a, b) => a.map((x, i) => f(x, b[i]))
}

function showChart(title, tree) {
  var subTree = tree._ ? tree._ : tree
  var entries = Object.entries(subTree).filter(([k, v]) => k != 'data')
  var series = entries.map(([k, v]) => ({name: k, data: v.data ? v.data : v}))
  //  series.push({name: "Total", data: tree.data})
  console.log(series)
  document.title = 'UK GHG 1990-2018 :: ' + title

  var options = {
    series: series,
    colors: [
        '#008FFB',
        '#00E396',
        '#FEB019',
        '#FF4560',
        '#775DD0',
        '#4ecdc4',
        '#c7f464',
        '#81D4FA',
        '#546E7A',
        '#fd6a6a',
      ],
    chart: {
      
      type: 'area',
      stacked: false,
      height: 650,
      events: {
        click: function(event, context, config) {
          console.info(event, context, config)
          var sI = config.seriesIndex
          console.info(sI, entries[sI])
          if (sI > -1) {
            chart.destroy()
            if (Array.isArray(entries[sI][1])) {
              showTopChart()
            } else {
              showChart(entries[sI][0], entries[sI][1])
            }
          }
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },

    title: {
      text: title,
      align: 'left',
      style: {
        fontSize: '14px',
      },
    },
    xaxis: {
      type: 'year',
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      tickAmount: 20,
      floating: false,
      padding: {
        bottom: 10,
      },

      labels: {
        formatter: function(val) {
          return parseInt(val)
        },
        style: {
          color: '#8e8da4',
        },
        offsetY: -7,
        offsetX: 0,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    fill: {
      opacity: 0.5,
    },
    tooltip: {
      x: {
        format: 'yyyy',
      },
      fixed: {
        enabled: false,
        position: 'topRight',
      },
    },
    grid: {
      xaxis: {lines: {show: false}},
      yaxis: {lines: {show: false}},
    },
  }

  var chart = new ApexCharts(document.querySelector('#chart'), options)
  chart.render()
}

function showTopChart() {
  showChart(
    'Estimated territorial greenhouse gas emissions by source category, UK 1990-2018',
    seriesTree.tree,
  )
}

showTopChart()
