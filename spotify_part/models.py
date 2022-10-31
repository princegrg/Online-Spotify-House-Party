from unittest.util import _MAX_LENGTH
from django.db import models
from api.models import Room 

# Create your models here.

class TokenSpotify(models.Model): 
    user = models.CharField(max_length = 50, unique = True)

    #these are the keys that we get from the spotify_call which we store in this model
    access_token = models.CharField(max_length = 150)
    token_type = models.CharField(max_length = 50)
    refresh_token = models.CharField(max_length = 150, null = True)
    expires_in = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add = True)
    
class Vote(models.Model):

    user = models.CharField(max_length = 50, unique = False)
    created_at = models.DateTimeField(auto_now_add = True)
    song_id = models.CharField(max_length = 20)
    room = models.ForeignKey(Room, on_delete = models.CASCADE)
    
