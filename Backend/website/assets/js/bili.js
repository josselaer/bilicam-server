//http://private-ca334-bilicam.apiary-mock.com

function download_csv(data) {
  //var filename = "../" + data;
  //"csv_download/filename.csv"
  var filename = "/CsvDownload/" + data;
  $('#download_csv').attr("href", filename);
  $('#download_csv')[0].click();
}

function fill_table(data) {

  console.log("here");

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
    dataToSend = JSON.stringify(request_data);
    $.ajax({
      url : "/EditUser",
      type: "put",
      data: dataToSend,
      success: function(res)
      {
        var jsonRes = JSON.parse(res);
        alert("Edited user " + jsonRes["Username"]);
        window.location.href = "/Account"
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
    dataToSend = JSON.stringify(request_data);
    $.ajax({
      url : "/ChangePassword",
      type: "put",
      data: dataToSend,
      success: function(res)
      {
        var jsonRes = JSON.parse(res);
        alert("Edited user " + jsonRes["Username"]);
        window.location.href = "/Account"
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
    var num1 = parseFloat(formData[4].value);
    var num2 = parseFloat(formData[5].value);
    if(isNaN(num1) || isNaN(num2)) {
      alert("Must enter a number value");
    }
    else if(num1 < 0 || num1 > 30) {
      alert("Number must be between 0 and 30");
    }
    else if(num2 < 0 || num2 > 30) {
      alert("Number must be between 0 and 30");
    }
    else if(num1 > num2) {
      alert("The second number must be greater than the first");
    }
    else {
      dataToSend = {
        "num1":num1,
        "num2":num2
      };
      $.ajax({
        url: '/SearchByBili',
        type: 'get',
        async: false,
        data:dataToSend,
        success: function(data) {
          //console.log(data['filename']);
          download_csv(data['filename']);
        }
      });

    }

  }

  function search_by_name(formData) {
    var firstName = formData[2].value;
    var lastName = formData[3].value;
    var name = firstName + " " + lastName;
    dataToSend = {
      "name":name
    };
    if(firstName == "" || lastName == "") {
      alert("Must enter a value for the names");
    }
    else {
      $.ajax({
        url: "/SearchByName",
        type: "get",
        async: false,
        data:dataToSend,
        success: function(data) {
          //fill_table(data);
          download_csv(data['filename']);
        }
      });
    }
  }

  function search_by_id(formData) {
    var idNum = formData[1].value;
    dataToSend = {
      "idNum":idNum
    };
    if(idNum == "") {
      alert("Must enter a value for the ID");
    }
    else {
      $.ajax({
        url: "/SearchById",
        type: "get",
        async: false,
        data:dataToSend,
        success: function(data) {
          //fill_table(data);
          download_csv(data['filename']);
        }
      });
    }

  }

  function search_by_ethnicity(formData) {
    var form_size = formData.length;

    if(form_size <= 6) {
      alert("Pick at least one ethnicity");
    }
    else {
      var ethnicities = [];
      var ethnicity = "";
      for(i = 6; i < form_size; i++) {
        ethnicity = formData[i].name;
        ethnicities.push(ethnicity);
      }
      dataToSend = {
        "ethnicities":ethnicities
      };
      $.ajax({
        url: "/SearchByEthnicity",
        type: "get",
        async: false,
        data:dataToSend,
        success: function(data) {
          download_csv(data['filename']);
        }
      });


    }

  }

  function search_by_date(formData) {

    var date1 = formData[formData.length-2].value;
    var date2 = formData[formData.length-1].value;
    dataToSend = {
      "date1":date1,
      "date2":date2
    };
    if(date1 == "" || date2 == "") {
      alert("You must enter a date for both");
    }
    else {
      $.ajax({
          url: "/SearchByDate",
          type: "get",
          async: false,
          data:dataToSend,
          success: function(data) {
            download_csv(data['filename']);
          }
        });
    }
  }

  function login() {
    var username = $("#username").val();
    var password = $("#password").val();
    data = {
      "username":username,
      "password":password
    };
    var dataToSend = JSON.stringify(data);
    $.ajax({
        url:'/',
        type:'post',
        data:dataToSend,
        success:function(res) {
          var jsonRes = JSON.parse(res);
          if(jsonRes['LoggedIn'] === "True") {
            alert("Logged in");
            window.location.href = "/Index"
          }
          else
            alert("Incorrect credentials")
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
    var dr_username = formData[1].value;
    dataToSend = {
        "dr_username":dr_username
    };
    $.ajax({
      url: "/SearchByUser",
      type: "get",
      async: false,
      data: dataToSend,
      success: function(res) {
        var jsonRes = JSON.parse(res);
        admin_create_table(jsonRes,0);
      }
    });

  }

  function admin_search_by_name(formData) {
    var dr_name = formData[2].value;
    dataToSend = {"name":dr_name};
    $.ajax({
      url: "/SearchByName",
      type: "get",
      data: dataToSend,
      success: function(res) {
        var jsonRes = JSON.parse(res);
        if(jsonRes.length > 1) {
          admin_create_table(jsonRes,1);
        }
        else {
          admin_create_table(jsonRes,0);
        }
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
    data = {
        "username":username,
        "password":password,
        "name":name,
        "hospital":hospital,
        "hospitalAddress":hospitalAddress,
        "city":city
    };
    var dataToSend = JSON.stringify(data);
    $.ajax({
      url:'/CreateUser',
      type:'post',
      data:dataToSend,
      success:function(res) {
        var jsonRes = JSON.parse(res);
        if(jsonRes['CreatedUser'] === "True") {
            alert("User Created");
        }
      }
    });
  }

  function admin_create_table(data, is_array) {
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
                                        window.location.href = "/Info";
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
    var username = $("#username").val();
    var password = $("#password").val();
    data = {
      "username":username,
      "password":password
    };
    var dataToSend = JSON.stringify(data);
    $.ajax({
        url:'/',
        type:'post',
        data:dataToSend,
        success:function(res) {
          var jsonRes = JSON.parse(res);
          if(jsonRes['LoggedIn'] === "True") {
            alert("Logged in");
            window.location.href = "/Index"
          }
          else
            alert("Incorrect credentials")
        }
      });
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
    dataToSend = JSON.stringify(request_data);
    $.ajax({
      url : "/EditUser",
      type: "put",
      data: dataToSend,
      success: function(res)
      {
        var jsonRes = JSON.parse(res);
        alert("Edited user " + jsonRes["Username"]);
        window.location.href = "/Info";
      },
    });

  }

  function admin_delete_user() { //probably needs some kind of extra authorization
    $.ajax({
      url : "/DeleteUser",
      type: "delete",
      success: function(res)
      {
        var jsonRes = JSON.parse(res);
        alert("Deleted user " + jsonRes["Username"]);
        window.location.href = "/Index";
      },
    });
  }