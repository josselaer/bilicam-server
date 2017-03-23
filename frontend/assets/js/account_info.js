

$(document).ready(function() {
	var username = "drbob1"; //need to get this using session

	var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
	theUrl = theUrl + username;
	$.ajax({
        url: theUrl,
        type: "get",
        async: false,
        success: function(data) {

			var accountList = document.getElementById("dr_info_list");
			for (var row in data) {
				var node = document.createElement("li");
				//console.log(data[row]);
				var textNode = document.createTextNode(data[row]);
				node.appendChild(textNode);
				accountList.appendChild(node);
			}
			
        },
      });

});