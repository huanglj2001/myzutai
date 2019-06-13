
(function() {

   /*!!!!!!!!!!!!!!offsetLeft,offsetwidth...付给 style 一定要加 +'px'*/

    /**
     * 默认参数
     */
    var defaultOpts = {
        stage: document, //舞台
        itemClass: 'resize-item', //可缩放的类名
    };

    /**
     * 定义类
     */
    var ZResize = function(options) {
        this.options = options
        this.container = this.options.container       
        this.cloneClassName = "clone"
        this.draganchorClassName = "draganchor"

        this.target = null; //需要调整大小和拖拽的目标元素 add attribute {eventoX,eventoY,oX,oY,oW,oH}
       
        this.selects = [];

        this.toolbar; 
        this.toolbarID = 'zresize-toolbar'

        this.draganchorlists ;//8个拽点
        this.n;
        this.e;
        this.s;
        this.w;
        this.nw;
        this.ne;
        this.sw;
        this.se;
        
        this.mask;
        this.maskID = 'zresize-mask';
        this.maskdot;
        this.maskdotID = 'zresize-maskdot';
        
        this.init();
    }

    ZResize.prototype = {
        init: function() {
            this.initResizeBox();
        },
        /**
         *  初始化拖拽item
         */
        initResizeBox: function() {
            var self = this;
                /**
                 * 创建控制点
                 */
                self.n = document.createElement('div')
                self.s = document.createElement('div')
                self.w = document.createElement('div')
                self.e = document.createElement('div')
                self.nw = document.createElement('div')
                self.ne = document.createElement('div')
                self.sw = document.createElement('div')
                self.se = document.createElement('div')

                self.n.name = "n"
                self.s.name = "s"
                self.w.name = "w"
                self.e.name = "e"
                self.nw.name = "nw"
                self.ne.name = "ne"
                self.sw.name = "sw"             
                self.se.name = "se"
                
                self.defineachcss();

                self.draganchorlists = [self.n, self.s, self.w, self.e, self.ne, self.nw, self.se, self.sw]
                
                
                self.draganchorlists.forEach(function(el,index,array){                        
                        //el.innerText = el.name
                        el.className = self.draganchorClassName
                        // 添加项目
                        //self.container.appendChild(value)                         
                        self.container.appendChild(el);
                        //控制点公共样式    
                        self.cssmodify(el, {
                            position: 'absolute',
                            width: '8px',
                            height: '8px',
                            background: '#FFFFFF',
                            //background: '#ff6600',
                            margin: '0',
                            'border-radius': '2px',
                            border: '1px solid #dd5500',
                            display:'none',
                        });                       
                        el.draggable = true
                    }
                )

            //mask
            self.mask =  document.createElement('div')
            self.mask.id = self.maskID;
            self.cssmodify(self.mask, {
                position: 'absolute',
                width: '20px',
                height: '20px',
                background: 'rgba(30,30,30,0.5)',
                //background: '#ff6600',
                margin: '0',
                'border-radius': '2px',
                border: '2px dotted #ff0000',
                display:'none',
            });
            self.container.appendChild(self.mask);
            
            //dot
            self.maskdot =  document.createElement('div')
            self.maskdot.id = self.maskdotID
            self.cssmodify(self.maskdot, {
                position: 'absolute',
                width: '5px',
                height: '5px',
                background: 'rgba(0,255,0,1)',
                //background: '#ff6600',
                margin: '0',
               //'border-radius': '5px',
                border: '1px solid #00ff00',
                display:'none',
            });
            self.container.appendChild(self.maskdot);

            //工具条
            self.toolbar =  document.createElement('div')
            var toolbar = self.toolbar
            toolbar.id = self.toolbarID
            self.cssmodify(toolbar, {                
                position: 'fixed',
                width: '500px',
                height: '20px',
                bottom:'0',
                background: ' rgb(30,30,30)',
                //background: '#ff6600',
                margin: '0',
                'border-radius': '2px',
                border: '1px solid rgb(30,30,30)',
                color:'#ffffff',
                boxShadow: "-6px 0 0 0 rgb(60,60,60), 0 -6px 0 0  rgb(38,38,38),  6px 0 0 0  rgb(0,0,0), 0 6px 0 0  rgb(0,0,0) ",
                display:'none',
                zIndex: '99',
                fontSize: '0.8em',
            });
            toolbar.draggable = true   
                   
            toolbar.innerHTML = "<style> #" + toolbar.id + " * { magin-left:10px;padding:5px; }</style>"+
            '<label id ="leftalign">左对齐</label><label id ="rightalign">右对齐</label>'
            self.container.appendChild(toolbar)


            //给container bind mousemove
                self.container.addEventListener("mousedown", self.containmousedown.bind(self), false)           
            // container drag event
                self.container.addEventListener("dragstart", self.containdragstart.bind(self), false)
                self.container.addEventListener("dragover", self.containdragover.bind(self), false)

             //   self.container.addEventListener("dragenter", self.containdragenter.bind(self),false)
                //self.container.addEventListener("drop", self.containdrop.bind(self),false)
                self.container.addEventListener("dragend", self.containdragend.bind(self),false)
            //container click event      
                self.container.addEventListener("click", self.containclick.bind(self),false)
                

              //click in  toolbar
                self.toolbar.addEventListener("click", self.toolbarclick.bind(self),false)

                //
                self.hide8els()

                
                var currentBrowserWindow = remote.getCurrentWindow()
                currentBrowserWindow.on("delete",this.delete.bind(this))
            
        },
        delete:function(){
            if(this.target&&this.isCloneEle(this.target))
            {
               this.container.removeChild(this.target)
               this.target = null
                this.hide8els()
            }
        },
        resetSelects:function()
        {
            for(index in this.selects)
            {
                
                this.unSetLookOfSelect(this.selects[index])
            }
            //clear list
            this.selects  = []
        },

        isBackgroundEle:function(ele)
        {          
          if(ele.id == "rcellbackgroud")
          {return true}
          return false
        },

        getBackgroundEle:function(ele){
           return document.getElementById(rcellbackgroud)
        },
        containclick: function(event)
        {
            if( (event.target == this.container) || this.isBackgroundEle(event.target))
            {// it says that click on the container
                //hide toolbar about muti select 
               this.hideToolbar()
               
                this.resetSelects()
            }
            else if(this.isCloneEle(event.target))
            {
                if (event.ctrlKey)
                { this.toggleEleInSelects(event.target) }
                
            }
        },
        toggleEleInSelects:function(node)
        {
           if(this.selects.includes(node))
           {
                var unSetLookOfSelect = this.unSetLookOfSelect
                this.selects.forEach(function(item, index, arr) {
                    if(item == node) {
                        arr.splice(index, 1);
                        unSetLookOfSelect(node)
                    }
                });
           }
           else
           {
            this.selects.push(node)
            this.setLookOfSelect(node)
           }

           //toggle toolbar
           if(this.selects.length > 0)
           {
               this.showToolbar()
           }
           else
           {
               this.hideToolbar()
           }

        },
        showToolbar:function()
        {
            
            var toolbar = this.toolbar
            toolbar.style.left = this.container.offsetLeft + 30 + 'px';        
            this.toolbar.style.display = 'block'
        },
        hideToolbar: function()
        {
            this.toolbar.style.display = 'none'
        },
        
        setLookOfSelect:function(node)
        {
            // modify ele css         todo     
            this.cssmodify(node, {     
                border: '1px solid #ff0000',
                zIndex:'1',
            });
            // add to list

        },
        unSetLookOfSelect:function(node)
        {
            node.style.border  = 'none' //todo
        },

        toolbarclick: function(event)
        {
            if (this.selects.length < 1){
                alert('请至少选择1个元素后再操作')
                return
            }

            if( (event.target.id == 'leftalign' )||(event.target.id == 'rightalign' ))
            {
                if ( this.target == null  )
                {
                    alert('请选择参照元素后再操作')
                    return
                }
                var model = this.target
                var i;
                for(i = 0 ; i<this.selects.length; i++) 
                {
                    var item = this.selects[i]
                    if(item == model)
                    {}
                    else{   
                        if(event.target.id == 'leftalign' ){
                            item.style.left = model.offsetLeft + 'px'
                        }
                        else if(event.target.id == 'rightalign' )
                        {
                            item.style.left = model.offsetLeft + (model.offsetWidth - item.offsetWidth) + 'px'
                        } 
                    }
                } //for
            }
            


        },

        /*
        containdragenter: function(event)
        {
           var target = event.target
           if(event.dataTransfer.types.includes('zresize-multiselect')){
                this.addSelects(target)
            }
        },*/
        /*
        containdrop: function(event)
        {
           //在end 已经访问不到types,在drop可以 但此方法有可能丢失事件，例如在CONTAINER外DROP
            if(event.dataTransfer.types.includes('zresize-multiselect')){
                this.endmultiselect(event);
            }


        },*/
             
        containdragend: function(event)
        {
           //在end 已经访问不到types,在drop可以
            if(event.target == event.currentTarget){
                //表明拖拽到是CONTAINER本身，即意图多选结束
                this.endmultiselect(event);
            }


        },
        endmultiselect(event){                       
           //hide mask and dot
           this.mask.style.display = 'none'
           this.maskdot.style.display = 'none'
            //show toolbar
           
            if (this.selects.length > 0)
            {
                this.showToolbar()
            }

        },
        isCloneEle(ele)
        {
            if(ele.className&&ele.className.indexOf(this.cloneClassName) > -1)
            {return true}
            return false
        },
        
        containmousedown: function(event)
        {
            console.log("elemousedownfunction")   

            //event.stopPropagation()
            //event.preventDefault()
  
            if (event.target == this.container)
            {
               // self.hide8els()
               
            }            
            else if (event.target.className.indexOf(this.draganchorClassName) > -1)
            {//click drag anchor

            }
            else if (this.isCloneEle(event.target) )
            {

                this.target = event.target;
                var target = event.target;
    
                var X = target.offsetLeft;
                var Y = target.offsetTop;                           
                var width = target.offsetWidth;
                var height = target.offsetHeight;    
           
                this.show8els({X:X, Y:Y, width:width, height:height})
            }         
            
        },
        containdragstart: function(event)
        {
           
            //event.preventDefault()
            
            
            if (event.target.className.indexOf(this.draganchorClassName) > -1)
            {  
                //save target position and resize
                this.target.oW = this.target.offsetWidth; //原始宽度
                this.target.oH = this.target.offsetHeight; //原始高度  

                this.target.eventoX = event.pageX
                this.target.eventoY = event.pageY
                this.save8dotsxy()

                event.dataTransfer.setData("dataType","zresize-resize")  
                event.dataTransfer.setData("zresize-resize","")    
                    
            }
            else if (this.isCloneEle(event.target))
            {  
                this.target.oX = this.target.offsetLeft; 
                this.target.oY = this.target.offsetTop; 
                
                this.target.eventoX = event.pageX
                this.target.eventoY = event.pageY

                this.save8dotsxy()
                this.saveselectsxy()

                event.dataTransfer.setData("dataType","zresize-move")  
                event.dataTransfer.setData("zresize-move","")  
           }
            //else if((event.target == this.container)||(this.isBackgroundEle(event.target))){
            else if(event.target == this.container){
                //it is draging the container and to multi select
                this.showMask(event)
                event.dataTransfer.setData("dataType","zresize-multiselect")  
                event.dataTransfer.setData("zresize-multiselect","")
                event.dataTransfer.setDragImage(this.maskdot, 3,3);
  
            }
            else if(event.target.id  == this.toolbarID)
            {
                this.beginMoveToolbar(event)
            }

        },

        beginMoveToolbar(event){
            var toolbar = this.toolbar
            //save current
            toolbar.oX = toolbar.offsetLeft
            toolbar.oY = toolbar.offsetTop
            toolbar.eventoX = event.pageX 
            toolbar.eventoY = event.pageY   

            event.dataTransfer.setData("dataType","zresize-movetoolbar")  
            event.dataTransfer.setData("zresize-movetoolbar","")
            

        },

        showMask(event){
            var mask = this.mask
            //show
            mask.style.display = 'block'
            //init
            mask.style.width = '1px'
            mask.style.height = '1px'

            mask.style.left =  event.offsetX + 'px'
            mask.style.top = event.offsetY + 'px'
           

            //save current
            mask.eventoX = event.pageX 
            mask.eventoY = event.pageY
            mask.oX = event.offsetX
            mask.oY = event.offsetY

            this.maskdot.style.display = 'block'
           
        },

        containdragover(ev)
        {         
          //ev.preventDefault()

          var dataTypes = ev.dataTransfer.types;

          if (dataTypes.includes('zresize-resize')){
            this.resizing(ev);
          }
          else if(dataTypes.includes('zresize-move')){
            this.moving(ev);
          }
          else if(dataTypes.includes('zresize-multiselect')){
            this.multiselecting(ev);
          }
          else if(dataTypes.includes('zresize-movetoolbar')){
            this.movingtoolbar(ev);
          }


        },

        movingtoolbar: function(event)
        {
 
            var self = this
            event.preventDefault()

            
            var toolbar = self.toolbar
            var xMove = event.pageX - toolbar.eventoX
            var yMove = event.pageY - toolbar.eventoY
            
            self.cssmodify2(toolbar,{left:toolbar.oX + xMove, top: toolbar.oY + yMove})

        },


        multiselecting: function(event)
        {
            var self = this
            event.preventDefault()
            
            //变动mask
            var mask = self.mask
            var xMove = event.pageX -  mask.eventoX
            var yMove = event.pageY - mask.eventoY          
            if(xMove < 0){
                mask.style.left = mask.oX + xMove + 'px'
            }
            if(yMove < 0){
                mask.style.top = mask.oY + yMove + 'px'
            }
            //resize
           self.cssmodify2(mask,{width:Math.abs(xMove), height:Math.abs(yMove)})
             
           this.resetSelects();         
           //查找mask覆盖的元素
            var nodes = this.container.childNodes
            var node
             
            for( index in nodes){
                node = nodes[index]
                if(this.isCloneEle(node)){
                    var left = mask.offsetLeft;
                    var right = mask.offsetWidth+left;
                    var top=mask.offsetTop;
                    var bottom=mask.offsetHeight+top;
                    //判断每个块是否被遮罩盖住（即选中）
                    var leftFlag=(node.offsetLeft<=left && (node.offsetLeft + node.offsetWidth) >= left);
                    var rightFlag=((node.offsetLeft + node.offsetWidth) >= right && node.offsetLeft <= right);
                    var xInFlag = (node.offsetLeft >= left && (node.offsetLeft + node.offsetWidth) <= right);
                    var topFlag=(node.offsetTop<=top && (node.offsetTop + node.offsetHeight) >= top);
                    var bottomFlag=((node.offsetTop + node.offsetHeight) >= bottom && node.offsetTop <= bottom);
                    var yInFlag = (node.offsetTop >= top && (node.offsetTop + node.offsetHeight) <= bottom);
                    if((leftFlag || rightFlag || xInFlag) && (topFlag || bottomFlag ||yInFlag )){
                        
                        this.selects.push(node)
                        this.setLookOfSelect(node)
                    }                            
                  
                }
            }
         
        },


        saveselectsxy()
        {
            for(index in this.selects)
            {
                this.selects[index].oX = this.selects[index].offsetLeft
                this.selects[index].oY = this.selects[index].offsetTop
            }
        },
        save8dotsxy()
        {

            this.n.oX =  this.n.offsetLeft
            this.n.oY =  this.n.offsetTop

            this.nw.oX =  this.nw.offsetLeft
            this.nw.oY =  this.nw.offsetTop


            this.ne.oX =  this.ne.offsetLeft
            this.ne.oY =  this.ne.offsetTop


            this.w.oX =  this.w.offsetLeft
            this.w.oY =  this.w.offsetTop


            this.e.oX =  this.e.offsetLeft
            this.e.oY =  this.e.offsetTop

            this.s.oX =  this.s.offsetLeft
            this.s.oY =  this.s.offsetTop


            this.sw.oX =  this.sw.offsetLeft
            this.sw.oY =  this.sw.offsetTop



            this.se.oX =  this.se.offsetLeft
            this.se.oY =  this.se.offsetTop


        },
        moving: function(event)
        {
           event.preventDefault()
            var target = this.target
            
            var xMove = event.pageX - target.eventoX 
            var yMove = event.pageY - target.eventoY
            //move target            
            this.cssmodify2(target,{left:target.oX + xMove, top: target.oY + yMove})

            //move 8 dots
            this.draganchorlists.forEach(function(el,index,array){
                el.style.left = el.oX+ xMove +'px'
                el.style.top = el.oY + yMove + 'px'               
            })

            //move selects
            for(index in this.selects)
            {
                this.selects[index].style.left = this.selects[index].oX + xMove + 'px';
                this.selects[index].style.top = this.selects[index].oY + yMove + 'px';
            }
        },
        resizing: function(event)
        {
            var self = this
            event.preventDefault()

            var target = self.target
            
            var xMove = event.pageX - target.eventoX 
            var yMove = event.pageY -target.eventoY

            //变动所有相关元素
            var targetwidth = target.oW + xMove
            var targetheight = target.oH + yMove
            self.cssmodify2(target,{width:targetwidth, height: targetheight})
            if(target.dataset.width)
            {
                target.dataset.width = targetwidth
                target.dataset.height = targetheight

            }
            if(target.width){
                target.width = targetwidth
                target.height = targetheight
            }

            var x = xMove /2
            var y = 0
            self.cssmodify2(self.n,{left:self.n.oX + x, top:self.n.oY + y})
            var x = xMove
            var y = 0
            self.cssmodify2(self.ne,{left:self.ne.oX + x, top:self.ne.oY + y})
            var x = xMove 
            var y = yMove/2
            self.cssmodify2(self.e,{left:self.e.oX + x, top:self.e.oY + y})
            var x = xMove 
            var y = yMove
            self.cssmodify2(self.se,{left:self.se.oX + x, top:self.se.oY + y})
            var x = xMove /2
            var y = yMove
            self.cssmodify2(self.s,{left:self.s.oX + x, top:self.s.oY + y})
            var x = 0 
            var y = yMove
            self.cssmodify2(self.sw,{left:self.sw.oX + x, top:self.sw.oY + y})
            var x = 0 
            var y = yMove/2
            self.cssmodify2(self.w,{left:self.w.oX + x, top:self.w.oY + y})  

              // target.cursorY = event.pageY
        },

        hide8els: function(){
            //alert("hide")
            this.draganchorlists.forEach(function(el,index,array){
                el.style.display = 'none'
            })
        },

        show8els: function(tjson){
            var self = this

            self.draganchorlists.forEach(function(el,index,array){
                el.style.display = 'block'
            })

            var X = tjson.X;
            var Y = tjson.Y;                           
            var width = tjson.width;
            var height = tjson.height;
                    
            var top = Y;
            var left = (X + width/2); 
            self.cssmodify2(self.n,{ top:top , left : left })
            self.n.oX =  left
            self.n.oY =  top

            top = Y;
            left = X; 
            self.cssmodify2(self.nw,{ top:top , left : left })
            self.nw.oX =  left
            self.nw.oY =  top

            top = Y;
            left = X+ width; 
            self.cssmodify2(self.ne,{ top:top , left : left })
            self.ne.oX =  left
            self.ne.oY =  top


            top = Y + height/2;
            left = X;               
            self.cssmodify2(self.w,{ top:top , left : left })
            self.w.oX =  left
            self.w.oY =  top


            top = Y + height/2;
            left = X + width  
            self.cssmodify2(self.e,{ top:top , left : left })  
            self.e.oX =  left
            self.e.oY =  top        


            top = Y + height;
            left = X + width/2  
            self.cssmodify2(self.s,{ top:top , left : left })
            self.s.oX =  left
            self.s.oY =  top

            top = Y + height;
            left = X
            self.cssmodify2(self.sw,{ top:top , left : left })
            self.sw.oX =  left
            self.sw.oY =  top

            top = Y + height;
            left = X + width
            self.cssmodify2(self.se,{ top:top , left : left })
            self.se.oX =  left
            self.se.oY =  top

        },

        defineachcss: function(){
                var self = this;
                            //添加各自样式
                            self.cssmodify(self.n, {
                                'top': '-4px',
                                'margin-left': '-4px',
                                'left': '50%',
                                'cursor': 'n-resize'
                            });
                            self.cssmodify(self.s, {
                                'bottom': '-4px',
                                'margin-left': '-4px',
                                'left': '50%',
                                'cursor': 's-resize'
                            });
                            self.cssmodify(self.e, {
                                'top': '50%',
                                'margin-top': '-4px',
                                'right': '-4px',
                                'cursor': 'e-resize'
                            });
                            self.cssmodify(self.w, {
                                'top': '50%',
                                'margin-top': '-4px',
                                'left': '-4px',
                                'cursor': 'w-resize'
                            });
                            self.cssmodify(self.ne, {
                                'top': '-4px',
                                'right': '-4px',
                                'cursor': 'ne-resize'
                            });
                            self.cssmodify(self.nw, {
                                top: '-4px',
                                'left': '-4px',
                                'cursor': 'nw-resize'
                            });
                            self.cssmodify(self.se, {
                                'bottom': '-4px',
                                'right': '-4px',
                                'cursor': 'se-resize'
                            });
                            self.cssmodify(self.sw, {
                                'bottom': '-4px',
                                'left': '-4px',
                                'cursor': 'sw-resize'
                            });
            
        },



        cssmodify: function(ele, tjson)
        {
            for(var key in tjson){//遍历json对象的每个key/value对,p为key
                              
                ele.style[key] = tjson[key] 
                //alert("ele.style:" + key+" value:"+ele.style[key])
            }
        },
        //number to string
        cssmodify2: function(ele, tjson)
        {
            for(var key in tjson){//遍历json对象的每个key/value对,p为key
                              
                ele.style[key] = tjson[key] + "px"
                //alert("ele.style:" + key+" value:"+ele.style[key])
            }
        }
 
    }



    window.ZResize = ZResize;

})();