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
//返回最近访问客户
function getKehus(){
		try{
		return JSON.parse(localStorage.getItem("kehus"));
	}catch(e){
		return [];
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
	if(id){
		return {_id:id,user_name:id,mingchen:id,photo:getDocRoot()+"logo/noface.jpg"}
	}
	return null;
}
getUserName = function(id){
	if(!id){
		return "";
	}
	var user = getUser(id);
	if(user){
		return user.user_name;
	}else{
		var ret = "";
		postJsonSync("../contact/contacts.php",{_id:id},function(lxr){//离职员工
			ret = lxr.mingchen;
			var user = {_id:id,mingchen:lxr.mingchen,role:"operator",user_name:ret};
			if(!isNaN(lxr.photo)){
				user.photo = getImgUrl(lxr.photo);
			}else if(!lxr.photo){
				user.photo="../logo/noface.jpg";
			}else{
				user.photo = "/oa/logo/"+lxr.photo;
			}
			var users = getAllUsers();
			users.push(user);
			localStorage.setItem("users",JSON.stringify(users));
		});
		return ret;
	}
}
function getUserIdByName(name){
	//考虑到离职的员工，已经不在用户列表中，提供一个处理后门：即直接输入联系人id进行查询。
	if(name.trim().indexOf("LXR") == 0){
		return name;
	}
	var users = getAllUsers();
	if(null == users){
		return undefined;
	}
	for(var i = 0;i<users.length;i++){
		if(users[i].user_name == name){
			return users[i]._id;
		}
	}
	return undefined;
}