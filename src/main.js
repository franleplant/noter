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






//dynamic rendering math http://docs.mathjax.org/en/latest/typeset.html




