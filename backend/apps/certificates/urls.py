from django.urls import path
from .views import (
    CertificateListView,
    CertificateDownloadView,
    CertificateVerifyView,
)

urlpatterns = [
    path('', CertificateListView.as_view(), name='cert_list'),
    path('<int:pk>/download/', CertificateDownloadView.as_view(), name='cert_download'),
    path('verify/<str:cert_id>/', CertificateVerifyView.as_view(), name='cert_verify'),
]
