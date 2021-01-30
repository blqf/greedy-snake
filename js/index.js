const sw = 20,// 每个小方块的宽
  sh = 20,// 每个小方块的高
  tr = 30,// 横向方块数
  td = 30;// 纵向方块数

// 用于判断某个元素是否位于蛇的身体上
function isInSnake(x, y) {
  return snake.snakeInfo.filter((item, index, arr) => {
    return item.x === x && item.y === y;
  }).length;
}

// 用于获取随机数
function getRanDom(min = 0, max = 29) {
  return Math.floor(Math.random() * (max - min) + min);
}

//生成各种游戏元素的构造函数
class Square {
  constructor(x, y, classname) {
    // 元素的位置
    this.x = x;
    this.y = y;
    // 元素的类名，决定生成什么元素
    this.classname = classname
  }
  // 创建元素并将元素添加到页面中
  createDom(rotate) {
    // 创建元素
    this.divDom = document.createElement('div');
    this.divDom.className = this.classname;
    this.divDom.style.left = this.x * sw + 'px';
    this.divDom.style.top = this.y * sh + 'px';
    if (this.classname === 'head') {
      this.divDom.style.transform = 'rotateZ(' + rotate + 'deg)'
    }
    // 添加到页面中
    const gameThings = document.getElementsByClassName('game-things')[0];
    gameThings.appendChild(this.divDom);
    // console.log(`创建${this.classname}成功`)
  }
  removeDom() {
    this.divDom.remove();
    // console.log(`移除${this.divDom.className}成功`)
  }
};

// 蛇
class Snake {
  constructor() {
    this.snakeInfo = [];
    this.hasAte = false;
    this.diraction = {
      left: {
        x: -1,
        y: 0,
        rotate: 180
      },
      right: {
        x: 1,
        y: 0,
        rotate: 0
      },
      up: {
        x: 0,
        y: -1,
        rotate: -90
      },
      down: {
        x: 0,
        y: 1,
        rotate: 90
      },
    }
    this.moveDiraction = this.diraction.right;
  }
  init() {
    const head = new Square(2, 0, 'head');
    head.createDom();
    const body1 = new Square(1, 0, 'body');
    body1.createDom();
    const body2 = new Square(0, 0, 'body');
    body2.createDom();
    this.snakeInfo.push(head);
    this.snakeInfo.push(body1);
    this.snakeInfo.push(body2);
    this.keepMove();
  }
  oneMove() {
    const nextPos = this.getNextPosition();
    this.eat(nextPos);
    const isDead = this.die(nextPos);
    if (isDead) {
      return;
    }
    // 去掉蛇头蛇尾
    this.snakeInfo[0].removeDom();
    // 新建蛇头蛇身
    const newHead = new Square(nextPos.x, nextPos.y, 'head');
    newHead.createDom(this.moveDiraction.rotate);
    const newBody = new Square(this.snakeInfo[0].x, this.snakeInfo[0].y, 'body');
    newBody.createDom();
    // 更新储存蛇的信息
    if (!this.hasAte) {
      // 根据有没有吃到食物决定要不要去掉尾巴
      this.snakeInfo[this.snakeInfo.length - 1].removeDom();
      this.snakeInfo.pop();
      this.hasAte = false;
    }
    this.snakeInfo.shift();
    this.snakeInfo.unshift(newBody);
    this.snakeInfo.unshift(newHead);
  }
  keepMove(stayTime = 200) {
    this.timer = setInterval(() => {
      this.oneMove();
    }, stayTime);
  }
  getNextPosition() {
    const x = this.snakeInfo[0].x + this.moveDiraction.x;
    const y = this.snakeInfo[0].y + this.moveDiraction.y;
    return {
      x,
      y
    }
  }
  eat(nextPos) {
    const scoreDom = document.getElementsByClassName('score')[0];
    this.hasAte = true;
    this.hasAte = nextPos.x === food.x && nextPos.y === food.y;
    if (this.hasAte) {
      food.makeFood();
      game.score++;
      scoreDom.innerText = game.score;
    }
  }
  die(nextPos) {
    if (nextPos.x < 0 || nextPos.x > 29 || nextPos.y < 0 || nextPos.y > 29 || isInSnake(nextPos.x, nextPos.y)) {
      game.over();
      return true;
    }
  }
}
let snake = new Snake();

// 食物
class Food {
  init() {
    this.makeFood();
  }
  // 随机生成食物
  makeFood() {
    if (this.food) {
      this.food.removeDom();
    }
    this.x = getRanDom();
    this.y = getRanDom();
    while (isInSnake(this.x, this.y)) {
      this.x = getRanDom();
      this.y = getRanDom();
    }
    this.food = new Square(this.x, this.y, 'food')
    this.food.createDom();
  }

}
let food = new Food();

// 游戏逻辑
class Game {
  constructor() {
    this.score = 0;
    this.isPausing = false;
    this.n = 0;// 控制game.init的执行次数
  }
  init() {
    this.bindPause();
    this.bindRestart();
    document.addEventListener('keydown', this.changePositon);
  }
  bindStart() {
    const startBtn = document.getElementsByClassName('start-btn')[0];
    startBtn.addEventListener('click', (e) => {
      if (e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble();
      }
      if (this.n === 0) {
        this.init();
        this.n++;
      }
      snake.init();
      food.init();
      e.target.parentNode.style.display = 'none';
    });
  }
  bindPause() {
    const pausingDom = document.getElementsByClassName('pausing')[0];
    const pausingCb = (e) => {
      if (e.type === 'click') {
        if (e.target !== wrapper) {
          return;
        }
      }
      if (e.type !== 'click' && e.code !== 'Space') {
        return;
      }
      if (!this.isPausing) {
        clearInterval(snake.timer);
        document.removeEventListener('keydown', this.changePositon);
        pausingDom.style.display = 'block';
        this.isPausing = true;
      } else {
        snake.keepMove();
        document.addEventListener('keydown', this.changePositon);
        pausingDom.style.display = 'none';
        this.isPausing = false;
      }
    }
    const wrapper = document.getElementsByClassName('wrapper')[0];
    wrapper.addEventListener('click', pausingCb);
    document.addEventListener('keydown', pausingCb);
  }
  bindRestart() {
    const restartBtn = document.getElementsByClassName('restart')[0];
    restartBtn.addEventListener('click', () => {
      this.restart('restart');
    })
  }
  changePositon(e) {
    if (e.code == 'ArrowLeft' && snake.moveDiraction !== snake.diraction.right) {
      snake.moveDiraction = snake.diraction.left;
    } else if (e.code == 'ArrowUp' && snake.moveDiraction !== snake.diraction.down) {
      snake.moveDiraction = snake.diraction.up;
    } else if (e.code == 'ArrowRight' && snake.moveDiraction !== snake.diraction.left) {
      snake.moveDiraction = snake.diraction.right;
    } else if (e.code == 'ArrowDown' && snake.moveDiraction !== snake.diraction.up) {
      snake.moveDiraction = snake.diraction.down;
    }
  }

  over() {
    // 清除定时器
    clearInterval(snake.timer);
    alert('你的得分：' + this.score);
    // 回到初始状态
    this.restart();
  }
  restart(type) {
    if (this.isPausing) {
      document.addEventListener('keydown', this.changePositon);
    }
    this.isPausing = false;
    clearInterval(snake.timer);
    const pausingDom = document.getElementsByClassName('pausing')[0];
    pausingDom.style.display = 'none';
    let gameThings = document.getElementsByClassName('game-things')[0];
    gameThings.innerHTML = '';
    snake = new Snake();
    food = new Food();
    this.score = 0;
    const scoreDom = document.getElementsByClassName('score')[0];
    scoreDom.innerText = game.score;
    const startBtn = document.getElementsByClassName('start-btn')[0];
    startBtn.parentNode.style.display = 'block';
  }
}
const game = new Game();
game.bindStart();
