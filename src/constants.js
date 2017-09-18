/**
 * Created by FDD on 2017/9/18.
 * @desc 静态变量相关
 */

const EVENT_TYPE = { // 事件类型
  LOAD_MAP_SUCCESS: 'loadMapSuccess', // 地图初始化成功事件
  CLICK: 'click', // 点击事件
  DBCLICK: 'dbclick', // 双击事件
  SINGLECLICK: 'singleclick', // 单击事件
  MOVESTART: 'movestart', // 地图开始移动事件
  MOVEEND: 'moveend', // 地图结束移动事件
  POINTERDRAG: 'pointerdrag', // 拖拽事件
  POINTERMOVE: 'pointermove', // 移动事件
  PRECOMPOSE: 'precompose', // 开始渲染之前
  POSTRENDER: 'postrender', // 开始渲染
  POSTCOMPOSE: 'postcompose', // 渲染完成
  PROPERTYCHANGE: 'propertychange', // 属性变化
  CHANGE: 'change', // change
  CHANGELAYERGROUP: 'change:layerGroup', // 图层组变化
  CHANGESIZE: 'change:size', // 大小变化
  CHANGETARGET: 'change:target', // target变化
  CHANGEVIEW: 'change:view', // 视图变化
  FEATUREONMOUSEOVER: 'feature:onmouseover', // 要素的鼠标移入事件
  FEATUREONMOUSEOUT: 'feature:onmouseout', // 要素的鼠标移出事件
  FEATUREONMOUSEDOWN: 'feature:onmousedown', // 要素鼠标按下
  FEATUREONMOUSEUP: 'feature:onmouseup', // 要素鼠标抬起
  FEATUREONMOVE: 'feature:onmove', // 要素移动
  FEATUREONSELECT: 'feature:onselect', // 要素选中事件
  FEATUREONDISSELECT: 'feature:ondisselect' // 要素取消选中事件
}

const INTERNAL_KEY = { // 自定义键值
  SELECTABLE: 'selectable', // 要素是否可以被选择
  MOVEABLE: 'moveable' // 要素是否可以被移动
}

export {
  EVENT_TYPE,
  INTERNAL_KEY
}
