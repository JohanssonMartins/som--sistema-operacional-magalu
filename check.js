const http = require('http');

http.get('http://localhost:3333/api/checklists', Object.assign({}, { timeout: 2000 }), (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const items = JSON.parse(data);
            const assignedItems = items.filter(i => i.assigneeId === '3' || i.assigneeId2 === '3' || i.assigneeId3 === '3');
            console.log('Items assigned to 3:', assignedItems.length);
            if (assignedItems.length > 0) {
                console.log('Item completed status:', assignedItems[0].completed);
                console.log('Item unidade:', assignedItems[0].unidade);
                console.log('Item assigneeId:', typeof assignedItems[0].assigneeId, assignedItems[0].assigneeId);
            }
        } catch (e) { console.error('Error parsing checklists', e); }
    });
}).on('error', e => console.error('fetch check error', e));

http.get('http://localhost:3333/api/users', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const users = JSON.parse(data);
            const user3 = users.find(u => u.id === '3');
            console.log('User 3 exists:', !!user3, user3 ? user3.unidade : '');
        } catch (e) { console.error('Error parsing users', e); }
    });
}).on('error', e => console.error('fetch user error', e));
