 //���õ�ǰ��¼�û�
function setTheUser(user){
	localStorage.setItem("user",JSON.stringify(user))
}
//ɾ����ȡ�����ã���ǰ��¼�û�
function delTheUser(){
	localStorage.removeItem("user");
}
//���ص�ǰ��¼���û�
function getTheUser(){
	try{
		return JSON.parse(localStorage.getItem("user"));
	}catch(e){
		return null;
	}
}
//����������ʿͻ�
function getKehus(){
		try{
		return JSON.parse(localStorage.getItem("kehus"));
	}catch(e){
		return [];
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
//�����ϴ�ѡ���û�
function setLastUser(user){
	localStorage.setItem("lastuser",JSON.stringify(user))
}

var gUsers = null;
//���������û�
getAllUsers = function(){
	if(null == gUsers){
		gUsers = JSON.parse(localStorage.getItem("users"));
	}
	return gUsers;
}
//��������û�����õ��û�
getUsers = function(){
	var users = [];
	each(getAllUsers(),function(n,user){
		if(!user.ban){
			users.push(user);
		}
	});
	return users;1
}
//����id����ָ���û�
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
		postJsonSync("../contact/contacts.php",{_id:id},function(lxr){//��ְԱ��
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
	//���ǵ���ְ��Ա�����Ѿ������û��б��У��ṩһ��������ţ���ֱ��������ϵ��id���в�ѯ��
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