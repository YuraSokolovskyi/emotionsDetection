const {contextBridge, ipcRenderer} = require("electron")
const path = require("path")
const fs = require('fs')

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    invoke: (channel, data) => ipcRenderer.invoke(channel, data)
})

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args),
    dirname: () => __dirname
})

contextBridge.exposeInMainWorld("fs", {
    writeFileSync: (outputPath, imageData) => fs.writeFileSync(outputPath, imageData),
    readFileSync: (file) => fs.readFileSync(file, 'utf8')
})

contextBridge.exposeInMainWorld("Buffer", {
    from: (data) => Buffer.from(data)
})
