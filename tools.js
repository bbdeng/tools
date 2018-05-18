var tools = (function () {
    //读取当前样式的方法
    //obj需要获取那个对象
    //name需要获取该对象的样式名字
    function getStyle(obj, name) {
        //获取样式的2种方法
        //1.getComputedStyle(①,②)["样式名"];
        //该方法适用于正常的浏览器并且是window的方法可以直接使用
        //需要2个参数，①为需要获取样式的元素，②可以传递一个伪元素，一般都未null
        //该方法返回一个对象，对象其中包含了当前元素的样式，需要获取那个样式需要在后面添加  .样式名
        //和下面方法的区别：如果元素没有设置默认样式，获取到的是真实的值，而不是默认的样式
        //2.元素.currentStyle.样式名
        //该方法用来读取当前正在显示的样式，注意该方法如果当前元素没有设置样式，则获取他的默认值
        //cunrrentStyle这个方法只有在IE中支持
        var val = null , reg = null ;
        if (window.getComputedStyle) { //这里的window必须写 因为在IE8中没有该对象，未被定义是一个变量，变量没有会报错，属性没有只会返回undefined
            val = getComputedStyle(obj, null)[name]; //这里的.name不行，因为.name表示获取到.name样式，写死了
        } else { //这里是IE6-8
            //对透明度进行特殊处理,IE6-8下透明度是这么设置的filter:alpha(opacity=50);  值在0-100
            if (name === "opacity"){
                val = obj.currentStyle.filter; //"alpha(opacity=50)" 需要对结果进行提取，然后在除去100才和标准浏览器相同
                reg = /^alpha\(opacity=(\d+(?:\.\d+)?)\)$/i;
                val = reg.test(val) ? reg.exec(val)[1]/100 : 1;
            }else {
                val = obj.currentStyle[name];
            }
        }
        reg = /^(-?\d+(\.\d+)?)(px|pt|rem|em)?$/i;//去除单位的正则
        return reg.test(val) ? parseFloat(val) :val ;
    };

    //写一个方法来操作
    //兼容各浏览器，获取浏览器本身的盒子模型
    //传入第1个参数表示获取，2个参数同时传入表示设置
    function win(attr,value) {
        if (typeof value === "undefined"){//没有传递value值,表示获取
            return document.documentElement[attr]||document.body[attr];
        }
        //设置
        document.documentElement[attr] = value;
        document.body[attr] = value;
    }

    //写一个offset方法来获取页面任意元素相对页面的水平偏移和垂直偏移
    function offset(currentElement) {
        if (typeof currentElement === "undefined") {
            console.log("offset必须输入参数!");
            return;
        }
        var totalLeft = null , totalTop = null , parent = currentElement.offsetParent;
        //首先把自己本身的偏移量进行加
        totalLeft += currentElement.offsetLeft;
        totalTop += currentElement.offsetTop;
        while (parent){//只要没有找到body，我们就把父级参照物的边框和偏移也进行叠加
            if (navigator.userAgent.indexOf("MSIE 8.0") === -1){//不是标准的IE8浏览器，才进行累加，IE8本身已经算了
                //加父级元素的边框
                totalLeft += parent.clientLeft ;
                totalTop += parent.clientTop;
            }
            //加父级元素的偏移
            totalLeft += parent.offsetLeft;
            totalTop += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return {left:totalLeft,top:totalTop};
    }

    //多事件的绑定
    function bind(obj , eventStr , callback){
        if(obj.addEventListener){
            //大部分浏览器兼容的方式
            obj.addEventListener(eventStr , callback , false);
        }else{
            /*
             * this是谁由调用方式决定
             * callback.call(obj)
             */
            //IE8及以下
            obj.attachEvent("on"+eventStr , function(){
                //在匿名函数中调用回调函数
                callback.call(obj);
            });
        }
    }

    //写一个兼容各个浏览器的创建ajax对象的方法
    function createXHR() {
        var xhr = null;
        var ary = [
            function () {
                return new XMLHttpRequest();
            },
            function () {
                return new ActiveXObject("Microsoft.XMLHTTP");
            },
            function () {
                return new ActiveXObject("Msxml1.XMLHTTP");
            },
            function () {
                return new ActiveXObject("Msxml3.XMLHTTP");
            }
        ];
        var flag = false; //定义一个flag标识默认改方法中没有可以兼容您浏览器的方法
        for (var i=0,len = ary.length; i<len ; i++){
            var curFn = ary[i];
            try {
                xhr = curFn();
                //本次循环获取的方法执行没有出现错误：说明该方法就是我们想要的方法，我们在下一次直接执行这个小方法即可，需要从新把createXHR重写成改循环下的方法，然后直接退出循环
                createXHR = curFn;
                flag = true; //找到了改方法将flag标识改为true。标识所写函数中有方法可以创建ajax对象来兼容您的浏览器
                break; //找到该方法后结束这个循环
            }catch (e){
                //这里面标识上面的方法报错会进入这里，不写东西 直接执行下一次循环
            }
        }
        if (!flag){
            //如果循环了上面所有的方法都报错，只能没有说明该方法中没有可以兼容您的浏览器，抛出一个错误
            throw new Error ("your browser is not support ajax,please change your browser , try again!");
        }

        return xhr;
    }

    return {
        getStyle:getStyle,
        win:win,
        offset:offset,
        bind:bind,
        createXHR:createXHR
    };

})();



//创建一个执行简单动画的函数F
//obj定义需要执行动画的对象
//attr要执行动画的样式,比如:height top let width
//target为元素需要移动的位置
//speed动画移动的速度 填写正值即可
//callback回调函数
function move(obj, attr, target, speed, callback) {
    //每次单击触发动画都关闭一次计时器，不让计时器重叠加速
    clearInterval(obj.timer);
    //通过原始元素的位置和目标位置相比较，判断出speed的值是正值还是负值
    //如果原始的位置在目标位置的左侧，这speed应该为正值不进行改变；反则speed应该变成负值
    var current = parseInt(getStyle(obj, attr));
    if (current > target) {
        speed = -speed;
    }
    ;
    //开启定时器来执行动画效果
    //取消掉全局定义变量timer，将定时器变成obj的属性保存，解决各元素定时器冲突问题
    obj.timer = setInterval(function () {
        //获取box的原来的left值
        var oldValue = parseInt(getStyle(obj, attr));
        //修改后的left新值
        var newValue = oldValue + speed;
        if (speed > 0 && newValue > target || speed < 0 && newValue < target) {
            newValue = target;
        }
        ;
        obj.style[attr] = newValue + "px";
        //当元素移动到800px的时候让他停止
        if (newValue == target) {
            clearInterval(obj.timer);
            //在动画执行结束后来个回调函数，改变后续的动画效果
            callback && callback();
        }
        ;
    }, 30);
};


//定义一个函数，用来向一个元素中添加指定的class属性
//obj要添加class属性的元素
//cn要添加的class属性值
function addClass(obj, cn) {
    //这里需要判断其中有没有cn，如果不判断每次点击都会加一个cn
    if (!hasClass(obj, cn)) {
        obj.className += " " + cn;
    }
}

//定义一个函数用来判断元素中是否含有指定的class值，如果有则返回true，如果没有则返回false
function hasClass(obj, cn) {
    var reg = new RegExp("\\b" + cn + "\\b");
    return reg.test(obj.className);
}

//定义一个函数用来删除元素中指定的class属性
function removeClass(obj, cn) {
    //创建一个正则表达式
    var reg = new RegExp("\\b" + cn + "\\b");
    //replace(①，②);
    //			- 可以将字符串中指定内容替换为新的内容
    //	- 参数：
    //		- ①第一个：被替换的内容，可以是一个正则表达式
    //		- ②第二个：替换的新内容
    obj.className = obj.className.replace(reg, "");
}

//再创建一个函数用来切换一个类
//如果元素中具有该类，则删除； 如果元素中没有该类，则添加.
function toggleClass(obj, cn) {
    if (hasClass(obj, cn)) {
        removeClass(obj, cn);
    } else {
        addClass(obj, cn);
    }
}


String.prototype.myDate = function (dateStr) {
    //this为str，需要修改的字符串
    //将一个字符串格式的时间，转换成一个数组
    var reg1 = /^(\d{4})[-.:/](\d{1,2})[-.:/](\d{1,2})\s(\d{1,2})[-.:/](\d{1,2})[-.:/](\d{1,2})$/;
    var arr = [];
    this.replace(reg1, function () {
        // console.log(arguments);
        arr = [].slice.call(arguments, 1, 7);
        // console.log(arr);

    });
    //将一个数组，替换成对应格式的时间
    var reg2 = /{(\d+)}/g;
    var newDate = dateStr.replace(reg2, function () {
        var val = arguments[1];
        arr[val].length === 1 ? arr[val] = "0" + arr[val] : arr[val];
        return arr[val];
    });

    return newDate;
};


//创建一个类数组的方法,但是可以直接利用数组的方法
//不传入参数其实就是创建一个空对象，该空对象在数组的原型链上
//传入参数表示按照索引开始设置属性值
function CreateLikeArray() {

    for (var i = 0; i < arguments.length; i++) {
        this[i] = arguments[i];
    }
    this.length = arguments.length;

}
CreateLikeArray.prototype = new Array;
CreateLikeArray.prototype.constructor = CreateLikeArray;









