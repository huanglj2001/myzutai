
new Vue({
    el: '#app',
    data: {
      message: '22Hello Vue.js!',
      yourname: "",
      dragbegin_:{eventoX:0, eventoY:0,targetoX:0,targetoY:0},
      target:null,
      cloneClassName:"clone",
      //lcellId:'lcell',
      lcell: null,
      rcell: null,
      optionWindow: null,


    },
    mounted:function(){
      var currentBrowserWindow = remote.getCurrentWindow()
      currentBrowserWindow.on("refreshTarget",this.refreshTarget)
      window.addEventListener("beforeunload", this.beforeunload)
    },
    methods: {


      openOptionWindow(eventTarget, isbackground)
      { 
        this.target = eventTarget  
        var target = eventTarget

          //create optionwindow
          if(this.optionWindow == null)
          { 
             var modalPath
            if(isbackground)
            {//click the container
              modalPath = path.join('file://', __dirname, "./option-window-container.html")
            }        
            else if(this.isCloneEle(target))
            {
              modalPath = path.join('file://', __dirname, "./option-window-element.html")
            }
             
            this.optionWindow  = new BrowserWindow({
              width:300, 
              //height:400, 
              x:1000,
              y:50,
              parent:remote.getCurrentWindow(), 
              closeable: false,
              title:"设置属性",
              frame:false,
              show: false})               
            this.optionWindow.loadURL(modalPath)
            //this.optionWindow.webContents.openDevTools()
            this.optionWindow.on('closed',() =>{this.optionWindow = null})
          }

 
          var com =window.getComputedStyle(this.target,null);          
          var jsonText
          com.varName = target.getAttribute("varName")
          com.displayDecimals = target.dataset.valueDec?target.dataset.valueDec:target.getAttribute("displayDecimals")
         
          //seriaze style
          if(isbackground){//container 
            jsonText = JSON.stringify(com,
              ["backgroundColor","backgroundImage","width","height"]            
              ,4)   
          }        
          else if(this.isCloneEle(target))//element
          {               
              jsonText = JSON.stringify(com,
             ["backgroundColor","color","width","height","border","left","top","varName","displayDecimals"]            
             ,4)                    
                  
          }
          localStorage.setItem('elementStyle', jsonText) 
          console.log("jsonTextFromElement", jsonText)
          this.optionWindow.show()  
      },

      idblclickInPanel(event)
      {//open optionwinow
        /*
          if((event.target == event.currentTarget)||(this.isCloneEle(event.target)))
          {}
          else{return}
          */
         this.setLRcell();
         if (this.isCloneEle(event.target)) {
           this.openOptionWindow(event.target)
         }
         else if(this.isBackgroundEle(event.target) || (event.target == this.rcell)){
          this.openOptionWindow(this.getContainerBackgroudEle(), true)
         }

      },


        beforeunload:function()
        {         
          if(confirm("保存文件吗？"))
          {
            this.savewindow()
          }

        },

        isCloneEle(ele)
        {          
          if(ele.className&&(ele.className.indexOf(this.cloneClassName) > -1))
          {return true}
          return false
        },
        isBackgroundEle(ele)
        {          
          if(ele.id == "rcellbackgroud")
          {return true}
          return false
        },


        refreshTarget(){
          
          var jsonText = localStorage.getItem("elementStyleFeedBack");
          console.log("jsonTextFromOptionWindow",jsonText) 
          var com = JSON.parse(jsonText)

          var target =  this.target  

          if(this.isCloneEle(target)){      
            target.style["backgroundColor"] = this.hex2rgba(com.backgroundColor,com.transparent);
            target.style["color"] = com.color;
            target.style["width"] = com.width + 'px';
            target.style["height"] = com.height + 'px';

            if(target.dataset.width){
              target.dataset.width = com.width
              target.dataset.height = com.height              
            }
            if(target.width)
            {
              target.width = com.width
              target.height = com.height
            }

            //varname
            target.setAttribute("varName",com.varName)
            var displayDecimals = parseInt(com.displayDecimals)
            target.setAttribute("displayDecimals", displayDecimals)
            if(target.dataset.valueDec)
            {target.dataset.valueDec = displayDecimals}
          }
          else
          {//container
            target.style.width = com.width + 'px';
            target.style.height = com.height + 'px';
            /*
            //reszie
            this.setLRcell()
            this.lcell.style.height = target.style.height
            this.mcell.style.height = target.style.height
           */ 

            target.style.backgroundColor = com.backgroundColor;
            if(com.backgroundImage === "none"){
              target.style.backgroundImage = "none"
            }
            else{
              target.style.backgroundImage = "url("+com.backgroundImage+")"
            }

          }
        },
        iDragmcell:function (ev)
        {             
          ev.dataTransfer.setData("dragType","mcell") 
          ev.dataTransfer.setData("dragmcell","mcell")        
        
         
          this.setLRcell()
          this.lcell.eventoX  = ev.pageX
          var padding = parseFloat( window.getComputedStyle(this.lcell,null)["paddingLeft"] )+ parseFloat( window.getComputedStyle(this.lcell,null)["paddingRight"])
          this.lcell.oW  =   this.lcell.offsetWidth - padding  //offsetWidth include padding         
         
          //this.rcell.x = this.rcell.offsetLeft //realtime position         
        
        },
        setLRcell:function(){
          if ( this.lcell)
          {return}

          this.lcell = document.getElementById("lcell")
          this.rcell = document.getElementById("rcell")

          this.mcell = document.getElementById("mcell")

        },

        iMouseDownInpanel(event)
        {
          if (this.optionWindow != null)
          {
            this.optionWindow.close()
            this.optionWindow = null
          }

        },

        iDragOverInApp:function (ev)
        {
           ev.preventDefault();
          if (ev.dataTransfer.types.includes('dragmcell')) {
            this.resizeCell(ev);
            return
          }
        },
                
        resizeCell:function (ev)
        { 
          var movX = ev.pageX - this.lcell.eventoX 
          this.lcell.style.width = this.lcell.oW + movX +'px'     
          
          this.mcell.style.left = this.lcell.offsetWidth + 'px'
          
          //this.rcell.style.left = parseFloat(this.mcell.style.left) + this.mcell.offsetWidth +'px' 
          this.rcell.style.marginLeft = parseFloat(this.mcell.style.left) + this.mcell.offsetWidth +'px'    
          /*
          var varX =  this.rcell.offsetLeft - this.rcell.x 
          var nodes =  rcell.childNodes;          
          nodes.forEach(function(item,index,array){
            item.style.left = item.offsetLeft + varX + 'px'
          })

          this.rcell.x = this.rcell.offsetLeft*/
        },
                
        iDragClone:function (ev)
        {  
          
          var id = ev.target.id       
          ev.dataTransfer.setData("id",id);
          ev.dataTransfer.setData("dragType","clone")  

          this.dragbegin_.eventoX  = ev.pageX
          this.dragbegin_.eventoY = ev.pageY
          this.dragbegin_.targetoX = ev.target.offsetLeft
          this.dragbegin_.targetoY = ev.target.offsetTop
        },
        


        iDropInPanel(ev)
        {         
          var dragType=ev.dataTransfer.getData("dragType"); 
          switch  (dragType)
          {
            case "clone":
            this.clone(ev);
            return;
           
          }  

        },
        clone:function (ev)
        {
          ev.preventDefault();
          var id=ev.dataTransfer.getData("id");     

          var srceEle =  document.getElementById(id);

          var clone =  srceEle.cloneNode(true);

          clone.id =  clone.tagName +'-' +  this.newGuid()   
          clone.className = clone.className? (clone.className +" " + this.cloneClassName) :this.cloneClassName
          /*    */ 
          clone.style.position = "absolute";

          var xMove = ev.pageX - this.dragbegin_.eventoX
          var yMove = ev.pageY - this.dragbegin_.eventoY
          //clone.style.left = this.dragbegin_.targetoX + xMove +'px'
          //clone.style.top = this.dragbegin_.targetoY + yMove + 'px'

          this.setLRcell();
          var container = ev.currentTarget
          var x=  this.dragbegin_.targetoX + xMove +  this.lcell.offsetLeft - container.offsetLeft;
          var y = this.dragbegin_.targetoY + yMove + this.lcell.offsetTop - container.offsetTop;
          //alert(this.rcell.offsetLeft,'this.rcell.offsetLeft')
          clone.style.left = x +'px'
          clone.style.top = y + 'px'  
         

          ev.currentTarget.appendChild(clone);

        },

        closewindow:function()
        {
          window.close()
        },

        deleteElement:function()
        {
          remote.getCurrentWindow().emit("delete")
        },

        importFile:function(event)
        {
          var path = event.target.files[0].path

          var xhr='';
          if (window.XMLHttpRequest){
              xhr=new XMLHttpRequest();
          }else{
              xhr=new ActiveXObject("Microsoft.XMLHTTP");
          }
          xhr.onreadystatechange=function(){
              if(xhr.readyState==4){
                  if(xhr.status==200){
                      var rcell = document.getElementById('rcell')                                           
                      var importDiv = document.createElement('div')
                      importDiv.innerHTML = xhr.responseText
                       var importRcell = importDiv.firstChild   


                      //copy attribute of container
                      this.setLRcell()
                      var cloneContainer = importRcell.cloneNode(false)
                      cloneContainer.style.position = 'static'
                      cloneContainer.id = this.getContainerBackgroudEle().id;
                      this.rcell.replaceChild(cloneContainer,this.getContainerBackgroudEle())

                    /*
                      rcell.style.backgroundImage = importRcell.style.backgroundImage
                      rcell.style.backgroundColor = importRcell.backgroundColor
                      rcell.style.width = importRcell.style.width
                      rcell.style.height = importRcell.style.height
                     
                      //reszie
                      this.setLRcell()
                      this.lcell.style.height = importRcell.style.height
                      this.mcell.style.height = importRcell.style.height                       

                      rcellComputedStyle = window.getComputedStyle(rcell,null);  */
                      
                      //copy element
                      importRcell.childNodes.forEach(function(ele){                        
                        var clone = ele.cloneNode(true)
                        this.rcell.appendChild(clone)
                      })
                      
                      
                  }
              }
          }.bind(this)
          //var url = "./contents.html"
          var url = path;
          xhr.open('get',url,false);
          xhr.send();
      
        },

        savewindow:function()
        {          
          var fs = require('fs');
          var path = require('path');           
          var destPath = path.join(__dirname,  'contents.html');
          

          /** elements*/
          this.setLRcell()
          var rcell = this.rcell
          var clones = rcell.cloneNode(true)
          
          //var rcellLeft = rcell.offsetLeft
          //var rcellTop = rcell.offsetTop
          
          var length = clones.childNodes.length;
          for(let i = length - 1; i >= 0; i--)
          {
            var node = clones.childNodes[i]
            if (!this.isCloneEle(node)){                      
              clones.removeChild(node)             
            }
            else{             
              //node.style.left = parseFloat(node.style.left) - rcellLeft + 'px'
              //node.style.top = parseFloat(node.style.top) - rcellTop + 'px'
            }
          }

          /*container */
          var cloneContainer = this.getContainerBackgroudEle().cloneNode(false);
          cloneContainer.style.marginLeft = 0 + 'px' 
          cloneContainer.style.left = 0 +'px'
          cloneContainer.style.top = 0 + 'px'
          cloneContainer.style.marginTop = 0 + 'px'    
          cloneContainer.style.position = "relative"      
           
          
          //size
          rcellCom = window.getComputedStyle(this.getContainerBackgroudEle(),null)
          cloneContainer.style.width =  rcellCom.width + 'px'  
          cloneContainer.style.height = rcellCom.height + 'px' 

          console.log("marginLeft:",rcellCom.marginLeft,"left:",rcellCom.left,"offsetleft",rcell.offsetLeft)   
         
          /**merge ele and container */
          cloneContainer.innerHTML = clones.innerHTML

          var htmlText = cloneContainer.outerHTML
          fs.writeFile(destPath,htmlText , function (err) {
            if (err)
              console.log("savewindow():write file error",err)
          })
        },

        getContainerBackgroudEle()
        {
          return document.getElementById("rcellbackgroud")
        },

        newGuid: function()
        {
            var guid = "";
            for (var i = 1; i <= 32; i++){
              var n = Math.floor(Math.random()*16.0).toString(16);
              guid +=   n;
              if((i==8)||(i==12)||(i==16)||(i==20))
                guid += "-";
            }
            return guid;   
        },

        // hex: "#ffffff" ; a: 0.4
        hex2rgba: function(hex,a){
          var r = hex.substring(1,3) // get index 1,index 2, befor index3 (index begin with 0)
          var g = hex.substring(3,5)
          var b = hex.substring(5,7)
          var retval = 'rgba( '+ parseInt(r,16)+ ',' + parseInt(g,16) +','+ parseInt(b,16)+',' + a +' )'
          return retval
      }



    } //proto
  })
  
