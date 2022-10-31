from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
from django.conf import settings as django_settings

# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'room_code'

    def get(self, request, format = None):
        room_code = request.GET.get(self.lookup_url_kwarg)
        if room_code != None:
            room = Room.objects.filter(room_code = room_code)
            if len(room) > 0:
                data_room = RoomSerializer(room[0]).data
        
                data_room['is_host'] = self.request.session.session_key == room[0].room_host
                return Response(data_room, status = status.HTTP_200_OK )
            return Response({'No Room Found':'Invalid Room Code'}, status = status.HTTP_404_NOT_FOUND)

        return Response({'Incomplete request':'Room code parameter not found in the request'}, status = status.HTTP_400_BAD_REQUEST)

class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer


    def post(self,request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data = request.data)

        if serializer.is_valid():
            can_guest_pause = serializer.data.get('can_guest_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key #we are using the session key to identify the host 
            queryset = Room.objects.filter(room_host = host) #this checks if there is already a room with the host i.e, session key
            if queryset.exists(): #if the host already exist, the room will be updated
                room = queryset[0]
                room.can_guest_pause = can_guest_pause
                room.votes_to_skip = votes_to_skip
                self.request.session['room_code'] = room.room_code
                self.request.session.save()

#                  After saving new session, it must be re-assigned to a session cookie
                #session_cookie_name = django_settings.SESSION_COOKIE_NAME
                #self.request.cookies[session_cookie_name] = self.request.session.session_key

                room.save(update_fields = ['can_guest_pause', 'votes_to_skip'])
            else: #this creates a room with the deserialized data posted
                room = Room(room_host = host, can_guest_pause = can_guest_pause, votes_to_skip = votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.room_code
                self.request.session.save()

                #session_cookie_name = django_settings.SESSION_COOKIE_NAME
                #self.request.cookies[session_cookie_name] = self.request.session.session_key
            self.request.session['room_code'] = room.room_code
            self.request.session.save()
            #session_cookie_name = django_settings.SESSION_COOKIE_NAME
            #self.request.cookies[session_cookie_name] = self.request.session.session_key
            return Response({'data': RoomSerializer(room).data, 'var': self.request.session['room_code']} , status = status.HTTP_201_CREATED)
        return Response({'Bad Request':'Invalid data'}, status = status.HTTP_404_NOT_FOUND)

class JoinRoomView(APIView):

    lookup_url_kwarg = 'room_code'
    def post(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

    
        room_code = request.data.get(self.lookup_url_kwarg)
        if room_code != None:
            result = Room.objects.filter(room_code = room_code)
            if len(result) >0:
                room = result[0]
                self.request.session['room_code'] = room_code #this view lets the user join a given room with the room code passed in
                return Response({'message':'Joined the Room'}, status = status.HTTP_200_OK)
            return Response({'Bad Request':'No room found with the given code'}, status = status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request':'Invalid post due to room code inputed'}, status = status.HTTP_400_BAD_REQUEST)


class UserRoom(APIView):
    
    def get(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'room_code': self.request.session['room_code']
        }
        return JsonResponse(data, status = status.HTTP_200_OK) #this is going to be used in the homepage to get the room_code that is stored in the session

class LeaveRoom(APIView):
    def post(self, request, format = None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(room_host = host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
            return Response({'Message':'Success'}, status = status.HTTP_200_OK)
        return Response({'Invalid request':'there was no room_code in the session'}, status = status.HTTP_400_BAD_REQUEST)


class UpdateRoom(APIView):
    
    serializer_class = UpdateRoomSerializer
    def patch(self, request, format = None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data = request.data)
        if serializer.is_valid():
            can_guest_pause = serializer.data.get('can_guest_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            room_code = serializer.data.get('room_code')
            
            queryset = Room.objects.filter(room_code = room_code)
            if not queryset.exists():
                return Response({'Message':"Room not found or doesnt exist"}, status = status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_id = self.request.session.session_key
            if room.room_host != user_id:
                return Response({'Message':"Not permitted to update room"}, status = status.HTTP_403_FORBIDDEN) #this checks if you are the host of the room, adn if you are not the host, you are not allowed to make changes to the room
            room.can_guest_pause = can_guest_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields = ['can_guest_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status = status.HTTP_200_OK)
        return Response({'Bad request':"Invalid data"}, status = status.HTTP_400_BAD_REQUEST)
