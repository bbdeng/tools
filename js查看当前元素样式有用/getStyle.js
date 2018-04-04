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