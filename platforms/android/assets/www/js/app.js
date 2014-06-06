var baseURL = "https://optimalprint:New-Site@elandersukwave.sourcelogistic.net";
var scanHandler = function(success, error){

	scanner.startScanning(success, error);

/*	console.log('scanHandler', success, error);
	cordova.exec(
		success,
		error,
		"ScanditSDK", 
		"scan",
		[
		"eaynmOGbEeOavEiiwOg+ax0C92kPtLcQMR03B0dBVKo", 
		{
			"beep": true,
			"vibrate": false,
			"1DScanning" : true,
			"2DScanning" : true,
			"ean13AndUpc12": false,
			"ean8": false,
			"upce": false,
			"code128": false,
			"itf": false,
			"qr": false,
			"dataMatrix": false,
			"pdf417": false
		}
		]
		);*/
}



// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'LocalForageModule', 'highcharts-ng'])

.run(function($ionicPlatform) {
	$ionicPlatform.ready(function() {
	// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
	// for form inputs)
	if(window.cordova && window.cordova.plugins.Keyboard) {
		cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
	}
	if(window.StatusBar) {
		StatusBar.styleDefault();
	}
});
})
.config(function($stateProvider, $urlRouterProvider, $localForageProvider) {

  // Configuring local Forage
  $localForageProvider.config({
		  name        : 'wave', // name of the database and prefix for your data
		  storeName   : 'keyvaluepairs', // name of the table
		  description : 'convenience'
		});
  
}).controller('StatusCtrl', function($scope, $http, $localForage){

	$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
	$localForage.getItem('email').then(function(em){
		if(em){
			$('#email').val(em);
			console.log('LocalForageModule', em);
		}
		$localForage.getItem('password').then(function(pa){
			$('#password').val(pa);
			if(em && pa){
				$scope.login(em,pa);
				console.log('LocalForageModule', em, pa);
			}
		});
	});
	$scope.scannedOrder = null;
	$scope.loggedIn = false;
	$scope.loading = false;
	$scope.numbers = null;
	$scope.dates = [];
	$scope.closeOrder = function(){
		$scope.scannedOrder = null;
	};
	$scope.scan = function(){
		scanHandler(
			function(a,b){ 
				$scope.loading = true;

				console.log(a,b);
				var id = a;
					id = id.replace(/\*/gi,'');
					id = id.split('');
					id.pop();
					id = id.join('');

				console.log(id,a, b);
				$http({					
					url: baseURL+'/api/order/by-print-job-id?printJobId='+id, 
					method: 'GET'
				}).then(function(data){      
					console.log(data);
					$scope.scannedOrder = data.data.payload.orderInfo;
					$scope.loading = null;
				}, function(data){
					$scope.scannedOrder = null;
					$scope.loading = null;
				});


			},
			function(a,b){ 

			 }
			);
	};
	$scope.login = function(e,p){ 
		$scope.loading = true;  
		if(!e && !p){
			var e = $('#email').val();
			var p = $('#password').val();
		}

		$http({
			url: baseURL+'/api/login', 
			method: 'POST', 
			data: "email="+e+"&password="+p
		}).then(function(data){
			if(data.data.payload){
				$localForage.setItem('email', e);
				$localForage.setItem('password', p);
				$scope.loggedIn = true;
				$scope.getStatus();
			}
			console.log(data);
		}, function(data){
			$scope.loading = null;
		});   
	};

	$scope.getStatus = function(){
			$http({
					url: baseURL+'/api/production/status', 
					method: 'GET'
				}).then(function(data){      
					$scope.status = data.data.payload;
					$scope.loading = null;
					$scope.dates = $scope.status.data.dates;
					$scope.chartSeries[0].data = $scope.status.data.planned;
					$scope.chartSeries[1].data = $scope.status.data.scanned;


				}, function(data){
					console.log('Error', data);
				});


			$http({
					url: baseURL+'/api/production/numbers-today', 
					method: 'GET'
				}).then(function(data){      
					$scope.numbers = data.data.payload.data;
					$scope.loading = null;
				}, function(data){
					alert('Error! We did not receive any data');
				});
	}


	$scope.chartSeries = [{
		"name": "Orders to finish", "data": [0,2,4,4,11,0,0]
	},{
		"name": "Scanned Orders", "data": [101,103,102,129,130,0,0]
	}];
	$scope.chartConfig =  {
		options: {
			chart: {
				type: 'column',
				height: 200
			},
			plotOptions: {
				series: {
					stacking: 'stacked'
				}
			},

			legend:{
				enabled: false
			}
		},
		xAxis: {
			categories: $scope.dates
		},
		yAxis: {
			endOnTick: false,
			title:{ text: null }
		},
		series: $scope.chartSeries,
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		loading: false,
		size: {}
	};

});