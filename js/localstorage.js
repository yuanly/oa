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
	return null;
}