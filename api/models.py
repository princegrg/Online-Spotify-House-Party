from django.db import models
import random
from django.core.validators import MinLengthValidator

def code_generator():
    length = 4
    code = ""
    keep_generating = True
    while keep_generating:
        
        for x in range(length):
            code += str(random.randint(0,9))
        keep_generating = False
    if Room.objects.filter(room_code = code).count() > 0:
        code = ""
        keep_generating = True
    return code


# Create your models here.

class Room(models.Model):
    room_code = models.CharField(max_length=5, default = code_generator, unique = True, validators=[MinLengthValidator(2)]) # every room code has to be unique, and there has to be a room code to create a room
    room_host = models.CharField(max_length = 50, unique= True) # there can only be one host per room
    can_guest_pause = models.BooleanField(null = False, default = False) #this boolean field specifies where the guests in the room can pause the song being played
    votes_to_skip = models.IntegerField(null = False, default = 1) #this tells how many votes are required to skip a song
    created_at = models.DateTimeField(auto_now_add = True) #this shows the time the room was created
    current_song = models.CharField(max_length = 50, null = True) 



