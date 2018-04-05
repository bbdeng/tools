//读取当前样式的方法
//obj需要获取那个对象
//name需要获取该对象的样式名字		
function getStyle(obj,name){
	//获取样式的2种方法
	//1.getComputedStyle(①,②)["样式名"];
	//该方法适用于正常的浏览器并且是window的方法可以直接使用
	//需要2个参数，①为需要获取样式的元素，②可以传递一个伪元素，一般都未null
	//该方法返回一个对象，对象其中包含了当前元素的样式，需要获取那个样式需要在后面添加  .样式名
	//和下面方法的区别：如果元素没有设置默认样式，获取到的是真实的值，而不是默认的样式
	//2.元素.currentStyle.样式名
	//该方法用来读取当前正在显示的样式，注意该方法如果当前元素没有设置样式，则获取他的默认值
	//cunrrentStyle这个方法只有在IE中支持
	if (window.getComputedStyle){ //这里的window必须写 因为在IE8中没有该对象，未被定义是一个变量，变量没有会报错，属性没有只会返回undefined
		return getComputedStyle(obj,null)[name]; //这里的.name不行，因为.name表示获取到.name样式，写死了
	}else{
		return obj.currentStyle[name];
	};
};




//创建一个执行简单动画的函数F
//obj定义需要执行动画的对象
//attr要执行动画的样式,比如:height top let width
//target为元素需要移动的位置
//speed动画移动的速度 填写正值即可
//callback回调函数
function move(obj,attr,target,speed,callback){			
	//每次单击触发动画都关闭一次计时器，不让计时器重叠加速
	clearInterval(obj.timer);
	//通过原始元素的位置和目标位置相比较，判断出speed的值是正值还是负值
	//如果原始的位置在目标位置的左侧，这speed应该为正值不进行改变；反则speed应该变成负值
	var current=parseInt(getStyle(obj,attr));
	if (current>target){
		speed = -speed;
	};
	//开启定时器来执行动画效果
	//取消掉全局定义变量timer，将定时器变成obj的属性保存，解决各元素定时器冲突问题
	obj.timer=setInterval(function(){
		//获取box的原来的left值
		var oldValue=parseInt(getStyle(obj,attr));
		//修改后的left新值
		var newValue=oldValue+speed;				
		if(speed>0&&newValue>target ||speed<0 && newValue<target){
			newValue=target;
		};
		obj.style[attr]=newValue+"px";
		//当元素移动到800px的时候让他停止
		if(newValue==target){
			clearInterval(obj.timer);
			//在动画执行结束后来个回调函数，改变后续的动画效果
			callback && callback();
		};								
	},30);
};



//定义一个函数，用来向一个元素中添加指定的class属性
//obj要添加class属性的元素
//cn要添加的class属性值
function addClass(obj , cn){
	//这里需要判断其中有没有cn，如果不判断每次点击都会加一个cn
	if (!hasClass(obj,cn)){
		obj.className += " "+cn;
	}	
}

//定义一个函数用来判断元素中是否含有指定的class值，如果有则返回true，如果没有则返回false
function hasClass(obj ,cn ){
	var reg = new RegExp ("\\b"+cn+"\\b");
	return reg.test(obj.className);
}

//定义一个函数用来删除元素中指定的class属性
function removeClass(obj,cn){
	//创建一个正则表达式
	var reg = new RegExp ("\\b"+cn+"\\b");
	//replace(①，②);
	//			- 可以将字符串中指定内容替换为新的内容
	//	- 参数：
	//		- ①第一个：被替换的内容，可以是一个正则表达式
	//		- ②第二个：替换的新内容
	obj.className=obj.className.replace(reg,"");
}

//再创建一个函数用来切换一个类
//如果元素中具有该类，则删除； 如果元素中没有该类，则添加.
function toggleClass (obj ,cn){
	if (hasClass(obj,cn)){
		removeClass(obj,cn);
	}else{
		addClass(obj,cn);
	}
}