import win32com.client
import os

ppt_path = os.path.abspath(r'C:\Users\ASUS\Desktop\SecureMailScope_SIH_2026_Presentation.pptx')
pdf_path = os.path.abspath(r'C:\Users\ASUS\Desktop\SecureMailScope_SIH_2026_Presentation.pdf')
img_dir = os.path.abspath(r'c:\Users\ASUS\Desktop\26159\presentation_exported_pages')
os.makedirs(img_dir, exist_ok=True)

powerpoint = win32com.client.Dispatch('PowerPoint.Application')
# Open presentation without showing window
prs = powerpoint.Presentations.Open(ppt_path, WithWindow=False)

# Export to PDF (format 32 = ppSaveAsPDF)
prs.SaveAs(pdf_path, 32)
print(f'Exported PDF: {pdf_path}')

# Export each slide to PNG
for i, slide in enumerate(prs.Slides):
    slide_img_path = os.path.join(img_dir, f'slide_{i+1}.png')
    slide.Export(slide_img_path, 'PNG', 1920, 1080)
    print(f'Exported Slide {i+1} to {slide_img_path}')

prs.Close()
powerpoint.Quit()
print('Finished export.')
