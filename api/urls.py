from django.urls import path
from . import views
urlpatterns = [
    path('',views.RoomView.as_view(), name = 'rooms'),
    path('create-room/',views.CreateRoomView.as_view(), name = 'create_room'),
    path('get-room/',views.GetRoom.as_view(), name = 'get_room'),
    path('join-room/', views.JoinRoomView.as_view(), name = 'join-room'),
    path('user-room/', views.UserRoom.as_view(), name = 'user_room'),
    path('leave-room/',views.LeaveRoom.as_view(), name = 'leave_room'),
    path('update-room/', views.UpdateRoom.as_view(), name = 'update_room'),
    
]