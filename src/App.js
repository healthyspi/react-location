import React from 'react';
import styled from 'styled-components';
import loading from './loading.gif'

/*global google*/

const Wrap = styled.div`
    width: 100%;
`; 

const Question = styled.div`  
    width: 600px;
    height: 165px;
    background-color: #f7f7f7;
    margin: 0 auto;
    color: #FF5722;

    .title{
        padding-top: 50px;
        margin: 0 auto;
        width: 193px;
    }
    .button{
        width: 100px;
        height: 40px;
        background-color: #FF5722;
        line-height: 40px;
        margin: 0 auto;
        text-align: center;
        border-radius: 5px;
        color: white;
        margin-top: 5px;
        cursor: pointer;
    }
`;


const Result = styled.div`
    .loadingBox{
        margin: 0 auto;
        height: 600px;
        width: 600px;
        background-color: #e8e8e8;
        text-align: center;
        line-height: 600px;
        color: #FF5722;
    }
    .resultText{
        display: none;
        height: 60px;
        width: 600px;
        margin: 0 auto;
        background-color: #00BCD4;
        color: white;
        text-align: center;
        line-height: 60px;
    }
    .mapCanvas{
        width: 600px;
        height: 400px;
        margin: 0 auto;
    }
    .directions{
        width: 600px;
        height: 400px;
        margin: 0 auto;
    }
`; 

class CinemaLocation extends React.Component{
    constructor(props){
        super(props)

        let cinemaList = [
            {cinema: "臺北信義威秀影城", lat:"25.035687", lng:"121.567394"},
            {cinema: "大直美麗華影城", lat:"25.083484", lng:"121.557528"},
            {cinema: "梅花影城", lat:"25.024801", lng:"121.549275"}
        ];


        this.state={
            isLoading:false,
            currentPosition:{},
            distanceDate:[],
            closerCinema:{},
            peopleLocation:{},
            cinemaList
        }

        this.getCurrentLocation = this.getCurrentLocation.bind(this);	
        this.initializeMapAndCalculateRoute = this.initializeMapAndCalculateRoute.bind(this);
        this.calculateRoute = this.calculateRoute.bind(this);
        this.distancebetweenCinema = this.distancebetweenCinema.bind(this);
        this.compareDistance = this.compareDistance.bind(this);
        
    }

    componentDidMount(){
        const script = document.createElement("script");

        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDaTbOUGyVsc3r4GLZfxS3YjwX7uPuwhFA";
        script.async = true;

        document.body.appendChild(script);
    }

    //你目前位置
    getCurrentLocation() {
      console.log("=======>拿到位置");

      this.setState({
          isLoading:true
      });
      let self = this;	
      navigator.geolocation.getCurrentPosition(function(position) {	
              console.log("position",position);
        let updatedLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
              } 
            
              self.setState({
                  peopleLocation: updatedLocation
              });
        self.distancebetweenCinema(updatedLocation.lat, updatedLocation.lng);		
      })
    }

    //計算和3個影城的直線距離
    distancebetweenCinema(lat, lng){
        console.log("=======>計算距離");
        let distanceResult=[];

        this.state.cinemaList.forEach(((item,index)=>{
            let latitude1 = lat;
            let longitude1 = lng;
            let desLat = item.lat;
            let deslng = item.lng;
            let latitude2;

            let R = 6371;
            let deltaLatitude = (desLat-latitude1) * Math.PI / 180;
    
            let deltaLongitude = (deslng-longitude1) * Math.PI / 180;
            latitude1 = (latitude1)* Math.PI / 180;
            latitude2 = desLat * Math.PI / 180;
            let a = Math.sin(deltaLatitude/2) * Math.sin(deltaLatitude/2) +Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLongitude/2) * Math.sin(deltaLongitude/2);
    
            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            let d = R * c;
            distanceResult.push(d);
            console.log("distanceResult",distanceResult)
        }));

        this.setState({
            distanceDate : distanceResult
        },()=>{
            this.compareDistance();
        });
    }
    // 比較哪個結果最近
    compareDistance(){
        console.log("=======>比較");
        let result = this.state.distanceDate;
       
        if(result[0]>result[1]){
            if(result[1]>result[2]){
               this.setState({
                 closerCinema: this.state.cinemaList[2]
               },()=>{
                   this.initializeMapAndCalculateRoute();
               });
            }else{
                this.setState({
                    closerCinema: this.state.cinemaList[1]
                },()=>{
                    this.initializeMapAndCalculateRoute();
                });
            }
        }else{
            if(result[0]>result[2]){
                this.setState({
                  closerCinema: this.state.cinemaList[2]
                },()=>{
                    this.initializeMapAndCalculateRoute();
                });
            }else{
                 this.setState({
                     closerCinema: this.state.cinemaList[0]
                },()=>{
                    this.initializeMapAndCalculateRoute();
                });
            }
        }
    }

    //將people的位址給google
    initializeMapAndCalculateRoute(){
        console.log("=======>地圖");
        let peopleLocation = this.state.peopleLocation;

        let currentPosition = new google.maps.LatLng(peopleLocation.lat, peopleLocation.lng);
         
        this.setState({
            currentPosition: currentPosition,
            isLoading: false
        },()=>{
            this.calculateRoute();
            document.getElementsByClassName("resultText")[0].style.display="block";
        });

    }
    //得到交通圖
    calculateRoute() {
        console.log("=======>拿到交通");
        let destinationLatitude = this.state.closerCinema.lat;     //目的地的經緯度
        let destinationLongitude = this.state.closerCinema.lng;   //目的地的經緯度
        let directionsService = new google.maps.DirectionsService();
        let directionsDisplay = new google.maps.DirectionsRenderer();
        
        

        let targetDestination =  new google.maps.LatLng(destinationLatitude, destinationLongitude);
        if (this.state.currentPosition !== '' && targetDestination !== '') {

            let request = {
                origin: this.state.currentPosition,
                destination: targetDestination,
                provideRouteAlternatives: true,
                optimizeWaypoints: true,
                travelMode: google.maps.DirectionsTravelMode["DRIVING"]  //路線規劃的交通方式，Driving為開車。
            };

            directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setPanel(document.getElementsByClassName("directions")[0]);
                    directionsDisplay.setDirections(response);
                }
                else {
                   
                }
            });

            let map = new google.maps.Map(document.getElementsByClassName('mapCanvas')[0], {
                zoom: 20, //顯示地圖的大
                center: this.state.currentPosition, //顯示出來的地圖中心點，會是目前的位置
                mapTypeId: google.maps.MapTypeId.ROADMAP
             });
            directionsDisplay.setMap(map);
        }
        else {
           
        }
    }


    render(){
        console.log(this.state);
        return(
                <Wrap>
                    <Question>
                        <div className="title">想知道離你最近的影城嗎？</div>
                        <div className="button" onClick={this.getCurrentLocation}>Click Me!</div>
                    </Question>
                   <Result>
                       {this.state.isLoading?
                         <div className="loadingBox">
                            loading...<img src={loading} style={{width: "20px"}}/>
                        </div>
                        :
                        <div>
                            <div className="resultText">離你最近的影城是：{this.state.closerCinema.cinema}</div>
                            <div className="mapCanvas"></div>
                            <div className="directions"></div>
                        </div>
                        }
                    </Result>
                </Wrap>
        )
    }
}

export default CinemaLocation;
