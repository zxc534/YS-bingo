const express = require('express');
const readline = require('readline');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

// Multer 스토리지 설정
const uploadDir = path.join(__dirname, 'images');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const { name, number } = req.body;
    const ext = path.extname(file.originalname);

    const newFilename = `${name}_${number}${ext}`;
    cb(null, newFilename);
  }
})
const upload = multer({ storage: storage});


app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(uploadDir)); 

const users = [];

// 이미지 업로드
app.post('/upload-image', upload.single('image'), (req, res) => {
  console.log("######rea######", req);
  if (!req.file) {
    return res.status(400).json({ message: '파일이 업로드되지 않았습니다'});
  }
  console.log('업로드된 파일:', req.file);
  res.json({
    message: '이미지 업로드 성공!',
    fileInfo: req.file,
    recieveData: req.body,
  });
});

// 이름 전송
app.post('/send-name', (req, res) => {
  const { name } = req.body;
  console.log('서버에서 받은 문자열:', name);
  users.push({
    name: name,
    bingo: [],
    count: 0,
  });
  console.log(users);
  const responseMessage = name;
  const state = 'success'
  res.json({ 
    state: state,
    message: responseMessage 
  });
});

// 빙고판 확인
app.get('/bingo', (req, res) => {
  const { name } = req.query;
  console.log('받은 이름:', name);
  for (let i=0; i<users.length; i++) {
    if (users[i].name === name) {
      res.json({
        info: users[i]
      });
      break;
    } 
  }
})

// 이미지 반환
app.get('/get-image', (req, res) => {
  const { imageName } = req.query;  // 이미지 이름을 쿼리로 받습니다.
  
  const extensions = ['.png', '.jpg', '.jpeg', '.gif'];

  let found = false;
  for (let ext of extensions) {
    const imagePath = path.join(uploadDir, imageName + ext);

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
      found = true;
      break;
    }
  }

  if (!found) {
    res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.on('line', (input) => {
  const [command, arg] = input.split(' ');

  switch (command) {
    case 'create':
      console.log('빙고 생성 시작');
      createBingo();
      break;

    default:
      console.log('Command Not Found.');
      break;
  }
})

function createBingo() {
  console.log('users', users);
  console.log('length', users.length);

  users.forEach((user) => {
    for(let i=0; i<9; i++) {
      var random_num = Math.floor(Math.random() * users.length);
      if (random_num >= users.length) { random_num = 0; }
      while(true) {
        if ((users[random_num].count < 10) && (users[random_num] !== user) && (!(user.bingo.includes(users[random_num].name)))) {
          users[random_num].count += 1;
          user.bingo.push(users[random_num].name);
          break;
        } else {
          random_num += 1;
          if (random_num >= users.length) { random_num = 0; }
        }
      }
    }
  })

  console.log('빙고 생성 완료');
  console.log('users', users);
}
