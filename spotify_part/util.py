from .models import TokenSpotify
from django.utils import timezone
from datetime import timedelta
from requests import Request, post, put, get
from .credits import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET
import logging

base_url = "https://api.spotify.com/v1/me/"

def user_tokens(session_id):
    user_tokens = TokenSpotify.objects.filter(user = session_id)
    if user_tokens.exists():
        return user_tokens[0]
    else:
        return None

def modify_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    #this function checks whether we already have a user token based on a host id, and updated it with the new access tokens and if there is no such user token in the database, then it creates one
    tokens = user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds = expires_in)

    if tokens:
        tokens.access_token = access_token
        tokens.token_type = token_type
        tokens.expires_in = expires_in
        tokens.refresh_token = refresh_token
        tokens.save(update_fields = ['access_token', 'token_type','expires_in','refresh_token'])
    else:
        tokens = TokenSpotify(user = session_id, access_token = access_token, token_type = token_type, expires_in = expires_in, refresh_token = refresh_token)
        tokens.save()


def is_spotify_authenticated(session_id):
    tokens = user_tokens(session_id)
    if tokens:
        expiration = tokens.expires_in
        if expiration <= timezone.now():
            refresh_spotify_tokens(session_id)
        return True #this refreshed the refresh_token if it is expired and returns true as the token is there for the given session_id
    return False


def refresh_spotify_tokens(session_id):
    refresh_token = user_tokens(session_id).refresh_token

    response = post('https://accounts.spotify.com/api/token', data = {
        'grant_type':'refresh_token',
        'refresh_token':refresh_token,
        'client_id': CLIENT_ID,
        'client_secret':CLIENT_SECRET
    }).json()


    new_access_token = response.get('access_token')
    token_type = response.get('token_type')
    new_expires_in = response.get('expires_in')
    #refreshed_token = response.get('refresh_token')

    modify_user_tokens(session_id, new_access_token, token_type, new_expires_in)


def spotify_call(session_id, endpoint, post_ = False, put_= False):
    tokens = user_tokens(session_id)
    header = {'Content-Type': 'application/json', 'Authorization': "Bearer " + tokens.access_token}

    if post_:
        post(base_url + endpoint, headers = header)
    if put_:
        put(base_url + endpoint, headers = header)
    
    else:
        response = get(base_url + endpoint, {}, headers =  header)

    try:
        return response.json()
    except:
        return {'error':'request invalid'}


def play_song(session_id):
    return spotify_call(session_id, "player/play", put_ = True)


def pause_song(session_id):
    return spotify_call(session_id, "player/pause", put_ = True)


def skip_song(session_id):
    return spotify_call(session_id, 'player/next', post_ = True)
    