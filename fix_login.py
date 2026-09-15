with open('frontend/src/pages/auth/Login.tsx', 'r') as f:
    lines = f.readlines()

# find the line with <PublicFooter />
for i, line in enumerate(lines):
    if '<PublicFooter />' in line:
        idx = i
        break

# we want 2 closing divs before PublicFooter and 1 after it
# based on the standard split screen layout:
# <div wrapper>
#   <PublicHeader />
#   <div flex-1 flex-col md:flex-row>
#     <div left-col> ... </div>
#     <div right-col> ... </div>
#   </div>
#   <PublicFooter />
# </div>

# wait, left-col and right-col were inside flex-1. 
# so before PublicFooter, we just close the right-col and the flex-1. That's 2 divs. 
# Actually, let's just count all <div and </div in the file up to idx.
content = "".join(lines)
