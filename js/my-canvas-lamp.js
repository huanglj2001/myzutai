

class MycanvasLamp{

    constructor( element) {
        this.canvas = element
        this.context = this.canvas.getContext("2d")

        this.color0 = "#ff0000"
        this.color1 = "#00ff00"
        this.color2 = "#999900"
        this.colornull = '#000000'
        }
    draw()
    {
        var canvas = this.canvas
        var context = this.context

        var width = canvas.dataset.width;
        var height = canvas.dataset.height;
        var size = Math.min(width,height)
        
        //canvas.dataset.width = size;
        //canvas.dataset.height = size;
        canvas.style.width =  size + 'px'
        canvas.style.height = size + 'px'
        canvas.width = size
        canvas.height = size

        context.clearRect(0,0,size,size);

        var radial = context.createRadialGradient(0.3*size,0.3*size,0.01*size,0.5*size,0.5*size,0.5*size);
       // radial.addColorStop(0,'#EE84AA');
        //radial.addColorStop(0.9,'#FF0188');
        var value = canvas.dataset.value?canvas.dataset.value:"1";
        //alert("value",value)
       var color;
        switch (value){
            case "0":
                color = this.color0;
                break;
            case "1":
                color = this.color1;
                break;
            case "2":
                color = this.color2;
                break;
            default:
                color = this.colornull
        }
        radial.addColorStop(0,"#ffffff");
        radial.addColorStop(0.9,color);

        radial.addColorStop(1,'rgba(255,1,136,0)');
            
        context.fillStyle = radial;
        context.fillRect(0,0,size,size);
        
    }
    set value(val)
    {
        this.value_ = value
        this.redraw();
    }

    update()
    {
        this.redraw()
    }
    redraw()
    {
        this.draw()
    }

}//class

module.exports = MycanvasLamp
