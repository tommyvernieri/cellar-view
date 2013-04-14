(function () {

  CellarView.ProgressAnimation = (function() {
    var count,
      delay,
      timeoutId;
    
    delay = 100;
    count = 0;
    
    function rotate() {
      var spinnerEl,
        transform;
        
      spinnerEl = document.getElementById('spinner');
      transform = 'scale(0.5) rotate(' + count + 'deg)';
      spinnerEl.style.MozTransform = transform;
      spinnerEl.style.WebkitTransform = transform;

      if (count === 360) {
        count = 0;
      }
      count += 45;
      
      timeoutId = window.setTimeout(rotate, delay);
    }
    
    function stopCore() {
        if (typeof timeoutId !== 'undefined') {
          window.clearTimeout(timeoutId);
          timeoutId = undefined;
        }
    }
    
    return {
      start: function() {
        stopCore();
        timeoutId = window.setTimeout(rotate, delay);
      },
      
      stop: function() {
        stopCore();
      }
    };

  })();

})();