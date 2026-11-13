(function(){'use strict';
function fix(){var fleet=document.querySelector('.alex17-fleet');if(!fleet)return;
 var cars=fleet.querySelectorAll('img');cars.forEach(function(car,i){car.classList.toggle('topcar',i<2);car.classList.toggle('bottomcar',i>=2)});
}fix();setTimeout(fix,250);
})();
