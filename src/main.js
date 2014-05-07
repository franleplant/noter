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


app.controller('AppCtrl', function ($scope, $routeParams, $http, $sce, $interval) {


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



app.controller('NavigatorCtrl', function ($scope, $location) {

	$scope.url = $scope.url || "https://gist.github.com/franleplant/386ddfa1b663cd2f9f19#file-n2-md";

	this.parse_and_redirect = function () {
		var url = $scope.url;
		var r = /(?:http(?:s{0,1}))(?:\:\/\/)(?:gist\.github\.com\/)([^\/]*)(?:\/)([^#]*)(?:#)(.*)$/;
		var parsed = url.match(r);


		var user = parsed[1];
		var gist_id = parsed[2];
		var raw_file_name = parsed[3];
		var file_name = raw_file_name.match(/(?:file-)([^-]*)(-md)$/)[1] + '.md';

		console.log(user, gist_id, file_name);


		var l = '/gist/' + gist_id + '/' + file_name;
		console.log(l);
		$location.path(l);

	}

});


//dynamic rendering math http://docs.mathjax.org/en/latest/typeset.html




