from django.forms import modelformset_factory
from django.shortcuts import render, redirect
from .credits import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from requests import Request, post
from .util import modify_user_tokens, is_spotify_authenticated, spotify_call, play_song, pause_song, skip_song
from  api.models import Room
from spotify_part.models import Vote

# Create your views here.

class URLAuth(APIView):
    def get(self, request, format = None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params = {
            'scope':scopes,
            'response_type':'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url 
        # this returns a url that we can go to authenticate the app

        return Response({'url':url}, status = status.HTTP_200_OK)



def spotify_request(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')


    response = post('https://accounts.spotify.com/api/token', data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'grant_type':'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
    }).json() # this will send the request along with the code gotten after authorization and get the response

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
            request.session.create()

    modify_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:home')

class IsUserAuthenticated(APIView):
    def get(self, request, format = None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status' : is_authenticated}, status = status.HTTP_200_OK)



class CurrentSong(APIView):
    def get(self, request, format = None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(room_code = room_code)[0]
        if room:
             room_host = room.room_host
        else:
            return Response({'msg':'room not found'}, status.HTTP_404_NOT_FOUND)
        url = "player/currently-playing"
        response = spotify_call(session_id = room_host, endpoint = url)

        if 'error' in response or 'item' not in response:
            return Response({'msg':'no song playing'}, status = status.HTTP_204_NO_CONTENT)
        
        item = response.get('item') #this gets the dicntionary within response that has info about the song being played
        song_title = item.get('name')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url') # need to read through the json to see how the tree brranches out
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_credit = '' 

        for no, artist in enumerate(item.get('artists')): #there might be more than one artists on a track, so we enumerate the dictionaries wihtin the artist dictionary to get the names of the artists in a single string
            if no > 0:
                artist_credit += ","
            name = artist.get('name')
            artist_credit += name

        votes_so_far = len(Vote.objects.filter(room = room, song_id = song_id))

        song = {
            'title': song_title,
            'artists': artist_credit,
            'duration': duration,
            'current_time_played': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes_so_far,
            'votes_to_skip': room.votes_to_skip,
            'song_id': song_id
        } #this has the custom information about the song being currently played

        self.update_song(room, song_id)

        return Response({'song': song}, status = status.HTTP_200_OK)
    
    def update_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields = ['current_song'])
            Vote.objects.filter(room = room).delete() #this deletes the votes for the previous songs that was playing




class PauseSong(APIView):
    def put(self, response, format = None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(room_code = room_code)[0]

        if self.request.session.session_key == room.room_host or room.can_guest_pause: # this checks if the the current person accessing this pause control is eiether the host or if the can guest pause option has been set to true
                pause_song(room.room_host)
                return Response({'msg':'paused song'}, status = status.HTTP_200_OK)

        return Response({'msg':'not allowed to pause song'}, status = status.HTTP_403_FORBIDDEN)

class PlaySong(APIView):
    def put(self, response, format = None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(room_code = room_code)[0]

        if self.request.session.session_key == room.room_host or room.can_guest_pause: # this checks if the the current person accessing this pause control is eiether the host or if the can guest pause option has been set to true
                play_song(room.room_host)
                return Response({'msg':'played song'}, status = status.HTTP_200_OK)

        return Response({'msg':'not allowed to pause song'}, status = status.HTTP_403_FORBIDDEN)


class SkipSong(APIView):
    def post(self, response, format = None):
        room_code = self.request.session['room_code']
        room = Room.objects.filter(room_code = room_code)[0]
        votes_so_far = Vote.objects.filter(room = room, song_id = room.current_song)
        votes_to_skip = room.votes_to_skip

        if self.request.session.session_key == room.room_host or len(votes_so_far) + 1 >= votes_to_skip:
             #the host can jus skip the song, and doesnt need to get the reuqired no of skips votes to skip the song. 
             # if the user other than the host is about to skip and the votes including thhier vote equals the required votes, it needs to skip the song
            votes_so_far.delete()
            skip_song(room.room_host)

        else:
            vote = Vote(user = self.request.session.session_key, room = room, song_id = room.current_song)
            vote.save()

        return Response({'msg':'no song to skip'}, status.HTTP_204_NO_CONTENT)