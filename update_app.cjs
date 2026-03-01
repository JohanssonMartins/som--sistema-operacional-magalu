const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace checklist permissions
content = content.replace(/currentUser\.role === 'ADMIN' \|\| currentUser\.role === 'GERENTE_DO_CD'/g,
    `currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DO_CD'`);

// Replace base checklist visibility permissions
content = content.replace(/currentUser\.role === 'ADMIN' \|\| currentUser\.role === 'GERENTE_DIVISIONAL' \|\| currentUser\.role === 'GERENTE_DO_CD'/g,
    `currentUser.role === 'ADMIN' || currentUser.role === 'AUDITOR' || currentUser.role === 'GERENTE_DIVISIONAL' || currentUser.role === 'GERENTE_DO_CD'`);

// Add AUDITOR role to select options
const optionToFind = '<option value="ADMIN">Administrador (Acesso Total)</option>';
const optionToAdd = optionToFind + '\n                      <option value="AUDITOR">Auditor (Validação de Check-list)</option>';
content = content.replace(optionToFind, optionToAdd);

// Format user role label in table
const roleColorFind = "user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' :";
const roleColorAdd = roleColorFind + "\n                              user.role === 'AUDITOR' ? 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' :";
content = content.replace(roleColorFind, roleColorAdd);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated successfully.');
