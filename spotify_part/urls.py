from django.urls import path
from . import views

app_name =  'spotify_part'

urlpatterns = [
    path('get-auth-url', views.URLAuth.as_view()),
    path('redirect',views.spotify_request),
    path('is-user-authenticated', views.IsUserAuthenticated.as_view()),
    path('current-song',views.CurrentSong.as_view()),
    path('pause', views.PauseSong.as_view()),
    path('play', views.PlaySong.as_view()),
    path('skip', views.SkipSong.as_view())
]