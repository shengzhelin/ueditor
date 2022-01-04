export const opt1=[
  {
    value:'#ff4d4f',
    key:'danger',
    label:'高風險',
  },

  {
    value:'#fa8c16',
    key:'warning',
    label:'較高風險',
  },

  {
    value:'#faad14',
    key:'alert',
    label:'中風險',
  },

  {
    value:'#1890ff',
    key:'low',
    label:'低風險',
  },
];
const color=['#1890ff','#faad14','#fa8c16','#ff4d4f'];

export const option = ops => ({
  title: {
    text: '告警統計',
    subtext: `報告周期 ${ops.time}`,
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ops.legend,
  },
  /* legend: {
    orient: 'horizontal',//vertical
    // left: 10,
    right:50,
    // x:'center',
    y:'top',
    padding:[10,0,0,0],
    data: color.map(v=>v.label),
  }, */
  color,
  series: [{
    name: '告警等級',
    type: 'pie',
    radius: '55%',
    center: ['50%', '60%'],
    data:ops.data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  }],
});


export const option1 = ops => ({
  title: {
    text: '告警TOP10',
    subtext: `報告周期 ${ops.time}`,
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  color:color[0],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01],
  },
  yAxis: {
    type: 'category',
    data: ops.legend,
  },
  series: [
    {
      name: '告警數',
      type: 'bar',
      data: ops.data,
    },
  ],
});
