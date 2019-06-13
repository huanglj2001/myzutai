const MycanvasLamp = require('./my-canvas-lamp.js')

class MyObserver{

    constructor( tagName, type) {

        /**
         * Name of an element to lookup/observe
         *
         * @type {string}
         */
        this.tagName = tagName.toLowerCase();

        this.type = MyObserver.toDashed(type)  //'myshape' 'myshape-xx'
        
        //this.Type = ns[type];
        this.Type = MycanvasLamp;//todo

  

        /**
         * Signals if mutations observer for this type or not
         *
         * @type {boolean}
         */
        this.mutationsObserved = false;

        /**
         * Flag specifies whenever the browser supports observing
         * of DOM tree mutations or not
         *
         * @type {boolean}
         */
        this.isObservable = !!window.MutationObserver;

        /* istanbul ignore next: this should be tested with end-to-end tests */
        if (!window.GAUGES_NO_AUTO_INIT) {
           // myobserver.domReady(this.traverse.bind(this));
            window.addEventListener('DOMContentLoaded', this.traverse.bind(this), false); //only once happen for DOMContentLoaded

        }
    }
    static toDashed(camelCase) {
        let arr = camelCase.split(/(?=[A-Z])/);
        let i = 1;
        let s = arr.length;
        let str = arr[0].toLowerCase();

        for (; i < s; i++) {
            str += '-' + arr[i].toLowerCase();
        }

        return str;
    }
traverse() {
    let elements = document.getElementsByTagName(this.tagName);
    let i = 0, s = elements.length;

    //aboserve special element
    /* istanbul ignore next: this should be tested with end-to-end tests */
    for (; i < s; i++) {
        console.log('traverse', elements[i].tagName,elements[i].id)
        this.process(elements[i]);
        //alert("traverse,process")
       
    }
   //observe document.body
    if (this.isObservable && !this.mutationsObserved) {
        new MutationObserver(this.observe.bind(this))
            .observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true,
                attributeOldValue: true,
                characterDataOldValue: true
            });

        this.mutationsObserved = true;
    }
}
    /**
     * Observes given mutation records for an elements to process
     *
     * @param {MutationRecord[]} records
     */
    observe(records) {
        let i = 0;
        let s = records.length;

        /* istanbul ignore next: this should be tested with end-to-end tests */
        for (; i < s; i++) {
            let record = records[i];

            if (record.type === 'attributes' &&
                record.attributeName === 'data-type' &&
                this.isValidNode(record.target) &&
                record.oldValue !== this.type) // skip false-positive mutations
            {
                setTimeout(this.process.bind(this, record.target));
            }

            else if (record.addedNodes && record.addedNodes.length) {
                let ii = 0;
                let ss = record.addedNodes.length;

                for (; ii < ss; ii++) {
                    setTimeout(this.process.bind(this, record.addedNodes[ii]));
                    //alert("observe,addedNodes") 加入一个大的DIV，该DIV下包含要监控的元素时，监控失败，只监控到这个大DIV
                }
            }
        }
    }

    /**
     * Processes a given node, instantiating a proper type constructor for it
     *
     * @param {Node|HTMLElement} node
     * @returns {GaugeInterface|null}
     */
    process(node) {
        
        if (!this.isValidNode(node)) return null;
        //alert("process,instance")
        /*
        let prop;
        let options = JSON.parse(JSON.stringify(this.options));*/
        let instance = null;

       /* for (prop in options) {
            // istanbul ignore else: non-testable in most cases 
            if (options.hasOwnProperty(prop)) {
                let attributeName = DomObserver.toAttributeName(prop);
                let attributeValue = DomObserver.parse(
                    node.getAttribute(attributeName));

                if (attributeValue !== null && attributeValue !== undefined) {
                    options[prop] = attributeValue;
                }
            }
        }

        options.renderTo = node;*/
        //instance = new (this.Type)(options);
      
        instance = new (this.Type)(node)
        //instance.draw && instance.draw();
       
        if (!this.isObservable) return instance;
        //alert("begin process")
        instance.observer = new MutationObserver(records => {
            var needredraw = false;
            records.forEach(record => {
                if (record.type === 'attributes') {
                    let attr = record.attributeName.toLowerCase();
                    let type = node.getAttribute(attr).toLowerCase();

                    if (attr === 'data-type' && type && type !== this.type) {
                        instance.observer.disconnect();
                        delete instance.observer;
                        instance.destroy && instance.destroy();
                    }

                    else if (attr.substr(0, 5) === 'data-') {
                        let prop = attr.substr(5).split('-').map((part, i) => {
                            return !i ? part :
                            part.charAt(0).toUpperCase() + part.substr(1);
                        }).join('');
                        let options = {};

                        options[prop] = MyObserver.parse(
                            node.getAttribute(record.attributeName));


                        if (prop === 'value') {
                           //instance && (instance.value = options[prop]);
                           needredraw = true;
                        }

                        else {
                           needredraw = true;
                        }
                    }
                }
            }); //for each
            if(needredraw)
            {
                instance.redraw()
            }
        } //callback
        );

        //noinspection JSCheckFunctionSignatures
        instance.observer.observe(node, { attributes: true });
        node.dataset.width=node.dataset.width//todo
        
        return instance;
    }

    static parse(value) {
        // parse boolean
        if (value === 'true') return true;
        if (value === 'false') return false;

        // parse undefined
        if (value === 'undefined') return undefined;

        // parse null
        if (value === 'null') return null;

        // Comma-separated strings to array parsing.
        // It won't match strings which contains non alphanumeric characters to
        // prevent strings like 'rgba(0,0,0,0)' or JSON-like from being parsed.
        // Typically it simply allows easily declare arrays as comma-separated
        // numbers or plain strings. If something more complicated is
        // required it can be declared using JSON format syntax
        if (/^[-+#.\w\d\s]+(?:,[-+#.\w\d\s]*)+$/.test(value)) {
            return value.split(',');
        }

        // parse JSON
        try { return JSON.parse(value); } catch(e) {}

        // plain value - no need to parse
        return value;
    }
    isValidNode(node) {
        //noinspection JSUnresolvedVariable
        if(node.tagName.toLowerCase() !=="canvas")
        {return false;}
       // alert("node.tagName:"+node.tagName+";this.tagname:"+this.tagName+";this.type="+this.type+";data-type="+node.getAttribute('data-type'))
        return !!(
            node.tagName &&
            node.tagName.toLowerCase() === this.tagName &&
            node.getAttribute('data-type')&&
            node.getAttribute('data-type') === this.type
        );
    }
}//class

new MyObserver('canvas','mycanvas-lamp');