var res


$.ajax({
	type: 'GET',
	url: '/get_search_params/37.77493/-122.419415',
	dataType: 'json',
	success: function(response) {
		console.log((response))
		var res = JSON.parse(response)
		var name = res.businesses[0].name
		var coord = res.businesses[0].coordinate
		var address = res.buniesses[0].location.display_address
		var phone = res.businesses[0].display_phone


	},
	error: function(x,y,z) {
		alert(x.responseText);
	}
});
