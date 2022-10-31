import React, { Component } from 'react'
import { NavRouter } from './NavRouter';
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from "@material-ui/core/FormControl";
import { Link } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Collapse} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";


export class CreateRoomPage extends Component {
  static default_props = {
    votes_to_skip: 2,
    can_guest_pause: true,
    to_update: false,
    room_code: null,
    update_call: () => {}
  }


  constructor(props) {
    super(props);
    this.state = {
      can_guest_pause: this.props.can_guest_pause,
      votes_to_skip: this.props.votes_to_skip,
      success_msg: "",
      error_msg: "",
    }; //these are gonna be the default states
    this.handle_room_button = this.handle_room_button.bind(this);
    this.update_room_button = this.update_room_button.bind(this);
    this.handle_guest_pause_change = this.handle_guest_pause_change.bind(this);
    this.handle_Votes_Change = this.handle_Votes_Change.bind(this);
  }

  handle_Votes_Change = (e) => {
    this.setState({
      votes_to_skip: e.target.value,
    });
  }

  handle_guest_pause_change = (e) => {
    this.setState({
      can_guest_pause: e.target.value === 'true' ? true : false,
    })
  }

  handle_room_button = () => {
    const request_options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        can_guest_pause: this.state.can_guest_pause
      })
    }
    let post_room = async () => {
      let response = await fetch('/api/create-room/', request_options);
      let data = await response.json();
      console.log('data:', data.data);
      console.log('var',data.var);
      this.props.navigate('/room/' + data.data.room_code);
    }
    post_room();
  }

  update_room_button = () => {
    const request_options = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        can_guest_pause: this.state.can_guest_pause,
        room_code: this.props.room_code,
      })
    }
    let patch_room = async () => {
      let response = await fetch('/api/update-room/', request_options);
      if (response.ok) {
        this.setState({
          success_msg: 'Room updated successfully'
        });
      } else {
        this.setState({
          error_msg: 'error while updating room'
        });
      }; 
      let data = await response.json();
      
      console.log('data:',data);
      // this.props.navigate('/room/' + data.room_code);
      this.props.update_call();
      
    }
    patch_room();
    

  };

  create_button = () => {
    return (
      <Grid container spacing = {1}>
        <Grid item xs={12} align='center'>
          <Button color="primary" variant='contained' onClick={this.handle_room_button}>Create a room</Button>
        </Grid>
        <Grid item xs={12} align='center'>
          <Button color="secondary" variant='contained' to="/" component={Link}>Back</Button>
        </Grid>
      </Grid>
      
    );
  };

  update_button = () => {
    return (
      <Grid item xs={12} align='center'>
          <Button color="primary" variant='contained' onClick={this.update_room_button}>Update the Room</Button>
        </Grid>
    ) 
  };

  render() {
    const title = this.props.to_update ? 'Update the Room': 'Create a Room';

    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align='center'>
          <Collapse in = {this.state.error_msg != "" || this.state.success_msg != ""}>
            {/* this collapse component will show the success message if the success_msg state has any message in it, which will happen after the update happens successfully. if there is an error, it will show that as well */}
            {this.state.success_msg != "" 
              ? <Alert severity='success'> {this.state.success_msg} </Alert> 
              : <Alert severity='error'> {this.state.error_msg}</Alert>}
          </Collapse> 
        </Grid>
        <Grid item xs={12} align='center'>
          <Typography component='h4' variant='h4'>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12} align='center'>
          <FormControl component='fieldset'>
            <FormHelperText>
              <div align='center'>
                Guest Control

              </div>
            </FormHelperText>
            <RadioGroup row defaultValue={""+this.state.can_guest_pause} onChange={this.handle_guest_pause_change}>
              <FormControlLabel value='true'
                control={<Radio color='primary'></Radio>}
                label='Play/Pause'
                labelPlacement='bottom'>
              </FormControlLabel>

              <FormControlLabel value='false'
                control={<Radio color='secondary'></Radio>}
                label='No Control'
                labelPlacement='bottom'>

              </FormControlLabel>
            </RadioGroup>
          </FormControl>

        </Grid>
        <Grid item xs={12} align='center'>
          <FormControl>
            <TextField required={true}
              type='number'
              onChange={this.handle_Votes_Change}
              defaultValue={this.state.votes_to_skip}
              inputProps={{
                min: 1,
                style: { textAlign: 'center' }
              }}
            >
            </TextField>
            <FormHelperText>
              <div align='center'>
                Votes Required to Skip song
              </div>
            </FormHelperText>

          </FormControl>
        </Grid>
       {this.props.to_update ? this.update_button() : this.create_button() }
      </Grid>
    )
  }
}

export default NavRouter(CreateRoomPage);