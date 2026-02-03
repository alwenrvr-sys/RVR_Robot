from django.urls import path
from api.view.Camera_view import trigger_camera, disconnect_camera

urlpatterns = [
    path("camera/trigger/", trigger_camera),
    path("camera/disconnect/", disconnect_camera),
]
