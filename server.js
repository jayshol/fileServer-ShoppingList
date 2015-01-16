var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring');
var items = [];
var root = __dirname;
var urlObj = {
	"add" : "index.html",
	"delete":"delete.html",
	"update" : "edit.html"
}

//Helper functions
function handleRequest(req, res, action){
	switch(req.method){
		case "GET":	
			if(action == "list"){
				res.write(showItems()); 
				res.end();
			} else {		
				req.url = "/" + urlObj[action];
			}
			break;
		case "POST":
			var item = "";
			req.setEncoding('utf8');
			req.on('data', function(chunk){
				item += chunk;				
			});

			req.on('end', function(){				
				var obj = qs.parse(item);
				var message = "";
				if(action == "add"){
					items.push(obj.item);
					res.write("The item " + obj.item + " has been added\n\n");
					res.end(showItems()); 
				} 
				else {
					var id = parseInt(obj.itemId);
					var itemObj = isValidItem(id);					
					if(itemObj.statusCode == 200){
						if(action == "delete"){																											
							items.splice(id, 1);
							res.write("item deleted\n\n");						
						}
						else if(action == "update"){														
							items[id] = obj.item;
							res.write("Item updated\n\n");
						}
						res.end(showItems());  	
					} else{
						res.statusCode = itemObj.statusCode;
						res.end(itemObj.message);
					}					
				}																		
			});			
			break;
	}
}

function showItems(){
	var itemStr = "";
	if(items.length !== 0){
		itemStr = "Items list : \n";	
		items.forEach(function(item, i){
			itemStr += i + "." + item + "\n";
		});	
	} else{
		itemStr = "Items array is empty."
	}
	
	return itemStr;
}

function isValidItem(index){

	var statusCode = 200,
		message = 'ok';
			 
	if(isNaN(index)){
		statusCode = 400;
		message = 'Item id not valid';
	} else if(!items[index]){
		statusCode = 404;
		message = 'Item not found';
	} 
	return {
		statusCode: statusCode,
		message: message			
	}

}


var server = http.createServer(function(req, res){
	var action = "";
	if(req.url == "/add"){
		action = "add";
	}else if(req.url == "/list"){
		action = "list";
	}else if(req.url == "/delete"){
		action = "delete";
	}else if(req.url == "/update"){
		action = "update";
	}else{
		action = "list";
	}

	handleRequest(req, res, action);

	var url = parse(req.url);
	var path = join(root, url.pathname);
	fs.stat(path, function(err,stat){
		if(err){
			if(err.code === "ENOENT"){
				res.statusCode = 404;
				res.end("file not found");
			}else{
				res.statusCode = 500;
				res.end("Internal server error");
			}
		} else {
			var stream = fs.createReadStream(path);
			//res.setHeader('Content-Length', stat.size);
			stream.pipe(res);
			stream.on('error', function(err){
				res.statusCode = 500;
				res.end('Internal server error')
			});
		}
	}); 
});

server.listen(9000, function(){
	console.log("listening on port 9000.");
});