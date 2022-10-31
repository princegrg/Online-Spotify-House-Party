import React, { useState, useEffect } from "react";
import CreateRoomPage from './CreateRoomPage';
import JoinRoomPage from './JoinRoomPage';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Room from './Room';
import { Grid, Button, ButtonGroup, Typography, responsiveFontSizes } from '@material-ui/core';


export default function HomePage(props) {

  let [room_code, set_room_code] = useState(0);

  let show_home_page = () => {
    if (room_code !== 0) {
      return (<Navigate to={'/room/'+ room_code} replace={true}></Navigate>);
    }
    else {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12} align='center'>
            <Typography variant='h2' compact='h2'>
              Time for a House Party!
            </Typography>
          </Grid>

          <Grid item xs={12} align='center'>
            <ButtonGroup variant='contained' color='primary'>
              <Button color='primary' to='/join' component={Link}>
                Join a Room!
              </Button>

              <Button color='secondary' to='/create' component={Link}>
                Create a Room!
              </Button>

            </ButtonGroup>
          </Grid>
        </Grid>
      )
    
  };
};
    
  // let fetch_code = async () => {
  //   const response = await fetch('/api/user-room');
  //   const data = await response.json();
  //   console.log(data.room_code);
  //   set_room_code(data.room_code);
  //   console.log('bhao');
     
  //     // this.props.navigate('/room/' + this.state.room_code);
  //   };
    
  let fetch_code = async () => {
    const response = await fetch('/api/user-room');
    const data = await response.json();
    console.log('hi');
    //console.log(data.room_code);
    
    console.log('bhao');
    set_room_code(data.room_code);
  }



  useEffect( () => {

    // console.log(data.room_code);
    fetch_code();
}, [room_code]);

  // useEffect( () => {
  //   set_room_code(fetch_code());

  // }, [room_code]);

//   useEffect(() => {
//   console.log(room_code);
//   if (room_code){
//   return (<Redirect to={'/room/'+ room_code} replace={true}></Redirect>);
// }
// }, [room_code]);

  let clearRoomCode = ()=> {
    set_room_code(null);
  };
 
  return (
      <Router>
        <Routes>
          {/* <Route exact path="/" element={this.show_home_page()} >  </Route> */}
          <Route exact path="/" element={show_home_page()} />
          {/* <Route exact path="/" element={this.state.room_code ? (<Navigate replace to={`/room/${this.state.room_code}`} />) : this.show_home_page()} /> */}
          <Route path="/create" element={<CreateRoomPage></CreateRoomPage>}></Route>
          <Route path="/join" element={<JoinRoomPage></JoinRoomPage>}></Route>
          <Route path="/room/:room_code" element={<Room leaveRoomCall = {clearRoomCode}></Room>}></Route>


        </Routes>
      </Router>

    );
  };


// import React, { Component } from 'react'
// import CreateRoomPage from './CreateRoomPage';
// import JoinRoomPage from './JoinRoomPage';
// import { BrowserRouter as Router, Routes, Route, Link, Redirect } from 'react-router-dom';
// import Room from './Room';
// import { Grid, Button, ButtonGroup, Typography } from '@material-ui/core';

// export class HomePage extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       room_code: null,
//     };
//   };

//   show_home_page = () => {
//     if (this.state.room_code) {
//       return (<Redirect to={'/room/'+this.state.room_code} replace={true}></Redirect>);
//     }
//     else {
//       return (
//         <Grid container spacing={3}>
//           <Grid item xs={12} align='center'>
//             <Typography variant='h2' compact='h2'>
//               Time for a House Party!
//             </Typography>
//           </Grid>

//           <Grid item xs={12} align='center'>
//             <ButtonGroup variant='contained' color='primary'>
//               <Button color='primary' to='/join' component={Link}>
//                 Join a Room!
//               </Button>

//               <Button color='secondary' to='/create' component={Link}>
//                 Create a Room!
//               </Button>
//             </ButtonGroup>
//           </Grid>
//         </Grid>
//       )
    
//   };
// }

//   async componentDidMount() {
//     console.log('do sth');
    
//     let fetch_code = async () => {
//       const response = await fetch('/api/user-room');
//       const data = await response.json();
//       console.log(data.room_code);
//       return data;
     
//       // this.props.navigate('/room/' + this.state.room_code);
//     };
    
//     fetch_code();
//     this.setState({
//       room_code: data.room_code,
//     });
//   }

//   clearRoomCode() {
//     this.setState({
//       room_code: null
//     })
//   };
 
//   render() {
//     return (
//       <Router>
//         <Routes>
//           {/* <Route exact path="/" element={this.show_home_page()} >  </Route> */}
//           <Route exact path="/" element={this.show_home_page()} />
//           {/* <Route exact path="/" element={this.state.room_code ? (<Navigate replace to={`/room/${this.state.room_code}`} />) : this.show_home_page()} /> */}
//           <Route path="/create" element={<CreateRoomPage></CreateRoomPage>}></Route>
//           <Route path="/join" element={<JoinRoomPage></JoinRoomPage>}></Route>
//           <Route path="/room/:room_code" element={<Room leaveRoomCall = {this.clearRoomCode}></Room>}></Route>


//         </Routes>
//       </Router>

//     )
//   }
// }

// export default HomePage