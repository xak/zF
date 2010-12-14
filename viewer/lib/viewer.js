  var Viewer = function(viewerId,panelClass,scrollVertical) {
  	var t = this;
  	
  	this.$viewer = $('#'+viewerId);
  	this.panelClass = panelClass;
  	this.$panels = $('.'+this.panelClass,this.$viewer);
  	
  	this.$next = $('nav #next');
  	this.$prev = $('nav #prev');
  	
  	this.current;
  	
  	//test
	this.$panels.each(function(i) {
		//$(this).html('0'+ i);
	});
  	
  	this.isVerticalScroll = scrollVertical || false;
  	this.$scroll; //created and set in init()
  	this.setWidth = function() {
		//check number of panels against
		var _$panels = $('.'+t.panelClass,t.$viewer),
			_w = 0;
		t.$panels = _$panels;	
		t.$panels.each(function(i) {
			var $t = $(this);
			//add full width
			_w += $t.width() + parseInt($t.css('margin-left').replace('px','')) + parseInt($t.css('margin-right').replace('px',''));


		});
		
		//v++;
		t.$scroll.width(_w+1000);
		//console.log(_w)
  	};
  	this.setCurrent = function(elId) {
		t.current = elId || '#'+t.$panels.eq(0).attr('id');
  	};
  	
  	this.load = function(href,cb) {
  		var frag = href.replace('#!','');
 // 		console.log(frag)
  		$.get('', { '_escaped_fragment_' : frag }, function(data){
			var $newpanel = $('<div class="panel" />').append(data);
			t.$scroll.append($newpanel);
			if(cb) {
				cb();
			}
		});
  	
  	};
  	
  	this.setHeight = function() {
		//check number of panels against
		var _$panels = $('.'+t.panelClass,t.$viewer),
			_h = 0;
		t.$panels = _$panels;	
		t.$panels.each(function() {
			var $t = $(this);
			//add full width
			_h += $t.height() + parseInt($t.css('margin-top').replace('px','')) + parseInt($t.css('margin-bottom').replace('px',''));
		});
		t.$scroll.height(_h);
		//console.log(_h)
  	};
  	
  	this.init = function() {
		if(!t.$scroll) {
			t.$viewer.wrapInner('<div/>');
			t.$scroll = t.$viewer.children('div').addClass('inner-wrap');
			t.setCurrent();
		}
		if(scrollVertical) { t.setHeight(t.$scroll); return; } 
  		t.setWidth(t.$scroll);
  	};
  	
	(function(t) {
		t.init();
	})(this)


}