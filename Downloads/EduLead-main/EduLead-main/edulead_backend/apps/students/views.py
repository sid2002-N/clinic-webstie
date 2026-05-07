from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.leads.permissions import IsSuperAdmin
from .models import Student
from services.compliance.gdpr import GDPRService


class StudentDataExportView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get(self, request, pk):
        data = GDPRService().export_student_data(str(pk))
        return Response(data)


class StudentDataDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def delete(self, request, pk):
        GDPRService().delete_student_data(str(pk))
        return Response({'detail': 'Student data erased under GDPR right to erasure.'})
