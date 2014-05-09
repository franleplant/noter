//Todo, refactor this the angular way
function highlight_code() {
	$('.highlight').each(function(i, e) {hljs.highlightBlock(e)});
}

var app = angular.module('noter', ['ngRoute', 'ngSanitize']);




app.config( function($routeProvider, $provide) {


    $routeProvider.
		when('/', {
			templateUrl: 'src/home.tpl.html',
		controller: 'HomeCtrl'
		}).
		when('/gist/:gist_id/:file_name', {
			templateUrl: 'src/read.tpl.html',
		controller: 'AppCtrl'
		}).
		otherwise({
		redirectTo: '/'
		});
});


app.controller('HomeCtrl', function () {

});


app.controller('AppCtrl', function ($scope, $routeParams, $http, $sce, $interval, Gist) {






	function markdown_to_noter() {
		MathJax.Hub.Queue(["Typeset",MathJax.Hub, document.getElementById('content')]);
        highlight_code();	
	}

	//TODO: Put this in the resolve of the route
	function get_gist_file_content() {
		return $http.get('https://api.github.com/gists/' + $routeParams.gist_id);
	}


	function markdown_to_html(markdown) {
		return $http.post('https://api.github.com/markdown/raw', markdown, { headers: {	"Content-Type": 'text/plain'}} );
	}

	$interval(markdown_to_noter, 1000/30);



	get_gist_file_content()
		.then(function (r) {
			return r.data.files[$routeParams.file_name].content;
		})
		.then(function (file_content) {
			return markdown_to_html(file_content);
		})
		.then(function (r) {
			var markdown = r.data;
			$scope.markdown = $sce.trustAsHtml(markdown);
		});


});



app.controller('NavigatorCtrl', function ($scope, $location, Gist) {


	$scope.url = $scope.url || "https://gist.github.com/franleplant/386ddfa1b663cd2f9f19";

	function id_from_url (url) {

		var r = /(?:http(?:s{0,1}))(?:\:\/\/)(?:gist\.github\.com\/)([^\/]*)(?:\/)(.*)$/;
		var parsed = url.match(r);	

		var gist_id = parsed[2];

		return gist_id;
	}

	var gist_id;

	this.go = function () {
		gist_id = id_from_url($scope.url);
		Gist(gist_id).then(function (gist) {
			$scope.files = gist.files();
		});
	}

	this.go_to_file = function(file) {
		$location.path('/gist/' + gist_id + '/' + file.filename);
	}
	// this.parse_and_redirect = function () {
	// // 	var url = $scope.url;
	// 	var r = /(?:http(?:s{0,1}))(?:\:\/\/)(?:gist\.github\.com\/)([^\/]*)(?:\/)([^#]*)(?:#)(.*)$/;
	// 	var parsed = url.match(r);


	// 	var user = parsed[1];
	// 	var gist_id = parsed[2];
	// 	var raw_file_name = parsed[3];
	// 	var file_name = raw_file_name.match(/(?:file-)([^md]*)(?:-)(.{1,3})$/)[1] + '.md';

	// 	console.log(user, gist_id, file_name);


	// 	var l = '/gist/' + gist_id + '/' + file_name;
	// 	console.log(l);
	// 	$location.path(l);

	// }

});


app.service('Gist', function ($http) {

	var Gist = function (data) {
		var that = {};


		that.raw = function () {
			return data;
		};

		that.files = function () {
			return data.files;
		}

		that.file = function (name) {
			return data.files[name];
		}

		return that;
	};


	return function get_gist(id) {
		return $http.get('https://api.github.com/gists/' + id)
			.then(function (response) {
				return Gist(response.data);
			});
	}

});

//dynamic rendering math http://docs.mathjax.org/en/latest/typeset.html




