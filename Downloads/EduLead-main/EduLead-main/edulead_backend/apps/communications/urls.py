from django.urls import path
from .views import CommunicationsPlaceholderView

urlpatterns = [
    path('', CommunicationsPlaceholderView.as_view(), name='communications'),
]
