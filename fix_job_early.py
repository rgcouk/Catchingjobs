import re

with open('frontend/src/pages/jobs/JobDetailsPage.tsx', 'r') as f:
    content = f.read()

# Fix the loading state
loading_pattern = r'(if\s*\(loading\)\s*\{\s*return\s*\(\s*)<div\s+className="font-sans w-full min-h-\[60vh\] bg-white text-\[#090D14\] flex flex-col items-center justify-center p-8 space-y-4">(.*?)</div>\s*\);\s*\}'

loading_replacement = r'''\1<div className="font-sans w-full min-h-screen bg-white text-[#090D14] flex flex-col justify-between">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">\2</div>
      <PublicFooter />
    </div>
  );
}'''
content = re.sub(loading_pattern, loading_replacement, content, flags=re.DOTALL)

# Fix the error state
error_pattern = r'(if\s*\(error \|\| !job\)\s*\{\s*return\s*\(\s*)<div\s+className="font-sans w-full min-h-\[70vh\] bg-white text-\[#090D14\] flex flex-col items-center justify-center p-8 text-center space-y-6">(.*?)</div>\s*\);\s*\}'

error_replacement = r'''\1<div className="font-sans w-full min-h-screen bg-white text-[#090D14] flex flex-col justify-between">
      <PublicHeader />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">\2</div>
      <PublicFooter />
    </div>
  );
}'''
content = re.sub(error_pattern, error_replacement, content, flags=re.DOTALL)

with open('frontend/src/pages/jobs/JobDetailsPage.tsx', 'w') as f:
    f.write(content)

print("Early returns fixed")
