var tsv = document.getElementById('table3').textContent
var data = tsv
  .trim()
  .split('\n')
  .map(l => l.split('\t').map(c => c.replace(/^"|"$/g, '')))
var years = data[2].slice(2)
var rows = data.slice(3)
console.log(rows)
function findSector(rows, i) {
  var r = rows[i]
  return r[0] && (!r[1] || r[1] === r[0]) ? r[0] : findSector(rows, i - 1)
}
var allSeries = rows
  .map((r, i) => ({
    sector: findSector(rows, i),
    sub_sector: r[1],
    data: r
      .slice(2)
      .filter(y => y !== '')
      .map((y, i) => ({y: new Number(y), x: years[i]})),
  }))
  .filter((x, i) => x.data.length && x.sector !== 'Grand Total')
var topSeries = allSeries.filter((x, i) => x.sub_sector === '' || x.sub_sector===x.sector)

console.log(allSeries)

function showChart(seriesIndex) {
  if (seriesIndex === undefined) {
    var title =
      'Estimated territorial greenhouse gas emissions by source category, UK 1990-2018'
    var series = topSeries.map(x => ({
      name: x.sector,
      data: x.data,
    }))
  } else {
    var title = topSeries[seriesIndex].sector
    var series = allSeries
      .filter(
        x => x.sector === topSeries[seriesIndex].sector && x.sub_sector !== '',
      )
      .map(x => ({
        name: x.sub_sector,
        data: x.data,
      }))
  }
  document.title = 'UK GHG 1990-2018 :: ' + title

  var options = {
    series: series,
    //.sort((a,b) => a.data[0].y > b.data[0].y),
    chart: {
      type: 'area',
      stacked: true,
      height: 500,
      events: {
        click: function(event, context, config) {
          console.info(event, context, config)
          var sI = config.seriesIndex
          console.info(sI)
          if (sI > -1) {
            chart.destroy()
            seriesIndex === undefined ? showChart(sI) : showChart()
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
      yaxis: {
        lines: {
          offsetX: -30,
        },
      },
      padding: {
        left: 20,
      },
    },
  }

  var chart = new ApexCharts(document.querySelector('#chart'), options)
  chart.render()
}

showChart()
