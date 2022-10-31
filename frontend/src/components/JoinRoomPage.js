import React, { Component } from 'react'
import {TextField, Button, Grid, Typography} from "@material-ui/core";
import {Link} from 'react-router-dom';
import { NavRouter } from './NavRouter';


export class JoinRoomPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      room_code: "",
      error: "",
    };
    this.handle_text = this.handle_text.bind(this);
    this.handle_room = this.handle_room.bind(this);
  }

  handle_text = (e) => {
    this.setState({
      room_code: e.target.value
    });
  }

  handle_room = () => {
    console.log(this.state.room_code);
    const request_options =
      {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          room_code: this.state.room_code
        })
      };

    let join_room = async () => {
      const response = await fetch('/api/join-room/' , request_options);
      if (response.ok) {
        this.props.navigate('/room/' + this.state.room_code);
      }
      else {
        this.setState({
          error: 'Room not found'
        });
      }
    };
    join_room();

};

  render() {
    return (
      <Grid container spacing = {1} alignItems = 'center'>
        <Grid item xs = {12} align= 'center'>
          <Typography variant = 'h4' component = 'h4'>
            Join a Room!
          </Typography>
        </Grid>

        <Grid item xs = {12} align = 'center'>
          <TextField error = {this.state.error} label = 'Room Code' placeholder = 'Enter a Room Code' 
                      value = {this.state.room_code}  helperText = {this.state.error} variant = 'outlined' onChange = {this.handle_text}>
            
          </TextField>
        </Grid>

        <Grid item xs = {12} align = 'center'>
          <Button variant = 'contained' color = 'primary' onClick = {this.handle_room}>
            Enter the Room!!
          </Button>
        </Grid>

        <Grid item xs = {12} align = 'center'>
          <Button variant = 'contained' color = 'secondary' to = '/' component = {Link}>
            Go Back!
          </Button>
        </Grid>
      </Grid>
    )
  }
}

export default NavRouter(JoinRoomPage);