const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require("path")
const { exec} = require('child_process');
const fs = require('fs')


let mainWindow = null

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, "preload.js")
        }
    })

    mainWindow.loadFile(path.join(__dirname, 'App/index.html'))
}

app.whenReady().then(async () => {
    createWindow()

    // Init Menu
    Menu.setApplicationMenu(Menu.buildFromTemplate([]))

    // open Dev tools
    // mainWindow.webContents.openDevTools()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("image:file", processFile)
ipcMain.on("image:url", processUrl)

function processUrl(event, url){
    const command = `${path.join(__dirname, 'python/venv/Scripts/activate')} && python ${path.join(__dirname, 'python/main.py')} "${url}" url`
    console.log(command)
    const pythonProcess = exec(command);

    pythonProcess.stdout.on('data', (data) => sendEmotions(data, "url"));
    pythonProcess.stderr.on('data', (data) => sendError(data, "url"));

    pythonProcess.stdout.removeListener("data", (data) => sendEmotions(data, "url"))
    pythonProcess.stderr.removeListener("data", (data) => sendError(data, "url"))
}

function processFile(event, filePath){
    const command = `${path.join(__dirname, 'python/venv/Scripts/activate')} && python ${path.join(__dirname, 'python/main.py')} ${filePath} file`
    const pythonProcess = exec(command);

    pythonProcess.stdout.on('data', (data) => sendEmotions(data, "file"));
    pythonProcess.stderr.on('data', (data) => sendError(data, "file"));

    pythonProcess.stdout.removeListener("data", (data) => sendEmotions(data, "file"))
    pythonProcess.stderr.removeListener("data", (data) => sendError(data, "file"))
}

function sendEmotions(string, type){
    console.log(string)
    if (type === 'file'){
        if (string === "noFaceDetected"){
            mainWindow.webContents.send("noFaceDetectedFile")
        }else {
            mainWindow.webContents.send("image:file", string.split(" "))
        }
    }else if (type === "url"){
        if (string === "noFaceDetected"){
            mainWindow.webContents.send("noFaceDetectedUrl")
        } else if (string === "invalidUrl"){
            mainWindow.webContents.send("invalidUrl")
        }else{
            mainWindow.webContents.send("image:url", string.split(" "))
        }
    }
}

function sendError(string, type){
    console.log(string)
    if (type === "file"){
        mainWindow.webContents.send("pythonErrorFile")
    }else if (type === 'url'){
        mainWindow.webContents.send("pythonErrorUrl")
    }
}
