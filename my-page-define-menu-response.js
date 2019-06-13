
class MyPageDefineMenuResponser{

    constructor( element) {
        var currentBrowserWindow = remote.getCurrentWindow()
        //
        currentBrowserWindow.on("role",this.responseMenu.bind(this))
        ipcRenderer.on('selectedItem',this.gettedPath.bind(this));

        }

    responseMenu()
    {
        var role = arguments[0] 
        switch (role) {
            case "newProject":
                this.newProject_sendcmmd();
                break;
        }
    }

    newProject_sendcmmd()
    {
        ipcRenderer.send('open-directory-dialog', 'openDirectory','myDefinePage','newProject');
        
    }

    gettedPath(event,folderPath,originParam){
        if (originParam[1] !== "myDefinePage") {
            return;
        }
        var role =  originParam[2];
        
        switch(role){
            case 'newProject':
                this.newProject_rcvcmmd(folderPath);
                break;
        }
    }


    async newProject_rcvcmmd(folderPath){
        
        //判断文件夹是否为空
        var files = fs.readdirSync(folderPath)
        if (files.length > 0){
            alert("文件夹不为空，要求新建工程所在文件必须为空")
            return
        }

        //工程名字
        //var projectName = prompt("工程名称",);
        const {value: projectName} = await Swal.fire({
            title: '请输入您的工程名称',
            input: 'text',
            inputPlaceholder: '某某工程',
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value) {
                return 'You need to write something!'
              }
            }
          })
         
        if(!projectName){
            await Swal.fire({
                title: 'Error!',
                text: "工程名称不能为空",
                type: 'error',
                confirmButtonText: '知道了'
              })
           
            return;
        }  

  

        //创建配置文件并写配置文件
        var myjson = {prjName:projectName}
        var jsonText = JSON.stringify(myjson)
        //3. fs.writeFile  写入文件（会覆盖之前的内容）（文件不存在就创建）  utf8参数可以省略  
        fs.writeFile(folderPath + '\\project.json',jsonText,'utf8',function(error){
            if(error){
                console.log(error);
                return false;
            }
            console.log('写入成功');
        })
        

    }


}//class

new MyPageDefineMenuResponser();



