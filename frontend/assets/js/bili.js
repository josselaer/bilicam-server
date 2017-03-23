//http://private-ca334-bilicam.apiary-mock.com
//link table to account info page
//create cookie to pass username 

//install filesaver.js
//npm install file-saver --save
//bower install file-saver
/*function make_csv(data) {

  var theUrl = 'https://private-ca334-bilicam.apiary-mock.com/patient/csv/'

  theUrl += data;

  $.ajax({
        url: theUrl,
        type: "get",
        async: false,
        success: function(data) {
          console.log(data);
          var csv_info = data['csv'];
          var filename = "patient_table.txt";

          download_csv(filename, csv_info);

        },
        error: function() {
          console.log(theUrl);
        }
      });
}

function download_csv(filename, text) {
  
  

}*/

function fill_table(data) {

  var id_val = data["ID"];
  var firstName = data["FirstName"];
  var lastName = data["LastName"];
  var bili1 = data["BilirubinValue1"];
  var bili2 = data["BilirubinValue2"];

  $("#table_id_number").html(id_val);
  $("#table_first_name").html(firstName);
  $("#table_last_name").html(lastName);
  $("#table_bili_range").html(bili1 + " - " + bili2);

  $("#results_table").css("display", "block");
  //$("table_ethnicity").val(id_val);

}

function edit_user() {
  var formData = $("#edit_user_form").serializeArray();
  var username = "drbob01"; //need to use cookies to get username
    /*[{name: "username", value: "asdf"}, 
    {name: "name", value: "jake"}, 
    {name: "hospital_name", value: "nkfla"}, 
    {name: "hospital_address", value: "nksfdlj"}, 
    {name: "hospital_city", value: "kljadfsj"}] (6)*/

    var request_data = {};
    if(formData[0].value != "") {
      request_data['username'] = formData[0].value;
    }
    if(formData[1].value != "") {
      request_data['name'] = formData[1].value;
    }
    if(formData[2].value != "") {
      request_data['hospital_name'] = formData[2].value;
    }
    if(formData[3].value != "") {
      request_data['hospital_address'] = formData[3].value;
    }
    if(formData[4].value != "") {
      request_data['hospital_city'] = formData[4].value;
    }

    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
    theUrl += username;

    $.ajax({
      url : theUrl,
      type: "put",
      request : request_data,
      success: function(data)
      {
        alert("Edited user " + username);
        location.reload();
      },
    });
}

function change_password() {
  var formData = $("#change_password_form").serializeArray();
  var username = "drbob01";
  var request_data = {};
  if(formData[0].value != formData[1].value) {
    alert('Passwords do not match');
  }
  else {
    request_data['password'] = formData[0].value;

    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
    theUrl += username;

    $.ajax({
      url : theUrl,
      type: "put",
      request : request_data,
      success: function(data)
      {
        alert("Edited user " + username);
        location.reload();
      },
    });

  }

}

function show_change_password() {
  $("#change_password_div").css("display", "block");
}

function hide_change_password() {
  $("#change_password_div").css("display", "none");
}


function search_patient() {
    var formData = $("#search_form").serializeArray();
    /* 6
    [{name: "Search By", value: "ethnicity"}, 
    {name: "ID", value: ""}, 
    {name: "first_name", value: ""}, 
    {name: "last_name", value: ""}, 
    {name: "first_number", value: ""}, 
    {name: "second_number", value: ""}]
    */
    /* 7 with one check
    [{name: "Search By", value: "ethnicity"}, 
    {name: "ID", value: ""}, 
    {name: "first_name", value: ""}, 
    {name: "last_name", value: ""}, 
    {name: "first_number", value: ""}, 
    {name: "second_number", value: ""}, 
    {name: "eWhite", value: "on"}]
    */
    var search_type = formData[0].value;
    if(search_type == "bilirubin") {
      search_by_bili(formData);
    }
    else if(search_type == "ethnicity") {
      search_by_ethnicity(formData);
    }
    else if(search_type == "by_id") {
      search_by_id(formData);
    }
    else if(search_type == "by_name") {
      search_by_name(formData);
    }
    else if(search_type == "by_date") {
      search_by_date(formData);
    }

}

  function search_by_bili(formData) {
    var theUrl="http://private-ca334-bilicam.apiary-mock.com/patient/bili/";
    var num1 = parseFloat(formData[4].value);
    var num2 = parseFloat(formData[5].value);
    theUrl += num1 + "/" + num2;

    if(isNaN(num1) || isNaN(num2)) {
      alert("Must enter a number value");
    }
    else {
      $.ajax({
        url: theUrl,
        type: "get",
        async: false,
        success: function(data) {
          alert("There are " + data.length + " results. Click download to download .csv file");
          console.log(data);
        },
        error: function() {
          console.log(theUrl);
        }
      });

    }

  }

  function search_by_name(formData) {
    var theUrl = "http://private-ca334-bilicam.apiary-mock.com/patient/name/";
    var firstName = formData[2].value;
    var lastName = formData[3].value;
    theUrl += firstName + "/" + lastName;

    $.ajax({
      url: theUrl,
      type: "get",
      async: false,
      success: function(data) {
        fill_table(data);
        //console.log(data);
      }
    });
  }

  function search_by_id(formData) {
  var theUrl = "https://private-ca334-bilicam.apiary-mock.com/patient/id/";
    var idNum = formData[1].value;
    theUrl += idNum;

    $.ajax({
      url: theUrl,
      type: "get",
      async: false,
      success: function(data) {
        fill_table(data);
        //console.log(data);
      }
    });

  }

  function search_by_ethnicity(formData) {
    var form_size = formData.length;

    if(form_size <= 6) {
      alert("Pick at least one ethnicity");
    }
    else {
      var theUrl = "http://private-ca334-bilicam.apiary-mock.com/patient/ethnicity/";

      var ethnicities = [];
      var ethnicity = "";
      for(i = 6; i < form_size; i++) {
        ethnicity = formData[i].name;
        ethnicities.push(ethnicity);
        theUrl += ethnicity + "_";
      }

      $.ajax({
        url: theUrl,
        type: "get",
        async: false,
        success: function(data) {
          alert("There are " + data.length + " results. Click download to download .csv file");
          console.log(data);
        }
      });


    }

  }

  function search_by_date(formData) {

    var date1 = formData[formData.length-2].value;
    var date2 = formData[formData.length-1].value;
    date1 = date1.replace(/\//g,'-');
    date2 = date2.replace(/\//g,'-');
    var theUrl = 'https://private-ca334-bilicam.apiary-mock.com/patient/date/'

    theUrl += date1 + "/" + date2;

    $.ajax({
        url: theUrl,
        type: "get",
        async: false,
        success: function(data) {
          alert("There are " + data.length + " results. Click download to download .csv file");
          console.log(data);
        }
      });

  }
  

  function login() {
    var theUrl = "http://private-ca334-bilicam.apiary-mock.com/login";
    $.ajax({
        url: theUrl,
        type: "post",
        async: false,
        success: function(data) {
          alert("You are now login");
          window.location.href = "index.html";

        }
      });
  }

	$('#search_by').on('change', function() {
    $("#results_table").css("display", "none");
  	  curr_value = this.value;
  		//bilirubin, ethnicity, by_id, by_name
  		//bili_search, ethnicity_search, id_search, name_search
  		if(curr_value == "bilirubin") {
  			$("#bili_search").css("display", "block");
  		}
  		else {
  			$("#bili_search").css("display", "none");
  		}

  		if(curr_value == "ethnicity") {
  			$("#ethnicity_search").css("display", "block");
  		}
  		else {
  			$("#ethnicity_search").css("display", "none");
  		}

  		if(curr_value == "by_id") {
  			$("#id_search").css("display", "block");
  		}
  		else {
  			$("#id_search").css("display", "none");
  		}

  		if(curr_value == "by_name") {
  			$("#name_search").css("display", "block");
  		}
  		else {
  			$("#name_search").css("display", "none");
  		}

      if(curr_value == "by_date") {
        $("#date_search").css("display", "block");
      }
      else {
        $("#date_search").css("display", "none");
      }
	});


//admin funcitons

  $('#admin_search_by').on('change', function() {
    $("#dr_results_table").css("display", "none");
      curr_value = this.value;

      if(curr_value == "by_user") {
        $("#user_search").css("display", "block");
      }
      else {
        $("#user_search").css("display", "none");
      }

      if(curr_value == "by_name") {
        $("#name_search").css("display", "block");
      }
      else {
        $("#name_search").css("display", "none");
      }
  });

  function search_doctor() {
    admin_clear_table();

    var formData = $("#search_form").serializeArray();
    var search_type = formData[0].value;
    if(search_type == "by_user") {
      admin_search_by_user(formData);
    }
    else if(search_type == "by_name") {
      admin_search_by_name(formData);
    }
  }

  function admin_search_by_user(formData) {
    //acount/{username}
    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
    var dr_username = formData[1].value;
    theUrl += dr_username;
    $.ajax({
      url: theUrl,
      type: "get",
      async: false,
      success: function(data) {
        admin_create_table(data,0);
        //console.log(data);
      }
    });

  }

  function admin_search_by_name(formData) {
    //account/name/{last_name}
    //http://private-ca334-bilicam.apiary-mock.com
    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/name/";
    var dr_name = formData[2].value;
    theUrl = theUrl + dr_name;
    $.ajax({
      url: theUrl,
      type: "get",
      async: false,
      success: function(data) {
        admin_create_table(data,1);
        //console.log(data);
      }
    });

  }

  function admin_create_user() {
    var formData = $("#create_user_form").serializeArray();
    var username = formData[0].value;
    var password = formData[1].value;
    var name = formData[2].value;
    var hospital = formData[3].value;
    var hospitalAddress = formData[4].value;
    var city = formData[5].value;
    var postForm = {};
    postForm["username"] = username;
    postForm["password"] = password;
    postForm["name"] = name;
    postForm["hospital"] = hospital;
    postForm["hospitalAddress"] = hospitalAddress;
    postForm["city"] = city;
    console.log(postForm);

    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account";

    $.ajax({
      url : theUrl,
      type: "POST",
      body : formData,
      success: function(data)
      {
        alert("Create user " + username);
      },
    });

  }

  function admin_create_table(data, is_array) {
    //use cookies to pass username when user is selected
    /*
      table format: username, name, select button
      or make select button the whole table row 
      http://stackoverflow.com/questions/17147821/how-to-make-a-whole-row-in-a-table-clickable-as-a-link
    */
    //{username: "drbob01", name: "Dr. Bob Kelso", hospital: "Sacred Heart", hospitalAddress: "123 N. Hos Lane", city: "Dallas, TX"}
    console.log(data);
    if(is_array == 1) { //search by name
      for(var i = 0; i < data.length; i++) {
        add_table_row(data[i]);
      }
    }
    else { //search by user
      add_table_row(data);
    }
      $("#dr_results_table").css("display", "block");



  }

  function add_table_row(data) {
    var dr_table = document.getElementById("dr_results_body");

    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');


    var dr_username = data['username'];
    var dr_name = data['name'];

    var createClickHandler = 
            function(temp) 
            {
                return function() { 
                                        var dr_username = temp; //need to use cookie here
                                        console.log(dr_username);
                                        window.location.href = "admin_account_info.html";
                                 };
            };

    tr.onclick = createClickHandler(dr_username);

    var text1 = document.createTextNode(dr_username);
    var text2 = document.createTextNode(dr_name);

    td1.appendChild(text1);
    td2.appendChild(text2);
    tr.appendChild(td1);
    tr.appendChild(td2);
    dr_table.appendChild(tr);

    /*var tr = document.createElement('tr');   

    var td1 = document.createElement('td');
    var td2 = document.createElement('td');

    var text1 = document.createTextNode('Text1');
    var text2 = document.createTextNode('Text2');

    td1.appendChild(text1);
    td2.appendChild(text2);
    tr.appendChild(td1);
    tr.appendChild(td2);

    table.appendChild(tr);*/
  }


  function admin_login() {

  }

  function admin_clear_table() {
    
    $("#dr_results_body tr").remove();

  }

  function admin_show_edit_info() {
    $("#edit_user_div").css("display", "block");
  }

  function admin_hide_edit_info() {
    $("#edit_user_div").css("display", "none");
  }

  function admin_edit_user() {

    var formData = $("#edit_user_form").serializeArray();
    var username = "drbob01"; //need to use cookies to get username

    var request_data = {};
    if(formData[0].value != "") {
      request_data['username'] = formData[0].value;
    }
    if(formData[1].value != "") {
      request_data['password'] = formData[1].value;
    }
    if(formData[2].value != "") {
      request_data['name'] = formData[2].value;
    }
    if(formData[3].value != "") {
      request_data['hospital_name'] = formData[3].value;
    }
    if(formData[4].value != "") {
      request_data['hospital_address'] = formData[4].value;
    }
    if(formData[5].value != "") {
      request_data['hospital_city'] = formData[5].value;
    }

    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
    theUrl += username;

    $.ajax({
      url : theUrl,
      type: "put",
      request : request_data,
      success: function(data)
      {
        alert("Edited user " + username);
        location.reload();
      },
    });

  }

  function admin_delete_user() { //probably needs some kind of extra authorization
    var username = "drbob01";

    var theUrl = "https://private-ca334-bilicam.apiary-mock.com/account/";
    theUrl += username;

    request_data = {};
    request_data['username'] = "admin";
    request_data['password'] = "password";

    /*
    $.ajax({
      url : theUrl,
      type: "delete",
      request: request_data,
      success: function(data)
      {
        alert("Deleted user " + username);
        location.reload(); //send to homepage
      },
    });*/
  }


