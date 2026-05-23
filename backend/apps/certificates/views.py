import io
from django.http import HttpResponse, Http404
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Certificate
from apps.users.models import UserProfile
from apps.courses.models import CourseEnrollment
from django.contrib.auth.models import User
from django.utils import timezone
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors

class CertificateListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            user_profile = request.user.profile
        except Exception:
            user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
            
        enrollments = CourseEnrollment.objects.filter(user=user_profile)
        data = []
        
        for e in enrollments:
            # Check if this course is 100% complete
            is_completed = e.progress_percent >= 100.0
            cert = None
            
            if is_completed:
                # Get or create certificate for completed course
                cert = Certificate.objects.filter(user=user_profile, course_title=e.roadmap.title).first()
                if not cert:
                    cert = Certificate.objects.create(
                        user=user_profile,
                        course_title=e.roadmap.title
                    )
            
            if cert:
                data.append({
                    "id": cert.id,
                    "course_title": cert.course_title,
                    "certificate_id": str(cert.certificate_id),
                    "issued_at": cert.issued_at,
                    "pdf_url": f"http://localhost:8000/api/certificates/{cert.id}/download/",
                    "progress_percent": e.progress_percent,
                    "is_locked": False
                })
            else:
                data.append({
                    "id": e.id,
                    "course_title": e.roadmap.title,
                    "certificate_id": "",
                    "issued_at": "",
                    "pdf_url": "",
                    "progress_percent": e.progress_percent,
                    "is_locked": True
                })
                
        return Response(data)

class CertificateDownloadView(views.APIView):
    permission_classes = [permissions.AllowAny] # Allow direct link downloads

    def get(self, request, pk):
        try:
            cert = Certificate.objects.get(id=pk)
        except (Certificate.DoesNotExist, ValueError):
            return HttpResponse("Certificate not found.", status=404)

        # Enforce course progress check
        enrollment = CourseEnrollment.objects.filter(
            user=cert.user,
            roadmap__title=cert.course_title
        ).first()

        if not enrollment or enrollment.progress_percent < 100.0:
            return HttpResponse("Forbidden: This certificate is locked. You must complete the course to 100% to download this certificate.", status=403)

        # Safely extract username
        username = ""
        if cert.user and cert.user.user:
            username = f"{cert.user.user.first_name} {cert.user.user.last_name}".strip()
            if not username:
                username = cert.user.user.username
        if not username:
            username = "Learner"
            
        return self.generate_pdf(username, cert.course_title, str(cert.certificate_id)[:8].upper())

    def generate_pdf(self, name, course_title, cert_code):
        # Create bytes buffer
        buffer = io.BytesIO()

        # Create landscape canvas (792 x 612 pixels)
        p = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter) # 792, 612

        # 1. Background shading
        p.setFillColor(colors.HexColor("#F4F6FA"))
        p.rect(0, 0, width, height, fill=True, stroke=False)

        # 2. Main Premium Navy Card Border
        p.setStrokeColor(colors.HexColor("#1B2A4A"))
        p.setLineWidth(15)
        p.rect(20, 20, width - 40, height - 40)

        # 3. Inner Gold Accent Border
        p.setStrokeColor(colors.HexColor("#F5C518"))
        p.setLineWidth(2)
        p.rect(35, 35, width - 70, height - 70)

        # 4. Navy top corner band
        p.setFillColor(colors.HexColor("#1B2A4A"))
        path = p.beginPath()
        path.moveTo(20, height - 100)
        path.lineTo(100, height - 20)
        path.lineTo(20, height - 20)
        path.close()
        p.drawPath(path, fill=True, stroke=False)

        # 5. Red bottom accent line (Brand Accent)
        p.setFillColor(colors.HexColor("#8B0000"))
        p.rect(20, 20, width - 40, 10, fill=True, stroke=False)

        # 6. Header Logo Title
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 24)
        p.drawCentredString(width / 2.0, height - 100, "SKILLFORGE.AI")

        # 7. Sub-title
        p.setFont("Helvetica", 14)
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.drawCentredString(width / 2.0, height - 130, "TRANSFORMING CONTENT INTO COMPETENCE")

        # 8. Certificate Core text
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 32)
        p.drawCentredString(width / 2.0, height - 210, "CERTIFICATE OF COMPLETION")

        p.setFont("Helvetica-Oblique", 16)
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.drawCentredString(width / 2.0, height - 260, "This is proudly presented to")

        # 9. Learner Name (Gold Text / Bold Accent)
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 28)
        p.drawCentredString(width / 2.0, height - 310, name.upper())

        # Underline name with gold line
        p.setStrokeColor(colors.HexColor("#F5C518"))
        p.setLineWidth(3)
        p.line(width/2.0 - 150, height - 325, width/2.0 + 150, height - 325)

        # 10. Course Detail
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.setFont("Helvetica", 14)
        p.drawCentredString(width / 2.0, height - 365, "for successfully completing all curriculum requirements for")

        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 18)
        p.drawCentredString(width / 2.0, height - 405, f'"{course_title}"')

        # 11. Signatures & IDs at bottom
        # Left signature
        p.setStrokeColor(colors.HexColor("#1B2A4A"))
        p.setLineWidth(1)
        p.line(100, 110, 280, 110)
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 12)
        p.drawString(100, 90, "SkillForge Director")
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.drawString(100, 75, "AI Learning Orchestrator Director")

        # Right date and credentials
        p.line(width - 280, 110, width - 100, 110)
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.setFont("Helvetica-Bold", 12)
        p.drawString(width - 280, 90, f"ID: {cert_code}")
        p.setFont("Helvetica", 10)
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.drawString(width - 280, 75, "Verification Hash Signature")

        # Small planet orbit logo in bottom right
        p.setStrokeColor(colors.HexColor("#F5C518"))
        p.setLineWidth(1.5)
        p.circle(width - 80, 70, 15, stroke=True, fill=False)
        p.setFillColor(colors.HexColor("#1B2A4A"))
        p.circle(width - 85, 75, 4, fill=True, stroke=False)
        p.circle(width - 73, 63, 2, fill=True, stroke=False)

        # 12. Footer brand
        p.setFillColor(colors.HexColor("#6B7A99"))
        p.setFont("Helvetica-Bold", 8)
        p.drawCentredString(width / 2.0, 45, "SkillForge.Ai Learning Platform")

        p.showPage()
        p.save()

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificate-{cert_code}.pdf"'
        response.write(pdf)
        return response

class CertificateVerifyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, cert_id):
        try:
            c = Certificate.objects.get(certificate_id=cert_id)
            
            # Verify course progress is complete
            enrollment = CourseEnrollment.objects.filter(
                user=c.user,
                roadmap__title=c.course_title
            ).first()
            
            if not enrollment or enrollment.progress_percent < 100.0:
                return Response({"valid": False, "error": "This certificate is locked because the course is incomplete."}, status=403)

            return Response({
                "valid": True,
                "learner_name": f"{c.user.user.first_name} {c.user.user.last_name}".strip() or c.user.user.username,
                "course_title": c.course_title,
                "issued_at": c.issued_at,
                "verification_id": str(c.certificate_id)
            })
        except Exception:
            return Response({"valid": False, "error": "Certificate not found or invalid format"}, status=404)
