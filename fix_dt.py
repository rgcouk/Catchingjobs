import re

with open('src/components/data-table.tsx', 'r') as f:
    content = f.read()

header_checkbox = """
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : (table.getIsSomePageRowsSelected() ? "indeterminate" : false)}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
"""

cell_checkbox = """
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
"""

content = re.sub(r'    header: \(\{ table \}\) => \([\s\S]*?    \),', header_checkbox.strip(), content)
content = re.sub(r'    cell: \(\{ row \}\) => \([\s\S]*?    \),', cell_checkbox.strip(), content)

with open('src/components/data-table.tsx', 'w') as f:
    f.write(content)
