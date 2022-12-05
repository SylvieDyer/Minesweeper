document.addEventListener('DOMContentLoaded', () => {
    // set width drop down 
    let widthPicker = document.querySelector("#widthPicker");
    for (let i = 5; i <= 30; i++){
        let value = document.createElement('option');
        value.innerHTML = i;
        widthPicker.appendChild(value);
    }

    // toast options
    toastr.options = {
        "newestOnTop": false,
        "preventDuplicates": true,
        "positionClass": "toast-bottom-right",
    }

    let setWidth = 10;          // width of the board (default 10)

    // starts the game with an inputted number of bombs and board width 
    function startGame(width, numBombs){
        // set height / width of board depending on board size
        const grid = document.querySelector(".grid");
        grid.style.width = width * 44 + "px";
        grid.style.height = width * 44 + "px";

        let numFlags = 0;               // number of flags
        let tiles = [];                 // board (as array)
        let gameOver = false;           // boolean to detect when the game is over
        width = parseInt(width);        // width of board
        numBombs = parseInt(numBombs);  // number of bombs

        // create minesweeper board
        function createBoard() {

            // arrays with bombs / mines 
            const bombs = Array(numBombs).fill('bomb');
            const safes = Array(width*width - numBombs).fill('safe');

            // randomly disperse bombs on each refresh 
            const combined = safes.concat(bombs);
            const fullBoard = combined.sort(() => Math.random() - 0.5);

            // adds each tile to HTML with event listeners 
            for (let i = 0; i < width*width; i++){
                const tile = document.createElement("div");
                tile.setAttribute('id', i);
                
                tile.classList.add(fullBoard[i]);
                grid.appendChild(tile);
                tiles.push(tile);

                tile.addEventListener('click', function(e){
                    click(tile)
                });

                tile.oncontextmenu = function(e) {
                    e.preventDefault();
                    addFlag(tile);
                }
            }

            // add num of touching bombs for each tile
            for (let i = 0; i < tiles.length; i++){
                // number of bombs the tile is touching 
                let touchingBombs = 0; 

                // constraints for left/right edge of board 
                const leftEdge = i % width === 0;
                const rightEdge = i % width === width - 1;

                // if not a bomb
                if (tiles[i].classList.contains('safe')){
             
                    // check NORTH
                    if (i > width - 1 && tiles[i - width].classList.contains('bomb'))
                        touchingBombs++;

                    // check NORTH EAST
                    if (i > width - 1 && !rightEdge && tiles[i - width + 1].classList.contains('bomb'))
                        touchingBombs++;
                    
                    // check EAST
                    if (i < (width * width - 1) && !rightEdge && tiles[i + 1].classList.contains('bomb'))
                        touchingBombs++;
                     
                    // checking SOUTH EAST
                    if (i < (width * width - width) && !rightEdge && tiles[i + width + 1].classList.contains('bomb'))
                        touchingBombs++;
                    
                    // checking SOUTH
                    if (i < (width * width - width) && tiles[i + width].classList.contains('bomb'))
                        touchingBombs++;

                    // checking SOUTH WEST 
                    if (i < (width * width - width) && !leftEdge && tiles[i - 1 + width].classList.contains('bomb'))
                        touchingBombs++;
                    
                    // checking WEST
                    if (i > 0 && !leftEdge && tiles[i - 1].classList.contains('bomb')) 
                        touchingBombs++;
                    
                    // checking NORTH WEST 
                    if (i > (width - 1) && !leftEdge && tiles[i - width - 1].classList.contains('bomb'))
                        touchingBombs++;
                    
                    tiles[i].setAttribute('data', touchingBombs);
                }
            }
        }

        // call the function
        createBoard();

    
        // add flag with right click
        function addFlag(tile) {
            if (gameOver) return;

            // if tile hasn't been checked yet and we haven't reached the max number of flags, add flag
            if (!tile.classList.contains('visited') && !tile.classList.contains('flag') && numFlags < numBombs){
                tile.classList.add('flag');
                tile.innerHTML = '🚩';
                numFlags++;
                document.getElementById("flagNum").innerHTML = "Number of flags placed: " + numFlags;
                // check for win if the number of flags placed is the number of bombs 
                if (numFlags == numBombs)
                    checkForWin();
            }

            // remove flag
            else if (tile.classList.contains('flag')){
                tile.classList.remove('flag');
                tile.innerHTML = '';
                numFlags--;                
                document.getElementById("flagNum").innerHTML = "Number of flags placed: " + numFlags;

            }
        }


        // click of tile
        function click(tile){ 
            // if game is over don't want anything to happen
            if (gameOver) return;

            // if selecting a visited tile or a flagged tile, don't want anything to happen
            if (tile.classList.contains('visited') || tile.classList.contains('flag')) return;
            
            // when a bomb is pressed, game over
            if (tile.classList.contains('bomb'))
                gameLost();
            
            // when pressing a safe tile
            else{
                let touchingBombs = tile.getAttribute('data');
                // if the tile is touching any bombs, 
                if (touchingBombs != 0){
                    tile.classList.add('visited');
                    tile.innerHTML = touchingBombs;
                    return
                }
                // if not touching any bombs 
                checkTileNeighbors(tile);
            }
            tile.classList.add('visited')
        }

        // check neighbors of selected tile (if 0 bombs, recursively reveal more safe areas)
        function checkTileNeighbors(tile){
            let tileId = tile.id;
            const leftEdge = tileId % width === 0
            const rightEdge = tileId % width === width - 1

            // offset time after click  
            setTimeout(() =>{
                // check NORTH 
                if (tileId > width - 1){
                    const newId = tiles[parseInt(tileId) - width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check NORTH EAST 
                if (tileId > width - 1 && !rightEdge){
                    const newId = tiles[parseInt(tileId) + 1 - width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                  // check EAST  
                  if (tileId < width * width - 1 && !rightEdge){
                    const newId = tiles[parseInt(tileId) + 1].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check SOUTH EAST
                if (tileId < width * width - width - 1 && !rightEdge){
                    const newId = tiles[parseInt(tileId) + 1 + width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check SOUTH 
                if (tileId < width * width - width - 1){
                    const newId = tiles[parseInt(tileId) + width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check SOUTH WEST
                if (tileId < width * width - width && !leftEdge){
                    const newId = tiles[parseInt(tileId) - 1 + width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check WEST
                if (tileId > 0 && !leftEdge){
                    const newId = tiles[parseInt(tileId) - 1].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }

                // check NORTH WEST 
                if (tileId > width + 1 & !leftEdge){
                    const newId = tiles[parseInt(tileId) - 1 - width].id;
                    const newTile = document.getElementById(newId);
                    click(newTile);
                }
            }, 10)
        }

        // when game is lost
        function gameLost(){
            gameOver = true;

            // show all bomb locations 
            tiles.forEach(tile => {
                if (tile.classList.contains('bomb')){
                    tile.innerHTML='💣';
                    tile.style.background= "rgba(241, 67, 67, 0.866)";
                }
            })
            // show you lose message
            youLose.style.display = "block";
        }

        // check for a win 
        function checkForWin(){
            let correctFlag = 0;
            let bombs = [];
            // for each tile, count the number of flags on bombs
            for (let i = 0; i < tiles.length; i++){
                if (tiles[i].classList.contains('flag') && tiles[i].classList.contains('bomb')){
                    correctFlag++;
                    bombs.push(tiles[i]);
                }
            }
            // if all the bombs are revealed
            if (correctFlag == numBombs){
                gameOver = true;
                // change bg of all bombs
                for (let i = 0; i < bombs.length; i++){
                    bombs[i].style.background = 'rgba(154, 241, 67, 0.9)';
                }
                // display win message 
                youWin.style.display = "block";
            }
            else {
                toastr.info("<p style='font-size:1rem;'You've placed the maximum number of flags, but one or more of your flags are placed incorrectly!<br> Keep trying! </p>");
            }
        }
    }

    // sets the default at width = 10 
    startGame(10, 20);

    // replace old grid with new grid element
    function clearGame(){
        let newGrid = document.createElement('div');
        newGrid.setAttribute('class', 'grid');
        document.querySelector(".grid").replaceWith(newGrid);
        document.getElementById("flagNum").innerHTML = "Number of flags placed: 0";
    }

    // restarts game
    function restartGame() {
        clearGame();
        startGame(setWidth, Math.floor((setWidth * setWidth )/ 5));
    }

    // when restart is clicked, clear the board and restart game
    document.getElementById("restart").onclick = function(){
       restartGame();
        // show reset toast
        toastr.success('<p style="font-size: 1rem">Mines have been moved!</p>');
    };

    // when submit is clicked, clear the board and reset board to width
    document.getElementById("submit").onclick = function(){
        widthPickerVal = document.getElementById("widthPicker").value;
        // if there is no value, can't set width
        if (widthPickerVal == "")
            toastr.error('<p style="font-size: 1rem">No width selected:<br>Unable to set board width!</p>');

        // if the value is different than previously, set width & reset board 
        else if (widthPickerVal != setWidth) {
             // when restart is clicked, 
            toastr.success('<p style="font-size: 1rem">Width has been set:<br>Mines have been moved!</p>');
            setWidth = document.getElementById("widthPicker").value;
            document.getElementById("bombCount").innerHTML = "Number of bombs hidden in the board: " + Math.floor((setWidth * setWidth )/ 5) ;
            document.getElementById("flagNum").innerHTML = "Number of flags placed: 0";
            restartGame();
        }
        // trying to reset with same width
        else {
            toastr.error('<p style="font-size: 1rem">Width has already been set to '+ setWidth +"<br>To start over, please select <b><i>Start Over</i></b> </p>")
        }
    };

    // when restart is clicked, clear the board and restart game
    document.getElementById("tryAgain").onclick = function(){
        youLose.style.display = "none";
       restartGame();
        // show reset toast
        toastr.success('<p style="font-size: 1rem">Mines have been moved!</p>');
    };
    
    // clear the board and restart game
     document.getElementById("replay").onclick = function(){
        youLose.style.display = "none";
        youWin.style.display = "none";
        restartGame();
        // show reset toast
        toastr.success('<p style="font-size: 1rem">Mines have been moved!</p>');
    };

    /* For the Instructions/Lose/Win PopUps */
    var instructions = document.getElementById("instructions");
    var youWin = document.getElementById("win");
    var youLose = document.getElementById("lose");
    // When the user clicks the button, open the modal 
    document.getElementById('helpBtn').onclick = function() {
        instructions.style.display = "block";
    }

    // When the user clicks (x) close modal
    document.getElementsByClassName("close")[0].onclick = function() {
        instructions.style.display = "none";
    }

     // When the user clicks (x) close modal
     document.getElementsByClassName("close")[1].onclick = function() {      
        youWin.style.display = "none";
    }

     // When the user clicks (x) close modal
     document.getElementsByClassName("close")[2].onclick = function() {
        youLose.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == instructions) 
            instructions.style.display = "none";
        else if (event.target == youWin) 
            youWin.style.display = "none";
        else if (event.target == youLose) 
            youLose.style.display = "none";
    }
})