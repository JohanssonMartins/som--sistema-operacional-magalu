async function test() {
    const res = await fetch('http://localhost:3333/api/checklists');
    const items = await res.json();
    const assigned = items.find(i => i.assigneeId === '3');
    console.log(JSON.stringify(assigned, null, 2));
}
test();
