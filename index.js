class Minesweeper {
  constructor(rows, cols, mines) {
    this.colors = {
      1: 'blue',
      2: 'green',
      3: 'red',
      4: 'purple',
      5: 'maroon',
      6: 'turquoise',
      7: 'black',
      8: 'gray',
    }
    this.rows = rows
    this.cols = cols
    this.totalMines = mines
    this.target = document.getElementById('minesweeper')
    this.started = false
    this.ended = false
    this.mines = []
    this.flags = {}
    this.init()
    this.resetButton
  }

  reset = function (rows, cols, mines) {
    if (rows) this.rows = rows;
    if (cols) this.cols = rows;
    if (mines) this.totalMines = mines;
    this.mines = [];
    this.flags = {};
    this.started = false;
    this.ended = false;

    this.target.innerHTML = '';
    this.init();
  }

  init = function () {
    this.setControls();
    this.drawGrid();
  }

  setControls = function () {
    var $this = this;

    var controls = document.createElement('div')
    this.target.appendChild(controls).className = 'controls';
    controls.style.setProperty('--grid-rows', 1);
    controls.style.setProperty('--grid-cols', 3);
    var count = document.createElement('div')
    controls.appendChild(count).className = 'count';
    var reset = document.createElement('button')
    controls.appendChild(reset).className = 'reset';
    var countdown = document.createElement('div')
    controls.appendChild(countdown).className = 'countdown';

    this.resetButton = reset;
    this.resetButton.innerHTML = '&#128515;'

    reset.addEventListener('click', function () {
      $this.reset();
    })
  }

  drawGrid = function () {
    var wrapper = document.createElement('wrapper');
    this.target.appendChild(wrapper).className = 'wrapper';
    for (var i = 0; i < (this.rows); i++) {
      var row = document.createElement('div');
      row.style.setProperty('--grid-rows', 1);
      row.style.setProperty('--grid-cols', this.cols);
      wrapper.appendChild(row).className = 'row-item';
      for (var j = 0; j < (this.cols); j++) {
        var cell = document.createElement('div');
        row.appendChild(cell).className = 'grid-item';
        cell.id = this.getId(i, j)
        cell.id = i + '-' + j;
        this.addCellListener(cell, i, j)
      }
    }
  }

  handleWin = function() {
    this.ended = true;
    return;
  }

  getId = function (col, row) {
    return col + '-' + row;
  }

  checkWin = function() {
    var count = 0;
    for (var i = 0; i < this.mines.length; i++) {
      if (this.mines[i]) {
        for (var j = 0; j < this.mines[i].length; j++) {
          if (!!this.mines[i]?.[j] && !!this.flags[i]?.[j]) {
            count += 1;
          }
        }
      }
    }

    if (count === this.totalMines) {
      this.resetButton.innerHTML = '&#128526;'
      return true
    }
    return false;
  }

  setFlag = function(row, col) {
    if (!this.flags[row]) {
      this.flags[row] = {};
    }

    this.flags[row][col] = true;
  };

  removeFlag = function (row, col) {
    this.flags[row][col] = false;
  }

  addCellListener = function(cell, row, col) {
    var $this = this

    cell.continue = true;

    cell.addEventListener('contextmenu', function (ev) {
      ev.preventDefault(ev);
      if ($this.ended) return false;
      if (this.clicked) return false;

      this.continue = false;

      if (this.unknown) {
        this.flagged = false;
        this.unknown = false;
        this.clicked = false;
        return false;
      }

      if (this.flagged) {
        $this.removeFlag(row, col);
        this.flagged = false;
        this.unknown = true;
        return false;
      }

      if (!this.flagged) {
        $this.setFlag(row, col);
        this.flagged = true;
        return false;
      }

      return false;
    })

    cell.addEventListener('mousedown', function () {
      if (!$this.ended) {
        $this.resetButton.innerHTML = '&#128558;'
      }
    })

    cell.addEventListener('mouseup', function () {
      if ($this.ended) return;

      $this.resetButton.innerHTML = '&#128515;'
  
      if ($this.checkWin()) {
        $this.handleWin();
      }

      if (!this.continue) {
        if (this.flagged) {
          this.style.backgroundImage = 'url(\'./static/images/flag.png\')';
          this.style.backgroundSize = 'contain';
          this.style.backgroundRepeat = 'no-repeat';
          return;
        }

        if (this.unknown) {
          this.style.backgroundImage = '';
          this.textContent = '?';
          return;
        }

        if (!this.flagged) {
          this.textContent = undefined;
        }
      }

      if (
        !this.unknown &&
        !this.flagged &&
        !this.continue
      ) {
        this.continue = true;
        return;
      }

      if (!$this.started) {
        $this.placeMines(row, col);
        $this.started = true;
      }

      $this.handleClick(this, row, col)
    })
  }

  handleClick = function (cell, row, col) {
    if (cell.clicked) return;
    cell.clicked = true;

    if (this.mines[row]?.[col]) {
      cell.style.backgroundColor = 'red';
      cell.style.backgroundImage = 'url(\'./static/images/bomb.png\')';
      cell.style.backgroundSize = 'contain';
      cell.style.backgroundRepeat = 'no-repeat';
      this.resetButton.innerHTML = '&#128565;'
      this.revealAllMines();
      this.ended = true;
    } else {
      cell.style.backgroundColor = '#ddd';
      cell.style.border = '1px solid gray';
      cell.style.padding = '1px';
      var mines = this.getAdjacentMines(row, col);
      if (!!mines) {
        cell.style.color = this.colors[mines];
        cell.textContent = mines;
      } else {
        this.revealAdjacentCells(row, col);
      }
    }
  }

  revealAllMines = function () {
    for (var i = 0; i < this.mines.length; i++) {
      if (this.mines[i]) {
        for (var j = 0; j < this.mines[i].length; j++) {
          if (!!this.mines[i]?.[j] && !this.flags[i]?.[j]) {
            var cell = document.getElementById(i + '-' + j);
            this.handleClick(cell, i, j);
          }
        }
      }
    }
  }

  placeMines = function (row, col) {
    for (var i = 0; i < this.totalMines; i++) {
      this.placeMine(row, col);
    }
  }

  placeMine = function (r, c) {
    var nrow, ncol, row, col;
    nrow = Math.floor(Math.random() * this.rows);
    ncol = Math.floor(Math.random() * this.cols);

    if (r === nrow && c === ncol) {
      this.placeMine(r, c);
      return;
    }

    row = this.mines[nrow];

    if (!row) {
      row = [];
      this.mines[nrow] = row;
    }

    col = row[ncol];

    if (!col) {
      row[ncol] = true;
      return;
    } else {
      this.placeMine(r, c);
    }
  }

  // refactor this to use the checkAdjacentCells function below
  // need to figure out how to pass through a reference to "this" correctly
  revealAdjacentCells = function(row, col) {
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j ++) {
        var cell = document.getElementById((row + i) + '-' + (col + j));
        if (!!cell && !cell.clicked && !cell.flagged && !cell.unknown) {
          this.handleClick(cell, row + i, col + j);
        }
      }
    }
  }

  getAdjacentMines = function (row, col) {
    var num_of_mines = 0;
    var $mines = this.mines;
    this.checkAdjacentCells(row, col, function (adjRow, adjCol) {
      if ($mines[adjRow]) {
        if (!!$mines[adjRow][adjCol]) {
          num_of_mines += 1;
        }
      }
    })
    return num_of_mines;
  }

  checkAdjacentCells = function (row, col, cb) {
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j ++) {
        cb(row + i, col + j)
      }
    }
  }
}
