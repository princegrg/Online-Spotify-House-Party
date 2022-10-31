import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from '@material-ui/core';
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";



export default function Room(props) {

    let [votes_to_skip, setVotes] = useState(2);
    let [can_guest_pause, setPause] = useState(false);
    let [is_host, setHost] = useState(false);
    let [update_settings, set_settings] = useState(false);
    let [is_spot_auth, set_spot_auth] = useState(false);
    let [song, set_song] = useState("");

    const { room_code } = useParams();

    const navigate = useNavigate();

    let get_room_details = async () => {
        let response = await fetch('/api/get-room/' + '?room_code=' + room_code);
        if (!response.ok) {
            props.leaveRoomCall();
            navigate('/');
        };
        let data_room = await response.json();
        console.log('data', data_room);
        
        setVotes(data_room.votes_to_skip);
        setPause(data_room.can_guest_pause);
        setHost(data_room.is_host);
        console.log('terterero');
        console.log(is_host);
        console.log(votes_to_skip);
        

    }

    useEffect(() => {
        get_room_details();
        ask_auth_spotify();
    }, [is_host, is_spot_auth])

    // useEffect(() => {
        // ask_auth_spotify();
    // }, [is_spot_auth])

    useEffect(() => {
        console.log(votes_to_skip);
        console.log('i ll do 10 puoshups');
        console.log(is_host);
        if (is_host === true) {
            console.log('hihihihihiu');
            check_spot_auth_state();
            console.log('meromeromero');
        };
    }, [is_host, is_spot_auth])

    useEffect(() => {
        const interval = setInterval(() => {
            get_current_song();
            console.log(song);
          }, 1000); //this gets current song details every 1000ms

          return ()=> clearInterval(interval);

    }, [song]);

    let show_update_button = () => {
        return (
            <Grid item xs={12} align='center'>
                <Button variant='contained' color='primary' onClick={() => set_settings(true)} >
                    Update settings
                </Button>
            </Grid>
        );
    };

    let open_settings = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <CreateRoomPage to_update={true} votes_to_skip={votes_to_skip} can_guest_pause={can_guest_pause} room_code={room_code} update_call={get_room_details}>

                    </CreateRoomPage>
                </Grid>

                <Grid item xs={12} align='center'>
                    <Button variant='contained' color='secondary' onClick={() => set_settings(false)}>
                        Close this shizzam
                    </Button>
                </Grid>

            </Grid>
        );
    };

    let leave_room = async () => {
        const request_options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };
        let response = await fetch('/api/leave-room/', request_options);
        let data_room = await response.json();
        console.log('data', data_room);
        props.leaveRoomCall();
        navigate('/');
    }

    // if({update_settings}) {
    //     return {open_settings()};
    //  };

    let ask_auth_spotify = async () => {
        console.log('first check');
        let response = await fetch('/spotify/is-user-authenticated');
        let data_bool = await response.json();
        set_spot_auth(data_bool.status);
    };

    let check_spot_auth_state = async () => {

        if (is_spot_auth == false) { //if the user has not been authenticated before, we get the url to get it authenticated
            let response = await fetch('/spotify/get-auth-url');
            let data = await response.json();
            window.location.replace(data.url); //this takes us to the url to get authenticated
        };
        if (is_spot_auth == true) {
            console.log('true ho hai')
        };

    }

    let get_current_song = () => {
        fetch('/spotify/current-song').then((response) => {
            if (!response.ok) {
                return {};
            }else {
                return response.json();
            }
        }).then((data) => set_song(data.song));
    };


    // let authenticate_spotify =() => {
    //     fetch('/spotify/is-user-authenticated').then((data)=> {
    //     set_spot_auth(data.status);
    //     console.log("yo sts ho hai",data.status);
    //     return response.json();
    //     });
    //     if (is_spot_auth == false) { //if the user has not been authenticated before, we get the url to get it authenticated
    //         fetch('/spotify/get-auth-url').then((data) => {
    //             window.location.replace(data.url);
    //             return response.json();
    //         })
    //      //this takes us to the url to get authenticated
    //     };
    //     if (is_spot_auth == true) {
    //         console.log('true ho hai')
    //     };
    // };

    return (
        <div>
        {update_settings ? open_settings() : //this checks if the update_settings state is true to open the update page
        <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Typography variant='h3' component='h4'>
                    Room Code : {room_code}
                </Typography>
            </Grid>
            <p>{song.title}</p>

            <MusicPlayer {...song}>

            </MusicPlayer>

            <Grid item xs={12} align='center'>
                <Typography variant='h5' component='h4'>
                    Votes: {votes_to_skip}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant='h5' component='h4'>
                    Can Guest Pause: {can_guest_pause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant='h5' component='h4'>
                    Host: {is_host.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Button variant='contained' color='secondary' to='/' component={Link} onClick = {leave_room}>
                    Leave Room!
                </Button>
            </Grid>
            {is_host ? show_update_button() : null}
        </Grid>}
        </div>
    )
}
;
