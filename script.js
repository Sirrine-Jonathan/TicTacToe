  //variables
  var canMove;
  var userFirst;
  var winner;
  var oneSymbol = 'x';
  var twoSymbol = 'o';
  var used = [];
  var start;
  var win;

  //DIFFICULTY VARIABLES
  //keeps who went first
  var whoFirst = "nobody";
  //steps for controlling logic
  var step = 1;
  //computers first index
  var compFindex = 100;
  //users first index
  var userFindex = 100;
  //users last index
  var LastUserIndex = 100;
  var userCorner;
  var tries = 0;

  //VARIABLES FOR DIFFERENT VERSIONS
  //random computer corner index used in 1.3 && 2.11
  var compCorner;
  //two available corners in an array used in 1.3 step 2
  var biCorner;
  var biSides;
  var biCornerInd;
  //used in 1.3 step 1 & 2
  var compCorner2;
  //used in 
  var userBlocked;
  var userTookCorner = false; //important that it start false
  var userCouldBlock;

  //game settings
  var multiplayer;
  var difficult = false;
  var medium = false;
  var turn = 'Player One';

  //comp response times
  var times = [500, 1000, 1700];

  function randTime() {
    return times[Math.floor(Math.random() * 3)];
  }

  //each square in grid
  var elements = [
    $('#tl'), $('#tc'), $('#tr'),
    $('#ml'), $('#mc'), $('#mr'),
    $('#bl'), $('#bc'), $('#br')
  ]

  var lines = {
    topRow: [],
    middleRow: [],
    bottomRow: [],
    leftColumn: [],
    middleColumn: [],
    rightColumn: [],
    forwardDiagonal: [],
    backwardDiagonal: []
  };

  var winLineIndexes = {
    topRow: [0, 1, 2],
    middleRow: [3, 4, 5],
    bottomRow: [6, 7, 8],
    leftColumn: [0, 3, 6],
    middleColumn: [1, 4, 7],
    rightColumn: [2, 5, 8],
    forwardDiagonal: [6, 4, 2],
    backwardDiagonal: [0, 4, 8]
  }

  //add comp and user choices to check arrays
  function addToCheck(person, index) {
    //rows
    if (index < 3) {
      lines.topRow.push(person);
    }
    if (index > 2 && index < 6) {
      lines.middleRow.push(person);
    }
    if (index > 5) {
      lines.bottomRow.push(person);
    }
    //columns
    if (index === 0 || index === 3 || index === 6) {
      lines.leftColumn.push(person);
    }
    if (index === 1 || index === 4 || index === 7) {
      lines.middleColumn.push(person);
    }
    if (index === 2 || index === 5 || index === 8) {
      lines.rightColumn.push(person);
    }
    //diagonals
    if (index === 2 || index === 4 || index === 6) {
      lines.forwardDiagonal.push(person);
    }
    if (index === 0 || index === 4 || index === 8) {
      lines.backwardDiagonal.push(person);
    }
  }

  //run a check to see if someone has won
  function checkWin() {
    var tieGame = true;

    for (var combo in lines) {
      if (lines[combo].length === 3) {
        if (lines[combo][0] === lines[combo][1] && lines[combo][1] === lines[combo][2]) {
          winner = lines[combo][0];
          setTimeout(endOfGame(winner + ' won the game!'), 700);    
          tieGame = false;
          win = true;
          canMove = false;      
        }
      } else {
        tieGame = false;
      }
    }
    if (tieGame) {
      setTimeout(endOfGame('It was a Tie Game!'), 700);
      win = true;
      canMove = false;  
    }
  }

  function endOfGame(message) {
    $('.message').text(message); 
    if (!multiplayer) {  
      init(); 
    }
  }

  function gameReset() {
    //clear board
    for (var place in elements) {
      elements[place].text(' ');
      elements[place].removeClass('used');
    }
    for (var thing in lines) {
      lines[thing] = [];
    }

    win = false;
    whoFirst = 'nobody';
    step = 1;
    compFindex = 100;
    userFindex = 100; 
    canMove = true;
    used = [];
    userTookCorner = false;
    userChoseCorner = false; 
    if (!multiplayer) { 
      init();  
    }
  }

  //initial settings
  function init() {   
    canMove = true; 
    userFirst = true; 
    win = false; 
    $('.sq').addClass('sqHoverTwo'); 
    if (!multiplayer) {  
      $(".jumbotron").slideDown();  
    }
  }

  //applies choice to board
  function applyChoice(choice, player) {
    elements[choice].text(twoSymbol);
    elements[choice].addClass('used');
    used.push(choice);
    addToCheck(player, choice);
  }

  function nextCanWin(player) {
    var canWin = false;
    var lineId;
    var addingIndex = 0;
    for (var line in lines) {
      var conseq = false;
      if (lines[line].length > 0) {
        lines[line].reduce(function(prevVal, curVal, curInd, array) {
          if (prevVal === curVal) {
            conseq = true;
          }
          prevVal = curVal;
        });
      }

      if (lines[line].indexOf(player) < 0 && conseq) {
        canWin = true;
        lineId = line;
      }
    }
    if (canWin) {
      //find index of empty
      var move;
      var test = lines[lineId];
      for (e = 0; e < winLineIndexes[lineId].length; e++) {
        if (used.indexOf(winLineIndexes[lineId][e]) < 0) {
          move = winLineIndexes[lineId][e];
        }
      }

      //applies choice to board
      applyChoice(move, 'The computer');
    }
    return canWin;
  }

  function compRandom() {
    if (difficult || medium) {
      var compCanWin = nextCanWin('You');
      var canBlock = false;
      if (!compCanWin) {
        canBlock = nextCanWin('The computer');
      }

      if (!compCanWin && !canBlock) {
        //finds unused index
        do {
          start = Math.floor(Math.random() * 9);
        }
        while (used.indexOf(start) >= 0);

        //applies choice to board
        applyChoice(start, 'The computer');
      }
    } else {
      //finds unused index
      do {
        start = Math.floor(Math.random() * 9);
      }
      while (used.indexOf(start) >= 0);

      applyChoice(start, 'The computer');
    }
  }

  function compMove() {
    var cornerANDcenter = [0, 4, 2, 4, 6, 4, 8, 4];
    if (!difficult) {
      compRandom();
    } else {
      //<<<<<<HARD MODE>>>>>>>>> 
      //all code on ver1 complete
      if (whoFirst === 'nobody') {
        whoFirst = 'computer';
      }

      //USER WENT FIRST ver 1
      if (whoFirst === 'user') {
        var userFirstMoveIndex = cornerANDcenter.indexOf(userFindex);

        //USER CHOSE SIDE 1.1
        if (userFirstMoveIndex < 0) {
          if (step === 1) {
            //go center
            applyChoice(4, 'The computer');

            //grabs user corner index
            userCorner = lastUserIndex;
          }
          if (step > 1) {
            compRandom();
          }
        }

        //USER CHOSE CORNER 1.2
        else if (userFirstMoveIndex % 2 === 0) {
          if (step === 1) {
            //go center
            applyChoice(4, 'The computer');

            //grabs user corner index
            userCorner = lastUserIndex;
          }
          if (step === 2) {
            var edges = [1, 3, 5, 7];
            var nextEdge;
            var edgeFound;

            //USER MADE DIAGONAL 1.21
            if (userCorner === 0 && lastUserIndex === 8 || userCorner === 8 && lastUserIndex === 0 || userBlocked === true) {
              //stay on edges
              edgeFound = false;
              var availEdges = false;
              for (i = 0; i < edges.length; i++) {
                if (used.indexOf(edges[i] >= 0)) {
                  availEdges = true;
                }
              }

              var blockCheck = nextCanWin('The computer');
              if (availEdges && !blockCheck) {
                do {
                  if (used.indexOf(edges[i] < 0)) {
                    edgeFound = true;
                    nextEdge = edges[Math.floor(Math.random() * 4)];
                  }
                  i++;
                } while (!edgeFound)

                //applies found edge		
                applyChoice(nextEdge, 'The computer');

              } else if (!blockCheck) {
                compRandom();
              }
              userblocked = true;
              step--; //subtracting from step will keep it in this move
            }

            //USER WENT ELSEWHERE 1.22
            else if (userCorner === 2 && lastUserIndex === 6 || userCorner === 6 && lastUserIndex === 2) {
              //move to an unused edge
              nextEdge = 1;
              edgeFound = false;
              for (i = 0; i < edges.length; i++) {
                if (used.indexOf(edges[i] < 0)) {
                  edgeFound = true;
                  nextEdge = edges[i];
                }
              }

              //applies found edge
              if (edgeFound) {
                applyChoice(nextEdge, 'The computer');
              } else {
                compRandom();
              }
              userblocked = true;
              step--; //subtracting from step will keep it in this move
            } else {
              step++
            }
          }
          if (step > 2) {
            compRandom();
          }
        }

        //USER CHOSE CENTER 1.3
        else if (userFirstMoveIndex % 2 !== 0) {
          //>>go random corner
          if (step === 1) {
            //chooses random unused corner
            do {
              var randInd = Math.floor(Math.random() * 7);
            }
            while (randInd % 2 !== 0);
            compCorner = cornerANDcenter[randInd];

            //applies choice to board
            applyChoice(compCorner, 'The computer');
          }
          if (step === 2) {

            //USER CHOSE TO BLOCK backslash 1.31
            if (compCorner === 0 && lastUserIndex === 8 || compCorner === 8 && lastUserIndex === 0) {
              //set up to win

              //chooses random unused corner
              biCorner = [2, 6];
              biCornerInd = Math.floor(Math.random() * 2);
              compCorner2 = biCorner[biCornerInd];

              //applies choice to board
              applyChoice(compCorner2, 'The computer');
            }

            //USER CHOSE TO BLOCK forwardslash
            else if (compCorner === 2 && lastUserIndex === 6 || compCorner === 6 && lastUserIndex === 2) {
              //set up to win

              //chooses random unused corner
              biCorner = [0, 8];
              randCorner = Math.floor(Math.random() * 2);
              compCorner2 = biCorner[randCorner];

              //applies choice to board
              applyChoice(compCorner2, 'The computer');
            } else {
              //USER DID NOT BLOCK set up for block until end
              step++;
            }
          }
          if (step > 2) {
            //block until end
            compRandom();
          }
        }

      }
      //COMPUTER GOES FIRST ver 2
      else if (whoFirst === 'computer') {

        //>>go random corner or center
        if (step === 1) {
          compFindex = Math.floor(Math.random() * 7);
          var first = cornerANDcenter[compFindex];
          applyChoice(first, 'The computer');
        }

        if (step > 1) {
          //CORNER METHOD 2.1    //not perfect
          if (compFindex % 2 === 0) {

            //USER RESPONSE CENTER 2.11
            if (lastUserIndex === 4 || userChoseCorner === true) {

              //>>go opposite corner in same diagonal
              if (step === 2) {
                if (cornerANDcenter[compFindex] === 0) {
                  compCorner = 8;
                } else if (cornerANDcenter[compFindex] === 8) {
                  compCorner = 0;
                } else if (cornerANDcenter[compFindex] === 6) {
                  compCorner = 2;
                } else if (cornerANDcenter[compFindex] === 2) {
                  compCorner = 6;
                }

                //applies choice to board
                applyChoice(compCorner, 'The computer');

                userChoseCorner = true;
              }
              if (step === 3) {
                //>>go unused corner
                var corners = [0, 2, 6, 8];
                var i = 0;
                var unusedCorner = corners[0];
                while (used.indexOf(unusedCorner) > 0) {
                  unusedCorner = corners[i];
                  i++;
                }
                //applies move to board
                var winCheck = nextCanWin('You');
                if (!winCheck) {
                  var blockCheck = nextCanWin('The computer');
                }
                if (!winCheck && !blockCheck) { 
                  applyChoice(unusedCorner, 'The computer');
                  userChoseCorner = true;
                }
              }
              if (step > 3) {
                compRandom();
              }
            }

            //USER RESPONSE NOT CENTER 2.12
            //bug
            else {
              if (step === 2) {
                if (cornerANDcenter[compFindex] === 0) {
                  var move;
                  biSides = [1, 3];
                  biCorner = [2, 6];

                  if (used.indexOf(biSides[0]) < 0 && used.indexOf(biCorner[0]) < 0) {
                    move = biCorner[0];
                  } else if (used.indexOf(biSides[1]) < 0 && used.indexOf(biCorner[1]) < 0) {
                    move = biCorner[1];
                  } else {
                    move = 'Not Set';
                  }

                  if (move === biCorner[0]) {
                    userCouldBlock = biSides[0];
                  } else if (move === biCorner[1]) {
                    userCouldBlock = biSides[1];
                  }

                  //applies move to board
                  var winCheck = nextCanWin('You');
                  if (!winCheck) {
                    var blockCheck = nextCanWin('The computer');
                  }
                  if (!winCheck && !blockCheck && move != 'Not Set') { //remembercloser
                    applyChoice(move, 'The computer');
                  } else {
                    compRandom();
                  }
                } else if (cornerANDcenter[compFindex] === 8) {
                  biSides = [5, 7];
                  biCorner = [2, 6];

                  if (used.indexOf(biSides[0]) < 0 && used.indexOf(biCorner[0]) < 0) {
                    move = biCorner[0];
                  } else if (used.indexOf(biSides[1]) < 0 && used.indexOf(biCorner[1]) < 0) {
                    move = biCorner[1];
                  } else {
                    move = 'Not Set';
                  }

                  if (move === biCorner[0]) {
                    userCouldBlock = biSides[0];
                  } else if (move === biCorner[1]) {
                    userCouldBlock = biSides[1];
                  }

                  //applies move to board
                  var winCheck = nextCanWin('You');
                  if (!winCheck) {
                    var blockCheck = nextCanWin('The computer');
                  }
                  if (!winCheck && !blockCheck && move !== 'Not Set') {
                    applyChoice(move, 'The computer');
                  } else {
                    compRandom();
                  }
                } else if (cornerANDcenter[compFindex] === 2) {
                  biSides = [1, 5];
                  biCorner = [0, 8];

                  if (used.indexOf(biSides[0]) < 0 && used.indexOf(biCorner[0]) < 0) {
                    move = biCorner[0];
                  } else if (used.indexOf(biSides[1]) < 0 && used.indexOf(biCorner[1]) < 0) {
                    move = biCorner[1];
                  } else {
                    move = 'Not Set';
                  }

                  if (move === biCorner[0]) {
                    userCouldBlock = biSides[0];
                  } else if (move === biCorner[1]) {
                    userCouldBlock = biSides[1];
                  }

                  //applies move to board
                  var winCheck = nextCanWin('You');
                  if (!winCheck) {
                    var blockCheck = nextCanWin('The computer');
                  }
                  if (!winCheck && !blockCheck && move !== 'Not Set') {
                    applyChoice(move, 'The computer');
                  } else {
                    compRandom();
                  }
                } else if (cornerANDcenter[compFindex] === 6) {
                  biSides = [3, 7];
                  biCorner = [0, 8];

                  if (used.indexOf(biSides[0]) < 0 && used.indexOf(biCorner[0]) < 0) {
                    move = biCorner[0];
                  } else if (used.indexOf(biSides[1]) < 0 && used.indexOf(biCorner[1]) < 0) {
                    move = biCorner[1];
                  } else {
                    move = 'Not Set';
                  }

                  if (move === biCorner[0]) {
                    userCouldBlock = biSides[0];
                  } else if (move === biCorner[1]) {
                    userCouldBlock = biSides[1];
                  }

                  //applies move to board
                  var winCheck = nextCanWin('You');
                  if (!winCheck) {
                    var blockCheck = nextCanWin('The computer');
                  }
                  if (!winCheck && !blockCheck && move !== 'Not Set') {
                    applyChoice(move, 'The computer');
                  } else {
                    //or go to usused corner?
                    compRandom();
                  }
                }
              } //end step two
              if (step === 3) {
                var move;
                //user blocked
                if (lastUserIndex === userCouldBlock) {
                  if (cornerANDcenter[compFindex] === 0 && used.indexOf(8) < 0) {
                    move = 8;
                  } else if (cornerANDcenter[compFindex] === 8 && used.indexOf(0) < 0) {
                    move = 0;
                  } else if (cornerANDcenter[compFindex] === 2 && used.indexOf(6) < 0) {
                    move = 6;
                  } else if (cornerANDcenter[compFindex] === 6 && used.indexOf(2) < 0) {
                    move = 2;
                  } else {
                    move = 'Not Set';
                  }

                  //applies move to board
                  var winCheck = nextCanWin('You');
                  if (!winCheck) {
                    var blockCheck = nextCanWin('The computer');
                  }
                  if (!winCheck && !blockCheck && move !== 'Not Set') {
                    applyChoice(move, 'The computer');
                    //before was else{}...logic allowed for two moves
                  } else if(!winCheck && !blockCheck && move === 'Not Set') {
                    compRandom();
                  }
                }
                //user didn't block
                else {
                  step++;
                }
              }
              if (step > 3) {
                compRandom();
              }
            }
          }

          //CENTER METHOD 2.2
          else {
            //USER RESPONSE SIDE 2.21
            if (step === 2) {
              if (cornerANDcenter.indexOf(userFindex) < 0) {
                var move;
                //>>go corner farthest from edge piece
                if (lastUserIndex === 1) {
                  biCorner = [6, 8];
                } else if (lastUserIndex === 3) {
                  biCorner = [2, 8];
                } else if (lastUserIndex === 5) {
                  biCorner = [0, 6];
                } else if (lastUserIndex === 7) {
                  biCorner = [0, 2];
                }

                biCornerInd = Math.floor(Math.random() * 2);
                move = biCorner[biCornerInd];
              }

              //USER RESPONSE CORNER 2.22
              else if (cornerANDcenter.indexOf(userFindex) % 2 === 0) {
                var move;
                //>>make diagonal
                if (lastUserIndex === 0) {
                  move = 8;
                } else if (lastUserIndex === 8) {
                  move = 0;
                } else if (lastUserIndex === 6) {
                  move = 2;
                } else if (lastUserIndex === 2) {
                  move = 6;
                }
              }
              //applies move to board
              var winCheck = nextCanWin('You');
              if (!winCheck) {
                var blockCheck = nextCanWin('The computer');
              }
              if (!winCheck && !blockCheck) {
                applyChoice(move, 'The computer');
              }
            }
            if (step > 2) {
              compRandom();
            }
          }
        }
      }
      step++;
    }

    //run test
    checkWin(); 
    userFirst = false;
    if (!win) {
      canMove = true;
    }
  }

  //USER ACTION
  $(function($) {
    init();

    //user game input
    $('.sq').click(function() { 
      if (whoFirst === 'nobody') {
        whoFirst = 'user';
      }  
      if (used.indexOf($(this).data('index')) < 0 && canMove) {
        if (userFirst && !multiplayer) {
          $(".jumbotron").slideUp();
        }    

        if (!multiplayer) {
          $(this).text(oneSymbol);
          $(this).addClass('used');
          if (userFindex > 99) {
            userFindex = $(this).data('index');
          }
          lastUserIndex = $(this).data('index');
          used.push($(this).data('index'));
          addToCheck('You', $(this).data('index'));
        } else if (turn === 'Player One') {
          $(this).text(oneSymbol);
          $(this).addClass('used');
          used.push($(this).data('index'));
          addToCheck(turn, $(this).data('index'));

          //change user
          turn = 'Player Two';
          $('.message').text(turn + "'s turn");
          $('.sq').addClass('sqHoverOne');
          $('.sq').removeClass('sqHoverTwo');
          $('.jumbotron').addClass('pTwo');
        } else if (turn === 'Player Two') {
          $(this).text(twoSymbol);
          $(this).addClass('used');
          used.push($(this).data('index'));
          addToCheck(turn, $(this).data('index'));

          //change turn
          turn = 'Player One';
          $('.message').text(turn + "'s turn");
          $('.sq').removeClass('sqHoverOne');
          $('.sq').addClass('sqHoverTwo');
          $('.jumbotron').removeClass('pTwo');
        }
        //run test
        checkWin();
        if (!win && !multiplayer) {
          canMove = false;
          var time = randTime();
          setTimeout(compMove, time);
        }
      };
    });

    //user controls
    $('.reset').click(function() {
      gameReset();
      $('.message').text('New Game');
    }); 
    $('#userX').click(function() {
      oneSymbol = 'x';
      twoSymbol = 'o';
      gameReset();

      if (!multiplayer) {   
        $(".jumbotron").slideUp();            
        setTimeout(compMove, Math.random() * 1000);
      }
    });
    $('#userO').click(function() {
      oneSymbol = 'o';
      twoSymbol = 'x';
      gameReset();
      if (!multiplayer) {
        $(".jumbotron").slideUp();  
        setTimeout(compMove, Math.random() * 1000);
      }
    });

    //OPTIONS
    $('.options').click(function() {  
      $("#optionsModal").modal('show');  
    });
    $('input[name="players"]').on('change', function() {
      if ($('input[name="players"]:checked').val() === 'One') {
        multiplayer = false;
        $('#difficulty').prop('disabled', false);
        $('.difficultyOptionLabel').css('opacity', 1);   
        $('.jumbotron').removeClass('pTwo');
      } else {
        multiplayer = true;   
        $('.message').text("Player One's turn");        
        $('#difficulty').prop('disabled', true);
        $('.difficultyOptionLabel').css('opacity', .5);
        $('.sq').addClass('sqHoverTwo');
        $('.jumbotron').removeClass('hardMode');
        $('.sq').removeClass('sqHardMode');
        $('.jumbotron').removeClass('mediumMode');
        $('.sq').removeClass('sqMediumMode');
      }
    });
    $('.okay').click(function() {
      gameReset();
      //read difficulty
      if (!multiplayer) {
        if ($('input[name="difficulty"]:checked').val() === 'Easy') {
          medium = false;
          difficult = false;
          $('.jumbotron').removeClass('hardMode');
          $('.sq').removeClass('sqHardMode');
          $('.jumbotron').removeClass('mediumMode');
          $('.sq').removeClass('sqMediumMode');
          $('.message').text('Tic-Tac-Toe');
        } else if ($('input[name="difficulty"]:checked').val() === 'Medium') {
          medium = true;
          difficult = false;
          $('.jumbotron').addClass('mediumMode');
          $('.sq').addClass('sqMediumMode');
          $('.jumbotron').removeClass('hardMode');
          $('.sq').removeClass('sqHardMode');
          $('.message').text('Medium Mode');
        } else if ($('input[name="difficulty"]:checked').val() === 'Hard') {
          medium = true;
          difficult = true;
          $('.jumbotron').addClass('hardMode');
          $('.sq').addClass('sqHardMode');
          $('.jumbotron').removeClass('mediumMode');
          $('.sq').removeClass('sqMediumMode');
          $('.message').text('Hard Mode');
        }
      }
    });

    //credit
     $('#credit').html('&copy; Jonathan Sirrine 2016');
  });