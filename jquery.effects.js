(function( $ ) {

    $.expr[':'].invisibility = function(){
        var $this = $(this);
        var isHidden = false;
        $this.add($this.parents()).each(function(){
            if ($(this).css('visibility') == 'hidden') isHidden = true;
        });

        return isHidden;
    };

    $.expr[':'].visibility = function(){
        return !$(this).is(':invisibility');
    };

    $.fn.visible = function() {
      return $( this ).each(function(){
          if ($(this).parent().is(':visibility')) $(this).css('visibility', 'visible');
      });
    }

    $.fn.invisible = function() {
        return $( this ).each(function(){
            $(this).find('*').each(function(){
                if ($(this).css('visibility') == 'visible') $(this).css('visibility', '');
            });
            $(this).css('visibility', 'hidden');
        });
    }
})( jQuery );

(function( $ ) {

    function getAnimationBox(el){
        var body = document.body;
        var box = el.parent();
        while ((box.css('overflow') != 'hidden') && (box.get(0) != body)){
            box = box.parent();
        }

        return box;
    }

    function createClone(el, box){
        var clone = el.clone();
        $('<div>').css({
            'position': 'absolute',
            'overflow': 'hidden',
            'margin': 0,
            'z-index': 0,
            'pointer-events': 'none',
            'background': 'none'
        })
          .width(box.get(0).scrollWidth)
          .height(box.get(0).scrollHeight)
          .addClass('effect-clone')
          .append(clone)
          .insertBefore(el)
          .offset(box.offset());

        clone.addClass('effect-clone')
            .width(el.width())
            .height(el.height())
            .css({
                'position': 'absolute',
                'margin': 0
            });

        return clone;
    }

    function removeClone(clone){
        clone.parent().remove();
    }

    //move animation
    $.fn.move = function(o, done) {
      o = $.extend({}, $.fn.move.defaults, o);

      return $( this ).each(function(){
          var $this = $(this);

          if ($this.closest('.effect-clone').length){
              if (done) done();
              return;
          }

          $this.queue(function(){
              var box = getAnimationBox($this);

              winWidth = box.get(0).scrollWidth;
              winHeight = box.get(0).scrollHeight;

              var startPos = {};
              var animatePos = {};

              var offset = $this.offset();

              animatePos = {
                  'top': offset.top,
                  'left': offset.left
              };

              switch(o.direction){
                  case 'top':
                      startPos = {
                          'top': offset.top + winHeight,
                          'left': offset.left
                      };
                      break;

                  case 'bottom':
                      startPos = {
                          'top': offset.top - winHeight,
                          'left': offset.left
                      }
                      break;

                  case 'right':
                      startPos = {
                          'top': offset.top,
                          'left': offset.left - winWidth
                      };
                      break;

                  case 'left':
                  default:
                      startPos = {
                          'top': offset.top,
                          'left': offset.left + winWidth
                      };
              }

              if (!o.show){
                  var exchangePos = animatePos;
                  animatePos = startPos;
                  startPos = exchangePos;
              }

              var pos;
              var clone = $this.data('animationClone');
              if (!clone){
                  if (!o.show && !($this.css('visibility') == 'visible') || o.show && ($this.css('visibility') == 'visible')){
                      if (done) done();
                      $this.dequeue();
                      return;
                  }

                  clone = createClone($this, box);
                  clone.offset(animatePos);

                  $this.data('animationClone', clone);
              } else {
                  startPos = clone.offset();
                  clone.offset(animatePos);
              }

              $this.invisible();

              pos = clone.position();
              clone.offset(startPos)
                  .visible()
                  .animate(pos, {
                      queue: false,
                      duration: o.duration,
                      complete: function(){
                          $this.removeData('animationClone');
                          removeClone(clone);

                          o.show && $this.visible();

                          if (done) done();
                          $this.dequeue();
                      }
                  });
          });
      });
    }

    $.fn.move.defaults = {
        direction: 'left',
        duration: 100,
        show: true
    };


    //fade animation
    $.fn.fade = function(o, done) {
      o = $.extend({}, $.fn.fade.defaults, o);

      return $( this ).each(function(){
          var $this = $(this);

          if ($this.closest('.effect-clone').length){
              if (done) done();
              return;
          }

          $this.queue(function(){
              var box = getAnimationBox($this);

              var clone = $this.data('animationClone');
              if (!clone){
                  if (!o.show && !($this.css('visibility') == 'visible') || o.show && ($this.css('visibility') == 'visible')){
                      if (done) done();
                      $this.dequeue();
                      return;
                  }

                  clone = createClone($this, box);
                  clone.css({
                      'opacity': o.show ? 0 : 1,
                  })
                  .offset($this.offset());

                  $this.data('animationClone', clone);
              }

              $this.invisible();

              clone.visible()
                  .animate({
                          'opacity': o.show ? 1 : 0
                      }, {
                          queue: false,
                          duration: o.duration,
                          complete: function(){
                              $this.removeData('animationClone');
                              removeClone(clone);

                              o.show && $this.visible();

                              if (done) done();
                              $this.dequeue();
                          }
                      });
          });
      });
    }

    $.fn.fade.defaults = {
        duration: 100,
        show: true
    };
})( jQuery );