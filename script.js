var isDispKeyboard = false;
var moveHistory = [];
var lastMoveDirection = "";
var sameMoveCount = 0;
var topNum = 0;
var bottomNum = 1;

const gcd = (x, y) => {
  return (x % y) ? gcd(y, x % y) : y;
}

$(window).on('load', function (){
  for(i=1;i<=25;i++){
    var cell = $("<div>", {
      class: "cell",
      value: i,
    });

    cell.appendTo("#stage");
  }
});

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
  if($('#piece').length && !isDispKeyboard) return;
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


  if(lastMoveDirection != direction){
    moveHistory.push({direction:direction, sameMoveCount:1});
  }
  else{
    moveHistory.slice(-1)[0].sameMoveCount += 1;
  }

  $("#piece").attr("value", val);
  var offset = $(`.cell[value=${val}]`).offset();
  $("#piece").offset({ top: offset.top, left: offset.left });

  lastMoveDirection = direction;
  DispMove();
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
      if(lastMoveDirection == direction)bottomNum*=sameMoveCount-1;
      topNum*=sameMoveCount;
      break;
    case 'r':
      topNum+=bottomNum;
      break;
    case 'd':
      if(lastMoveDirection == direction)topNum*=sameMoveCount-1;
      bottomNum*=sameMoveCount;
      break;
    case 'l':
      topNum-=bottomNum;
      break;
  }

  DispCalcResult();
}

function Back(){
  if(!$('#piece').length) return;
  if(isDispKeyboard)return;
  if(moveHistory.length==0)return;

  var direction = moveHistory.slice(-1)[0].direction;

  var val = Number($("#piece").attr("value"));
  switch (direction) {
    case 'u':
      val+=5;
      break;
    case 'r':
      val-=1;
      break;
    case 'd':
      val-=5;
      break;
    case 'l':
      val+=1;
      break;
  }

  CalcForBack(direction);

  if(moveHistory.slice(-1)[0].sameMoveCount==1){
    moveHistory.pop();

    if(moveHistory.length==0){
      lastMoveDirection = "";
      sameMoveCount=0;
    }
    else{
      lastMoveDirection = moveHistory.slice(-1)[0].direction;
      sameMoveCount=moveHistory.slice(-1)[0].sameMoveCount;
    }
  }
  else{
    moveHistory.slice(-1)[0].sameMoveCount-=1;
    sameMoveCount = moveHistory.slice(-1)[0].sameMoveCount;
  }

  $("#piece").attr("value", val);
  var offset = $(`.cell[value=${val}]`).offset();
  $("#piece").offset({ top: offset.top, left: offset.left });
  DispMove();
}

function CalcForBack(direction){
  sameMoveCount = moveHistory.slice(-1)[0].sameMoveCount;

  switch (direction) {
    case 'u':
      bottomNum*=sameMoveCount;
      if(sameMoveCount!=1)topNum*=sameMoveCount-1;
      break;
    case 'r':
      topNum-=bottomNum;
      break;
    case 'd':
      topNum*=sameMoveCount;
      if(sameMoveCount!=1)bottomNum*=sameMoveCount-1;
      break;
    case 'l':
      topNum+=bottomNum;
      break;
  }

  DispCalcResult();
}

function DispCalcResult(){
  var gcdNum = gcd(topNum, bottomNum);
  topNum/= gcdNum;
  bottomNum/= gcdNum;
  //マイナスを分子に表示
  if(bottomNum < 0){
    topNum*=-1;
    bottomNum*=-1;
  }

  $('#piece').removeClass("piece_fraction");
  $('#piece').text(topNum);
  if(bottomNum!=1)CreateFraction(topNum, bottomNum);
}

function CreateFraction(topNum, bottomNum){
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
  if($('#piece').text()=="0"){
    var text = $(this).text()
    }
  else{
    var text = $('#piece').text() + $(this).text()
    }

  $('#piece').text(text);
});

$(document).on("click", "#key_back", function () {
  var temp_txt = $('#piece').text();
  $('#piece').text(temp_txt.slice(0, -1));
});

$(document).on("click", "#key_enter", function () {
  if($('#piece').text()=="") return;
  switchDispKeyboard();
  Reset();
});

function switchDispKeyboard(){
  if(isDispKeyboard){
    $("#keyboard_container").css('bottom', '-180px');
  }
  else{
    $("#keyboard_container").css('bottom', '0');
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

  if (max < 15) {
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
  if (flickDirection == 'c') return;
  Move(flickDirection);
};



$(document).on("click", "#btn_delete", function () {
  $("#piece").remove();
  $('#row_moves').empty();
  Reset();
});


$(document).on("click", "#btn_back", function () {
  Back();
});


$(document).on("click", "#btn_restart", function () {
  while(moveHistory.length>0){
    Back();
  }
  Reset();
});


function DispMove(){
  $("#moves_dummy").hide();
  $("#move_excess").hide();
  var roopCount = Math.min(moveHistory.length, 8);
  $('#row_moves').empty();
  for (let i = 0; i < roopCount; i++) {
    var symbol = "";
    var str_class = "";
    switch (moveHistory[i].direction) {
      case 'u':
        symbol = "×";
        str_class = "move_times";
        break;
      case 'r':
        symbol = "+";
        str_class = "move_plus";
        break;
      case 'd':
        symbol = "÷";
        str_class = "move_divided";
        break;
      case 'l':
        symbol = "－";
        str_class = "move_minus";
        break;
    }
    $("#row_moves").append(`<div class="${str_class}">${symbol+moveHistory[i].sameMoveCount}</div>`)
  }

  if(moveHistory.length > 8){
    $("#moves_dummy").show();
    $("#move_excess").show();

    $("#move_excess").addClass('moves_animation');
    setTimeout(() => {$("#move_excess").removeClass('moves_animation')}, 200);
    ;
  }
  else{
    $($("#row_moves").children().slice(-1)[0]).addClass('moves_animation');
  }
}

function Reset(){
  //初期化
  topNum = Number($('#piece').text());
  bottomNum = 1;
  sameMoveCount=0;
  lastMoveDirection = "";
  moveHistory = [];
  DispMove();
}
