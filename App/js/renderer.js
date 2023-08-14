const img = document.querySelector('#imgInput')
const fromFileBtn = document.querySelector('#fromFileBtn')
const fromUrlBtn = document.querySelector('#fromUrlBtn')
const fromFileBtnUnderline = document.querySelector('#fromFileUnderline')
const fromUrlBtnUnderline = document.querySelector('#fromUrlUnderline')
const fromFileBackGround = document.querySelectorAll('.fromFileBackGround')
const fromUrlBackGround = document.querySelectorAll('.fromUrlBackGround')
const emotionFromFile = document.querySelector('#emotionFromFile')
const emotionFromUrl = document.querySelector('#emotionFromUrl')
const emotionsListFile = document.querySelector('#emotionsListFile')
const emotionsListUrl = document.querySelector('#emotionsListUrl')
const statusFile = document.querySelector('#statusFile')
const statusUrl = document.querySelector('#statusUrl')
const precessImageIconFile = document.querySelector('#precessImageIconFile')
const precessImageIconUrl = document.querySelector('#precessImageIconUrl')
const getImageUrl = document.querySelector('#getImageUrl')
const urlInput = document.querySelector('#urlInput')

fromFileBtn.addEventListener("click", fromFilePressed)
fromUrlBtn.addEventListener("click", fromUrlPressed)
getImageUrl.addEventListener("click", sendFromUrl)

// statuses
const statuses = {
    selectImg: "Select an image",
    enterUrl: "Enter a link to image",
    invalidUrl: "The url is invalid",
    loading: "Processing your image",
    emotions: "Emotions detected:",
    noFaces: "No face was detected on the image",
    pythonError: "Unexpected Python error"
}
changeStatus(statuses.selectImg, "file")
changeStatus(statuses.enterUrl, "url")

function fromFilePressed(){
    if (fromFileBtnUnderline.classList.contains("sectionClosed")){
        // move underline
        fromFileBtnUnderline.classList.add("sectionOpened")
        fromFileBtnUnderline.classList.remove("sectionClosed")
        fromUrlBtnUnderline.classList.add("sectionClosed")
        fromUrlBtnUnderline.classList.add("sectionOpened")

        // move background
        fromFileBackGround.forEach((item) => {
            item.classList.add("sectionOpened")
            item.classList.remove("sectionClosed")
        })
        fromUrlBackGround.forEach((item) => {
            item.classList.add("sectionClosed")
            item.classList.remove("sectionOpened")
        })

        // move section
        emotionFromFile.classList.add("sectionOpened")
        emotionFromFile.classList.remove("sectionClosed")
        emotionFromUrl.classList.add("sectionClosed")
        emotionFromUrl.classList.add("sectionOpened")
    }
}

function fromUrlPressed(){
    if (fromUrlBtnUnderline.classList.contains("sectionClosed")){
        // move underline
        fromUrlBtnUnderline.classList.add("sectionOpened")
        fromUrlBtnUnderline.classList.remove("sectionClosed")
        fromFileBtnUnderline.classList.add("sectionClosed")
        fromFileBtnUnderline.classList.add("sectionOpened")

        // move background
        fromFileBackGround.forEach((item) => {
            item.classList.add("sectionClosed")
            item.classList.remove("sectionOpened")
        })
        fromUrlBackGround.forEach((item) => {
            item.classList.add("sectionOpened")
            item.classList.remove("sectionClosed")
        })

        // move section
        emotionFromUrl.classList.add("sectionOpened")
        emotionFromUrl.classList.remove("sectionClosed")
        emotionFromFile.classList.add("sectionClosed")
        emotionFromFile.classList.add("sectionOpened")
    }
}

const isFileImage = (file) => {
    const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg', 'image/jpg']
    return file && acceptedImageTypes.includes(file.type)
}

function loadImg(e){
    const file = e.target.files[0]

    if (!isFileImage(file)){
        alert("Please select an image")
        return
    }

    ipcRenderer.send("image:file", file.path)
    emotionsListFile.classList.add("displayNone")
    changeStatus(statuses.loading, "file")
}

function changeStatus(status, type){
    if (type === "file"){
        statusFile.innerHTML = status
        if (status === statuses.loading){
            precessImageIconFile.classList.remove("displayNone")
        }else{
            precessImageIconFile.classList.add("displayNone")
        }
    }else if (type === "url"){
        statusUrl.innerHTML = status
        if (status === statuses.loading){
            precessImageIconUrl.classList.remove("displayNone")
        }else{
            precessImageIconUrl.classList.add("displayNone")
        }
    }
}

function sendFromUrl(){
    const url = urlInput.value
    changeStatus(statuses.loading, "url")
    emotionsListUrl.classList.add("displayNone")
    ipcRenderer.send("image:url", url)
}

function fillEmotionList(data, type){
    if (type === "file") {
        emotionsListFile.classList.remove("displayNone")
        changeStatus(statuses.emotions, "file")
        emotionsListFile.innerHTML = ""
        data.forEach((emotion) => {
            let newListItem = document.createElement("li")
            newListItem.textContent = emotion
            newListItem.classList.add("emotionsListItem")

            emotionsListFile.insertAdjacentElement("beforeend", newListItem)
        })
    }else if (type === "url"){
        emotionsListUrl.classList.remove("displayNone")
        changeStatus(statuses.emotions, "url")
        emotionsListUrl.innerHTML = ""
        data.forEach((emotion) => {
            let newListItem = document.createElement("li")
            newListItem.textContent = emotion
            newListItem.classList.add("emotionsListItem")

            emotionsListUrl.insertAdjacentElement("beforeend", newListItem)
        })
    }
}

function printError(message, type){
    if (type === "file"){
        if (message === "noFaceDetectedFile") changeStatus(statuses.noFaces, "file")
        // else if (message === "pythonErrorFile") changeStatus(statuses.pythonError, "file")
    }else if (type === "url"){
        if (message === "invalidUrl") changeStatus(statuses.invalidUrl, "url")
        else if (message === "noFaceDetectedUrl") changeStatus(statuses.noFaces, "url")
    }
}

img.addEventListener('change', loadImg)

ipcRenderer.on("image:file", (data) => fillEmotionList(data, "file"))
ipcRenderer.on("image:url", (data) => fillEmotionList(data, "url"))
ipcRenderer.on("noFaceDetectedFile", () => printError("noFaceDetectedFile", "file"))
ipcRenderer.on("noFaceDetectedUrl", () => printError("noFaceDetectedUrl", "file"))
ipcRenderer.on("pythonErrorFile", () => printError("pythonErrorFile", "file"))
ipcRenderer.on("invalidUrl", () => printError("invalidUrl", "url"))
