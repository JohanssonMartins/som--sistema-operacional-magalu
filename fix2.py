import re
with open('src/pages/BaseChecklist.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

replacement = """                const formatTitleCase = (text: string) => {
                    if (!text) return '';
                    return text.trim().toLowerCase().split(' ').map((word, i) => {
                        if (i > 0 && ['e', 'de', 'da', 'do', 'das', 'dos', 'em', 'com', 'por', 'para', 'a', 'o', 'as', 'os'].includes(word)) return word;
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    }).join(' ');
                };
                
                jsonData.forEach((row, index) => {
                    const pilar = formatTitleCase(String(getVal(row, 'Pilar') || ''));
                    const bloco = formatTitleCase(String(getVal(row, 'Bloco') || ''));"""

c = re.sub(
    r'\s+jsonData\.forEach\(\(row, index\) => \{\s+const pilar = String\(getVal\(row, \'Pilar\'\) \|\| \'\'\)\.trim\(\);\s+const bloco = String\(getVal\(row, \'Bloco\'\) \|\| \'\'\)\.trim\(\);',
    '\n' + replacement,
    c
)

with open('src/pages/BaseChecklist.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Done Import!')
