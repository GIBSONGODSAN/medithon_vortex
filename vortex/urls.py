from django.urls import path
from .views import DirStructAPIView, DummyAPIView, SignInAPIView, SignUpAPIView, ShareFileAPIView, ScheduleAPIView
urlpatterns = [
    path('ipchecking/', DummyAPIView.as_view(), name='ipcheckin'),
    path('signin/', SignInAPIView.as_view(), name='signin'),
    path('signup/', SignUpAPIView.as_view(), name='signup'),
    path('dirstructure/', DirStructAPIView.as_view(), name='dirstructure'),
    path('zipfile/', ShareFileAPIView.as_view(), name='zipfile'),
    path('schedule/', ScheduleAPIView.as_view(), name='schedule'),
] 