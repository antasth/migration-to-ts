let width = 10
let height = 10
let bombsCount = 10
let boardSize = width * height
let zeroCells = []
let openedCells = []
let flaggedCells = []
let clickCount = 0
let flagCount = 0
let bombsLeftCount = bombsCount
let time = 0
let gameOver = false
const colors = {
  1: '#508AA8',
  2: '#20BF55',
  3: '#FFBC0A',
  4: '#F15025',
  5: '#BA1200',
  6: '#1B3B6F',
  7: '#C200FB',
  8: '#FF007F',
}
const boardIdSize = {
  1: '10',
  2: '15',
  3: '25',
  4: '25',
}
let gameState = {}
let audioGameOver = new Audio()
audioGameOver.preload = 'auto'
audioGameOver.src = './assets/sounds/game-over.mp3'
let audioGameOver2 = new Audio()
audioGameOver2.preload = 'auto'
audioGameOver2.src = './assets/sounds/game-over2.mp3'
let audioOpenCell = new Audio()
audioOpenCell.preload = 'auto'
audioOpenCell.src = './assets/sounds/open-cell.wav'
let audioOpenCells = new Audio()
audioOpenCells.preload = 'auto'
audioOpenCells.src = './assets/sounds/open-cells.wav'
let audioSetFlag = new Audio()
audioSetFlag.preload = 'auto'
audioSetFlag.src = './assets/sounds/set-flag.mp3'
let audioWin = new Audio()
audioWin.preload = 'auto'
audioWin.src = './assets/sounds/win.mp3'

document.addEventListener('DOMContentLoaded', () => {
  resizeBoard(width)
  let modalContent = `
  <h4>🅼🅸🅽🅴🆂🆆🅴🅴🅿🅴🆁</h4>
  <button class='start-game start-game_small'>
  🆂🆃🅰🆁🆃 🅽🅴🆆  🅶🅰🅼🅴
  </button>
  `
  if (localStorage.gameState) {
    modalContent += `
    <button class='continue-game start-game_small'>🅲🅾🅽🆃🅸🅽🆄🅴 🅻🅰🆂🆃 🅶🅰🅼🅴</button>`
  }
  showModal(modalContent, false)
  const startBtn = document.querySelector('.start-game')
  const continueBtn = document.querySelector('.continue-game')

  startBtn.addEventListener('click', () => {
    showStartMenu()
    if (localStorage.gameState) {
      gameState = {}
      gameOver = false
      localStorage.removeItem('gameState')
    }
  })

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (localStorage.gameState) {
        const savedGameState = getFromLocalStorage()
        restoreGameState(savedGameState)
        hideModal()
      }
    })
  }
  if (localStorage.Theme === 'dark') {
    document.body.setAttribute('dark', '')
    document.querySelector('.theme-button__input').checked = true
  }
})

function createBoard(size) {
  const board = document.createElement('div')
  board.classList.add('board')
  for (let i = 0; i < size; i++) {
    const button = document.createElement('div')
    button.classList.add('button')
    button.id = i + 1
    board.append(button)
  }
  return board
}

const createBombs = (size, count) => {
  const bombs = []
  while (bombs.length < count) {
    let random = Math.round(0.5 + Math.random() * size)
    if (!bombs.includes(random)) {
      bombs.push(random)
    }
  }
  return bombs
}
let board = createBoard(boardSize)
let bombs = createBombs(boardSize, bombsCount)
const controlPanel = document.createElement('div')
controlPanel.classList.add('control-panel')
controlPanel.innerHTML = `  
<div class="menu">
<ul>
  <li class='start'>
  <img class='menu-img' src="./assets/icons/start.png" alt="start">
  <span class='menu-span start-span'>Start</span>
  </li>
  <li class='score'>
  <img class='menu-img' src="./assets/icons/score.png" alt="score">
  </li>
  <li>
  <img class='menu-img' src="./assets/icons/timer.png" alt="timer">
  <span class='menu-span timer'>0</span>
  </li>
  <li>
  <img class='menu-img' src="./assets/icons/menu-flag.png" alt="flag">
  <span class='menu-span flags'>0</span>
  </li>
  <li>
  <img class='menu-img' src="./assets/icons/tap.png" alt="moves">
  <span class='menu-span moves'>0</span>
  </li>
  <li>
  <img class='menu-img' src="./assets/icons/menu-mine.png" alt="bomb">
  <span class='menu-span bombs'>0</span>
  </li>
  <li class='sound-button'>
  <img class='menu-img' src="./assets/icons/volume.png" alt="sound">
  </li>
  <li class='theme-button'>
	<input class='theme-button__input' type="checkbox" id="toggle"/>
	<label class='theme-button__toggle' for="toggle"></label>
  </li>
</ul>
</div>
`
const popup = document.createElement('div')
popup.classList.add('popup-overlay', 'popup-overlay__modal', 'hide')
popup.innerHTML = `
<div class="popup">
  <div class="popup_container"></div>
</div>`

const content = document.createElement('section')
content.classList.add('content')
content.append(controlPanel, board)
document.body.append(content, popup)

const startGameButton = document.querySelector('.start')
const bombsMenuCount = document.querySelector('.bombs')
bombsMenuCount.innerText = bombsLeftCount
display = document.querySelector('.timer')

// buttons font size
const setButtonsFontSize = (items) => {
  const fontSize =
    content.offsetWidth > 1000 ? 1.7 : content.offsetWidth > 499 ? 1 : 1.3
  changeFontSize(items, fontSize)
}
let buttons = document.querySelectorAll('.button')
setButtonsFontSize(buttons)

// timer
function startTimer(duration, display) {
  let timer = duration
  let timerID = setInterval(function () {
    localStorage.setItem('Seconds', duration++)
    display.textContent = timer
    ++timer
  }, 1000)
  return timerID
}

// start game
let timerID
function startGame(size, mines) {
  boardSize = boardIdSize[size] ** 2
  const board = createBoard(boardSize)
  width = boardIdSize[size]
  height = boardIdSize[size]
  bombsCount = mines
  content.replaceChildren()
  content.append(controlPanel, board)
  restartGame(boardSize, mines, width)
  addListenerToBoard()
  let seconds = window.localStorage.getItem('Seconds')
  display.innerHTML = `${seconds}`
  timerID = startTimer(seconds, display)
  gameState.sizeSave = size
  gameState.boardIdSizeSave = boardIdSize[size] ** 2
  gameState.widthSave = Number(width)
  gameState.heightSave = Number(height)
  gameState.bombsCountSave = bombsCount
}

// restart game
const restartGame = (size, count, boardWidth) => {
  const buttons = document.querySelectorAll('.button')
  const clickMenuCount = document.querySelector('.moves')
  buttons.forEach((button) => {
    button.className = 'button'
    button.innerHTML = ''
    button.style = ''
  })
  // clickCount = 0
  clickMenuCount.innerHTML = clickCount
  zeroCells = []
  openedCells = []
  flaggedCells = []
  if (localStorage.gameState) {
    const gameData = getFromLocalStorage()
    bombs = gameData.bombsSave
    clickCount = gameData.clickCountSave
  } else {
    bombs = createBombs(size, count)
    clickCount = 0
  }
  gameOver = false
  gameState.bombsSave = bombs
  flagCount = 0
  flagsMenuCount.innerText = flagCount
  bombsLeftCount = bombsCount
  bombsMenuCount.innerText = bombsLeftCount
  time = 0
  display.innerText = '0'
  resizeBoard(boardWidth)
  setButtonsFontSize(buttons)
}

startGameButton.addEventListener('click', () => {
  restartGame(boardSize, bombsCount, width)
})

// show all cells on gameover
const openBoard = (board) => {
  gameOver = true
  board.childNodes.forEach((cell) => {
    if (bombs.includes(Number(cell.id))) {
      const bombImg = document.createElement('img')
      bombImg.classList.add('bomb-img')
      bombImg.src = './assets/icons/mine.png'
      if (cell.firstElementChild) {
        cell.replaceChildren()
      }
      cell.append(bombImg)
      cell.classList.add('disabled')
    } else {
      getBombs(Number(cell.id))
    }
  })
}
function addListenerToBoard() {
  const board = document.querySelector('.board')
  const clickMenuCount = document.querySelector('.moves')
  board.addEventListener('click', (e) => {
    if (e.target.classList.contains('button')) {
      if (bombs.includes(Number(e.target.id))) {
        if (clickCount === 0) {
          bombs = createBombs(boardSize, bombsCount)
          getBombs(Number(e.target.id))
          clickCount++
          gameState.clickCountSave = clickCount
          clickMenuCount.innerHTML = clickCount
        } else {
          clickCount++
          gameState.clickCountSave = clickCount
          clickMenuCount.innerHTML = clickCount
          const bombImg = document.createElement('img')
          bombImg.classList.add('bomb-img')
          bombImg.src = './assets/icons/mine.png'
          e.target.append(bombImg)
          e.target.classList.add('disabled')
          // clearInterval(setTimer)
          openBoard(board)
          const modalContent = `
          <h3>🅶🅰🅼🅴 🅾🆅🅴🆁</h3>
          <button class='start-game'>TRY AGAIN</button>
          `
          showModal(modalContent, false)
          gameState = {}
          localStorage.removeItem('gameState')
          localStorage.setItem('Seconds', 0)
          clearInterval(timerID)
          const startButton = document.querySelector('.start-game')
          startButton.addEventListener('click', () => {
            restartGame(boardSize, bombsCount, width)
            hideModal()
            showStartMenu()
          })
          // audioGameOver2.play()
          // audioWin.pause()
        }
      } else {
        getBombs(Number(e.target.id))
        clickCount++
        clickMenuCount.innerHTML = clickCount
        gameState.clickCountSave = clickCount
      }
    }
  })
  board.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    if (
      e.target.classList.contains('button') &&
      !e.target.classList.contains('opened') &&
      !e.target.classList.contains('disabled')
    ) {
      markCellAsBomb(e.target)
    }
    if (e.target.classList.contains('flag-img')) {
      markCellAsBomb(e.target.parentNode)
    }
  })
}
addListenerToBoard()

const flagsMenuCount = document.querySelector('.flags')
const markCellAsBomb = (cell) => {
  cell.classList.toggle('bomb')
  if (cell.firstElementChild) {
    cell.replaceChildren()
    flagCount--
    flaggedCells.splice(flaggedCells.indexOf(cell), 1)
    gameState.flaggedCellsSave = flaggedCells
    flagsMenuCount.innerText = flagCount
    bombsLeftCount++
    gameState.flagCountSave = flagCount
    gameState.bombsLeftCountSave = bombsLeftCount
    bombsMenuCount.innerText = bombsLeftCount
  } else {
    const flag = document.createElement('img')
    flag.classList.add('flag-img')
    flag.src = './assets/icons/flag.png'
    // audioSetFlag.play()
    cell.append(flag)
    flagCount++
    gameState.flagCountSave = flagCount
    flaggedCells.push(cell.id)
    gameState.flaggedCellsSave = flaggedCells
    if ([...new Set(openedCells)].length === boardSize - bombsCount) {
      // clearInterval(setTimer)
      const winMessage = createWinMessage(
        localStorage.getItem('Seconds'),
        clickCount
      )
      const modalContent = `
      <h3>${winMessage}</h3>
      <button class='start-game'>NEW GAME</button>
      `
      showModal(modalContent, false)
      const startButton = document.querySelector('.start-game')
      gameState = {}
      localStorage.removeItem('gameState')
      saveToScore()
      localStorage.setItem('Seconds', 0)
      clearInterval(timerID)
      startButton.addEventListener('click', () => {
        restartGame(boardSize, bombsCount, width)
        hideModal()
        showStartMenu()
      })
      // audioWin.play()
    }
    flagsMenuCount.innerText = flagCount
    bombsLeftCount > 0 ? bombsLeftCount-- : bombsLeftCount
    bombsMenuCount.innerText = bombsLeftCount
    gameState.bombsLeftCountSave = bombsLeftCount
  }
}

const getBombs = (cellId) => {
  const column = cellId % width !== 0 ? cellId % width : width
  const row = Math.ceil(cellId / width)
  let count = 0
  let aroundCells = []
  if (row !== 1 && row !== width && column !== 1 && column !== width) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let id = (Number(row) + i - 1) * Number(width) + Number(column) + j
        if (bombs.includes(id)) {
          count++
        } else {
          aroundCells.push(id)
        }
      }
    }
  } else if (column === 1) {
    for (let i = -1; i <= 1; i++) {
      for (let j = 0; j <= 1; j++) {
        let id = (Number(row) + i - 1) * Number(width) + Number(column) + j
        if (bombs.includes(id)) {
          count++
        } else {
          aroundCells.push(id)
        }
      }
    }
  } else if (column === width) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 0; j++) {
        let id = (Number(row) + i - 1) * Number(width) + Number(column) + j
        if (bombs.includes(id)) {
          count++
        } else {
          aroundCells.push(id)
        }
      }
    }
  } else if (row === 1) {
    for (let i = 0; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let id = (Number(row) + i - 1) * Number(width) + Number(column) + j
        if (bombs.includes(id)) {
          count++
        } else {
          aroundCells.push(id)
        }
      }
    }
  } else if (row === width) {
    for (let i = -1; i <= 0; i++) {
      for (let j = -1; j <= 1; j++) {
        let id = (Number(row) + i - 1) * Number(width) + Number(column) + j
        if (bombs.includes(id)) {
          count++
        } else {
          aroundCells.push(id)
        }
      }
    }
  }

  if (count === 0) {
    zeroCells.push(cellId)
    aroundCells = aroundCells.filter((cell) => cell !== cellId)
    aroundCells.forEach((cell) => {
      if (!zeroCells.includes(cell) && cell > 0 && cell <= boardSize) {
        getBombs(cell)
      }
    })
  }
  const cell = document.getElementById(`${cellId}`)
  cell.innerHTML = count === 0 ? '' : count
  cell.style.color = colors[count]
  cell.classList.add('opened')
  openedCells.push(cellId)
  gameState.openedCellsSave = [...new Set(openedCells)]
  if ([...new Set(openedCells)].length === boardSize - bombsCount) {
    let winMessage = createWinMessage(
      localStorage.getItem('Seconds'),
      clickCount
    )
    const modalContent = `
    <h3>${winMessage}</h3>
    <button class='start-game'>NEW GAME</button>
    `
    showModal(modalContent, false)
    gameState = {}
    localStorage.removeItem('gameState')
    saveToScore()
    localStorage.setItem('Seconds', 0)
    clearInterval(timerID)
    const startButton = document.querySelector('.start-game')
    startButton.addEventListener('click', () => {
      restartGame(boardSize, bombsCount, width)
      hideModal()
      showStartMenu()
    })
    // audioWin.play()
  }
  // audioOpenCell.play()
  return count
}
// start menu
startGameButton.addEventListener('click', () => {
  showStartMenu()
})

// MODAL
function showModal(content, close) {
  const modal = document.querySelector('.popup-overlay')

  // if scroll is hidden => add margin right
  let marginSize = window.innerWidth - document.documentElement.clientWidth
  if (marginSize) {
    document.documentElement.style.marginRight = marginSize + 'px'
  }
  modal.classList.add('show')
  modal.classList.remove('hide')
  document.body.classList.add('locked')

  const popupContainer = document.querySelector('.popup_container')
  popupContainer.replaceChildren()
  popupContainer.append(createPopupCard(content, close))

  if (close) {
    const close = document.querySelector('.popup-close')
    close.addEventListener('click', () => {
      hideModal(modal)
    })
  }

  // modal.addEventListener('click', (e) => {
  //   if (e.target == modal) {
  //     hideModal(modal)
  //   }
  // })
}

function hideModal() {
  const modal = document.querySelector('.popup-overlay')

  modal.classList.remove('show')
  modal.classList.add('hide')
  document.body.classList.remove('locked')
  document.documentElement.style.marginRight = 0
}

function createPopupCard(content = '', close) {
  const modalCard = document.createElement('div')
  modalCard.classList.add('modal')
  if (close) {
    modalCard.innerHTML =
      `
    <button class="popup-close">&times;</button>
  ` + content
  } else {
    modalCard.innerHTML = content
  }
  return modalCard
}

// media queries
function resizeBoard(boardWidth) {
  let cellWidth =
    content.offsetWidth > 1000
      ? 650 / boardWidth
      : content.offsetWidth < 768
      ? (content.offsetWidth * 0.9) / boardWidth
      : (content.offsetWidth * 0.7) / boardWidth
  const board = document.querySelector('.board')
  const buttons = document.querySelectorAll('.button')
  board.style.gridTemplateColumns = `repeat(auto-fill, ${cellWidth}px)`
  buttons.forEach((button) => {
    button.style.width = `${cellWidth}px`
    button.style.height = `${cellWidth}px`
    board.style.width = `${cellWidth * boardWidth}px`
  })
}
function changeFontSize(items, size) {
  items.forEach((item) => {
    item.style.fontSize = `${size}rem`
  })
}

const mediaQueries = [
  window.matchMedia('(max-width: 499px)'),
  window.matchMedia('(min-width: 500px) and (max-width: 549px)'),
  window.matchMedia('(min-width: 550px) and (max-width: 595px)'),
  window.matchMedia('(min-width: 596px) and (max-width: 675px)'),
  window.matchMedia('(min-width: 676px) and (max-width: 767px)'),
  window.matchMedia('(min-width: 768px) and (max-width: 991px)'),
  window.matchMedia('(min-width: 992px) and (max-width: 1199px)'),
  window.matchMedia('(min-width: 1200px)'),
]

function screenMatches() {
  const buttons = document.querySelectorAll('.button')
  if (mediaQueries[0].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 0.8)
  }
  if (mediaQueries[1].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1)
  }
  if (mediaQueries[2].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.2)
  }
  if (mediaQueries[3].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.3)
  }
  if (mediaQueries[4].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.4)
  }
  if (mediaQueries[5].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.5)
  }
  if (mediaQueries[6].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.6)
  }
  if (mediaQueries[7].matches) {
    resizeBoard(width)
    changeFontSize(buttons, 1.7)
  }
}

mediaQueries.forEach((item) => {
  item.addEventListener('change', screenMatches)
})

// start menu
function showStartMenu() {
  const menu = `
  <div class="buttons">
  <div class="radio-btn" id='1'>
    <input id="radio-1" type="radio" name="radio" value="1" checked />
    <label class="radio-label" for="radio-1">
      <h4>🅴🅰🆂🆈</h4>
      <p>10x10</p>
    </label>
  </div>

  <div class="radio-btn" id='2'>
    <input id="radio-2" type="radio" name="radio" value="2" />
    <label class="radio-label" for="radio-2">
      <h4>🅼🅴🅳🅸🆄🅼</h4>
      <p>15x15</p>
      </label>
  </div>

  <div class="radio-btn" id='3'>
    <input id="radio-3" type="radio" name="radio" value="3" />
    <label class="radio-label" for="radio-3">
      <h4>🅷🅰🆁🅳</h4>
      <p>25x25</p>
    </label>
  </div>

  <div class="radio-btn hell" id='4'>
    <input id="radio-4" type="radio" name="radio" value="4" />
    <label class="radio-label radio-hell" for="radio-4">
      <h4>🅷🅴🅻🅻</h4>
      <p>25x25</p>
    </label>
  </div>
  </div>

  <div class="range">
    <h4>🅼🅸🅽🅴🆂:</h4><span class="range__count"></span>
    <div class="slidecontainer">
      <input
        type="range"
        min="1"
        max="99"
        value="10"
        class="slider"
        id="myRange"
      />
    </div>
  </div>
  <button class='begin-game'>START GAME</button>
</div>
  `
  showModal(menu, false)
  const range = document.querySelector('.slider')
  const rangeCount = document.querySelector('.range__count')
  rangeCount.innerHTML = range.value
  range.addEventListener('input', () => {
    rangeCount.innerHTML = range.value
  })
  const modal = document.querySelector('.modal')
  const slider = document.querySelector('.slider')
  let isHell = false
  modal.addEventListener('click', (e) => {
    if (e.target.parentNode.classList.contains('radio-btn')) {
      isHell = false
      let id = Number(e.target.parentNode.id)
      switch (id) {
        case 1:
          slider.value = 10
          slider.disabled = false
          rangeCount.innerHTML = 10
          break
        case 2:
          slider.value = 30
          slider.disabled = false
          rangeCount.innerHTML = 30
          break
        case 3:
          slider.value = 70
          slider.disabled = false
          rangeCount.innerHTML = 70
          break
        case 4:
          slider.value = 150
          slider.disabled = true
          rangeCount.innerHTML = 150
          isHell = true
          break
      }
    }
  })

  const startButton = document.querySelector('.begin-game')
  startButton.addEventListener('click', () => {
    const selectedBoard = document.querySelector('input[name="radio"]:checked')
    localStorage.setItem('Seconds', 0)
    clearInterval(timerID)
    startGame(selectedBoard.value, isHell ? 150 : Number(range.value))
    hideModal()
  })
}

function createWinMessage(time, moves) {
  let message = `🅷🅾🅾🆁🅰🆈! 🆈🅾🆄 🅵🅾🆄🅽🅳 🅰🅻🅻 🅼🅸🅽🅴🆂 🅸🅽 ${time} 🆂🅴🅲🅾🅽🅳🆂 🅰🅽🅳 ${
    moves + 1
  } 🅼🅾🆅🅴🆂!`
  return message
}

// save and load game state
function saveToLocalStorage() {
  if (Object.keys(gameState).length > 2) {
    localStorage.gameState = JSON.stringify(gameState)
  }
}

function getFromLocalStorage() {
  return JSON.parse(localStorage.gameState)
}

window.addEventListener('unload', () => {
  saveToLocalStorage()
})

function restoreGameState({
  timeSave,
  bombsSave,
  sizeSave,
  widthSave,
  clickCountSave,
  bombsCountSave,
  openedCellsSave,
  flaggedCellsSave,
}) {
  width = widthSave
  time = timeSave
  // ! BUG WITH CLICKCOUNT AFTER RELOAD
  clickCount = Number(clickCountSave) ? clickCountSave : 0
  openedCells = openedCellsSave

  startGame(sizeSave, bombsCountSave)

  if (flaggedCellsSave) {
    flaggedCellsSave.forEach((cell) => {
      const cellButton = document.getElementById(cell)
      markCellAsBomb(cellButton)
    })
  }

  bombs = bombsSave
  if (openedCellsSave) {
    openedCellsSave.forEach((cell) => {
      getBombs(cell)
    })
  }
}

// switch theme

const switchCheckbox = document.querySelector('.theme-button__input')

switchCheckbox.addEventListener('change', () => {
  toggleTheme()
})

function toggleTheme() {
  if (document.body.hasAttribute('dark')) {
    document.body.removeAttribute('dark')
    localStorage.setItem('Theme', 'light')
  } else {
    document.body.setAttribute('dark', '')
    localStorage.setItem('Theme', 'dark')
  }
}

// save result to score
function saveToScore() {
  if (localStorage.Score && !gameOver) {
    const score = JSON.parse(localStorage.Score)
    console.log(score)
    const result = {}
    result.time = localStorage.Seconds
    result.moves = clickCount + 1
    result.board = `${width}x${width}`
    score.push(result)
    localStorage.Score = JSON.stringify(score)
  } else if (!gameOver) {
    let score = []
    const result = {}
    result.time = localStorage.Seconds
    result.moves = clickCount + 1
    result.board = `${width}x${width}`
    score.push(result)
    localStorage.Score = JSON.stringify(score)
  }
}

function getScoreFromLocalStorage() {
  if (localStorage.Score) {
    return JSON.parse(localStorage.Score)
  }
}

const score = document.querySelector('.score')
score.addEventListener('click', () => {
  const data = getScoreFromLocalStorage()
  console.log(data)
  const modalContent = document.createElement('div')
  modalContent.classList.add('results')
  const scoreHeader = document.createElement('h3')
  scoreHeader.classList.add('results__header')
  scoreHeader.innerHTML = '🆂🅲🅾🆁🅴'
  const scoreSubHeader = document.createElement('h5')
  scoreSubHeader.classList.add('results__subheader')
  scoreSubHeader.innerHTML = `
  <span>🅱🅾🅰🆁🅳  </span>
    <span>🅼🅾🆅🅴🆂  </span>
    <span>🆃🅸🅼🅴</span> `
  const scoreList = document.createElement('ol')
  scoreList.classList.add('results__list')
  data.forEach((element) => {
    // console.log(element);
    const listItem = document.createElement('li')
    listItem.classList.add('results__list-item')
    listItem.innerHTML =
      `<span>${element.board}</span>
      <span>${element.moves}</span>
      <span>${element.time}</span>`
    
    scoreList.appendChild(listItem)
  })
  modalContent.append(scoreHeader, scoreSubHeader, scoreList)
  console.log(modalContent)
  showModal(modalContent.outerHTML, true)
})
