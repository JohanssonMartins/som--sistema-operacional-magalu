async function test() {
    try {
        const res = await fetch('http://localhost:3333/api/autoauditoria/history/994');
        const data = await res.json();
        console.log("History for 994:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
test();
