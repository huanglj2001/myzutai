//'use strict'

 const { app, ipcMain} = require('electron')
 const { dialog } =require('electron')


/*
ipcMain.on('open-directory-dialog', function (event,p) {
  dialog.showOpenDialog({
    properties: [p]
  },function (files) {
      if (files){// 如果有选中 
        // 发送选择的对象给子进程       
        event.sender.send('selectedItem', files[0],p)
      }
  })
});*/


ipcMain.on('open-directory-dialog', function (event,...values) {
      dialog.showOpenDialog({
        properties: [values[0]]
      },function (files) {
          if (files){// 如果有选中 
            // 发送选择的对象给子进程       
            event.sender.send('selectedItem', files[0],values)
          }
      })
    });
    
