import React, {Component} from 'react';
import {Grid, Typography, Card, IconButton, LinearProgress} from "@material-ui/core";
import {PlayArrow, SkipNext, Pause} from "@material-ui/icons";


export default function MusicPlayer(props) {

    const song_progress = (props.current_time_played / props.duration ) * 100 // this shows how much of the song has been played as of rn. then it is used in the linearprogress component which works as a progress bar


    let pause_song = () => {
        const request_options = {
            method : 'PUT',
            headers:{'Content-Type': 'application/json'},
        };
        fetch('/spotify/pause', request_options);
    };

    let play_song = () => {
        const request_options = {
            method : 'PUT',
            headers:{'Content-Type': 'application/json'},
        };
        fetch('/spotify/play', request_options);
    };

    let skip_song = () => {
        const request_options = {
            method : 'POST',
            headers:{'Content-Type': 'application/json'},
        };
        fetch('/spotify/skip', request_options);
    };



    return (
        <Card>
            <Grid container alignItems = 'center'>
                <Grid item align = 'center' xs = {4}>
                    <img src = {props.image_url} height = "100%" width = "100%"></img>
                </Grid>

                <Grid item align = 'center' xs = {8}>
                    <Typography component = 'h4' variant = 'h4'>
                        {props.title}
                    </Typography>

                    <Typography variant = 'subtitle1' color = "textSecondary">
                        {props.artists}
                    </Typography>

                    <div>
                        <IconButton onClick = {() => {
                            props.is_playing ? pause_song() : play_song();
                        }}>
                            {props.is_playing 
                            ?  <Pause> </Pause> 
                            : <PlayArrow></PlayArrow>}
                        </IconButton>

                        <IconButton onClick = {() => {
                            skip_song();
                        }
                        }>
                            <SkipNext>
                            </SkipNext> {" "} {props.votes_so_far} / {" "}
                            {props.votes_to_skip}
                        </IconButton>

                    </div>


                </Grid>

            </Grid>
            <LinearProgress variant = 'determinate' value = {song_progress}> 

            </LinearProgress>


        </Card>
    );
    
};