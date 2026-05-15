import re
with open('src/pages/BaseChecklist.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(
    r'<td className="px-4 py-4 font-medium text-gray-900 dark:text-zinc-200 whitespace-nowrap">\{item\.pilar\}</td>\s*<td className="px-4 py-4 whitespace-nowrap">\{item\.bloco\}</td>',
    '<td className="px-4 py-4 font-medium text-[13px] text-gray-800 dark:text-zinc-200 whitespace-nowrap lowercase capitalize">{item.pilar}</td>\n                                        <td className="px-4 py-4 font-medium text-[13px] text-gray-600 dark:text-zinc-300 whitespace-nowrap lowercase capitalize">{item.bloco}</td>',
    c
)

with open('src/pages/BaseChecklist.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Done UI!')
