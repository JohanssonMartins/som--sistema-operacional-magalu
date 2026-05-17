import re

for file in ['src/pages/BaseChecklist.tsx', 'src/components/AutoauditoriaRow.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        c = f.read()

    c = re.sub(
        r'lowercase capitalize\">\{(item\.pilar|item\.bloco)\}</td>',
        r'capitalize\">{String(\1 || \'\').toLowerCase()}</td>',
        c
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(c)
print('Fixed lowercase capitalize issue!')
