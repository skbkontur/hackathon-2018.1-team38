'use strict';

class Level {

  constructor(cities, roads, transports, time, goalPackage, graph) {
    this.cities = cities;
    this.roads = roads;
    this.transports = transports;
    this.time = time;
    this.goalPackage = goalPackage;
    this.graph = graph;
    this.currentTime = 0;
    this.currentGoal = 0;
    this.citiesPacks = {};
    this.packageNames = ["мертвый клоун", "шнурки от сапог", "маринованный кактус", "биткойн ферма", "допинг для олимпийской сборной","игрушечный паровозик","плюшки с сахаром","матрица для ноутбука","подозрительный шкаф" ]
  }





  populatePackages(delta) {
      this.cities.forEach(

        function(city) {
          this.citiesPacks[city.name] = this.citiesPacks[city.name] || 0;
          this.citiesPacks[city.name] += (city.packsPerLoop*delta);


          if(this.citiesPacks[city.name] > 1) {
            let numberOfNewPackage = (~~(this.citiesPacks[city.name]));

            for(var i=0; i<numberOfNewPackage; i++) {
              let cityIndex = (~~(Math.random() * this.cities.length));
              if(this.cities[cityIndex] == city) {
                cityIndex = (cityIndex + 1) % this.cities.length;
              }

             city.addPackage(new Package(city, this.cities[cityIndex], this.packageNames[(~~(Math.random() * this.packageNames.length))]));
            }

            this.citiesPacks[city.name] = 0;
          }          
          
      }

      ,this);
  }


  simulate(delta, timeMultplier) {
      delta = delta * timeMultplier;
    this.populatePackages(delta);	   

     for(var i=0; i<this.transports.length; i++) {
        let car = this.transports[i];

        if(car.currentCity == null && car.route.length > 0) {
          car.position += car.velocity * delta;
        } else {
          car.idle(car.currentCity);
        }
     }

     this.currentTime += delta;

     if(this.currentTime > this.time) {
        this.currentTime = this.time;
        return 'fail';
     }

     if(this.currentGoal >= this.goalPackage) {
      return 'win';
     }

    //move car
    let car = this.transports[0]; 
    if(car.currentCity == null){
      //car.position += car.velocity*delta;
      

      let sum = 0;
      for(let i=0; i<car.route.length; i++) {
        sum += car.route[i].distance;
      }

      if(car.position >= sum){
        car.finishDelivery();
      }
    }

     return 'running';
  }

  init(codeForExecution) {
    var cities = this.cities;
    var car = this.transports[0];
    var goto = function(cityName){
		  let city = this.cities.find(x=>x.name == cityName);
      car.goto(city);
    }
    var context = {
      car: car,
      cities: cities
    };
    try{
      this.evalInContext(codeForExecution, context, car, cities);
    }
    catch (err){
      var $errorModal = $("#error-modal");
      $errorModal.find(".modal-body").append("<p>" + err.message + "</p> <p>Для просмотра подробностей откройте консоль разработчика</p>");
      $errorModal.modal("show");
    }
  }

  evalInContext(js, context, car, cities) {
    //# Return the results of the in-line anonymous function we .call with the passed context
    return function(car, cities) { return eval(js); }.call(context, car, cities);
  }
}