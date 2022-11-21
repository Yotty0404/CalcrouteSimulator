var isDispKeyboard = false;
var moveHistory = []
var lastMoveDirection = "";
var sameMoveCount = 0;
var topNum = 0;
var bottomNum = 1;

const gcd = (x, y) => {
  return (x % y) ? gcd(y, x % y) : y;
}

for(i=1;i<=25;i++){
  var cell = $("<div>", {
    class: "cell",
    value: i,
  });

  cell.appendTo("#stage");
}

var timer = false;
$(window).resize(function(){
  if(!$('#piece').length) return;

  $('#piece').css('transition-duration', '0s');
  var val = Number($("#piece").attr("value"));
  var offset = $(`.cell[value=${val}]`).offset();
  $("#piece").offset({ top: offset.top, left: offset.left });

  if (timer !== false) {
    clearTimeout(timer);
  }
  //リサイズが終了したときの処理
  timer = setTimeout(function() {
    $('#piece').css('transition-duration', '0.2s');
  }, 200);
});

$(document).on("click", ".cell", function () {
  if($('#piece').length) return;
  $("#piece").remove();
  var piece = $("<div>", {
    id: "piece",
    value:$(this).attr("value"),
  });

  var offset = $(this).offset();
  piece.offset({ top: offset.top, left: offset.left });
  piece.appendTo('#stage');

  if(!isDispKeyboard){
    switchDispKeyboard();
  }
});

function Move(direction){
  if(!$('#piece').length) return;
  if(!CanMove(direction))return;
  if(isDispKeyboard)return;

  var val = Number($("#piece").attr("value"));
  switch (direction) {
    case 'u':
      val-=5;
      break;
    case 'r':
      val+=1;
      break;
    case 'd':
      val+=5;
      break;
    case 'l':
      val-=1;
      break;
  }

  Calc(direction);

  $("#piece").attr("value", val);
  var offset = $(`.cell[value=${val}]`).offset();
  $("#piece").offset({ top: offset.top, left: offset.left });
}

function Calc(direction){
  if(lastMoveDirection != direction){
    sameMoveCount=1;
  }
  else{
    sameMoveCount+=1;
  }

  switch (direction) {
    case 'u':
      if(lastMoveDirection == direction)topNum/=sameMoveCount-1
      topNum*=sameMoveCount;
      break;
    case 'r':
      topNum+=bottomNum;
      break;
    case 'd':
      if(lastMoveDirection == direction)topNum*=sameMoveCount-1
      bottomNum*=sameMoveCount;
      break;
    case 'l':
      topNum-=bottomNum;
      break;
  }

  var gcdNum = gcd(topNum, bottomNum);
  topNum/= gcdNum;
  bottomNum/= gcdNum;

  $('#piece').removeClass("piece_fraction");
  $('#piece').text(topNum);
  if(bottomNum!=1)CraeteFraction(topNum, bottomNum);
  lastMoveDirection = direction;
}

function CraeteFraction(topNum, bottomNum){
  $('#piece').addClass("piece_fraction");
  $('#piece').empty();
  $("#piece").append(`<span class="numerator">${topNum}</span>`)
  $("#piece").append(`<span class="divide">／</span>`)
  $("#piece").append(`<span class="denominator">${bottomNum}</span>`)
}

function CanMove(direction){
  var val = Number($("#piece").attr("value"));
  if(direction == 'u' && val<=5){
    return false;
  }
  if(direction == 'r' && val%5==0){
    return false;
  }
  if(direction == 'd' && val>=21){
    return false;
  }
  if(direction == 'l' && val%5==1){
    return false;
  }
  return true;
}


$(document).on("click", ".num", function () {
  if(!$('#piece').length) return;
  if($('#piece').text() == "" && $(this).text()=="0") return;
  var text = $('#piece').text() + $(this).text()
  $('#piece').text(text);
});

$(document).on("click", "#key_back", function () {
  var temp_txt = $('#piece').text();
  $('#piece').text(temp_txt.slice(0, -1));
});

$(document).on("click", "#key_enter", function () {
  if($('#piece').text()=="") return;
  switchDispKeyboard();

  //初期化
  topNum = Number($('#piece').text());
  bottomNum = 1;
  sameMoveCount=0;
  lastMoveDirection = "";
});

function switchDispKeyboard(){
  if(isDispKeyboard){
    $("#keyboard").css('bottom', '-180px');
  }
  else{
    $("#keyboard").css('bottom', '0');
  }
  isDispKeyboard = !isDispKeyboard;
}


$(document).keydown(function(e){
  switch(e.which){
    case 38: // Key[↑]
      Move('u');
      break;
    case 39: // Key[→]
      Move('r');
      break;
    case 40: // Key[↓]
      Move('d');
      break;
    case 37: // Key[←]
      Move('l');
      break;
  }
});

var flickDirection = '';
$(document).on('touchstart', 'body', onTouchStart);
$(document).on('touchmove', 'body', onTouchMove);
$(document).on('touchend', 'body', onTouchEnd);

function onTouchStart(event) {
  $(event.currentTarget).addClass('gray_for_touch');

  position = event.originalEvent.touches[0];
  flickDirection = 'c';
};

function onTouchMove(event) {
  flickDirection = 'c';
  var new_position = event.originalEvent.touches[0];

  var u = position.screenY - new_position.screenY;
  var d = new_position.screenY - position.screenY;
  var l = position.screenX - new_position.screenX;
  var r = new_position.screenX - position.screenX;
  var max = Math.max(u, d, r, l);

  if (max < 20) {
    return;
  }

  if (max == u) {
    flickDirection = 'u';
  }
  else if (max == r) {
    flickDirection = 'r';
  }
  else if (max == d) {
    flickDirection = 'd';
  }
  else if (max == l) {
    flickDirection = 'l';
  }
};

function onTouchEnd(event) {
  Move(flickDirection);
};



$(document).on("click", "#btn_delete", function () {
  $("#piece").remove();
});
