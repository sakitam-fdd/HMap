/**
 * Created by FDD on 2017/10/10.
 * @desc 主操作
 */
var baseUrl = ''
$(document).ready(function () {
  $('#navbar-collapse .navbar-left').on('click', function (event) {
    var ev = event || window.event;
    var target = ev.target || ev.srcElement;
    $(this).find('.active').removeClass('active');
    if (target.nodeName.toLowerCase() === 'li') {
      $(target).addClass('active');
    } else if (target.nodeName.toLowerCase() === 'a') {
      $(target).parent('li').addClass('active');
    }
  })
  var $container = $('#explore-container .item-list-panel');
  var nav = $('#left-item-nav ul')
  navList.forEach(function (item) {
    nav.append($("<li>").append(
      '<a class="left-list-nav-link" id="left-item-nav-' + item['href'] + '" ' +
      'href="#item-type-' + item['href'] + '">' +
      '<div class="item-icon" style="background-image: url(' + item['icon'] + ');"></div>' +
      '<div class="item-name">' + item['name'] + "</div>" +
      "</a>"));

    $container.append('<h3 class="item-type-head" id="item-type-'
      + item['href'] + '">' + item['name'] + '</h3>')
      .append('<div class="row" id="item-row-' + item['href'] + '"></div>');
  })
  var listTarget = $("#left-item-nav");
  var layer = $('#nav-layer');
  var mask = $('#nav-mask');

  /**
   * 鼠标移入列表事件
   * @param type
   */
  function hoverNav(type) {
    var liString = '';
    for (var eid = 0, elen = EXAMPLES.length; eid < elen; ++eid) {
      if (EXAMPLES[eid].type === type) {
        liString += '<li>'
          +   '<a href="demo.html#' + EXAMPLES[eid].id + '">'
          +       '<img src="' + GALLERY_THUMB_PATH + EXAMPLES[eid].id + '.png">'
          +   '</a>'
          +'</li>';
      }
    }
    $('#nav-layer .chart-list').html(liString);
  }

  /**
   * 获取列表距头部高度
   * @param top
   * @param height
   * @returns {*}
   */
  function getLayerTop(top, height) {
    var windowHeight = $(window).height();
    var maxTop = windowHeight - height;
    if (top >= maxTop) {
      top = maxTop;
    }
    return top;
  }

  /**
   * 切换
   * @param isshow
   */
  function toggle(isshow) {
  }

  listTarget.on('mouseover', function () {
    toggle(true);
  });

  $(listTarget).find('ul').on('click', function (event) {
    var ev = event || window.event;
    var target = ev.target || ev.srcElement;
    $(this).find('.active').removeClass('active');
    if (target.nodeName.toLowerCase() === 'a') {
      $(target).parent('li').addClass('active');
    } else if (target.nodeName.toLowerCase() === 'div') {
      $(target).parent().parent('li').addClass('active');
    }
  });

  layer.on('click', '.iconfont', function () {
    toggle(false);
  }).on('mouseover', function () {
    toggle(true);
    Ps.update(layer[0]);
  });
  mask.on('mouseover', function () {
    setTimeout(function () {
      toggle(false);
    }, 200);
  });
  Ps.initialize(listTarget[0]);

  // 示例容器
  examplesList.forEach(function (item) {
    if (item['childrens'].length > 0) {
      item['childrens'].forEach(function (cls) {
        // show title if exists
        var title = cls.title || '未命名图表';
        var subtitle = cls.subtitle || '点击查看详情';
        // append dom element
        var $row = $('<div class="col-lg-3 col-md-4 col-sm-6"></div>');
        var $chart = $('<div class="item-ls"></div>');
        $('#item-row-' + item['alias']).append($row.append($chart));

        var $link = $('<a target="_blank" class="item-link" href="' + cls['url'] + '"></a>');
        $chart.append($link);
        $link.append('<h4 class="item-title">' + title + '</h4>')
        var $chartArea = $('<img class="item-area" data-original="' + cls['icon'] +'" />');
        $link.append($chartArea);
      })
    }
  })

  var waypoints = $('.item-type-head').waypoint(function (direction) {
    var names = this.element.id.split('-');
    if (names.length === 3) {
      $('#left-item-nav li').removeClass('active');
      $('#left-item-nav-' + names[2]).parent('li').addClass('active');
    }
  }, {
    offset: 70
  });

  window.addEventListener('hashchange', function () {
    scrollBy(0, -80);
    var names = location.hash.split('-');
    if (names.length === 3) {
      $('#left-item-nav li').removeClass('active');
      $('#left-item-nav-' + names[2]).parent('li').addClass('active');
    }
  });

  // highlight the first chart in chart navbar
  $('#left-item-nav li').first().addClass('active');

  // Lazy load
  $('.item-area').lazyload();
});