from django.urls import path
from .views import StudentDataExportView, StudentDataDeleteView

urlpatterns = [
    path('<uuid:pk>/export/', StudentDataExportView.as_view(), name='student-export'),
    path('<uuid:pk>/delete/', StudentDataDeleteView.as_view(), name='student-delete'),
]
