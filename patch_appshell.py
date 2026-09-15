with open('frontend/src/components/layout/AppShell.tsx', 'r') as f:
    content = f.read()

if 'PublicHeader' not in content:
    content = content.replace("import { SiteHeader } from '@/components/layout/site-header';", "import { SiteHeader } from '@/components/layout/site-header';\nimport PublicHeader from './PublicHeader';\nimport PublicFooter from './PublicFooter';")
    
    # replace the return statement
    old_return = '<SidebarProvider defaultOpen={true} className="h-[100dvh] overflow-hidden w-full">'
    new_return = '<div className="flex flex-col h-[100dvh]">\n      <PublicHeader />\n      <SidebarProvider defaultOpen={true} className="flex-1 overflow-hidden w-full">'
    content = content.replace(old_return, new_return)
    
    content = content.replace('</SidebarProvider>', '</SidebarProvider>\n      <PublicFooter />\n      </div>')
    
    with open('frontend/src/components/layout/AppShell.tsx', 'w') as f:
        f.write(content)
