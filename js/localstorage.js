 //设置当前登录用户
function setTheUser(user){
	localStorage.setItem("user",JSON.stringify(user))
}
//删除（取消设置）当前登录用户
function delTheUser(){
	localStorage.removeItem("user");
}
//返回当前登录的用户
function getTheUser(){
	try{
		return JSON.parse(localStorage.getItem("user"));
	}catch(e){
		return null;
	}
}
/*仅用于登录的时候记录上次选中的用户，该用户未必是登录用户。*/
function getLastUser(){
	try{
		var usr = JSON.parse(localStorage.getItem("lastuser"));
		if(!usr){
			usr = JSON.parse(localStorage.getItem("users"))[0];
		}
		return usr;
	}catch(e){
		return null;
	}
}
//设置上次选中用户
function setLastUser(user){
	localStorage.setItem("lastuser",JSON.stringify(user))
}

var gUsers = null;
//返回所有用户
getAllUsers = function(){
	if(null == gUsers){
		gUsers = JSON.parse(localStorage.getItem("users"));
	}
	return gUsers;
}
//返回所有没被禁用的用户
getUsers = function(){
	var users = [];
	each(getAllUsers(),function(n,user){
		if(!user.ban){
			users.push(user);
		}
	});
	return users;1
}
//根据id返回指定用户
getUser=function(id){
	var users = getAllUsers();
	if(null == users){
		return null;
	}
	for(var i = 0;i<users.length;i++){
		if(users[i]._id == id){
			return users[i];
		}
	}
	return null;
}