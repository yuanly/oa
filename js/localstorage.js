 
function setTheUser(user){
	localStorage.setItem("user",JSON.stringify(user))
}
function delTheUser(){
	localStorage.removeItem("user");
}

function getTheUser(){
	try{
		return JSON.parse(localStorage.getItem("user"));
	}catch(e){
		return null;
	}
}
/*�����ڵ�¼��ʱ���¼�ϴ�ѡ�е��û������û�δ���ǵ�¼�û���*/
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
function setLastUser(user){
	localStorage.setItem("lastuser",JSON.stringify(user))
}

var gUsers = null;
getUser=function(id){
	if(null == gUsers){
		gUsers = JSON.parse(localStorage.getItem("users"));
	}
	for(var i = 0;i<gUsers.length;i++){
		if(gUsers[i]._id == id){
			return gUsers[i];
		}
	}
	return null;
}