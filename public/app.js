// init
// check local storage
if(localStorage.getItem("YSbingo-name") !== null) {
    ChangeBingoView();
    CheckBingo();
}

// 이름 입력
const name_input = document.getElementById("name-input");
name_input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();
    const name = event.target.value;
    console.log("입력한 이름", name);
    
    fetch("/send-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("서버 응답 데이터:", data);
        if (data.state === 'success') {
            localStorage.setItem("YSbingo-name", name);
        }
        ChangeBingoView();
      })
      .catch((error) => {
        console.error("에러 발생:", error);
      });
  }
});

function ChangeBingoView() {
    const name_box = document.getElementById("name-box");
    const bingo_box = document.getElementById("bingo-box");
    const bingo_title = document.getElementById("bingo-title");

    name_box.style.display = 'none';
    bingo_box.style.display = 'flex';
    bingo_title.innerHTML = `<b>${localStorage.getItem("YSbingo-name")}</b>의 빙고판`;
}

// 빙고판 불러오기
function CheckBingo() {
  fetch(`/bingo?name=${localStorage.getItem("YSbingo-name")}`)
  .then((response) => response.json())
  .then((data) => {
    console.log("서버 응답:", data)
    if( data.info.bingo.length !== 0 ) {
      const bingoBlocks = document.getElementsByClassName('bingo-block');
      for(let i=0; i<9; i++) {
        bingoBlocks[i].innerHTML = '';

        const name_box = document.createElement('div');
        name_box.innerText = data.info.bingo[i];
        name_box.classList.add('bingo-name');
        bingoBlocks[i].appendChild(name_box);

        const form = document.createElement('form');
        form.id = 'uploadForm';
        form.enctype = 'multipart/form-data';

        const input = document.createElement('input');
        input.type = 'file';
        input.name = 'image';
        input.id = 'imageInput';
        input.accept = 'image/*';
        
        input.addEventListener('change', async (e) => {UploadImage(e, i)})

        form.appendChild(input);
        bingoBlocks[i].appendChild(form);
        bingoBlocks[i].addEventListener('click', (e) => {
          input.click();
        })

        fetchImage(bingoBlocks[i], i);
      }
    }
  })
  .catch((error) => {
    console.log(error);
  })
}

const bingo_refresh_button = document.getElementById("bingo-refresh-button");
bingo_refresh_button.addEventListener("click", () => {
  location.href = location.href;
});

// 이미지 전송
async function UploadImage (e, number) {
  if(e.target.files.length === 0) {
    return;
  }
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('name', localStorage.getItem("YSbingo-name"));
  formData.append('number', number);
  formData.append('image', file);

  try {
    const response = await fetch('/upload-image', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    console.log('서버 응답:', result);
    location.href = location.href;
  } catch (error) {
    console.log('업로드 중 에러 발생', error);
  }
} 

// 이미지 요청
function fetchImage(target, i) {
  const imageName = `${localStorage.getItem("YSbingo-name")}_${i}`
  
  fetch(`/get-image?imageName=${imageName}`)
    .then(response => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error("이미지를 찾을 수 없습니다.");
      }
    })
    .then(imageBlob => {
      const imageUrl = URL.createObjectURL(imageBlob);
      const imgElement = document.createElement('img');
      imgElement.src = imageUrl;
      imgElement.style.display = "block";
      imgElement.classList.add('bingo-image');
      target.appendChild(imgElement);
    })
    .catch(error => {
      console.log(error.message);
    });
}

// 모달
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");

// 모달 열기
openModalBtn.onclick = function() {
  modal.style.display = "block";
};

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};


const githubBtn = document.getElementById('github-btn');
githubBtn.addEventListener('click', ()=> {location.href = 'https://github.com/zxc534/YS-bingo'});