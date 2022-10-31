from django.urls import path
from . import views

app_name = 'frontend'

urlpatterns = [
   
    path('', views.index, name = "home"),
    path('join', views.index),
    path('create', views.index),
    path('help', views.index),
    path('room/<str:room_code>',views.index, name = 'room')

]